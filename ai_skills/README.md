# 软件开发综合项目实训 TRAE AI Skills

面向软件工程项目实践的 AI Agent Skills 技能包

本技能包将课程中的项目选题、需求分析、文档评审等方法整理为可复用的 AI 技能，帮助学生在 TRAE 中按照规范的软件工程流程完成课程项目。

安装后，Skills 会被复制到当前项目的：

```text
.trae/skills/
```

同时生成课程技能调用规则：

```text
.trae/rules/software-project-training-skills.md
```

---

## 一、主要功能

本技能包目前包含以下 Skills：

| Skill                   | 主要用途                                 |
| ----------------------- | ------------------------------------ |
| `topic-selection`       | 辅助学生选择、比较、优化和审核课程项目选题                |
| `requirements-analysis` | 梳理用户角色、业务场景、功能需求、业务规则和验收条件           |
| `requirements-review`   | 对照检查《项目选题立项书》和《需求分析说明书》中的矛盾、遗漏和超范围内容 |
| `system-design`         | 完成技术选型、架构、模块、页面、数据、接口、权限和状态设计并编制设计说明书 |
| `system-design-review`  | 评审系统设计的需求覆盖、可行性、一致性、安全风险和进入开发条件 |

后续可继续增加：

* 项目开发
* 系统测试
* 项目部署

---

## 二、适用对象

本技能包主要面向：

* 《软件开发综合项目实训》课程学生
* 使用 TRAE 完成课程项目的学生
* 使用 AI 辅助进行需求分析、系统设计和项目开发的学习者
* 希望规范 AI 编程流程的教师和项目指导人员

本技能包强调：

1. AI 辅助学生完成项目，但不替学生承担项目责任。
2. AI 不得虚构用户调研、教师意见、业务数据或项目事实。
3. 需求、设计和代码必须保持一致。
4. 项目应优先保证小而完整、可运行、可测试、可展示。
5. 默认推荐学生独立完成项目，确有必要时再申请组队。

---

## 三、环境要求

使用前需要安装：

* Node.js 18 或更高版本
* npm 或兼容的 Node.js 包管理工具
* TRAE IDE

检查 Node.js 和 npm 版本：

```bash
node -v
npm -v
```

---

## 四、安装方法

### 1. 进入 TRAE 项目目录

请先进入需要安装 Skills 的具体项目根目录。

例如：

```bash
cd /path/to/student-project
```

不要直接在用户主目录中运行安装命令。

### 2. 使用 npx 安装

```bash
npx @dedeguo/software-project-training-skills
```

安装器会自动完成以下操作：

1. 检查 npm 包中的所有 Skill。
2. 校验每个 `SKILL.md` 的 `name` 和 `description`。
3. 将 Skills 复制到当前项目的 `.trae/skills/`。
4. 生成 `.trae/rules/software-project-training-skills.md`。
5. 保留用户已经创建的其他 Skills 和 Rules。

安装完成后的目录结构如下：

```text
student-project/
├── .trae/
│   ├── skills/
│   │   ├── topic-selection/
│   │   │   ├── SKILL.md
│   │   │   ├── agents/
│   │   │   └── references/
│   │   │
│   │   ├── requirements-analysis/
│   │   │   ├── SKILL.md
│   │   │   ├── agents/
│   │   │   └── references/
│   │   │
│   │   ├── requirements-review/
│   │   │   ├── SKILL.md
│   │   │   ├── agents/
│   │   │   └── references/
│   │   │
│   │   ├── system-design/
│   │   │   ├── SKILL.md
│   │   │   ├── agents/
│   │   │   └── references/
│   │   │
│   │   └── system-design-review/
│   │       ├── SKILL.md
│   │       ├── agents/
│   │       └── references/
│   │
│   └── rules/
│       └── software-project-training-skills.md
│
└── ...
```

安装后建议重新打开 TRAE 项目，或者新建一个对话会话。

---

## 五、使用方法

TRAE 可以根据 Skill 的 `description` 自动判断何时调用对应技能。

也可以在对话中明确指定 Skill。

### 1. 项目选题

```text
使用 topic-selection Skill，帮我比较以下三个项目选题，并推荐一个适合独立完成的题目。
```

