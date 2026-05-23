# SpinChirp

Music industry job board. Scrapes jobs daily from labels, publishers, streaming platforms, booking agencies, and more.

## What's in here

- `index.html` — the website
- `scraper/` — the code that finds and imports jobs automatically
- `.github/workflows/scrape.yml` — runs every morning at 7am, updates the site, deploys it

## Adding a new company to scrape

Open `scraper/targets.js` and add a line following the existing pattern.
