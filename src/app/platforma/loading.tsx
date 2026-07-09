import { PortalCard } from "@/components/portal/portal-shell";

export default function PlatformLoading() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {[0, 1, 2].map((item) => (
        <PortalCard className="min-h-28 animate-pulse" key={item}>
          <div className="h-4 w-24 rounded bg-[var(--surface-sunken)]" />
          <div className="mt-4 h-8 w-32 rounded bg-[var(--surface-sunken)]" />
        </PortalCard>
      ))}
    </div>
  );
}
