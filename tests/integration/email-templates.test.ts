import { describe, expect, it } from "vitest";

import { renderEmailTemplate } from "@/server/email/templates/transactional";

describe("transactional email templates", () => {
  it("does not attach documents and points ready emails to portal downloads", () => {
    const rendered = renderEmailTemplate("document.ready", {});

    expect(rendered.subject).toContain("dokument");
    expect(rendered.html).toContain("/platforma/dokumenty");
    expect(rendered.html).toContain("Nie dolaczamy dokumentow");
  });

  it("escapes dynamic custom text in standard templates", () => {
    const rendered = renderEmailTemplate("lead.internal_new", { source: '<script>alert("x")</script>' });

    expect(rendered.html).not.toContain("<script>");
    expect(rendered.html).toContain("&lt;script&gt;");
  });
});
