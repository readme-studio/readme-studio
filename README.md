# Readme Studio

> Generate a polished, dynamic, and personalized GitHub profile README in minutes — with AI-powered project summaries, 23 built-in templates, and one-click publishing.

Readme Studio is a web app that turns a GitHub account into a beautiful profile README. Pick a template, fill in your info (or let AI summarize your repos), preview live, and publish to your profile with a single click via GitHub OAuth — no manual token juggling required for beginners.

---

## Screenshots

| Home / Template gallery | Editor (desktop split) | Editor (mobile) | Generated profile |
| --- | --- | --- | --- |
| ![home](docs/screenshots/home-desktop.png) | ![editor](docs/screenshots/editor-desktop.png) | ![mobile editor](docs/screenshots/editor-mobile-form.png) | ![result](docs/screenshots/result-desktop.png) |

Responsive across 375px / 768px / 1280px. Accessibility verified with axe-core (0 critical/serious violations on core pages).

## Features

- **AI project summaries** — describe each pinned repo in one clean sentence, using OpenAI (`gpt-4o-mini`) or a Bring-Your-Own-Key (BYOK) provider (OpenAI / Gemini / Claude). Falls back to a local Ollama model when no API key is configured, so you can test for free.
- **23 templates** — from minimal and terminal to dashboard, neon, glassmorphic, and more. Live preview as you type.
- **One-click publish** — log in with GitHub and publish straight to your profile repository. A PAT fallback is available for advanced users.
- **Beginner friendly** — no command line needed; the whole flow runs in the browser.
- **Light / dark preview** — preview your README under both themes before publishing.
- **Bilingual UI** — English and 中文.

## Tech stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui · Auth.js (GitHub OAuth) · Octokit.

## Quick start (local development)

### Prerequisites

- Node.js 20+
- pnpm
- A GitHub OAuth App (see below)

### 1. Install

```bash
git clone https://github.com/readme-studio/readme-studio.git
cd readme-studio
pnpm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

| Variable | Required | Description |
| --- | --- | --- |
| `GITHUB_CLIENT_ID` | ✅ | GitHub OAuth App client id |
| `GITHUB_CLIENT_SECRET` | ✅ | GitHub OAuth App client secret |
| `AUTH_SECRET` | ✅ | Secret for Auth.js session encryption (any long random string) |
| `OPENAI_API_KEY` | ⬜ | Enables server-side AI summaries. Omit to fall back to local Ollama |
| `OPENAI_BASE_URL` | ⬜ | Point to any OpenAI-compatible service (e.g. DeepSeek, SiliconFlow) |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | ⬜ | Enables per-IP daily rate limiting in production |
| `NEXTAUTH_URL` | ⬜ | Public URL of the deployment (set in production) |

### 3. Create a GitHub OAuth App

1. Go to GitHub → Settings → Developer settings → OAuth Apps → **New OAuth App**.
2. **Homepage URL**: `http://localhost:3000`
3. **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Copy the generated **Client ID** and **Client Secret** into `.env.local`.

### 4. Run

```bash
pnpm dev
```

Open `http://localhost:3000`.

## Deploy to Vercel

