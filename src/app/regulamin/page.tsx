import type { Metadata } from "next";

import { LegalPlaceholderPage } from "@/components/legal/legal-placeholder";

export const metadata: Metadata = {
  title: "Regulamin - draft PRIVAZY",
  robots: {
    follow: false,
    index: false,
  },
};

export default function TermsPlaceholderRoute() {
  return <LegalPlaceholderPage title="Regulamin sprzedaży — draft" />;
}
