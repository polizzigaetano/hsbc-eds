# stardust journal — www.about.hsbc.co.uk

## 2026-10-01T13:21:28Z — replica planning run
- **Prompt:** "Use the Stardust skill to analyze the source site https://www.about.hsbc.co.uk/ and propose an EDS design-migration plan. Do not modify the repository yet."
- **Decisions (user):** keep current design (replica flow); findings allowed under stardust/ uncommitted.
- **Done:** extract --prep --dynamics over the 298 scoped URLs (sitemap minus empty /en/ shells); typed inventory; CSS/token lift; draft dynamics triage; register candidates; plan at replica/migration-plan.md.
- **Open:** font licence (UniversNext for HSBC), consent/Tealium, compliance modals, PDF hosting, Brightcove allowlist; recapture with consent dismissed; brand-surface synthesis not yet run.

## 2026-10-01T14:13:14Z — recapture + A1 article archetype
- **Prompt:** "recapture with the cookie banner dismissed and start A1"
- **Recapture:** crawl.mjs could not dismiss HSBC's Tealium-injected banner (buttons appear after its dismissal step); recaptured all 296 screenshots with stitch-shot + `--dismiss #teal-decline-consent`. Page JSON records were not re-crawled (consent heading still present in their headings[]; register R-02).
- **Font decision (policy default):** UniversNext for HSBC not rehosted; Noto Sans static weights as metric-matched substitute, live family names first in the stack.
- **A1 result:** 1440 — 0 structural red, 3.71% pixel, Δ −1px, header chrome 98.15%, footer chrome 96.06% (fail, font). 360 — 0 structural red, 9.77% pixel, Δ +30px (fail, font wraps), header chrome 100%. Hovers implemented from motion-observe evidence.
- **Learned:** variable-font weight clamping not honoured by the gate browser → static instances; calibrate font metrics in the gate's bundled Chromium, not the browser tool (they render the live page 30px apart at 360).
- **Open:** licensed font decision (closes the residuals), owner decisions in dynamic-features.md, Phase 2 root promotion (PRODUCT/DESIGN/DESIGN.json) not yet written.

## 2026-10-01T14:55:42Z — A1 approved, A2 landing archetype
- **Prompt:** "accept the residuals and start A2"
- **A1:** approved by user with font-substitution residuals.
- **Canon:** page-description and editorial text promoted into canon.css (shared); thin weight added; A1 re-gated unchanged.
- **A2 result:** 1440 — content-diff none, 1.72% pixel, Δ0, header chrome 98.19%, footer 96.06% (accepted font class). 360 — content-diff none, 4.48%, Δ1px, header 100%, footer 91.45% (accepted font class).
- **Learned:** live cinemagraph only activates ≥780px and ships a "Pause" label with a play icon by default; motion-observe hover probes read background-color only — background-image hovers need probe-hover.mjs.
- **Open:** user approval of A2; next archetype A3 (news listing).

## 2026-10-01T15:29:55Z — A2 approved, A3 news listing archetype
- **Prompt:** "approve A2 and start A3"
- **A3:** 323 archive rows parsed (7 years / 80 months / 13 PDF rows) and re-authored; accordion state machine mirrored (multi-open).
- **Result:** 1440 — content none, 2.00%, Δ0, header 98.15%, footer 96.06% (accepted). 360 — content none, 6.23%, Δ2, header 100%, footer 91.99% (accepted).
- **Over cap:** a 4th iteration was spent — content-parity fixes (download-link whitespace = 12 structural reds) are required to pass and do not move pixels; recorded in progress.json.
- **Canon:** promo card module + `.text` margin + medium calibration (103.3%) + red underline on link hover; A1/A2 re-gated unchanged or better.

## 2026-10-01T16:03:45Z — A3 approved, A4 content page + legal variant
- **Prompt:** "approve A3 and start A4"
- **Approach:** gen-content.py re-serializes captured <main> through an attribute allowlist (rich text verbatim, layout classes mapped to recreated CSS) — reusable for the A4 siblings.
- **Inclusion:** 1440 3.58% Δ0; 360 8.09% Δ24 (one font wrap); content none both. **Accessibility (legal):** 2.60% / 6.99%, Δ0 both, content none.
- **Canon:** general `.text h2` 58px top margin (not first child); page-description clearfix. A1/A2/A3 unchanged.

