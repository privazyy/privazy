import Link from "next/link";
import type { Route } from "next";
import type { BlogPostStatus, UserRole } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { saveCmsPostAction } from "@/server/cms/actions";
import { canPublishCms } from "@/server/cms/permissions";

type EditablePost = {
  canonicalUrl: string | null;
  category: { slug: string };
  content: string;
  ctaType: string;
  excerpt: string;
  faqItems: Array<{ answer: string; question: string }>;
  id: string;
  legalDisclaimer: string;
  metaDescription: string;
  ogDescription: string | null;
  ogImage: string | null;
  ogTitle: string | null;
  scheduledAt: Date | null;
  seoTitle: string | null;
  slug: string;
  status: BlogPostStatus;
  tags: Array<{ tag: { slug: string } }>;
  title: string;
};

const defaultDisclaimer =
  "Tresci maja charakter ogolny i nie stanowia indywidualnej porady prawnej. O obowiazkach decyduje analiza procesow w konkretnej organizacji.";

export function CmsPostForm({ actorRole, post }: { actorRole: UserRole; post?: EditablePost }) {
  const mayPublish = canPublishCms({ email: "", id: "", name: null, role: actorRole });
  const faq = post?.faqItems[0];

  return (
    <main className="min-h-screen bg-[var(--surface-page)] px-[var(--gutter)] py-8 text-[var(--text-strong)]">
      <form action={saveCmsPostAction} className="mx-auto grid w-full max-w-[var(--container-wide)] gap-5">
        <input name="postId" type="hidden" value={post?.id ?? ""} />
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-normal text-[var(--brand)]">CMS blog</p>
            <h1 className="mt-2 text-3xl font-bold">{post ? "Edycja wpisu" : "Nowy wpis"}</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--text-muted)]">
              Prosty edytor markdown. Publikacja tresci prawnych wymaga roli LAWYER albo ADMIN.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline"><Link href={"/admin/blog" as Route}>Wroc</Link></Button>
            {post && <Button asChild variant="outline"><Link href={`/admin/blog/${post.id}/preview` as Route}>Preview</Link></Button>}
            <Button type="submit">Zapisz</Button>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <Card className="grid gap-4" padding="md" variant="flat">
            <Field htmlFor="title" label="Tytul" required>
              <Input defaultValue={post?.title} id="title" name="title" required />
            </Field>
            <Field htmlFor="slug" label="Slug" required>
              <Input defaultValue={post?.slug} id="slug" name="slug" required />
            </Field>
            <Field htmlFor="excerpt" label="Lead / excerpt" required>
              <Textarea defaultValue={post?.excerpt} id="excerpt" name="excerpt" required />
            </Field>
            <Field htmlFor="content" hint="Uzywaj naglowkow ##. Kazda sekcja stanie sie czescia artykulu." label="Content markdown" required>
              <Textarea className="min-h-[420px] font-mono" defaultValue={post?.content} id="content" name="content" required />
            </Field>
          </Card>

          <aside className="grid content-start gap-5">
            <Card className="grid gap-4" padding="md" variant="flat">
              <Field htmlFor="status" label="Status" required>
                <select
                  className="h-11 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-card)] px-3 text-sm"
                  defaultValue={post?.status ?? "DRAFT"}
                  id="status"
                  name="status"
                >
                  <option value="DRAFT">DRAFT</option>
                  <option value="IN_REVIEW">IN_REVIEW</option>
                  {mayPublish && <option value="SCHEDULED">SCHEDULED</option>}
                  {mayPublish && <option value="PUBLISHED">PUBLISHED</option>}
                  {mayPublish && <option value="ARCHIVED">ARCHIVED</option>}
                </select>
              </Field>
              <Field htmlFor="scheduledAt" label="Data publikacji planowanej">
                <Input defaultValue={post?.scheduledAt ? toDatetimeLocal(post.scheduledAt) : ""} id="scheduledAt" name="scheduledAt" type="datetime-local" />
              </Field>
              <Field htmlFor="categorySlug" label="Kategoria slug" required>
                <Input defaultValue={post?.category.slug ?? "rodo-dla-firm"} id="categorySlug" name="categorySlug" required />
              </Field>
              <Field htmlFor="tags" label="Tagi">
                <Input defaultValue={post?.tags.map(({ tag }) => tag.slug).join(", ")} id="tags" name="tags" placeholder="rodo, iod, dokumentacja" />
              </Field>
              <Field htmlFor="ctaType" label="CTA">
                <select
                  className="h-11 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-card)] px-3 text-sm"
                  defaultValue={post?.ctaType ?? "CHECK_IOD"}
                  id="ctaType"
                  name="ctaType"
                >
                  {["CHECK_IOD", "SHOP_PRODUCT", "SERVICE_CONTACT", "NEWSLETTER", "CONSULTATION", "RELATED_ARTICLE", "NONE"].map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </Field>
            </Card>

            <Card className="grid gap-4" padding="md" variant="flat">
              <Field htmlFor="metaDescription" label="Meta description" required>
                <Textarea defaultValue={post?.metaDescription} id="metaDescription" name="metaDescription" required />
              </Field>
              <Field htmlFor="seoTitle" label="SEO title">
                <Input defaultValue={post?.seoTitle ?? ""} id="seoTitle" name="seoTitle" />
              </Field>
              <Field htmlFor="canonicalUrl" label="Canonical URL">
                <Input defaultValue={post?.canonicalUrl ?? ""} id="canonicalUrl" name="canonicalUrl" />
              </Field>
              <Field htmlFor="ogTitle" label="OG title">
                <Input defaultValue={post?.ogTitle ?? ""} id="ogTitle" name="ogTitle" />
              </Field>
              <Field htmlFor="ogDescription" label="OG description">
                <Textarea defaultValue={post?.ogDescription ?? ""} id="ogDescription" name="ogDescription" />
              </Field>
              <Field htmlFor="ogImage" label="OG image">
                <Input defaultValue={post?.ogImage ?? ""} id="ogImage" name="ogImage" />
              </Field>
            </Card>

            <Card className="grid gap-4" padding="md" variant="flat">
              <Field htmlFor="faqQuestion" label="FAQ question">
                <Input defaultValue={faq?.question ?? ""} id="faqQuestion" name="faqQuestion" />
              </Field>
              <Field htmlFor="faqAnswer" label="FAQ answer">
                <Textarea defaultValue={faq?.answer ?? ""} id="faqAnswer" name="faqAnswer" />
              </Field>
              <Field htmlFor="legalDisclaimer" label="Disclaimer prawny" required>
                <Textarea defaultValue={post?.legalDisclaimer ?? defaultDisclaimer} id="legalDisclaimer" name="legalDisclaimer" required />
              </Field>
            </Card>
          </aside>
        </div>
      </form>
    </main>
  );
}

function toDatetimeLocal(date: Date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}
