# Trae Hooks 学生 AI 使用情况收集方案

> 基于 Trae IDE Hook 机制，在学生本地静默采集其与 AI 的交互日志，用于课程教研分析学生 AI 使用情况。

## 一、目标与背景

在《软件开发综合项目实训——AI 辅助的软件项目开发》课程中，学生需要大量借助 Trae 等 AI 编程工具完成选题、需求、设计、编码、测试、部署和答辩。

为了解学生**实际如何使用 AI**（提问频率、提问类型、AI 回答采纳情况、常见困难点等），本方案利用 Trae 提供的 **Hooks 机制**，在学生本机静默收集其与 AI 的对话数据，用于教师课程复盘与教学改进。

!!! warning "隐私与伦理"
    本工具采集的是**本地行为日志**，用于教学研究，使用前必须：

    1. 在课程第一节课向学生**明确告知**采集目的、范围与使用方式；
    2. 取得学生**知情同意**（可写入《课程告知书》或开课问卷）；
    3. 日志中**不采集 API Key、Token、密码等敏感字段**；
    4. 日志仅留在**学生本机**，由学生在提交作业时**自行打包**或选择**手动上传**到指定位置；
    5. 教师分析时需对学生信息做**匿名化**处理。

---

## 二、Trae Hook 机制简介

Trae IDE 提供了 Hook 接口，允许在 AI 交互的关键事件触发时执行外部脚本。配置文件位于 `~/.trae-cn/hooks.json`（macOS / Linux） 或 `%USERPROFILE%\.trae-cn\hooks.json`（Windows）。

### 2.1 配置文件结构

```json
{
  "version": 1,
  "hooks": {
    "<事件名>": [
      {
        "matcher": "<匹配器>",
        "hooks": [
          {
            "type": "command",
            "command": "<要执行的命令>",
            "timeout": <超时秒数>
          }
        ]
      }
    ]
  }
}
```

### 2.2 关键事件

| 事件名 | 触发时机 | 关键输入字段 |
| :--- | :--- | :--- |
| `UserPromptSubmit` | 用户在 Trae 中发送一条消息时 | `prompt` |
| `Stop` | AI Agent 会话结束/停止时 | `stop_hook_active`、`loop_count`、`text_content`、`last_assistant_message` |

所有事件都会携带以下**通用字段**：

- `session_id`：会话 ID
- `cwd`：当前工作目录
- `hook_event_name`：事件名
- `workspace_roots`：工作区根目录列表
- `agent_id` / `agent_type`：Agent 信息

### 2.3 输入输出约定

- **输入**：Trae 将事件数据以 **JSON 格式**通过 **stdin** 传入脚本。
- **输出**：
    - 仅做日志收集时，**不需要输出**，脚本正常 `exit 0` 即可；
    - 若要干预行为（如拒绝危险命令），可在 **stdout** 输出 JSON：`{"hookSpecificOutput": {"hookEventName": "...", "permissionDecision": "allow|deny", "permissionDecisionReason": "..."}}`。

---

## 三、本方案配置说明

### 3.1 `hooks.json`（示例）

见同目录下 [`hooks.json`](./hooks.json)：

```json
{
  "version": 1,
  "hooks": {
    "UserPromptSubmit": [
      {
        "matcher": "RunCommand",
        "hooks": [
          {
            "type": "command",
            "command": "python3 <本目录>/test.py",
            "timeout": 10
          }
        ]
      }
    ],
    "Stop": [
      {
        "matcher": "RunCommand",
        "hooks": [
          {
            "type": "command",
            "command": "python3 <本目录>/test_stop.py",
            "timeout": 10
          }
        ]
      }
    ]
  }
}
```

> ⚠️ 使用前请将 `command` 中的 `<本目录>` 替换为学生本机该仓库**实际克隆后的绝对路径**，例如 `/Users/<name>/Documents/trae_hooks/test.py`。

### 3.2 学生提问采集脚本：`test.py`

监听 `UserPromptSubmit` 事件，把学生发送给 AI 的 `prompt` 文本按行追加到日志文件：

