import type { Metadata } from "next";
import { HomePage } from "@/components/pages/home";

export const metadata: Metadata = { title: { absolute: "CareRoute | Transporte médico no urgente" } };

export default function Page() {
  return <HomePage lang="es" />;
}
