#!/usr/bin/env node

/**
 * 《软件开发综合项目实训》TRAE Skills 安装器
 *
 * 默认行为：
 * 1. 从 npm 包内的 skills/ 目录查找所有合法 Skill。
 * 2. 将 Skill 安装到当前项目的 .trae/skills/。
 * 3. 生成 .trae/rules/software-project-training-skills.md。
 *
 * 支持命令：
 *   npx @dedeguo/software-project-training-skills
 *   npx @dedeguo/software-project-training-skills --list
 *   npx @dedeguo/software-project-training-skills --dry-run
 *   npx @dedeguo/software-project-training-skills --uninstall
 *   npx @dedeguo/software-project-training-skills --force
 *   npx @dedeguo/software-project-training-skills --help
 */

import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync
} from "node:fs";
import { homedir } from "node:os";
import {
  basename,
  dirname,
  join,
  resolve
} from "node:path";
import { fileURLToPath } from "node:url";

/* -------------------------------------------------------------------------- */
/* 基础配置                                                                    */
/* -------------------------------------------------------------------------- */

const currentFile = fileURLToPath(import.meta.url);
const currentDir = dirname(currentFile);

/**
 * install.js 位于：
 *
 * course_design/bin/install.js
 *
 * 所以包根目录是 bin 的上一级。
 */
const packageRoot = resolve(currentDir, "..");

/**
 * npm 包中的 Skill 源目录。
 */
const sourceSkillsDir = join(packageRoot, "skills");

/**
 * 默认安装到执行命令时所在的项目目录。
 */
const projectRoot = resolve(process.cwd());

/**
 * TRAE 项目级目录。
 */
const traeRootDir = join(projectRoot, ".trae");
const targetSkillsDir = join(traeRootDir, "skills");
const targetRulesDir = join(traeRootDir, "rules");

/**
 * 本安装器生成的规则文件。
 *
 * 卸载时只删除该文件，不影响用户自己的其他 Rules。
 */
const bootstrapRuleFilename =
  "software-project-training-skills.md";

const bootstrapRulePath = join(
  targetRulesDir,
  bootstrapRuleFilename
);

const packageJsonPath = join(packageRoot, "package.json");

/* -------------------------------------------------------------------------- */
/* 命令行参数                                                                  */
/* -------------------------------------------------------------------------- */

const args = new Set(process.argv.slice(2));

const options = {
  help: args.has("--help") || args.has("-h"),
  list: args.has("--list"),
  uninstall: args.has("--uninstall"),
  dryRun: args.has("--dry-run"),
  force: args.has("--force")
};

/* -------------------------------------------------------------------------- */
/* 控制台输出                                                                  */
/* -------------------------------------------------------------------------- */

function logInfo(message) {
  console.log(message);
}

function logSuccess(message) {
  console.log(`✓ ${message}`);
}

function logWarning(message) {
  console.warn(`⚠ ${message}`);
}

function logError(message) {
  console.error(`✗ ${message}`);
}

/* -------------------------------------------------------------------------- */
/* 工具方法                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * 安全读取文本文件。
 *
 * @param {string} filePath 文件路径
 * @returns {string}
 */
function readTextFile(filePath) {
  return readFileSync(filePath, "utf8");
}

/**
 * 读取 package.json。
 *
 * @returns {{
 *   name?: string,
 *   version?: string,
 *   description?: string
 * }}
 */
function readPackageJson() {
  if (!existsSync(packageJsonPath)) {
    return {};
  }

  try {
    return JSON.parse(readTextFile(packageJsonPath));
  } catch (error) {
    throw new Error(
      `无法读取 package.json：${
        error instanceof Error
          ? error.message
          : String(error)
      }`
    );
  }
}

/**
 * 去掉字符串两侧的单引号或双引号。
 *
 * @param {string} value
 * @returns {string}
 */
function removeWrappingQuotes(value) {
  const trimmed = value.trim();

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }

  return trimmed;
}

