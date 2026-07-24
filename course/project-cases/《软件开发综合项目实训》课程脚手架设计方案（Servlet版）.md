# 《软件开发综合项目实训》课程脚手架设计方案（Servlet 版）

> 与 [《软件开发综合项目实训》课程脚手架设计方案.md](《软件开发综合项目实训》课程脚手架设计方案.md)（Spring Boot 3 + Vue 3 版）配套，提供 Servlet + JSP 技术栈版本，供基础课刚结束或希望更深入理解请求-响应 / Filter / JSP 生命周期的同学选用。
>
> 本文档仅在两版存在差异的章节展开，与 Spring Boot 版相同的内容请直接参考姊妹篇。

## 一、目标定位

- 与 Spring Boot 版相同（详见姊妹篇"一、目标定位"）
- 额外定位：贴近《Java Web 开发技术》基础课，作为基础课到项目实训的过渡脚手架
- 让学生更直观地看到 Servlet 容器、Filter 链、JSP 编译、JDBC 连接池的运行机制

## 二、技术栈

| 层 | 技术 |
| :--- | :--- |
| 后端 | JDK 17、Servlet 6.x、JSP、JSTL |
| 数据库 | MySQL 8（兼容说明 openGauss） |
| 连接池 | Alibaba Druid |
| 数据访问 | 原生 JDBC（不引入 MyBatis，贴近基础课） |
| 鉴权 | Session + Cookie + Filter |
| 工具 | Jackson（JSON）、Lombok、Commons FileUpload（按需） |
| 前端 | 原生 HTML + CSS + JavaScript（无构建步骤） |
| 部署 | WAR 打包 + Tomcat 11 + Nginx 反向代理 |
| 工具链 | Git、Apifox、Trae、AGENTS.md |

## 三、目录结构

```text
scaffold-servlet/
├── README.md
├── .gitignore
├── AGENTS.md                       # AI 协作规则（必须）
│
├── pom.xml                         # packaging: war
├── mvnw / mvnw.cmd
│
├── src/main/
│   ├── java/edu/course/scaffold/
│   │   ├── controller/             # Servlet 控制器
│   │   │   ├── BaseServlet.java    # 统一抽取 method 路由
│   │   │   ├── AuthServlet.java
│   │   │   └── DemoItemServlet.java
│   │   ├── service/                # 业务层
│   │   │   ├── UserService.java
│   │   │   └── DemoItemService.java
│   │   ├── dao/                    # 数据访问层
│   │   │   ├── UserDao.java
│   │   │   └── DemoItemDao.java
│   │   ├── entity/                 # POJO
│   │   │   ├── User.java
│   │   │   └── DemoItem.java
│   │   ├── filter/                 # 过滤器
│   │   │   ├── LoginFilter.java
│   │   │   ├── CorsFilter.java
│   │   │   └── EncodingFilter.java
│   │   ├── exception/              # 自定义异常 + 统一处理
│   │   │   ├── BusinessException.java
│   │   │   └── GlobalExceptionHandler.java
│   │   ├── common/                 # 通用响应
│   │   │   └── ApiResponse.java
│   │   └── util/
│   │       ├── JDBCUtils.java      # Druid 数据源 + 连接管理
│   │       ├── JsonUtils.java
│   │       └── MD5Utils.java
│   ├── resources/
│   │   ├── druid.properties
│   │   └── logback.xml
│   └── webapp/
│       ├── WEB-INF/
│       │   ├── web.xml             # Servlet / Filter / 欢迎页
│       │   └── views/              # JSP（如需服务端渲染）
│       ├── admin/                  # HTML 静态页（管理端）
│       ├── user/                   # HTML 静态页（用户端）
│       ├── css/
│       ├── js/
│       └── index.jsp               # 入口
│
├── src/test/java/                  # JUnit 5 单测示例
│
├── api/
│   └── scaffold-servlet.postman_collection.json
│
├── sql/
│   └── init.sql                    # MySQL/openGauss 兼容
│
├── deploy/
│   ├── Dockerfile                  # 基于 tomcat:10-jdk17
│   ├── docker-compose.yml
│   └── nginx/default.conf
│
├── docs/                           # 课程配套文档（学生填）
│   ├── 01-需求分析说明书.md
│   ├── 02-系统设计说明书.md
│   ├── 03-测试报告.md
│   └── 04-项目README.md
│
└── .trae/
    └── skills/.keep
```

