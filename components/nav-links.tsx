"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  ["/", "Home"],
  ["/services", "Services"],
  ["/terms", "Terms"],
] as const;

export function NavLinks() {
  const path = usePathname();
  return links.map(([href, label]) => (
    <Link
      key={href}
      href={href}
      aria-current={path === href ? "page" : undefined}
      className="rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 aria-[current=page]:bg-slate-100 aria-[current=page]:text-slate-900"
    >
      {label}
    </Link>
  ));
}
