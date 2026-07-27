# AI-02 改善体验：实现流式问答

## 让模型边生成、页面边显示，同时保持安全、可停止、可降级

!!! quote "流式输出改善的是等待体验，不会自动提高回答质量"
    普通模型调用需要等待完整结果生成后才能显示。回答较长时，用户可能面对十几秒的空白页面，不知道系统仍在工作还是已经失败。流式输出把模型生成的内容分成多个小片段，生成一段就向页面发送一段，让用户能够更早看到结果。

    但流式输出也会增加连接管理、错误处理、停止生成和页面渲染的复杂度。本节沿用上一节的“报修描述草稿”场景，将一次性返回改造成流式返回。完成后，AI 服务仍然只是辅助能力，用户依然可以手工填写并完成基础业务。

!!! tip "本节学习目标"
    理解流式响应与普通响应的区别，使用 SSE 建立“模型服务 → 项目后端 → 浏览器”的流式链路，在 Vue 页面中逐段显示内容，并正确处理停止生成、连接中断、超时、重复请求和失败降级。

[返回上一节：大模型 API 调用](01-llm-api.md){ .md-button }
[返回扩展篇导读](index.md){ .md-button }
[进入下一节：构建 RAG 知识库](03-rag-knowledge-base.md){ .md-button .md-button--primary }

---

## 🎯 本节完成后，你要交付

| 成果 | 要求 |
| :--- | :--- |
| 流式业务接口 | 项目后端能够逐段接收模型输出，并以 SSE 转发给页面 |
| 流式页面交互 | 页面能够逐段显示、停止生成、重新生成并保留已有输入 |
| 状态处理 | 明确区分等待、生成中、完成、主动停止和失败 |
| 安全处理 | API Key 仍只保存在后端，输出按纯文本或安全方式渲染 |
| 异常与降级 | 超时、断线、上游错误时给出提示，不阻断原有业务 |
| 测试记录 | 覆盖正常流、空结果、中途失败、重复点击和主动停止 |

!!! warning "先完成普通调用，再实现流式调用"
    如果上一节的一次性调用尚未稳定工作，不要直接进入流式开发。应先确认业务场景、模型配置、提示词和普通错误处理都正确，再只改变“结果怎样传输和显示”。

---

## 一、什么时候值得使用流式输出

### 1. 普通响应与流式响应

**普通响应：**

```text
用户提交
→ 页面等待
→ 模型生成完整结果
→ 后端一次返回全部内容
→ 页面显示
```

**流式响应：**

```text
用户提交
→ 模型生成第 1 段 → 后端转发 → 页面追加
                第 2 段 → 后端转发 → 页面追加
                第 3 段 → 后端转发 → 页面追加
→ 发送完成事件
```

| 对比项 | 普通响应 | 流式响应 |
| :--- | :--- | :--- |
| 首段内容出现时间 | 完整生成后 | 第一段生成后 |
| 用户等待感受 | 容易误以为卡住 | 能看到持续进展 |
| 后端实现 | 相对简单 | 需要维护长连接 |
| 前端实现 | 普通请求即可 | 需要解析数据流 |
| 中途停止 | 通常没有 | 可以设计停止生成 |
| 错误处理 | 返回一个错误响应 | 可能在已有部分内容后失败 |
| 适用内容 | 短分类、短标题、结构化结果 | 问答、长摘要、描述或报告草稿 |

### 2. 不必流式处理的情况

- 结果只有一个标签、分数或很短的标题；
- 后端必须得到完整 JSON 后才能校验；
- 模型输出会直接参与确定性业务计算；
- 页面不能接受不完整内容；
- 所选平台不支持稳定的流式接口；
- 团队当前没有足够时间测试断线和失败场景。

!!! tip "第一版可以保留普通接口"
    普通接口便于调试、自动化测试和降级。课程项目可以同时保留普通生成与流式生成，但页面只开放一个清晰入口，避免用户困惑。

---

## 二、理解 SSE：服务端向浏览器持续发送事件

### 1. 为什么选择 SSE

SSE（Server-Sent Events，服务器发送事件）适合服务器持续向浏览器推送文本事件：

