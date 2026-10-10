// 产物水印：导出/复制/推送到 GitHub 的 README 末尾统一追加开源地址。
// 仅作用于最终产物，不影响编辑器实时预览与缩略图。

export const PRODUCT_NAME = "readme-studio";
export const PRODUCT_REPO_URL = "https://github.com/readme-studio/readme-studio.git";

// 在 Markdown 末尾追加水印页脚
export function withWatermark(md: string): string {
  const footer = `\n\n> 本 README 由 ${PRODUCT_NAME} 生成 · 开源地址：${PRODUCT_REPO_URL}\n`;
  return md.trimEnd() + footer;
}
