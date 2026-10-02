<!-- provenance: written by stardust:replica (planning-only run), 2026-10-01. Read: stardust/state.json, current/pages/*.json|html (298 live Playwright captures, 298/298 provenance), current/_crawl-log.json, live application.css (Assets/PWS171), live computed-style probe (article page), catalog/ (site-scope run: 4 templates, 23 block variants). Synthesized: archetype grouping, block map, effort, risks. Nothing in the repository outside stardust/ was modified. -->

# Same-design EDS migration plan: www.about.hsbc.co.uk

**Flow:** `replica` → `migrate` → `deploy` (one-page pilot) → `rollout` (whole site).
`replica` runs its own preparation step that preserves the current design, so `prepare-migration` is **not** used.
**Design policy:** near pixel-perfect. The only allowed design changes are the approved entries in
`replica/inconsistency-register.md`. That register currently has 5 *proposed* entries and none approved.

## 1. Inventory

| | count | notes |
|---|---|---|
| URLs in sitemap | 554 | 257 are `/en/…` copies that render empty shells → not migrated, 301 `/en/*` → `/*` |
| Pages captured (live, 1440 wide) | 298 / 298 | provenance 298/298 live, 0 failures |
| Real pages to migrate | **296** | plus 2 × 301 redirects (`/hsbc-uk`, `/hsbc-uk/community` → `/`) |
| Linked PDFs | 167 distinct | 149 in the Sitecore media library (`/-/media/…`) |
| Undiscovered route | `/search` | server-side results page, not in sitemap |
| CMS | Sitecore | `?sc_lang=en-GB` media URLs, jQuery-era components, no client hydration |

Page types (inferred, confirm before recreation): **article 284 · static 7 · unique 3 · landing 1 · listing 1**.

## 2. Archetypes (one gated prototype per page type)

| # | archetype | gate page (live) | siblings | new modules this archetype introduces |
|---|---|---|---|---|
| A1 | **Article** | `/news-and-media/ambitious-uk-businesses-encouraged-to-go-for-gold` | 283 (232 + 51 without share bar) | hero image, share bar, article header (date · H1 · lede), rich text, media-contact block, notes-to-editors (small type) |
| A1b | Article variant without share bar | `/news-and-media/battersea-spanish-school-goes-virtual-…` | 50 (subset of A1's siblings) | variant class only (see register #1) |
| A2 | **Home / landing** | `/` | — | cinemagraph hero (muted looping MP4, poster, pause) + stats overlay, page title, intro text, 2-up image+text (`layout--6-6`), promo card grid (`long-form-promo`) |
| A3 | **News listing** | `/news-and-media` | — | latest-3 news cards, sidebar media-relations contacts (`layout--9-3`), year accordions + tabular news list, external "Views on HSBC.com" cards |
| A4 | **Content page** | `/hsbc-uk/inclusion` | postcode-lending-data, working-with-fintechs; legal variant: accessibility, cookie-notice, privacy-notice, terms-of-use | main + sidebar (9-3), sidebar image card + grey factbox, 4-up text promo grid (`3-3-3-3`), bullet/definition lists, inline tables (cookie notice) |
| A5 | **Profile list** | `/history-timeline` | `/management-team` | `exec-bio` row (image left · year/name · title · body), separators |
| A6 | **Document library** | `/hsbc-uk/regulated-covered-bond-programme` | — | Terms-of-Access gate modal, nested accordions, document table (title · date · file size · PDF) |

Rare article modules handled as A1 block variants, each checked on its own source page:
inline image (55 pages), inline table (26), floating pull-out container (11), inline promo (4),
image viewer (3), factbox (2), carousel + Brightcove video (1: Loughborough branch article).

## 3. Block map (target EDS blocks)

| block | variants | covers | source evidence |
|---|---|---|---|
| `header` | — | black utility bar (Personal · Business), logo, 4-item primary nav with red active underline, search, mobile nav tray + focus trap | `.header`, `.divisions-nav`, `.primary-nav`, `.nav-tray` (298) |
| `footer` | — | black bar: 5 legal links + © line | `.footer` (298) |
| `hero` | `image`, `cinemagraph` | full-bleed hero image, with share bar overlapping bottom right | `.header-area` (294) |
| `share` | — | X / Facebook / LinkedIn, URL filled in at runtime | `.share-actions` (242) |
| `stats` | — | three hexagon-outline figures over the cinemagraph | home `.cinemagraph` a11y text |
| `columns` | `6-6`, `3-3-3-3` | 2-up image+text, 4-up text promos | `.layout--6-6`, `.layout--3-3-3-3` |
| `cards` | `image-overlap`, `external` | promo grid with white caption box overlapping the image; external-link cards | `.long-form-promo` (5) |
| `news-list` | `latest`, `archive` | latest-3 cards + year accordions fed from the site's query index | `/news-and-media` |
| `accordion` | `nested` | year archive, covered-bond sections | `.accordion`, `.accordion-nested` |
| `doc-table` | — | document rows with file size + download icon | `.tabular-list` |
| `profile` | — | exec-bio / timeline rows | `.exec-bio` (2 pages) |
| `factbox` | — | grey sidebar fact panel | `.factbox` (2) |
| `image-viewer`, `carousel`, `video` (Brightcove), `table` | — | rare article modules | see §2 |
| page layouts | section style `with-sidebar` (9-3) | main + right rail | `.layout--9-3` (298) |
| site-wide modals (scripts) | — | leaving-site confirmation, Covered Bond terms gate, consent | §5 |

Most pages are default content (headings, paragraphs, lists, links) inside one sectioned layout.
That keeps authoring simple for 284 article pages.

## 4. Captured design (to be promoted as the target spec)

- **Type:** *UniversNext for HSBC* (W02: UltLt, Lt, Rg, Bd, It; woff from `/assets/PWS171/fonts/`), with Arial as the site's own fallback.
  Measured (780 px viewport): H1 ultra-light 56/56, letter-spacing −1.4px · lede regular 16/24 at that width (larger on desktop) · H3 24/30, −0.48px · body 16/24 · footer 14/21.
  The type ramp is re-measured at 1440 and 360 during recreation.
- **Colour:** text `#333333` · HSBC red `#de0011` (active nav, chevrons, external-link icon) · dark reds `#b1000e` / `#83000a` (hover) · black `#000` (utility bar, footer) · greys `#404040`, `#6d6d6d`, `#929292`, borders `#d7d8d6`, surfaces `#ededed` / `#e2e2e1`.
- **Layout:** container max-width 1180px with 20px padding. Source breakpoints: 1080, 800, 640, 480.
- **Icons:** icon font `pwsicons` → convert the used glyphs (external, download, chevron, internal, search, share, social) to SVGs in `/icons`.
- **Motifs:** square corners, no shadows. Image cards carry a white caption box overlapping the image. Thin grey rules separate list rows.

## 5. Dynamic features (full triage in `stardust/dynamic-features.md`)

14 rows, all `pending`. Reproducible in code (`self`): search, leaving-site confirmation, share, news archive, Covered Bond terms gate,
accordions, cinemagraph, image viewer, carousel, mobile nav. Need third-party or owner setup (`external`): consent platform, Tealium tags, Brightcove.
PDFs are an owner decision on where they're hosted.

## 6. Execution phases (after you approve this plan)

| phase | work | gate / exit |
|---|---|---|
| 0. Decisions | Owner answers the 5 questions in `dynamic-features.md` § Decision batch, plus the font licence (§7) and register approvals | written answers |
| 1. Finish capture | recapture with the consent banner dismissed (current screenshots show the banner); run brand-surface synthesis → `current/DESIGN.md`, `DESIGN.json`, `PRODUCT.md`, `brand-review.html` | brand review checked by eye |
| 2. Preserve direction | promote `current/` spec to repo root (`PRODUCT.md`, `DESIGN.md`, `DESIGN.json`) verbatim, write `stardust/direction.md`, freeze register | — |
| 3–4. Recreate + gate | A1 → A2 → A3 → A4 → A5 → A6, each a standalone prototype building on the shared layers already gated. Max 3 measured iterations per breakpoint | per archetype at **1440 and 360**: content-diff 0 structural 🔴, pixel diff ≤ 10%, height Δ ≤ 8px, motion observed + implemented |
| 5a. Pilot | `deploy` A1 (one article) to `{branch}--hsbc-eds--polizzigaetano.aem.page`, re-run the gate against the published origin | published-origin gate passes |
| 5b. Siblings | `migrate` at sibling tier with a variance probe per template; article metadata (`date`, `description`, `image`) captured for `query-index` | per-page content-count acceptance |
| 5c. Rollout | `rollout`: block dedup, PDF move, redirects sheet (`/en/*`, `/hsbc-uk`, `/hsbc-uk/community`), `qa` sweep | QA findings report clean or allowlisted |

**Effort shape:** six archetype gates do most of the design work. A1 alone covers 96% of pages, so it goes first and doubles as the pilot.
A2 (cinemagraph) and A6 (terms gate + nested accordions) carry the most behaviour. A5 and the legal variant of A4 are mostly typography.
Content volume is low-risk: 284 articles share one structure, with 0 failures and 0 client-rendered content in the capture.

## 7. Risks and owner decisions

1. **Licensed brand font.** UniversNext for HSBC is a commercial HSBC-licensed face. Stardust policy is never to rehost it on a new domain without confirmation.
   Ask HSBC brand/legal whether the web licence covers `*.aem.page` / `*.aem.live` and the production host. Until then, use a metric-matched substitute,
   with `UniversNext for HSBC` first in the font stack. Pixel gates will read higher until the real face is in place.
2. **Consent + Tealium** on the new host (owner + analytics team).
3. **Compliance modals** (leaving-site confirmation, Covered Bond terms) are regulatory. Copy and behaviour must be signed off, not only matched to the pixels.
4. **167 PDFs** on Sitecore media URLs with query strings. Choose to migrate them or keep them on the legacy host with redirects.
5. **Capture hygiene:** the consent dialog's H2 leaked into headings and the banner covers the top of the screenshots. Recapture with dismissal before gating (phase 1).
6. **Content anomalies** (Proofpoint-wrapped links, 51 articles without a share bar) are logged as register candidates. They are not fixed silently.

## 8. What this planning run did and did not do

- Did: live capture of all 298 pages (`stardust/current/pages/`, screenshots, rendered DOM, dynamic-surface roll-up), typed inventory (`stardust/state.json`),
  CSS/font/token lift, draft dynamic triage, register candidates, this plan.
- Did not: promote spec files to the repo root, edit root `.gitignore` / `.hlxignore`, copy gate scripts, build prototypes, blocks, styles or content, deploy, or commit.
  `stardust/` is untracked (only `stardust/.gitignore` from the stardust template was added inside it).
- Not yet run (phase 1): brand-surface synthesis + `brand-review.html`. The token summary in §4 comes from the live CSS and computed styles instead.
