# Accordion (`accordion`)

The live multi-open accordion with "tabular list" rows (`.accordion`, `.accordion-nested`,
`.tabular-list`) of www.about.hsbc.co.uk: the document library on
`/hsbc-uk/regulated-covered-bond-programme` (with nested year items) and the year-by-year news
archive on `/news-and-media`. Used on 2 pages of this site.

## Authoring

### da.live (document)

| Accordion (news-archive) |  |
|---|---|
| Item heading (h2 or h3) | Panel: paragraphs, lists, one-level-down headings |

- One row per item. Cell 1: the item heading. A heading (h1–h6) is expected; a bare-text cell is
  wrapped in a generated `h3` (fallback only).
- Cell 2 (optional): the panel. Rendered in authored order: prose (p, h4…) becomes rich text; each
  `ul` / `ol` becomes a tabular list, one row per `li`. An `li` without a link stays a plain row.
  - Document row: `<a href="…pdf">Title</a> English PDF 167.89 KB`. The text after the link is
    split into language, type and file size (size must end in KB/MB/GB/bytes).
  - Article row (news-archive): `24 Sep 2026 <a href="/news-and-media/…">Title</a> optional
    description`. Text before the link is the date cell; text after is the description.
- Default variant only: headings exactly one level below the item heading (h3 under an h2) start
  nested items; each takes the content up to the next such heading. Content before the first one
  stays at the top of the panel. Example: "Investor reports and Harmonisation Template" (h2) with
  year items 2026…2022 (h3) on the Covered Bond page.
- Option `news-archive`: year items (h3) holding month headings (h4) and article lists; no nested
  items; the query index adds newer articles (see Dynamic content).

### AEM / Universal Editor

- Component "Accordion": properties panel field *Options* (multiselect: `news-archive`).
- Item component "Accordion item", added/removed with the + button on the block: *Item heading
  (h2 or h3)* (richtext, required) and *Panel* (richtext). The heading is editable inline in the
  canvas; the panel is restructured by the block, so it is edited in the properties panel only.
- AEM renders the same two-cell rows as the da.live table (`tools/xwalk/convert.mjs` does not
  reshape this block).

## Behaviour

Each row becomes `.accordion__item` = heading row (`.accordion__heading`: title + chevron
`<button>`) + panel (`.accordion__content`, `hidden` until opened). All items start closed.

- Click anywhere on the heading row, or activate the button (Enter / Space), to toggle. Items open
  independently: several can be open at once. The chevron swaps down/up.
- Nested items (`.accordion-nested__item`) toggle the same way inside an open panel; they start
  closed.
- Heading hover/focus-within: panel-grey background; open item: dark heading, white text.
- No open/close animation; with `prefers-reduced-motion: reduce` the heading background transition
  is off as well.
- Breakpoints: `<= 640px` heading 18px (30px above); `<= 560px` document metadata floats left;
  container query `<= 800px` (panel width) stacks tabular rows (date above title, metadata below).

## Dynamic content

`news-archive` only. After the authored archive renders (never blocking it), `fetchArticles()`
(`scripts/site.js`) loads `/query-index.json` (all pages, 500 per request) and keeps rows under
`/news-and-media/` with a parseable `date` / `publication-date`. An index article is added only when
its path is not already listed and it is newer than the newest authored row date. It goes into
its year item (created before the next older year, or appended) and month (an `h4` + list
prepended to the year if missing), newest first, as `24 Sep 2026` + title link, no description.
Index unavailable or empty: the authored rows stay unchanged. No limit on the number added.

## In the Universal Editor

Items carry the editor markers (`moveInstrumentation`), so they can be selected, added, moved and
removed. Selecting an item (`aue:ui-select`) opens it, and its outer item if it is nested; selection
never closes items. After each edit `ue/scripts/ue.js` re-renders the whole block from the editor
response, so all items are closed again. Nested items are derived from headings and are not
separate components. The news-archive top-up also runs in the editor; those rows are not content.

## Accessibility

- The toggle is a `<button type="button">` with `aria-expanded`, `aria-controls` (panel id) and
  `aria-labelledby` (the heading id); the authored heading stays a real heading.
- Panel: `role="region"`, `aria-labelledby` the heading, `hidden` while closed.
- Document links get a download glyph (`aria-hidden`), a visually hidden "Download" and
  `aria-describedby` pointing at their language/type/size row.
- Keyboard: Tab to the chevron button, Enter/Space toggles. No arrow-key navigation.

## Deviations from the live site

- The heading row is the click target and the button is a chevron-only toggle named by the
  heading (`aria-labelledby`), so the authored heading stays editable (EW7, header comment).

## Acceptance checks

- On `/news-and-media`, opening two year items leaves both open (`accordion multi-open`).
- The toggle's `aria-expanded` is `false` when closed and `true` when open.
- `/news-and-media` renders more than 300 `.tabular-list__item` rows (`archive rows rendered`).
- On the Covered Bond page, "Investor reports…" holds nested items 2026–2022, all closed.
- A document row shows language, type and size in separate cells (e.g. English / PDF / 167.89 KB).
- With `/query-index.json` returning 404, the archive still renders its authored rows.
- An index article newer than the newest authored row appears under its year and month.

## Files

`accordion.js`, `accordion.css`, `ue/models/blocks/accordion.json`; `scripts/site.js`
(`fetchArticles`, `parseDate`, `formatDate`, `monthName`, `pathOf`, `moveInstrumentation`);
`ue/scripts/ue.js` (reveal on selection).