```text
使用 topic-selection Skill，检查我的项目题目是否范围过大。
```

```text
使用 topic-selection Skill，帮我填写《项目选题立项书》。
```

### 2. 需求分析

```text
使用 requirements-analysis Skill，根据我的《项目选题立项书》梳理项目需求。
```

```text
使用 requirements-analysis Skill，帮我整理用户角色、核心场景、功能需求和业务规则。
```

```text
使用 requirements-analysis Skill，生成《需求分析说明书》初稿。
```

### 3. 需求文档评审

```text
使用 requirements-review Skill，评审我的《项目选题立项书》和《需求分析说明书》。
```

```text
使用 requirements-review Skill，列出提交前必须修改的问题。
```

```text
使用 requirements-review Skill，检查需求文档中是否存在范围冲突、流程断裂和无法验收的问题。
```

### 4. 系统设计

```text
使用 system-design Skill，根据《需求分析说明书》完成系统架构、模块、页面、数据库和接口设计。
```

```text
使用 system-design Skill，比较适合当前课程项目的技术方案，并说明推荐依据和风险。
```

```text
使用 system-design Skill，检查现有设计的一致性并生成《系统设计说明书》初稿。
```

### 5. 系统设计评审

```text
使用 system-design-review Skill，评审《系统设计说明书》和相关设计材料，列出进入开发前必须解决的问题。
```

```text
使用 system-design-review Skill，沿核心业务流程检查页面、接口、权限、状态和数据库是否一致。
```

```text
使用 system-design-review Skill，复核评审问题的修改结果并判断能否形成设计基线。
```

---

## 六、命令参数

### 查看帮助

```bash
npx @dedeguo/software-project-training-skills --help
```

也可以使用：

```bash
npx @dedeguo/software-project-training-skills -h
```

### 查看技能列表

```bash
npx @dedeguo/software-project-training-skills --list
```

该命令只显示当前 npm 包中包含的 Skills，不会修改项目文件。

### 模拟安装

```bash
npx @dedeguo/software-project-training-skills --dry-run
```

该命令会显示将要创建、删除和复制的文件，但不会真正修改项目。

### 更新技能包

```bash
npx @dedeguo/software-project-training-skills@latest
```

重新安装时，只会覆盖当前技能包中的同名 Skill，不会删除用户自己创建的其他 Skill。

### 卸载技能包

```bash
npx @dedeguo/software-project-training-skills --uninstall
```

卸载器只会删除：

* 本技能包中包含的同名 Skill
* 本安装器生成的课程 Rule 文件

不会删除用户自己创建的其他 Skills 和 Rules。

### 强制在当前目录安装

安装器默认不允许直接安装到用户主目录。

确认需要在当前目录安装时，可以运行：

```bash
npx @dedeguo/software-project-training-skills --force
```

不建议学生使用该参数，除非已经确认当前目录就是项目目录。

---

## 七、目录结构

本 npm 包的推荐结构如下：

```text
course_design/
├── package.json
├── README.md
├── LICENSE
│
├── bin/
│   └── install.js
│
└── skills/
    ├── topic-selection/
    │   ├── SKILL.md
    │   ├── agents/
    │   │   └── openai.yaml
    │   └── references/
    │       └── project-topics.md
    │
    ├── requirements-analysis/
    │   ├── SKILL.md
    │   ├── agents/
    │   │   └── openai.yaml
    │   └── references/
    │       └── requirements-spec-template.md
    │
    ├── requirements-review/
    │   ├── SKILL.md
    │   ├── agents/
    │   │   └── openai.yaml
    │   └── references/
    │       └── review-checklist.md
    │
    ├── system-design/
    │   ├── SKILL.md
    │   ├── agents/
    │   │   └── openai.yaml
    │   └── references/
    │       ├── system-design-spec-template.md
    │       └── design-consistency-checklist.md
    │
    └── system-design-review/
        ├── SKILL.md
        ├── agents/
        │   └── openai.yaml
        └── references/
            ├── system-design-review-checklist.md
            └── design-review-record-template.md
```

---

## 八、Skill 编写规范

每个 Skill 必须放在独立目录中：

```text
skills/<skill-name>/
```

并至少包含：

```text
SKILL.md
```

