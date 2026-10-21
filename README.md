# Catholic Prayer Study

A small static site for studying Catholic concepts and memorizing prayers.

## Structure

- `index.html` — home page listing all prayers
- `prayers/` — prayer memorization pages. Each page only defines `window.PRAYER` (text, Latin, hooks); `practice.js` and `practice.css` build the exercises
- `shared/emblems.js` — gold emblems used on prayer headers and home-page cards
- `shared/prayers.js` — the list of prayer pages in Most Common order; the home page cards and each prayer page's header description come from it
- `game/` — gamified version (in progress; not linked from the home page yet)
- `images/` — Robert Zünd, *The Road to Emmaus* (1877), public domain via Wikimedia Commons

To add a prayer, copy one of the pages in `prayers/`, change its `window.PRAYER` data (give it a new `key`), and add it to `shared/prayers.js` with a `priority` and a short `why` (the home page can sort by Most Common or A–Z).

## Exercises and review

Each prayer has five steps: Study, Fade, Initials, Next line (cued recall: say the line that follows a cue) and Recite.
A long prayer can be split into parts (`parts` in its `window.PRAYER`; the Nicene Creed has three): steps 1–4 are done one part at a time and count once every part has done them, and Recite is always the whole prayer.
Recite is said aloud, not typed: say the whole prayer from memory (Show hints gives the initials or the movements, picked at random, and toggles to Hide hints), then Show prayer to check yourself and mark it said correctly to complete the step.
Once all five steps are done, the prayer appears in the home page's Review list, which opens straight to Recite. The list is ordered by the best recital score from the old typed Recite (lowest first); spoken recitals aren't scored.

## Priority order

Ranked by how often you'll use them:

| # | Prayer | File | Why it's here |
|---|---|---|---|
| 1 | Our Father | `our-father.html` | Said at every Mass; also included in the Rosary |
| 2 | Hail Mary | `hail-mary.html` | The most-prayed Marian prayer; also included in the Rosary |
| 3 | Glory Be | `glory-be.html` | Ends many prayers, and every psalm in the Liturgy of the Hours; also included in the Rosary |
| 4 | Act of Contrition | `act-of-contrition.html` | Required in Confession |
| 5 | Fatima Prayer | `fatima-prayer.html` | A short plea for mercy for ourselves and all souls; also included in the Rosary |
| 6 | Apostles' Creed | `apostles-creed.html` | The Church's ancient baptismal creed; also included in the Rosary |
| 7 | Nicene Creed | `nicene-creed.html` | Said at every Sunday Mass, but it's the longest, so learn it after the shorter prayers |
| 8 | Hail, Holy Queen | `hail-holy-queen.html` | Sung at Night Prayer for much of the year; also included in the Rosary |
| 9 | Memorare | `memorare.html` | A traditional devotion, not part of the Mass |

## Running locally

Open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server
```

The site is deployed on Vercel (https://catholicstudy.vercel.app) from the `main` branch.
