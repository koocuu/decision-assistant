# 协作与代码约定

后续 agent 先读 `ARCHITECTURE.md`、`PROGRESS.md`、本文件，再开始改代码。

## 接力规则

- 每个 agent 收工前必须更新 `PROGRESS.md`。
- `PROGRESS.md` 只写活信息：已完成、进行中、下一步、坑、当前分支。
- 不在一个任务里顺手重构无关文件。
- 先查真实仓库状态，再给结论。
- 修改前看 `git status --short --branch`，避免覆盖别人未提交改动。

## 分支与目录边界

- 不直接在 `main` 上开发。
- 服务端/Web 改动在独立功能分支做。
- 原生 Expo App 已决定暂时封存；除非任务明确要求，不主动改 `apps/mobile/**`。
- Prisma migration 不自动跑生产库。迁移执行必须由用户明确确认。

## 环境变量

本地真实环境变量放在仓库根目录 `.env`：

```text
C:\Users\zhangtong03\Documents\Codex\2026-05-11\https-github-com-koocuu-decision-assistant\.env
```

不要放到 `apps/mobile/.env`。不要提交 `.env`。

当前 `.gitignore` 已忽略：

```gitignore
.env
.env*.local
```

本地 `.env` 可从 `.env.example` 复制后填写：

```env
DATABASE_URL="postgresql://...neon.../...?sslmode=require"
DEEPSEEK_API_KEY="..."
DEEPSEEK_BASE_URL="https://api.deepseek.com"
DEEPSEEK_MODEL="deepseek-chat"
```

Neon 迁移用连接串使用 direct/unpooled 版本，放在根目录 `.env` 的 `DATABASE_URL`。

## 密钥规则

- DeepSeek key 只在服务端环境变量中出现：`DEEPSEEK_API_KEY`。
- 前端、PWA、移动端都不能保存 DeepSeek key。
- 生产环境变量在 Vercel Dashboard 设置。
- 本地开发环境变量在根目录 `.env` 设置。

## PWA 约定

- PWA 基于当前 Next.js Web 端增强，不引入新前端框架。
- 优先补移动端 Web 可用性，再补 manifest/service worker。
- 不为了 PWA 牺牲 Web 的 SEO 与分享能力。
- 不主动维护 Expo App，除非用户明确要求解封。

## 质量检查

常用检查：

```powershell
npm run lint
npm run build
npm run prisma:generate
```

移动端如被明确要求修改，再在 `apps/mobile` 下运行：

```powershell
npm run typecheck
```

