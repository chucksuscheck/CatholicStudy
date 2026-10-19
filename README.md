# Catholic Prayer Study

A small static site for studying Catholic concepts and memorizing prayers.

## Structure

- `index.html` — home page listing all exercises
- `prayers/` — prayer memorization pages. Each page only defines `window.PRAYER` (text, Latin, hooks); `practice.js` and `practice.css` build the exercises
- `shared/emblems.js` — gold emblems used on prayer headers and home-page cards
- `images/` — Robert Zünd, *The Road to Emmaus* (1877), public domain via Wikimedia Commons

To add a prayer, copy one of the pages in `prayers/`, change its `window.PRAYER` data (give it a new `key`), and add it to the `PRAYERS` list in `index.html` with a `priority` (the suggested order to learn it in; the home page can sort by priority or A–Z).

## Running locally

Open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server
```

The site is deployed on Vercel (https://catholicstudy.vercel.app) from the `main` branch.