1. Import the repository at [vercel.com/new](https://vercel.com/new).
2. Set the environment variables from the table above. Use a **separate production OAuth App** and set `NEXTAUTH_URL` to your Vercel domain.
3. In the production GitHub OAuth App, set the callback URL to `https://<your-domain>/api/auth/callback/github`.
4. Deploy. The production flow (login → generate → publish) should work end to end.

**Production verification checklist:**

- [ ] Open `https://<your-domain>` and confirm templates load.
- [ ] Sign in with GitHub; you are redirected back without error.
- [ ] Generate a README and publish; `https://github.com/<you>/<you>` is updated.
- [ ] `NEXTAUTH_URL` matches your production domain exactly (no trailing slash).

## PAT permissions (advanced / fallback)

The one-click publish uses GitHub OAuth and needs no token. If you choose the PAT fallback instead, create a **fine-grained** or **classic** token with:

- `Contents: write` — to create/update your profile README
- `Workflows: write` (only if you use Actions-based stats) — optional

> We deliberately use OAuth for the default path to avoid asking beginners for broad personal-access tokens.

## External dependencies & honesty

- **Stats cards** (the dashboard template) are rendered by the third-party service [github-readme-stats](https://github.com/anuraghazra/github-readme-stats). They may be briefly unavailable under rate limits; this does not affect the rest of your README.
- **AI summaries** call an external LLM. The server uses `gpt-4o-mini` when `OPENAI_API_KEY` is set, or a BYOK provider you supply. Without any key, the app falls back to a local Ollama model.

## License

[MIT](LICENSE)

---

# Readme Studio（中文）

> 几分钟内生成专业、动态、个性化的 GitHub 个人主页 README —— 内置 AI 项目总结、23 套模板，并支持一键发布。

Readme Studio 是一个 Web 应用，帮助你把 GitHub 账号变成一份漂亮的个人信息 README。选择模板、填写资料（或让 AI 帮你总结仓库），实时预览，登录 GitHub 后一键发布到你的主页仓库——小白无需折腾 Token 即可使用。

## 效果截图

| 首页 / 模板画廊 | 编辑器（桌面分栏） | 编辑器（移动端） | 生成的个人主页 |
| --- | --- | --- | --- |
| ![home](docs/screenshots/home-desktop.png) | ![editor](docs/screenshots/editor-desktop.png) | ![mobile editor](docs/screenshots/editor-mobile-form.png) | ![result](docs/screenshots/result-desktop.png) |

已在 375px / 768px / 1280px 下验证响应式；可访问性经 axe-core 检测，核心页面 0 个 critical/serious 违规。

## 核心特性

- **AI 项目总结** —— 为每个精选仓库生成一句简洁介绍，使用 OpenAI（`gpt-4o-mini`）或自带密钥（BYOK：OpenAI / Gemini / Claude）。未配置密钥时自动回退到本地 Ollama，零费用即可本地测试。
- **23 套模板** —— 从 minimal、terminal 到 dashboard、neon、glassmorphic 等，输入即时预览。
- **一键发布** —— 用 GitHub 登录后直接发布到主页仓库；高级用户仍可使用 PAT 兜底。
- **小白友好** —— 全流程在浏览器内完成，无需命令行。
- **明暗预览** —— 发布前分别以浅色 / 深色主题预览效果。
- **中英双语界面**。

## 技术栈

Next.js 15（App Router）· React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui · Auth.js（GitHub OAuth）· Octokit。

## 快速开始（本地开发）

### 环境要求

- Node.js 20+
- pnpm
- 一个 GitHub OAuth App（见下文）

### 1. 安装

```bash
git clone https://github.com/readme-studio/readme-studio.git
cd readme-studio
pnpm install
```

### 2. 配置环境变量

将 `.env.example` 复制为 `.env.local` 并填写：

```bash
cp .env.example .env.local
```

| 变量 | 是否必填 | 说明 |
| --- | --- | --- |
| `GITHUB_CLIENT_ID` | ✅ | GitHub OAuth App 的 Client ID |
| `GITHUB_CLIENT_SECRET` | ✅ | GitHub OAuth App 的 Client Secret |
| `AUTH_SECRET` | ✅ | Auth.js 会话加密密钥（任意长随机串） |
| `OPENAI_API_KEY` | ⬜ | 启用服务端 AI 总结；不填则回退本地 Ollama |
| `OPENAI_BASE_URL` | ⬜ | 指向任意 OpenAI 兼容服务（如 DeepSeek、SiliconFlow 等） |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | ⬜ | 生产环境按 IP 的每日限额 |
| `NEXTAUTH_URL` | ⬜ | 部署后的公网地址（生产环境填写） |

### 3. 创建 GitHub OAuth App

1. GitHub → Settings → Developer settings → OAuth Apps → **New OAuth App**。
2. **Homepage URL**：`http://localhost:3000`
3. **Authorization callback URL**：`http://localhost:3000/api/auth/callback/github`
4. 将生成的 **Client ID** 与 **Client Secret** 填入 `.env.local`。

### 4. 启动

```bash
pnpm dev
```

打开 `http://localhost:3000`。

## 部署到 Vercel

1. 在 [vercel.com/new](https://vercel.com/new) 导入仓库。
2. 按上表填写环境变量；生产环境建议使用**独立的 OAuth App**，并将 `NEXTAUTH_URL` 设为你的 Vercel 域名。
3. 在生产 OAuth App 中，将回调地址设为 `https://<你的域名>/api/auth/callback/github`。
4. 部署。生产流程（登录 → 生成 → 发布）应端到端可用。

**生产环境验证清单：**

- [ ] 打开 `https://<你的域名>`，确认模板正常加载。
- [ ] 用 GitHub 登录，能无报错地跳转回来。
- [ ] 生成并发布 README，`https://github.com/<你>/<你>` 被更新。
- [ ] `NEXTAUTH_URL` 与你的生产域名完全一致（结尾不要带斜杠）。

## PAT 权限说明（高级 / 兜底）

一键发布默认使用 GitHub OAuth，无需 Token。若改用 PAT 兜底，请创建**细粒度**或**经典** Token，并授予：

- `Contents: write` —— 创建 / 更新你的个人主页 README
- `Workflows: write`（仅在使用 Actions 统计卡片时需要）—— 可选

> 默认走 OAuth 是为了避免向小白索取权限过宽的个人访问令牌。

## 外部依赖说明（如实告知）

- **统计卡片**（dashboard 模板）由第三方服务 [github-readme-stats](https://github.com/anuraghazra/github-readme-stats) 提供，可能在限流时短暂不可用，不影响 README 其余部分。
- **AI 总结** 调用外部大模型。服务端在配置 `OPENAI_API_KEY` 时使用 `gpt-4o-mini`，或你提供的 BYOK 服务商；无任何密钥时回退本地 Ollama。

## 许可证

[MIT](LICENSE)