- 基于 HTTP，便于接入现有项目；
- 数据方向主要是服务器到浏览器，符合文本生成场景；
- 协议简单，可以表示内容、完成和错误事件；
- Spring MVC 可以通过 `SseEmitter` 返回；
- 浏览器可以使用 `EventSource` 或 `fetch` 读取。

SSE 不是唯一方案。WebSocket 适合频繁双向通信，但第一次实现文本生成时通常没有必要增加这类复杂度。

### 2. SSE 数据格式

一次事件通常由若干文本行和一个空行组成：

```text
event: delta
data: {"text":"宿舍"}

event: delta
data: {"text":"空调启动后"}

event: done
data: {}

```

本节约定三类事件：

| 事件 | 数据 | 页面处理 |
| :--- | :--- | :--- |
| `delta` | `{"text":"新增片段"}` | 追加到当前结果 |
| `done` | `{}` | 标记生成完成 |
| `error` | `{"message":"用户可理解的提示"}` | 显示错误并结束生成 |

### 3. 为什么页面使用 `fetch`

浏览器原生 `EventSource` 使用方便，但主要面向 GET 请求，不方便提交 JSON 请求体，也不能自由设置所有请求头。

本节需要：

- 使用 POST 提交地点、设备和故障现象；
- 携带项目已有的登录 Token；
- 使用 `AbortController` 停止请求。

因此示例使用 `fetch` 读取响应流。若项目使用 Cookie + Session，也可以根据自己的鉴权方式简化请求头。

---

## 三、设计完整的流式调用链

```text
Vue 报修页面
→ POST /api/ai/repair-draft/stream
→ RepairDraftStreamService
→ StreamingLlmClient
→ 第三方模型流式 API
→ data: 模型片段
→ StreamingLlmClient 解析片段
→ SseEmitter 发送 delta
→ fetch 读取并解析 SSE
→ 页面追加到可编辑文本框
```

这条链路中有两段流：

1. **上游流**：第三方模型服务发送给项目后端；
2. **下游流**：项目后端通过 SSE 发送给浏览器。

项目后端不能只把第三方响应地址交给浏览器，因为这样会暴露密钥和平台细节，也无法统一执行权限、输入校验、日志和错误转换。

### 开始前确认

- [ ] 普通模型调用已经成功；
- [ ] API Key 只存在于后端；
- [ ] 业务输入和输出已经定义；
- [ ] 普通调用的提示词已经通过固定案例验证；
- [ ] 模型不可用时，用户可以手工完成业务；
- [ ] 所选平台明确支持流式输出；
- [ ] 已阅读平台关于流式字段和结束标记的说明。

---

## 四、扩展模型客户端接口

上一节的 `LlmClient` 只返回完整文本：

```java
public interface LlmClient {

    String generateText(String instruction, String userInput);
}
```

可以增加流式方法：

```java
import java.util.concurrent.CompletableFuture;
import java.util.function.Consumer;

public interface StreamingLlmClient extends LlmClient {

    CompletableFuture<Void> streamText(
            String instruction,
            String userInput,
            Consumer<String> onDelta
    );
}
```

其中：

- `instruction`：系统指令；
- `userInput`：本次业务输入；
- `onDelta`：每收到一个有效文本片段就调用一次；
- `CompletableFuture<Void>`：表示整条上游流何时完成或失败，也便于尝试取消。

业务 Service 不需要理解第三方平台的 `choices`、`delta` 或结束标记，只处理项目自己的文本片段。

---

## 五、实现上游模型流的读取

下面代码展示如何在上一节的 `CompatibleLlmClient` 中增加流式方法。示例假设平台使用常见的 OpenAI 兼容流格式：

```text
data: {"choices":[{"delta":{"content":"文本片段"}}]}
data: [DONE]
```

不同平台可能使用其他字段或结束标记，必须以所选平台官方文档为准。

### 1. 增加流式请求和响应类型

```java
private record StreamChatRequest(
        String model,
        List<Message> messages,
        boolean stream
) {
}

private record StreamChatResponse(
        List<StreamChoice> choices
) {
}

private record StreamChoice(
        Delta delta
) {
}

private record Delta(
        String content
) {
}
```

### 2. 增加 `streamText` 实现

