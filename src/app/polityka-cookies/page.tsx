import type { Metadata } from "next";

import { LegalPlaceholderPage } from "@/components/legal/legal-placeholder";

export const metadata: Metadata = {
  title: "Polityka cookies - draft PRIVAZY",
  robots: {
    follow: false,
    index: false,
  },
};

export default function CookiesPlaceholderRoute() {
  return <LegalPlaceholderPage title="Polityka cookies - draft" />;
}
