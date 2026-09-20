# mredchristie.dev

Source for my personal portfolio — [mredchristie.dev](https://mredchristie.dev).

Hand-written HTML, CSS and vanilla JavaScript. No framework, no build step, no bundler.
The whole site is static files mirrored to a Cloudflare R2 bucket.

## Pages

| Page                  | What's on it                                                                                |
| --------------------- | ------------------------------------------------------------------------------------------- |
| `index.html`          | Terminal hero, about, project teasers, skills, interests carousel, listening stats, contact |
| `projects.html`       | Full write-ups for each project — the teasers on the homepage link here                     |
| `infrastructure.html` | How the site and its services are self-hosted, with architecture diagrams                   |
| `snippets.html`       | Searchable library of reusable code snippets                                                |
| `travel.html`         | Photo gallery with filtering and a keyboard-navigable lightbox                              |
| `404.html`            | Not-found page styled as a failed `cd`                                                      |

## Layout

```
.
├── index.html / projects.html / infrastructure.html / snippets.html / travel.html / 404.html
├── styles.css              # shared: theme vars, nav, hero, reveal, interests, contact, footer
├── projects-styles.css     # project cards + teasers (used by index, projects, infrastructure)
├── music-styles.css        # #music section on the homepage
├── snippets-styles.css     # snippets page only
├── travel-styles.css       # gallery + lightbox
├── script.js               # homepage: typing animation, nav, theme, scroll reveal
├── nav-more.js             # shared: click/Escape handling for the nav "More" dropdown
├── projects-script.js      # projects + infrastructure pages
├── music-script.js         # #music: stats.fm fetch, listening-clock chart
├── snippets-script.js      # snippet search/filter/render
├── travel-script.js        # gallery filtering + lightbox
├── photos/                 # travel gallery images, by trip
├── *-card.webp             # 600px renditions used by the homepage interests carousel
├── *-card.jpg              # their JPEG masters — kept in the repo, not deployed
├── og-*.png                # Open Graph link-preview cards, one per page
├── og-card-template.html   # the card design; rasterised by make-og-cards.py
├── make-og-cards.py        # regenerate the og-*.png cards
├── deploy.sh               # format, cache-bust, mirror to R2, purge Cloudflare
├── refresh-music-snapshot.py  # re-bake the #music fallback data
├── sitemap.xml / robots.txt
└── .img-backup/            # pre-optimisation originals (gitignored, not deployed)
```

## Conventions

**Theming.** Colours come from CSS custom properties on `:root` in `styles.css`. Light mode is
applied via `[data-theme='light']` overrides. The theme is read from `localStorage` in an inline
`<script>` in each `<head>` — before first paint, so there's no flash of the wrong theme.

**Images.** Everything the homepage serves is WebP. The `.png`/`.jpg` masters stay in the repo
so the renditions can be regenerated, but `deploy.sh` excludes them from the bucket — dropping
the homepage image payload from ~1.5 MB to ~275 KB. Regenerate with
`cwebp -q 82 in.png -o out.webp`. `travel.html` still reuses the full-size JPEG originals,
because its lightbox displays them at up to ~1400px. Every `<img>` carries
intrinsic `width`/`height` so nothing reflows as images load. Gallery images are `loading="lazy"`;
the two profile cutouts in the reveal section are deliberately eager, because the scroll-scrubbed
dissolve needs both layers decoded before the scrub begins.

**Listening stats.** The `#music` section reads lifetime Spotify numbers from the
stats.fm public API (`api.stats.fm/api/v1`) straight from the browser — it sends
`access-control-allow-origin: *`, so there's no key, proxy or build step. Two endpoints
supply the headline counts and the hour-of-day buckets behind the listening clock.

Set `STATSFM.user` at the top of `music-script.js`; the fetch is skipped while it reads
`REPLACE_ME`. The stats.fm privacy toggles for _Streams_ and _Stats_ must be
public or the API refuses those endpoints. `SNAPSHOT` in the same file is the baked
fallback used when the fetch fails — regenerate it with `./refresh-music-snapshot.py`. If
there's no live data _and_ no snapshot the section removes itself rather than render
placeholder numbers.

The clock is pinned to `Europe/London` on purpose: it describes when _I_ listen, so
rendering it in the viewer's timezone would tell a different story per reader.

**Navigation.** The navbar carries five primary links; Interests, Snippets, Travel and
Infrastructure sit under a "More" dropdown so the top level can't collide with the logo. The
menu opens on `:hover` and `:focus-within` in CSS, so mouse and keyboard work with JavaScript
off, and below 768px it flattens into the hamburger panel and is always visible. `nav-more.js`
only adds click/Escape, which is what a touch device wide enough for the desktop nav needs.
The markup is duplicated across all five pages — change one, change them all.

**Working without JavaScript.** There's no full-screen "JavaScript required" wall: about,
projects, skills and contact are static HTML and render fine. The hero copy is authored in
`index.html` (not in `script.js`) so it reads without JS and is indexable; the typing animation
reads it out of the DOM, blanks the element and types it back. A `<noscript><style>` in the
`<head>` hides the two sections that genuinely can't work — `#profile`, a scroll-scrubbed
dissolve, and `#music`, which renders from an API — and a slim banner says so.

**Link previews.** Each page points `og:image` at its own 1200×630 card rather than sharing one
profile photo. `make-og-cards.py` rasterises `og-card-template.html` with headless Chrome, one
card per entry in its `CARDS` dict. Re-run it after changing a page title:

```bash
./make-og-cards.py
```

**Cache busting.** `deploy.sh` rewrites every local `css`/`js` reference with a `?v=<timestamp>`
before mirroring, so Cloudflare's edge cache can't pair new HTML with stale assets.

**Project content.** Full project write-ups live only in `projects.html`. The homepage carries
short teasers that deep-link to `projects.html#<id>`. Keep it that way — duplicating the copy on
both pages is what the teaser split was introduced to fix.

## Local development

No build step. Open `index.html` directly, or serve the directory to get correct absolute paths:

```bash
python3 -m http.server 8000
# then http://localhost:8000
```

## Formatting

Prettier is the only dependency.

```bash
npm install
npm run format
```

## Deploying

```bash
./deploy.sh
```

Formats, stamps asset versions, mirrors to the R2 bucket via `mc`, then purges the Cloudflare
cache. The purge step needs an API token with `Zone → Cache Purge` at
`~/.config/cloudflare/purge-token`; it's skipped with a warning if that file is absent.

## Licence

Feel free to borrow ideas or structure. Attribution appreciated, not required.
