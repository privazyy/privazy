import Link from "next/link";
import type { Route } from "next";

import { ArticleProgress } from "@/components/blog/article-progress";
import { BlogFooter, BlogHeader } from "@/components/blog/blog-chrome";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { blogCategories, getRelatedArticles, type BlogArticle } from "@/lib/blog";

type ArticleExtras = {
  ctaType?: "CHECK_IOD" | "SHOP_PRODUCT" | "SERVICE_CONTACT" | "NEWSLETTER" | "CONSULTATION" | "RELATED_ARTICLE" | "NONE";
  faqItems?: Array<{ answer: string; question: string }>;
  legalDisclaimer?: string;
  relatedProducts?: Array<{ href: string; label: string; text: string }>;
  relatedServices?: Array<{ href: string; label: string }>;
  tags?: Array<{ label: string; slug: string }>;
};

type BlogArticleRenderable = BlogArticle & ArticleExtras;

export function BlogArticlePage({ article, related }: { article: BlogArticleRenderable; related?: BlogArticleRenderable[] }) {
  const toc = article.sections.map((section) => ({ id: section.id, label: section.title }));
  const relatedArticles = related ?? getRelatedArticles(article, 3);
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    author: { "@type": "Person", name: article.author },
    dateModified: article.updated,
    datePublished: article.date,
    description: article.excerpt,
    headline: article.title,
    mainEntityOfPage: `/blog/${article.slug}`,
  };
  const faqJsonLd = article.faqItems?.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: article.faqItems.map((item) => ({
          "@type": "Question",
          acceptedAnswer: { "@type": "Answer", text: item.answer },
          name: item.question,
        })),
      }
    : null;

  return (
    <main className="min-h-screen overflow-x-clip bg-white text-slate-950">
      <script dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} type="application/ld+json" />
      {faqJsonLd && <script dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} type="application/ld+json" />}
      <ArticleProgress toc={toc} />
      <BlogHeader />

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto w-full max-w-4xl px-[var(--gutter)] py-12 lg:py-18">
          <Button asChild size="sm" variant="ghost">
            <Link href={"/blog" as Route}>Wroc do bloga</Link>
          </Button>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Badge tone={article.category === "iod" ? "warning" : article.category === "poradniki" ? "success" : "brand"}>
              {blogCategories[article.category].label}
            </Badge>
            <span className="text-xs font-medium text-slate-500">{article.readTime} czytania</span>
          </div>
          <h1 className="mt-5 text-3xl font-extrabold leading-tight tracking-normal text-slate-950 sm:text-5xl">
            {article.title}
          </h1>
          <p className="mt-5 text-lg leading-8 text-slate-700">{article.excerpt}</p>
          <div className="mt-8 flex items-center gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-blue-600 text-sm font-bold text-white">
              {article.authorInitials}
            </span>
            <div>
              <div className="text-sm font-semibold text-slate-950">{article.author}</div>
              <div className="font-mono text-xs text-slate-500">Aktualizacja: {article.updated}</div>
            </div>
          </div>
        </div>
      </section>

      <article className="mx-auto w-full max-w-4xl px-[var(--gutter)] py-10 lg:py-14">
        <div className="rounded-3xl border border-blue-200 bg-blue-50 p-6 shadow-sm">
          <div className="text-sm font-bold uppercase tracking-normal text-blue-700">W skrocie</div>
          <ul className="mt-4 space-y-3">
            {article.summary.map((item) => (
              <li className="text-base leading-7 text-slate-700" key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="mt-10 space-y-10">
          {article.sections.map((section, index) => (
            <section className="scroll-mt-24" id={section.id} key={section.id}>
              <div className="mb-4 flex items-baseline gap-3">
                <span className="font-mono text-sm font-medium text-blue-600">{String(index + 1).padStart(2, "0")}</span>
                <h2 className="text-2xl font-bold leading-tight tracking-normal text-slate-950 lg:text-3xl">{section.title}</h2>
              </div>
              <div className="space-y-5">
                {section.body.map((paragraph) => (
                  <p className="text-base leading-8 text-slate-700 sm:text-lg" key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-blue-200 bg-blue-50 p-5">
          <div className="text-sm font-bold uppercase tracking-normal text-blue-700">To nie jest porada prawna</div>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            {article.legalDisclaimer ?? "Tresci maja charakter ogolny i nie stanowia indywidualnej porady prawnej. O obowiazkach decyduje analiza procesow w konkretnej organizacji."}
          </p>
        </div>

        {article.faqItems && article.faqItems.length > 0 && (
          <section className="mt-10 border-t border-slate-200 pt-8">
            <h2 className="text-2xl font-bold leading-tight text-slate-950">Najczestsze pytania</h2>
            <div className="mt-5 grid gap-4">
              {article.faqItems.map((item) => (
                <div className="rounded-2xl border border-slate-200 bg-white p-5" key={item.question}>
                  <h3 className="text-base font-bold text-slate-950">{item.question}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.answer}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {article.sources && (
          <section className="mt-10 border-t border-slate-200 pt-6">
            <h2 className="text-sm font-bold uppercase tracking-normal text-slate-500">Zrodla</h2>
            <ul className="mt-3 space-y-2">
              {article.sources.map((source) => (
                <li key={source.href}>
                  <a className="text-sm font-semibold text-blue-700 underline decoration-blue-200 underline-offset-4" href={source.href} rel="noreferrer" target="_blank">
                    {source.label}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>

      <section className="bg-blue-600">
        <div className="mx-auto w-full max-w-4xl px-[var(--gutter)] py-12 text-center lg:py-16">
          <ArticleCtaBlock article={article} />
        </div>
      </section>

      {((article.relatedProducts?.length ?? 0) > 0 || (article.relatedServices?.length ?? 0) > 0) && (
        <section className="py-12 pvz-container">
          <div className="grid gap-5 lg:grid-cols-2">
            {(article.relatedProducts?.length ?? 0) > 0 && (
              <RelatedBlock eyebrow="Powiazane produkty" items={article.relatedProducts ?? []} title="Dokumenty i pakiety" />
            )}
            {(article.relatedServices?.length ?? 0) > 0 && (
              <RelatedBlock
                eyebrow="Powiazane uslugi"
                items={(article.relatedServices ?? []).map((item) => ({ ...item, text: "Zobacz, jak PRIVAZY moze pomoc w tym obszarze." }))}
                title="Wsparcie PRIVAZY"
              />
            )}
          </div>
        </section>
      )}

      <section className="py-12 lg:py-16 pvz-container">
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <span className="text-sm font-semibold uppercase tracking-normal text-blue-700">Czytaj dalej</span>
            <h2 className="mt-2 text-2xl font-bold leading-tight text-slate-950 lg:text-3xl">Powiazane artykuly</h2>
          </div>
          <Button asChild className="hidden sm:inline-flex" variant="outline">
            <Link href={"/blog" as Route}>Wszystkie artykuly</Link>
          </Button>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {relatedArticles.map((item) => (
            <Link
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
              href={`/blog/${item.slug}` as Route}
              key={item.slug}
            >
              <Badge tone={item.category === "iod" ? "warning" : item.category === "poradniki" ? "success" : "brand"}>
                {blogCategories[item.category].label}
              </Badge>
              <h3 className="mt-4 line-clamp-3 text-base font-bold leading-6 text-slate-950">{item.title}</h3>
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">{item.excerpt}</p>
            </Link>
          ))}
        </div>
      </section>

      <BlogFooter />
    </main>
  );
}

function ArticleCtaBlock({ article }: { article: BlogArticleRenderable }) {
  const type = article.ctaType ?? "CHECK_IOD";

  if (type === "NONE") {
    return (
      <>
        <h2 className="text-3xl font-extrabold leading-tight tracking-normal text-white sm:text-4xl">Zapisz ten material na pozniej</h2>
        <p className="mx-auto mt-4 max-w-xl text-lg leading-8 text-blue-100">Wroc do niego przy przegladzie procesu albo dokumentacji.</p>
      </>
    );
  }

  const cta = {
    CHECK_IOD: { href: "/#checker", label: "Sprawdz obowiazek IOD", title: "Nie wiesz, czy Twoja firma musi miec IOD?" },
    CONSULTATION: { href: "/#kontakt", label: "Umow konsultacje", title: "Potrzebujesz spokojnej oceny sytuacji?" },
    NEWSLETTER: { href: "/blog#newsletter", label: "Zapisz sie do newslettera", title: "Chcesz dostawac praktyczne aktualizacje?" },
    RELATED_ARTICLE: { href: "/blog", label: "Czytaj kolejne artykuly", title: "Zobacz powiazane materialy PRIVAZY" },
    SERVICE_CONTACT: { href: "/#services", label: "Zobacz uslugi", title: "Potrzebujesz wsparcia przy wdrozeniu?" },
    SHOP_PRODUCT: { href: "/sklep", label: "Zobacz dokumenty", title: "Potrzebujesz gotowego dokumentu?" },
  }[type];

  return (
    <>
      <h2 className="text-3xl font-extrabold leading-tight tracking-normal text-white sm:text-4xl">{cta.title}</h2>
      <p className="mx-auto mt-4 max-w-xl text-lg leading-8 text-blue-100">
        Bez obietnic automatycznej zgodnosci. Dostaniesz praktyczny kolejny krok dopasowany do tematu artykulu.
      </p>
      <Button asChild className="mt-7" size="lg" variant="soft">
        <Link href={cta.href as Route}>{cta.label}</Link>
      </Button>
    </>
  );
}

function RelatedBlock({
  eyebrow,
  items,
  title,
}: {
  eyebrow: string;
  items: Array<{ href: string; label: string; text: string }>;
  title: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="text-sm font-semibold uppercase tracking-normal text-blue-700">{eyebrow}</div>
      <h2 className="mt-2 text-2xl font-bold text-slate-950">{title}</h2>
      <div className="mt-5 grid gap-3">
        {items.map((item) => (
          <Link className="rounded-2xl border border-slate-200 p-4 transition hover:border-blue-200 hover:bg-blue-50" href={item.href as Route} key={`${item.href}-${item.label}`}>
            <span className="font-bold text-slate-950">{item.label}</span>
            <span className="mt-1 block text-sm leading-6 text-slate-600">{item.text}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