```java
import java.io.UncheckedIOException;
import java.net.http.HttpResponse;
import java.util.concurrent.CompletableFuture;
import java.util.function.Consumer;
import java.util.stream.Stream;

@Override
public CompletableFuture<Void> streamText(
        String instruction,
        String userInput,
        Consumer<String> onDelta
) {
    validateConfiguration();
    validateInput(instruction, userInput);

    StreamChatRequest chatRequest = new StreamChatRequest(
            model,
            List.of(
                    new Message("system", instruction.trim()),
                    new Message("user", userInput.trim())
            ),
            true
    );

    String requestBody = serialize(chatRequest);
    HttpRequest request = buildRequest(requestBody);

    return httpClient.sendAsync(
                    request,
                    HttpResponse.BodyHandlers.ofLines()
            )
            .thenAccept(response -> {
                checkStatus(response.statusCode());

                try (Stream<String> lines = response.body()) {
                    lines.forEach(line -> consumeUpstreamLine(line, onDelta));
                }
            });
}
```

上面的 `serialize`、`buildRequest`、`checkStatus`、配置字段和 `Message` 可以复用上一节实现。

### 3. 解析每一行数据

```java
private void consumeUpstreamLine(
        String line,
        Consumer<String> onDelta
) {
    if (line == null || line.isBlank() || !line.startsWith("data:")) {
        return;
    }

    String payload = line.substring("data:".length()).trim();
    if (payload.isBlank() || "[DONE]".equals(payload)) {
        return;
    }

    try {
        StreamChatResponse response =
                objectMapper.readValue(payload, StreamChatResponse.class);

        if (response.choices() == null || response.choices().isEmpty()) {
            return;
        }

        Delta delta = response.choices().get(0).delta();
        if (delta == null || delta.content() == null
                || delta.content().isEmpty()) {
            return;
        }

        onDelta.accept(delta.content());
    } catch (JsonProcessingException e) {
        log.warn("忽略无法解析的模型流片段");
    } catch (UncheckedIOException e) {
        throw e;
    } catch (RuntimeException e) {
        log.warn("处理模型流片段失败: exception={}",
                e.getClass().getSimpleName());
        throw e;
    }
}
```

!!! warning "不要记录完整流片段"
    流片段可能包含用户数据或模型生成的敏感内容。日志通常只记录请求状态、响应时间、片段数量和错误类别，不打印完整输入与输出。

### 4. 不能假设每个片段都是一个完整词语

模型可能按字、词、标点或其他不固定方式返回：

```text
"宿"
"舍空"
"调启动"
"后有异响"
```

因此页面只能按顺序拼接，不能把每个 `delta` 当作完整句子，也不能逐片段解析 Markdown、JSON 或业务字段。

如果最终结果必须是结构化 JSON，通常更适合：

1. 后端先收集完整内容；
2. 完整内容生成后再解析和校验；
3. 校验通过后一次性向业务模块返回。

---

## 六、通过 `SseEmitter` 转发给浏览器

### 1. Service 负责建立流式会话

