# 决策助手进度账本

每个 agent 收工前更新本文件。只记录能帮助下一个人接上的事实。

## 当前状态

- 日期：2026-06-24
- 当前工作树分支：`feat/pwa-foundation`
- 战略方向已调整为：Web/PWA 优先，Expo 原生 App 暂时封存。
- 根目录新增接力文档：`ARCHITECTURE.md`、`CONVENTIONS.md`、`PROGRESS.md`。
- 当前仓库没有真实 `.env`，只有 `.env.example`。
- 本地真实 `.env` 应放在仓库根目录，与 `package.json` 同级。
- PWA 基础已在 `feat/pwa-foundation` 开始实现。
- 移动端 P0 未提交改动已按用户确认废弃并清理；Expo App 继续作为封存基线保留。

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

## 进行中 / 未完成

- P0 账号体系服务端仍需完成并集成。
- PWA 已完成基础能力；还未做 Lighthouse 评分和真机添加到主屏验证。
- Neon 的 direct/unpooled `DATABASE_URL` 还未填入本地 `.env`。
- DeepSeek API key 还未填入本地 `.env`。
- 上一轮移动端改动已清理，不再作为当前主线交付内容。

## 下一步建议

1. 补根目录 `.env`：
   - `DATABASE_URL`：Neon direct/unpooled 连接串。
   - `DEEPSEEK_API_KEY`：Vercel 或 DeepSeek 控制台里的 key。
2. 有 `DATABASE_URL` 后重新启动本地 dev server，验证首页、历史页、详情页这些依赖 Prisma 的页面。
3. 做 Lighthouse/PWA 审计，补缺失项。
4. 继续 P0 账号体系服务端与 Web 登录/匿名数据认领。

## 坑与注意事项

- 不要把真实 `.env`、Neon 连接串、DeepSeek key 提交进 git。
- 不要在没有用户确认的情况下跑生产数据库迁移。
- PWA 是现有 Web 增强，不是另起一个前端项目。
- Expo App 暂时封存后，不应再因为账号体系同步主动修改 `apps/mobile/**`。
- 当前本地首页无法可视化验证，是因为缺少 `DATABASE_URL`，Prisma 初始化报错；不是 PWA 静态资源或前端壳子构建失败。
