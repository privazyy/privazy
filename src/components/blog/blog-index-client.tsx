"use client";

import { useMemo, useState, type CSSProperties, type FormEvent } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Check,
  Landmark,
  Mail,
  RotateCcw,
  Search,
  SearchX,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { blogCategories, featuredBlogArticle, type BlogArticle, type BlogCategoryKey } from "@/lib/blog";
import { cn } from "@/lib/utils";

type CategoryFilter = BlogCategoryKey | "all";

type CategoryVisual = {
  accent: string;
  badgeText: string;
  cover: CSSProperties;
  icon: string;
};

const categoryIcons: Record<BlogCategoryKey, LucideIcon> = {
  rodo: ShieldCheck,
  iod: BadgeCheck,
  poradniki: BookOpen,
  prawo: Landmark,
};

const categoryVisuals: Record<BlogCategoryKey, CategoryVisual> = {
  rodo: {
    accent: "#2B7CFF",
    badgeText: "#1450BE",
    icon: "rgba(43,124,255,0.2)",
    cover: {
      background:
        "repeating-radial-gradient(circle at 80% 22%, rgba(43,124,255,0.14) 0 1px, transparent 1px 16px), radial-gradient(360px 190px at 80% 6%, rgba(43,124,255,0.16), transparent 64%), var(--blue-50)",
    },
  },
  iod: {
    accent: "#F59E0B",
    badgeText: "#D98209",
    icon: "rgba(245,158,11,0.22)",
    cover: {
      background:
        "repeating-radial-gradient(circle at 80% 22%, rgba(245,158,11,0.14) 0 1px, transparent 1px 16px), radial-gradient(360px 190px at 80% 6%, rgba(245,158,11,0.16), transparent 64%), var(--amber-50)",
    },
  },
  poradniki: {
    accent: "#14A56C",
    badgeText: "#0E8A58",
    icon: "rgba(20,165,108,0.2)",
    cover: {
      background:
        "repeating-radial-gradient(circle at 80% 22%, rgba(20,165,108,0.14) 0 1px, transparent 1px 16px), radial-gradient(360px 190px at 80% 6%, rgba(20,165,108,0.16), transparent 64%), var(--green-50)",
    },
  },
  prawo: {
    accent: "#1A63E6",
    badgeText: "#15346F",
    icon: "rgba(26,99,230,0.2)",
    cover: {
      background:
        "repeating-radial-gradient(circle at 80% 22%, rgba(26,99,230,0.14) 0 1px, transparent 1px 16px), radial-gradient(360px 190px at 80% 6%, rgba(26,99,230,0.16), transparent 64%), var(--blue-100)",
    },
  },
};

const heroBackground: CSSProperties = {
  background:
    "radial-gradient(900px 460px at 82% -10%, var(--blue-50), transparent 60%), radial-gradient(680px 380px at -5% 110%, #F3F8FF, transparent 55%), #ffffff",
};

const newsletterBackground: CSSProperties = {
  background: "linear-gradient(135deg, var(--blue-600), var(--blue-500))",
};

const categoryFilters: Array<{ key: CategoryFilter; label: string }> = [
  { key: "all", label: "Wszystkie" },
  { key: "rodo", label: "RODO" },
  { key: "iod", label: "Obowiązek IOD" },
  { key: "poradniki", label: "Poradniki" },
  { key: "prawo", label: "Zmiany w prawie" },
];

