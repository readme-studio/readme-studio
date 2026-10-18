# Readme Studio 用户操作手册

> 适用对象：第一次使用 Readme Studio 生成并发布 GitHub 个人主页 README 的用户。
> 也包含一小节「部署 / 运维人员」须知（见文末附录），方便把系统交给用户使用前做最后检查。

---

## 一、这是什么（30 秒了解）

Readme Studio 是一个网页工具，帮你把 GitHub 账号变成一份**好看、专业、带 AI 总结**的个人主页 README。

你不需要会写 Markdown、不需要命令行、不需要折腾 Token：

- **23 套模板**：极简、终端、数据面板、霓虹、玻璃拟态…… 输入即预览。
- **AI 项目总结**：每个精选仓库自动生成一句干净的中文简介（无服务端 Key 时自动用内置离线生成器，也可自带 Key 升级真·AI）。
- **一键发布**：用 GitHub 登录后，直接把 README 推到你的主页仓库。

---

## 二、使用者快速开始（6 步）

### 前提条件

- 一个 **GitHub 账号**。
- 访问部署好的网址（例如 `https://你的域名`），或本地运行（见附录）。

### 步骤 1 — 用 GitHub 登录

1. 打开网站，点击右上角 **「登录 / Sign in with GitHub」**。
2. 首次会跳转到 GitHub 授权页，点击 **Authorize（授权）**。
3. 跳回网站即登录成功。

> **授权范围说明（放心点授权）**：我们仅申请两个最小权限——
> `read:user`（读取你的公开资料）和 `public_repo`（读写你的**公开**仓库）。
> 不会触碰你的私有仓库，也不会动你其他项目的代码。
> 发布时，只会写入你的个人主页仓库 `github.com/你/你` 的 `README.md`。

### 步骤 2 — 选择模板

- 首页或编辑器里展示全部 **23 套模板**，带缩略图。
- 点击任意模板即可切换；右侧 / 下方实时预览效果。
- 想不出选哪个？新手推荐 `minimal`（极简）或 `dashboard`（数据面板）。

### 步骤 3 — 填写资料

在编辑页左侧表单填写：

| 字段 | 说明 | 是否必填 |
| --- | --- | --- |
| 姓名 Name | 展示在主页的名字 | 建议填 |
| 标语 Tagline | 一句话定位，如「全栈开发者 / 开源爱好者」 | 可选 |
| 简介 Bio | 2–3 句话自我介绍 | 可选 |
| 所在地 / 公司 | 展示地理位置与所属 | 可选 |
| 社交链接 | GitHub / Twitter / LinkedIn / 博客 / 邮箱 | 可选 |

**选择要展示的仓库：**

- 点击「选择仓库」，会从你的 GitHub 拉取仓库列表（可搜索、按星标/更新时间排序、多选）。
- 勾选你最想展示的 3–6 个代表项目。
- 下方可开关 4 类**统计卡片**：Stars / Commits / PRs / Languages（看板类模板用到）。

### 步骤 4 — 让 AI 写项目简介（可选，但推荐）

1. 在选中的仓库上勾选 **「用 AI 总结」**。
2. 点击 **「生成总结」**，每个仓库会收到一句克制、专业的中文简介。
3. 不满意可重新生成，或手动修改文本框。

**不想用云端 AI？几种方式任选（详见第四节）：**

- 内置离线生成器（默认）→ 无服务端 Key 时自动启用，零依赖、完全免费、永远可用。
- 站点已配置 OpenAI（或 `OPENAI_BASE_URL` 指向免费兼容源）→ 直接用，你无需任何操作。
- 自带 Key（BYOK）→ 在设置里填入你自己的 OpenAI / Gemini / Claude Key，或任意 OpenAI 兼容源（DeepSeek、硅基流动等免费额度），浏览器直连，Key 不经过本服务器。

### 步骤 5 — 预览

- 编辑即所见即所得，右侧实时渲染 Markdown。
- 点 **浅色 / 深色** 切换主题，确认两种背景下都好看。
- 手机端也能操作：窄屏下编辑页会切换为「编辑 / 预览」标签页。

### 步骤 6 — 一键发布

1. 点击 **「发布 / Publish」**。
2. 已登录状态下，系统直接把生成的 README 推送到 `github.com/你/你` 仓库。
3. 发布成功后，打开你的 GitHub 主页即可看到新 README。
4. 想改？回来改完再点一次发布即可覆盖更新。

