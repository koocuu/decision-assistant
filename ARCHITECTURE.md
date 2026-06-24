# 决策助手架构备忘

本文件记录已经拍板的架构方向。后续 agent 先读这里，不重复讨论已经确定的路线。

## 当前结论

- 主产品优先做 **Web + PWA**。
- 原生 Expo App 暂时封存，保留代码但不主动维护。
- 数据库使用现有 Neon Postgres，不另起账号库。
- 账号体系采用匿名优先：不登录也能完整生成报告；登录后认领匿名数据，实现跨端同步。

## 技术栈

- Web：Next.js App Router。
- 数据库：Neon Postgres，通过 Prisma 访问。
- AI：服务端读取 `DEEPSEEK_API_KEY` 调 DeepSeek，前端不保存 AI key。
- PWA：基于现有 Next.js Web 端增强，不换框架。
- 原生移动端：Expo SDK 54，当前仅作为封存代码保留。

## PWA 策略

PWA 不是新框架，而是给现有 Web 增加可安装能力：

- `manifest.webmanifest`：应用名、图标、主题色、启动方式。
- service worker：离线兜底、缓存策略、后续推送能力。
- 响应式移动 Web：手机首页、决策创建、历史、详情、登录流程可用。

当前 Web 端可以作为 PWA 基础直接改造。不是“重写一个 App”，而是在现有 Next.js 项目上补移动体验与安装能力。

## 数据与身份

目标身份解析：

```ts
resolveIdentity(req) ->
  | { kind: "user"; userId: string }
  | { kind: "anon"; anonId: string }
```

- 登录态：从 session 获取 `userId`。
- 匿名态：Web 从 cookie/localStorage 同步到请求，移动端从 `x-anon-id` 请求头读取。
- `Decision / DecisionReview / UserProfile` 归属 `userId` 或 `anonId`。
- 登录/注册后调用 `/api/account/claim { anonId }`，把匿名数据挂到当前用户。

## 当前战略边界

- P0 不做“全端 RN 一套写”。
- P0 不新增第二套数据库。
- P0 不把 DeepSeek key 放到前端或移动端。
- 原生 App 后续只有在真实用户量或上架需求明确后再解封。
- 如果未来需要上架 iOS，可选路径：
  - 解封 Expo App。
  - 或用 Capacitor 把现有 PWA/Web 壳成原生 App。

