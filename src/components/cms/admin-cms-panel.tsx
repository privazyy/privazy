"use client";

import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import type { UserRole } from "@prisma/client";
import { Archive, Eye, FileText, Plus, Save, Send, Tags } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type CmsPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  status: "DRAFT" | "IN_REVIEW" | "PUBLISHED" | "ARCHIVED";
  publishedAt: string | Date | null;
  seoTitle: string | null;
  seoDescription: string | null;
  canonicalUrl: string | null;
  categories: TaxonomyItem[];
  tags: TaxonomyItem[];
};

type TaxonomyItem = {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
};

type Subscriber = {
  id: string;
  email: string;
  status: string;
  source: string;
  consentMarketing: boolean;
  createdAt: string | Date;
};

type AdminCmsPanelProps = {
  canMutate: boolean;
  canPublish: boolean;
  initialCategories: TaxonomyItem[];
  initialPosts: CmsPost[];
  initialSubscribers: Subscriber[];
  initialTags: TaxonomyItem[];
  role: UserRole;
};

const statusLabels: Record<CmsPost["status"], string> = {
  DRAFT: "Draft",
  IN_REVIEW: "Review",
  PUBLISHED: "Published",
  ARCHIVED: "Archived",
};

export function AdminCmsPanel({
  canMutate,
  canPublish,
  initialCategories,
  initialPosts,
  initialSubscribers,
  initialTags,
  role,
}: AdminCmsPanelProps) {
  const [posts, setPosts] = useState(initialPosts);
  const [categories, setCategories] = useState(initialCategories);
  const [tags, setTags] = useState(initialTags);
  const [subscribers] = useState(initialSubscribers);
  const [selectedPost, setSelectedPost] = useState<CmsPost | null>(initialPosts[0] ?? null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<CmsPost["status"] | "ALL">("ALL");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const filteredPosts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return posts.filter((post) => {
      const matchesStatus = status === "ALL" || post.status === status;
      const matchesQuery =
        !normalized || [post.title, post.slug, post.excerpt].join(" ").toLowerCase().includes(normalized);
      return matchesStatus && matchesQuery;
    });
  }, [posts, query, status]);

  async function refreshPosts() {
    const payload = await apiJson<{ items: CmsPost[] }>("/api/cms/posts?limit=50");
    setPosts(payload.items);
    setSelectedPost((current) => payload.items.find((post) => post.id === current?.id) ?? payload.items[0] ?? null);
  }

  async function handlePostSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canMutate) return;
    setBusy(true);
    setMessage("");

    const form = new FormData(event.currentTarget);
    const categoryId = String(form.get("categoryId") ?? "");
    const tagId = String(form.get("tagId") ?? "");
    const body = {
      slug: String(form.get("slug") ?? ""),
      title: String(form.get("title") ?? ""),
      excerpt: String(form.get("excerpt") ?? ""),
      content: String(form.get("content") ?? ""),
      status: String(form.get("status") ?? "DRAFT"),
      seoTitle: String(form.get("seoTitle") ?? "") || undefined,
      seoDescription: String(form.get("seoDescription") ?? "") || undefined,
      canonicalUrl: String(form.get("canonicalUrl") ?? "") || undefined,
      categoryIds: categoryId ? [categoryId] : [],
      tagIds: tagId ? [tagId] : [],
    };

    try {
      await apiJson(selectedPost ? `/api/cms/posts/${selectedPost.id}` : "/api/cms/posts", {
        method: selectedPost ? "PATCH" : "POST",
        body: JSON.stringify(body),
      });
      setMessage(selectedPost ? "Wpis zaktualizowany." : "Wpis utworzony.");
      await refreshPosts();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Nie udalo sie zapisac wpisu.");
    } finally {
      setBusy(false);
    }
  }

  async function postAction(postId: string, action: "submit-review" | "publish" | "archive") {
    setBusy(true);
    setMessage("");
    try {
      await apiJson(`/api/cms/posts/${postId}/${action}`, { method: "POST" });
      setMessage("Status wpisu zostal zmieniony.");
      await refreshPosts();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Nie udalo sie zmienic statusu.");
    } finally {
      setBusy(false);
    }
  }

  async function createTaxonomy(event: FormEvent<HTMLFormElement>, kind: "categories" | "tags") {
    event.preventDefault();
    if (!canMutate) return;
    setBusy(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      await apiJson(`/api/cms/${kind}`, {
        method: "POST",
        body: JSON.stringify({
          slug: String(form.get("slug") ?? ""),
          name: String(form.get("name") ?? ""),
          description: kind === "categories" ? String(form.get("description") ?? "") || undefined : undefined,
        }),
      });
      const payload = await apiJson<{ items: TaxonomyItem[] }>(`/api/cms/${kind}`);
      if (kind === "categories") setCategories(payload.items);
      else setTags(payload.items);
      event.currentTarget.reset();
      setMessage(kind === "categories" ? "Kategoria dodana." : "Tag dodany.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Nie udalo sie zapisac taksonomii.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--surface-page)] py-8 text-[var(--text-strong)]">
      <div className="grid gap-7 pvz-container">
        <header className="flex flex-col gap-3 border-b border-[var(--border-subtle)] pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="font-mono text-xs font-medium uppercase tracking-normal text-[var(--text-muted)]">
              Admin / CMS
            </span>
            <h1 className="mt-2 text-3xl font-bold tracking-normal">Blog CMS i newsletter</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-body)]">
              Rola: {role}. READ_ONLY moze czytac dane, ale mutacje sa blokowane takze po stronie API.
            </p>
          </div>
          <Badge tone={canMutate ? "success" : "warning"}>{canMutate ? "Mutacje wlaczone" : "Tylko odczyt"}</Badge>
        </header>

        {message && (
          <div className="rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-white p-4 text-sm text-[var(--text-body)]">
            {message}
          </div>
        )}

        <section className="grid gap-6 xl:grid-cols-[1fr_420px]">
          <div className="grid gap-4">
            <div className="flex flex-col gap-3 md:flex-row">
              <Input aria-label="Szukaj wpisow CMS" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Szukaj po tytule, slugu lub opisie" />
              <Select aria-label="Filtr statusu wpisow" value={status} onChange={(event) => setStatus(event.target.value as CmsPost["status"] | "ALL")} className="md:w-48">
                <option value="ALL">Wszystkie statusy</option>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </div>
            {filteredPosts.length > 0 ? (
              <div className="grid gap-3">
                {filteredPosts.map((post) => (
                  <article key={post.id} className="rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-white p-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap gap-2">
                          <Badge tone={post.status === "PUBLISHED" ? "success" : post.status === "ARCHIVED" ? "neutral" : "brand"}>
                            {statusLabels[post.status]}
                          </Badge>
                          <span className="font-mono text-xs text-[var(--text-muted)]">/{post.slug}</span>
                        </div>
                        <h2 className="mt-3 text-lg font-bold leading-snug tracking-normal">{post.title}</h2>
                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--text-body)]">{post.excerpt}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => setSelectedPost(post)}>
                          <Eye className="size-4" /> Edytuj
                        </Button>
                        <Button type="button" variant="outline" size="sm" disabled={!canMutate || busy} onClick={() => postAction(post.id, "submit-review")}>
                          <Send className="size-4" /> Review
                        </Button>
                        <Button type="button" size="sm" disabled={!canPublish || busy} onClick={() => postAction(post.id, "publish")}>
                          <FileText className="size-4" /> Publikuj
                        </Button>
                        <Button type="button" variant="outline" size="sm" disabled={!canPublish || busy} onClick={() => postAction(post.id, "archive")}>
                          <Archive className="size-4" /> Archiwizuj
                        </Button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-white p-8 text-center text-sm text-[var(--text-muted)]">
                Brak wpisow dla filtra.
              </div>
            )}
          </div>

          <form key={selectedPost?.id ?? "new"} className="grid gap-3 rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-white p-4" onSubmit={handlePostSubmit}>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold tracking-normal">{selectedPost ? "Edycja wpisu" : "Nowy wpis"}</h2>
              <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedPost(null)}>
                <Plus className="size-4" /> Nowy
              </Button>
            </div>
            <Input aria-label="Tytul wpisu" name="title" required defaultValue={selectedPost?.title ?? ""} placeholder="Tytul" disabled={!canMutate} />
            <Input aria-label="Slug wpisu" name="slug" required defaultValue={selectedPost?.slug ?? ""} placeholder="slug-wpisu" disabled={!canMutate} />
            <Textarea aria-label="Excerpt wpisu" name="excerpt" required defaultValue={selectedPost?.excerpt ?? ""} placeholder="Lead / excerpt" rows={3} disabled={!canMutate} />
            <Textarea aria-label="Tresc wpisu" name="content" required defaultValue={selectedPost?.content ?? ""} placeholder="Markdown lub plain text" rows={9} disabled={!canMutate} />
            <div className="grid gap-3 md:grid-cols-2">
              <Select aria-label="Status wpisu" name="status" defaultValue={selectedPost?.status ?? "DRAFT"} disabled={!canMutate}>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
              <Select aria-label="Kategoria wpisu" name="categoryId" defaultValue={selectedPost?.categories[0]?.id ?? ""} disabled={!canMutate}>
                <option value="">Bez kategorii</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </div>
            <Select aria-label="Tag wpisu" name="tagId" defaultValue={selectedPost?.tags[0]?.id ?? ""} disabled={!canMutate}>
              <option value="">Bez tagu</option>
              {tags.map((tag) => (
                <option key={tag.id} value={tag.id}>
                  {tag.name}
                </option>
              ))}
            </Select>
            <Input aria-label="SEO title" name="seoTitle" defaultValue={selectedPost?.seoTitle ?? ""} placeholder="SEO title" disabled={!canMutate} />
            <Textarea aria-label="SEO description" name="seoDescription" defaultValue={selectedPost?.seoDescription ?? ""} placeholder="SEO description" rows={2} disabled={!canMutate} />
            <Input aria-label="Canonical URL" name="canonicalUrl" defaultValue={selectedPost?.canonicalUrl ?? ""} placeholder="Canonical URL opcjonalnie" disabled={!canMutate} />
            <Button type="submit" disabled={!canMutate || busy}>
              <Save className="size-4" /> {selectedPost ? "Zapisz zmiany" : "Utworz wpis"}
            </Button>
            {selectedPost && (
              <div className="rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--surface-sunken)] p-3">
                <div className="mb-2 text-xs font-semibold uppercase tracking-normal text-[var(--text-muted)]">Preview admin</div>
                <h3 className="text-base font-bold">{selectedPost.title}</h3>
                <p className="mt-2 line-clamp-4 whitespace-pre-line text-sm leading-6 text-[var(--text-body)]">{selectedPost.content}</p>
              </div>
            )}
          </form>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <TaxonomyForm title="Kategorie" icon={<Tags className="size-4" />} items={categories} disabled={!canMutate || busy} onSubmit={(event) => createTaxonomy(event, "categories")} withDescription />
          <TaxonomyForm title="Tagi" icon={<Tags className="size-4" />} items={tags} disabled={!canMutate || busy} onSubmit={(event) => createTaxonomy(event, "tags")} />
        </section>

        <section className="rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-white p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold tracking-normal">Newsletter subscribers</h2>
            <Badge tone="outline">Read-only</Badge>
          </div>
          {subscribers.length > 0 ? (
            <div className="overflow-x-auto" data-responsive-scroll="true">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="border-b text-xs uppercase tracking-normal text-[var(--text-muted)]">
                  <tr>
                    <th className="py-3 pr-4">Email</th>
                    <th className="py-3 pr-4">Status</th>
                    <th className="py-3 pr-4">Source</th>
                    <th className="py-3 pr-4">Consent</th>
                    <th className="py-3">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map((subscriber) => (
                    <tr key={subscriber.id} className="border-b last:border-0">
                      <td className="py-3 pr-4 font-medium">{subscriber.email}</td>
                      <td className="py-3 pr-4">{subscriber.status}</td>
                      <td className="py-3 pr-4">{subscriber.source}</td>
                      <td className="py-3 pr-4">{subscriber.consentMarketing ? "yes" : "no"}</td>
                      <td className="py-3">{formatDate(subscriber.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-[var(--text-muted)]">Brak zapisanych subskrybentow.</p>
          )}
        </section>
      </div>
    </main>
  );
}

function TaxonomyForm({
  disabled,
  icon,
  items,
  onSubmit,
  title,
  withDescription,
}: {
  disabled: boolean;
  icon: ReactNode;
  items: TaxonomyItem[];
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  title: string;
  withDescription?: boolean;
}) {
  return (
    <section className="rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-white p-4">
      <h2 className="flex items-center gap-2 text-lg font-bold tracking-normal">
        {icon} {title}
      </h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.length > 0 ? items.map((item) => <Badge key={item.id}>{item.name}</Badge>) : <span className="text-sm text-[var(--text-muted)]">Brak.</span>}
      </div>
      <form className="mt-4 grid gap-3" onSubmit={onSubmit}>
        <Input aria-label={`${title} nazwa`} name="name" required placeholder="Nazwa" disabled={disabled} />
        <Input aria-label={`${title} slug`} name="slug" required placeholder="slug" disabled={disabled} />
        {withDescription && <Input aria-label={`${title} opis`} name="description" placeholder="Opis" disabled={disabled} />}
        <Button type="submit" variant="outline" disabled={disabled}>
          <Plus className="size-4" /> Dodaj
        </Button>
      </form>
    </section>
  );
}

async function apiJson<T = unknown>(url: string, init?: RequestInit) {
  const response = await fetch(url, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...init?.headers,
    },
  });
  const payload = (await response.json().catch(() => null)) as (T & { error?: string }) | null;
  if (!response.ok) {
    throw new Error(payload?.error ?? "Operacja nie powiodla sie.");
  }
  return payload as T;
}

function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat("pl-PL", { dateStyle: "medium" }).format(new Date(value));
}
