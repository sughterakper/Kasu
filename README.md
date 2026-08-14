# Kasu — demo build

Market produce, held to supermarket standard. Abuja.

A static demo: a marketing site plus a three-role app (buyer, seller, admin).
No framework, no build step, no dependencies to install.

## Run it

```bash
node serve.js
```

Then open <http://localhost:5173>. Any static server works; `serve.js` is a
30-line zero-dependency one that also sends `no-store` so edits show up on reload.

## What's here

```
website/
  index.html        split hero, price board, inspection ledger, bento guarantee
  market.html       the full 22-item list
  weekly.html       the standing-order pitch
  guarantee.html    the freshness mechanic, including what it does not cover
  vendors.html      the two stalls and their weekly rejection scores
  contact.html      reach us / request an item
  app.html          the app — buyer, seller, admin
  assets/
    tokens.css      colour, type and motion tokens (single source of truth)
    style.css       the marketing site
    app.css         the app
    icons.js        the SVG icon set + the Kasu mark
    app.data.js     all demo data (products, vendors, ops numbers)
    app.js          router + the three role UIs
    site.js         scroll progress bar
    gsap-scroll.js  scroll choreography
    fonts/          Bricolage Grotesque + Inter, both variable, self-hosted
    images/         28 stock photos, local
serve.js
```

## The app

Three roles at `app.html`, switchable from the demo bar at the bottom:

| Route | Role | What it shows |
| --- | --- | --- |
| `#/buy` | Buyer | Market, weekly basket, basket, checkout, live order ledger, streak + points |
| `#/sell` | Seller | Tomorrow's demand board, live pick list, rejection scorecard, payouts |
| `#/ops` | Admin | Orders/spoilage trends, vendor scorecard, flag queue, district coverage |

**The three roles share one state**, which is the point of the demo:

1. Buyer places an order → it appears on the seller's pick list.
2. Seller accepts and rejects items, then taps *Attach photo & dispatch*.
3. The buyer's inspection ledger updates with the real reject count on the receipt.
4. Buyer flags an item → it lands in the admin flag queue, traced to that vendor.

State persists to `localStorage` under `kasu-demo-v2`. The **↺** button in the
demo bar resets everything.

## Design system

Deliberately its own thing, not a recolour of anything else:

- **Foundation** is a green-leaning near-black (`--void #0E100C`) on warm ivory
  (`--ivory #F7F4ED`) — not black on white.
- **Two accents, never interchangeable.** `--rust` means *an action you take*.
  `--leaf` means *a fact Kasu has verified*. `--gold` is reserved for the
  inspection stamp and nothing else.
- **Type**: Bricolage Grotesque for display, Inter for everything else. Both are
  self-hosted variable fonts — two files cover every weight. No serif display
  anywhere; that is deliberately not the voice.
- **Icons are SVG**, one family, 1.75 stroke, `currentColor`. Never emoji.
- **Layout signatures**: `.split` (asymmetric hero), `.board` (prices with weekly
  deltas), `.ledger` (timestamped inspection log), `.receipt` (perforated proof
  card), `.bento` (uneven guarantee grid).

## Notes on the content

The numbers are invented but internally consistent, and the copy states the
limits rather than hiding them — spoilage is priced in at 4–6%, the guarantee
lists what it does *not* cover, and a dropped vendor is published on the
vendors page. That is a deliberate positioning choice, not filler.

Photos are from Unsplash and stored locally in `website/assets/images/`.
Everything is sample data. Nothing is charged.
