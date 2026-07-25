# 5.4 完成部署准备：配置、数据与启动清单

## 让项目离开开发电脑后，仍然能够启动

!!! quote "本机能运行，不等于可以部署"
    开发过程中，数据库地址、账号密码、端口、上传目录和测试数据可能已经保存在你的 IDE、本机配置或记忆中。换一台电脑、换一个数据库，项目就可能无法启动。

    部署准备的目标不是立刻把项目放到公网，而是把这些隐含条件整理为**可配置、可初始化、可说明、可恢复**的交付环境。最低要求是：不依赖 IDE、不手工修改代码，按 README 和脚本可以在本机或局域网重新启动项目。

!!! tip "本节学习目标"
    整理开发与部署配置，准备数据库初始化、备份与恢复方案，检查端口、环境变量、文件目录和启动命令，形成一份部署前清单，为下一节本地 Docker 部署与验证做好准备。

[返回上一节：管理缺陷并回归](03-defect-regression.md){ .md-button }
[返回第四篇：项目开发与业务实现](../chapter04/index.md){ .md-button }

---

## 🎯 本节完成后，你要交付

| 成果 | 要求 |
| :--- | :--- |
| 部署配置说明 | 写清数据库、端口、环境变量、文件目录和服务地址 |
| 环境变量模板 | 提供 `.env.example`、配置模板或等价说明；不提交真实密码和密钥 |
| 数据库初始化材料 | 从空库创建表、基础账号和必要测试数据的 SQL 或迁移脚本 |
| 数据备份与恢复说明 | 知道测试数据被破坏后如何恢复到可测试状态 |
| 启动说明 | 从构建、配置到访问地址的完整步骤 |
| 部署前检查清单 | 在部署前逐项确认配置、数据、构建产物和安全项 |

!!! warning "部署准备不是复制本机配置"
    不要把本机绝对路径、个人账号、真实密码、Token、数据库备份文件或 IDE 私有配置直接提交到仓库。项目需要的是可替换的配置模板与明确说明。

---

## 一、先明确：开发配置和部署配置为什么要分开

开发环境通常追求方便：本机数据库、固定端口、调试日志、测试账号、热更新。部署环境更关注稳定、可配置和安全：不同地址、不同账号、最少暴露、可重复启动。

| 配置项 | 开发环境特点 | 部署环境特点 |
| :--- | :--- | :--- |
| 数据库地址 | 常为 `localhost` | 可能是 Docker 服务名、局域网 IP 或云数据库地址 |
| 数据库密码 | 可使用本机测试密码 | 通过环境变量或本地私有文件提供，不提交仓库 |
| 日志级别 | 可开启 DEBUG，便于排查 | 使用 INFO/WARN，避免输出敏感信息 |
| 跨域配置 | 允许本地前端开发端口 | 只允许实际前端地址或由 Nginx 同源代理 |
| 文件上传路径 | 可存本机临时目录 | 需要可写目录、挂载卷或对象存储方案 |
| 前端接口地址 | Vite 代理或 `localhost` | 由 Nginx 代理 `/api` 或使用实际服务地址 |
| 初始化数据 | 便于测试，可随时重置 | 仅保留演示所需数据，不使用真实隐私数据 |

!!! info "配置可变，代码不应随环境改变"
    切换数据库、端口或部署方式时，优先修改环境变量和配置文件；不要为了部署把 Java、JavaScript 或 SQL 中的地址硬编码后再提交。

---

## 二、第一步：盘点项目真正依赖什么

部署前先列出项目运行所依赖的外部条件。不要只看代码目录，也要检查 README、配置文件、Docker 配置、数据库脚本和第三方服务。

### 1. 部署依赖清单

| 类别 | 要确认的内容 | 项目实际值 |
| :--- | :--- | :--- |
| 运行时 | JDK、Node、Tomcat、Docker、Docker Compose 版本 | 【填写】 |
| 后端服务 | 应用端口、启动命令、JAR/WAR 文件名 | 【填写】 |
| 前端服务 | 构建命令、静态文件目录、接口代理规则 | 【填写】 |
| 数据库 | 类型、版本、主机、端口、库名、账号、初始化方式 | 【填写】 |
| 文件存储 | 上传目录、日志目录、是否需要挂载卷 | 【填写】 |
| 身份认证 | JWT 密钥或 Session 配置、Cookie 规则、有效期 | 【填写】 |
| 网络 | 浏览器访问地址、后端地址、Nginx 端口、CORS 规则 | 【填写】 |
| 第三方服务 | AI、短信、邮件、支付、地图等依赖与降级方案 | 【填写】 |

