# 决策助手进度账本

每个 agent 收工前更新本文件。只记录能帮助下一个人接上的事实。

## 当前状态

- 日期：2026-06-24
- 当前工作树分支：`main`
- 战略方向已调整为：Web/PWA 优先，Expo 原生 App 暂时封存。
- 当前仓库有本地真实 `.env`，但 `.gitignore` 会忽略它；仓库可提交文件里只有 `.env.example`。
- 本地真实 `.env` 应放在仓库根目录，与 `package.json` 同级。
- PWA 基础已合入并推送 `main`。
- 移动端 P0 未提交改动已按用户确认废弃并清理；Expo App 继续作为封存基线保留。
- `P0-PLAN.md` 已删除；账号体系以 `docs/ROADMAP.md` 的 P0 为准。
- P0 账号体系正在 `main` 上实现，尚未提交。

## 已完成

- 确认 Web 技术栈为 Next.js，可直接作为 PWA 基础改造。
- 确认 `.gitignore` 已忽略 `.env` 和 `.env*.local`。
- 确认 DeepSeek 服务端读取变量名为 `DEEPSEEK_API_KEY`。
- 确认 Prisma 数据库连接读取变量名为 `DATABASE_URL`。
- 建立三份接力文档骨架。
- 新增 PWA manifest、service worker、离线页、PWA 图标。
- Web 全局壳子新增移动端底部 tab 和安装提示。
- 首页、历史筛选页、决策创建表单做了移动端 App 化调整。
- 复用 Expo 图标作为 PWA icon，避免品牌视觉分叉。
- `npm run lint` 通过。
- `npm run build` 通过。
- 本地验证 `/decisions/new`：manifest 存在、输入框可见、底部 tab 存在、390px 宽无横向溢出。
- 本地验证 PWA 资源：`/manifest.webmanifest`、`/sw.js`、`/icons/icon-192.png`、`/offline` 均可访问。
- 清理 Markdown：保留 `docs/ARCHITECTURE.md`、`docs/CONVENTIONS.md`、`docs/PROGRESS.md`、`docs/ROADMAP.md`，删除旧并行移动端计划 `P0-PLAN.md`。
- 将根目录 Markdown 收进 `docs/`，根目录保持干净。
- 新增 P0 账号 schema/migration：`User`、`UserSession`、`RateLimit`，并给 `Decision`、`DecisionReview`、`UserProfile` 增加 `userId/anonId`。
- 新增 Web/PWA 账号能力：匿名 cookie、session cookie、登录/注册/登出/session/claim API。
- 首页、历史页、详情页、画像页和决策 API 已按当前身份过滤。
- AI 生成、分析、画像更新接口已改为身份/IP/全站日额度。
- `/profile` 现在作为“我的”页，显示匿名/邮箱账号状态和登录/退出入口。
- 封存的 Expo App 已移除旧的手填 AI 鉴权 UI 和共享鉴权 header。
- Web 决策创建后会进入 `/decisions/[id]/analyzing`，用小羊分析中页面自动调用 AI，完成后跳转详情页。
- 生产迁移已执行：`npm run prisma:deploy` 成功应用 `20260624000000_add_accounts` 到 Neon `neondb/public`。

## 进行中 / 未完成

- P0 账号体系代码已完成本地验证，尚未提交/推送。
- PWA 已完成基础能力；还未做 Lighthouse 评分和真机添加到主屏验证。
- 上一轮移动端改动已清理，不再作为当前主线交付内容。

## 下一步建议

1. 提交并推送 `main`，触发 Vercel 部署。
2. 部署后在线验证匿名生成、注册/登录、历史隔离、账号认领和分析中页面。
3. 做 Lighthouse/PWA 审计，补缺失项。

## 坑与注意事项

- 不要把真实 `.env`、Neon 连接串、DeepSeek key 提交进 git。
- 本地 `.env` 已用于执行生产迁移，不要提交 `.env`。
- PWA 是现有 Web 增强，不是另起一个前端项目。
- Expo App 暂时封存；本轮仅清理旧共享鉴权残留，不做生产化。
- 生产迁移已经完成，可以推送本轮 P0 代码到 `main`。
