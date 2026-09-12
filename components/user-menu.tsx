"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu } from "./menu";

type Me = { email: string; name: string; picture: string } | null;

// Header sign-in state. Pages stay static; this asks /auth/me after the page loads.
export function UserMenu({ label = "Sign in" }: { label?: string }) {
  const [me, setMe] = useState<Me>(null);
  useEffect(() => {
    fetch("/auth/me")
      .then((r) => r.json())
      .then(setMe)
      .catch(() => setMe(null));
  }, []);

  if (!me) {
    return (
      <Link
        href="/auth/google"
        className="inline-flex min-h-11 items-center rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
      >
        {label}
      </Link>
    );
  }
  const first = me.name.split(" ")[0] || me.email;
  return (
    <Menu
      label={
        <>
          {me.picture ? (
            // eslint-disable-next-line @next/next/no-img-element -- Google profile photo
            <img src={me.picture} alt="" referrerPolicy="no-referrer" className="size-6 rounded-full" />
          ) : null}
          <span className="hidden sm:inline">{first}</span>
        </>
      }
      items={[["/account", "My rides", me.email]]}
    >
      <form action="/auth/logout" method="post">
        <button className="block w-full cursor-pointer rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-900 transition-colors hover:bg-slate-50 dark:text-slate-100 dark:hover:bg-slate-950">
          Sign out
        </button>
      </form>
    </Menu>
  );
}
