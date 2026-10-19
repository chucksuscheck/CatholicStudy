# Catholic Prayer Study

A small static site for studying Catholic concepts and memorizing prayers.

## Structure

- `index.html` — home page listing all exercises
- `prayers/` — prayer memorization pages. Each page only defines `window.PRAYER` (text, Latin, hooks); `practice.js` and `practice.css` build the exercises
- `shared/emblems.js` — gold emblems used on prayer headers and home-page cards
- `shared/prayers.js` — the list of prayer pages in Most Common order, used by the home page and each page's "Next prayer" button
- `images/` — Robert Zünd, *The Road to Emmaus* (1877), public domain via Wikimedia Commons

To add a prayer, copy one of the pages in `prayers/`, change its `window.PRAYER` data (give it a new `key`), and add it to `shared/prayers.js` with a `priority` and a short `why` (the home page can sort by Most Common or A–Z).

## Exercises and review

Each prayer has five steps: Study, Fade, Initials, Next line (cued recall: say the line that follows a cue) and Recite.
Recite can test the whole prayer, build it up section by section, or drill one section; only the whole prayer counts toward your best score and the step.
Once all five steps are done, the prayer appears in the home page's Review list (lowest best recital first), which opens straight to Recite.

## Priority order

Ranked by how often you'll use them:

| # | Prayer | File | Why it's here |
|---|---|---|---|
| 1 | Our Father | `our-father.html` | Said at every Mass |
| 2 | Hail Mary | `hail-mary.html` | The most-prayed Marian prayer |
| 3 | Glory Be | `glory-be.html` | Ends many prayers, and every psalm in the Liturgy of the Hours |
| 4 | Act of Contrition | `act-of-contrition.html` | Required in Confession |
| 5 | Fatima Prayer | `fatima-prayer.html` | A short plea for mercy for ourselves and all souls |
| 6 | Apostles' Creed | `apostles-creed.html` | The Church's ancient baptismal creed |
| 7 | Nicene Creed | `nicene-creed.html` | Said at every Sunday Mass, but it's the longest, so learn it after the shorter prayers |
| 8 | Hail, Holy Queen | `hail-holy-queen.html` | Sung at Night Prayer for much of the year |
| 9 | Memorare | `memorare.html` | A traditional devotion, not part of the Mass |

## Running locally

Open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server
```

The site is deployed on Vercel (https://catholicstudy.vercel.app) from the `main` branch.
