# mredchristie.dev

Source for my personal portfolio: [mredchristie.dev](https://mredchristie.dev).

Hand-written HTML, CSS and vanilla JavaScript. No framework, no build step. Static files
served from a Cloudflare R2 bucket behind Cloudflare.

## Highlights

- No framework, bundler or build step: plain HTML, CSS and JavaScript
- Readable without JavaScript, with a dark and light theme that never flashes on load
- WebP images, lazy loading and cache-busted assets keep pages light and fresh
- Live stats fetched in the browser, with baked fallbacks if the API is down
- Self-hosted services behind Cloudflare, with a public status page

## Pages

- `index.html`: hero, about, project teasers, skills, interests, stats
- `projects.html`: full project write-ups
- `infrastructure.html`: how my services are self-hosted, with diagrams
- `snippets.html`: searchable code snippet library
- `travel.html`: photo gallery with filtering and a lightbox
- `404.html`: not-found page

## Subdomains

- [water](https://water.mredchristie.dev): Cornish Water Watch API
- [weather](https://weather.mredchristie.dev): weather app
- [surf](https://surf.mredchristie.dev): surf forecast
- [cs2price](https://cs2price.mredchristie.dev): CS2 price tracker
- [spr](https://home.spr.mredchristie.dev): secure package registry
- [status](https://status.mredchristie.dev/status/main): public status page

## Structure

```
.
├── *.html, sitemap.xml, robots.txt, LICENSE
├── deploy.sh       format, cache-bust, upload to R2, purge cache
├── assets/
│   ├── css/        styles.css (shared) plus one file per page or section
│   ├── js/         one file per page or section
│   ├── img/        profile shots, interest cards, link-preview cards
│   ├── photos/     travel gallery, grouped by trip
│   └── vendor/     asciinema player and demo recording
├── tools/          link-preview card generator, music snapshot refresher
└── docs/           architecture diagram sources
```

## Develop and deploy

```
npm install
npm run format                   # Prettier is the only dependency
python3 -m http.server 8000      # preview at http://localhost:8000
./deploy.sh                      # upload to R2 and purge the Cloudflare cache
```

Deploying needs an `mc` alias named `r2` with a `website` bucket, and optionally a Cloudflare
API token (Zone > Cache Purge) at `~/.config/cloudflare/purge-token`. No credentials are
stored in this repo.

## Credits

- Fonts: [JetBrains Mono](https://www.jetbrains.com/lp/mono/) and
  [Inter](https://rsms.me/inter/), both under the
  [SIL Open Font License 1.1](https://openfontlicense.org), loaded from Google Fonts
- [asciinema-player](https://github.com/asciinema/asciinema-player), Apache License 2.0, in
  `assets/vendor/`
- Listening stats from the [stats.fm](https://stats.fm) public API

Third-party components keep their own licences.

## Licence

Copyright (c) 2026 Ed Christie. All rights reserved. See [LICENSE](LICENSE).

The source is public so you can see how the site is built. Take inspiration freely, but please
do not copy the code, text, design or images without written permission.
