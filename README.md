# Catholic Prayer Study

A small static site for studying Catholic concepts and memorizing prayers.

## Structure

- `index.html` — home page listing all exercises
- `prayers/` — prayer memorization pages. Each page only defines `window.PRAYER` (text, Latin, hooks); `practice.js` and `practice.css` build the exercises
- `shared/emblems.js` — gold emblems used on prayer headers and home-page cards
- `images/` — Robert Zünd, *The Road to Emmaus* (1877), public domain via Wikimedia Commons

To add a prayer, copy one of the pages in `prayers/`, change its `window.PRAYER` data (give it a new `key`), and add it to the `PRAYERS` list in `index.html` with a `priority` and a short `why` (the home page can sort by Most Common or A–Z).

## Priority order

Ranked by how often you'll use them:

| # | Prayer | File | Why it's here |
|---|---|---|---|
| 1 | Our Father | `our-father.html` | Said at every Mass and in every decade of the Rosary |
| 2 | Hail Mary | `hail-mary.html` | 53 of the Rosary's beads, and the most-prayed Marian prayer |
| 3 | Glory Be | `glory-be.html` | Ends every decade of the Rosary and many other prayers |
| 4 | Act of Contrition | `act-of-contrition.html` | Required in Confession |
| 5 | Fatima Prayer | `fatima-prayer.html` | Said after each decade of the Rosary |
| 6 | Apostles' Creed | `apostles-creed.html` | Opens the Rosary; it's also the baptismal creed |
| 7 | Nicene Creed | `nicene-creed.html` | Said at every Sunday Mass, but it's the longest, so learn it after the shorter prayers |
| 8 | Hail, Holy Queen | `hail-holy-queen.html` | Closes the Rosary |
| 9 | Memorare | `memorare.html` | A traditional devotion, not tied to the Mass or Rosary |

Learn 1, 2, 3, 5, 6 and 8 and you can pray the full Rosary from memory.

## Running locally

Open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server
```

The site is deployed on Vercel (https://catholicstudy.vercel.app) from the `main` branch.