### 2. 检查隐藏在代码中的环境依赖

重点搜索以下风险：

```text
localhost
127.0.0.1
192.168.x.x
/root/
/Users/
C:\Users\
数据库密码
JWT 密钥
API Key
固定端口
固定上传路径
```

例如：

```bash
# 在项目根目录执行；根据项目语言与文件类型调整
# macOS / Linux
grep -R "localhost\|127\.0\.0\.1\|password\|secret\|apiKey" . \
  --exclude-dir=node_modules --exclude-dir=.git
```

发现后逐项判断：

- 这是开发环境默认值，还是必须改为配置项？
- 是否包含敏感信息？
- 是否会导致换机器或 Docker 环境无法启动？
- README 是否已说明如何替换？

!!! failure "不要提交真实密钥"
    数据库密码、JWT 私钥、第三方 API Key、支付密钥、云服务器密码等一旦提交到 Git 历史中，即使后续删除也可能已泄露。应立即更换已泄露的密钥，而不是只删除文件。

---

## 三、第二步：整理配置与环境变量

不同技术路线的具体文件不同，但原则相同：**仓库中保留模板，实际值在环境变量或本机私有文件中提供。**

### 1. 推荐的配置文件结构

```text
project/
├── backend/
│   ├── src/main/resources/
│   │   ├── application.yml              # 公共配置，可提交
│   │   ├── application-dev.yml          # 开发默认配置，可提交
│   │   ├── application-prod.yml         # 部署配置模板，可提交
│   │   └── application-local.yml        # 本机私有配置，不提交
│   └── .env.example                     # 环境变量示例，可提交
│
├── frontend/
│   ├── .env.development                 # 开发接口地址，可提交
│   ├── .env.production                  # 部署接口地址模板，可提交
│   └── .env.local                       # 本机私有覆盖，不提交
│
├── deploy/
│   ├── docker-compose.yml
│   └── .env.example
└── .gitignore
```

不要求所有项目完全采用上述结构，但至少应满足：

- 公共配置可以提交；
- 私有配置被 `.gitignore` 忽略；
- 新同学能从示例配置知道每个变量含义；
- Docker 或启动命令可以读取实际配置；
- README 写清配置文件放在哪里、怎样创建。

### 2. Spring Boot + Vue 路线示例

后端 `application-prod.yml` 可使用环境变量提供实际值：

```yaml
spring:
  datasource:
    url: jdbc:mysql://${DB_HOST:localhost}:${DB_PORT:3306}/${DB_NAME:project_db}?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai
    username: ${DB_USER:root}
    password: ${DB_PASSWORD:}

server:
  port: ${SERVER_PORT:8080}

jwt:
  secret: ${JWT_SECRET:请在部署环境中设置安全密钥}
  expire-hours: ${JWT_EXPIRE_HOURS:24}
```

前端 `.env.production`：

```text
# 推荐使用 Nginx 将 /api 代理到后端，前端无需写死主机地址
VITE_API_BASE_URL=/api
```

### 3. Servlet + HTML 路线示例

`druid.properties` 可以保留开发默认值，但部署时建议由外部文件或环境变量覆盖。至少在 README 中明确：

```properties
driverClassName=com.mysql.cj.jdbc.Driver
url=jdbc:mysql://localhost:3306/project_db?useUnicode=true&characterEncoding=UTF-8&serverTimezone=Asia/Shanghai
username=root
password=请替换为部署数据库密码
```

如果项目通过 Docker 部署，可由容器环境变量生成或覆盖该文件；不要把真实密码直接写入 Git 仓库。

### 4. 环境变量模板

可创建 `deploy/.env.example`：

```text
# 数据库
DB_HOST=mysql
DB_PORT=3306
DB_NAME=project_db
DB_USER=project_user
DB_PASSWORD=请替换
MYSQL_ROOT_PASSWORD=请替换

# 应用
SERVER_PORT=8080
JWT_SECRET=请使用至少32位随机字符串

# 可选：文件上传目录
UPLOAD_DIR=/app/uploads
```

使用时复制为不提交的 `.env`：

```bash
cp deploy/.env.example deploy/.env
```

然后填写真实值，并确认 `.gitignore` 中包含：

```gitignore
.env
.env.local
*.local
application-local.yml
application-local.yaml
```

---

## 四、第三步：让数据库可以从空库初始化

部署失败最常见的原因之一，是“代码启动了，但表不存在、字段不一致、没有测试账号或基础数据”。