```python
#!/usr/bin/env python3
import sys, json
from datetime import datetime

input_data = json.load(sys.stdin)
prompt = input_data.get("prompt", "")

# 追加一行：[时间] 提问内容
with open("input_data2.log", "a", encoding="utf-8") as f:
    f.write(f"[{datetime.now()}] {prompt}\n")

# 仅采集，不干预 Agent 行为
sys.exit(0)
```

### 3.3 AI 回复采集脚本：`test_stop.py`

监听 `Stop` 事件，把 AI 完整回复（`last_assistant_message`）落盘，便于事后分析提问-回答对：

```python
import sys, json
from datetime import datetime

input_data = json.load(sys.stdin)
prompt = input_data.get("prompt", "")

# 把整条 Stop 事件（含 last_assistant_message）落盘
with open("input_data2.log", "a", encoding="utf-8") as f:
    f.write(f"[{datetime.now()}] {input_data}\n")
```

### 3.4 采集的数据格式

`UserPromptSubmit` 事件示例（见 [`sample_data/UserPromptSubmit.json`](./sample_data/UserPromptSubmit.json)）：

```json
{
  "session_id": "6a754aa0c29849ae435ad144",
  "cwd": "/Users/xxx/project",
  "hook_event_name": "UserPromptSubmit",
  "workspace_roots": ["/Users/xxx/project"],
  "agent_id": "solo_agent",
  "agent_type": "solo_agent",
  "prompt": "继续"
}
```

`Stop` 事件示例（见 [`sample_data/Stop.json`](./sample_data/Stop.json)）：在通用字段之上额外包含：

- `stop_hook_active`：是否处于 Stop Hook 激活状态
- `loop_count`：Agent 内部循环次数
- `text_content` / `last_assistant_message`：AI 最终回复全文

---

## 四、学生端安装步骤

### 4.1 准备工作

