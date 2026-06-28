import Link from "next/link";
import type { Route } from "next";
import type { CSSProperties } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Check,
  ClipboardCheck,
  GraduationCap,
  HeartPulse,
  Landmark,
  Phone,
  Radar,
  SearchCheck,
  ShieldCheck,
} from "lucide-react";

import { ArticleProgress } from "@/components/blog/article-progress";
import { BlogFooter, BlogHeader } from "@/components/blog/blog-chrome";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { blogCategories, getRelatedArticles, type BlogArticle, type BlogFeature } from "@/lib/blog";

const narrowContainerStyle = {
  maxWidth: "calc(760px + (var(--gutter) * 2))",
  paddingLeft: "var(--gutter)",
  paddingRight: "var(--gutter)",
} satisfies CSSProperties;

const categoryIcons: Record<BlogArticle["category"], LucideIcon> = {
  rodo: ShieldCheck,
  iod: BadgeCheck,
  poradniki: BookOpen,
  prawo: Landmark,
};

const featureIcons: Record<BlogFeature["icon"], LucideIcon> = {
  landmark: Landmark,
  radar: Radar,
  "heart-pulse": HeartPulse,
  "search-check": SearchCheck,
  "graduation-cap": GraduationCap,
  phone: Phone,
  "clipboard-check": ClipboardCheck,
};

const categoryHeroStyles: Record<BlogArticle["category"], CSSProperties> = {
  rodo: {
    background: "radial-gradient(120% 90% at 50% -10%, var(--blue-50) 0%, #ffffff 60%)",
  },
  iod: {
    background: "radial-gradient(120% 90% at 50% -10%, var(--amber-50) 0%, #ffffff 60%)",
  },
  poradniki: {
    background: "radial-gradient(120% 90% at 50% -10%, var(--green-50) 0%, #ffffff 60%)",
  },
  prawo: {
    background: "radial-gradient(120% 90% at 50% -10%, var(--blue-100) 0%, #ffffff 60%)",
  },
};

const ctaStyle: CSSProperties = {
  background: "linear-gradient(135deg, var(--blue-600), var(--blue-500))",
};

