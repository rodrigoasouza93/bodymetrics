import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BodyMetrics",
  description: "Private bioimpedance exam history and body composition trends.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-canvas text-ink">
        {children}
      </body>
    </html>
  );
}
