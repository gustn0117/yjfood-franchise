import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "YJFOOD | 부산촌놈둘 · 제육브로 · 시골할매구이집",
  description:
    "YJFOOD 가맹점 모집 - 가맹비·교육비 무료, 창업비용 2,000만원 이내. 부산촌놈둘, 제육브로, 시골할매구이집 창업 상담을 지금 시작하세요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-white text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