### 1. 两种初始化方式

| 方式 | 适用情况 | 优点 | 注意事项 |
| :--- | :--- | :--- | :--- |
| SQL 初始化脚本 | Servlet 项目、小型课程项目、首次部署 | 直观、容易检查 | 每次变更后要同步维护脚本 |
| 数据库迁移脚本 | Spring Boot + Flyway 等项目 | 可记录版本、自动按顺序执行 | 不能随意修改已发布迁移文件 |

### 2. 初始化脚本至少应包含

```text
创建数据库（如需要）
→ 创建表
→ 主键、外键、唯一约束和索引
→ 必要字典数据
→ 测试角色与测试账号
→ 支撑核心流程的演示数据（按需）
```

检查：

- [ ] 在空数据库中可以完整执行；
- [ ] 不依赖手工补字段、改约束或导入未知文件；
- [ ] 与当前实体类、DAO/Mapper 和接口字段一致；
- [ ] 初始化账号密码有明确说明；
- [ ] 不使用真实学生、手机号、身份证、订单或支付数据；
- [ ] 脚本执行两次时有清晰处理方式（报错可接受，但必须说明）；
- [ ] 部署后核心流程有足够的数据可演示。

### 3. MySQL 初始化示例

```sql
CREATE DATABASE IF NOT EXISTS project_db
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE project_db;

CREATE TABLE IF NOT EXISTS user (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 仅用于课程测试；真实项目必须使用安全密码策略
INSERT INTO user (username, password, role)
VALUES ('admin', '请替换为加密后的测试密码', 'admin');
```

!!! warning "脚本中的测试密码也要说明用途"
    课程脚手架可以提供测试账号，但 README 必须写明“仅用于本地测试”。不要将课程测试账号误用于真实线上服务。

---

## 五、第四步：准备数据备份与恢复方案

测试和演示会不断改变业务状态。没有恢复方案，就会出现“上次已经报名”“库存已经扣完”“流程走到终态不能重测”等问题。

### 1. 最低恢复方案：重新导入初始化脚本

适用于数据量小、课程项目：

```bash
# 删除并重新创建数据库后导入脚本
mysql -u root -p < sql/init.sql
```

实际命令应按自己的库名、脚本路径和账号调整，并写入 README。

### 2. 备份当前数据库

在执行大范围测试或部署前，建议备份：

```bash
# 导出结构与数据；替换数据库名
mysqldump -u root -p project_db > backup/project_db_$(date +%Y%m%d_%H%M%S).sql
```

恢复：

```bash
mysql -u root -p project_db < backup/project_db_20260101_120000.sql
```

Windows 用户可以使用 MySQL Workbench、Navicat 或图形化工具完成等价操作，但仍需记录工具、文件位置和恢复步骤。

### 3. 测试数据重置清单

| 测试对象 | 重置方式 | 验证结果 |
| :--- | :--- | :--- |
| 用户账号 | 重新导入初始化数据 / 删除临时账号 | 能用测试账号登录 |
| 核心业务记录 | 清空测试记录 / 导入初始 SQL | 流程回到起始状态 |
| 文件上传 | 清空测试目录或恢复挂载卷 | 页面不显示无效文件 |
| 数据库统计值 | 重新计算或重新导入 | 名额、库存、数量与记录一致 |

!!! tip "优先使用可重复脚本"
    如果需要每次测试前手工改十几条记录，说明初始化或重置脚本还不完整。把重复操作写进 SQL 或脚本，后续测试和答辩会更稳定。

---

## 六、第五步：检查端口、网络与访问路径

部署前要明确“服务在哪里运行、浏览器通过哪个地址访问、前后端怎样通信”。

### 1. 端口规划表

| 服务 | 容器内端口 | 本机映射端口 | 访问者 | 实际配置 |
| :--- | :---: | :---: | :--- | :--- |
| MySQL | 3306 | 3306（可选） | 后端、数据库工具 | 【填写】 |
| Spring Boot 后端 | 8080 | 8080 | 前端 / Nginx | 【填写】 |
| Servlet / Tomcat | 8080 | 8080 | 浏览器 / Nginx | 【填写】 |
| Vue 开发服务 | 5173 | 5173 | 开发浏览器 | 【填写】 |
| Nginx | 80 | 80 或 8088 | 浏览器 | 【填写】 |

并非所有服务都必须暴露到宿主机。例如 Docker Compose 中 MySQL 只供后端使用时，可以不映射 `3306:3306`，减少端口冲突与误访问。

