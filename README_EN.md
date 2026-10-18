# Readme Studio

> **Turn your GitHub account into a storefront — generate a beautiful, dynamic, personalized profile README in minutes.**

[![Stars](https://img.shields.io/github/stars/readme-studio/readme-studio?style=flat-square&color=2da44e)](https://github.com/readme-studio/readme-studio/stargazers)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)
[![CI](https://img.shields.io/github/actions/workflow/status/readme-studio/readme-studio/ci.yml?branch=main&style=flat-square&label=CI)](https://github.com/readme-studio/readme-studio/actions)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?style=flat-square&logo=vercel&logoColor=white)](https://readme-studio-sigma.vercel.app)
[![Next.js](https://img.shields.io/badge/Built%20with-Next.js%2015-black?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org)

**Pick a template → fill in your info (or let AI summarize your repos) → preview live → publish to your GitHub profile in one click.** No command line. No token juggling. Everything happens in the browser.

---

## Why Readme Studio?

Your GitHub profile is the first thing people see in the open-source world — but 90% of developer profiles look like this: one line of default text + a few lifeless lists. Readme Studio solves a simple problem:

1. **No time to write** — let AI turn your projects into clean, human-readable one-liners;
2. **No design skills needed** — 23 professional templates, from minimal to cyberpunk, there's one for you;
3. **No fear to publish** — one-click safe publishing via GitHub OAuth, without checking a wall of scary permissions.

## Preview

| Home / Template gallery | Editor (desktop split) | Editor (mobile) | Generated profile |
| --- | --- | --- | --- |
| ![home](docs/screenshots/home-desktop.png) | ![editor](docs/screenshots/editor-desktop.png) | ![mobile editor](docs/screenshots/editor-mobile-form.png) | ![result](docs/screenshots/result-desktop.png) |

Responsive across 375px / 768px / 1280px. Accessibility verified with axe-core — **0 critical / 0 serious** violations on core pages.

## 23 Templates

`minimal` · `paper` · `swiss` · `terminal` · `terminalGreen` · `ide` · `bento` · `magazine` · `newspaper` · `retro` · `sticker` · `ember` · `zen` · `aqua` · `galaxy` · `blueprint` · `brutalist` · `cyberpunk` · `neon` · `vaporwave` · `glassmorphic` · `dashboard` · `snake` — from minimal to terminal, magazine, dashboard, and glassmorphic styles. Type and watch the live preview.

## ✨ Features

- **🤖 AI project summaries** — one clean sentence per featured repo. Defaults to OpenAI `gpt-4o-mini`, supports BYOK (OpenAI / Gemini / Claude), and any OpenAI-compatible service (DeepSeek, SiliconFlow, etc.); **falls back to local Ollama with no API key — try it for free**.
- **🧩 23 templates** — a wide range of styles, live preview, and light/dark theme check before publishing.
- **🚀 One-click publish** — sign in with GitHub and write straight to your profile repo; standard OAuth flow, with a PAT fallback for advanced users.
- **🔒 Minimal permissions** — the default path only asks for the minimum scope needed to publish your profile README. No broad tokens for beginners.
- **🌐 i18n-ready UI** — Simplified Chinese today (locale-switching scaffolding is in place, English locale is next).
- **📱 Fully responsive** — smooth editing on desktop, tablet, and mobile.

## 30-Second Quickstart

1. Open the **[Live Demo](https://readme-studio-sigma.vercel.app)**;
2. Sign in with GitHub, pick a template, and let AI summarize your repos (or fill it in manually);
3. Preview → publish. Done.

Want to self-host? See [Quick start (local development)](#quick-start-local-development) below. For a full walkthrough, see [`docs/user-guide-EN.md`](docs/user-guide-EN.md).

## Tech Stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui · Auth.js (GitHub OAuth) · Octokit · next-intl (i18n) · react-markdown · zod · Vitest + GitHub Actions CI.

## Quick Start (Local Development)

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
| `GITHUB_CLIENT_ID` | ✅ | GitHub OAuth App Client ID |
| `GITHUB_CLIENT_SECRET` | ✅ | GitHub OAuth App Client Secret |
| `AUTH_SECRET` | ✅ | Auth.js session encryption secret (any long random string) |
| `OPENAI_API_KEY` | ⬜ | Enables server-side AI summaries; omit to fall back to local Ollama |
| `OPENAI_BASE_URL` | ⬜ | Point to any OpenAI-compatible service (e.g. DeepSeek, SiliconFlow) |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | ⬜ | Per-IP daily rate limiting in production |
| `NEXTAUTH_URL` | ⬜ | Public URL of the deployment (set in production) |

> **Note for Vercel deployments**: environment variables go in **Vercel project settings**, not `.env.local` in the repo. `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, and `AUTH_SECRET` are all required, otherwise sign-in fails with `error=Configuration` (HTTP 500).

### 3. Create a GitHub OAuth App

1. GitHub → Settings → Developer settings → OAuth Apps → **New OAuth App**
2. **Homepage URL**: `http://localhost:3000`
3. **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Put the generated **Client ID** and **Client Secret** into `.env.local`.

### 4. Run

```bash
pnpm dev
```

Open `http://localhost:3000`.

## Deploy to Vercel

1. Import the repository at [vercel.com/new](https://vercel.com/new);
2. Set the environment variables from the table above — use a **separate production OAuth App** and set `NEXTAUTH_URL` to your Vercel domain;
3. In the production OAuth App, set the callback URL to `https://<your-domain>/api/auth/callback/github`;
4. Deploy, then verify end to end:

- [ ] Open `https://<your-domain>` and confirm templates load
- [ ] Sign in with GitHub and get redirected back without error
- [ ] Generate and publish a README; `https://github.com/<you>/<you>` is updated
- [ ] `NEXTAUTH_URL` matches your production domain exactly (no trailing slash)

## PAT Permissions (Advanced / Fallback)

One-click publishing uses GitHub OAuth and needs no token. If you use the PAT fallback instead, create a **fine-grained** or **classic** token with:

- `Contents: write` — to create / update your profile README
- `Workflows: write` (only if you use Actions-based stats) — optional

> We deliberately use OAuth as the default path to avoid asking beginners for broad personal-access tokens.

## External Dependencies (Honest Notes)

- **Stats cards** (dashboard template) are rendered by the third-party service [github-readme-stats](https://github.com/anuraghazra/github-readme-stats). They may be briefly unavailable under rate limits; this does not affect the rest of your README.
- **AI summaries** call an external LLM: `gpt-4o-mini` when `OPENAI_API_KEY` is set, or a BYOK provider you supply. With no key, the app falls back to a local Ollama model.

## Support This Project

- ⭐ **Star the repo** — the biggest encouragement for an indie developer;
- 🐛 Found a bug? Open an [Issue](https://github.com/readme-studio/readme-studio/issues);
- 🔧 Want to contribute? Send a [Pull Request](https://github.com/readme-studio/readme-studio/pulls);
- 💬 After using it, share a screenshot of your profile so more people see their new storefront.

## License

[MIT](LICENSE)