```java
package com.course.scaffold.module.ai.service;

import com.course.scaffold.common.exception.BusinessException;
import com.course.scaffold.module.ai.client.StreamingLlmClient;
import com.course.scaffold.module.ai.dto.RepairDraftRequest;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class RepairDraftStreamService {

    private static final long STREAM_TIMEOUT_MILLIS = 60_000L;
    private static final int MAX_OUTPUT_LENGTH = 4000;

    private final StreamingLlmClient llmClient;

    public RepairDraftStreamService(StreamingLlmClient llmClient) {
        this.llmClient = llmClient;
    }

    public SseEmitter generate(RepairDraftRequest request) {
        validate(request);

        SseEmitter emitter = new SseEmitter(STREAM_TIMEOUT_MILLIS);
        AtomicBoolean finished = new AtomicBoolean(false);
        AtomicInteger outputLength = new AtomicInteger(0);

        String instruction = """
                你是校园报修描述助手。
                根据用户提供的信息生成客观、简洁的报修描述草稿。
                不得虚构故障原因、维修方案、联系方式或其他信息。
                只输出草稿正文。
                """;

        String userInput = buildUserInput(request);

        CompletableFuture<Void> task = llmClient.streamText(
                instruction,
                userInput,
                delta -> {
                    int length = outputLength.addAndGet(delta.length());
                    if (length > MAX_OUTPUT_LENGTH) {
                        throw new BusinessException(
                                503,
                                "AI 生成内容过长，请重试"
                        );
                    }
                    sendEvent(emitter, "delta", Map.of("text", delta));
                }
        );

        task.whenComplete((unused, throwable) -> {
            if (!finished.compareAndSet(false, true)) {
                return;
            }

            try {
                if (throwable == null) {
                    sendEvent(emitter, "done", Map.of());
                } else {
                    sendEvent(
                            emitter,
                            "error",
                            Map.of("message", toUserMessage(throwable))
                    );
                }
            } catch (UncheckedIOException ignored) {
                // 浏览器可能已经断开，此时不再向下游发送事件。
            } finally {
                emitter.complete();
            }
        });

        emitter.onTimeout(() -> {
            if (finished.compareAndSet(false, true)) {
                task.cancel(true);
                emitter.complete();
            }
        });

        emitter.onError(error -> {
            if (finished.compareAndSet(false, true)) {
                task.cancel(true);
            }
        });

        emitter.onCompletion(() -> {
            if (finished.compareAndSet(false, true)) {
                task.cancel(true);
            }
        });

        return emitter;
    }

    private void sendEvent(
            SseEmitter emitter,
            String eventName,
            Object data
    ) {
        try {
            emitter.send(
                    SseEmitter.event()
                            .name(eventName)
                            .data(data, MediaType.APPLICATION_JSON)
            );
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    private String toUserMessage(Throwable throwable) {
        Throwable cause = unwrap(throwable);
        if (cause instanceof BusinessException businessException) {
            return businessException.getMessage();
        }
        return "AI 服务暂不可用，请继续手工填写";
    }

    private Throwable unwrap(Throwable throwable) {
        Throwable current = throwable;
        while (current.getCause() != null
                && (current instanceof java.util.concurrent.CompletionException
                || current instanceof java.util.concurrent.ExecutionException)) {
            current = current.getCause();
        }
        return current;
    }

    private void validate(RepairDraftRequest request) {
        if (request == null
                || isBlank(request.location())
                || isBlank(request.device())
                || isBlank(request.symptom())) {
            throw new BusinessException("请填写地点、设备和故障现象");
        }
    }

    private String buildUserInput(RepairDraftRequest request) {
        return """
                地点：%s
                设备：%s
                故障现象：%s
                已尝试处理：%s
                """.formatted(
                request.location().trim(),
                request.device().trim(),
                request.symptom().trim(),
                isBlank(request.attemptedAction())
                        ? "无"
                        : request.attemptedAction().trim()
        );
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
```

!!! note "示例需要与上一节输入校验保持一致"
    为突出流式流程，上面只展示了必填校验。实际项目还应复用上一节的字段长度、总长度和权限校验，避免普通接口与流式接口使用两套不同规则。

### 2. Controller 只暴露项目业务接口

```java
package com.course.scaffold.module.ai.controller;

import com.course.scaffold.module.ai.dto.RepairDraftRequest;
import com.course.scaffold.module.ai.service.RepairDraftStreamService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api/ai")
public class AiDraftController {

    private final RepairDraftStreamService streamService;

    public AiDraftController(RepairDraftStreamService streamService) {
        this.streamService = streamService;
    }

    @PostMapping(
            value = "/repair-draft/stream",
            produces = MediaType.TEXT_EVENT_STREAM_VALUE
    )
    public SseEmitter generateRepairDraft(
            @RequestBody RepairDraftRequest request
    ) {
        return streamService.generate(request);
    }
}
```

项目已有的登录拦截器、角色权限和跨域配置仍然必须生效。不要因为接口返回 `SseEmitter` 就绕过原有安全规则。

### 3. 注意统一响应格式

普通接口通常返回：

