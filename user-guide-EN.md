# Readme Studio User Guide

> Continuing from the README's **30-second quickstart**: **pick a template → fill in your info (or let AI summarize) → preview live → publish in one click.**
> This guide walks through every step in detail — for first-time users, for advanced users who prefer their own key / PAT, and for deployers and operators.

---

## 1. What Is This? (30 Seconds)

Readme Studio is a web app that turns a GitHub account into a **polished, professional, AI-summarized** profile README — no Markdown skills, no command line, no token setup required:

- **23 templates** — `minimal`, `terminal`, `dashboard`, `neon`, `glassmorphic`… preview as you type;
- **AI project summaries** — one clean sentence per featured repo (site-configured or your own key, or free local Ollama);
- **One-click publish** — sign in with GitHub, push straight to your profile repo, all inside the browser.

You can ship a result in 3 steps (see section 2); then spend 10 minutes on the detailed walkthrough (section 3) to fine-tune it your way.

> **A note on UI language**: the app currently ships its interface in **Simplified Chinese** (i18n scaffolding is in place, English locale is next). The button names below use their English equivalents so the guide reads naturally; on the current UI you'll see the same controls labelled in Chinese (e.g. **「登录 GitHub」** = *Sign in with GitHub*).

---

## 2. 30-Second Quickstart (Ship First, Refine Later)

