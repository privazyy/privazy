import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LeadCaptureForm } from "@/components/public/lead-capture-form";
import {
  Breadcrumbs,
  BulletCard,
  CtaBand,
  FaqSection,
  LegalDisclaimer,
  ProcessSteps,
  PublicHero,
  PublicPageShell,
  PublicSection,
  RelatedLinks,
  ServiceCard,
} from "@/components/public/public-site";
import { Card } from "@/components/ui/card";
import { getBlogArticle } from "@/lib/blog";
import {
  getPublicIndustry,
  getPublicService,
  getPublicSiteUrl,
  publicIndustries,
  type PublicLink,
} from "@/lib/public-site";

type IndustryRouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return publicIndustries.map((industry) => ({
    slug: industry.slug,
  }));
}

export async function generateMetadata({ params }: IndustryRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const industry = getPublicIndustry(slug);

  if (!industry) {
    return {
      title: "Branża nie znaleziona - PRIVAZY",
    };
  }

  return {
    title: industry.metaTitle,
    description: industry.metaDescription,
    alternates: {
      canonical: industry.path,
    },
    openGraph: {
      title: industry.metaTitle,
      description: industry.metaDescription,
      type: "website",
      url: industry.path,
    },
  };
}

export default async function IndustryPage({ params }: IndustryRouteProps) {
  const { slug } = await params;
  const industry = getPublicIndustry(slug);

  if (!industry) notFound();

  const recommendedServices = industry.recommendedServices
    .map(getPublicService)
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const relatedLinks = buildRelatedLinks(industry.relatedArticles);
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: industry.faq.map((item) => ({
      "@type": "Question",
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
      name: item.question,
    })),
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", item: getPublicSiteUrl("/"), name: "Strona główna", position: 1 },
      { "@type": "ListItem", item: getPublicSiteUrl("/branze/ecommerce"), name: "Branże", position: 2 },
      { "@type": "ListItem", item: getPublicSiteUrl(industry.path), name: industry.title, position: 3 },
    ],
  };

  return (
    <PublicPageShell>
      <JsonLd data={faqJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />

      <Breadcrumbs
        items={[
          { href: "/branze/ecommerce", label: "Branże" },
          { href: industry.path, label: industry.shortTitle },
        ]}
      />
      <PublicHero
        badge={industry.badge}
        description={industry.description}
        eyebrow={industry.eyebrow}
        primaryCta={{ href: "#kontakt", label: "Porozmawiaj o RODO w tej branży" }}
        secondaryCta={{ href: "/#checker", label: "Sprawdź obowiązek IOD" }}
        title={industry.heroTitle}
      />

      <PublicSection
        className="bg-[var(--surface-page)]"
        eyebrow="Ryzyka"
        title="Co zwykle wymaga uwagi"
      >
        <div className="grid gap-4 md:grid-cols-2">
          {industry.risks.map((risk) => (
            <BulletCard key={risk}>{risk}</BulletCard>
          ))}
        </div>
      </PublicSection>

      <PublicSection
        className="bg-[var(--white)]"
        eyebrow="Obowiązki"
        title="Co warto uporządkować w pierwszej kolejności"
      >
        <div className="grid gap-4 md:grid-cols-2">
          {industry.obligations.map((obligation) => (
            <BulletCard key={obligation} tone="brand">
              {obligation}
            </BulletCard>
          ))}
        </div>
      </PublicSection>

      <PublicSection
        className="bg-[var(--surface-page)]"
        eyebrow="IOD"
        title="Czy w tej branży potrzebny jest Inspektor Ochrony Danych?"
      >
        <div className="grid gap-6 lg:grid-cols-[.9fr_1.1fr]">
          <Card padding="lg">
            <h3 className="text-xl font-bold text-[var(--text-strong)]">Kontekst obowiązku IOD</h3>
            <p className="mt-3 text-base leading-8 text-[var(--text-body)]">{industry.iodContext}</p>
            <div className="mt-5">
              <LegalDisclaimer />
            </div>
          </Card>
          <RelatedLinks links={relatedLinks} title="Powiązane poradniki" />
        </div>
      </PublicSection>

      <PublicSection
        className="bg-[var(--white)]"
        eyebrow="Rekomendowane usługi"
        title="Najczęściej dobierane ścieżki"
      >
        <div className="grid gap-5 md:grid-cols-3">
          {recommendedServices.map((service) => (
            <ServiceCard key={service.slug} service={service} />
          ))}
        </div>
      </PublicSection>

      <PublicSection
        className="bg-[var(--surface-page)]"
        eyebrow="Proces"
        title="Jak zaczynamy współpracę"
      >
        <ProcessSteps
          steps={[
            {
              title: "Opis procesów",
              description: "Ustalamy, jakie dane, systemy, dostawcy i osoby występują w typowych procesach branży.",
            },
            {
              title: "Ocena IOD i ryzyk",
              description: "Sprawdzamy obowiązek IOD, dane szczególne, monitoring, transfery i procesy wysokiego ryzyka.",
            },
            {
              title: "Dokumenty i procedury",
              description: "Przygotowujemy dokumentację, instrukcje i plan utrzymania zgodności.",
            },
            {
              title: "Stała obsługa",
              description: "Jeśli to potrzebne, przechodzimy do outsourcingu IOD, incydentów i bieżących konsultacji.",
            },
          ]}
        />
      </PublicSection>

      <PublicSection
        className="bg-[var(--white)]"
        eyebrow="FAQ"
        title={`Najczęstsze pytania: ${industry.shortTitle}`}
      >
        <FaqSection items={industry.faq} />
      </PublicSection>

      <PublicSection
        className="bg-[var(--surface-page)]"
        eyebrow="Kontakt"
        title="Zostaw kontekst branży, a odpowiemy konkretnie"
      >
        <div id="kontakt" className="grid gap-8 lg:grid-cols-[.82fr_1fr] lg:items-start">
          <Card padding="lg">
            <h3 className="text-xl font-bold text-[var(--text-strong)]">Nie zaczynaj od zgadywania</h3>
            <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
              Branża pomaga zawęzić ryzyka, ale o obowiązkach decydują konkretne procesy, skala i role. Formularz zapisuje źródło strony oraz UTM.
            </p>
            <div className="mt-5">
              <LegalDisclaimer />
            </div>
          </Card>
          <LeadCaptureForm
            industrySlug={industry.slug}
            placement={`industry-${industry.slug}`}
            subject={`RODO dla branży: ${industry.shortTitle}`}
          />
        </div>
      </PublicSection>

      <CtaBand
        description="Jeśli wynik jest graniczny, potraktuj go jako punkt startu do rozmowy ze specjalistą."
        primaryCta={{ href: "/#checker", label: "Uruchom checker IOD" }}
        secondaryCta={{ href: "/uslugi/audyt-rodo", label: "Zobacz audyt RODO" }}
        title="Sprawdź obowiązek IOD przed wyborem dokumentów"
      />
    </PublicPageShell>
  );
}

function buildRelatedLinks(articleSlugs: string[]): PublicLink[] {
  return articleSlugs
    .map(getBlogArticle)
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .map((item) => ({ label: item.title, href: `/blog/${item.slug}`, description: item.excerpt }));
}

function JsonLd({ data }: { data: Record<string, unknown> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