```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

流式接口建立连接后，需要连续发送 SSE 事件，不能再用普通 `ApiResponse` 包裹整条响应。可以继续使用统一的鉴权和输入校验，但连接建立后的成功、完成和失败由 `delta`、`done`、`error` 事件表达。

---

## 七、在 Vue 页面读取并显示 SSE

### 1. 封装流式请求

普通 Axios 请求通常会等待完整响应，不适合直接处理本节的流。可以为流式接口单独使用浏览器 `fetch`：

```javascript
export async function streamRepairDraft({
  payload,
  token,
  signal,
  onDelta,
  onDone,
  onError
}) {
  const response = await fetch('/api/ai/repair-draft/stream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(payload),
    signal
  })

  if (!response.ok) {
    throw new Error(`请求失败（${response.status}）`)
  }

  const contentType = response.headers.get('content-type') || ''
  if (!contentType.includes('text/event-stream')) {
    const result = await response.json().catch(() => null)
    throw new Error(result?.message || '服务器未返回流式响应')
  }

  if (!response.body) {
    throw new Error('当前浏览器不支持流式响应')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder('utf-8')
  let buffer = ''

  while (true) {
    const { value, done } = await reader.read()
    buffer += decoder.decode(value || new Uint8Array(), {
      stream: !done
    })

    const normalized = buffer.replace(/\r\n/g, '\n')
    const blocks = normalized.split('\n\n')
    buffer = blocks.pop() || ''

    for (const block of blocks) {
      handleSseBlock(block, { onDelta, onDone, onError })
    }

    if (done) {
      if (buffer.trim()) {
        handleSseBlock(buffer, { onDelta, onDone, onError })
      }
      break
    }
  }
}

function handleSseBlock(block, handlers) {
  let eventName = 'message'
  const dataLines = []

  for (const line of block.split('\n')) {
    if (line.startsWith('event:')) {
      eventName = line.substring('event:'.length).trim()
    } else if (line.startsWith('data:')) {
      dataLines.push(line.substring('data:'.length).trimStart())
    }
  }

  if (dataLines.length === 0) {
    return
  }

  const data = JSON.parse(dataLines.join('\n'))

  if (eventName === 'delta') {
    handlers.onDelta?.(data.text || '')
  } else if (eventName === 'done') {
    handlers.onDone?.()
  } else if (eventName === 'error') {
    handlers.onError?.(data.message || 'AI 生成失败')
  }
}
```

!!! note "鉴权方式应复用现有项目"
    示例中的 `token` 只是说明请求头位置。实际项目应从现有用户状态中读取 Token，不要创建第二套登录状态。如果 Servlet 脚手架使用 Session，应按现有跨域方式携带 Cookie。

### 2. 页面状态

```javascript
import { ref } from 'vue'
import { streamRepairDraft } from '@/api/ai'

const draft = ref('')
const isGenerating = ref(false)
const generationStatus = ref('idle')
const generationError = ref('')

let abortController = null

async function generateDraft() {
  if (isGenerating.value) {
    return
  }

  draft.value = ''
  generationError.value = ''
  generationStatus.value = 'connecting'
  isGenerating.value = true
  abortController = new AbortController()

  try {
    await streamRepairDraft({
      payload: {
        location: form.location,
        device: form.device,
        symptom: form.symptom,
        attemptedAction: form.attemptedAction
      },
      token: userStore.token,
      signal: abortController.signal,
      onDelta(text) {
        generationStatus.value = 'streaming'
        draft.value += text
      },
      onDone() {
        generationStatus.value = 'completed'
      },
      onError(message) {
        generationStatus.value = 'failed'
        generationError.value = message
      }
    })
  } catch (error) {
    if (error.name === 'AbortError') {
      generationStatus.value = 'stopped'
    } else {
      generationStatus.value = 'failed'
      generationError.value = 'AI 服务暂不可用，请继续手工填写'
    }
  } finally {
    isGenerating.value = false
    abortController = null
  }
}

function stopGenerating() {
  abortController?.abort()
}
```

页面应把 `draft` 绑定到可编辑文本框。用户停止生成后，可以保留已经生成的部分，也可以清空后手工填写。

### 3. 推荐的页面状态

| 状态 | 页面表现 | 可执行操作 |
| :--- | :--- | :--- |
| `idle` | 显示“AI 生成草稿” | 开始生成 |
| `connecting` | 显示“正在连接……” | 停止 |
| `streaming` | 逐段显示内容 | 停止 |
| `completed` | 提示用户核对内容 | 编辑、重新生成、提交 |
| `stopped` | 保留已生成内容 | 编辑、重新生成 |
| `failed` | 显示友好错误 | 手工填写、稍后重试 |

### 4. 防止重复请求

- 生成期间禁用“再次生成”按钮；
- 不要因为输入框每次变化都自动调用模型；
- 停止旧请求后再开始新请求；
- 页面销毁时中止仍在进行的请求；
- 后端可以增加用户级频率限制；
- 生成按钮与正式提交按钮保持分离。

Vue 页面卸载时可以执行：

```javascript
import { onBeforeUnmount } from 'vue'