export function BlogArticlePage({ article }: { article: BlogArticle }) {
  const toc = article.sections.map((section) => ({ id: section.id, label: section.title }));
  const related = getRelatedArticles(article, 3);
  const CategoryIcon = categoryIcons[article.category];

  return (
    <main className="min-h-screen overflow-x-clip bg-white text-slate-950">
      <ArticleProgress toc={toc} />
      <BlogHeader />

      <section className="overflow-hidden border-b border-slate-200" style={categoryHeroStyles[article.category]}>
        <div className="mx-auto w-full py-12 lg:py-20" style={narrowContainerStyle}>
          <Link
            href={"/blog" as Route}
            className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-700"
          >
            <ArrowLeft className="size-4" /> Wróć do bloga
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <Badge tone={article.category === "iod" ? "warning" : article.category === "poradniki" ? "success" : "brand"}>
              <CategoryIcon className="size-3.5" />
              {article.heroLabel}
            </Badge>
            <span className="text-xs font-medium text-slate-500">{article.readTime} czytania</span>
          </div>
          <h1 className="mt-5 text-3xl font-extrabold leading-tight tracking-normal text-slate-950 sm:text-5xl lg:text-6xl">
            {article.title}
          </h1>
          <p className="mt-5 text-lg leading-8 text-slate-700 sm:text-xl">{article.excerpt}</p>
          <div className="mt-8 flex items-center gap-3">
            <span
              className="grid size-11 shrink-0 place-items-center rounded-full font-display text-sm font-bold text-white"
              style={{ background: "linear-gradient(135deg, var(--blue-500), var(--blue-700))" }}
            >
              {article.authorInitials}
            </span>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-950">{article.author}</div>
              <div className="font-mono text-xs text-slate-500">Aktualizacja: {article.updated}</div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full" style={narrowContainerStyle}>
        <div className="-mt-8 relative z-10 rounded-3xl border border-blue-200 bg-blue-50 p-6 shadow-md md:p-8">
          <div className="mb-5 flex items-center gap-2">
            <Check className="size-5 text-emerald-600" />
            <span className="text-sm font-bold uppercase tracking-normal text-blue-700">W skrócie</span>
          </div>
          <ul className="space-y-4">
            {article.summary.map((item) => (
              <li key={item} className="flex min-w-0 gap-3 text-base leading-7 text-slate-700">
                <Check className="mt-1 size-5 shrink-0 text-emerald-600" />
                <span className="min-w-0 break-words">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <article className="mx-auto w-full py-10 lg:py-14" style={narrowContainerStyle}>
        {article.sections.map((section, index) => (
          <section key={section.id} id={section.id} className="scroll-mt-24 pb-10 last:pb-0">
            <div className="mb-5 flex items-baseline gap-3">
              <span className="shrink-0 whitespace-nowrap break-normal font-mono text-sm font-medium text-blue-500">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h2 className="text-2xl font-bold leading-tight tracking-normal text-slate-950 lg:text-3xl">
                {section.title}
              </h2>
            </div>

            <div className="space-y-5">
              {section.body.map((paragraph) => (
                <p key={paragraph} className="text-base leading-8 text-slate-700 sm:text-lg">
                  {paragraph}
                </p>
              ))}
            </div>

            {section.features && (
              <div className="mt-7 grid gap-4">
                {section.features.map((feature) => (
                  <FeatureCard key={feature.title} feature={feature} />
                ))}
              </div>
            )}

            {section.stats && (
              <div className="mt-7 grid gap-4 sm:grid-cols-2">
                {section.stats.map((stat) => (
                  <div key={stat.value} className="rounded-2xl border border-red-200 bg-red-50 p-6">
                    <div className="text-4xl font-extrabold leading-none tracking-normal text-red-600 lg:text-5xl">
                      {stat.value}
                    </div>
                    <div className="mt-2 text-sm text-slate-700">{stat.label}</div>
                  </div>
                ))}
              </div>
            )}

            {index === 1 && article.quote && (
              <blockquote className="my-10 border-l-4 border-blue-500 pl-6">
                <p className="text-2xl font-bold leading-snug tracking-normal text-slate-950 lg:text-3xl">
                  „{article.quote}”
                </p>
              </blockquote>
            )}
          </section>
        ))}

        <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 p-5">
          <div className="text-sm font-bold uppercase tracking-normal text-blue-700">
            To nie jest porada prawna
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            Treści mają charakter ogólny i nie stanowią porady prawnej dla konkretnej sprawy. O obowiązkach decyduje analiza
            procesów przetwarzania w Twojej organizacji.
          </p>
        </div>

        {article.sources && (
          <section className="mt-10 border-t border-slate-200 pt-6">
            <h2 className="text-sm font-bold uppercase tracking-normal text-slate-500">Źródła</h2>
            <ul className="mt-3 space-y-2">
              {article.sources.map((source) => (
                <li key={source.href}>
                  <a
                    href={source.href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-semibold text-blue-700 underline decoration-blue-200 underline-offset-4"
                  >
                    {source.label}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>

      <section style={ctaStyle}>
        <div className="mx-auto w-full py-12 text-center lg:py-16" style={narrowContainerStyle}>
          <h2 className="text-3xl font-extrabold leading-tight tracking-normal text-white sm:text-4xl">
            Nie wiesz, czy Twoja firma musi mieć IOD?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-8 text-blue-100">
            Odpowiedz na kilka pytań o swoje procesy. W 2 minuty dostaniesz orientacyjny wynik.
          </p>
          <Button asChild size="lg" variant="soft" className="mt-7">
            <Link href={"/#checker" as Route}>
              Sprawdź obowiązek IOD <ArrowRight className="size-5" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="py-12 lg:py-16 pvz-container">
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <span className="text-sm font-semibold uppercase tracking-normal text-blue-700">
              Czytaj dalej
            </span>
            <h2 className="mt-2 text-2xl font-bold leading-tight text-slate-950 lg:text-3xl">Powiązane artykuły</h2>
          </div>
          <Button asChild variant="outline" className="hidden sm:inline-flex">
            <Link href={"/blog" as Route}>Wszystkie artykuły</Link>
          </Button>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {related.map((item) => {
            const RelatedIcon = categoryIcons[item.category];
            const itemCategory = blogCategories[item.category];

            return (
              <a
                key={item.slug}
                href={`/blog/${item.slug}`}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
              >
                <Badge tone={item.category === "iod" ? "warning" : item.category === "poradniki" ? "success" : "brand"}>
                  <RelatedIcon className="size-3.5" />
                  {itemCategory.label}
                </Badge>
                <h3 className="mt-4 line-clamp-3 text-base font-bold leading-6 text-slate-950">{item.title}</h3>
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">{item.excerpt}</p>
              </a>
            );
          })}
        </div>
      </section>

      <BlogFooter />
    </main>
  );
}

function FeatureCard({ feature }: { feature: BlogFeature }) {
  const Icon = featureIcons[feature.icon];

  return (
    <div className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
      <span className="grid size-12 shrink-0 place-items-center rounded-2xl border border-blue-200 bg-blue-50 text-blue-500">
        <Icon className="size-5" />
      </span>
      <div className="min-w-0 break-words">
        <div className="flex flex-wrap items-center gap-2">
          {feature.label && <span className="font-mono text-xs text-slate-400">{feature.label}</span>}
          <h3 className="text-lg font-bold text-slate-950">{feature.title}</h3>
        </div>
        <p className="mt-2 text-base leading-7 text-slate-700">{feature.text}</p>
        {feature.ref && (
          <span className="mt-3 inline-flex rounded-full bg-slate-100 px-3 py-1 font-mono text-xs text-slate-500">
            {feature.ref}
          </span>
        )}
      </div>
    </div>
  );
}
