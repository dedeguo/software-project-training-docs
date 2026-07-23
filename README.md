# 软件开发综合项目实训

> 《软件开发综合项目实训——AI 辅助的软件项目开发》课程资源仓库

[![Website](https://img.shields.io/badge/在线教程-project--ai.chende.top-indigo?style=flat-square&logo=materialformkdocs)](https://project-ai.chende.top/)
[![GitHub](https://img.shields.io/badge/仓库-GitHub-181717?style=flat-square&logo=github)](https://github.com/dedeguo/software-project-training-docs)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](#许可证)
[![Made with MkDocs Material](https://img.shields.io/badge/MkDocs-Material-526CFE?style=flat-square&logo=materialformkdocs)](https://squidfunk.github.io/mkdocs-material/)

本仓库同时维护面向学生的电子教程，以及面向教师的课程建设资料和 AI Skills。课程面向计算机科学与技术专业，以 **Spring Boot 单体项目 + 数据库 + 前端 + 接口测试 + Git + 部署** 为技术主线，将 AI 辅助编程融入选题、需求分析、系统设计、编码、测试、部署和项目答辩全过程。

## 在线访问

| 资源 | 地址 |
| :--- | :--- |
| 学生电子教程 | <https://project-ai.chende.top/> |
| 相关课程 · Java Web 开发技术 | <https://javaweb.chende.top/> |

## 课程简介

如果把学编程比作学做菜：

- **传统课堂**：老师做一道番茄炒蛋，你照着炒一盘一模一样的。
- **本课程**：给你灶台、食材和一本菜谱手册，你自己选一道菜、自己调味、自己端上桌，最终做出一道**属于你自己的拿手菜**。

课程不要求学生复制一个管理系统，而是从真实问题出发，借助 Trae 等 AI 编程工具，经历**选题、需求、设计、编码、测试、部署和答辩**，完成一个能够运行、能够展示、能够讲清楚的软件作品。

## 课程目标

- 完成一个可运行、可部署、可演示的软件项目；
- 掌握需求分析、系统设计、编码、测试和部署的基本流程；
- 学会使用 Trae 等 AI 编程工具协助项目开发；
- 能够审查、调试和验证 AI 生成的代码；
- 将实训成果转化为毕业设计基础或求职项目经历。

## 课程资源体系

```text
software-project-training-docs/
│
├── .github/workflows/         GitHub Actions 自动部署
│
├── docs/                      学生电子教材（MkDocs）
│   ├── guide/                 课程导学、学习路线与 AI 协作规范
│   ├── chapter01/             第一篇：AI 协同开发实战
│   ├── chapter02/             第二篇：项目选题与需求分析
│   ├── chapter03/             第三篇：原型与系统设计
│   ├── projects/              项目选题库
│   ├── doc-templates/         文档与任务模板
│   └── assets/                教程图片资源
│
├── course/                    教师课程建设资料
│   ├── teaching-plan/         课程教学方案（大纲、实施方案、能力培养）
│   ├── project-cases/         教学项目案例体系
│   └── notes/                 教学参考笔记
│
├── ai_skills/                 TRAE AI Skills 技能包（npm 包源码）
│   ├── bin/                   安装器
│   └── skills/                选题、需求分析与需求评审 Skills
│
├── mkdocs.yml                 电子教程站点配置
├── requirements.txt           Python 构建依赖
└── README.md
```

| 目录 | 面向对象 | 主要用途 |
| :--- | :--- | :--- |
| `docs/` | 学生 | 学习项目开发流程，完成项目过程文档与阶段任务 |
| `course/` | 教师 | 进行课程准备、教学实施、项目组织与课程改革 |
| `ai_skills/` | 教师、学生 | 在 Trae 中配置 AI 助手，辅助选题、需求分析和文档评审 |

## 学生电子教程结构

电子教程由三篇组成，每一篇聚焦一个核心问题：

| 篇章 | 主题 | 主要问题 | 阶段成果 |
| :--- | :--- | :--- | :--- |
| 第一篇 | AI 协同开发实战 | 怎样用 AI 完成一个真实项目？ | 体验系统、规则与 Skills、分步开发、测试与部署 |
| 第二篇 | 项目选题与需求分析 | 做什么、为什么做、做到什么程度？ | 《项目选题立项书》《需求分析说明书》 |
| 第三篇 | 原型与系统设计 | 准备怎样实现？ | 架构图、原型、E-R 图、接口、权限与《系统设计说明书》 |

此外提供项目选题库，以及各阶段可直接套用的文档与任务模板。

## 教师课程建设资料

`course/` 用于保存课程建设和教学实施所需的教师参考资料，主要包括：

- **课程教学方案**（`teaching-plan/`）：课程目标与能力培养、课程实施方案、教学大纲等；
- **项目案例体系**（`project-cases/`）：教学项目案例及其使用方案；
- **教学参考笔记**（`notes/`）：软件工程、请求响应等教学内容参考。

这些资料与学生电子教程、AI Skills 相互配合，共同支持课程准备、课堂教学、阶段指导和项目评价。

## 教师提供的 AI Skills

为帮助基础较弱的同学完成项目过程文档，教师将 `ai_skills/skills/` 中的 Skill 整理为可复用的技能包，并发布为 npm 包，学生可在项目目录中一键安装：

```bash
npx @dedeguo/software-project-training-skills
```

安装后，Skills 会被复制到当前项目的 `.trae/skills/`，并生成课程技能调用规则。详见 [ai_skills/README.md](ai_skills/README.md)。

| Skill | 主要作用 | 适用阶段 |
| :--- | :--- | :--- |
| `topic-selection` | 引导选题、比较候选题目、控制范围 | 选题、撰写立项书 |
| `requirements-analysis` | 引导梳理用户、场景、功能、规则与验收条件 | 撰写《需求分析说明书》 |
| `requirements-review` | 审查需求文档的完整性、一致性与可测试性 | 需求评审与提交前自查 |

AI 用于辅助分析、生成初稿和检查遗漏；学生仍须基于真实调研和项目情况确认内容，对最终成果负责。

## 技术栈

课程推荐以下技术路线，但不“一刀切”——若已熟悉 Servlet、JDBC、HTML、CSS、JavaScript 等，也可根据项目需要选择使用。

| 层次 | 推荐技术 |
| :--- | :--- |
| 开发工具 | Trae、Git、Apifox |
| 后端 | JDK 17、Spring Boot 3、Maven、MyBatis |
| 数据库 | MySQL 或 openGauss |
| 前端 | Vue 3 或适合项目的其他方案 |
| 部署 | Linux、Nginx，Docker 作为进阶选项 |
| 文档站点 | MkDocs + Material 主题 |

评价重点不是“是否用了最流行的框架”，而是：项目是否真正运行、业务流程是否完整、代码是否能够理解和解释、是否进行真实测试和问题修复、是否完成版本管理、部署和成果交付。

## 快速开始

### 本地预览电子教程

```bash
pip install -r requirements.txt
mkdocs serve
```

浏览器访问：<http://127.0.0.1:8000>

### 构建网站

```bash
mkdocs build --strict
```

推送到 `main` 分支后，GitHub Actions 将自动构建并发布到 `gh-pages` 分支。

### 在项目中安装 AI Skills

```bash
cd /path/to/student-project
npx @dedeguo/software-project-training-skills
```

其他命令（查看列表、模拟安装、卸载等）见 [ai_skills/README.md](ai_skills/README.md)。

## 贡献指南

欢迎通过 Issue 或 Pull Request 反馈问题、补充内容或改进教程。提交时请注意：

1. 教程正文放在 `docs/` 下对应篇章目录；
2. 教师教学资料放在 `course/` 下对应子目录；
3. AI 技能放在 `ai_skills/skills/` 下独立目录，并保证 `SKILL.md` 的 `name` 与目录名一致；
4. 保持教师资源、学生资源、AI 工具三类内容相互独立，便于长期维护。

## 许可证

本项目采用 [MIT License](https://opensource.org/licenses/MIT)。

课程资料、模板和示例可根据实际教学要求补充使用说明。学生在提交课程项目时，应遵守学校课程规范、学术诚信要求和第三方软件许可证。

## 相关课程

- [Java Web 开发技术电子教材](https://javaweb.chende.top/)
