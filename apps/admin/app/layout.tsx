import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MAST Admin",
  description: "MAST role-scoped admin dashboard"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
