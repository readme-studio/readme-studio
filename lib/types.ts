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
  templateId: "minimal" | "terminal" | "dashboard";
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

// AI 摘要请求
export interface SummarizeRequest {
  repos: Array<{
    name: string;
    description: string;
    language: string;
    topics: string[];
  }>;
}

// 推送请求。owner 可省略：省略时由服务端用 PAT 解析出当前登录用户名
export interface PushRequest {
  owner?: string;
  content: string;
  pat: string;
}

// 推送响应
export interface PushResponse {
  success: boolean;
  url?: string;
  error?: string;
}
