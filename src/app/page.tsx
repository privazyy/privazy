import type { Metadata } from "next";

import { PrivazyLanding } from "@/components/landing/privazy-landing";

export const metadata: Metadata = {
  title: "RODO dla firm, checker IOD i dokumentacja",
  description:
    "Sprawdź obowiązek IOD, dobierz dokumenty RODO, przejdź przez wdrożenie albo uruchom outsourcing IOD z obsługą incydentów.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "privazy. - RODO dla firm bez chaosu",
    description:
      "Checker IOD, dokumentacja RODO, audyty i outsourcing IOD dla firm w Polsce.",
    url: "/",
  },
};

export default function HomePage() {
  return <PrivazyLanding />;
}
