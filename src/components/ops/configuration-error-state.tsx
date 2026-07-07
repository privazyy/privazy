import { Card } from "@/components/ui/card";

interface ConfigurationErrorStateProps {
  missing?: string[];
  title?: string;
}

export function ConfigurationErrorState({
  missing = [],
  title = "Konfiguracja runtime jest niekompletna",
}: ConfigurationErrorStateProps) {
  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <Card as="section" padding="lg" variant="soft" className="grid gap-4">
        <div className="grid gap-2">
          <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
          <p className="text-sm text-muted-foreground">
            Prywatny modul nie zostal uruchomiony, poniewaz brakuje wymaganej konfiguracji serwerowej.
            Uzupelnij brakujace zmienne w prywatnym env i uruchom walidacje ponownie.
          </p>
        </div>
        {missing.length > 0 ? (
          <div className="grid gap-2">
            <p className="text-sm font-semibold text-foreground">Brakujace zmienne:</p>
            <ul className="grid gap-1 text-sm text-muted-foreground">
              {missing.map((name) => (
                <li key={name}>
                  <code>{name}</code>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </Card>
    </main>
  );
}
