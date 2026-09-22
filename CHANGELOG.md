# Menu section "black screen on category switch" — fix

## Files changed
- `src/hooks/useReveal.ts` (only file changed)

## Root cause
`useReveal()`'s IntersectionObserver only scanned the DOM once, at initial
mount (`useEffect(..., [])`). Dish cards in the public Menu section carry
the `.reveal` class (`opacity: 0` until `.in` is added — see
`src/styles.css` lines 157-162). When a category filter removes a dish
from view and a later filter change brings it back, React mounts a brand
new DOM node for it (same React key, new element) — a node the original
one-time scan never saw. That node never receives `.in` and stays
permanently invisible. Against the app's near-black theme background
(`--background: oklch(0.14 0.01 60)`), an invisible card reads as "the
section went black."

Confirmed: `data/menu.ts`'s Pizza and Burger entries have identical
field shapes, all referenced images exist on disk, and the public Menu
section is fully static (not database-backed) — ruling out data/shape
mismatches, missing images, and Supabase involvement as the cause.

## Fix
Added a `MutationObserver` alongside the existing `IntersectionObserver`
in `useReveal()`, so `.reveal` elements added to the DOM after the
initial scan (e.g. a re-mounted Menu dish card) get observed too.
Elements present at mount behave exactly as before — no change to
existing animation/reveal timing for any other section.

## Verified
- `tsc --noEmit --strict` against the fixed hook (using TypeScript's
  real bundled lib.dom.d.ts, no stubs) — zero errors.
- Full-tree diff against the original upload confirms this is the only
  file that changed; `Menu.tsx` MD5-matches the original exactly.
- Walked all six requested category transitions plus refresh/direct
  load/empty-filter/image-present cases against the fix logic.
