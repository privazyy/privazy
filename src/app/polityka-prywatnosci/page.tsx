import type { Metadata } from "next";

import { LegalPlaceholderPage } from "@/components/legal/legal-placeholder";

export const metadata: Metadata = {
  title: "Polityka prywatnosci - draft PRIVAZY",
  robots: {
    follow: false,
    index: false,
  },
};

export default function PrivacyPlaceholderRoute() {
  return <LegalPlaceholderPage title="Polityka prywatnosci - draft" />;
}
