<!-- provenance: written by stardust:replica Phase 2.3; rewritten to the entry schema at the start of A1 recreation (2026-10-01). Sources: crawl evidence (current/pages/*.json|html, screenshots), catalog/ scope run. No audit run. No entry has been approved by the owner, so every entry is `deferred` — this run is a pure replica. -->

# Inconsistency register — www.about.hsbc.co.uk replica

No entry is applied — pure replica. Everything below is a deferred handover item; any design
delta the gate finds is a defect, not an improvement.

## R-01 — Share bar present on some articles, absent on others

- **Evidence:** `.share-actions` on 242 pages; 51 articles (mostly 2020, e.g. `news-and-media-battersea-spanish-school-goes-virtual-…`) render the hero with no share bar.
- **Finding:** two article variants with no editorial reason recorded.
- **Minimal change:** render the share bar on every article (single article template).
- **Status:** deferred
- **Where:** article (A1 / A1b)

## R-02 — Consent dialog heading in page flow

- **Evidence:** the cookie dialog `<h2>` "Cookies on this website" was captured into `headings[]` on most page records.
- **Finding:** consent UI sits in the document outline.
- **Minimal change:** render consent UI outside `main` (no visual change).
- **Status:** deferred
- **Where:** all pages

## R-03 — Email-security-wrapped links in body copy

- **Evidence:** body links pointing to `https://urldefense.com/v3/__https:…`.
- **Finding:** content defect (Proofpoint rewrites pasted into CMS).
- **Minimal change:** unwrap to the real target URL at import — needs owner OK (content is otherwise verbatim).
- **Status:** deferred
- **Where:** affected articles

## R-04 — Empty `/en/` duplicate URLs

- **Evidence:** 257 sitemap URLs under `/en/…` render empty shells (no title, no content).
- **Finding:** dead duplicate routes.
- **Minimal change:** do not migrate; 301 `/en/*` → `/*` in the redirects sheet.
- **Status:** deferred
- **Where:** delivery (rollout)

## R-05 — Redirect-only pages

- **Evidence:** `/hsbc-uk` and `/hsbc-uk/community` return 301 → `/`.
- **Finding:** not pages.
- **Minimal change:** carry over as redirects.
- **Status:** deferred
- **Where:** delivery (rollout)
