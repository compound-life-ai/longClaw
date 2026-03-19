import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Longevity OS",
  description: "An OpenClaw skill bundle for a personal health companion.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${sourceSerif.variable} antialiased`}
    >
      <body className="min-h-screen flex flex-col font-sans bg-zinc-50 text-zinc-900 selection:bg-zinc-200">
        {children}
      </body>
    </html>
  );
}