## 2026-10-01T16:36:16Z — A4 approved, A5 profile list (timeline + management team)
- **Prompt:** "approve A4 and start A5"
- **Result:** timeline 1440 1.79% Δ0, 360 7.52% Δ72 (three font wraps); management team 0.79% / 3.70% Δ0; content none on all four.
- **Canon:** general `.text p:last-child` 0 margin (measured), accordion exception; all earlier archetypes unchanged.
- **Decision:** regular size-adjust re-sweep found 100% better for A4/A5 mobile but it breaks A1's pixel bar; kept 99.6% (article archetype covers 284 pages).

## 2026-10-02T08:38:11Z — A5 approved
- **Prompt:** "approve"
- A5 (timeline + management team) approved with font residuals. Next: A6 document library (not started).

## 2026-10-02T09:29:47Z — A6 document library (Covered Bond)
- **Prompt:** "start A6"
- **Gate (observed live):** opens on load; Accept enabled by checkbox; Accept sets a 90-day cookie named after the page path; Decline/× → /hsbc-uk. Prototype mirrors it exactly (bond.js) — answers the open Compliance question about *current* behaviour.
- **Result:** static 1.81% / 5.20%, Δ0/0, content none; opened sections 1.76% / 4.78%; gate desktop 3.36% / 2.91%; gate mobile one-line heading-wrap residual (font).
- **Side effect fixed:** A3 archive opened state now measured (2.13% / 7.85%) after a shared list-margin fix. All 8 gated pages unchanged.
- **All six archetypes now prototyped.** Next: approve A6, then Phase 5 (migrate siblings → deploy pilot → rollout).

## 2026-10-02T09:31:14Z — A6 approved; all archetypes approved
- **Prompt:** "approve A6"
- Phase 3–4 complete: 6 archetypes (+ legal and management variants) approved with font-substitution residuals. Phase 5 (migrate siblings → deploy pilot → rollout) not started — it writes to the EDS project, so it waits for an explicit go.

## 2026-10-02T11:22:37Z — EDS build: blocks, styles, importer, DA upload (deploy handoff)
- **Prompt:** "Let's proceed with the dynamic-features.md. Then start building all the identified blocks, the template variants, the styling, and all the relevant CSS and JS files generated during the Stardust process. Let's start migrating all the pages listed and gated under Stardust/prototypes into EDS."
- **Decisions (user):** branch + local commit, no push; upload to DA; ship interim dynamic features; query-index from day one.
- **Built:** 12 blocks (header, footer, hero, share, page-description, cards, columns, cinemagraph, accordion, aside, profile, terms-gate) + search; page grid on `main`; site link decorator + leaving/e-mail confirmations; fonts/icons/video self-hosted.
- **Content:** one importer for every archetype (layout-row walker) → 8 pages + /search, /nav, /footer, 2 confirmation fragments; uploaded to DA and previewed (13/13 200, one h1, 0 about:error). Query index configured (admin API); it fills on publish.
- **Gates:** EDS vs prototypes ≤ 3.5% / |Δh| ≤ 3 (16 pairs, local and pipeline-delivered); vs live 13/16 pass, 3 = the accepted 360 font residuals; states ≤ 0.05%; 23/23 behaviours; lint clean; EW 0 dead.
- **Open:** publish to aem.live (index), push the branch (preview with branch code + PR link), owner decisions (CMP/Tealium, Compliance copy, PDF hosting).

## 2026-10-02T14:12:46Z — Wave 2: notes fragment + all 284 articles
- **Prompt:** "create the fragment and migrate all the articles"
- **Decision:** notes to editors stay per article (232 distinct variants across 267 articles, dated facts); `/fragments/notes-hsbc-uk` carries the current boilerplate for new releases.
- **Built:** inline-image, table, promo, factbox, carousel blocks; columns 3-3-6; importer handles nested components, wrappers, multiple notes blocks, rich summaries, blank-line breaks.
- **Content:** 297 documents imported (284 articles ≥ 90% completeness), uploaded to DA and previewed; delivered check 297/297 (200, one h1, 0 about:error).
- **Gates:** archetypes unchanged vs prototypes; 11-article sample vs live: 7 within ±4px, 4 one-off residuals (great-block, Loughborough, Lincoln, Footasylum).

## 2026-10-02T16:48:41Z — Wave 3: postcode lending data + working with fintechs
- **Prompt:** "migrate the following pages: …/hsbc-uk/postcode-lending-data, …/hsbc-uk/working-with-fintechs"
- Both use only existing components; imported (95% / 97.7%), home re-imported so its two cards link locally; uploaded to DA and previewed.
- vs live: 1440 Δ0 / Δ0 (5.6% / 5.2% pixel, font residual), 360 within ±1px.
- Fixes: rich-text images inline as on live (−7px on postcode lending); news-archive index top-up limited to releases newer than the newest authored row (the filled index had added a 2019 year the live archive does not show).
