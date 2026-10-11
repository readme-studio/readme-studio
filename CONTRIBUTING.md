# 贡献指南（CONTRIBUTING）

感谢你考虑为 **readme-studio** 做贡献！本指南面向新手，按步骤来即可。

## 1. 开发环境搭建

要求：

- **Node.js ≥ 20**
- **pnpm ≥ 10**（项目使用 `pnpm@10.28.2`，用 `corepack enable` 可自动锁定版本）
- 一个 GitHub 账号（用于测试「一键发布」的 OAuth 登录）

步骤：

```bash
# 克隆后安装依赖
pnpm install

# 复制环境变量模板，按需填写
cp .env.example .env

# 启动开发服务器
pnpm dev          # http://localhost:3000
```

常用脚本：

| 命令 | 说明 |
| --- | --- |
| `pnpm dev` | 本地开发（热更新） |
| `pnpm build` | 生产构建 |
| `pnpm lint` | ESLint 检查 |
| `pnpm typecheck` | TypeScript 类型检查（`tsc --noEmit`） |
| `pnpm test` | 运行单元测试（Vitest） |
| `pnpm format` | Prettier 格式化全部文件 |

> 环境变量（`.env`）非全部必填：仅「一键发布」需要 `GITHUB_CLIENT_ID/SECRET` 与 `AUTH_SECRET`；AI 摘要的 `OPENAI_API_KEY` 缺省时自动回退到本地 Ollama；`UPSTASH_REDIS_*` 为可选的限流配置。详见 `.env.example` 与 `README.md`。

## 2. 代码风格（ESLint + Prettier）

项目已内置配置，无需额外安装：

- **ESLint**：基于 `eslint-config-next`（core-web-vitals + typescript），并已接入 `eslint-config-prettier` 避免规则冲突。配置见 `eslint.config.mjs`。
- **Prettier**：`printWidth: 100`，双引号、分号、尾逗号 `all`，见 `.prettierrc`。

提交前请保证：

```bash
pnpm lint && pnpm typecheck && pnpm test
```

CI 会自动跑同样的检查，本地通过能大幅降低被驳回的概率。

## 3. 提交规范（Conventional Commits）

提交信息请遵循 [Conventional Commits](https://www.conventionalcommits.org/)：

```
<type>(<scope>): <subject>

[可选正文]
```

常用 `type`：

| type | 含义 |
| --- | --- |
| `feat` | 新功能 |
| `fix` | 修复缺陷 |
| `docs` | 文档变更 |
| `style` | 格式调整（不影响逻辑） |
| `refactor` | 重构 |
| `test` | 测试相关 |
| `chore` | 构建/依赖等杂项 |

示例：

```
feat(template): 新增 cyberpunk 模板
fix(form): 修正 FormControl 未转发 id 导致的 a11y 告警
```

## 4. Pull Request 流程

1. Fork 本仓库并基于 `main` 创建特性分支：`git checkout -b feat/your-feature`。
2. 在分支上完成开发，确保 `pnpm lint && pnpm typecheck && pnpm test` 全部通过。
3. 推送分支并发起 PR 到 `main`，在 PR 描述中说明：改动目的、截图/测试、是否涉及环境变量或破坏性变更。
4. 等待 CI 通过后，维护者会 review 并合并。

> 若是较大改动，建议先在 Issue 里讨论方案，避免返工。

## 5. 如何新增一个模板

所有模板集中在 `lib/templates/`，并通过 `lib/templates/index.ts` 的注册表对外暴露。

**第一步**：在 `lib/templates/` 新建一个文件，导出符合 `Template` 接口的对象（`lib/types.ts`）：

```ts
import type { Template } from "../types";

export const myTemplate: Template = {
  id: "my",                       // 唯一 id（同时用于路由与校验）
  name: "My Style",               // 展示名
  description: "一句话描述风格",   // 选择器里的说明
  thumbnail: "/thumbs/my.svg",    // 缩略图，放到 public/ 下
  render(config: ProfileConfig): string {
    // 返回完整的 Markdown 字符串
    return `# ${config.name}\n\n${config.bio}\n`;
  },
};
```

`render(config)` 必须返回**纯 Markdown 文本**（不要返回 HTML），由统一的 Markdown 渲染管线处理。

**第二步**：在 `lib/templates/index.ts` 注册：

```ts
import { myTemplate } from "./my";
export type TemplateId = ... | "my";   // 加入联合类型
export { ..., myTemplate };
export const templates: Record<TemplateId, Template> = {
  ...,
  my: myTemplate,
};
```

> 注意：`lib/types.ts` 中 `ProfileConfig.templateId` 也内联了一份同样的 id 联合类型，新增模板时请同步更新，保持两处一致。

**第三步**：在 `public/` 准备好 `thumbnail` 对应的缩略图（SVG 推荐，体积小）。模板即会出现在选择器与构建产物中。

## 6. 如何新增一个 LLM Provider（BYOK）

AI 摘要支持「自带密钥」（BYOK），浏览器端直连，不经过服务器。现有 provider 在 `lib/byok.ts` 的 `ByokProvider` 联合类型中定义：

```ts
export type ByokProvider = "openai" | "anthropic" | "gemini";
```

新增一个 provider 需要：

1. **在 `lib/byok.ts` 扩展类型**，并新增对应的 `summarizeXxx(repo, apiKey)` 函数（参考已有的 `summarizeOpenAI` / `summarizeGemini`）。
2. **在 `summarizeWithBYOK` 的分发逻辑中加分支**，把新 provider 路由到你的实现。
3. **受 CORS 限制的服务**（如 Anthropic）需要走服务端代理 `app/api/byok/proxy`：新增一个 `case` 转发到官方接口，并以 SSE `{delta}` 帧回流。
4. **提示词一致性**：`lib/byok.ts` 的 `SYSTEM_PROMPT`/`buildPrompt` 必须与 `lib/summarize.ts`（服务端实现）保持一致，避免出现不同的摘要风格或幻觉。

> 若新 provider 需要在 UI 上出现，请同步更新前端的 provider 选择器与 i18n 文案（`messages/zh-CN.json`）。

---

再次感谢你的贡献！如有疑问，欢迎开 Issue 讨论。
