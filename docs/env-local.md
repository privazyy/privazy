# Konfiguracja `.env.local` dla Vercel + Supabase

Pliku `.env.local` nie commitujemy do GitHuba. Repo zawiera tylko bezpieczny szablon `.env.example`.

## 1. Lokalnie / w Codespaces

W Codespaces utwórz prywatny plik:

```bash
cp .env.example .env.local
```

Następnie uzupełnij wartości z Supabase, Vercel i innych usług.

## 2. Supabase — wartości publiczne

W Supabase wejdź w:

```txt
Project Settings → API
```

Uzupełnij:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

W aplikacji zwykle wystarczy jeden publiczny klucz: `NEXT_PUBLIC_SUPABASE_ANON_KEY` albo `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, zależnie od tego, jakiego klienta Supabase używa kod.

## 3. Supabase — klucz serwerowy

Wartość `SUPABASE_SERVICE_ROLE_KEY` jest tylko dla kodu server-side.

```env
SUPABASE_SERVICE_ROLE_KEY=
```

Nie wolno jej używać w komponentach klienckich, w kodzie oznaczonym `use client`, ani w zmiennych zaczynających się od `NEXT_PUBLIC_`.

## 4. Supabase Postgres / Prisma

W Supabase wejdź w ustawienia połączenia z bazą i uzupełnij:

```env
DATABASE_URL=
DIRECT_URL=
```

Zalecany układ:

```txt
DATABASE_URL → pooled connection, do runtime/serverless/Vercel
DIRECT_URL   → direct/non-pooling connection, do migracji Prisma
```

W `schema.prisma` powinno to wyglądać tak:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

## 5. Vercel Environment Variables

W Vercel dodaj te same zmienne w:

```txt
Project → Settings → Environment Variables
```

Dodaj wartości osobno dla:

```txt
Production
Preview
Development
```

Dla bezpieczeństwa:

```txt
Production → produkcyjny projekt Supabase
Preview    → staging/dev Supabase
Development → dev Supabase
Codespaces → dev Supabase
```

## 6. GitHub Codespaces Secrets

Dla pracy zdalnej bez lokalnego VS Code dodaj sekrety w GitHubie:

```txt
GitHub → Settings → Codespaces → Secrets
```

Dodaj minimum:

```txt
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
DATABASE_URL
DIRECT_URL
AUTH_SECRET
SUPABASE_SERVICE_ROLE_KEY
```

## 7. Czego nie robić

Nie commituj:

```txt
.env
.env.local
.env.production
.env.development
kluczy Supabase
connection stringów PostgreSQL
service role key
sekretów Resend / R2 / Auth
```

Takie pliki są ignorowane przez `.gitignore`.