### 2. 推荐使用 Nginx 同源代理

前后端分离项目可让浏览器始终访问同一个地址：

```text
浏览器
→ http://localhost:8088/
→ Nginx 静态前端页面
→ /api/*
→ Nginx 代理到后端服务
```

Nginx 示例：

```nginx
server {
    listen 80;
    server_name _;

    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://backend:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

这样前端可以使用 `/api`，减少 CORS 配置与环境地址切换问题。

### 3. 检查常见网络问题

| 现象 | 常见原因 | 检查方向 |
| :--- | :--- | :--- |
| 页面打不开 | 端口未监听、容器未启动、端口冲突 | 查看服务日志与端口映射 |
| 页面打开但接口 404 | Nginx 路径、前端 baseURL、后端 context path 不一致 | 检查 Network 请求地址 |
| 浏览器提示跨域 | 前端地址和后端地址不同且 CORS 未配置 | 优先改用 Nginx `/api` 代理 |
| 容器内连不上数据库 | DB_HOST 写成 localhost | Docker 内应使用服务名，例如 `mysql` |
| 局域网无法访问 | 只监听 127.0.0.1、防火墙或端口未映射 | 检查绑定地址、防火墙和实际 IP |

!!! warning "容器里的 localhost 不是你的电脑"
    在 Docker 容器中，`localhost` 指向当前容器自身。后端连接 Docker Compose 中的数据库时，应使用服务名，如 `mysql`，而不是 `localhost`。

---

## 七、第六步：检查文件、日志与上传目录

不是所有项目都需要文件上传，但只要项目有头像、图片、附件、导入导出或日志，就必须明确文件保存位置。

### 1. 文件目录规划

| 目录 | 用途 | 是否提交 Git | 部署处理 |
| :--- | :--- | :--- | :--- |
| `uploads/` | 用户上传文件 | 否 | Docker Volume 或宿主机挂载目录 |
| `logs/` | 运行日志 | 否 | 容器日志或挂载目录 |
| `backup/` | 数据库导出文件 | 否 | 本机/服务器受控目录 |
| `sql/` | 初始化和迁移脚本 | 是 | 随项目交付 |
| `docs/` | 项目文档、测试记录 | 是 | 随项目交付 |

`.gitignore` 示例：

```gitignore
uploads/
logs/
backup/
*.log
```

### 2. Docker 挂载示例

```yaml
services:
  backend:
    volumes:
      - ./data/uploads:/app/uploads
      - ./data/logs:/app/logs