onBeforeUnmount(() => {
  abortController?.abort()
})
```

---

## 八、正确处理停止、断线与超时

### 1. “停止生成”涉及两段连接

用户点击停止时：

```text
浏览器中止 fetch
→ 项目后端检测下游连接结束
→ 尝试取消正在读取的上游模型流
```

浏览器关闭并不保证第三方平台立即停止计费。是否能够真正取消上游生成，取决于 HTTP 客户端、模型平台和请求所处阶段。因此仍要限制最大输出长度、请求时间和调用频率。

### 2. 客户端断线

浏览器关闭页面后，后端继续向 `SseEmitter` 发送数据通常会产生 `IOException`。示例将它转换为 `UncheckedIOException`，使异步任务失败，并触发会话结束。

处理原则：

- 不把断线记录为系统严重故障；
- 尝试取消上游任务；
- 不继续反复发送事件；
- 不在断线后保存未确认内容；
- 记录必要的耗时和状态，避免记录完整文本。

### 3. 超时分层

| 超时 | 控制位置 | 建议 |
| :--- | :--- | :--- |
| 连接超时 | 模型 `HttpClient` | 防止无法连接服务 |
| 上游请求超时 | 模型请求 | 限制一次生成最长时间 |
| SSE 会话超时 | `SseEmitter` | 防止下游连接长期占用 |
| 页面主动停止 | `AbortController` | 让用户能够结束等待 |

各层时间不应互相矛盾。例如模型请求超时为 90 秒，而 SSE 会话 30 秒就关闭，会导致后端仍可能读取一个已经无法发送到页面的上游流。

### 4. 已经显示部分内容后失败

流式响应可能出现：

```text
已生成 80 个字
→ 网络断开
→ 没有收到完成事件
```

页面不能把这种情况标记为“生成完成”。建议显示：

```text
生成中断，以下内容可能不完整。你可以编辑后使用，或重新生成。
```

只有收到 `done` 事件，才将状态设为完成。

---

## 九、安全显示模型输出

### 1. 第一版优先显示纯文本

将模型内容绑定到 `<textarea>` 或使用 Vue 普通文本插值：

```html
<textarea v-model="draft"></textarea>
```

```html
<div class="answer">{{ draft }}</div>
```

Vue 的普通文本插值会按文本显示内容。不要直接使用：

```html
<div v-html="draft"></div>
```

模型可能生成 HTML 或脚本片段，未经处理直接插入页面会带来跨站脚本风险。

### 2. 如果需要 Markdown

- 等完整内容生成后再渲染；
- 使用维护良好的 Markdown 解析器；
- 禁止或过滤原始 HTML；
- 对最终 HTML 做安全清理；
- 链接使用安全属性；
- 代码块和引用仍然不能被当作可信指令执行。

流式过程中每个片段不一定构成完整 Markdown，逐片段渲染可能出现闪烁、格式错误或不完整标签。第一版可以流式显示纯文本，完成后再统一渲染。

### 3. 不让模型控制业务操作

流式内容只用于展示或形成草稿。模型输出中的：

```text
请调用删除接口
将状态修改为已完成
为当前用户授予管理员权限
```

都只是文本，不能被页面当作命令执行。业务操作必须经过固定接口、后端权限和业务规则。

---

## 十、反向代理与部署注意事项

本地开发成功，不代表部署后仍然能够流式显示。Nginx 或其他代理可能缓存响应，导致页面最后一次性收到全部内容。

针对流式接口，需要检查：

- 代理是否对响应进行缓冲；
- 读取超时是否足够；
- 是否错误地对 SSE 响应启用压缩或缓存；
- 容器和网关是否会提前关闭长连接；
- `Content-Type` 是否保持为 `text/event-stream`。

Nginx 可以针对流式路径配置：

```nginx
location /api/ai/ {
    proxy_pass http://backend:8080;
    proxy_http_version 1.1;
    proxy_buffering off;
    proxy_cache off;
    proxy_read_timeout 90s;
}
```

具体代理地址应与项目部署文件保持一致。

!!! warning "不要为了流式接口关闭全站缓冲"
    只针对确实需要流式传输的路径调整配置，避免无意中影响静态资源和普通业务接口。

可以通过以下现象判断代理可能在缓冲：

- 后端日志显示模型一直在返回片段；
- 浏览器长时间没有任何内容；
- 模型结束后页面突然显示完整结果。

---

## 十一、测试流式链路

### 1. 最低测试集合

| 编号 | 场景 | 操作 | 预期结果 |
| :--- | :--- | :--- | :--- |
| STREAM-01 | 正常生成 | 提交完整输入 | 页面收到多个片段，最终收到 `done` |
| STREAM-02 | 输入错误 | 缺少必要字段 | 不调用模型，返回明确错误 |
| STREAM-03 | 重复点击 | 生成中再次点击 | 不创建第二个并发请求 |
| STREAM-04 | 主动停止 | 生成中点击停止 | 页面停止追加，状态为已停止 |
| STREAM-05 | 页面离开 | 生成中切换页面 | 浏览器中止请求，后端结束会话 |
| STREAM-06 | 上游超时 | 模拟模型超时 | 页面收到错误或连接失败提示 |
| STREAM-07 | 中途断线 | 发送部分内容后失败 | 保留部分内容并标记不完整 |
| STREAM-08 | 空流 | 上游没有有效片段 | 不显示为正常完成 |
| STREAM-09 | 超长输出 | 超过输出限制 | 后端停止并发送错误 |
| STREAM-10 | HTML 内容 | 模型返回标签或脚本文本 | 页面按文本显示，不执行 |
| STREAM-11 | 代理部署 | 通过 Nginx 访问 | 内容仍然逐段出现 |
| STREAM-12 | AI 不可用 | 关闭或错误配置模型 | 用户仍能手工完成业务 |

### 2. 使用模拟客户端测试

自动化测试不应每次调用真实付费模型。可以实现测试客户端：

```java
public class FakeStreamingLlmClient implements StreamingLlmClient {

