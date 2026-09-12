import type { Metadata } from "next";
import { ServicesPage } from "@/components/pages/services";

export const metadata: Metadata = { title: "Servicios" };

export default function Page() {
  return <ServicesPage lang="es" />;
}
