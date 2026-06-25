# 决策助手 Decision Assistant

一个带“小羊暖外壳”的 AI 决策工具：用户随手写下纠结，系统把它拆成选项、风险、低后悔行动，并在事后复盘沉淀个人决策画像。

- 在线体验：https://decision.koocuu.com/
- 当前定位：作品集 / 简历展示 / 给朋友体验
- 核心闭环：输入纠结 → AI 拆解 → 决策报告 → 复盘 → 个人画像

## 高光截图

| 首页 | 报告页 |
|---|---|
| <img width="1724" height="2042" alt="决策助手首页" src="https://github.com/user-attachments/assets/7ebfc21b-1411-4400-ba22-afa077cd1f5b" /> | <img width="1706" height="937" alt="决策报告页" src="https://github.com/user-attachments/assets/e5cdf525-927a-438b-b84a-8cf7936c136f" /> |

| 生成中 | 跨端展示 |
|---|---|
| <img width="1709" height="1877" alt="AI 生成中状态" src="https://github.com/user-attachments/assets/76746fb9-c9bb-44bd-ad09-62057895b3c6" /> | <img width="1699" height="933" alt="Web 与 App 跨端展示" src="https://github.com/user-attachments/assets/4629b041-e1e9-4ea6-b34e-d167a7d9a0ee" /> |

<details>
<summary>更多界面截图</summary>

<img width="1736" height="3134" alt="移动端详情长图" src="https://github.com/user-attachments/assets/6257314c-4ec5-41cd-825a-8bc8a4d42d39" />

<img width="1707" height="2063" alt="账号与画像页面" src="https://github.com/user-attachments/assets/e30e57b2-49c6-4d12-9ee2-3e62cafc512f" />

</details>

## 技术栈

- Web：Next.js App Router、React、Tailwind CSS
- App：Expo SDK 54、Expo Router、React Native SVG
- 数据库：Neon Postgres + Prisma
- AI：DeepSeek，经 Next/Vercel 服务端代理
- 账号：邮箱密码登录、httpOnly cookie、App Bearer token、匿名 `anonId`
- 部署：Vercel

## 架构简图

```mermaid
flowchart LR
  User["用户"] --> Web["Next Web"]
  User --> App["Expo App"]
  Web --> API["Next /api/*"]
  App --> API
  API --> Neon["Neon Postgres"]
  API --> DeepSeek["DeepSeek API"]
  API --> Auth["账号 / 匿名身份"]
```

关键边界：

- DeepSeek key 只在服务端环境变量中出现。
- Expo App 不直连 Neon，不保存 AI key，只调用同一套 `/api/*`。
- Web 使用 cookie session；App 使用 Bearer token + SecureStore。
- 匿名用户也能完整生成报告，登录后匿名数据 claim 到账号。

## 本地运行

```powershell
npm install
npm run prisma:generate
npm run dev
```

移动端：

```powershell
cd apps/mobile
npm install
npm run start
```

需要的本地环境变量见 `.env.example`。真实 `.env` 不要提交。

## 验证命令

```powershell
npm run lint
npm run build
```

移动端：

```powershell
cd apps/mobile
npm run typecheck
```

## 项目文档

- [产品文档](docs/产品文档.md)
- [架构文档](docs/架构文档.md)
- [作品打磨需求](docs/作品打磨需求.md)
- [产品/技术复盘](docs/复盘.md)
- [进度账本](docs/进度账本.md)

## 作品状态

已完成：

- Web 账号体系与用户/匿名数据隔离
- AI 生成、报告、复盘、画像闭环
- Expo App 账号同步与服务端历史读取
- Web/移动端小羊四态角色系统
- Android APK 下载入口

暂不做：

- App Store 上架
- OG 大图、analytics、重测试体系
- 大规模增长和商业化验证

