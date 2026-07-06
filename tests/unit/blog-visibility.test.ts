import { describe, expect, it } from "vitest";

import { isPublicBlogPost } from "@/server/blog/data";

describe("blog visibility", () => {
  const now = new Date("2026-07-07T12:00:00.000Z");

  it("shows only published or due scheduled posts", () => {
    expect(isPublicBlogPost({ publishedAt: new Date("2026-07-07T10:00:00.000Z"), scheduledAt: null, status: "PUBLISHED" }, now)).toBe(true);
    expect(isPublicBlogPost({ publishedAt: null, scheduledAt: new Date("2026-07-07T10:00:00.000Z"), status: "SCHEDULED" }, now)).toBe(true);
    expect(isPublicBlogPost({ publishedAt: null, scheduledAt: new Date("2026-07-08T10:00:00.000Z"), status: "SCHEDULED" }, now)).toBe(false);
    expect(isPublicBlogPost({ publishedAt: null, scheduledAt: null, status: "DRAFT" }, now)).toBe(false);
    expect(isPublicBlogPost({ publishedAt: null, scheduledAt: null, status: "IN_REVIEW" }, now)).toBe(false);
  });
});
