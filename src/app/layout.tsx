import type { Metadata } from "next";
import { Geist_Mono, Noto_Sans_KR } from "next/font/google";
import Link from "next/link";

import { ThemeToggle } from "@/components/ThemeToggle";
import "./globals.css";

// Korean glyphs are not in any listed subset; Google splits them by unicode-range and the
// browser downloads only the pieces a page uses, so only latin is preloaded
const notoSansKr = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Trend Digest",
  description: "매일 수집하고, 주 1회만 보여주는 AI 논문 다이제스트",
};

// Runs before first paint so a dark-mode visitor never sees a light flash
const themeScript = `try{var t=localStorage.getItem("theme");if(t==="dark"||(!t&&matchMedia("(prefers-color-scheme: dark)").matches))document.documentElement.classList.add("dark")}catch(e){}`;

export default function RootLayout({ children, modal }: LayoutProps<"/">) {
  return (
    // The script above changes the class before React hydrates
    <html
      lang="ko"
      className={`${notoSansKr.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <header className="border-b border-border">
          <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4">
            <Link href="/" className="font-semibold">
              AI Trend Digest
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/#past" className="text-muted hover:text-foreground">
                지난 호
              </Link>
              {/* Separates the page links from the display setting */}
              <span className="h-4 w-px bg-border" aria-hidden="true" />
              <ThemeToggle />
            </nav>
          </div>
        </header>
        {children}
        {modal}
      </body>
    </html>
  );
}
