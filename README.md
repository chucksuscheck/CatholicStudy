# Faith by Heart

A small static site for studying Catholic concepts and memorizing prayers.

## Structure

The site has four sections, reached from the menu bar at the top of every page: Prayers, Rosary, Mass and (Salvation) History.

- `index.html` — home page: the painting and why learn by heart; sections are reached from the menu
- `prayers/` — the Prayers section. `prayers/index.html` has the Review list and every prayer, then how to memorize (the five steps and what helps) at the bottom; each other page only defines `window.PRAYER` (text, Latin, hooks), and `practice.js` and `practice.css` build the exercises
- `rosary/` — the Rosary section: three pages with a Prayers · Mechanics · Mysteries tab row under the banner. There's no `index.html`; the menu opens `prayers.html`, and `vercel.json` redirects `/rosary/` there:
  - `prayers.html` — the six prayers of the Rosary in the order they first come (cards link to the practice pages in `prayers/`)
  - `mechanics.html` — the whole Rosary in order, with a Put in order drill for the Opening, Each decade and the Closing (tap the prayer that comes next; shown first) and a Study view showing the same cards filled in
  - `mysteries.html` — the four sets of mysteries, with a Put in order drill for each set (shown first) and a Study view showing them filled in, after Mysteries by day (match each day of the week to its set; the list includes made-up decoy sets)
  - Which prayers belong to the Rosary, their learning order and when each is said come from the `rosary` entry on each prayer in `shared/prayers.js`; to add or change a Rosary prayer, edit it there
  - `rosary.js` holds `SEQ` (the whole Rosary, bead by bead), `DRILLS` (which parts are drilled), `MYSTERIES` (the names and days), `DAYS`, `DECOYS` (made-up sets for the day matching) and the shared Put in order drill and mode switch; `rosary.css` the shared styles
- `mass/`, `history/` — the other sections; each `index.html` is a landing page marked "Coming soon" until its content is written
- `shared/cards.js` — the prayer cards and saved progress used by the Prayers and Rosary pages
- `shared/nav.js` — the menu bar, and the "Questions or suggestions? Send us a note" line it adds at the bottom of every page, linking to the contact form. Load it as the last script on every page (prayer pages rebuild `<body>`, so it must come after `practice.js`); it works out the current section from the page's folder
- `shared/site.css` — colors and card styles for the home page and the section landing pages
- `shared/emblems.js` — gold emblems on headers and cards; `beads`, `chalice` and `book` are the Rosary, Mass and History emblems
- `shared/prayers.js` — the list of prayer pages in Most Common order; the Prayers page cards and each prayer page's header description come from it
- `game/` — gamified version (in progress; not linked from the site yet)
- `images/` — Robert Zünd, *The Road to Emmaus* (1877), public domain via Wikimedia Commons; also the site icon (`favicon.svg`, `apple-touch-icon.png`; `favicon.ico` sits at the root)
- `contact/index.html` — the contact form. Messages are sent through Web3Forms (web3forms.com) to the email address its access key belongs to; hCaptcha and a hidden honeypot field block robots. The key is the `access_key` field in the form
- `404.html` — the page shown for any missing address
- `vercel.json` — redirects on the live site (`/rosary/` → the Rosary Prayers page)

To add a section page that uses the practice exercises (e.g. a set of Rosary mysteries or a part of the Mass), copy a prayer page into that section's folder, keep its `<script>` paths pointing at `../prayers/practice.js` and `../shared/`, change its `window.PRAYER` data (with a new `key`), and add a card for it on the section's `index.html`.

To add a prayer, copy one of the pages in `prayers/`, change its `window.PRAYER` data (give it a new `key`), and add it to `shared/prayers.js` with a `priority` and a short `why` (and a `rosary` entry if it's said in the Rosary) (the Prayers page can sort by Most Common or A–Z).

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
| 10 | Prayer to Saint Michael | `st-michael.html` | Said after Mass in many parishes |

## Running locally

Open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server
```

The site is live at https://faithbyheart.org (also https://faithbyheart.com), deployed on Vercel from the `main` branch.