## 四、必跑通的最小闭环

预置 1 个**完整可登录 + 1 个 CRUD** 示例（与 Spring Boot 版一致，便于两版对照学习）：

- **登录**：`POST /auth/login` 返回 JSON `{ code, message, data: { token } }`，前端存 localStorage
- **分页列表**：`GET /demo-items?page=&size=` 返回 `ApiResponse<PageVO<ItemVO>>`
- **CRUD**：`POST /demo-items`、`PUT /demo-items/{id}`、`DELETE /demo-items/{id}`、`GET /demo-items/{id}`
- **权限演示**：管理员路由走 `LoginFilter + AdminFilter` 链；普通用户路由仅走 `LoginFilter`
- **错误演示**：Servlet 抛 `BusinessException` → `GlobalExceptionHandler` 统一返回 JSON

Servlet 版特有教学点：

- **方法分发**：`BaseServlet` 继承 `HttpServlet`，根据 `method` 参数或 `HiddenHttpMethodFilter` 路由到具体方法
- **JSON 响应**：Servlet 写 `application/json;charset=UTF-8` 响应
- **Filter 链顺序**：`EncodingFilter → CorsFilter → LoginFilter → AdminFilter`

学生拿到脚手架后：

1. 第一步改名 `DemoItem`、换业务表 → 变为自己项目；
2. 第二步在 JSP 中加深对请求-响应链路的理解。

## 五、配套资源

| 资源 | 内容 |
| :--- | :--- |
| `README.md` | 5 分钟上手：环境准备、初始化数据库、`mvn tomcat7:run` 或 IDEA 部署、Docker 部署 |
| `AGENTS.md` | 写明 AI 角色、Servlet 生命周期、目录约定、改动约束 |
| `api/*.postman_collection.json` | 全部示例接口可一键测试 |
| `sql/init.sql` | 含示例数据，学生 fork 后只改业务表 |
| `.trae/skills/.keep` | 引导学生执行 `npx @dedeguo/software-project-training-skills` |
| `docs/*` | 已留空标题骨架的四大过程文档模板 |
| 部署 | `docker-compose up -d` 拉起 mysql + tomcat + nginx |

## 六、学生使用流程

与 Spring Boot 版相同（详见姊妹篇"六、学生使用流程"），注意两点差异：

- 第 2 步运行体验：使用 `mvn tomcat11:run` 或 IDEA 部署到本地 Tomcat 11，访问 `http://localhost:8080/scaffold-servlet/`
- 第 4 步改造工程：除改名外，建议在 `web.xml` 中修改 `<display-name>` 和 Servlet 路径前缀

## 七、与现有资源的对应

| 现有资源 | 在 Servlet 版脚手架中的角色 |
| :--- | :--- |
| `book-manage/` | **核心参考实现**——Servlet + JSP + Druid + JDBC 的完整示例，本脚手架将抽取并精简其结构 |
| `lab2_2/book_template/` | 不再使用，已被新脚手架替代 |
| `ecommerce/` | 仅作技术栈对照参考（Servlet 版不引入 Spring 系列依赖） |
| `course/project-cases/教学项目案例体系与使用方案.md` | 项目案例方法论参考 |

## 八、实施 checklist（仅 Servlet 版特有部分）

**后端基础设施（必做）**

- `BaseServlet` 统一方法路由
- `LoginFilter`（验证 Session / Token）
- `AdminFilter`（验证角色）
- `EncodingFilter`（统一 UTF-8）
- `CorsFilter`（开发环境跨域）
- `JDBCUtils`（Druid 数据源 + ThreadLocal 连接）
- `MD5Utils`（密码加密）
- `ApiResponse<T>` + `BusinessException` + `GlobalExceptionHandler`
- `web.xml` 配置（Servlet、Filter、欢迎页、错误页）
- 多环境：`druid-dev.properties`、`druid-prod.properties`

**后端业务（必做）**

- `AuthServlet`：注册 / 登录 / 获取当前用户 / 退出
- `DemoItemServlet`：分页 + CRUD

**前端（必做）**

- 登录页、列表页、表单页（HTML + 原生 JS，引入公共 `common.js`）
- `common.js`：封装 `fetch` 调用、统一错误处理、登录态判断

