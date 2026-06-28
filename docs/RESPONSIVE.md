# Responsive Formula

Kazdy nowy widok i komponent w PRIVAZY ma byc projektowany mobile-first, zgodny z [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md), i sprawdzany na pelnym zakresie ekranow: telefon, tablet, laptop, desktop oraz TV.

## Reguly

1. Uzywaj `pvz-container` dla glownego ograniczenia szerokosci strony. Nie dokladaj przypadkowych `max-w-* px-*` w nowych sekcjach, jesli standardowy kontener wystarcza.
2. Uzywaj `pvz-section` dla pionowego rytmu sekcji marketingowych i informacyjnych.
3. Kazdy element w siatce albo flexie, ktory moze zawierac dlugi tekst, powinien miec `min-w-0`, `truncate` albo `pvz-bleed-safe`.
4. Strona nie moze miec poziomego overflow na `body` ani `html`.
5. Szerokie tabele, kanbany, kalendarze i osie czasu moga przewijac sie poziomo tylko wtedy, gdy wrapper ma `pvz-h-scroll` oraz `data-responsive-scroll="true"`.
6. Typografia ma skalowac sie breakpointami Tailwind, nie przez `vw`. Tekst w przyciskach i kartach musi miescic sie w kontenerze.
7. Karty i panele powinny miec stabilne wymiary, przewidywalne siatki i radius maksymalnie `rounded-lg`, chyba ze komponent CRM juz wymaga innego stylu.
8. TV i szerokie monitory nie powinny rozciagac tresci bez limitu. Uzywaj `pvz-container`, `max-w-*` albo kontrolowanych gridow.

## Viewporty kontrolne

Minimalny zestaw kontroli:

- `360x780` - maly telefon
- `390x900` - standardowy telefon
- `768x1024` - tablet
- `1024x768` - laptop
- `1440x1000` - desktop
- `1920x1080` - TV Full HD
- `2560x1440` - duzy ekran / TV

## Automatyczna kontrola

Uruchom aplikacje lokalnie i sprawdz responsywnosc:

```bash
npm run dev
npm run responsive:check
```

Skrypt sprawdza `/` oraz `/admin`, szuka bledow konsoli, overlayow Next.js i niekontrolowanego poziomego overflow. Jesli komponent wymaga poziomego przewijania, oznacz jego wrapper jako kontrolowany scroll.
