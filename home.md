## 项目梗概

**U-space** 是一个综合性的高校管理平台，旨在整合校园中各类常用功能，构建一个功能齐全、体验统一的一站式大学服务中心，提升师生的校园生活与管理效率。

平台后端基于 **Spring Boot 3** 和 **JDK 17** 开发，具备良好的可扩展性、稳定性与现代化开发特性，为项目的长期维护与演进奠定了坚实基础。

项目**前身**来源于本人参与开发的河北科技师范学院智慧校园导航小程序功能扩展。对除了导航外的其他功能进行了巨量的扩展。

项目不单单是一个简单的CRUD项目，集成了很多先进的编程思想，经过多次优化的方案，是一个适合于学习，自用搭建的一个高校一体化服务平台。

## 项目架构

项目分为

- 后台管理端：采用pure-admin-thin搭建的后台管理，方便管理员，老师等进行管理
- 小程序端：即用户端。

项目为多模块化的单体项目，后续拆分为微服务是非常的便捷，每个模块依赖性，耦合性低。

目前项目结构为

### 🌐 主程序入口

- **xiaou-admin**：项目的启动模块，包含主类 `SpaceApplication.java`，也是管理端控制层的入口。

------

### 🧱 公共模块（xiaou-common）

| 模块                         | 功能说明                                           |
| ---------------------------- | -------------------------------------------------- |
| **xiaou-common-core**        | 通用配置、异常处理、工具类、统一响应等核心基础功能 |
| **xiaou-common-log**         | 日志注解、切面、操作日志事件发布                   |
| **xiaou-common-mail**        | 邮件发送服务（Spring Boot Mail 封装）              |
| **xiaou-common-mybatis**     | MyBatis-Plus 配置支持                              |
| **xiaou-common-redis**       | Redis 配置与工具类（Redisson）                     |
| **xiaou-common-satoken**     | 权限认证相关封装，整合 Sa-Token                    |
| **xiaou-common-web**         | Web 配置，如 JSON 配置、验证码支持等               |
| **xiaou-common-websocket**   | WebSocket 支持与工具封装                           |
| **xiaou-common-ratelimiter** | 接口限流功能，基于注解+切面实现                    |



------

### 🧩 功能模块（xiaou-modules）

| 模块                           | 功能说明                                   |
| ------------------------------ | ------------------------------------------ |
| **xiaou-modules-appuser**      | 学生端用户模块（登录、用户信息等）         |
| **xiaou-modules-bbs**          | 帖子模块（发帖、评论、点赞等）             |
| **xiaou-modules-campus**       | 校园导览模块（建筑、问答等）               |
| **xiaou-modules-fileupload**   | 文件上传模块（本地/云端存储）              |
| **xiaou-modules-log**          | 操作日志持久化与查看接口                   |
| **xiaou-modules-notify**       | 用户通知模块（点赞提醒等）                 |
| **xiaou-modules-student-life** | 学生生活模块（课程表、课表管理）           |
| **xiaou-online-exam**          | 在线考试模块（结构存在，暂未填充）         |
| **xiaou-userinfo**             | 学生信息维护模块（班级、专业、用户信息等） |
| **xiaou-ai**                   | 智能助手/AI 生成功能模块                   |



