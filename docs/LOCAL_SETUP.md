# 本地运行与测试指南（Readme Studio）

本指南面向想在本机跑起来、并做端到端测试的同学（尤其是没有付费 API key 的小白）。

## 1. 安装与启动

```bash
pnpm install
cp .env.example .env        # 按需填写下面的变量
pnpm dev                    # 默认 http://localhost:3000
```

构建与校验：

```bash
pnpm typecheck   # 类型检查
pnpm test        # 单元测试
pnpm build       # 生产构建
```

---

## 2. AI 模型：三种方式任选，都能零成本本地测试

应用按以下优先级选择模型（见 `lib/model-config.ts`）：

1. **设置了 `OPENAI_API_KEY`** → 用它（也支持通过 `OPENAI_BASE_URL` 指向任意 OpenAI 兼容服务）。
2. **否则自动回退到本地 Ollama**（零配置、零费用、可离线）——推荐本地测试用。
3. **两者皆无** → 接口返回友好提示，并引导你配置，不会消耗每日额度。

### 方式一：本地 Ollama（推荐，完全免费）

```bash
# 1) 安装 Ollama：https://ollama.com
# 2) 拉取一个中文友好的小模型（qwen2.5 约 1.5~4GB，按机器选择）
ollama pull qwen2.5
ollama run qwen2.5      # 保持运行（默认监听 http://localhost:11434）
```

保持 Ollama 运行后，**无需在 `.env` 里填任何 key**，直接 `pnpm dev`，点击「AI 总结」即可本地生成。
可用环境变量覆盖（可选）：

```bash
OLLAMA_BASE_URL=http://localhost:11434/v1
OLLAMA_MODEL=qwen2.5:latest
```

想强制关闭 Ollama 回退（仅允许填了 key 才可用）：`ENABLE_OLLAMA=false`。

### 方式二：免费云（OpenAI 兼容）

DeepSeek、SiliconFlow（通义千问）、智谱 GLM 等都提供 OpenAI 兼容接口与免费额度。
只需填 `OPENAI_BASE_URL` + `OPENAI_API_KEY` + `OPENAI_MODEL`，**不需要** `OPENAI_API_KEY` 走官方：

```bash
OPENAI_BASE_URL=https://api.deepseek.com/v1
OPENAI_API_KEY=sk-你的免费key
OPENAI_MODEL=deepseek-chat
```

### 方式三：官方 OpenAI（付费）

```bash
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
```

> 提示：应用内还提供「自带 Key（BYOK）」弹窗，可在额度用尽后用你自己的
> OpenAI / Gemini / Anthropic key 直接在浏览器生成，key 只存 localStorage、不经服务器。

---

## 3. 一键发布到 GitHub（小白友好）

发布不再要求手动创建 PAT：

- **未登录**：在结果页点「一键推送到 GitHub」→「用 GitHub 账号连接并发布」，
  完成一次 GitHub 授权后自动回到结果页，再次点击即可发布。
- **已登录**（GitHub OAuth，scope 为 `read:user public_repo`）：直接点
  「用 GitHub 账号一键发布」，应用**复用 OAuth token** 创建你的专属主页仓库
  `<用户名>/<用户名>` 并写入 README——全程无需写代码、无需 Token。
- **高级用户**：在发布弹窗中展开「改用 Token 发布」，粘贴自己的 PAT 即可
  （需 `public_repo` 权限）。

> 为什么 `public_repo` 够用？GitHub 官方文档明确：OAuth token 仅需 `public_repo`（或 `repo`）
> 即可创建**公开**仓库并写入内容；个人主页仓库 `用户名/用户名` 正是公开仓库。

---

## 4. 获取必要的环境变量

| 变量 | 用途 | 获取方式 |
| --- | --- | --- |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | GitHub 登录与一键发布 | GitHub → Settings → Developer settings → OAuth Apps 新建；Callback 填 `http://localhost:3000/api/auth/callback/github`；scope 填 `read:user public_repo` |
| `NEXTAUTH_SECRET` | NextAuth 会话签名 | 任意随机串，如 `openssl rand -base64 32` |
| `OPENAI_*` / `OLLAMA_*` | AI 模型 | 见第 2 节 |
| `UPSTASH_REDIS_*` | 每日额度限流（可选） | 不填则回退到 IP 限流 |

---

## 5. 端到端自测清单

1. 启动 Ollama（方式一）或填入免费云 key（方式二）。
2. 打开 `http://localhost:3000`，选模板 → 填写信息 → 选仓库 → 点「AI 总结」，确认预览出现中文总结。
3. 点「下一步：生成」→ 在结果页点「一键推送到 GitHub」。
4. 未登录则先授权 GitHub；已登录则一键发布，成功后访问 `github.com/<你的用户名>` 查看主页。
