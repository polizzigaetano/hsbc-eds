# Page description (`page-description`)

The page header text: an optional date line, the page `<h1>` and an optional summary. It reproduces
the live `.page-description` of www.about.hsbc.co.uk (default on landing pages such as
`/hsbc-uk/inclusion`, `.page-description--tertiary` on `/news-and-media/*` articles). Used on 294
pages of this site.

## Authoring

### da.live (document)

| Page description (tertiary, rich-summary) |
|---|
| [date paragraph] · heading 1 · [summary paragraphs and/or a list] |

- One cell. The heading is the first `h1` (or `h2`) in the cell.
- Date: any paragraphs before the heading (e.g. `28 July 2026`). Optional; typed by the author —
  the block does not read the page's `Publication Date` metadata.
- Summary: every paragraph and list after the heading. Optional.
- Only `p`, `ul`, `ol`, `h1`, `h2` are kept; other elements (h3–h6, tables, quotes) are dropped.
  Lists before the heading are dropped. Without a heading, all content becomes the summary.
- Options:
  - `tertiary` — article header: ultra-light heading font, tighter heading margins (`-7px 0 9px`),
    48px heading at `width <= 640px`. Used on 280 articles.
  - `rich-summary` — the summary also gets the site rich-text class `.text` (list, `sup`, link and
    heading styles of the editorial body), 20px bottom margin and no paragraph margins. Used on 86
    pages (85 combined with `tertiary`).
- Default (no option): 13 landing pages, e.g. `/`, `/management-team`, `/hsbc-uk/inclusion`.

### AEM / Universal Editor

- Component "Page description" — fields `classes` (multiselect "Options": "Article (ultra-light
  heading)" = `tertiary`, "Rich-text summary" = `rich-summary`) and `text` (rich text: date,
  heading, summary).
- All fields are edited in the **properties panel**; the block restructures its content, so the
  canvas is not inline-editable.
- A new block starts with `1 January 2026` / `Page title` / `Summary`.
- AEM renders the same single-cell shape. `tools/xwalk/convert.mjs` restores the `rich-summary`
  option value (html2md writes it as "rich summary").

## Behaviour

Renders up to three slots: `.page-description__meta` (date, bold 14px/18px),
`.page-description__heading` (thin 56px/56px, -1.4px tracking) and `.page-description__summary`
(light 24px/30px, 15px between paragraphs). The summary slot is always rendered, even when empty.

- `width <= 1080px`: the heading's negative top margin is removed.
- `width <= 780px`: long heading words wrap (`overflow-wrap: break-word`).
- `width <= 640px`: heading 40px/40px (tertiary 48px/48px), summary 18px.
- Static block: no interaction.

## Dynamic content

None. The date is authored text; it is not computed from metadata.

## In the Universal Editor

Rendered as on the published page. Edits made in the properties panel are re-rendered by
`ue/scripts/ue.js` from the editor's response (page reload as fallback).

## Accessibility

- The authored `h1` keeps its level and id; it should be the page's only `h1`. An `h2` used
  instead is styled as the page title but stays an `h2`.
- No roles or aria attributes are added.

## Deviations from the live site

None known.

## Acceptance checks

- A cell `p` · `h1` · `p` renders `__meta`, `__heading`, `__summary` in that order.
- A cell with only an `h1` renders `__heading` and an empty `__summary`, no `__meta`.
- `tertiary` uses `--ff-ultra-light` for the heading; the default uses `--ff-thin`.
- `rich-summary` adds `text` to `.page-description__summary` and a 20px bottom margin.
- At 1440px the heading is 56px; at 360px it is 40px (48px with `tertiary`).
- A list in the summary stays a list inside `.page-description__summary`.

## Files

`page-description.js`, `page-description.css`, `ue/models/blocks/page-description.json`;
`styles/styles.css` (`.text` rich-text rules used by `rich-summary`).
