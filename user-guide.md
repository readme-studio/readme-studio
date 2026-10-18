# Readme Studio 用户操作手册

> 承接 README 的「30 秒上手」：**选模板 → 填资料（或让 AI 总结）→ 实时预览 → 一键发布**。
> 本手册把每一步展开讲透，覆盖第一次使用的用户、想用自己 Key / PAT 的高级用户，以及部署运维人员。

---

## 一、这是什么（30 秒了解）

Readme Studio 是一个 Web 应用，帮你把 GitHub 账号变成一份**好看、专业、带 AI 总结**的个人主页 README——不用会写 Markdown、不用命令行、不用折腾 Token：

- **23 套模板**：minimal、terminal、dashboard、neon、glassmorphic…… 输入即预览；
- **AI 项目总结**：每个精选仓库自动生成一句干净简介（站点默认配置或你自己的 Key，也可零费用本地跑）；
- **一键发布**：GitHub 登录后直接把 README 推到你的主页仓库，全程在浏览器内完成。

你只需要 3 步就能拿到成果（见下一节）；再花 10 分钟读完详细流程（第三节），就能按自己的喜好精调。

---

## 二、30 秒上手（先跑通，再精调）

1. 打开 **[在线 Demo](https://readme-studio-sigma.vercel.app)**（或你自己部署的网址）；
2. 点击右上角 **「登录 GitHub」**，授权后选择一个模板，输入姓名，勾选想展示的仓库（可让 AI 总结）；
3. 点 **「下一步：生成」→「用 GitHub 账号一键发布」**，主页 30 秒上线。

> 想自己部署而不是用 Demo？见文末附录，或 README 的「快速开始（本地开发）」。
> 下面第三节是这 30 秒的完整展开版，含每一步的截图与避坑提示。

---

## 三、使用者详细指南（6 步）

### 前提条件

- 一个 **GitHub 账号**；
- 访问部署好的网址（例如 Demo 或 `https://你的域名`），或本地运行（见附录）。

### 步骤 1 — 用 GitHub 登录

1. 打开网站，点击右上角 **「登录 GitHub」**。
2. 首次会跳转到 GitHub 授权页，点击 **Authorize（授权）**。
3. 跳回网站即登录成功。

> **授权范围说明（放心点授权）**：我们仅申请两个最小权限——
> `read:user`（读取你的公开资料）和 `public_repo`（读写你的**公开**仓库）。
> 不会触碰你的私有仓库，也不会动你其他项目的代码。
> 发布时，只会写入（或创建一个）你的个人主页仓库 `github.com/你/你` 的 `README.md`。

### 步骤 2 — 选择模板

- 首页模板画廊展示全部 **23 套模板**，带缩略图，覆盖极简、终端、数据面板、霓虹、玻璃拟态、杂志、蒸汽波等风格。
- 点击任意模板即可切换到编辑器；右侧实时预览效果。
- 想不出选哪个？新手推荐 `minimal`（极简，最不会出错）或 `dashboard`（数据面板，最能体现"活跃度"）。

| 首页 / 模板画廊 | 编辑器（桌面分栏） |
| --- | --- |
| ![home](screenshots/home-desktop.png) | ![editor](screenshots/editor-desktop.png) |

### 步骤 3 — 填写资料

在编辑页左侧表单填写：

| 字段 | 说明 | 是否必填 |
| --- | --- | --- |
| 姓名 Name | 展示在主页的名字 | 建议填 |
| 标签 Tagline | 一句话定位，如「全栈开发者 / 开源爱好者」 | 可选 |
| 简介 Bio | 2–3 句话自我介绍 | 可选 |
| 所在地 / 公司 | 展示地理位置与所属 | 可选 |
| 社交链接 | GitHub / Twitter / LinkedIn / 博客 / 邮箱 | 可选 |

**选择要展示的仓库：**

- 点击「从 GitHub 拉取」，会从你的 GitHub 拉取仓库列表（可搜索，按 Star 数 / 更新时间 / 名称排序，多选）。
- 勾选你最想展示的 3–6 个代表项目。
- 下方可开关 4 类**统计卡片**：Star 数 / 提交数 / PR 数 / 语言分布（dashboard 等看板类模板用到）。

### 步骤 4 — 让 AI 写项目简介（可选，但推荐）

1. 在选中的仓库上勾选要用 AI 总结的项目（单次最多 6 个）；
2. 点击 **「AI 总结选中项目」**，每个仓库会收到一句克制、专业的简介；
3. 不满意可重新生成，或直接手动修改文本框。

**不想用站点默认 AI？三种方式任选（详见第四节）：**

- 站点已配置 OpenAI → 直接用，你无需任何操作；
- 自带 Key（BYOK）→ 在额度用尽时填入你自己的 OpenAI / Gemini / Claude Key，浏览器直连，Key 不经过本站服务器；
- 本地 Ollama → 零费用、完全离线。

### 步骤 5 — 预览

- 编辑即所见即所得，右侧实时渲染 Markdown。
- 顶部可切换 **浅色 / 深色 / 跟随系统** 预览主题，确认两种背景下都好看（提示：GitHub 主页会随访问者的系统主题渲染，所以发布前两种主题都看一眼最稳妥）。
- 手机端也能操作：窄屏下编辑页会切换为「编辑 / 预览」标签页。

| 编辑器（移动端） | 生成的个人主页 |
| --- | --- |
| ![mobile editor](screenshots/editor-mobile-form.png) | ![result](screenshots/result-desktop.png) |

### 步骤 6 — 一键发布

1. 点击 **「下一步：生成」**，进入生成结果页；
2. 已登录状态点击 **「用 GitHub 账号一键发布」**——系统会在你的账号下创建（若没有）主页仓库 `github.com/你/你`，并把 README 写进去；
3. 发布成功后，点击 **「查看我的主页」** 即可看到新 README 上线；
4. 想改？返回编辑器改完，再点一次发布即可覆盖更新。

> 首次发布只需授权一次；仓库名固定为你的用户名，对应 GitHub 个人主页。你随时可以在 GitHub 上直接编辑这份 README。

---

## 四、AI 总结的三种方式（详解）

| 方式 | 谁来付 API 费用 | 数据去向 | 是否需要配置 | 适合谁 |
| --- | --- | --- | --- | --- |
| ① 站点服务端 OpenAI | 站长（已配置 `OPENAI_API_KEY`） | 经本站服务器调用默认模型 | 你无需操作 | 大多数用户 |
| ② BYOK 自带 Key | 你自己 | OpenAI/Gemini **浏览器直连**；Claude 走最小代理，**Key 均不存储** | 在设置填入你的 Key | 在意隐私 / 想用自己额度 / 站点额度用尽 |
| ③ 本地 Ollama | 免费（本地算力） | 完全离线，不出本机 | 本地需装 Ollama 并起服务 | 零成本 / 离线体验 |

**BYOK 填写指引：**

- OpenAI：填 `sk-...` 开头的 API Key；
- Gemini：填 Google AI Studio 申请的 API Key；
- Claude（Anthropic）：因浏览器 CORS 限制，由站点一个最小代理转发，Key 只在请求中使用、不落库。

> 三种方式的提示词一致，摘要风格统一；BYOK Key 只保存在你浏览器本地（localStorage），不会上传服务器，也不计入站点每日额度。

---

## 五、不使用一键发布？PAT 兜底方案（高级用户）

默认路径推荐 **GitHub OAuth 一键发布**（权限最小，仅 `public_repo`）。如果你不想走 OAuth 登录，可以在发布弹窗里选 **「改用 Token 发布」**，粘贴一个 **Personal Access Token（PAT）** 手动授权。

### 如何创建细粒度 PAT

1. GitHub → Settings → Developer settings → **Personal access tokens** → **Fine-grained tokens** → Generate new token；
2. 设置有效期（建议短期，用完即删）；
3. **Repository access** 选择 `Only select repositories` → 勾选你的主页仓库（`你的用户名/你的用户名`）；
4. 权限配置（主页仓库尚不存在时需要创建它，两项都要）：
   - **Repository permissions → Contents**：设为 **Read and write**（写入 README）；
   - **Account permissions → Account administration**：设为 **Read and write**（创建你的主页仓库）。
   - 若你的主页仓库**已存在**，则只需 `Contents: Read and write`，无需 Account 权限。
5. 生成后**立刻复制**令牌（只显示一次）。

> 发布完成后**建议立即删除该令牌**，避免泄露风险。

---

## 六、常见问题（FAQ）

**Q：登录后页面没反应 / 跳回但没登录？**
- 确认浏览器未禁用第三方 Cookie（GitHub OAuth 回调依赖之）；
- 确认 OAuth App 的回调地址与部署域名完全一致（含 `https://`、不含结尾斜杠）；
- 清掉旧会话重试，或换无痕窗口。

**Q：点击登录直接报错 `Configuration`（或页面 500）？**
这是**部署侧**配置缺失，不是你的问题，需站长处理：
1. 登录 Vercel → 项目 → **Settings → Environment Variables**，确认以下三项都已设置且值正确：
   - `GITHUB_CLIENT_ID`（GitHub OAuth App 的 Client ID）
   - `GITHUB_CLIENT_SECRET`（Client Secret）
   - `AUTH_SECRET`（任意长随机串，用于会话加密）
2. **注意**：这些必须设在部署平台的环境变量里，写在仓库的 `.env.local` 不会被读取；
3. 改完变量后需**重新部署**一次才会生效；
4. 另请确认 GitHub OAuth App 的回调地址为 `https://你的域名/api/auth/callback/github`。

**Q：发布失败，提示一串英文错误码？**
错误码定义在服务端返回值中，含义如下：

| 错误码 | 含义 | 处理建议 |
| --- | --- | --- |
| `AUTH` | 未授权 / 令牌无效 | 重新登录，或检查 PAT 是否正确、是否过期 |
| `SCOPE` | 令牌权限不足 | OAuth 需 `public_repo`；PAT 需 `Contents: write`（必要时加 Account 权限） |
| `RATE` | GitHub API 限流 | 稍等几分钟再试 |
| `NETWORK` | 网络异常 | 检查网络后重试 |
| `OTHER` | 其他 | 看详细报错，必要时开 Issue |

**Q：统计卡片（Star 数 / 提交数等）有时不显示？**
- 这些卡片由第三方服务 [github-readme-stats](https://github.com/anuraghazra/github-readme-stats) 提供，GitHub API 限流时会短暂不可用；
- 不影响 README 其余部分；介意可在模板里关掉统计卡片，或换不依赖外部统计的模板。

**Q：模板不够用 / 想自定义？**
- 目前 23 套；新增模板对开发者很简单（见 `CONTRIBUTING.md` 的「如何新增模板」），欢迎提 PR。

**Q：我的数据会被保存吗？**
- 登录态仅用于本次生成与发布；BYOK Key 只存在你浏览器本地（localStorage），不传服务器、不落库。

---

## 七、附录：部署 / 运维人员须知

交给用户使用前，确认：

1. **已部署到可访问的域名**（Vercel 或自有服务器），详见仓库 `README.md` 的「部署到 Vercel」；
2. **环境变量已配置**，至少包含：

   | 变量 | 必填 | 说明 |
   | --- | --- | --- |
   | `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | ✅ | GitHub OAuth App 凭据 |
   | `AUTH_SECRET` | ✅ | Auth.js 会话加密密钥（长随机串） |
   | `NEXTAUTH_URL` | ✅（生产） | 你的公网域名，结尾不带斜杠 |
   | `OPENAI_API_KEY` | ⬜ | 启用服务端 AI 总结；留空则回退本地 Ollama |
   | `OPENAI_BASE_URL` / `OPENAI_MODEL` | ⬜ | 指向任意 OpenAI 兼容服务（DeepSeek、SiliconFlow 等） |
   | `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | ⬜ | 生产环境按 IP 的每日限额 |

3. **GitHub OAuth App 回调**已设为 `https://你的域名/api/auth/callback/github`；
4. **生产验证清单**已执行（登录 → 生成 → 发布端到端跑通）：
   - [ ] 打开首页，模板正常加载
   - [ ] GitHub 登录后能无报错跳转回来
   - [ ] 生成并发布 README，`github.com/你/你` 被更新
   - [ ] `NEXTAUTH_URL` 与生产域名完全一致（结尾不带斜杠）
5. **CI 已通过**：`.github/workflows/ci.yml` 会在每次 push / PR 跑 lint / typecheck / test / build；其中已设置 `PUPPETEER_SKIP_DOWNLOAD=true`，避免 CI 安装阶段拉取 Chromium 大文件导致失败。

---

*本手册面向使用者；开发者与贡献者请另见 `README.md`（开发与部署）与 `CONTRIBUTING.md`（贡献指南）。*