/**
 * 解析 SKILL.md 开头的简单 YAML Front Matter。
 *
 * 当前只读取 name 和 description。
 *
 * @param {string} content
 * @returns {{
 *   name: string,
 *   description: string
 * }}
 */
function parseSkillFrontMatter(content) {
  const normalized = content.replace(/^\uFEFF/, "");

  const match = normalized.match(
    /^---\s*\r?\n([\s\S]*?)\r?\n---(?:\s*\r?\n|$)/
  );

  if (!match) {
    throw new Error(
      "SKILL.md 缺少有效的 YAML Front Matter"
    );
  }

  const frontMatter = match[1];

  const nameMatch = frontMatter.match(
    /^name:\s*(.+?)\s*$/m
  );

  const descriptionMatch = frontMatter.match(
    /^description:\s*(.+?)\s*$/m
  );

  const name = nameMatch
    ? removeWrappingQuotes(nameMatch[1])
    : "";

  const description = descriptionMatch
    ? removeWrappingQuotes(descriptionMatch[1])
    : "";

  return {
    name,
    description
  };
}

/**
 * 将 Markdown 表格单元格中的特殊内容转义。
 *
 * @param {string} value
 * @returns {string}
 */
function escapeMarkdownTableCell(value) {
  return value
    .replace(/\r?\n/g, " ")
    .replace(/\|/g, "\\|")
    .trim();
}

/**
 * 判断是否处于用户主目录。
 *
 * @returns {boolean}
 */
function isUserHomeDirectory() {
  return projectRoot === resolve(homedir());
}

/**
 * 检查执行目录是否适合作为项目目录。
 */
function validateProjectRoot() {
  if (isUserHomeDirectory() && !options.force) {
    throw new Error(
      [
        "当前命令在用户主目录中执行。",
        "为避免把 .trae/skills 安装到错误位置，安装已停止。",
        "",
        "请先进入具体项目目录：",
        "",
        "  cd /path/to/your-project",
        "  npx @dedeguo/software-project-training-skills",
        "",
        "确认需要安装到当前目录时，可以使用：",
        "",
        "  npx @dedeguo/software-project-training-skills --force"
      ].join("\n")
    );
  }
}

/**
 * 获取所有合法 Skill。
 *
 * 合法条件：
 * 1. skills/ 下的直接子目录；
 * 2. 子目录中存在 SKILL.md；
 * 3. SKILL.md 包含 name 和 description；
 * 4. name 与目录名相同。
 *
 * @returns {Array<{
 *   directoryName: string,
 *   name: string,
 *   description: string,
 *   sourceDir: string,
 *   skillFile: string
 * }>}
 */
function discoverSkills() {
  if (!existsSync(sourceSkillsDir)) {
    throw new Error(
      `没有找到 Skills 源目录：${sourceSkillsDir}`
    );
  }

  const entries = readdirSync(sourceSkillsDir, {
    withFileTypes: true
  });

  const skills = [];
  const validationErrors = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const directoryName = entry.name;
    const sourceDir = join(
      sourceSkillsDir,
      directoryName
    );

    const skillFile = join(sourceDir, "SKILL.md");

    if (!existsSync(skillFile)) {
      /*
       * 没有 SKILL.md 的目录不是 Skill，直接忽略。
       */
      continue;
    }

    try {
      const content = readTextFile(skillFile);
      const metadata = parseSkillFrontMatter(content);

      if (!metadata.name) {
        throw new Error("缺少 name 字段");
      }

      if (!metadata.description) {
        throw new Error("缺少 description 字段");
      }

      if (metadata.name !== directoryName) {
        throw new Error(
          [
            `目录名为 "${directoryName}"，`,
            `但 SKILL.md 中的 name 为 "${metadata.name}"。`,
            "两者必须保持一致。"
          ].join("")
        );
      }

      skills.push({
        directoryName,
        name: metadata.name,
        description: metadata.description,
        sourceDir,
        skillFile
      });
    } catch (error) {
      validationErrors.push(
        `${directoryName}：${
          error instanceof Error
            ? error.message
            : String(error)
        }`
      );
    }
  }

  if (validationErrors.length > 0) {
    throw new Error(
      [
        "以下 Skill 校验失败：",
        "",
        ...validationErrors.map(
          (message) => `- ${message}`
        )
      ].join("\n")
    );
  }

  if (skills.length === 0) {
    throw new Error(
      `在 ${sourceSkillsDir} 中没有发现合法的 Skill。`
    );
  }

  return skills.sort((a, b) =>
    a.name.localeCompare(b.name, "en")
  );
}

