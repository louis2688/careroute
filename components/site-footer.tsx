"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { href, langFromPath, ui, type Lang } from "@/lib/i18n";
import { Icon } from "./icons";

type Props = {
  name: string;
  legalName: string;
  description: Record<Lang, string>;
  hours: Record<Lang, string>;
  phone: string;
  phoneHref: string;
  email: string;
  address: string;
  year: number;
};

export function SiteFooter(p: Props) {
  const lang = langFromPath(usePathname());
  const t = ui[lang];
  const links = [
    [href(lang, "/"), t.nav.home],
    [href(lang, "/services"), t.nav.services],
    [href(lang, "/terms"), t.footer.terms],
    [href(lang, "/book"), t.nav.book],
    ["/admin", t.portals.dispatch[0]],
    ["/driver", t.portals.driver[0]],
    ["/facility", t.portals.facility[0]],
  ] as const;

  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="font-heading text-lg font-bold text-white">{p.name}</p>
          <p className="mt-3 max-w-sm text-sm">{p.description[lang]}</p>
          <p className="mt-4 text-sm text-slate-400">{t.footer.notEmergency}</p>
        </div>
        <div>
          <p className="font-semibold text-white">{t.footer.company}</p>
          <ul className="mt-3 space-y-1 text-sm">
            {links.map(([h, label]) => (
              <li key={h}>
                <Link href={h} className="inline-block py-1.5 transition-colors hover:text-white">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-semibold text-white">{t.footer.contact}</p>
          <ul className="mt-3 space-y-1 text-sm">
            <li>
              <a href={p.phoneHref} className="inline-flex items-center gap-2 py-1.5 transition-colors hover:text-white">
                <Icon name="phone" className="size-4" />
                {p.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${p.email}`} className="inline-flex items-center gap-2 py-1.5 transition-colors hover:text-white">
                <Icon name="mail" className="size-4" />
                {p.email}
              </a>
            </li>
            <li className="flex items-start gap-2 py-1.5">
              <Icon name="map-pin" className="mt-0.5 size-4 shrink-0" />
              {p.address}
            </li>
            <li className="flex items-start gap-2 py-1.5">
              <Icon name="clock" className="mt-0.5 size-4 shrink-0" />
              {p.hours[lang]}
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-800">
        <p className="mx-auto max-w-6xl px-4 py-5 text-xs text-slate-400 sm:px-6">
          © {p.year} {p.legalName}. {t.footer.rights}
        </p>
      </div>
    </footer>
  );
}
