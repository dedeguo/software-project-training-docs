# 4.1 启动项目：选择并运行课程脚手架

## 先把项目真正运行起来，再开始开发自己的业务

!!! quote "脚手架不是最终项目，而是已经搭好的工程起点"
    从空目录开始配置前端、后端、数据库、登录、异常处理和项目结构，往往会花费大量时间，也容易因为环境问题迟迟无法进入业务开发。

    本课程提供两套能够直接运行的脚手架。你只需要根据自己的技术基础选择其中一套，完成环境配置、数据库初始化和启动验证。下一节再根据《系统设计说明书》把它改造成自己的项目。

!!! tip "本节学习目标"
    选择适合自己的课程脚手架，理解其主要目录和已有能力，在本机完成数据库初始化、项目启动、登录和示例功能验证，并使用 Git 记录第一个可运行版本。

[返回第四篇导读](index.md){ .md-button }
[进入下一节：改造工程](02-project-customization.md){ .md-button .md-button--primary }

---

## 🎯 本节完成后，你要交付

| 成果 | 要求 |
| :--- | :--- |
| 脚手架选择记录 | 说明选择哪套脚手架，以及为什么适合自己的项目和技术基础 |
| 本地项目仓库 | 从课程仓库获取代码，保留清楚的项目目录 |
| 可运行开发环境 | 数据库、后端和前端或静态页面能够正常运行 |
| 启动验证记录 | 记录环境版本、启动命令、访问地址、登录结果和遇到的问题 |
| 第一次 Git 提交 | 提交可运行的初始版本，不包含密码、缓存和构建产物 |

本节暂时不要修改业务名称、数据表和示例模块。先保存一个确认能够运行的初始状态，下一节才能判断后续问题来自脚手架、环境还是自己的修改。

---

## 🧰 第一步：认识课程提供的两套脚手架

两套脚手架都提供了真实项目需要的基础结构，不需要同时学习和运行。根据第三篇确认的技术方案选择其中一套即可。

| 对比项 | Spring Boot + Vue 脚手架 | Servlet + 原生前端脚手架 |
| :--- | :--- | :--- |
| 适合对象 | 已有 Spring Boot 或 Vue 基础，希望采用前后端分离 | 正在学习 Java Web，希望理解 Servlet、Session 和 JDBC |
| 后端 | Spring Boot 3、MyBatis-Plus | Jakarta Servlet、原生 JDBC |
| 前端 | Vue 3、Element Plus、Axios、Pinia | HTML、CSS、JavaScript、Fetch |
| 身份认证 | JWT | Session + Cookie + Filter |
| 数据库 | MySQL 8 | MySQL 8 |
| 项目形态 | 前后端两个子工程 | 一个 WAR Web 工程 |
| 推荐运行方式 | 后端 Maven + 前端 Vite | IDEA + Smart Tomcat + Tomcat 11 |
| 学习重点 | 前后端分离、REST API、组件化页面 | Web 请求流程、Servlet 分层、会话与过滤器 |

### 路线 A：Spring Boot + Vue