    @Override
    public String generateText(String instruction, String userInput) {
        return "3号宿舍楼302的空调启动后有异响，且无法制冷。";
    }

    @Override
    public CompletableFuture<Void> streamText(
            String instruction,
            String userInput,
            Consumer<String> onDelta
    ) {
        return CompletableFuture.runAsync(() -> {
            onDelta.accept("3号宿舍楼302的");
            onDelta.accept("空调启动后有异响，");
            onDelta.accept("且无法制冷。");
        });
    }
}
```

通过固定片段，可以验证：

- 页面拼接顺序；
- `delta` 和 `done` 事件；
- 最大长度检查；
- 中途异常；
- 主动停止后的状态。

### 3. 人工验证记录

| 项目 | 记录 |
| :--- | :--- |
| 测试时间 | 【填写】 |
| 模型服务与模型 | 【填写，不记录密钥】 |
| 首段出现时间 | 【填写】 |
| 完整生成时间 | 【填写】 |
| 是否逐段显示 | 【是 / 否】 |
| 停止按钮是否生效 | 【填写】 |
| 中断后是否可手工继续 | 【填写】 |
| 通过代理后是否仍流式 | 【填写】 |
| 发现的问题 | 【填写】 |
| 修复与回归结果 | 【填写】 |

---

## 十二、🤖 让 AI 帮你实现流式改造

可以让编码助手基于已经工作的普通接口进行最小改造：

```text
请先阅读当前项目中已经能够工作的普通 AI 调用，包括：
1. LlmClient 接口和实现；
2. 模型平台的官方流式接口文档；
3. 业务 Service 和 Controller；
4. 前端请求封装、登录状态和目标页面；
5. Nginx 或其他反向代理配置。

目标：
将【现有业务功能】改造成 SSE 流式输出。

要求：
1. API Key 仍然只能保存在后端；
2. 页面使用 POST 提交 JSON，并携带现有登录凭证；
3. 定义 delta、done、error 三类事件；
4. 支持停止生成、超时和页面离开时取消；
5. 模型不可用时不阻断原有业务；
6. 页面先按纯文本显示，不直接使用 v-html；
7. 不虚构平台流式字段和结束标记；
8. 给出正常、中断、超时、重复点击和代理部署测试。