/**
 * 显示 Skill 列表。
 *
 * @param {ReturnType<typeof discoverSkills>} skills
 */
function printSkillList(skills) {
  logInfo("");
  logInfo(`发现 ${skills.length} 个 Skills：`);
  logInfo("");

  for (const skill of skills) {
    logInfo(`- ${skill.name}`);
    logInfo(`  ${skill.description}`);
  }

  logInfo("");
}

/**
 * 创建目录。
 *
 * @param {string} directory
 */
function ensureDirectory(directory) {
  if (options.dryRun) {
    logInfo(`[dry-run] 创建目录：${directory}`);
    return;
  }

  mkdirSync(directory, {
    recursive: true
  });
}

/**
 * 删除指定路径。
 *
 * @param {string} targetPath
 */
function removePath(targetPath) {
  if (!existsSync(targetPath)) {
    return;
  }

  if (options.dryRun) {
    logInfo(`[dry-run] 删除：${targetPath}`);
    return;
  }

  rmSync(targetPath, {
    recursive: true,
    force: true
  });
}

/**
 * 复制目录。
 *
 * @param {string} source
 * @param {string} target
 */
function copyDirectory(source, target) {
  if (options.dryRun) {
    logInfo(`[dry-run] 复制：${source}`);
    logInfo(`[dry-run] 到：  ${target}`);
    return;
  }

  cpSync(source, target, {
    recursive: true,
    force: true,
    errorOnExist: false
  });
}

/**
 * 写入文本文件。
 *
 * @param {string} targetPath
 * @param {string} content
 */
function writeTextFile(targetPath, content) {
  if (options.dryRun) {
    logInfo(`[dry-run] 写入文件：${targetPath}`);
    return;
  }

  writeFileSync(targetPath, content, "utf8");
}

/* -------------------------------------------------------------------------- */
/* TRAE Rule 生成                                                              */
/* -------------------------------------------------------------------------- */

/**
 * 生成 TRAE 项目规则。
 *
 * 该规则用于提醒 TRAE：
 * 1. 优先匹配本项目已安装的 Skills；
 * 2. 读取对应 SKILL.md；
 * 3. 按照 Skill 的流程执行；
 * 4. 不替学生虚构项目材料。
 *
 * @param {ReturnType<typeof discoverSkills>} skills
 * @param {{name?: string, version?: string}} packageInfo
 * @returns {string}
 */
