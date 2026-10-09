import type { Metadata } from "next";
import "./globals.css";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Readme Studio",
  description:
    "让任何 GitHub 用户在三分钟内拥有一个专业、动态、个性化的个人主页。",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const messages = await getMessages();

  return (
    <html lang="zh-CN">
      <body className={cn("font-sans antialiased")}>
        <NextIntlClientProvider messages={messages}>
          <TooltipProvider>{children}</TooltipProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