export function BlogIndexClient({ articles }: { articles: BlogArticle[] }) {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("all");
  const [query, setQuery] = useState("");
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const filteredArticles = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return articles.filter((article) => {
      const category = blogCategories[article.category];
      const matchesCategory = activeCategory === "all" || article.category === activeCategory;
      const matchesQuery =
        !normalizedQuery ||
        [article.title, article.excerpt, article.author, category.label, category.tag]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, articles, query]);

  const queryFilteredArticles = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return articles.filter((article) => {
      if (!normalizedQuery) return true;
      const category = blogCategories[article.category];

      return [article.title, article.excerpt, article.author, category.label, category.tag]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [articles, query]);

  const handleNewsletter = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (newsletterEmail.trim()) setSubscribed(true);
  };

  const clearFilters = () => {
    setActiveCategory("all");
    setQuery("");
  };

  return (
    <>
      <section className="overflow-hidden border-b border-slate-200" style={heroBackground}>
        <div className="grid items-center gap-10 py-10 lg:grid-cols-2 lg:gap-14 lg:py-16 pvz-container">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono text-xs font-medium uppercase tracking-normal text-slate-500">
                Blog PRIVAZY
              </span>
              <span className="size-1 rounded-full bg-slate-300" />
              <Badge tone="brand">
                <Sparkles className="size-3.5" /> Polecany
              </Badge>
            </div>
            <h1 className="mt-5 max-w-3xl text-3xl font-extrabold leading-tight tracking-normal text-slate-950 sm:text-4xl lg:text-5xl">
              {featuredBlogArticle.title}
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-700">
              {featuredBlogArticle.excerpt}
            </p>
            <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
              <AuthorLine article={featuredBlogArticle} />
              <Button asChild size="lg">
                <a href={`/blog/${featuredBlogArticle.slug}`}>
                  Czytaj artykuł <ArrowRight className="size-5" />
                </a>
              </Button>
            </div>
          </div>
          <a
            href={`/blog/${featuredBlogArticle.slug}`}
            className="relative block min-h-64 overflow-hidden rounded-3xl border border-slate-200 shadow-lg transition hover:shadow-xl lg:min-h-96"
            style={categoryVisuals[featuredBlogArticle.category].cover}
          >
            <BlogCoverBadge article={featuredBlogArticle} className="absolute left-5 top-5 bg-white/90 shadow-sm" />
            <Landmark
              className="absolute -bottom-4 -right-3 size-36 lg:size-44"
              style={{ color: categoryVisuals[featuredBlogArticle.category].icon }}
            />
            <span className="absolute bottom-6 left-6 font-mono text-xs uppercase tracking-normal text-blue-900">
              {featuredBlogArticle.coverNote}
            </span>
          </a>
        </div>
      </section>

      <section className="py-10 lg:py-16 pvz-container">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-extrabold leading-tight tracking-normal text-slate-950 lg:text-3xl">
              Najnowsze artykuły
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Wiedza o RODO i ochronie danych w praktyce, bez prawniczego żargonu.
            </p>
          </div>
          <span className="font-mono text-sm text-slate-500">{formatCount(filteredArticles.length)}</span>
        </div>

        <div className="mt-7 grid gap-4">
          <div className="flex gap-2 overflow-x-auto pb-1 pvz-h-scroll" data-responsive-scroll="true">
            {categoryFilters.map((filter) => {
              const active = activeCategory === filter.key;
              const count =
                filter.key === "all"
                  ? queryFilteredArticles.length
                  : queryFilteredArticles.filter((article) => article.category === filter.key).length;

              return (
                <button
                  key={filter.key}
                  type="button"
                  className={cn(
                    "inline-flex h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-semibold shadow-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
                    !active && "hover:bg-blue-50",
                  )}
                  style={{
                    background: active ? "var(--brand)" : "var(--surface-card)",
                    borderColor: active ? "var(--brand)" : "var(--border-subtle)",
                    boxShadow: active ? "var(--shadow-brand-sm)" : "var(--shadow-xs)",
                    color: active ? "#ffffff" : "var(--text-body)",
                  }}
                  onClick={() => setActiveCategory(filter.key)}
                >
                  {filter.label}
                  <span
                    className="rounded-full px-2 py-0.5 font-mono text-xs"
                    style={{
                      background: active ? "rgba(255,255,255,0.22)" : "var(--gray-100)",
                      color: active ? "#ffffff" : "var(--text-muted)",
                    }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="relative w-full md:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Szukaj artykułów..."
              className="h-11 pl-10"
            />
          </div>
        </div>

        {filteredArticles.length > 0 ? (
          <div className="mt-7 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredArticles.map((article) => (
              <BlogCard key={article.slug} article={article} />
            ))}
          </div>
        ) : (
          <div className="mt-7 flex flex-col items-center rounded-2xl border border-slate-200 bg-white px-5 py-14 text-center">
            <span className="grid size-14 place-items-center rounded-full bg-slate-100 text-slate-500">
              <SearchX className="size-6" />
            </span>
            <h3 className="mt-5 text-xl font-bold text-slate-950">Brak artykułów</h3>
            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
              Nie znaleźliśmy artykułów dla wybranych filtrów. Spróbuj innej kategorii lub frazy.
            </p>
            <Button type="button" variant="outline" className="mt-5" onClick={clearFilters}>
              <RotateCcw className="size-4" /> Wyczyść filtry
            </Button>
          </div>
        )}
      </section>

      <section className="pb-14 lg:pb-24 pvz-container">
        <div className="relative grid gap-8 overflow-hidden rounded-3xl p-6 text-white shadow-lg md:grid-cols-2 md:p-10 lg:p-14" style={newsletterBackground}>
          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
              <Mail className="size-3.5" /> Newsletter RODO
            </span>
            <h2 className="mt-4 text-2xl font-extrabold leading-tight text-white lg:text-3xl">
              Bądź na bieżąco ze zmianami w prawie ochrony danych
            </h2>
            <p className="mt-3 max-w-md text-lg leading-8 text-white/85">
              Raz w miesiącu, konkretnie. Najważniejsze decyzje UODO, nowe obowiązki i praktyczne wskazówki dla Twojej firmy.
            </p>
          </div>
          <div className="relative">
            {subscribed ? (
              <div className="flex items-center gap-4 rounded-2xl border border-white/25 bg-white/15 p-5">
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-white text-emerald-600">
                  <Check className="size-5" />
                </span>
                <div>
                  <div className="text-lg font-bold text-white">Dziękujemy!</div>
                  <div className="mt-1 text-sm text-white/80">Potwierdź zapis w wiadomości, którą wysłaliśmy.</div>
                </div>
              </div>
            ) : (
              <form className="flex flex-col gap-3" onSubmit={handleNewsletter}>
                <Input
                  required
                  type="email"
                  value={newsletterEmail}
                  onChange={(event) => setNewsletterEmail(event.target.value)}
                  placeholder="Twój adres e-mail"
                  className="h-12 border-0 bg-white"
                />
                <Button type="submit" size="lg" className="bg-slate-950 hover:bg-black">
                  Zapisz się <ArrowRight className="size-5" />
                </Button>
                <span className="text-center text-xs text-white/70">Bez spamu. Wypiszesz się w każdej chwili.</span>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function BlogCard({ article }: { article: BlogArticle }) {
  const Icon = categoryIcons[article.category];
  const visual = categoryVisuals[article.category];

  return (
    <a
      href={`/blog/${article.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white text-current shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg"
      style={{ minHeight: 410 }}
    >
      <div className="relative flex items-end overflow-hidden" style={{ ...visual.cover, height: 164 }}>
        <Icon className="absolute right-4 top-4 size-14" style={{ color: visual.icon }} />
        <BlogCoverBadge article={article} className="relative mb-4 ml-4 bg-white/90 shadow-sm" />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-2 text-lg font-bold leading-snug tracking-normal text-slate-950 transition group-hover:text-blue-700">
          {article.title}
        </h3>
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-500">{article.excerpt}</p>
        <div className="mt-auto border-t border-slate-200 pt-4">
          <AuthorLine article={article} compact />
        </div>
      </div>
    </a>
  );
}

function BlogCoverBadge({ article, className }: { article: BlogArticle; className?: string }) {
  const Icon = categoryIcons[article.category];
  const category = blogCategories[article.category];
  const visual = categoryVisuals[article.category];

  return (
    <span
      className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold", className)}
      style={{ color: visual.badgeText }}
    >
      <Icon className="size-3.5" style={{ color: visual.accent }} />
      {category.tag}
    </span>
  );
}

function AuthorLine({ article, compact }: { article: BlogArticle; compact?: boolean }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-blue-50 font-display text-xs font-bold text-blue-700">
        {article.authorInitials}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold text-slate-950">{article.author}</span>
        <span className={cn("block text-xs text-slate-400", compact ? "truncate" : "")}>
          {article.date} · {article.readTime} czytania
        </span>
      </span>
    </div>
  );
}

function formatCount(count: number) {
  if (count === 1) return "1 artykuł";
  if (count >= 2 && count <= 4) return `${count} artykuły`;
  return `${count} artykułów`;
}
