# P0 协作开发计划 · 账号体系（匿名优先）

> 目标：账号可选（不登录也能决策）、数据按身份隔离、Web↔App 同步、去掉 App 手填密码、AI 接口限流防刷。

## 协作模型

- **Claude = 主 owner + 集成者**：定契约（schema / API 类型）、做服务端、数据层、Web，最后负责集成与上线。
- **Codex = 模块化承包**：只在 `apps/mobile/**` 内开发（移动端是独立目录，与服务端/Web **零文件重叠**）。

### 三条铁律（避免之前的并发改文件乱象）

1. **目录互斥**：Claude 只动 `prisma/ lib/ proxy.ts app/`（根 Web+服务端）；Codex 只动 `apps/mobile/**`。**任何一方都不碰对方的目录。**
2. **接口先行**：Claude 先合并 `M0 契约`（数据模型 + API 形状），Codex 再据此开发。契约没定，Codex 不动手。
3. **迁移只由人执行**：生产库 Prisma 迁移由你跑（Claude 给命令），**任何 agent 都不自动迁移、不碰 main 直到迁移就绪**。

### 分支策略

- `feat/p0-auth-core`（Claude）、`feat/p0-mobile`（Codex）
- Claude 把两条集成进 `feat/p0` → 你跑迁移 → 合 `main` → Vercel 部署
- 不允许 force-push；集成冲突由 Claude 处理

---

## 模块拆分

| ID | 模块 | Owner | 依赖 | 主要文件（互斥） |
|----|------|-------|------|------------------|
| **M0** | 契约 + DB schema + 迁移文件 | 🟦 Claude | — | `prisma/schema.prisma`、`lib/contracts.ts`(zod+类型)、`prisma/migrations/**` |
| **M1** | 鉴权核心 + 会话 | 🟦 Claude | M0 | `lib/auth.ts`、Auth.js 配置、`lib/identity.ts`(`resolveIdentity→{userId|anonId}`) |
| **M2** | AI 服务端代理 + 限流 | 🟦 Claude | M0 | `app/api/ai/**`、`lib/ratelimit.ts`、`proxy.ts`(撤密码墙) |
| **M3** | API/页面按身份隔离 | 🟦 Claude | M0,M1 | `app/api/decisions/**`、`app/**/page.tsx`(加 where 过滤) |
| **M4** | Web 登录/注册 UI + 匿名 token | 🟦 Claude | M1 | `app/(auth)/**`、`lib/anon.ts`、顶栏登录入口 |
| **C1** | 移动端身份客户端 + 匿名 token | 🟧 Codex | M0,M1 | `apps/mobile/src/services/auth.ts`、`apps/mobile/src/storage/anon.ts` |
| **C2** | 移动端登录/注册 UI | 🟧 Codex | C1 | `apps/mobile/app/(auth)/**` 或设置页内 |
| **C3** | 移动端去密码 + 接管同步 | 🟧 Codex | M2,M3 | `apps/mobile/src/services/api.ts`、`settings.tsx`(删手填密码)、历史改读服务端 |
| **C4** | 移动端"已登录/匿名"状态展示 | 🟧 Codex | C1 | `apps/mobile/app/(tabs)/settings.tsx`、`index.tsx` |

> Web 的"拆解中"状态、共享核心包等属 P1，P0 暂不并入。

---

## M0 契约（Claude 先产出，Codex 据此开发）

> Codex 不直接 import 根目录代码（移动端是独立 package），按本节在 `apps/mobile` 内**镜像**同样的类型与请求形状。后续 P1 再抽 `packages/core` 统一。

### 数据模型（新增/改动）
- `User { id, email, passwordHash, createdAt }`（登录方式见下方待定项）
- `Decision / DecisionReview / UserProfile` 各加 `userId String?` + `anonId String?`（二者至少其一）
- `RateLimit`（若不用 KV）：`{ key, windowStart, count }`

### 身份解析
```
resolveIdentity(req) -> { kind: "user", userId } | { kind: "anon", anonId }
```
- 登录态：从会话取 `userId`
- 匿名态：从请求头 `x-anon-id`（App）或 cookie（Web）取 `anonId`

### AI 代理端点（替代手填密码）
- `POST /api/ai/parse-decision`、`/api/ai/analyze` 不再要 Basic Auth
- 服务端用环境变量里的 DeepSeek key 调用；调用前过 `ratelimit(identity)`
- 限额：匿名 8 次/天 + IP 限额；登录更高；全局每日上限（成本熔断）

### 数据认领（匿名→登录）
- `POST /api/account/claim { anonId }`：把该 anonId 的 Decision/Review/Profile 改挂到当前 userId

### API 返回形状
- 沿用现有 `/api/decisions` 的 JSON 结构，仅**加身份过滤**；字段不变，Codex 现有解析无需大改

---

## 待你拍板（决定 M1 实现）

1. **登录方式**：推荐 v1 = **邮箱 + 密码**（Auth.js Credentials，Web+Expo 都好做、免费、最快）。手机验证码=要短信费；微信=要资质。
2. **限流存储**：推荐 **Vercel KV / Upstash Redis**（原子计数）；否则用 `RateLimit` 表（多一次迁移）。
3. **迁移执行**：你跑 `npx prisma migrate deploy`（Claude 给文件和命令）。

---

## Codex 任务简报（可直接转交）

> 前置：Claude 已合并 M0，`apps/mobile` 内已有镜像的 `contracts`（类型 + 端点常量）。仅在 `apps/mobile/**` 内开发，勿碰其他目录。分支 `feat/p0-mobile`。

- **C1**：实现匿名 token（首次启动生成 UUID 存 AsyncStorage，键 `anonId`），所有 API 请求带 `x-anon-id` 头；实现 `auth.ts`（login/register/logout/session）。
- **C2**：登录/注册界面（沿用小羊暖外壳风格，Primitives 组件），可跳过（匿名继续）。
- **C3**：`api.ts` 去掉 Basic Auth 与手填密码逻辑，AI 调用直连新代理端点；历史页改为「登录则读服务端、匿名读本地+服务端」；`settings.tsx` 删除"访问密码"卡片。
- **C4**：`我的`页显示登录态/邮箱或"匿名"，提供登录入口与登出。

验收：`npm run typecheck` 通过；匿名可完整生成报告；登录后历史跨端可见；无任何手填密码残留。