### SKILL.md 示例

```markdown
---
name: system-design
description: "Guide students through system architecture, technical selection, functional modules, UI prototypes, database design, interfaces, permissions, and business-state design. Use when a student needs to design or review a course software project before implementation."
---

# 系统设计助手

## 使用场景

当学生需要完成以下任务时使用：

- 系统架构设计
- 技术选型
- 功能模块设计
- UI 原型和页面流程设计
- 数据库 E-R 图和数据表设计
- 接口、权限和业务状态设计
- 系统设计说明书编写

## 工作流程

1. 阅读需求分析说明书。
2. 建立需求与设计之间的对应关系。
3. 设计系统架构和技术方案。
4. 划分功能模块。
5. 设计页面原型和页面流程。
6. 设计数据库。
7. 设计接口、权限和业务状态。
8. 检查设计是否覆盖全部必做需求。

## 约束

- 不得脱离需求文档随意扩展功能。
- 未确认的信息必须标记为待确认。
- 技术方案应符合学生现有基础和课程周期。
```

### name 要求

`name` 应满足：

* 使用小写英文字母
* 单词之间使用连字符
* 与技能目录名保持一致
* 不使用空格和中文

正确示例：

```yaml
name: system-design
```

对应目录：

```text
skills/system-design/
```

### description 要求

`description` 应说明：

1. 这个 Skill 能做什么。
2. 在什么任务中使用。
3. 哪些典型场景会触发该 Skill。
4. 必要时说明不适用的任务。

不要只写：

```yaml
description: 系统设计技能
```

推荐写法：

```yaml
description: "Guide students through system architecture, technical selection, functional modules, UI prototypes, database design, interfaces, permissions, and business-state design. Use when a student needs to design or review a course software project before implementation."
```

---

## 九、添加新的 Skill

### 1. 创建技能目录

```bash
mkdir -p skills/system-design
```

### 2. 创建 SKILL.md

```bash
touch skills/system-design/SKILL.md
```

### 3. 添加参考资料

```bash
mkdir -p skills/system-design/references
```

可以添加：

```text
references/
├── system-design-spec-template.md
└── design-consistency-checklist.md
```

### 4. 添加脚本

Skill 需要自动检查或处理文件时，可以创建：

```bash
mkdir -p skills/system-design/scripts
```

例如：

```text
scripts/
└── validate-design.js
```

### 5. 本地检查

```bash
node bin/install.js --list
```

如果 `name`、`description` 或目录结构存在问题，安装器会给出错误提示。

---

## 十、本地开发与测试

### 1. 安装依赖

当前安装器只使用 Node.js 内置模块，一般不需要安装第三方依赖。

### 2. 检查 npm 打包内容

在 `ai_skills` 目录中执行：

```bash
npm pack --dry-run
```

需要确认打包内容至少包括：

```text
package.json
README.md
bin/install.js
skills/
```

不要把整个电子教材和无关文件发布到 npm。

### 3. 测试技能列表

```bash
node bin/install.js --list
```

### 4. 模拟安装

进入一个测试项目：

```bash
cd /path/to/test-project
```

运行：

```bash
node /path/to/software-project-training-docs/ai_skills/bin/install.js --dry-run
```

### 5. 执行本地安装

```bash
node /path/to/software-project-training-docs/ai_skills/bin/install.js
```

### 6. 检查安装结果

```bash
find .trae/skills -name SKILL.md
```

还可以检查生成的规则：

```bash
cat .trae/rules/software-project-training-skills.md
```

### 7. 测试卸载

```bash
node /path/to/software-project-training-docs/ai_skills/bin/install.js --uninstall
```

---

## 十一、发布到 npm

### 1. 登录 npm

```bash
npm login
```

查看当前登录用户：

```bash
npm whoami
```

### 2. 检查 package.json

示例：

```json
{
  "name": "@dedeguo/software-project-training-skills",
  "version": "0.1.0",
  "description": "《软件开发综合项目实训》课程 TRAE Skills 技能包",
  "type": "module",
  "bin": {
    "software-project-training-skills": "bin/install.js"
  },
  "files": [
    "bin/",
    "skills/",
    "README.md",
    "LICENSE"
  ],
  "engines": {
    "node": ">=18"
  },
  "keywords": [
    "trae",
    "skills",
    "software-project-training",
    "ai-coding",
    "education"
  ],
  "license": "MIT",
  "publishConfig": {
    "access": "public"
  }
}
```

