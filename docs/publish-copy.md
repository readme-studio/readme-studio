# 社区发布文案（Publish Copy）

> 本文件是「可直接复制发布」的文案素材，不是自动发布（需你自己的账号）。请根据目标平台的语气微调后再发。

---

## 一、中文文案

### 1. V2EX（节点推荐：分享创造 / 程序员）

**标题：** 用 AI 几分钟内生成好看的 GitHub 个人主页 README —— 23 套模板 + 一键发布

**正文：**

最近把写 GitHub 个人主页 README 这件麻烦事做成了一个小工具：Readme Studio。

痛点大家都懂：想让主页好看一点，要么去抄别人的模板、手动拼 Markdown，要么对着一堆 badge 和统计卡片调半天。Readme Studio 想做减法：

- **23 套模板**：minimal / terminal / dashboard / neon / glassmorphic…… 选完输入即时预览，浅色深色都能看。
- **AI 项目总结**：填了仓库后，AI 帮你把每个 pinned 项目写成一句干净的中文简介（你也可以自带 Key 或本地跑 Ollama，零费用）。
- **一键发布**：登录 GitHub 后直接推到你的主页仓库，小白不用折腾 Token。

全程在浏览器里完成，不用命令行。

- 在线体验：https://readme-studio.vercel.app （换成你的域名）
- 开源仓库：https://github.com/readme-studio/readme-studio

求轻喷，也欢迎提 Issue / PR。

### 2. 少数派（投稿 / 矩阵）

**标题：** 不想手敲 Markdown？用 AI 和 23 套模板，几分钟搞定 GitHub 个人主页

**导语：** 一份好看的 GitHub Profile 能给人留好印象，但手工排版费时。Readme Studio 用模板 + AI 总结 + 一键发布，把这件事压到几分钟。

**正文（要点式）：**

1. **模板即所见即所得**：23 种风格覆盖极简、终端、数据面板、霓虹、玻璃拟态等，输入即时预览，支持明暗主题。
2. **AI 写项目简介**：每个精选仓库自动生成一句克制、专业的中文总结；不想要云端调用，可填自己的 API Key（BYOK），或本地 Ollama 离线跑。
3. **一键发布到主页**：GitHub OAuth 登录后直接写 `README.md`，避免给小白发过宽权限的 Token；高级用户仍可走 PAT 兜底。
4. **小白友好 & 开源**：流程全在浏览器内，零命令行；代码 MIT 开源，可自行部署。

- Demo：https://readme-studio.vercel.app
- 仓库：https://github.com/readme-studio/readme-studio

---

## 二、英文文案（Product Hunt）

**Tagline：** Generate a beautiful GitHub profile README in minutes — with AI summaries & 23 templates.

**First Comment（置顶首评）：**

Hey Product Hunt 👋

I kept putting off my GitHub profile README because hand-writing Markdown + badges is a chore. So I built **Readme Studio**:

- 🎨 **23 templates** — minimal, terminal, dashboard, neon, glassmorphic… live preview, light/dark.
- 🤖 **AI project summaries** — turns each pinned repo into one clean sentence. Bring your own key (OpenAI/Gemini/Claude) or run local Ollama for free.
- 🚀 **One-click publish** — sign in with GitHub and push to your profile repo. No token juggling for beginners.
- ♿ Accessibility-checked with axe-core; responsive from 375px to 1280px.

It's open source (MIT). Try it, break it, and tell me what template you want next.

— [Live demo](https://readme-studio.vercel.app) · [GitHub](https://github.com/readme-studio/readme-studio)

**Gallery / Maker comment（可选）：** 同上 First Comment 即可，截图用 `docs/screenshots/` 下的 4 张。

---

## 三、FAQ 回复模板

**Q1：AI 总结要花钱吗？/ 你们怎么处理我的 Key？**

> 默认服务端用 OpenAI `gpt-4o-mini`，成本极低；但你不填任何 Key 也能用——会回退到本地 Ollama 模型，零费用本地跑。
> 如果你想用自己的额度，可以用 BYOK：OpenAI / Gemini 是浏览器**直连**官方接口，Key 只通过请求头发出，**不经过我们的服务器**；Claude 因 CORS 限制走一个最小代理转发。我们不会存储你的 Key。

**Q2：为什么用 OAuth 而不是 PAT？PAT 不是更简单？**

> 默认走 GitHub OAuth，是为了**不向小白索取权限过宽的 Personal Access Token**——一键登录即可发布到主页仓库。
> PAT 作为**高级 / 兜底**选项保留：如果你不想登录、或要更细的控制，可以手动粘贴一个只含 `Contents: write` 的细粒度 Token。两种路径二选一。

**Q3：支持多少套模板？能加新的吗？**

> 目前内置 **23 套**模板，覆盖极简、终端、数据面板、霓虹、玻璃拟态、杂志、蒸汽波等风格。
> 新增模板很容易：在 `lib/templates/` 里实现一个 `Template` 接口（`render(config)` 返回 Markdown），再在注册表里挂一下即可，欢迎 PR（见 CONTRIBUTING.md）。

**Q4：统计卡片有时加载不出来？**

> dashboard 等模板的统计卡片由第三方服务 github-readme-stats 提供，遇到 GitHub API 限流时会短暂不可用，但不影响 README 的其他部分。介意的话可以换用不依赖外部统计的模板。

---

*注意：发布时把示例域名 `readme-studio.vercel.app` 替换为你真实的部署地址；仓库链接替换为你的 Fork / 主仓库地址。*
