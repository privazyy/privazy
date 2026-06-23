# PRIVAZY

Repo przygotowane do pracy zdalnej w modelu:

```txt
GitHub Codespaces / github.dev → GitHub → Vercel Preview/Production → Supabase
```

## Praca zdalna

Do pełnej pracy developerskiej używaj **GitHub Codespaces**:

1. Wejdź w repo na GitHubie.
2. Kliknij **Code → Codespaces → Create codespace on main**.
3. Po otwarciu środowiska dodaj wymagane sekrety Codespaces.
4. Jeżeli projekt ma `package.json`, środowisko automatycznie uruchomi `pnpm install`.
5. Aplikację Next.js uruchamiaj zwykle przez:

```bash
pnpm dev
```

Port `3000` jest skonfigurowany do podglądu w Codespaces.

## Szybkie poprawki

Do prostych zmian bez terminala można użyć `github.dev`:

```txt
Otwórz repo → naciśnij klawisz .
```

To nadaje się do literówek, README i prostych zmian w kodzie. Do migracji, terminala, Prisma i testów używaj Codespaces.

## Zmienne środowiskowe

W repo trzymaj tylko `.env.example`. Prawdziwe wartości dodawaj osobno w:

- **Vercel Environment Variables** — Production / Preview / Development,
- **GitHub Codespaces Secrets** — praca zdalna,
- **GitHub Actions Secrets** — automatyzacje CI/CD, jeżeli będą potrzebne.

Nie commituj `.env`, `.env.local`, kluczy Supabase, Resend, Cloudflare R2 ani sekretów autoryzacyjnych.

Szczegółowa instrukcja połączenia Vercel + Supabase znajduje się w:

```txt
docs/env-local.md
```

## Zalecany podział środowisk

```txt
main        → produkcja Vercel + Supabase production
staging     → preview/staging Vercel + Supabase staging/dev
feature/*   → preview Vercel + Supabase dev/staging
Codespaces  → Supabase dev/staging, nigdy produkcja bez potrzeby
```

## Pliki konfiguracyjne

- `.devcontainer/devcontainer.json` — konfiguracja GitHub Codespaces,
- `.env.example` — lista wymaganych zmiennych,
- `docs/env-local.md` — instrukcja konfiguracji `.env.local`, Vercel i Supabase,
- `.gitignore` — wykluczenia dla Node, Next, env, logów i buildów,
- `.github/workflows/remote-ready.yml` — lekki check konfiguracji repo.
