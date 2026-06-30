import Credentials from "next-auth/providers/credentials";
import type { NextAuthConfig } from "next-auth";
import { compare } from "bcryptjs";
import { z } from "zod";
import { safeLogAuditEvent } from "@/server/audit/log";
import { getPrisma } from "@/server/db/prisma";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const authConfig = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(rawCredentials, request) {
        const parsed = credentialsSchema.safeParse(rawCredentials);

        if (!parsed.success) {
          await safeLogAuditEvent({
            action: "auth.login_failed",
            entityId: "unknown",
            entityType: "User",
            metadata: { reason: "invalid_payload" },
            request,
          });

          return null;
        }

        const email = parsed.data.email.toLowerCase();
        const user = await getPrisma().user.findUnique({
          where: { email },
        });

        if (!user) {
          await safeLogAuditEvent({
            action: "auth.login_failed",
            entityId: email,
            entityType: "User",
            metadata: { reason: "invalid_credentials" },
            request,
          });

          return null;
        }

        const isValid = await compare(parsed.data.password, user.passwordHash);

        if (!isValid) {
          await safeLogAuditEvent({
            action: "auth.login_failed",
            entityId: user.id,
            entityType: "User",
            metadata: { reason: "invalid_credentials" },
            request,
            userId: user.id,
          });

          return null;
        }

        await safeLogAuditEvent({
          action: "auth.login_success",
          entityId: user.id,
          entityType: "User",
          metadata: { provider: "credentials" },
          request,
          userId: user.id,
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }

      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id ?? token.sub ?? "";
        session.user.email = token.email ?? session.user.email;
        session.user.name = token.name ?? session.user.name;
        session.user.role = token.role;
      }

      return session;
    },
  },
  events: {
    async signOut(message) {
      const token = "token" in message ? message.token : null;
      const userId = token?.sub;

      if (!userId) return;

      await safeLogAuditEvent({
        action: "auth.logout",
        entityId: userId,
        entityType: "User",
        metadata: { provider: "credentials" },
        userId,
      });
    },
  },
} satisfies NextAuthConfig;
