import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FitGuide | 사진 기반 체형 비율",
  description: "사진을 바탕으로 내 몸의 비율을 이해하는 개인 스타일 가이드",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