---

## 三、不使用一键发布？PAT 兜底方案（高级用户）

如果你不想走 GitHub OAuth 登录，可以用 **Personal Access Token（PAT）** 手动授权发布。

### 如何创建细粒度 PAT

1. GitHub → Settings → Developer settings → **Personal access tokens** → **Fine-grained tokens** → Generate new token。
2. 设置有效期（建议短期，用完即删）。
3. **Repository access** 选择 `Only select repositories` → 勾选你的主页仓库（`你的用户名/你的用户名`）。
4. **Permissions → Repository permissions → Contents** 设为 **Read and write**。
5. 生成后**立刻复制**令牌（只显示一次）。

### 在哪里使用

- 在发布弹窗里选择「使用 Token（PAT）」模式，粘贴上面的令牌。
- 发布完成后**建议立即删除该令牌**，避免泄露风险。

> 默认路径仍推荐 OAuth 一键发布：它权限最小（仅 `public_repo`），且不用你把长期令牌写在别处。

---

## 四、AI 总结的几种方式（详解）

| 方式 | 谁来付 API 费用 | 数据去向 | 是否需要配置 | 适合谁 |
| --- | --- | --- | --- | --- |
| ① 内置离线生成器（默认） | 免费 | 不出本机，仅用仓库公开信息本地合成 | 自动生效（无服务端 Key 时） | 所有人；零成本开箱即用 |
| ② 站点服务端 OpenAI | 站长（已配 `OPENAI_API_KEY`，可经 `OPENAI_BASE_URL` 指向 DeepSeek/硅基流动等免费兼容源） | 经本站服务器调用模型 | 你无需操作 | 大多数用户 |
| ③ BYOK 自带 Key | 你自己 | OpenAI/Gemini/Claude/**任意 OpenAI 兼容源** 浏览器直连；Key 均不存储 | 在设置填入你的 Key | 在意隐私 / 想用自己额度 |
| ④ 本地 Ollama（进阶） | 免费（本地算力） | 完全离线 | 本地装 Ollama 并把 `OPENAI_BASE_URL` 指向其 `/v1` 端点 | 想完全自托管 |

**BYOK 填写指引：**

- OpenAI：填 `sk-...` 开头的关键字。
- Gemini：填 Google AI Studio 申请的 API Key。
- Claude（Anthropic）：因浏览器 CORS 限制，由本站一个最小代理转发，Key 只在请求中使用、不落库。
- OpenAI 兼容源（DeepSeek / 硅基流动 / 通义千问等）：选「OpenAI 兼容」并填写 Base URL（如 `https://api.deepseek.com/v1`）与模型名（如 `deepseek-chat`）。多数厂商提供免费额度，Key 不落服务器。

> 提示词一致，摘要风格统一；离线生成器走的是规则合成，质量略逊于真·LLM，但永远可用、永不联网失败。

### 免费 Key 去哪领（真·AI 零成本）

想升级真·AI 但不想花钱？以下渠道均有免费额度（政策可能随时间调整，以官网为准）：

| 渠道 | 免费额度 | Base URL | 推荐模型 | 备注 |
| --- | --- | --- | --- | --- |
| **硅基流动** | 手机号注册送约 2000 万 Tokens；9B 以下模型永久免费 | `https://api.siliconflow.cn/v1` | `deepseek-ai/DeepSeek-V3`、`Qwen/Qwen2.5-7B-Instruct` | 国内直连，最推荐 |
| **DeepSeek 官方** | 新用户赠送约 10 元 / 百万级 Tokens | `https://api.deepseek.com/v1` | `deepseek-chat` | 中文质量好，超出后约每百万输入 1 元 |
| **Google AI Studio** | 免费层不绑卡、不过期；Flash-Lite 约 1000 次/日、Flash 约 250 次/日 | `https://generativelanguage.googleapis.com/v1beta/openai/` | `gemini-2.5-flash-lite` | 需能访问 Google，高峰期限速 |
| **智谱 GLM** | `glm-4.5-flash` 标注免费 | `https://open.bigmodel.cn/api/paas/v4` | `glm-4.5-flash` | 国内直连 |

**领取步骤（以硅基流动为例，其他平台同理）：**

1. 打开官网（`cloud.siliconflow.cn`），手机号 / 邮箱注册。
2. 进入控制台 → 左侧「API 密钥」→ 新建 API 密钥。
3. 复制 `sk-` 开头的密钥（只显示一次，妥善保存）。
4. 在本站 BYOK 弹窗选「**OpenAI 兼容**」，粘贴密钥 + 上表对应的 **Base URL** + **模型名**，保存即可。

> 安全提示：Key 只存在你的浏览器 localStorage，不经过/不存储在站点服务器；但仍建议不要把 Key 发给他人或提交到代码仓库。

---

## 五、常见问题（FAQ）

**Q：登录后页面没反应 / 跳回但没登录？**
- 确认浏览器未禁用第三方 Cookie（GitHub OAuth 回调依赖之）。
- 确认 OAuth App 的回调地址与部署域名完全一致（含 `https://`、不含结尾斜杠）。
- 清掉旧会话重试，或换无痕窗口。

**Q：点击登录直接报错 `Configuration`（或页面 500）？**
这是**部署侧**配置缺失，不是你的问题，需站长处理：
- 登录 Vercel → 项目 → **Settings → Environment Variables**，确认以下三项都已设置且值正确：
  1. `GITHUB_CLIENT_ID`（GitHub OAuth App 的 Client ID）
  2. `GITHUB_CLIENT_SECRET`（Client Secret）
  3. `AUTH_SECRET`（任意长随机串，用于会话加密）
- **注意**：这些必须设在 Vercel 项目环境变量里，写在仓库的 `.env.local` 不会被 Vercel 读取。
- 改完变量后需**重新部署**一次才会生效。
- 另请确认 GitHub OAuth App 的回调地址为 `https://你的域名/api/auth/callback/github`。

**Q：发布失败，提示一串英文错误码？**
错误码定义在服务端 `PushResponse.code`，含义如下：

| 错误码 | 含义 | 处理建议 |
| --- | --- | --- |
| `AUTH` | 未授权 / 令牌无效 | 重新登录，或检查 PAT 是否正确、是否过期 |
| `SCOPE` | 令牌权限不足 | OAuth 需 `public_repo`；PAT 需 `Contents: write` |
| `RATE` | GitHub API 限流 | 稍等几分钟再试 |
| `NETWORK` | 网络异常 | 检查网络后重试 |
| `OTHER` | 其他 | 看详细报错，必要时开 Issue |

**Q：统计卡片（Stars / Commits 等）有时不显示？**
- 这些卡片由第三方服务 github-readme-stats 提供，GitHub API 限流时会短暂不可用。
- 不影响 README 其余部分；介意可在模板里关掉统计卡片，或换不依赖外部统计的模板。

**Q：模板不够用 / 想自定义？**
- 目前 23 套；新增模板对开发者很简单（见 `CONTRIBUTING.md` 的「如何新增模板」），欢迎提 PR。

**Q：我的数据会被保存吗？**
- 登录态仅用于本次生成与发布；BYOK Key 只存在你浏览器本地（localStorage），不传服务器、不落库。

---

## 六、附录：部署 / 运维人员须知

在你把系统交给用户使用前，请确认：

1. **已部署到可访问的域名**（Vercel 或自有服务器），详见仓库 `README.md` 的「Deploy to Vercel」。
2. **环境变量已配置**，至少包含：

   | 变量 | 必填 | 说明 |
   | --- | --- | --- |
   | `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | ✅ | GitHub OAuth App 凭据 |
   | `AUTH_SECRET` | ✅ | Auth.js 会话加密密钥（长随机串） |
   | `NEXTAUTH_URL` | ✅（生产） | 你的公网域名，结尾不带斜杠 |
   | `OPENAI_API_KEY` | ⬜ | 启用服务端 AI 总结；留空则自动使用内置离线生成器 |
   | `UPSTASH_REDIS_REST_URL` / `TOKEN` | ⬜ | 生产环境按 IP 每日限额 |

3. **GitHub OAuth App 回调**已设为 `https://你的域名/api/auth/callback/github`。
4. **生产验证清单**（登录 → 生成 → 发布端到端跑通）已执行，见 `README.md`。
5. **CI 已通过**：`.github/workflows/ci.yml` 会在每次 push/PR 跑 lint / typecheck / test / build；其中已设置 `PUPPETEER_SKIP_DOWNLOAD=true`，避免 CI 安装阶段拉取 Chromium 大文件导致失败。

---

*本手册面向使用者；开发者与贡献者请另见 `README.md`（开发与部署）与 `CONTRIBUTING.md`（贡献指南）。*
