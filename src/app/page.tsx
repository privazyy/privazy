import type { Metadata } from "next";
import { PrivazyLanding } from "@/components/landing/privazy-landing";

export const metadata: Metadata = {
  title: "privazy. - RODO dla firm bez chaosu",
  description:
    "Sprawdź obowiązek IOD, dobierz pakiet dokumentów RODO albo uruchom outsourcing IOD z platformą do incydentów.",
};

export default function HomePage() {
  return <PrivazyLanding />;
}
