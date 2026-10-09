import { getRequestConfig } from "next-intl/server";
import zhCN from "../messages/zh-CN.json";

export const defaultLocale = "zh-CN";
export const locales = [defaultLocale] as const;

// next-intl 请求配置：MVP 只提供 zh-CN，locale 切换的代码路径已在此预留。
export default getRequestConfig(async () => {
  return {
    locale: defaultLocale,
    messages: zhCN,
  };
});

// 重新导出 getTranslations，作为统一封装供页面/组件使用。
export { getTranslations, getMessages } from "next-intl/server";
