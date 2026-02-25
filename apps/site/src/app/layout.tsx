import type { Metadata } from "next";
import "./globals.css";
import { googleSansCode, inter } from "@/lib/fonts";

export const metadata: Metadata = {
  title: {
    default: "Pier",
    template: "%s • Pier"
  },
  description:
    "Pier is a localhost-first developer tool that bridges local terminal into your app and maps sessions to the correct project directory."
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${googleSansCode.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
