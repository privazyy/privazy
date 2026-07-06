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
  TrustSection,
} from "@/components/public/public-site";
import { Card } from "@/components/ui/card";
import { getBlogArticle } from "@/lib/blog";
import {
  getPublicIndustry,
  getPublicService,
  getPublicSiteUrl,
  publicServices,
  type PublicLink,
} from "@/lib/public-site";

type ServiceRouteProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return publicServices.map((service) => ({
    slug: service.slug,
  }));
}

export async function generateMetadata({ params }: ServiceRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const service = getPublicService(slug);

  if (!service) {
    return {
      title: "Usługa nie znaleziona - PRIVAZY",
    };
  }

  return {
    title: service.metaTitle,
    description: service.metaDescription,
    alternates: {
      canonical: service.path,
    },
    openGraph: {
      title: service.metaTitle,
      description: service.metaDescription,
      type: "website",
      url: service.path,
    },
  };
}

export default async function ServicePage({ params }: ServiceRouteProps) {
  const { slug } = await params;
  const service = getPublicService(slug);

  if (!service) notFound();

  const relatedLinks = buildRelatedLinks(service.relatedServices, service.relatedIndustries, service.relatedArticles);
  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    areaServed: {
      "@type": "Country",
      name: "Polska",
    },
    description: service.metaDescription,
    name: service.title,
    provider: {
      "@type": "Organization",
      name: "privazy.",
      url: getPublicSiteUrl("/"),
    },
    serviceType: service.schemaType,
    url: getPublicSiteUrl(service.path),
  };
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: service.faq.map((item) => ({
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
      { "@type": "ListItem", item: getPublicSiteUrl("/uslugi/wdrozenie-rodo"), name: "Usługi", position: 2 },
      { "@type": "ListItem", item: getPublicSiteUrl(service.path), name: service.title, position: 3 },
    ],
  };

  return (
    <PublicPageShell>
      <JsonLd data={serviceJsonLd} />
      <JsonLd data={faqJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />

      <Breadcrumbs
        items={[
          { href: "/uslugi/wdrozenie-rodo", label: "Usługi" },
          { href: service.path, label: service.shortTitle },
        ]}
      />
      <PublicHero
        badge={service.badge}
        description={service.description}
        eyebrow={service.eyebrow}
        primaryCta={{ href: "#kontakt", label: service.primaryCta }}
        secondaryCta={{ href: "/#checker", label: service.secondaryCta }}
        title={service.heroTitle}
      />

      <PublicSection
        className="bg-[var(--surface-page)]"
        eyebrow="Diagnoza"
        title="Kiedy ta usługa jest potrzebna"
        description="Najczęściej zaczynamy od tych sygnałów. Jeśli rozpoznajesz kilka z nich, warto uporządkować temat zanim pojawi się incydent albo kontrola."
      >
        <div className="grid gap-4 md:grid-cols-2">
          {service.painPoints.map((point) => (
            <BulletCard key={point}>{point}</BulletCard>
          ))}
        </div>
      </PublicSection>

      <PublicSection
        className="bg-[var(--white)]"
        eyebrow="Efekt"
        title="Co dostajesz po zakończeniu prac"
      >
        <div className="grid gap-4 md:grid-cols-2">
          {service.outcomes.map((outcome) => (
            <BulletCard key={outcome} tone="brand">
              {outcome}
            </BulletCard>
          ))}
        </div>
      </PublicSection>

      <PublicSection
        className="bg-[var(--surface-page)]"
        eyebrow="Zakres"
        title="Zakres prac"
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <Card padding="lg">
            <h3 className="text-xl font-bold text-[var(--text-strong)]">W praktyce obejmuje to</h3>
            <ul className="mt-5 grid gap-3">
              {service.scope.map((item) => (
                <li key={item} className="flex min-w-0 gap-3 text-sm leading-6 text-[var(--text-body)]">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--brand)]" />
                  <span className="min-w-0">{item}</span>
                </li>
              ))}
            </ul>
          </Card>
          <div className="grid gap-4">
            <LegalDisclaimer />
            <RelatedLinks links={relatedLinks} />
          </div>
        </div>
      </PublicSection>

      <PublicSection
        className="bg-[var(--white)]"
        eyebrow="Proces"
        title="Jak prowadzimy usługę"
      >
        <ProcessSteps steps={service.process} />
      </PublicSection>

      <PublicSection
        className="bg-[var(--surface-page)]"
        eyebrow="Zaufanie"
        title="Prawo, proces i utrzymanie w jednym miejscu"
      >
        <TrustSection />
      </PublicSection>

      <PublicSection
        className="bg-[var(--white)]"
        eyebrow="FAQ"
        title={`Najczęstsze pytania: ${service.shortTitle}`}
      >
        <FaqSection items={service.faq} />
      </PublicSection>

      <PublicSection
        className="bg-[var(--surface-page)]"
        eyebrow="Kontakt"
        title="Opisz sytuację, a dobierzemy właściwą ścieżkę"
        description="Możesz zacząć od krótkiego formularza. Zgłoszenie zapisze kontekst strony, źródło i parametry UTM, więc rozmowa będzie konkretna od pierwszej odpowiedzi."
      >
        <div id="kontakt" className="grid gap-8 lg:grid-cols-[.82fr_1fr] lg:items-start">
          <Card padding="lg">
            <h3 className="text-xl font-bold text-[var(--text-strong)]">Dobry pierwszy krok</h3>
            <p className="mt-3 text-sm leading-7 text-[var(--text-muted)]">
              Jeśli nie wiesz, czy zacząć od audytu, dokumentacji czy IOD, uruchom checker obowiązku IOD albo opisz proces w formularzu.
            </p>
            <div className="mt-5">
              <LegalDisclaimer />
            </div>
          </Card>
          <LeadCaptureForm
            placement={`service-${service.slug}`}
            serviceSlug={service.slug}
            subject={service.primaryCta}
          />
        </div>
      </PublicSection>

      <CtaBand
        description="Wynik checkera nie zastępuje analizy prawnej, ale szybko wskaże, czy temat IOD powinien wejść do rozmowy."
        primaryCta={{ href: "/#checker", label: "Sprawdź obowiązek IOD" }}
        secondaryCta={{ href: "/blog/czy-musisz-powolac-inspektora-ochrony-danych", label: "Przeczytaj poradnik" }}
        title="Nie wiesz, czy firma musi mieć IOD?"
      />
    </PublicPageShell>
  );
}

function buildRelatedLinks(serviceSlugs: string[], industrySlugs: string[], articleSlugs: string[]): PublicLink[] {
  const serviceLinks = serviceSlugs
    .map(getPublicService)
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .map((item) => ({ label: item.shortTitle, href: item.path, description: item.metaDescription }));
  const industryLinks = industrySlugs
    .map(getPublicIndustry)
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .map((item) => ({ label: item.shortTitle, href: item.path, description: item.metaDescription }));
  const articleLinks = articleSlugs
    .map(getBlogArticle)
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .map((item) => ({ label: item.title, href: `/blog/${item.slug}`, description: item.excerpt }));

  return [...serviceLinks, ...industryLinks, ...articleLinks].slice(0, 6);
}

function JsonLd({ data }: { data: Record<string, unknown> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