function generateBootstrapRule(skills, packageInfo) {
  const packageName =
    packageInfo.name ||
    "@dedeguo/software-project-training-skills";

  const packageVersion =
    packageInfo.version || "unknown";

  const tableRows = skills
    .map((skill) => {
      const name = escapeMarkdownTableCell(
        skill.name
      );

      const description =
        escapeMarkdownTableCell(
          skill.description
        );

      return `| \`${name}\` | ${description} |`;
    })
    .join("\n");

  const skillSequence = skills
    .map(
      (skill, index) =>
        `${index + 1}. \`${skill.name}\``
    )
    .join("\n");

  return `---
alwaysApply: true
---

# 软件开发综合项目实训 Skills

本项目已安装《软件开发综合项目实训》课程技能包。

- npm 包：\`${packageName}\`
- 安装版本：\`${packageVersion}\`
- Skills 目录：\`.trae/skills/\`

## 基本使用规则

处理用户任务前，先判断任务是否与下方某个 Skill 的适用场景匹配。

匹配时必须：

1. 读取对应的 \`.trae/skills/<skill-name>/SKILL.md\`；
2. 根据需要读取该 Skill 下的 \`references/\`、\`scripts/\` 或其他资源；
3. 遵循 Skill 中规定的流程、约束和输出要求；
4. 优先读取用户已经提供的项目材料、需求文档、设计文档和代码；
5. 不把 AI 推测写成用户已经确认的事实；
6. 不虚构调研、用户访谈、教师意见、业务规则或项目数据；
7. 信息不足时明确标注“待确认”，不要自行补齐关键事实；
8. 不得因为使用了 Skill 而忽略用户当前的明确要求。

## 已安装 Skills

| Skill | 适用场景 |
| --- | --- |
${tableRows}

## Skill 选择原则

- 用户明确指定 Skill 时，优先读取指定 Skill。
- 用户未指定时，根据各 Skill 的 \`description\` 自动匹配。
- 只读取与当前任务相关的 Skill，不要机械加载全部 Skills。
- 多个 Skill 同时适用时，先使用上游阶段 Skill，再使用下游阶段 Skill。
- 评审类 Skill 主要用于检查和提出修改建议，不替学生或教师做最终决定。

## 当前技能清单

${skillSequence}

## 显式调用示例

用户可以使用以下方式明确指定技能：

\`\`\`text
使用 topic-selection Skill 帮我比较三个项目选题。
\`\`\`

\`\`\`text
使用 requirements-analysis Skill 帮我梳理需求。
\`\`\`

\`\`\`text
使用 requirements-review Skill 检查立项书和需求分析说明书。
\`\`\`

## 更新说明

当课程技能包升级后，可在项目根目录重新运行：

\`\`\`bash
npx ${packageName}@latest
\`\`\`

安装器只覆盖本技能包中同名的 Skill，不会删除用户自行创建的其他 Skills。
`;
}

/* -------------------------------------------------------------------------- */
/* 安装                                                                        */
/* -------------------------------------------------------------------------- */

/**
 * 安装全部 Skills。
 *
 * @param {ReturnType<typeof discoverSkills>} skills
 */
function installSkills(skills) {
  ensureDirectory(targetSkillsDir);

  for (const skill of skills) {
    const targetDir = join(
      targetSkillsDir,
      skill.directoryName
    );

    /*
     * 只删除本次要安装的同名 Skill。
     * 不删除整个 .trae/skills。
     */
    removePath(targetDir);
    copyDirectory(skill.sourceDir, targetDir);

    if (!options.dryRun) {
      logSuccess(`已安装 Skill：${skill.name}`);
    }
  }
}

/**
 * 生成并安装规则文件。
 *
 * @param {ReturnType<typeof discoverSkills>} skills
 * @param {{name?: string, version?: string}} packageInfo
 */
function installBootstrapRule(
  skills,
  packageInfo
) {
  ensureDirectory(targetRulesDir);

  const ruleContent = generateBootstrapRule(
    skills,
    packageInfo
  );

  writeTextFile(
    bootstrapRulePath,
    ruleContent
  );

  if (!options.dryRun) {
    logSuccess(
      `已生成 TRAE Rule：${bootstrapRulePath}`
    );
  }
}

/**
 * 执行安装。
 *
 * @param {ReturnType<typeof discoverSkills>} skills
 * @param {{name?: string, version?: string}} packageInfo
 */
function install(skills, packageInfo) {
  logInfo("");
  logInfo(
    `准备向项目安装 ${skills.length} 个 TRAE Skills。`
  );
  logInfo(`项目目录：${projectRoot}`);
  logInfo("");

  installSkills(skills);
  installBootstrapRule(skills, packageInfo);

  logInfo("");

  if (options.dryRun) {
    logInfo(
      "模拟安装完成，未对文件系统进行修改。"
    );
    return;
  }

  logSuccess("全部 Skills 安装完成");
  logInfo("");
  logInfo(`Skills 目录：${targetSkillsDir}`);
  logInfo(`Rule 文件：${bootstrapRulePath}`);
  logInfo("");
  logInfo(
    "建议重新打开 TRAE 项目，或新建一个对话会话后使用。"
  );
}

