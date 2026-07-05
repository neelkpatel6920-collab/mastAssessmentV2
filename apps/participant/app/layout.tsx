import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MAST Test",
  description: "Gujarati MAST work-style test"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="gu">
      <body>{children}</body>
    </html>
  );
}
