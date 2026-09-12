import type { Metadata } from "next";
import { Figtree, Noto_Sans } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { themeInitScript } from "@/components/theme-toggle";
import { site } from "@/lib/site";
import { siteEs } from "@/lib/site.es";
import "./globals.css";

const figtree = Figtree({ subsets: ["latin"], variable: "--font-figtree" });
const noto = Noto_Sans({ subsets: ["latin"], variable: "--font-noto" });

export const metadata: Metadata = {
  title: {
    default: `${site.name} | Non-emergency medical transportation`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: the theme script adds "dark" to <html> before React hydrates.
    <html lang="en" className={`${figtree.variable} ${noto.variable} h-full`} suppressHydrationWarning>
      <body className="flex min-h-full flex-col">
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <SiteHeader name={site.name} phone={site.phone} phoneHref={site.phoneHref} />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter
          name={site.name}
          legalName={site.legalName}
          description={{ en: site.description, es: siteEs.description }}
          hours={{ en: site.hours, es: siteEs.hours }}
          phone={site.phone}
          phoneHref={site.phoneHref}
          email={site.email}
          address={site.address}
          year={new Date().getFullYear()}
        />
      </body>
    </html>
  );
}