```

确认：

- 应用有写入目录的权限；
- 容器重启后重要文件不会丢失；
- 上传文件名和类型有基本校验；
- 不将上传目录直接暴露为可执行文件目录；
- 日志不记录密码、Token、身份证号等敏感内容。

---

## 八、第七步：构建并检查部署产物

在部署前，先在本机完成一次构建，确认产物与配置匹配。

=== "Spring Boot + Vue"

    后端：

    ```bash
    cd backend
    mvn test
    mvn clean package
    ```

    检查：

    ```text
    target/*.jar 是否生成
    application-prod.yml 或环境变量是否可读取
    数据库迁移或初始化脚本是否存在
    ```

    前端：

    ```bash
    cd frontend
    npm install
    npm run build
    ```

    检查：

    ```text
    dist/ 是否生成
    生产环境 API 地址是否为 /api 或实际服务地址
    不包含本机开发地址和调试密钥
    ```

=== "Servlet + HTML + CSS + JavaScript"

    使用 IDEA + smart-tomcat 插件确认本地 Tomcat 11 可运行后，再执行：

    ```bash
    mvn test
    mvn clean package
    ```

    检查：

    ```text
    target/scaffold-servlet.war 或项目实际 WAR 文件是否生成
    web.xml、静态 HTML/CSS/JS 和资源是否已打包
    druid.properties 或外部数据库配置是否可替换
    ```

### 构建产物不要提交到 Git

以下通常由构建自动生成，应被 `.gitignore` 忽略：

```gitignore
target/
dist/
node_modules/
*.jar
*.war
```

交付的是**源代码、配置模板、脚本和构建说明**，而不是只交一个无法解释来源的二进制文件。

---

## 九、第八步：填写部署前检查清单

部署前可按下表逐项确认。

### 配置与安全

- [ ] 开发和部署配置已分开；
- [ ] 真实密码、密钥、Token 和个人配置没有提交 Git；
- [ ] `.env.example` 或配置模板已说明全部必要变量；
- [ ] JWT 密钥、数据库密码等部署环境值已替换；
- [ ] 日志级别和错误响应不暴露敏感信息；
- [ ] 前端没有硬编码开发机 IP、账号或密钥。

### 数据库与数据

- [ ] 可从空库执行初始化或迁移；
- [ ] 表、字段、约束、索引和基础数据完整；
- [ ] 测试账号与密码说明清楚；
- [ ] 已准备正常、中间、完成等状态的演示数据；
- [ ] 已验证数据库备份与恢复方式；
- [ ] 没有真实用户隐私或敏感生产数据。

### 构建与网络

- [ ] 后端或 WAR 构建成功；
- [ ] 前端构建成功（如适用）；
- [ ] Dockerfile、docker-compose.yml、Nginx 配置路径正确；
- [ ] 服务端口没有冲突；
- [ ] 前端接口地址、Nginx 代理和后端路径一致；
- [ ] Docker 服务之间使用服务名访问，不使用错误的 `localhost`；
- [ ] README 中的命令已在相对干净环境验证。

### 文件与交付

- [ ] 上传、日志、备份目录有明确处理方式；
- [ ] 构建产物、日志、数据库备份和私有配置已加入 `.gitignore`；
- [ ] 项目 README 包含启动、配置、测试账号和已知限制；
- [ ] 当前 Git 工作区干净，部署版本可通过提交号或标签定位。

---

## 十、填写部署准备记录模板

将以下内容复制到项目的 `docs/部署说明.md` 或 `docs/testing/部署准备记录.md`，按实际项目填写。

```markdown
# 【项目名称】部署准备记录

## 1. 部署版本

| 项目 | 内容 |
| :--- | :--- |
| 代码版本 | 【分支 / 标签 / 提交编号】 |
| 准备日期 | 【填写】 |
| 技术路线 | 【填写】 |
| 部署目标 | 【本机 / Docker / 局域网 / 云服务器】 |

## 2. 运行环境

| 项目 | 实际值 |
| :--- | :--- |
| 操作系统 | 【填写】 |
| JDK / Node / Tomcat / Docker 版本 | 【填写】 |
| 数据库类型与版本 | 【填写】 |
| 浏览器 | 【填写】 |

## 3. 配置项

| 配置项 | 获取方式 | 是否提交 Git | 说明 |
| :--- | :--- | :--- | :--- |
| 数据库地址 | 环境变量 / 配置文件 | 否 | 【填写】 |
| 数据库账号 | 环境变量 / 配置文件 | 否 | 【填写】 |
| 数据库密码 | 环境变量 / 私有文件 | 否 | 【填写】 |
| JWT 密钥 / Session 配置 | 环境变量 / 私有文件 | 否 | 【填写】 |
| 前端 API 地址 | 构建配置 / Nginx | 是 / 否 | 【填写】 |
| 文件上传目录 | 环境变量 / Volume | 否 | 【填写】 |

## 4. 数据库初始化与恢复

- 初始化脚本或迁移位置：【填写】
- 初始化命令：【填写】
- 测试账号：【填写】
- 备份命令或工具：【填写】
- 恢复命令或步骤：【填写】

## 5. 端口与访问地址

| 服务 | 端口 | 访问地址 | 说明 |
| :--- | :--- | :--- | :--- |
| 数据库 | 【填写】 | 【填写】 | 【填写】 |
| 后端 / Tomcat | 【填写】 | 【填写】 | 【填写】 |
| 前端 / Nginx | 【填写】 | 【填写】 | 【填写】 |

## 6. 部署前检查结论

- [ ] 配置模板完整且敏感信息未提交
- [ ] 数据库可从空库初始化
- [ ] 构建产物已生成
- [ ] 端口、代理和服务地址已核对
- [ ] 测试数据可恢复
- [ ] README 启动说明已验证

当前阻塞问题或风险：【填写；没有则写无】
```

---

## 本节小结

部署准备的本质，是把“只有开发者知道怎样运行”的项目变成“其他人按说明也能运行”的项目：

> 盘点依赖 → 分离配置 → 准备环境变量模板 → 初始化并可恢复数据库 → 核对端口与代理 → 检查文件目录 → 构建产物 → 用清单确认。

完成本节后，你已经具备进入部署验证的条件。下一节将使用本地或局域网环境实际启动服务，验证部署后的系统仍能完成核心流程。

[下一节：5.5 部署验证：本地 Docker 与可访问系统](05-deployment-verification.md){ .md-button .md-button--primary }
[返回上一节：管理缺陷并回归](03-defect-regression.md){ .md-button }
