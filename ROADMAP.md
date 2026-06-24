# 决策助手 Roadmap

本文件只记录产品功能之外的工程、分发、可信度和运维问题。当前战略：**Web/PWA 优先，Expo App 封存**。

## 当前事实

- Web 已是 Next.js + Prisma + Neon Postgres。
- PWA 基础已上线到 `main`：manifest、service worker、离线页、移动端底部 tab、安装提示。
- Expo App 代码保留在仓库中，但当前不主动维护。
- 账号体系尚未实现：没有 `User` 表，没有登录/注册接口，没有 `userId`/`anonId` 数据隔离。
- 目前只有 `/api/ai/*` 被 Basic Auth 密码墙保护；页面和 `/api/decisions` 仍是公开读写。
- `UserProfile` 当前是全局画像，不是按用户隔离。

## P0 · 账号与数据隔离

这是一组必须一起解的地基问题：

| # | 问题 | 当前风险 | 目标 |
|---|---|---|---|
| 1 | 没有账号/身份体系 | 不能多人可信使用 | 可选登录，匿名也能完整生成报告 |
| 2 | 数据全局共享 | 隐私泄露，任何人可看全库 | `Decision/Review/Profile` 按 `userId` 或 `anonId` 隔离 |
| 3 | API 公开读写 | `/api/decisions` 无身份过滤 | 所有读写先 `resolveIdentity` |
| 4 | AI 只靠共享密码 | 体验差，也不能承载公开分发 | 改为服务端代理 + 身份限额 |
| 5 | 无速率/额度限制 | DeepSeek 成本可被刷爆 | 匿名/登录/IP/全局限额 |

### P0 拍板方案

- 登录方式：邮箱 + 密码。
- 匿名策略：Web 生成 `anonId`，存 cookie；未登录也可生成报告。
- 数据认领：登录/注册后调用 claim，把当前 `anonId` 数据挂到用户。
- DB：继续用现有 Neon Postgres，不新开账号库。
- 迁移：可以生成 migration 文件；生产库部署迁移必须由用户明确确认。
- App：继续封存，不做移动端 P0。

### P0 实施顺序

1. DB schema + migration 文件：
   - 新增 `User`
   - `Decision / DecisionReview / UserProfile` 加 `userId?`、`anonId?`
   - 可选新增 `RateLimit`
2. 服务端身份核心：
   - `lib/auth.ts`
   - `lib/anon.ts`
   - `lib/identity.ts`
   - session cookie
3. Account API：
   - `POST /api/account/register`
   - `POST /api/account/login`
   - `POST /api/account/logout`
   - `GET /api/account/session`
   - `POST /api/account/claim`
4. 决策 API 和页面加身份过滤。
5. AI 接口去 Basic Auth，改为身份限流。
6. Web 登录/注册 UI 和顶栏状态。
7. 验证后再由用户执行生产迁移并部署。

## P1 · Web/PWA 生产化

| # | 问题 | 目标 |
|---|---|---|
| 1 | 缺真实使用数据 | 接 Vercel Analytics 或 Plausible |
| 2 | SEO/分享不完整 | favicon、OG 图、分享标题描述 |
| 3 | 缺隐私政策/服务条款 | 补页面，方便公开分发 |
| 4 | 缺错误监控 | 接 Sentry 或等价方案 |
| 5 | PWA 未做 Lighthouse/真机审计 | 真机添加到主屏 + Lighthouse PWA 分数检查 |

## P1 · 架构与一致性

| # | 问题 | 目标 |
|---|---|---|
| 1 | API 契约无运行时校验 | 用 zod 或等价方案校验请求/响应 |
| 2 | Web 流程缺“拆解中”状态 | 补小羊 thinking 过渡状态 |
| 3 | 文案语气未统一 | 写一份小羊暖语/报告分析语指南 |
| 4 | Expo 与 Web 有重复类型 | Expo 封存期间暂不抽包，等解封再考虑 `packages/core` |

## P2 · 质量与运维

| # | 问题 | 目标 |
|---|---|---|
| 1 | 自动化测试不足 | 覆盖生成、复盘、鉴权、身份过滤 |
| 2 | CI 门禁弱 | GitHub Actions 跑 lint/build/test |
| 3 | DB 备份策略未确认 | 确认 Neon 备份/恢复路径 |
| 4 | 可访问性未审计 | 对比度、焦点态、屏读标签 |
| 5 | 暗色模式未实现 | 低优先级 |
| 6 | i18n 未规划 | 当前默认中文，暂不投入 |

## Deferred · Expo App

Expo App 当前封存。只有出现明确上架或原生能力需求时再解封。

解封时再处理：

- EAS Build
- app scheme/deep link
- App 图标与 splash
- 崩溃监控
- App Store/TestFlight 流程

