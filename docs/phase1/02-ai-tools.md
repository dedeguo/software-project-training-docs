# 1.2 AI 编程利器登场：Trae IDE 与 Superpowers 技能框架

在 1.1 中，我们已经让 Trae 打开过项目、跑起来过初始系统。但你可能会疑惑：同样是用 AI 写代码，为什么有人写出来的代码又快又稳，有人却越写越乱、Bug 满天飞？

答案往往不在于“用不用 AI”，而在于**你给 AI 配了什么工具、立了什么规矩**。本节正式介绍本课程贯穿始终的两件利器：**Trae IDE**（AI 原生开发环境）与 **Superpowers-zh**（给 AI 装上工程方法论的技能框架）。

## 一、 Trae IDE：为 AI 协作而生的开发环境

**Trae** 是字节跳动推出的 AI 原生 IDE。与传统的“编辑器 + AI 插件”模式不同，它从底层就把 AI 当作一等公民来设计，让 AI 既能辅助你写代码，也能独立承担完整的开发任务。

### 1. 核心特性一览

| 特性 | 说明 | 在本课程中的用途 |
|---|---|---|
| **IDE 模式** | 在你熟悉的编码流程中嵌入 Agent 能力，边写边协作 | 日常开发、代码补全、对话问答 |
| **SOLO 模式** | 全自动编码 Agent，从需求到部署端到端交付 | 复杂模块的整体生成与迭代 |
| **多代理框架** | 内置可定制 Agent，支持子代理分工协作 | 分模块开发时的任务拆分与并行 |
| **MCP 工具集成** | 通过 Model Context Protocol 按需接入外部资源 | 读取数据库、调用接口、浏览器调试 |
| **CUE 智能补全** | 一个 Tab 预测你的下一步编辑，跨多行建议 | 提升手写代码的效率 |
| **内置预览** | 浏览器变成开发工具，Agent 可读取控制台、交互元素 | 实时验证生成页面是否符合预期 |

### 2. 在本课程中的定位

在本课程的“校园图书管理系统”带练中，你将主要使用 Trae 完成三件事：

1. **阅读与理解项目**：用 `@` 提及 `docs/` 下的需求与设计文档，让 Trae 在生成代码前先“读懂”规范。
2. **生成与修改代码**：通过对话或 Builder/SOLO 模式，让 Trae 按文档要求生成前后端代码。
3. **审查与验证**：借助内置预览与 MCP，实时检查 Trae 产出的代码是否符合预期。

> **🔍 一个关键观念：**
> Trae 是“手”，但它不会自己思考工程纪律。如果不加约束，它可能跳过测试、擅改表结构、生成游离于设计文档之外的接口。这就是为什么我们需要 **Superpowers** 来给它装上“方法论大脑”，再用 **AGENTS.md** 给它立下“红线规矩”。

## 二、 Superpowers-zh：给 AI 装上工程方法论

### 1. 它解决什么问题？

先看一组对比，你就能直观感受到 Superpowers 的价值：

**没装 Superpowers：**

```text
你：给用户模块加个批量导出功能
AI：好的，我来实现...（直接开始写代码）
export async function exportUsers() { ... }
你：等等，格式不对，没分页，大数据量会 OOM...
```

**装了 Superpowers：**

```text
你：给用户模块加个批量导出功能
AI：在开始实现之前，我需要了解几个关键问题：
 1. 导出格式是 CSV 还是 Excel？
 2. 预计数据量多大？需要异步处理吗？
 3. 有权限要求吗？
 → 给出 2-3 个方案，确认后再动手
```

