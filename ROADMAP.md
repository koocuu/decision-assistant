# 决策助手 · 工程路线图 (Roadmap)

三端：**🖥️ Web PC** / **📱 Web 移动** / **📲 移动 App (Expo)**。
本文件只记录**非产品功能**的工程/一致性/生产化问题。产品功能（追问、复盘提醒等）另行管理。

> 架构基调：Web 用 Next.js，移动端用 Expo；**共享核心逻辑、统一品牌与流程，但各端交互贴合平台**。不做"一套框架写全端"。

---

## 现状关键事实（2026-06）

- **无账号体系**：`Decision / DecisionReview / UserProfile` 表无 `userId`，全库数据全局共享。
- **鉴权只挡 `/api/ai/*`**：网页页面与 `/api/decisions` 增删改公开无鉴权。
- **数据双写、半同步**：App 生成时 `POST /api/decisions` 写 Postgres，同时存本地 AsyncStorage；App 历史只读本地，Web 只读 Postgres。
- **App 需手填 Basic Auth 密码**才能调 AI（明文存设备，且卡 App Store 审核）。
- 部署：GitHub `main` → Vercel 自动部署；DB 为 Postgres（Vercel/Neon）。

---

## P0 · 地基（卡住分发 / 多人 / 可信）

- [ ] **账号体系（可选登录，匿名优先）** — 注册/登录，数据按身份隔离。详见下方 P0 设计。
- [ ] **数据隔离** — 决策/复盘/画像归属到 `userId` 或匿名 `anonId`，杜绝全局共享。
- [ ] **Web ↔ App 数据同步** — 统一以服务端为准，App 不再只读本地。
- [ ] **去掉 App 手填密码** — 改服务端代理 AI + 速率限制。
- [ ] **AI 接口防刷** — 速率限制 + 每日额度上限（保护 DeepSeek 账单）。

> 这 5 条是一个"结"，由账号体系 + 服务端 AI 代理 + 速率限制一并解决。

## P1 · 架构与一致性

- [ ] 抽 `packages/core`：types + API 客户端 + 业务逻辑(normalize 等) + design tokens 单一来源。
- [ ] API 契约用 zod 校验 / 生成式类型，两端共享。
- [ ] Web 补"拆解中"状态（小羊 thinking），流程与 App 对齐。
- [ ] 文案/语气指南（小羊暖语 vs 报告分析语）。

## P1 · Web 移动端（响应式）

- [ ] 窄屏导航（4 项挤）→ 底部 tab 或汉堡。
- [ ] hero 小羊在手机被隐藏 → 移动端也显示。
- [ ] `decisions/new`、详情、画像页窄屏可用性与点击区审计。
- [ ] 一次系统性真机移动网页走查。

## P1 · 移动 App 生产化

- [ ] 摆脱 Expo Go 版本依赖 → EAS 开发构建。
- [ ] App 图标（3D 小羊，全出血多尺寸）+ splash。
- [ ] 补 `scheme`（深链；构建已警告）。
- [ ] `eas.json` + 出包流程（APK / TestFlight）。
- [ ] 崩溃监控（Sentry）。

## P1 · Web 生产化

- [ ] 埋点/分析（Vercel Analytics / Plausible）→ 看真实使用与留存。
- [ ] SEO / Open Graph 分享图 / favicon（小羊）。
- [ ] 隐私政策 + 服务条款页（两店强制）。
- [ ] 错误监控（Sentry）。

## P2 · 质量与运维

- [ ] 关键流程自动化测试（生成/复盘/鉴权）。
- [ ] CI 门禁：PR 上 lint + typecheck + test。
- [ ] 暗色模式（tokens 已留结构）。
- [ ] 可访问性审计（对比度/焦点/屏读/RN a11y）。
- [ ] DB 备份策略。
- [ ] i18n 策略（当前仅中文）。

---

## P0 设计草案（待拍板）

### 数据存哪
同一个 Postgres 即可，**无需单独账号库**。账号数据极小（一张 `User` 表），现有 Vercel/Neon Postgres 容量与连接池对早期规模绰绰有余。

### 账号 = 可选（匿名优先）
- 每条决策归属 `userId`（已登录）**或** `anonId`（匿名设备随机 token，Web 存 localStorage、App 存 AsyncStorage）。
- 匿名用户可完整使用产品；登录后把该 `anonId` 的数据**认领/迁移**到 `userId`，实现跨端同步。

### 去密码后如何防刷
- 用**速率限制**替代密码墙：
  - 匿名：按 `anonId` + IP 限额（如 N 次/天）。
  - 登录：更高额度。
  - 全局每日上限：DeepSeek 成本熔断。
- 计数存储：建议 **Upstash Redis / Vercel KV**（serverless 原子计数）；或退而用 Postgres 一张计数表。
- 可选漏斗：匿名额度用完 → 引导免费注册解锁更多（既保成本又拉新，契合"可选账号"）。

### 待你拍板的 2 个决定（决定实现方式）
1. **登录方式**（国内场景关键）：
   - 邮箱 + 密码 / 邮箱магic link（最快上线，Web+Expo 都好做）✅ 推荐 v1
   - 手机验证码（国内原生，但要短信服务商，花钱）
   - 微信登录（国内原生，但要资质审批，慢）
2. **生产库迁移怎么执行**：给我 `DATABASE_URL`（我跑 `prisma migrate deploy`）/ 或你自己跑迁移。
   - ⚠️ 没迁移就把 schema 改动推 main 会**直接弄挂线上**（Prisma 客户端期望的新列在生产库不存在）。

### 安全实现顺序（在分支上做，不碰 main/prod，直到迁移就绪）
1. 改 schema：加 `User`、给 `Decision/Review/Profile` 加 `userId?` + `anonId?`。
2. 生成 migration（不部署）。
3. 服务端：Auth.js（邮箱）+ 会话；`/api/*` 按 userId/anonId 隔离；AI 代理 + 速率限制。
4. Web：登录/注册 UI（可选，匿名可跳过）+ 匿名 token + 数据认领。
5. App：登录 UI + 匿名 token + 去掉手填密码，AI 走服务端代理。
6. 你跑迁移 → 合并 → 部署。
