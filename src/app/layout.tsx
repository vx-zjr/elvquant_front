import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { dictionaries } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "elvquant",
  description: "Auditable quantitative research dashboard",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const dictionary = dictionaries.zh;
  return (
    <html lang="zh-CN">
      <body>
        <div className="shell">
          <header className="topbar">
            <div>
              <strong>elvquant</strong>
              <div className="muted">{dictionary.appSubtitle}</div>
            </div>
            <nav aria-label="Primary">
              <Link href="/?lang=zh">{dictionary.navRuns}</Link>
              <Link href="/?lang=zh">{dictionary.navWorkflows}</Link>
              <Link href="/?lang=zh">{dictionary.navData}</Link>
            </nav>
            <div className="status-dot"><span /> {dictionary.localMode}</div>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