### 3. 增加脚本执行权限

在 macOS 或 Linux 中执行：

```bash
chmod +x bin/install.js
```

### 4. 检查发布内容

```bash
npm pack --dry-run
```

### 5. 发布

```bash
npm publish --access public
```

发布成功后，学生即可使用：

```bash
npx @dedeguo/software-project-training-skills
```

---

## 十二、版本更新

修改 Skill 后，需要升级 `package.json` 中的版本号。

### 修复错误

```bash
npm version patch
```

例如：

```text
0.1.0 → 0.1.1
```

### 增加兼容功能或新 Skill

```bash
npm version minor
```

例如：

```text
0.1.0 → 0.2.0
```

### 存在不兼容变更

```bash
npm version major
```

例如：

```text
0.1.0 → 1.0.0
```

然后重新发布：

```bash
npm publish --access public
```

---

## 十三、常见问题

### 1. 安装后 TRAE 没有识别 Skill

请检查：

```text
.trae/skills/<skill-name>/SKILL.md
```

确认 `SKILL.md` 直接位于技能目录下，而不是多嵌套了一层。

正确结构：

```text
.trae/skills/topic-selection/SKILL.md
```

错误结构：

```text
.trae/skills/software-project-training-skills/topic-selection/SKILL.md
```

完成检查后，重新打开 TRAE 项目或创建新会话。

### 2. 提示 name 与目录名不一致

例如目录为：

```text
skills/requirements-analysis/
```

则 `SKILL.md` 中必须写：

```yaml
name: requirements-analysis
```

### 3. 重复安装会不会删除其他 Skill

不会。

安装器只会覆盖本 npm 包中同名的 Skill，例如：

```text
topic-selection
requirements-analysis
requirements-review
system-design
system-design-review
```

不会清空整个：

```text
.trae/skills/
```

### 4. 如何恢复某个被修改的课程 Skill

重新运行：

```bash
npx @dedeguo/software-project-training-skills@latest
```

安装器会用 npm 包中的版本覆盖同名 Skill。

### 5. 可以只安装一个 Skill 吗

当前版本默认安装技能包中的全部 Skills。

如后续需要，可以为安装器增加：

```bash
--skill topic-selection
```

或：

```bash
--only topic-selection,requirements-analysis
```

### 6. 可以安装到全局 TRAE Skills 目录吗

当前安装器定位为课程项目级安装，只安装到：

```text
当前项目/.trae/skills/
```

这样可以保证：

* 不同课程项目之间互不影响
* 学生提交项目时可以保留项目规则
* 教师能够检查项目中使用了哪些 Skills
* 技能版本可以随项目保持一致

---

## 十四、课程使用建议

教师可以要求学生在项目开始时执行：

```bash
npx @dedeguo/software-project-training-skills
```

之后按照课程阶段使用对应 Skill：

```text
项目选题
    ↓
topic-selection
    ↓
需求分析
    ↓
requirements-analysis
    ↓
提交前评审
    ↓
requirements-review
    ↓
系统设计
    ↓
system-design
    ↓
系统设计评审
    ↓
system-design-review
```

建议学生在使用 AI 时遵循以下原则：

1. 先提供真实项目材料，再让 AI 分析。
2. AI 提出的新增内容需要学生确认。
3. 未确认的业务规则不得直接写入正式文档。
4. AI 生成文档后必须由学生理解、检查和修改。
5. 学生应能够说明需求、设计和代码之间的对应关系。
6. 最终提交成果由学生本人负责。

---

## 十五、项目地址

电子教材仓库：

```text
https://github.com/dedeguo/software-project-training-docs
```

Skills 源目录：

```text
ai_skills/skills/
```

---

## 十六、许可证

本项目建议使用 MIT License。

课程资料、模板和示例可以根据实际教学要求补充使用说明。学生在提交课程项目时，应遵守学校课程规范、学术诚信要求和第三方软件许可证。

---

## 十七、维护者

陈德

《软件开发综合项目实训》课程教学资源