1. 学生本机已安装 **Trae IDE**（[https://www.trae.cn/](https://www.trae.cn/)）；
2. 已安装 **Python 3.8+**（macOS / Linux 默认带，Windows 需自行安装）；
3. 将本目录（`trae_hooks/`）克隆/拷贝到本地，例如 `~/Documents/trae_hooks`。

### 4.2 复制脚本到稳定路径

```bash
# macOS / Linux 示例
mkdir -p ~/Documents/trae_hooks
cp -R trae_hooks/* ~/Documents/trae_hooks/

# 修改权限，确保 Python 脚本可执行
chmod +x ~/Documents/trae_hooks/test.py
chmod +x ~/Documents/trae_hooks/test_stop.py
```

### 4.3 修改 `hooks.json` 中的脚本路径

把 `hooks.json` 中 `command` 字段里的 `python3 <本目录>/test.py` 改成学生本机的**绝对路径**，例如：

```json
"command": "python3 /Users/<学号或姓名>/Documents/trae_hooks/test.py"
"command": "python3 /Users/<学号或姓名>/Documents/trae_hooks/test_stop.py"
```

> Windows 下命令类似：`"command": "python C:\\Users\\<name>\\Documents\\trae_hooks\\test.py"`。

### 4.4 写入 Trae 配置目录

```bash
# macOS / Linux
cp hooks.json ~/.trae-cn/hooks.json
```

```powershell
# Windows PowerShell
Copy-Item .\hooks.json $env:USERPROFILE\.trae-cn\hooks.json -Force
```

### 4.5 验证

1. 启动 Trae，随便发一条消息（例如"你好"）；
2. 在 `trae_hooks/` 目录下检查 `input_data2.log`，应能看到新增的一行；
3. 待 AI 完整回复一次后再次检查，应能看到 `Stop` 事件的整条 JSON。

---

## 五、日志样本

[`sample_data/input_data2.log`](./sample_data/input_data2.log) 是真实采集样例，可以看到：

- 学生每发一条 prompt 会先记录一行纯文本；
- 接着 AI 一次完整回答结束后，会追加一整条 `Stop` 事件 JSON。

这对后续按 `session_id` 把“提问 → 回答”配对、做时序分析非常方便。

---

## 六、教师端：日志回收与分析

### 6.1 回收方式（两种可选）

| 方式 | 操作 | 适用场景 |
| :--- | :--- | :--- |
| **学生手动提交** | 学生在每次作业/周报里附上 `trae_hooks/` 目录的压缩包 | 课程规模小、需保护隐私 |
| **自动汇聚** | 在脚本里把日志 `POST` 到教师提供的内网接收端 | 课程规模大、有可信服务器 |

### 6.2 建议的分析指标

- **提问频次**：每个学生每天发送多少条 prompt，反映学习投入度；
- **会话长度**：`loop_count` 分布，看学生是否陷入反复让 AI 自己修改的死循环；
- **提问类型**：用关键词分类（需求/设计/编码/测试/部署/答辩）；
- **采纳率**：同一会话中 `UserPromptSubmit` 与 `Stop` 的次数比，反映学生是否真正读 AI 的回答；
- **错误模式**：高频出现"为什么报错""还是不对"等追问的学生，可能存在依赖 AI 而不自检的问题。

### 6.3 简单的 Python 分析脚本骨架

```python
import json, re
from collections import Counter, defaultdict
from pathlib import Path

events = []
for line in Path("input_data2.log").read_text(encoding="utf-8").splitlines():
    if not line.strip():
        continue
    # 尝试解析完整 JSON（Stop 事件）；纯文本 prompt 行会失败，跳过
    try:
        idx = line.index("{")
        events.append(json.loads(line[idx:]))
    except ValueError:
        pass

# 按 session 分组
by_session = defaultdict(list)
for e in events:
    by_session[e["session_id"]].append(e)

# 统计每个学生（通过 cwd 推断）每天的提问数
daily = Counter()
for e in events:
    if e["hook_event_name"] == "UserPromptSubmit":
        day = e["session_id"]  # 实际可换成按 cwd + 日期
        daily[day] += 1

print("总事件数:", len(events))
print("总会话数:", len(by_session))
print("按 session 提问 Top10:", daily.most_common(10))
```

---

## 七、扩展与改造建议

- **敏感字段过滤**：在 `test.py` 里对 `prompt` 做正则替换，去掉可能的密码、Token、手机号；
- **多事件采集**：在 `hooks.json` 中加入 `PreToolUse`、`PostToolUse`，统计工具调用情况；
- **实时上传**：把日志封装成 `requests.post`，定时推送到教师服务器；
- **可视化**：把日志导入 Pandas + Pyecharts，生成每位学生 AI 协作画像；
- **课堂反馈**：对高频错误模式做统计，下一节课集中讲解。

---

## 八、文件清单

| 文件 | 作用 |
| :--- | :--- |
| [`hooks.json`](./hooks.json) | Trae Hook 配置文件示例 |
| [`test.py`](./test.py) | `UserPromptSubmit` 事件采集脚本（记录学生提问） |
| [`test_stop.py`](./test_stop.py) | `Stop` 事件采集脚本（记录 AI 回复全文） |
| [`sample_data/UserPromptSubmit.json`](./sample_data/UserPromptSubmit.json) | 提问事件样例 |
| [`sample_data/Stop.json`](./sample_data/Stop.json) | Stop 事件样例 |
| [`sample_data/input_data.log`](./sample_data/input_data.log) | 早期采集的简版日志样例 |
| [`sample_data/input_data2.log`](./sample_data/input_data2.log) | 当前方案采集的日志样例 |
| [`sample_data/stop2.json`](./sample_data/stop2.json) | 备用 Stop 样例 |

---

## 九、参考资料

- Trae IDE 官方下载：[https://www.trae.cn/](https://www.trae.cn/)
- Hook 机制说明：见 [`docs/chapter01/02-ai-tools.md`](../../docs/chapter01/02-ai-tools.md)
- 课程主页：[https://project-ai.chende.top/](https://project-ai.chende.top/)