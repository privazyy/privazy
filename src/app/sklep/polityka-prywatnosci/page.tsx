import type { Metadata } from "next";

import { ProductPage } from "@/components/product/product-page";
import { privacyPolicyProduct, productFaqJsonLd, productJsonLd } from "@/lib/product";

export const metadata: Metadata = {
  title: privacyPolicyProduct.metaTitle,
  description: privacyPolicyProduct.metaDescription,
  alternates: {
    canonical: privacyPolicyProduct.url,
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: privacyPolicyProduct.metaTitle,
    description:
      "Polityka prywatności zgodna z RODO, dopasowana do Twojej firmy. Pliki .docx, PDF i HTML, aktualizacje, natychmiastowy dostęp. 190 zł.",
    url: privacyPolicyProduct.url,
    siteName: "PRIVAZY",
    locale: "pl_PL",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: privacyPolicyProduct.metaTitle,
    description: privacyPolicyProduct.metaDescription,
  },
};

export default function PrivacyPolicyProductRoute() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productFaqJsonLd) }}
      />
      <ProductPage />
    </>
  );
}
