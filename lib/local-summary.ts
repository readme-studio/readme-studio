// 本地启发式「项目简介」生成器（零依赖、零联网、零费用）。
//
// 当生产环境未配置 OPENAI_API_KEY（且无可用 OpenAI 兼容源）时，服务端改走本模块，
// 仅依据仓库的「名称 / 描述 / 主要语言 / 话题标签」合成一句专业、克制的中文简介，
// 保证「AI 总结」按钮永远可用，不会因为缺少 LLM 凭证而硬失败。
//
// 设计原则（与服务端 SYSTEM_PROMPT 一致）：
//   - 一句中文，正式、克制，符合个人主页展示场景；
//   - 控制在 40 个汉字以内；
//   - 不寒暄、不解释、不使用 Markdown 标题或列表。

export interface LocalSummaryRepo {
  name: string;
  description: string;
  language?: string;
  topics?: string[];
}

// 依据话题标签推断项目类别（顺序即优先级）
const CATEGORY_RULES: ReadonlyArray<readonly [RegExp, string]> = [
  [/(cli|command|terminal|shell|cmd)/i, "命令行工具"],
  [/(web|frontend|react|vue|next|svelte|nuxt|ui|css)/i, "前端项目"],
  [/(api|backend|server|microservice|rpc|gateway)/i, "后端服务"],
  [/(ml|ai|llm|gpt|deeplearning|pytorch|tensorflow|langchain|agent)/i, "人工智能项目"],
  [/(lib|library|sdk|util|utility|tool|plugin|extension|framework)/i, "开发工具库"],
  [/(db|database|orm|cache|search|queue)/i, "数据工具"],
  [/(game|bot|app|mobile|android|ios|desktop)/i, "应用"],
];

function categoryFromTopics(topics: string[]): string {
  const joined = topics.join(" ").toLowerCase();
  for (const [rule, label] of CATEGORY_RULES) {
    if (rule.test(joined)) return label;
  }
  return "开源项目";
}

function ensurePunct(s: string): string {
  const t = s.trim().replace(/\s+/g, " ");
  if (t.length === 0) return "";
  if (/[。.!?！？]$/u.test(t)) return t;
  return t + "。";
}

// 单仓库简介：有描述则自然融合，无描述则退化为「名称 + 语言 + 类别」
export function localSummaryForRepo(repo: LocalSummaryRepo): string {
  const lang = (repo.language || "").trim() || "多语言";
  const cat = categoryFromTopics(repo.topics || []);
  const desc = (repo.description || "").trim().replace(/\s+/g, " ");
  if (desc.length >= 4) {
    return ensurePunct(`一个基于 ${lang} 的${cat}，${desc}`);
  }
  return ensurePunct(`${repo.name} 是一个使用 ${lang} 构建的${cat}`);
}

// SSE 风格逐块产出，复用前端 delta 累加逻辑；分块兼顾「流式」观感与性能。
export async function* streamSummariesLocal(
  repos: LocalSummaryRepo[],
): AsyncGenerator<{ repo: string; delta: string }> {
  for (const repo of repos) {
    const text = localSummaryForRepo(repo);
    for (let i = 0; i < text.length; i += 4) {
      yield { repo: repo.name, delta: text.slice(i, i + 4) };
    }
  }
}