/* -------------------------------------------------------------------------- */
/* 卸载                                                                        */
/* -------------------------------------------------------------------------- */

/**
 * 卸载本 npm 包提供的 Skills。
 *
 * 只删除：
 * 1. 当前包中列出的同名 Skill 目录；
 * 2. 本安装器生成的 Rule 文件。
 *
 * 不删除其他自定义 Skill 和 Rule。
 *
 * @param {ReturnType<typeof discoverSkills>} skills
 */
function uninstall(skills) {
  logInfo("");
  logInfo(
    `准备从项目中卸载 ${skills.length} 个 TRAE Skills。`
  );
  logInfo(`项目目录：${projectRoot}`);
  logInfo("");

  let removedCount = 0;

  for (const skill of skills) {
    const targetDir = join(
      targetSkillsDir,
      skill.directoryName
    );

    if (!existsSync(targetDir)) {
      logWarning(
        `未找到 Skill，跳过：${skill.name}`
      );
      continue;
    }

    removePath(targetDir);
    removedCount += 1;

    if (!options.dryRun) {
      logSuccess(`已删除 Skill：${skill.name}`);
    }
  }

  if (existsSync(bootstrapRulePath)) {
    removePath(bootstrapRulePath);

    if (!options.dryRun) {
      logSuccess(
        `已删除 TRAE Rule：${bootstrapRuleFilename}`
      );
    }
  } else {
    logWarning(
      `未找到 Rule 文件：${bootstrapRuleFilename}`
    );
  }

  logInfo("");

  if (options.dryRun) {
    logInfo(
      "模拟卸载完成，未对文件系统进行修改。"
    );
    return;
  }

  logSuccess(
    `卸载完成，共删除 ${removedCount} 个 Skills`
  );
}

/* -------------------------------------------------------------------------- */
/* 帮助                                                                        */
/* -------------------------------------------------------------------------- */

function printHelp() {
  const packageInfo = readPackageJson();

  const packageName =
    packageInfo.name ||
    "@dedeguo/software-project-training-skills";

  logInfo(`
《软件开发综合项目实训》TRAE Skills 安装器

用法：

  npx ${packageName}
  npx ${packageName} [选项]

选项：

  --list        显示 npm 包中包含的 Skills
  --dry-run     模拟执行，不修改任何文件
  --uninstall   卸载本技能包安装的 Skills
  --force       允许在用户主目录中执行
  --help, -h    显示帮助信息

安装位置：

  当前项目/.trae/skills/
  当前项目/.trae/rules/${bootstrapRuleFilename}

示例：

  # 安装
  npx ${packageName}

  # 查看包含哪些 Skills
  npx ${packageName} --list

  # 模拟安装
  npx ${packageName} --dry-run

  # 更新到最新版
  npx ${packageName}@latest

  # 卸载
  npx ${packageName} --uninstall
`);
}

/* -------------------------------------------------------------------------- */
/* 主程序                                                                      */
/* -------------------------------------------------------------------------- */

function main() {
  if (options.help) {
    printHelp();
    return;
  }

  validateProjectRoot();

  const packageInfo = readPackageJson();
  const skills = discoverSkills();

  const packageName =
    packageInfo.name ||
    "@dedeguo/software-project-training-skills";

  const packageVersion =
    packageInfo.version || "unknown";

  logInfo("");
  logInfo(
    `${packageName} v${packageVersion}`
  );

  if (options.list) {
    printSkillList(skills);
    return;
  }

  if (options.uninstall) {
    uninstall(skills);
    return;
  }

  install(skills, packageInfo);
}

try {
  main();
} catch (error) {
  logInfo("");

  logError(
    error instanceof Error
      ? error.message
      : String(error)
  );

  logInfo("");
  process.exitCode = 1;
}