**AI 协作（必做）**

- `AGENTS.md`（Servlet 生命周期、Filter 链、JSP 隐式对象、改动禁区）
- `.trae/skills/.keep` + 安装说明

**配套（必做）**

- `README.md`（5 分钟上手 + Tomcat / Docker 两种启动方式）
- Postman 接口集
- `docs/` 4 份过程文档模板
- `Dockerfile`（基于 `tomcat:10-jdk17`，将 WAR 复制到 `webapps/`）
- `docker-compose.yml`
- `deploy/nginx/default.conf`
- `LICENSE`
- `.gitignore`

其余与 Spring Boot 版相同的实施清单请参考姊妹篇"八、实施 checklist"。

## 九、实施分阶段建议

| 阶段 | 目标 | 周期 |
| :--- | :--- | :--- |
| 1 | 抽取 `book-manage` 核心结构，整理为脚手架骨架 + 登录 demo + 单测 | 短期 |
| 2 | 改造为 `module-demo`（一个完整 CRUD）+ 异常处理 | 短期 |
| 3 | Docker 部署 + Postman + README | 中期 |
| 4 | 课程 Skill 接入 + 文档模板 + 教学对接 | 中期 |

## 十、与课程章节的衔接

`mkdocs.yml` 第四篇（`chapter04`）建议在第一节增加**技术栈选择说明**：

| 路线 | 适用学生 | 仓库 |
| :--- | :--- | :--- |
| 主流路线 | 已学 Java 基础、想掌握主流框架 | `scaffold-springboot`（Spring Boot 3 + Vue 3） |
| 入门路线 | 基础课刚结束、希望先掌握请求-响应与 Servlet 容器 | `scaffold-servlet`（Servlet + JSP） |

`chapter04/02-project-customization.md` 增加两版的改造差异点（包结构 vs 单体应用、Filter 链 vs 拦截器链、JSON 工具 vs Jackson 自动配置 等）。

## 十一、关键决策点（仅 Servlet 版特有议题）

| 议题 | 结论 |
| :--- | :--- |
| 原生 JDBC vs JdbcTemplate vs MyBatis | 选原生 JDBC，贴近基础课；不引入 MyBatis，避免与 Spring Boot 版重复 |
| Session vs Token | 选 Session + Cookie（更贴近基础课）；同时提供 Token 模式作为进阶演示 |
| HTML 静态页 vs JSP | 主体 HTML + 静态资源 + `fetch` 异步；仅在必须服务端渲染时使用 JSP |
| Tomcat 内嵌 vs 外部 | 提供两种：本地开发用 `tomcat7-maven-plugin`；Docker 用外部 `tomcat:10-jdk17` 镜像 |
| 字符编码 | 强制 UTF-8：`EncodingFilter` + `request.setCharacterEncoding` + `<%@ page pageEncoding="UTF-8" %>` |
| Filter 顺序 | 编码 → 跨域 → 登录 → 角色；通过 `@WebFilter` + `web.xml` `<filter-mapping>` 控制 |
| WAR 打包 | `<packaging>war</packaging>`，`<finalName>scaffold-servlet</finalName>` |

## 十二、与 Spring Boot 版的对照表（教学选用参考）

| 维度 | Spring Boot 3 + Vue 3 版 | Servlet + JSP 版 |
| :--- | :--- | :--- |
| 启动方式 | `mvn spring-boot:run` | `mvn tomcat7:run` 或 IDEA 部署 |
| 请求入口 | `@RestController` 方法 | `HttpServlet.service()` |
| 路由机制 | `@RequestMapping` | `BaseServlet` 反射分发或 `web.xml` |
| 鉴权实现 | HandlerInterceptor + 注解 | Filter 链 |
| 数据访问 | MyBatis-Plus | 原生 JDBC + Druid |
| JSON | Jackson 自动 | 手动 `objectMapper.writeValue` |
| 部署 | `java -jar` 或 Docker | WAR + Tomcat 或 Docker |
| 适合学生 | 想学主流框架、就业导向 | 想夯实基础、理解原理 |

## 十三、维护说明

- 方案调整请直接修改本文件，重大变更在 PR 中说明。
- 实施时按第九节分阶段执行，第十一节决策点变更需评审。
- 与姊妹篇（Spring Boot 版）保持章节结构对齐，便于学生对照阅读。