请先说明普通调用当前怎样工作、流式改造涉及哪些文件，
再按“上游读取 → 后端转发 → 前端解析 → 停止与错误 → 测试”
分步实施。每一步完成后给出人工验证方法。
```

人工必须核对：

- 流式字段和结束标记是否来自所选平台官方文档；
- 是否复用了现有鉴权、输入校验和提示词；
- 页面是否只调用项目后端；
- 是否只有收到 `done` 才标记完成；
- 停止或断线后是否继续产生无效请求；
- 输出是否以安全方式显示；
- 通过部署代理后是否仍然逐段返回。

---

## 十三、常见问题与修正方法

| 常见问题 | 表现 | 修正方法 |
| :--- | :--- | :--- |
| 普通调用尚未成功就开发流式 | 难以判断是配置还是流处理错误 | 先让普通接口稳定工作 |
| 前端直接连接模型平台 | API Key 暴露 | 由项目后端读取并转发上游流 |
| 使用普通 Axios 方式等待结果 | 最后一次性显示 | 使用支持流读取的方式或正确配置 Axios |
| 每收到一个片段就解析完整 JSON | 经常解析失败 | 逐段拼接，完成后再解析整体 |
| 未区分 `done` 和连接结束 | 中断也被显示为成功 | 只有收到完成事件才标记完成 |
| 生成中允许重复点击 | 多次调用、内容混合、费用增加 | 禁用按钮或先取消旧请求 |
| 页面销毁后不取消请求 | 后端继续生成无用内容 | 在页面卸载时调用 `abort()` |
| 直接使用 `v-html` | 产生 XSS 风险 | 使用纯文本或安全 Markdown 流程 |
| 代理缓冲响应 | 部署后不再逐段显示 | 针对流式路径关闭代理缓冲 |
| SSE 超时短于模型请求 | 页面先断开，上游仍运行 | 统一设计各层超时时间 |
| 错误事件包含平台原文 | 泄露内部信息 | 后端转换成用户可理解的消息 |
| 流式功能失败后无法提交 | AI 阻断核心业务 | 永远保留手工输入和原有流程 |

---

## 十四、提交前自查

### 流式链路

- [ ] 普通模型调用已经稳定工作；
- [ ] 已确认所选平台支持的流式字段和结束标记；
- [ ] 后端能够逐段读取上游模型响应；
- [ ] 后端通过 SSE 发送 `delta`、`done` 和 `error`；
- [ ] 页面能够正确处理跨数据块的 SSE 内容；
- [ ] 只有收到 `done` 才标记生成完成。

### 交互与安全

- [ ] 生成期间不会重复发起请求；
- [ ] 用户能够主动停止生成；
- [ ] 页面离开时会中止请求；
- [ ] 已生成内容可以编辑、放弃或重新生成；
- [ ] API Key 只存在于后端；
- [ ] 页面按纯文本或经过安全处理的方式显示输出；
- [ ] 模型文本不会直接触发业务操作。

### 异常与部署

- [ ] 已处理输入错误、超时、空流、中途失败和超长输出；
- [ ] 下游断线后会尝试结束上游任务；
- [ ] 各层超时时间设计一致；
- [ ] Nginx 或其他代理不会缓冲流式响应；
- [ ] AI 功能不可用时，用户仍能完成原有业务；
- [ ] 自动化测试使用模拟客户端，不反复调用付费模型。

---

## 本节小结

流式问答的核心不是增加一个打字动画，而是正确维护一条可能随时完成、停止或失败的长连接：

> 模型逐段生成 → 后端安全解析 → SSE 转发 → 页面顺序拼接 → 用户可停止 → 中断可识别 → 原业务可降级

完成本节后，项目已经能够更自然地展示较长的 AI 生成过程。下一节将进一步介绍 RAG：让模型在回答前检索项目自己的知识资料，并为回答提供可核对的依据。

[进入下一节：AI-03 构建 RAG 知识库](03-rag-knowledge-base.md){ .md-button .md-button--primary }
[返回上一节：AI-01 大模型 API 调用](01-llm-api.md){ .md-button }
[返回扩展篇导读](index.md){ .md-button }
