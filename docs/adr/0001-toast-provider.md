# ADR-0001：Toast 组件选型（sonner）

- 状态：已采纳（Accepted）
- 日期：2024-10
- 关联：Sprint 2 审核 2.7（🟡 中：Toast 用 sonner 而非 shadcn/ui Toast）

## 背景

编辑器在仓库加载失败、AI 总结报错/超时、表单校验失败、BYOK 保存成功等场景下需要轻量级即时反馈。Sprint 0 的文档 0.1 曾表述「使用 shadcn/ui 的 Toast」，但 shadcn/ui 官方当前**推荐并内置 sonner** 作为 Toast 方案（其 `components/ui/sonner.tsx` 即 sonner 的封装）。

## 决策

采用 **sonner** 作为全局 Toast 方案，并保留 shadcn 风格的封装：

- 依赖：`sonner@2.0.8`（已在 `package.json` 锁定）。
- 封装：`components/ui/sonner.tsx` 包装 sonner 的 `<Toaster>`，接入 `next-themes` 的主题。
- 挂载：`app/layout.tsx` 在 `TooltipProvider` 内渲染 `<Toaster />`，全局可用。
- 调用：业务侧统一 `import { toast } from "sonner"`，使用 `toast.error / toast.success`。

不回退到旧版 shadcn `Toast`（基于 Radix `Toast` + `useToast` hook）的原因：sonner 已深度集成、API 更简洁、且与 shadcn 当前文档一致；回退属于高改动、零功能收益。

## 影响

- 与 shadcn/ui 现行实践一致，不存在技术栈偏离。
- 后续新增 Toast 提示继续走 `toast.*`，无需引入新依赖。
