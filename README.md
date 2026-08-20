# Kasua

Market produce, held to supermarket standard. Abuja.

An app demo — buyer, seller and admin — in English, Igbo, Hausa and Yoruba.
No framework, no build step, nothing to install.

## Live

<https://sughterakper.github.io/Kasu/>

Published by GitHub Pages from `main`, repo root. That is why the app files sit
at the top level, and why `.nojekyll` is here — it stops Pages running the files
through Jekyll.

## Run it locally

```bash
node serve.js
```

Then <http://localhost:5173>.

## Publish automatically

```bash
node watch.js
```

Watches the folder and, four seconds after you stop saving, commits and pushes —
so the live site follows along. `node watch.js --dry-run` reports what it would
do without touching git. Ctrl+C stops it; nothing is pushed while it is not
running.

## The three roles

Switch with the bar at the bottom of the screen.

| Route | Role | What it does |
| --- | --- | --- |
| `#/buy` | Buyer | Market, price board, shopping list, basket, scheduled checkout, packages, order tracking, settings |
| `#/sell` | Seller | The market vendor: tomorrow's demand, live pick list, rejection score, payouts |
| `#/ops` | Admin | Orders and spoilage trends, vendor scorecard, flag queue, district coverage |

**They share one state**, which is the point:

1. Buyer places an order → it appears on the seller's pick list.
2. Seller accepts and rejects items, then taps *Attach photo & dispatch*.
3. The buyer's inspection ledger updates with the real reject count.
4. Buyer reports an item → it lands in the admin flag queue, traced to that vendor.

State persists to `localStorage` under `kasua-demo-v4`. The **↺** button resets it.

## Buyer features

- **Welcome screen** — first run asks two things, language and district, both
  already answered, so a single tap gets you in. Language comes first because
  everything after it is unreadable to the wrong reader. Re-openable from Me.
- **Minimum order of ₦5,000** — the basket shows how much more is needed, a
  progress bar, and the actual reason (one rider, one run: a smaller basket
  costs more to deliver than it earns). Checkout is guarded at the route as
  well as the button, so the back button cannot slip past it.
- **Price board** (`#/buy/prices`) — every item's move against last week's board,
  grouped into falls, rises and held, each with the reason it moved.
- **Shopping list** (`#/buy/list`) — type a list the way you would say it and it
  is matched to the catalogue. Understands quantities as digits or as words in
  all four languages, so `meji dodo` becomes Ripe plantain × 2. Unmatched lines
  are shown rather than silently dropped.
- **Scheduled delivery** — pick the day and a time window at checkout.
- **Fixed packages** (`#/buy/packages`) — name it, pick the day and time, choose
  the items; it repeats weekly at 9% off until stopped.
- **Explicit payment approval** — the order button approves the debit; nothing
  is taken before that.
- **Language and text size** (`#/buy/me`) — four languages, three text sizes.

### What is simulated

The **photo** path on the shopping list does not do real image recognition —
there is no backend. Choosing a photo runs a fixed sample list through the same
parser, and the screen says so. The typed path is real: it parses whatever you
write. Payment is a mock; no card details are collected anywhere.

## Languages

English, Igbo, Hausa, Yoruba — switchable from the Me screen, and it re-labels
the whole interface including navigation and day names.

**The Igbo, Hausa and Yoruba strings are a first pass and have not been reviewed
by native speakers.** They are good enough to demo the feature and to show a
translator what needs fixing; diacritics especially need checking. Do not put
them in front of real customers until someone who speaks each language has been
through `assets/i18n.js`.

## Built for a wide range of users

- Three text sizes; everything is sized in `rem`, so tap targets grow with the
  text rather than staying small.
- Every icon has a text label beside it — no icon-only controls.
- Minimum 44px tap targets, visible focus rings, `prefers-reduced-motion`
  respected.
- Five tabs maximum, with settings gathered under one **Me** hub.

## Files

```
index.html        the app
assets/
  tokens.css      colour, type and motion tokens (single source of truth)
  app.css         all app styling, including the text-size scale
  icons.js        the SVG icon set + the Kasua mark
  i18n.js         the four languages
  app.data.js     catalogue, search synonyms, seller and ops data
  app.js          router + the three role UIs + the list parser
  fonts/          Bricolage Grotesque + Inter, variable, self-hosted
  images/         25 photos, local
.nojekyll         tells Pages to serve the files as-is
serve.js          local dev server
watch.js          auto commit + push on save
```

## Design system

Defined once in `assets/tokens.css`, in OKLCH.

**The scene it is designed for**: a 58-year-old woman in Wuse standing in her
kitchen at 6:40am, hard daylight through the window, deciding whether today's
tomato price is worth it before her day starts. Bright ambient light, older eyes,
a quick decision. That is what forces a light theme and high contrast — not taste.

- **Colour strategy is Restrained.** Tinted neutrals carry the surface; colour
  appears on actions and states only, never as decoration. The welcome screen is
  the single deliberate exception and goes fully committed to the brand green.
- **Surfaces are tinted toward the brand's own green** at very low chroma
  (`--bg` #f5f8f6), deliberately *not* warm. A warm near-white lands straight in
  the cream/ivory territory that every produce app already occupies.
- **Dark surfaces are deep pine** (`--deep` #0d291a), not near-black. Warmer,
  more expensive, and it belongs to the brand rather than to nothing.
- **Two accents, never interchangeable.** `--act` (#bf4327) means *an action you
  take*. `--ok` (#1f764d) means *a fact Kasua has verified*. `--gold` is the
  inspection stamp and nothing else.
- **Type**: Bricolage Grotesque for the wordmark, headings and product names
  only. Every label, button, price and figure is Inter with tabular numerals.
  Display faces in UI data is the fastest way to make a product look amateur.
- **Icons are SVG.** Never emoji.
- **No blanket entrance animation.** The app opens into a task; motion is
  reserved for things that actually changed.

### Measured, not eyeballed

Every foreground/background pair was checked against what actually renders. An
automated pass over **644 text nodes across 17 routes** reports zero WCAG AA
failures, no horizontal overflow at 320px, and no tap target under 44px. Where a
control reads smaller than 44px (the add button, the switch), the visual size is
kept and the hit area is extended with a pseudo-element.

All numbers are invented but internally consistent. Nothing is charged.
