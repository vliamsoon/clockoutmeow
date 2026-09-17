import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "今晚收工 · CLOCK OUT",
  description: "把今晚还给自己。Take Your Night Back.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
