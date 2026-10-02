<!-- provenance: written by stardust:replica Phase 2.4 (draft triage, dynamics Phases 1–3 desk-level), planning-only run 2026-10-01. Read: current/_crawl-log.json#dynamicSurface, current/pages/*.html (rendered DOM), live probe of /search. Synthesized: dispositions + reproducibility. Authored: none. Status of every row is `pending` — nothing implemented. Updated 2026-10-02 by stardust:deploy (EDS build on branch replica-archetypes): rows 1, 4–9, 13, 14 implemented (interim tiers marked), rows 2–3 deferred by the user decision "ship interim versions"; rows 10–12 untouched (no gated archetype carries them). -->

# Dynamic features — www.about.hsbc.co.uk

Crawler reach roll-up (298 pages, `--dynamics`): 0 same-site data endpoints, 0 hydrated pages,
0 inline data blobs, third-party script hosts = `tags.tiqcdn.com` (Tealium utag `hsbc/uk-common/prod`),
`sadmin.brightcove.com`. Server-rendered Sitecore site (`/-/media/…?sc_lang=en-GB`); every
behaviour below is jQuery-era component JS over static markup, so almost all of it is `self`-reproducible.

## Listings contract

- **News archive** (`/news-and-media`): 3 latest-article cards + year accordions (2020–2026) each holding a
  `tabular-list` of date + title + description rows (323 rows). Proposed source: EDS `query-index`
  over `/news-and-media/*` with `date`, `title`, `description`, `image` columns; accordion grouping by year client-side.
- **Covered-bond document library**: nested accordions of `tabular-list` rows (title, date, file size, PDF link) —
  authored content, not a feed.

## Features

| # | id | feature | class | reach | disposition | reproducibility | status | pattern | decision / owner | evidence |
|---|----|---------|-------|-------|-------------|-----------------|--------|---------|------------------|----------|
| 1 | site-search | Header search box → `/search?q=` results page (server-side; `/search` not in sitemap) | search | 298 pages (header) | index-backed | self | implemented — interim | `search` block on `/search` over `query-index.json` (title+description match, title hits first); header form → `/search?q=` | **Interim:** results only cover pages in the EDS index (fills on publish); owner still to confirm scope = this site only | `blocks/search`, `content/search` |
| 2 | consent-cmp | Cookie consent dialog (Accept / Decline / Manage cookies) + privacy prompt | tags/CMP | 296 pages | embed-passthrough | external | deferred — interim | none shipped: the boilerplate dummy CMP (`scripts/consent-check.js`, declined by default) stays | **Owner decision pending** (user: ship interim, no CMP until decided) | — |
| 3 | tealium-tags | Tealium utag (`hsbc/uk-common/prod`) analytics | tags | 298 pages | embed-passthrough | external | deferred — interim | none shipped (no tags before a CMP decision) | **Owner decision pending** | — |
| 4 | leaving-confirmation | "You are leaving HSBC" interstitial on external links (regulated-bank requirement) | modal | 274 pages | rebuild-native | self | implemented — interim copy | delegated click handler (`scripts/leaving-confirmation.js`): external links outside the live `countryExternalWhitelist` → `/fragments/leaving-hsbc`; `mailto:` → `/fragments/email-us`; proceed opens a new window | **Interim:** live copy + live whitelist carried over verbatim; Compliance sign-off pending | `scripts/leaving-confirmation.js`, `styles/lightbox.css`, `content/fragments/*` |
| 5 | share-actions | Share bar (X / Facebook / LinkedIn intent URLs, `{URL}`/`{title}` templated client-side) | client widget | 242 pages | client-only | self | implemented | `share` block: authored intent links, `{URL}`/`{title}` filled at runtime | — | `blocks/share` |
| 6 | news-archive | Year accordions + tabular list of all articles; 3 latest cards | listing | 1 page (284 items) | index-backed | self | implemented | `accordion (news-archive)` + `cards (latest)`: the 323 authored rows / 3 authored cards are the baseline; `query-index.json` tops them up (newer articles, de-duplicated by path, placed by year/month), never blocking first render. Index config (query.yaml, with `date` = `publication-date`) set via the admin API | Articles carry `Publication Date` metadata at import; the index fills on publish | `blocks/accordion`, `blocks/cards`, `scripts/site.js` |
| 7 | bond-terms-gate | Covered Bond "Terms of Access" modal on load (accept to view documents) | modal / legal gate | 1 page | rebuild-native | self | implemented — interim | `terms-gate` block: opens on load unless the path-named cookie exists; tick → Accept; 90-day cookie; Decline/× → the Decline link (live /hsbc-uk) | **Interim:** live 90-day rule carried over; Compliance/Legal confirmation pending | `blocks/terms-gate` |
| 8 | bond-library | Nested accordions + document tables with file sizes | accordion | 1 page (130 rows) | rebuild-native | self | implemented | `accordion` block: nested items from sub-headings, document rows `<a>title</a> language type size` | PDFs still on the live host (row 14) | `blocks/accordion` |
| 9 | cinemagraph | Muted looping MP4 hero with poster + pause control (stats overlay "14.5m / 600,000 / 23,000+") | media | 3 pages (home + 2 redirects) | rebuild-native | self | implemented | `cinemagraph` block: active ≥780px, autoplay unless reduced motion, poster below 780; mp4 served from the code origin (`/media/cinemagraph/`) | — | `blocks/cinemagraph`, `media/cinemagraph/` |
| 10 | brightcove | Brightcove player (inline video) | player | 2 pages | embed-passthrough | external | not needed (wave 2) — the Loughborough "video" is a poster-only carousel; inclusion only loads the script | `video`/`embed` block with live account + video id | Owner: Brightcove player allowlist for new domain | `.video`, `sadmin.brightcove.com`; inclusion + Loughborough branch article |
| 11 | image-viewer | Click-to-enlarge full-size image overlay | modal | 3 articles | rebuild-native | self | pending | `image-viewer` block variant | — | `.image-viewer`, `.fullsize-image`, `.viewer-header` |
| 12 | carousel | Image carousel | client widget | 1 article | rebuild-native | self | implemented | `carousel` block (image + caption slides, prev/next, counter) | — | `.carousel` (Loughborough branch article) |
| 13 | nav-tray | Mobile menu tray with focus trap; "Personal / Business" divisions nav; doormat nav | chrome | 298 pages | rebuild-native | self | implemented — interim styling | `header` block tray (search, primary nav, divisions; Escape closes). Not part of a gated archetype; doormat mega-menu not rebuilt (no observed visible state in the gate) | Visual parity of the open tray not gated | `blocks/header` |
| 14 | documents | 167 distinct linked PDFs (149 in Sitecore `/-/media/`) | assets | 67 pages | static-snapshot | self | implemented — interim | document links authored fully qualified on the live media host; `--download` glyph + size label rebuilt | **Interim:** PDFs stay on the legacy host until the hosting decision | `tools/importer/parsers/accordion.js` |

## Decision batch (owner questions — interim versions shipped meanwhile, 2026-10-02)

1. Consent platform + Tealium profile for the EDS host (rows 2–3).
2. Leaving-confirmation copy and domain allowlist sign-off from Compliance (row 4).
3. Covered Bond Terms-of-Access: live behaviour is now measured (90-day path-named cookie; Decline/× → /hsbc-uk) and mirrored — Compliance only needs to confirm it should carry over unchanged (row 7).
4. PDF hosting: migrate 167 PDFs vs keep the legacy media host behind redirects (row 14).
5. Brightcove domain allowlist (row 10).

## Register (decided-out)

None yet.
