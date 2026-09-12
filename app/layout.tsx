import type { Metadata } from "next";
import { Figtree, Noto_Sans } from "next/font/google";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { Menu } from "@/components/menu";
import { NavLinks } from "@/components/nav-links";
import { UserMenu } from "@/components/user-menu";
import { site } from "@/lib/site";
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

const portals = [
  ["/admin", "Dispatch", "Ride requests, drivers, exports"],
  ["/driver", "Driver app", "Today's rides, pickups, signatures"],
  ["/facility", "Facility portal", "Book and track rides for your patients"],
] as const;

const footerLinks = [
  ["/", "Home"],
  ["/services", "Services"],
  ["/terms", "Terms & Conditions"],
  ["/book", "Book a ride"],
  ["/admin", "Dispatch"],
  ["/driver", "Driver app"],
  ["/facility", "Facility portal"],
] as const;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${figtree.variable} ${noto.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:font-semibold focus:text-sky-700 focus:shadow-lg"
        >
          Skip to content
        </a>

        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-y-2 px-4 py-3 sm:px-6">
            <Link
              href="/"
              className="order-1 flex items-center gap-2.5 font-heading text-lg font-bold text-slate-900"
            >
              <span className="grid size-9 place-items-center rounded-lg bg-slate-900 text-white">
                <Icon name="truck" className="size-5" />
              </span>
              {site.name}
            </Link>
            <nav
              aria-label="Main"
              className="order-3 -mx-1 flex w-full gap-1 overflow-x-auto sm:order-2 sm:mx-0 sm:w-auto sm:flex-1 sm:justify-center"
            >
              <NavLinks />
            </nav>
            <div className="order-2 flex items-center gap-1 sm:order-3 sm:gap-2">
              <UserMenu />
              <Menu label="Portals" items={portals} />
              <a
                href={site.phoneHref}
                className="hidden items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 lg:flex"
              >
                <Icon name="phone" className="size-4" />
                {site.phone}
              </a>
              <Link href="/book" className="btn-primary text-sm">
                Book a ride
              </Link>
            </div>
          </div>
        </header>

        <main id="main" className="flex-1">
          {children}
        </main>

        <footer className="bg-slate-900 text-slate-300">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
            <div>
              <p className="font-heading text-lg font-bold text-white">{site.name}</p>
              <p className="mt-3 max-w-sm text-sm">{site.description}</p>
              <p className="mt-4 text-sm text-slate-400">
                Not for emergencies. If someone needs urgent medical care, call your local emergency
                number.
              </p>
            </div>
            <div>
              <p className="font-semibold text-white">Company</p>
              <ul className="mt-3 space-y-1 text-sm">
                {footerLinks.map(([href, label]) => (
                  <li key={href}>
                    <Link href={href} className="inline-block py-1.5 transition-colors hover:text-white">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-semibold text-white">Contact</p>
              <ul className="mt-3 space-y-1 text-sm">
                <li>
                  <a
                    href={site.phoneHref}
                    className="inline-flex items-center gap-2 py-1.5 transition-colors hover:text-white"
                  >
                    <Icon name="phone" className="size-4" />
                    {site.phone}
                  </a>
                </li>
                <li>
                  <a
                    href={`mailto:${site.email}`}
                    className="inline-flex items-center gap-2 py-1.5 transition-colors hover:text-white"
                  >
                    <Icon name="mail" className="size-4" />
                    {site.email}
                  </a>
                </li>
                <li className="flex items-start gap-2 py-1.5">
                  <Icon name="map-pin" className="mt-0.5 size-4 shrink-0" />
                  {site.address}
                </li>
                <li className="flex items-start gap-2 py-1.5">
                  <Icon name="clock" className="mt-0.5 size-4 shrink-0" />
                  {site.hours}
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800">
            <p className="mx-auto max-w-6xl px-4 py-5 text-xs text-slate-400 sm:px-6">
              © {new Date().getFullYear()} {site.legalName}. All rights reserved.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
