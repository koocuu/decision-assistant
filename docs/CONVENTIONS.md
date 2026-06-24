# 协作与代码约定

后续 agent 先读 `docs/ARCHITECTURE.md`、`docs/ROADMAP.md`、`docs/PROGRESS.md`、本文件，再开始改代码。

## 接力规则

- 每个 agent 收工前必须更新 `docs/PROGRESS.md`。
- `docs/PROGRESS.md` 只写活信息：已完成、进行中、下一步、坑、当前分支。
- 不在一个任务里顺手重构无关文件。
- 先查真实仓库状态，再给结论。
- 修改前看 `git status --short --branch`，避免覆盖别人未提交改动。

## 分支与目录边界

- 当前项目允许小步直接在 `main` 上开发并推送，让 Vercel 直接部署。
- 涉及数据库迁移、账号体系、鉴权、删除数据、支付等高风险改动时，优先开分支或至少先提交可回滚的小步。
- Next Web 和 API 在根目录 `app/`、`components/`、`lib/`、`prisma/`。
- Expo App 在 `apps/mobile/**`，已重新启用。
- 共享业务逻辑下一步放到 `packages/core/**`。
- Prisma migration 不自动跑生产库。迁移执行必须由用户明确确认。

## 环境变量

本地真实环境变量放在仓库根目录 `.env`，不要提交。

```env
DATABASE_URL="postgresql://...neon.../...?sslmode=require"
DEEPSEEK_API_KEY="..."
DEEPSEEK_BASE_URL="https://api.deepseek.com"
DEEPSEEK_MODEL="deepseek-chat"
ANDROID_APK_URL="https://.../decision-assistant.apk"
```

生产环境变量在 Vercel Dashboard 设置。

## 密钥规则

- DeepSeek key 只在服务端环境变量中出现：`DEEPSEEK_API_KEY`。
- Web 前端和 Expo App 都不能保存 DeepSeek key。
- Expo App 不能直连 Neon，必须走 Vercel `/api/*`。
- App 登录 token 存 `SecureStore`，不要存普通 AsyncStorage。

## Web + App 约定

- Next 保留 Web、SEO、分享、服务端 API、Prisma、Neon。
- Expo 负责 Android/iOS 原生体验。
- 不再投入 PWA 安装能力。
- UI 不强行共享；设计令牌和业务逻辑优先共享。
- Web 和 App 的核心流程必须一致：创建决策、AI 分析、选择、复盘、画像更新。

## 质量检查

常用检查：

```powershell
npm run lint
npm run build
npm run prisma:generate
```

移动端修改后在 `apps/mobile` 下运行：

```powershell
npm run typecheck
```
