"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  ["/admin", "Ride requests"],
  ["/admin/fleet", "Drivers & fleet"],
] as const;

export function AdminTabs() {
  const path = usePathname();
  return (
    <nav aria-label="Dispatch" className="flex gap-1 border-b border-slate-200">
      {tabs.map(([href, label]) => (
        <Link
          key={href}
          href={href}
          aria-current={path === href ? "page" : undefined}
          className="-mb-px border-b-2 border-transparent px-3 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 aria-[current=page]:border-sky-700 aria-[current=page]:text-sky-700"
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
