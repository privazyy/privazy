"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  organizationId: z.string().min(1),
  templateId: z.string().min(1),
  createdById: z.string().min(1),
  organizationName: z.string().min(1),
  contactEmail: z.string().email(),
});

type FormValues = z.infer<typeof formSchema>;

export function DocumentRequestForm() {
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      organizationId: "",
      templateId: "",
      createdById: "",
      organizationName: "",
      contactEmail: "",
    },
  });
  const previewValues = useWatch({ control: form.control });

  async function onSubmit(values: FormValues) {
    setResult(null);
    setError(null);

    const response = await fetch("/api/documents/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        organizationId: values.organizationId,
        templateId: values.templateId,
        createdById: values.createdById,
        data: {
          organizationName: values.organizationName,
          contactEmail: values.contactEmail,
        },
      }),
    });

    const payload = (await response.json()) as { jobId?: string; error?: string };

    if (!response.ok) {
      setError(payload.error ?? "Nie udało się utworzyć joba generowania.");
      return;
    }

    setResult(`Utworzono job: ${payload.jobId}`);
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-5 rounded-lg border bg-card p-5">
      <div className="grid gap-2">
        <Label htmlFor="organizationId">Organization ID</Label>
        <Input id="organizationId" {...form.register("organizationId")} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="templateId">Template ID</Label>
        <Input id="templateId" {...form.register("templateId")} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="createdById">User ID</Label>
        <Input id="createdById" {...form.register("createdById")} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="organizationName">Nazwa organizacji</Label>
        <Input id="organizationName" {...form.register("organizationName")} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="contactEmail">Email kontaktowy</Label>
        <Input id="contactEmail" type="email" {...form.register("contactEmail")} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="preview">Dane do szablonu</Label>
        <Textarea
          id="preview"
          readOnly
          value={JSON.stringify(previewValues, null, 2)}
          className="font-mono text-xs"
        />
      </div>
      <Button type="submit" disabled={form.formState.isSubmitting}>
        <Send className="size-4" />
        {form.formState.isSubmitting ? "Wysyłanie..." : "Utwórz job"}
      </Button>
      {result ? <p className="text-sm text-foreground">{result}</p> : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </form>
  );
}
