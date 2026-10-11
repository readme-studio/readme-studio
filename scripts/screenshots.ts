/**
 * 截图 + 可访问性检查脚本（Sprint 4.3 / 4.2）
 *
 * 1. 用 Puppeteer 在 375 / 768 / 1280 宽度下对 首页 / 编辑器 / 结果页 截图，
 *    产出 docs/screenshots/*，供 README 使用，并间接验证响应式（4.1）。
 * 2. 若 /tmp/axe.min.js 存在，则对核心页面注入 axe-core 运行可访问性检查，
 *    输出 critical/serious 级别违规（4.2 真实校验）。
 *
 * 前置：先 `pnpm build && pnpm start`（或 dev）让应用跑在 BASE_URL。
 * 手动执行：PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable BASE_URL=http://localhost:3000 pnpm tsx scripts/screenshots.ts
 */
import { mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
const EXEC = process.env.PUPPETEER_EXECUTABLE_PATH;
const OUT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "../docs/screenshots");
const AXE_PATH = "/tmp/axe.min.js";

const VIEWPORTS = {
  mobile: { width: 375, height: 760, name: "mobile" },
  tablet: { width: 768, height: 1024, name: "tablet" },
  desktop: { width: 1280, height: 900, name: "desktop" },
} as const;

const SAMPLE_CONFIG = {
  name: "Javaeer",
  tagline: "fullstack · open-source",
  bio: "开源开发者，深耕 Java 后端、前端数据可视化与 AI 智能体。",
  location: "Beijing",
  company: "yunlou",
  social: {
    github: "https://github.com/javaeer",
    twitter: "",
    linkedin: "",
    blog: "https://www.yunlou.net.cn",
    email: "",
  },
  featuredRepos: [
    {
      name: "fast-url",
      description: "高性能短链接服务，支持分布式部署与实时点击统计。",
      url: "https://github.com/javaeer/fast-url",
      language: "Java",
      stars: 3,
      useAiSummary: false,
    },
    {
      name: "local-forge",
      description: "本地优先的前端构建工具链，零配置冷热构建。",
      url: "https://github.com/javaeer/local-forge",
      language: "Vue",
      stars: 2,
      useAiSummary: false,
    },
  ],
  stats: {
    showStars: true,
    showCommits: false,
    showPRs: false,
    showLanguages: false,
  },
  previewTheme: "light",
  templateId: "minimal",
};

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const browser = await puppeteer.launch({
    executablePath: EXEC,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const axeAvailable = existsSync(AXE_PATH);
  console.log(`BASE_URL=${BASE_URL}  axe=${axeAvailable ? "on" : "off"}`);

  const page = await browser.newPage();
  const shots: Array<[string, string]> = []; // [route, file]

  const gotoWait = async (url: string, opts?: { sessionConfig?: unknown }) => {
    await page.goto(BASE_URL + url, { waitUntil: "networkidle2", timeout: 30000 });
    if (opts?.sessionConfig !== undefined) {
      await page.evaluate((cfg) => {
        sessionStorage.setItem("readme-studio:config", JSON.stringify(cfg));
      }, opts.sessionConfig);
      await page.goto(BASE_URL + url, { waitUntil: "networkidle2", timeout: 30000 });
    }
  };

  // ---- 首页 ----
  for (const v of Object.values(VIEWPORTS)) {
    await page.setViewport({ width: v.width, height: v.height });
    await gotoWait("/");
    await page.screenshot({ path: resolve(OUT_DIR, `home-${v.name}.png`), fullPage: true });
    shots.push([`/ (${v.name})`, `home-${v.name}.png`]);
  }

  // ---- 编辑器：桌面分栏 / 平板 / 移动（编辑 Tab 与预览 Tab）----
  await page.setViewport(VIEWPORTS.desktop);
  await gotoWait("/editor");
  await page.screenshot({ path: resolve(OUT_DIR, "editor-desktop.png"), fullPage: true });
  shots.push(["/editor (desktop)", "editor-desktop.png"]);

  await page.setViewport(VIEWPORTS.tablet);
  await gotoWait("/editor");
  await page.screenshot({ path: resolve(OUT_DIR, "editor-tablet.png"), fullPage: true });
  shots.push(["/editor (tablet)", "editor-tablet.png"]);

  await page.setViewport(VIEWPORTS.mobile);
  await gotoWait("/editor");
  // 移动端默认「编辑」Tab：直接截图
  await page.screenshot({ path: resolve(OUT_DIR, "editor-mobile-form.png"), fullPage: true });
  // 切到「预览」Tab
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    const t = btns.find((b) => b.textContent?.trim() === "预览");
    if (t) (t as HTMLButtonElement).click();
  });
  await new Promise((r) => setTimeout(r, 400));
  await page.screenshot({ path: resolve(OUT_DIR, "editor-mobile-preview.png"), fullPage: true });
  shots.push(["/editor (mobile-form)", "editor-mobile-form.png"]);
  shots.push(["/editor (mobile-preview)", "editor-mobile-preview.png"]);

  // ---- 结果页（注入 sessionStorage 配置）----
  for (const v of [VIEWPORTS.desktop, VIEWPORTS.mobile]) {
    await page.setViewport({ width: v.width, height: v.height });
    await gotoWait("/result", { sessionConfig: SAMPLE_CONFIG });
    await page.screenshot({ path: resolve(OUT_DIR, `result-${v.name}.png`), fullPage: true });
    shots.push([`/result (${v.name})`, `result-${v.name}.png`]);
  }

  // ---- axe 可访问性检查 ----
  if (axeAvailable) {
    const axeTargets = ["/", "/editor", "/result"];
    for (const route of axeTargets) {
      await page.setViewport(VIEWPORTS.desktop);
      await gotoWait(route, route === "/result" ? { sessionConfig: SAMPLE_CONFIG } : undefined);
      await page.addScriptTag({ path: AXE_PATH });
      const results = await page.evaluate(async () => {
        // @ts-expect-error injected at runtime
        const r = await window.axe.run(document, {
          runOnly: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"],
        });
        return {
          violations: r.violations.map((v: { id: string; impact: string | null; nodes: unknown[] }) => ({
            id: v.id,
            impact: v.impact,
            nodes: v.nodes.length,
          })),
        };
      });
      const critical = results.violations.filter(
        (v: { id: string; impact: string | null; nodes: unknown[] }) =>
          v.impact === "critical" || v.impact === "serious",
      );
      console.log(`\n[axe] ${route}: ${results.violations.length} violations, critical/serious=${critical.length}`);
      for (const v of critical) {
        console.log(`  - ${v.id} (${v.impact}) x${v.nodes}`);
      }
    }
  }

  await browser.close();
  console.log("\n=== screenshots ===");
  for (const [label, file] of shots) console.log(`  ${label} -> docs/screenshots/${file}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