**Superpowers-zh** 是开源项目 [superpowers](https://github.com/obra/superpowers)（233k+ stars）的**中文增强版**（[github.com/jnMetaCode/superpowers-zh](https://github.com/jnMetaCode/superpowers-zh)）。它在完整翻译上游 14 个 skills 的基础上，新增了 6 个面向中国开发者的特色 skills，并一键适配 **18 款主流 AI 编程工具**（包括 Trae、Claude Code、Cursor、通义灵码、Qoder 等）。

一句话：**它把“先想清楚再动手、写完必验证、出 Bug 按流程排错”这套资深工程师的工作习惯，固化成 AI 可加载的技能包。**

### 2. 核心工作流（7 个阶段自动触发）

Superpowers 把一次完整的开发任务拆成 7 个阶段，每个阶段对应一个 skill，在合适的时机自动激活：

| 阶段 | Skill | 作用 |
|---|---|---|
| 1 | `brainstorming`（头脑风暴） | 动手前先提问，搞清楚需求与边界 |
| 2 | `using-git-worktrees` | 用 git worktree 创建隔离开发环境 |
| 3 | `writing-plans`（编写计划） | 把大任务拆成 2–5 分钟可完成的小块 |
| 4 | `subagent-driven-development` | 子代理并行执行，两阶段审查 |
| 5 | `test-driven-development` | 强制 RED-GREEN-REFACTOR 循环 |
| 6 | `requesting-code-review` | 任务之间自动进行代码审查 |
| 7 | `finishing-a-development-branch` | 完成后验证测试并清理分支 |

### 3. 四大原则

- **TDD 优先** —— 先写测试，再写代码
- **系统化调试** —— 不靠猜，按流程排错
- **简化复杂性** —— 能简单就不复杂
- **证据优于声明** —— 做完要验证，不能嘴上说成功

### 4. Skills 一览（20 个）

**14 个翻译 skills（覆盖通用工程方法论）：**

头脑风暴、编写计划、执行计划、测试驱动开发、系统化调试、请求代码审查、接收代码审查、完成前验证、派遣并行 Agent、子 Agent 驱动开发、Git Worktree 使用、完成开发分支、编写 Skills、使用 Superpowers。

**6 个中国特色 skills（适配国内开发场景）：**

| Skill | 用途 | 调用方式 |
|---|---|---|
| `chinese-code-review` | 符合国内团队文化的代码审查规范 | `/chinese-code-review`（手动） |
| `chinese-git-workflow` | 适配 Gitee/Coding/极狐 GitLab/CNB | `/chinese-git-workflow`（手动） |
| `chinese-documentation` | 中文排版、中英混排、告别机翻味 | `/chinese-documentation`（手动） |
| `chinese-commit-conventions` | 适配国内团队的 commit message 规范 | `/chinese-commit-conventions`（手动） |
| `mcp-builder` | 构建生产级 MCP 工具，扩展 AI 能力边界 | 自动 |
| `workflow-runner` | 在 AI 工具内运行多角色 YAML 工作流 | 自动 |

## 三、 在 Trae 中安装 Superpowers-zh

Superpowers-zh 原生支持 Trae，安装后 skills 会落到 `.trae/skills/` 与 `.trae/rules/` 目录下。

### 方式一：一键安装（推荐）

在项目根目录下执行：

```bash
cd /your/project          # 进入你的项目根目录
npx superpowers-zh --tool trae        # 自动识别项目里的工具并安装
```

> **⚠️ 注意：**
> - **不要在主目录（`~`）下运行**，否则会把 skills 写到 home 目录，污染所有项目。
> - 如果自动识别不到 Trae，可用 `npx superpowers-zh --tool trae` 显式指定。
> - 想卸载时执行 `npx superpowers-zh@latest --uninstall`，会按哨兵精确切除，不会误删你自己的内容。

### 方式二：手动安装（仅作备选）

仅当无网络或 npx 不可用时使用。注意：手动 `cp -r skills` 是低保版安装，**不会配置 hooks 和 bootstrap 引导**，AI 不会在合适时机自动调用 skills，需要你每次手动喊“use brainstorming skill”。

```bash
# 克隆仓库
git clone https://github.com/jnMetaCode/superpowers-zh.git

# 复制 skills 到 Trae 的规则目录
cp -r superpowers-zh/skills /your/project/.trae/rules
```

### 验证是否生效

安装完成后重启 Trae，在对话窗口输入：

> *"你有 superpowers 吗？"*

如果安装成功，AI 会回复关于 superpowers 技能体系的相关内容，并在后续任务中主动按 7 阶段工作流推进。

## 四、 小结与下一步

到这一步，你已经认识了本课程的两大生产力底座：

- **Trae IDE** —— 提供 AI 协作的开发环境（手）
- **Superpowers-zh** —— 提供 AI 应遵循的工程方法论（脑）

但只有工具还不够。工具再强，也得有规矩约束它别“自由发挥”。下一节，我们将通过 `AGENTS.md` 给 Trae 立下项目级的红线规矩，让它严格按照需求与设计文档生成代码。
