# Catholic Study

A small static site for studying Catholic concepts and memorizing prayers.

## Structure

- `index.html` — home page listing all exercises
- `prayers/` — prayer memorization exercises (e.g. `hail-holy-queen.html`)
- `concepts/` — concept study pages (coming soon)

Each exercise is a single self-contained HTML file. To add one, drop the file in the right folder and add a link to it in `index.html`.

## Running locally

Open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server
```

The site is published with GitHub Pages from the `main` branch.
