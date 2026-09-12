import type { Metadata } from "next";
import { BookPage } from "@/components/pages/book";

export const metadata: Metadata = { title: "Reservar un viaje" };
export const dynamic = "force-dynamic";

export default function Page() {
  return <BookPage lang="es" />;
}
