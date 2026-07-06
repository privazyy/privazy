# Known Limitations Before Staging

- E2E nie uzywa jeszcze Playwright ani fixture kont; obecnie jest to smoke HTTP po `E2E_BASE_URL`.
- Testy integracyjne nie lacza sie z prawdziwa baza i nie testuja transakcyjnych server actions.
- Payment i invoice provider pozostaja mock/test do czasu decyzji o realnym providerze.
- Pobieranie dokumentow ma wymagania security opisane w dokumentacji portalu, ale test ACL R2 wymaga mocka Prisma/R2 w kolejnym kroku.
- Supabase RLS i Data API grants musza byc potwierdzone na prawdziwym projekcie przed stagingiem.
- `responsive:check` wymaga dzialajacej aplikacji i lokalnej przegladarki Chrome/Edge.
- Brak produkcyjnego deploya w tej fazie.
