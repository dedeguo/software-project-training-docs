# 开发环境与项目工具链

## 推荐环境

| 工具 | 建议版本 | 用途 |
|---|---|---|
| JDK | 17 | Java运行与编译 |
| Maven | 3.9+ | 依赖和构建管理 |
| Spring Boot | 3.x | 后端开发 |
| MySQL | 8.x | 数据库 |
| Git | 当前稳定版 | 版本管理 |
| Trae | 当前版本 | AI辅助开发 |
| Apifox | 当前版本 | 接口调试 |
| Node.js | LTS | 前端工具链 |

## 环境检查

```bash
java -version
mvn -version
git --version
node --version
npm --version
```

## 开课前验收

- [ ] 能运行示例 Spring Boot 项目；
- [ ] 能连接课程数据库；
- [ ] 能用 Apifox 调用接口；
- [ ] 能克隆并提交 Git 仓库；
- [ ] 能在 Trae 中打开并分析项目；
- [ ] 配置文件中没有提交真实密码或密钥。

!!! tip "遇到安装问题怎么办"
    先保存完整错误信息，再向AI提供操作系统、软件版本、执行命令和错误日志。不要只问“为什么运行不了”。