- 课程资料本地目录：`scaffold-springboot/`
- 远程仓库：[scaffold-springboot](https://gitee.com/javaweb-dev-tech/scaffold-springboot)

脚手架已经提供：

- 登录、注册和当前用户查询；
- JWT 身份认证和角色检查；
- 一个包含分页的 `DemoItem` 增删改查示例；
- 统一响应、参数校验和全局异常处理；
- Spring Boot、MyBatis-Plus、Druid 和 Flyway 配置；
- Vue 路由、请求封装、用户状态和基础页面组件；
- 数据库脚本、Postman 集合、Docker 和 Nginx 配置；
- 需求、设计、测试和项目说明文档骨架；
- 面向 AI 编程工具的 `AGENTS.md`。

### 路线 B：Servlet + HTML + CSS + JavaScript

- 课程资料本地目录：`scaffold-servlet/`
- 远程仓库：[scaffold-servlet](https://gitee.com/javaweb-dev-tech/scaffold-servlet)

脚手架已经提供：

- 登录、注册和 Session 会话；
- 登录过滤器和管理员权限过滤器；
- 一个 `DemoItem` 增删改查示例；
- 统一 JSON 响应和全局异常处理；
- Controller、Service、DAO、Entity、DTO 分层；
- JDBC、Druid、Jackson 和日志配置；
- 原生 HTML、CSS、JavaScript 与 Fetch 请求示例；
- 数据库脚本、Postman 集合、Docker 和 Nginx 配置；
- 需求、设计、测试和项目说明文档骨架；
- 面向 AI 编程工具的 `AGENTS.md`。

!!! warning "不要因为“听起来更高级”选择技术路线"
    Spring Boot + Vue 并不会自动让项目质量更高，Servlet 也不代表项目简单或落后。优先选择自己能够运行、调试、修改和解释的路线。选定后不要在开发中途随意更换技术栈。

---

## ✅ 第二步：完成共同的环境检查

开始克隆代码前，先在终端检查基础环境。

```bash
java -version
git --version
mysql --version
```

两套脚手架共同要求：

| 工具 | 建议版本 | 用途 |
| :--- | :--- | :--- |
| JDK | 17 | 编译和运行 Java 项目 |
| Git | 当前稳定版本 | 获取代码并记录开发过程 |
| MySQL | 8.0 | 保存用户和业务数据 |
| IDE | IntelliJ IDEA 或 Trae | 阅读、修改和运行项目 |

选择 Spring Boot + Vue 时还要检查：

```bash
mvn -version
node -v
npm -v
```

建议使用 Maven 3.9 或更高版本、Node.js 18 或更高版本。

选择 Servlet 路线时，还需要准备：

- Tomcat 11；
- IntelliJ IDEA；
- Smart Tomcat 插件，或其他能够运行 Jakarta Servlet 6 应用的方式。

### 建立环境检查记录

| 检查项 | 你的结果 | 是否满足 | 备注 |
| :--- | :--- | :---: | :--- |
| JDK | 【填写版本】 | 是 / 否 |  |
| Git | 【填写版本】 | 是 / 否 |  |
| MySQL | 【填写版本】 | 是 / 否 |  |
| Maven | 【填写版本】 | 是 / 否 / 不适用 |  |
| Node.js | 【填写版本】 | 是 / 否 / 不适用 |  |
| Tomcat | 【填写版本】 | 是 / 否 / 不适用 |  |

!!! info "先解决环境问题，不要让 AI 猜"
    如果命令无法执行，请保留完整报错、操作系统、工具版本和安装路径，再向教师或 AI 求助。只说“项目运行不了”，很难判断问题发生在哪一步。

---

## 📥 第三步：获取项目并保存初始版本

在准备存放课程项目的目录中，只克隆自己选择的一个仓库。

=== "Spring Boot + Vue"

    ```bash
    git clone https://gitee.com/javaweb-dev-tech/scaffold-springboot.git
    cd scaffold-springboot
    ```

=== "Servlet + 原生前端"

    ```bash
    git clone https://gitee.com/javaweb-dev-tech/scaffold-servlet.git
    cd scaffold-servlet
    ```

打开项目后，先阅读：

1. `README.md`：确认最新环境要求、启动命令和访问地址；
2. `AGENTS.md`：了解使用 AI 修改项目时必须遵守的规则；
3. `sql/init.sql`：确认数据库名称、数据表和示例账号；
4. `docs/`：了解后续需要逐步完善的课程文档；
5. `api/`：查看可以导入 Postman 的接口集合。

### 不要立即删除 `.git`

直接克隆课程仓库时，会保留脚手架原有提交历史。当前阶段可以先使用它完成运行验证。教师采用统一方式创建学生仓库时，再按课堂要求设置自己的远程仓库。

如果需要更换远程地址，先确认新的空仓库地址，再执行：

```bash
git remote -v
git remote set-url origin <你的仓库地址>
git remote -v
```

不要把他人的仓库地址、账号或访问令牌直接复制进教材命令或项目文件。

---

## 🚀 第四步：运行 Spring Boot + Vue 脚手架

如果你选择 Servlet 路线，可以直接跳到下方“第五步：运行 Servlet + 原生前端脚手架”。

### 4.1 初始化数据库

脚手架默认使用：

```text
数据库：scaffold
账号：root
密码：root
```

课程提供两种初始化方式。

方式一：手动导入脚本。

```bash
mysql -uroot -proot < sql/init.sql
```

方式二：使用 Flyway 自动迁移。开发配置已经启用 Flyway，后端连接数据库后会执行迁移脚本并写入示例数据。

!!! warning "默认数据库密码只用于课程脚手架"
    如果你的 MySQL 密码不是 `root`，请修改 `backend/src/main/resources/application-dev.yml` 中的本地开发配置。不要把真实服务器密码或个人密码提交到 Git 仓库。

### 4.2 启动后端

打开一个终端：

```bash
cd backend
mvn spring-boot:run
```

后端默认地址：

```text
http://localhost:8080
```

启动成功后不要立即关闭终端。观察日志中是否出现数据库连接、端口占用、迁移失败或编译错误。

### 4.3 启动前端

再打开一个终端：

```bash
cd frontend
npm install
npm run dev
```

前端默认地址：

```text
http://localhost:5173
```

### 4.4 验证已有功能

使用脚手架默认管理员账号登录：

```text
账号：admin
密码：admin123
```

至少完成：

- [ ] 打开登录页面；
- [ ] 使用管理员账号成功登录；
- [ ] 打开示例数据列表；
- [ ] 完成一次查询或翻页；
- [ ] 新增或编辑一条示例数据；
- [ ] 刷新页面后确认数据仍然存在；
- [ ] 退出登录后确认受限页面不能继续访问。

!!! failure "看到首页不等于项目已经运行成功"
    必须确认前端能够调用后端接口，后端能够真实读写 MySQL。刷新后数据消失、使用静态模拟数据或接口持续报错，都不能算完成运行验证。

---

## 🚀 第五步：运行 Servlet + 原生前端脚手架

### 5.1 初始化数据库

脚手架默认使用：

```text
数据库：scaffold_servlet
账号：root
密码：root
```

在项目根目录执行：

```bash
mysql -uroot -proot < sql/init.sql
```

脚本会创建用户表、示例业务表、一个管理员账号和示例数据。如果本机数据库账号或密码不同，请调整命令和 `src/main/resources/druid.properties`。

### 5.2 配置 Smart Tomcat

1. 使用 IntelliJ IDEA 打开脚手架根目录；
2. 等待 Maven 下载依赖；
3. 在插件市场安装 Smart Tomcat；
4. 打开 `Run → Edit Configurations`；
5. 新建 Smart Tomcat 配置；
6. 按下表设置运行参数。

| 配置项 | 建议值 |
| :--- | :--- |
| Tomcat Server | 本地 Tomcat 11 安装目录 |
| Deployment Directory | `src/main/webapp` |
| Context Path | `/scaffold-servlet` |
| Server Port | `8080` |

点击运行后访问：

```text
http://localhost:8080/scaffold-servlet/
```

### 5.3 验证已有功能

使用默认管理员账号登录：

```text
账号：admin
密码：admin123
```

至少完成：

- [ ] 打开登录页面；
- [ ] 使用管理员账号成功登录；
- [ ] 打开示例数据管理页面；
- [ ] 完成一次查询；
- [ ] 新增或编辑一条示例数据；
- [ ] 刷新页面后确认数据仍然存在；
- [ ] 退出登录后确认管理页面受到保护。

### 5.4 命令行验证

Servlet 工程提供 Maven Wrapper，也可以先运行测试和打包检查。

macOS 或 Linux：

```bash
./mvnw test
./mvnw clean package
```

Windows：

```powershell
mvnw.cmd test
mvnw.cmd clean package
```

打包成功后会生成：

```text
target/scaffold-servlet.war
```

命令行打包成功不能代替浏览器验证；浏览器能够访问首页也不能代替数据库读写验证，两者都应完成。

---

## 🔍 第六步：理解脚手架，而不是背目录

运行成功后，沿一次“查询示例数据”的请求找到相关文件。你不需要立刻理解所有代码，只需要能够回答数据怎样从数据库到达页面。

=== "Spring Boot + Vue"

    ```text
    Vue 页面
    → frontend/src/api/
    → Spring Boot Controller
    → Service
    → Mapper
    → MySQL
    → 统一响应
    → Vue 页面更新
    ```

=== "Servlet + 原生前端"

    ```text
    HTML 页面与 JavaScript
    → Fetch 请求
    → Servlet
    → Service
    → DAO
    → MySQL
    → JSON 响应
    → 页面更新
    ```

建议填写下面的阅读记录：

| 问题 | 你的答案 |
| :--- | :--- |
| 项目从哪个文件启动？ | 【填写】 |
| 登录请求由哪个类接收？ | 【填写】 |
| 示例列表页面在哪里？ | 【填写】 |
| 示例查询接口在哪里？ | 【填写】 |
| 业务逻辑由哪个类负责？ | 【填写】 |
| 数据库访问由哪个类负责？ | 【填写】 |
| 数据库连接配置在哪里？ | 【填写】 |
| 登录状态保存在哪里？ | JWT / Session / 【填写】 |

!!! tip "能够顺着一条请求找到代码，比记住所有目录更重要"
    下一节改造项目时，你会仿照示例模块创建自己的业务模块。现在先弄清页面、接口、业务逻辑和数据访问之间的关系，不需要一次读完所有源码。

---

## 🤖 第七步：让 AI 帮你定位启动问题

AI 可以辅助阅读日志和排查环境问题，但必须提供完整证据。

可以这样提问：

```text
请先阅读项目根目录的 README.md 和 AGENTS.md，
不要修改任何文件。

我正在运行【Spring Boot + Vue / Servlet】课程脚手架。

环境信息：
- 操作系统：
- JDK：
- Maven：
- Node.js（如适用）：
- MySQL：
- Tomcat（如适用）：

我执行的命令或操作：
【填写】

预期结果：
【填写】

实际结果和完整报错：
【粘贴关键日志，不要只发“启动失败”】

请先判断问题发生在环境、依赖、数据库、后端还是前端，
再给出最小排查步骤。未经我确认，不要修改依赖版本和项目结构。
```

收到建议后，逐步执行并记录结果。不要一次尝试多个互不相关的修改，否则即使项目恢复，也很难知道是哪一步解决了问题。

### 常见问题先检查

| 现象 | 优先检查 |
| :--- | :--- |
| 后端无法启动 | JDK 版本、8080 端口、Maven 依赖、数据库连接 |
| 前端无法启动 | Node.js 版本、依赖安装、5173 端口、当前目录 |
| 登录一直失败 | 数据库是否初始化、账号密码、请求地址、后端日志 |
| 页面能开但没有数据 | 后端是否运行、浏览器 Network、数据库示例数据 |
| Servlet 页面 404 | Tomcat 版本、Context Path、Deployment Directory |
| 数据库连接失败 | MySQL 服务、库名、账号密码、端口和字符集 |

!!! warning "不要为了消除报错随意降低版本"
    Servlet 脚手架使用 Jakarta 命名空间，需要匹配 Tomcat 11；Spring Boot 脚手架要求 JDK 17。遇到版本问题时先核对 README 和构建文件，不要让 AI 随意更换框架、删除依赖或重写项目。

---

## 📝 第八步：记录初始状态并提交

完成运行验证后，整理一份简短记录：

```markdown
# 脚手架启动记录

## 1. 技术路线
- 选择的脚手架：
- 选择理由：

## 2. 环境版本
- 操作系统：
- JDK：
- Maven：
- Node.js：
- MySQL：
- Tomcat：

## 3. 启动方式
- 数据库初始化：
- 后端或 Tomcat：
- 前端：
- 访问地址：

## 4. 验证结果
- 登录：
- 示例查询：
- 新增或编辑：
- 数据持久化：
- 退出与受限访问：

## 5. 遇到的问题
- 问题：
- 原因：
- 解决方法：
- 证据：

## 6. 当前已知限制
- 【填写】
```

提交前检查：

```bash
git status
git diff
```

不要提交：

- 数据库真实密码和服务器密钥；
- `.env` 中的个人配置；
- `node_modules/`；
- `target/`；
- IDE 缓存和操作系统临时文件；
- 与本节任务无关的修改。

确认后创建第一次课程开发提交：

```bash
git add .
git commit -m "chore: verify course scaffold setup"
```

如果 `git status` 中出现密码、构建产物或大量依赖文件，先检查 `.gitignore`，不要直接提交。

---

## ✅ 本节验收清单

- [ ] 已根据项目设计和个人基础选择一套脚手架；
- [ ] 已阅读脚手架的 README、AGENTS.md 和数据库脚本；
- [ ] 已记录 JDK、MySQL 及路线所需工具版本；
- [ ] 数据库已经初始化；
- [ ] 后端或 Servlet 应用能够正常启动；
- [ ] Spring Boot + Vue 路线的前端能够正常启动；
- [ ] 可以使用管理员账号登录；
- [ ] 示例查询能够返回数据库中的真实数据；
- [ ] 至少完成一次数据新增或修改并在刷新后保留；
- [ ] 退出后受限页面或接口受到保护；
- [ ] 已记录启动命令、访问地址、问题和解决方法；
- [ ] Git 提交中没有密码、密钥、依赖缓存和构建产物；
- [ ] 已保存一个可运行的初始版本。

只有以上内容基本完成，才进入下一节改造工程。否则，后续开发会把环境问题、脚手架问题和业务代码问题混在一起。

---

## 📝 总结

* **脚手架是工程起点，不是最终作品**：它负责提供项目结构和通用基础能力，学生负责完成自己的业务。
* **技术路线只选一套**：优先选择自己能够运行、调试、修改和解释的方案。
* **先运行，再修改**：保留可运行初始版本，后续出现问题时才有比较基线。
* **验证必须经过数据库**：只看到页面或编译成功，不代表前后端和数据已经打通。
* **记录真实开发过程**：环境、命令、错误、解决方法和 Git 提交都是课程成果。

[返回第四篇导读](index.md){ .md-button }
[进入下一节：改造工程](02-project-customization.md){ .md-button .md-button--primary }
