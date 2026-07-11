import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

if (process.env.NODE_ENV === "production") {
  throw new Error("Local CRM seed is disabled in production.");
}

const password = process.env.DEV_SEED_PASSWORD;
if (!password || password.length < 12) {
  throw new Error("Set DEV_SEED_PASSWORD to at least 12 characters.");
}

const prisma = new PrismaClient();
const passwordHash = await hash(password, 12);

try {
  const users = {};
  for (const [role, name] of [
    ["ADMIN", "Local Admin"],
    ["OPERATOR", "Local Operator"],
    ["LAWYER", "Local Lawyer"],
    ["READ_ONLY", "Local Read Only"],
    ["CLIENT", "Local Client"],
  ]) {
    users[role] = await prisma.user.upsert({
      where: { email: `${role.toLowerCase().replace("_", "-")}@privazy.local` },
      update: { name, passwordHash, role },
      create: { email: `${role.toLowerCase().replace("_", "-")}@privazy.local`, name, passwordHash, role },
    });
  }

  const organization = await prisma.organization.upsert({
    where: { id: "local-demo-organization" },
    update: { ownerId: users.OPERATOR.id, status: "ACTIVE" },
    create: {
      id: "local-demo-organization",
      name: "Lokalny Klient Testowy",
      email: "biuro@klient.local",
      industry: "Usługi",
      city: "Warszawa",
      status: "ACTIVE",
      ownerId: users.OPERATOR.id,
    },
  });

  const lead = await prisma.lead.upsert({
    where: { id: "local-demo-lead" },
    update: { assignedToId: users.OPERATOR.id, status: "TO_CONTACT" },
    create: {
      id: "local-demo-lead",
      source: "MANUAL",
      status: "TO_CONTACT",
      priority: "HIGH",
      companyName: "Lokalny Lead Testowy",
      fullName: "Jan Testowy",
      email: "jan@lead.local",
      phone: "+48 500 000 001",
      industry: "Technologia",
      consentContact: true,
      consentPrivacy: true,
      assignedToId: users.OPERATOR.id,
    },
  });

  await prisma.contactPerson.upsert({
    where: { id: "local-demo-contact" },
    update: { organizationId: organization.id },
    create: {
      id: "local-demo-contact",
      organizationId: organization.id,
      fullName: "Anna Klient",
      email: "anna@klient.local",
      role: "Właścicielka",
      isPrimary: true,
    },
  });

  await prisma.crmNote.upsert({
    where: { id: "local-demo-note" },
    update: { body: "Notatka zapisana w lokalnej bazie CRM." },
    create: {
      id: "local-demo-note",
      leadId: lead.id,
      authorId: users.OPERATOR.id,
      body: "Notatka zapisana w lokalnej bazie CRM.",
    },
  });

  await prisma.crmTask.upsert({
    where: { id: "local-demo-task" },
    update: { assignedToId: users.OPERATOR.id, status: "OPEN" },
    create: {
      id: "local-demo-task",
      leadId: lead.id,
      title: "Skontaktuj się z lokalnym leadem",
      description: "Rekord demonstracyjny zapisany w lokalnym PostgreSQL.",
      priority: "HIGH",
      status: "OPEN",
      dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      assignedToId: users.OPERATOR.id,
      createdById: users.ADMIN.id,
    },
  });

  await prisma.auditLog.upsert({
    where: { id: "local-demo-audit" },
    update: { userId: users.ADMIN.id },
    create: {
      id: "local-demo-audit",
      userId: users.ADMIN.id,
      organizationId: organization.id,
      action: "LOCAL_SEED_CREATED",
      entityType: "Organization",
      entityId: organization.id,
      metadata: { source: "local-seed" },
    },
  });

  console.log("Local CRM seed completed.");
} finally {
  await prisma.$disconnect();
}
