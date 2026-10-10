// 核心配置对象，贯穿整个应用
export interface ProfileConfig {
  // 基础信息
  name: string;
  tagline: string;
  bio: string;
  location?: string;
  company?: string;

  // 社交链接
  social: {
    github?: string;
    twitter?: string;
    linkedin?: string;
    blog?: string;
    email?: string;
  };

  // 项目展示
  featuredRepos: FeaturedRepo[];

  // 统计卡片
  stats: {
    showStars: boolean;
    showCommits: boolean;
    showPRs: boolean;
    showLanguages: boolean;
  };

  // 外观
  previewTheme: "light" | "dark" | "auto";
  templateId:
    | "minimal"
    | "terminal"
    | "dashboard"
    | "neon"
    | "paper"
    | "bento"
    | "galaxy"
    | "terminalGreen"
    | "glassmorphic"
    | "magazine"
    | "aqua"
    | "ember"
    | "snake"
    | "retro"
    | "blueprint"
    | "ide"
    | "brutalist"
    | "vaporwave"
    | "swiss"
    | "zen"
    | "sticker"
    | "newspaper"
    | "cyberpunk";
}

export interface FeaturedRepo {
  name: string;
  description: string;
  url: string;
  language: string;
  stars: number;
  aiSummary?: string;
  useAiSummary: boolean;
}

// GitHub API 标准化后的仓库信息
export interface RepoInfo {
  id: number;
  name: string;
  fullName: string;
  description: string | null;
  htmlUrl: string;
  language: string | null;
  stargazersCount: number;
  forksCount: number;
  topics: string[];
  updatedAt: string;
  fork: boolean;
  archived: boolean;
}

// 模板接口
export interface Template {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  render(config: ProfileConfig): string;
}

// 可在服务端序列化传给客户端展示组件的模板元信息（不含 render 函数）
export interface TemplateMeta {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
}

// AI 摘要请求
export interface SummarizeRequest {
  repos: Array<{
    name: string;
    description: string;
    language: string;
    topics: string[];
  }>;
}

// 推送请求。
// - pat：手动粘贴的 Personal Access Token（Token 兜底模式）
// - accessToken：GitHub OAuth 登录后的访问令牌（小白一键发布模式，由服务端会话注入）
// 二选一即可；都缺则视为未授权。
// owner 可省略：省略时由服务端用令牌解析出当前登录用户名
export interface PushRequest {
  owner?: string;
  content: string;
  pat?: string;
  accessToken?: string;
}

// 推送响应
export interface PushResponse {
  success: boolean;
  url?: string;
  error?: string;
  // 结构化错误码，便于前端映射到 i18n 文案（result.publish.err*）
  code?: "AUTH" | "SCOPE" | "RATE" | "NETWORK" | "OTHER";
}
