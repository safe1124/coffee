import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "1년 커피값 시뮬레이터",
  description: "병커피, 캡슐, 에스프레소, 브루잉의 연간 실질 비용을 비교합니다.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
