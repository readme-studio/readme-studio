import type { ProfileConfig } from "./types";

// 编辑器 -> 结果页 通过 sessionStorage 传递完整配置（刷新即失效，避免落盘隐私）
export const CONFIG_STORAGE_KEY = "readme-studio:config";

export function saveConfig(config: ProfileConfig): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
}

export function loadConfig(): ProfileConfig | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(CONFIG_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ProfileConfig;
  } catch {
    return null;
  }
}
