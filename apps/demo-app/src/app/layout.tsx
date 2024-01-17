import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cn } from "@superplexo/utils/cn";
import { Providers } from "./providers";

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Create Turborepo",
  description: "Generated by create turbo",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="en">
      <body
        className={cn("bg-background font-sans antialiased", fontSans.variable)}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}