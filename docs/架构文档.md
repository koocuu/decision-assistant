# 决策助手架构备忘

本文件记录已经拍板的架构方向。后续 agent 先读这里，不重复讨论已经确定的路线。

## 当前结论

- 主产品架构调整为 **Next Web + Expo App + shared core**。
- Next.js 保留为 PC Web、移动 Web、服务端 API、Prisma、Neon、SEO/分享入口。
- Expo SDK 54 重新启用，负责 Android/iOS 原生 App 体验。
- 不再投入 PWA 安装能力；已移除 manifest、service worker、离线页和安装提示。
- 数据库继续使用现有 Neon Postgres，不另起账号库。
- AI 调用由 Vercel/Next 服务端代理 DeepSeek，前端和 App 都不能保存 DeepSeek key。

## 技术栈

- Web：Next.js App Router。
- App：Expo SDK 54。
- 数据库：Neon Postgres，通过 Prisma 访问。
- 部署：Vercel 承载 Next Web 和 `/api/*`。
- AI：服务端读取 `DEEPSEEK_API_KEY` 调 DeepSeek。
- APK 下载：Web 通过 `/api/download/android` 跳转到 `ANDROID_APK_URL`。

## 分层

```text
apps/web (当前根 Next app)
  - PC Web / 移动 Web
  - Vercel API routes
  - Prisma / Neon / DeepSeek proxy

apps/mobile
  - Expo Android / iOS App
  - 调用同一套 /api/*

packages/core (下一步)
  - shared types
  - API client
  - report parsing/normalization
  - date/score helpers
  - prompt result schemas

packages/tokens (下一步可并入 core)
  - colors
  - radii
  - spacing
  - typography scale
```

## UI 一致性原则

- 不强行共享 Web 和 App 的 UI 组件。
- Web 和 App 可以有合理差异：PC 可以有顶部导航，App 可以有底部 Tab。
- 一致性来自共享设计令牌和业务逻辑，而不是两端长得一模一样。
- 必须共享或保持一致的内容：
  - 品牌色、圆角、间距、字号比例
  - 小羊资产和情绪语气
  - 决策创建、AI 分析、复盘、画像更新的流程状态
  - API 请求/错误处理/类型定义

## 数据与身份

目标身份解析：

```ts
resolveIdentity(req) ->
  | { kind: "user"; userId: string }
  | { kind: "anon"; anonId: string }
```

- Web 登录态：从 httpOnly session cookie 获取 `userId`。
- App 登录态：下一步扩展为 Bearer token，App 存 `SecureStore`。
- 匿名态：Web cookie 或 App `x-anon-id`。
- `Decision / DecisionReview / UserProfile` 归属 `userId` 或 `anonId`。
- 登录/注册后 claim，把匿名数据挂到当前用户。

## 当前战略边界

- 不做 Expo-only 推倒重来。
- 不让 Expo App 直连 Neon 或 DeepSeek。
- 不把 DeepSeek key 放到前端或移动端。
- Next API 是 Web 和 App 共用后端。
- 业务逻辑优先抽共享 core；UI 组件共享放到后面评估。
