import { AdminTabs } from "@/components/admin-tabs";

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6">
      <p className="text-sm font-semibold tracking-wide text-sky-700 uppercase dark:text-sky-400">Dispatch</p>
      <div className="mt-3">
        <AdminTabs />
      </div>
      {children}
    </div>
  );
}
