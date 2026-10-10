/**
 * 缩略图生成脚本（Sprint 3.4）
 *
 * 对每个模板：样例 ProfileConfig → render() 得到 Markdown
 * → remark + remark-gfm + remark-html 转 HTML → Puppeteer 截图（800x600）
 * → 输出 public/thumbnails/{templateId}.png
 *
 * 手动执行：pnpm gen:thumbs
 * 不进入构建流程；缩略图尽量小（浅色主题）。
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";
import puppeteer from "puppeteer";
import { templates, type TemplateId } from "../lib/templates";
import type { ProfileConfig } from "../lib/types";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(__dirname, "../public/thumbnails");

// 丰富的样例数据，便于展示各模板的差异
const sampleConfig: ProfileConfig = {
  name: "张三",
  tagline: "fullstack.dev",
  bio: "坐标杭州，专注于 Web 开发与开发者工具。",
  location: "Hangzhou",
  company: "Acme",
  social: {
    github: "https://github.com/zhangsan",
    twitter: "@zhangsan",
    linkedin: "https://www.linkedin.com/in/zhangsan",
    blog: "https://zhangsan.dev",
    email: "hi@zhangsan.dev",
  },
  featuredRepos: [
    {
      name: "readme-studio",
      description: "三分钟生成专业 GitHub 个人主页",
      url: "https://github.com/zhangsan/readme-studio",
      language: "TypeScript",
      stars: 1280,
      useAiSummary: true,
      aiSummary: "一站式生成精美主页，内置 AI 项目总结。",
    },
    {
      name: "cli-kit",
      description: "轻量命令行工具集",
      url: "https://github.com/zhangsan/cli-kit",
      language: "Go",
      stars: 342,
      useAiSummary: false,
    },
    {
      name: "ui-lib",
      description: "可复制的 React 组件库",
      url: "https://github.com/zhangsan/ui-lib",
      language: "TypeScript",
      stars: 89,
      useAiSummary: false,
    },
  ],
  stats: {
    showStars: true,
    showCommits: true,
    showPRs: true,
    showLanguages: true,
  },
  previewTheme: "light",
  templateId: "minimal",
};

// 轻量 GitHub 风格 markdown 样式，保证缩略图观感一致
const MARKDOWN_CSS = `
  body { margin: 0; background: #ffffff; }
  .md {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans SC", sans-serif;
    font-size: 15px; line-height: 1.6; color: #1f2328;
    padding: 20px 24px; max-width: 760px; margin: 0 auto;
  }
  .md h1 { font-size: 28px; margin: 0 0 12px; }
  .md h2 { font-size: 21px; margin: 20px 0 10px; border-bottom: 1px solid #d0d7de; padding-bottom: 6px; }
  .md h3 { font-size: 17px; margin: 16px 0 8px; }
  .md p { margin: 8px 0; }
  .md blockquote { margin: 8px 0; padding: 0 12px; border-left: 4px solid #d0d7de; color: #59636e; }
  .md a { color: #0969da; text-decoration: none; }
  .md code { background: #f0f0f0; padding: 2px 6px; border-radius: 6px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 13px; }
  .md pre { background: #0d1117; color: #e6edf3; padding: 14px 16px; border-radius: 8px; overflow: auto; }
  .md pre code { background: transparent; padding: 0; color: inherit; }
  .md ul, .md ol { padding-left: 22px; margin: 8px 0; }
  .md li { margin: 4px 0; }
  .md table { border-collapse: collapse; width: 100%; margin: 10px 0; }
  .md th, .md td { border: 1px solid #d0d7de; padding: 6px 10px; text-align: left; }
  .md details { margin: 10px 0; }
  .md summary { cursor: pointer; font-weight: 600; }
`;

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const md = remark().use(remarkGfm).use(remarkHtml);

    for (const template of Object.values(templates)) {
      const config: ProfileConfig = { ...sampleConfig, templateId: template.id as TemplateId };
      const markdown = template.render(config);
      const htmlBody = String(await md.process(markdown));
      const pageHtml = `<!doctype html><html><head><meta charset="utf-8"><style>${MARKDOWN_CSS}</style></head><body><div class="md">${htmlBody}</div></body></html>`;

      const page = await browser.newPage();
      await page.setViewport({ width: 800, height: 600, deviceScaleFactor: 1 });
      // 拦截第三方图片，避免外网阻塞与破图（胶囊横幅/打字 SVG/统计卡/贪吃蛇）
      await page.setRequestInterception(true);
      page.on("request", (req) => {
        const blocked = [
          "github-readme-stats.vercel.app",
          "capsule-render.vercel.app",
          "readme-typing-svg.demolab.com",
          "raw.githubusercontent.com",
        ];
        if (blocked.some((h) => req.url().includes(h))) {
          req.abort();
        } else {
          req.continue();
        }
      });
      await page.setContent(pageHtml, { waitUntil: "load", timeout: 15000 });
      const outPath = resolve(OUT_DIR, `${template.id}.png`);
      await page.screenshot({ path: outPath, type: "png", fullPage: false });
      await page.close();
      console.log(`✓ ${template.id}.png`);
    }
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