1. Open the **[Live Demo](https://readme-studio-sigma.vercel.app)** (or your own deployment);
2. Click **Sign in with GitHub** in the top-right, authorize, then pick a template, enter your name, and select the repos you want to feature (AI summary optional);
3. Click **Next: Generate** → **Publish with GitHub Account**. Your profile is live in about 30 seconds.

> Deploying it yourself instead? See the **Appendix** or the README_EN's *Quick Start (Local Development)*.
> Section 3 below is the full, expanded version of these 30 seconds — every step with screenshots and gotchas.

---

## 3. Detailed Guide for Users (6 Steps)

### Prerequisites

- A **GitHub account**;
- Access to a deployed URL (e.g. the Demo or `https://your-domain`), or a local run (see Appendix).

### Step 1 — Sign in with GitHub

1. Open the site, click **Sign in with GitHub** in the top-right (current UI: **「登录 GitHub」**).
2. On GitHub's authorization page, click **Authorize**.
3. You'll be redirected back to the app, signed in.

> **About the permissions (safe to authorize)**: we request only two minimal scopes —
> `read:user` (your public profile) and `public_repo` (read/write to your **public** repos).
> We never touch your private repos or other projects.
> Publishing only writes (or creates) the `README.md` of your profile repo `github.com/you/you`.

### Step 2 — Pick a Template

- The home template gallery shows all **23 templates** with thumbnails: minimal, terminal, dashboard, neon, glassmorphic, magazine, vaporwave, and more.
- Click any template to switch in the editor; the preview updates live.
- Can't decide? Beginners: `minimal` (safest, cleanest) or `dashboard` (shows off your activity).

| Home / Template gallery | Editor (desktop split) |
| --- | --- |
| ![home](screenshots/home-desktop.png) | ![editor](screenshots/editor-desktop.png) |

### Step 3 — Fill In Your Info

Fill in the form on the left side of the editor:

| Field | Description | Required |
| --- | --- | --- |
| Name | The name shown on your profile | Recommended |
| Tagline | One-line positioning, e.g. "Full-stack developer / open-source enthusiast" | Optional |
| Bio | 2–3 sentences about yourself | Optional |
| Location / Company | Where you are and where you work | Optional |
| Social links | GitHub / Twitter / LinkedIn / Blog / Email | Optional |

**Choose the repos to feature:**

- Click **Pull from GitHub** to load your repository list (searchable; sort by stars / updated / name; multi-select).
- Check 3–6 representative projects.
- Toggle up to 4 **stats cards**: Stars / Commits / PRs / Languages (used by dashboard-style templates).

### Step 4 — Let AI Write Your Project Summaries (Optional, Recommended)

1. Check the repos you want summarized (max 6 per run);
2. Click **AI-summarize selected projects** — each repo gets one clean, professional one-liner;
3. Regenerate or edit the text manually if you're not happy.

**Don't want to use the site's default AI? Three options (details in section 4):**

- Site-configured OpenAI → nothing to do, just use it;
- Bring Your Own Key (BYOK) → paste your own OpenAI / Gemini / Claude key when quota runs out; OpenAI/Gemini connect straight from your browser, keys never touch our server;
- Local Ollama → free and fully offline.

### Step 5 — Preview

- WYSIWYG: the right side re-renders the Markdown as you type.
- Switch **Light / Dark / System** preview theme at the top to check how both look (hint: the GitHub profile renders with *visitors'* system theme, so check both before publishing).
- Works on mobile too: on narrow screens the editor switches to "Edit / Preview" tabs.

| Editor (mobile) | Generated profile |
| --- | --- |
| ![mobile editor](screenshots/editor-mobile-form.png) | ![result](screenshots/result-desktop.png) |

### Step 6 — Publish in One Click

1. Click **Next: Generate** to open the result page;
2. While signed in, click **Publish with GitHub Account** — the app creates (if missing) your profile repo `github.com/you/you` and writes `README.md` into it;
3. After a successful publish, click **View My Profile** to see the new README live;
4. Want changes? Go back to the editor, edit, and publish again to overwrite.

> You only authorize once. The repo name is fixed to your username and maps to your GitHub profile; you can always edit this README directly on GitHub.

---

## 4. AI Summaries: The Three Options (In Detail)

| Option | Who pays for API | Where data goes | Setup needed | Best for |
| --- | --- | --- | --- | --- |
| ① Server-side OpenAI | The site owner (if `OPENAI_API_KEY` configured) | Through the site's server with the default model | Nothing | Most users |
| ② BYOK (your own key) | You | OpenAI/Gemini **straight from your browser**; Claude via a minimal proxy — **no key stored** | Paste your key in the settings | Privacy-conscious users / your own quota / site quota exhausted |
| ③ Local Ollama | Free (local compute) | Fully offline, never leaves your machine | Ollama installed and running locally | Zero cost / offline usage |

**BYOK setup:**

- OpenAI: an `sk-...` API key;
- Gemini: a key from Google AI Studio;
- Claude (Anthropic): forwarded by a minimal site-side proxy because of browser CORS restrictions; the key is used in the request only and is not stored.

> All three options share the same system prompt, so summary style stays consistent. BYOK keys live only in your browser's localStorage — never uploaded to the server, never counted against the site's daily quota.

---

## 5. Not Using One-Click Publish? PAT Fallback (Advanced)

The default path uses **GitHub OAuth** (minimal scope, `public_repo` only). If you'd rather skip OAuth, choose **Publish with Token** in the publish dialog and paste a **Personal Access Token (PAT)**.

### Creating a fine-grained PAT

1. GitHub → Settings → Developer settings → **Personal access tokens** → **Fine-grained tokens** → Generate new token;
2. Set an expiration (short is better; delete when done);
3. **Repository access**: `Only select repositories` → select your profile repo (`your-username/your-username`);
4. Permissions:
   - **Repository permissions → Contents**: **Read and write** (to write `README.md`);
   - **Account permissions → Account administration**: **Read and write** (only needed to *create* the profile repo if it doesn't exist);
   - If your profile repo **already exists**, only `Contents: Read and write` is needed — no account permission.
5. **Copy the token immediately** after generating (shown only once).

> **Delete the token after publishing.** Untrusted tokens on your account are a liability.

---

## 6. FAQ

**Q: Signed in but the page doesn't react / bounces back logged out?**
- Make sure third-party cookies aren't blocked (GitHub OAuth callbacks depend on them);
- Confirm the OAuth App callback URL matches your deployment domain exactly (`https://`, no trailing slash);
- Clear the old session or try an incognito window.

**Q: Sign-in fails with `Configuration` (or page 500)?**
This is a **deployment-side** misconfiguration, not yours — the site owner needs to fix it:
1. Vercel → Project → **Settings → Environment Variables** — confirm all three are set and correct:
   - `GITHUB_CLIENT_ID` (OAuth App Client ID)
   - `GITHUB_CLIENT_SECRET` (Client Secret)
   - `AUTH_SECRET` (any long random string for session encryption)
2. **Important**: set these in the deployment platform's environment variables — `.env.local` in the repo is not read;
3. **Redeploy** after changing variables;
4. Also confirm the OAuth App callback URL is `https://your-domain/api/auth/callback/github`.

**Q: Publish fails with an English error code?**
Error codes come back in the server response:

| Code | Meaning | Fix |
| --- | --- | --- |
| `AUTH` | Not authorized / invalid token | Re-sign in, or check your PAT is correct and not expired |
| `SCOPE` | Token lacks permission | OAuth: `public_repo`; PAT: `Contents: write` (plus account permission if the repo must be created) |
| `RATE` | GitHub API rate limit | Wait a few minutes and retry |
| `NETWORK` | Network error | Check your connection and retry |
| `OTHER` | Anything else | Read the detailed message; open an issue if needed |

**Q: Stats cards (Stars / Commits etc.) sometimes don't show?**
- These cards are provided by the third-party service [github-readme-stats](https://github.com/anuraghazra/github-readme-stats), which can briefly hit GitHub API rate limits;
- This doesn't affect the rest of your README; if it bothers you, disable the stats cards in the template or pick a template that doesn't depend on external stats.

**Q: Not enough templates / want to customize?**
- Currently 23 templates; adding one is easy for developers (see the template guide in `CONTRIBUTING.md`). PRs welcome.

**Q: Is my data saved anywhere?**
- Your session is only used to generate and publish; BYOK keys live only in your browser's localStorage — not sent to the server, not stored.

---

## 7. Appendix: For Deployers & Operators

Before handing the app to users, confirm:

1. **Deployed to a reachable domain** (Vercel or your own server) — see the README_EN's *Deploy to Vercel*;
2. **Environment variables configured**, at minimum:

   | Variable | Required | Description |
   | --- | --- | --- |
   | `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | ✅ | GitHub OAuth App credentials |
   | `AUTH_SECRET` | ✅ | Auth.js session encryption secret (long random string) |
   | `NEXTAUTH_URL` | ✅ (production) | Your public domain, no trailing slash |
   | `OPENAI_API_KEY` | ⬜ | Enables server-side AI summaries; omit to fall back to local Ollama |
   | `OPENAI_BASE_URL` / `OPENAI_MODEL` | ⬜ | Any OpenAI-compatible service (DeepSeek, SiliconFlow, etc.) |
   | `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | ⬜ | Per-IP daily rate limits in production |

3. **GitHub OAuth App callback** set to `https://your-domain/api/auth/callback/github`;
4. **Production verification checklist** (run login → generate → publish end to end):
   - [ ] Home loads and templates render
   - [ ] Sign in with GitHub and bounce back without error
   - [ ] Generate & publish a README; `github.com/you/you` is updated
   - [ ] `NEXTAUTH_URL` matches your production domain exactly (no trailing slash)
5. **CI passes**: `.github/workflows/ci.yml` runs lint / typecheck / test / build on every push & PR; `PUPPETEER_SKIP_DOWNLOAD=true` is already set so CI won't try to download Chromium.

---

*This guide is for users and operators. Developers and contributors: see `README_EN.md` (development & deployment) and `CONTRIBUTING.md` (contribution guide).*
