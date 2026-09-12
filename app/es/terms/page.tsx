import type { Metadata } from "next";
import { TermsPage } from "@/components/pages/terms";

export const metadata: Metadata = { title: "Términos y condiciones" };

export default function Page() {
  return <TermsPage lang="es" />;
}
