import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "믕스터리 커피가격계산기",
  description: "나도 모르게 쌓이는 커피값의 미스터리. 질문에 답하면 하루 비용, 연간 유지비, 음용량과 카페인을 계산해드립니다.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
