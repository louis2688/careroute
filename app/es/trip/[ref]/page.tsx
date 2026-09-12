import type { Metadata } from "next";
import { TripPage } from "@/components/pages/trip";

export const metadata: Metadata = { title: "Seguir su viaje", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Promise<{ ref: string }> }) {
  return <TripPage code={(await params).ref} lang="es" />;
}
