import { describe, expect, it } from "vitest";

import { classifyRoute, evaluateRouteAccess } from "@/server/auth/route-policy";
import { testUsers } from "../helpers/users";

describe("private route classification", () => {
  it("keeps public routes public", () => {
    expect(classifyRoute("/")).toBe("public");
    expect(classifyRoute("/blog")).toBe("public");
    expect(classifyRoute("/blog/jak-wybrac-iod")).toBe("public");
    expect(classifyRoute("/sklep/polityka-prywatnosci")).toBe("public");
    expect(classifyRoute("/login")).toBe("public");
    expect(classifyRoute("/api/auth/session")).toBe("public");
    expect(classifyRoute("/api/leads/iod")).toBe("public");
  });

  it("does not confuse the public lead endpoint with CRM leads", () => {
    expect(classifyRoute("/api/leads/iod")).toBe("public");
    expect(classifyRoute("/api/crm/leads")).toBe("staff");
  });

  it("classifies private application routes", () => {
    expect(classifyRoute("/admin")).toBe("staff");
    expect(classifyRoute("/admin/leads")).toBe("staff");
    expect(classifyRoute("/platforma")).toBe("client_portal");
    expect(classifyRoute("/client")).toBe("client_portal");
    expect(classifyRoute("/documents")).toBe("authenticated");
    expect(classifyRoute("/uploads")).toBe("authenticated");
  });

  it("blocks CLIENT from staff routes and unauthenticated users from private routes", () => {
    expect(evaluateRouteAccess("/admin", testUsers.CLIENT).allowed).toBe(false);
    expect(evaluateRouteAccess("/admin", null).allowed).toBe(false);
    expect(evaluateRouteAccess("/admin", testUsers.ADMIN).allowed).toBe(true);
    expect(evaluateRouteAccess("/documents", null).allowed).toBe(false);
    expect(evaluateRouteAccess("/documents", testUsers.CLIENT).allowed).toBe(true);
  });
});
