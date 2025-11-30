import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "DeepMirror — Personal Reflection Companion",
  description: "A calm space to explore your thoughts, feelings, and patterns. Educational reflection tool by Vraj Vaghela.",
  keywords: ["reflection", "self-awareness", "mental wellness", "journaling", "AI companion"],
  authors: [{ name: "Vraj Vaghela" }],
  openGraph: {
    title: "DeepMirror — Personal Reflection Companion",
    description: "A calm space to explore your thoughts, feelings, and patterns.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}