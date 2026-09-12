"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { href, langFromPath, switchPath, ui } from "@/lib/i18n";
import { Icon } from "./icons";
import { Menu } from "./menu";
import { UserMenu } from "./user-menu";

// Client so it can read the URL: "/es/..." switches every label to Spanish without making pages dynamic.
export function SiteHeader({ name, phone, phoneHref }: { name: string; phone: string; phoneHref: string }) {
  const path = usePathname();
  const lang = langFromPath(path);
  const t = ui[lang];
  const other = lang === "es" ? "en" : "es";
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const links = [
    ["/", t.nav.home],
    ["/services", t.nav.services],
    ["/terms", t.nav.terms],
  ] as const;
  const portals = [
    ["/admin", t.portals.dispatch[0], t.portals.dispatch[1]],
    ["/driver", t.portals.driver[0], t.portals.driver[1]],
    ["/facility", t.portals.facility[0], t.portals.facility[1]],
  ] as const;

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:font-semibold focus:text-sky-700 focus:shadow-lg"
      >
        {t.nav.skip}
      </a>
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-y-2 px-4 py-3 sm:px-6">
          <Link
            href={href(lang, "/")}
            className="order-1 flex items-center gap-2.5 font-heading text-lg font-bold text-slate-900"
          >
            <span className="grid size-9 place-items-center rounded-lg bg-slate-900 text-white">
              <Icon name="truck" className="size-5" />
            </span>
            {name}
          </Link>
          <nav
            aria-label="Main"
            className="order-3 -mx-1 flex w-full gap-1 overflow-x-auto sm:order-2 sm:mx-0 sm:w-auto sm:flex-1 sm:justify-center"
          >
            {links.map(([base, label]) => {
              const h = href(lang, base);
              return (
                <Link
                  key={base}
                  href={h}
                  aria-current={path === h ? "page" : undefined}
                  className="rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 aria-[current=page]:bg-slate-100 aria-[current=page]:text-slate-900"
                >
                  {label}
                </Link>
              );
            })}
          </nav>
          <div className="order-2 flex items-center gap-1 sm:order-3 sm:gap-2">
            <Link
              href={switchPath(path, other)}
              hrefLang={other}
              lang={other}
              aria-label={t.nav.switchLabel}
              className="inline-flex min-h-11 items-center rounded-md px-2.5 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              {t.nav.switchShort}
            </Link>
            <UserMenu label={t.nav.signIn} />
            <Menu label={t.nav.portals} items={portals} />
            <a
              href={phoneHref}
              className="hidden items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 lg:flex"
            >
              <Icon name="phone" className="size-4" />
              {phone}
            </a>
            <Link href={href(lang, "/book")} className="btn-primary text-sm">
              {t.nav.book}
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
