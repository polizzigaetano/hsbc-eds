# Sidebar (`aside`)

The secondary (right-hand) column of the live 9-3 layout (`.layout--9-3 > .layout__secondary`) of
www.about.hsbc.co.uk: the media-relations contacts on `/news-and-media`, a sidebar image with
caption in articles (e.g. `/news-and-media/hsbc-uk-issues-cryptocurrency-warning`), and the
brochure image + "Awards & Highlights" factbox on `/hsbc-uk/inclusion`. Used on 28 pages of this
site.

## Authoring

### da.live (document)

| Aside |
|---|
| Rich text item (picture + caption, or h2 + contact paragraphs) |
| h2 heading followed directly by a list (factbox) |

- Put the block in its own section, **after** the section(s) it sits beside. Mark sections that
  continue the same live row with section style `continued` (e.g. on `/hsbc-uk/inclusion`); the
  sidebar then spans the whole run.
- One row per sidebar item, one cell of rich text per row (only the first cell is read).
- Factbox item: the first `h2`/`h3`/`h4` in the cell is immediately followed by a `ul`/`ol`. The
  heading renders as the factbox title; every other element of the cell goes into the factbox
  body, after the title.
- Any other item renders as sidebar rich text. Its `h2`/`h3` headings get the contact-details
  style (18px, rule under). In items with an `h2`, a bold-led paragraph after a plain one starts
  a new contact group (40px above).
- No options.

### AEM / Universal Editor

- Component "Sidebar" (no properties). Item component "Sidebar item", added/removed with the +
  button: *Rich text (a heading followed by a list renders as a factbox)* (richtext).
- Text items are editable inline in the canvas; factbox items are restructured by the block, so
  they are edited in the properties panel only.
- `tools/xwalk/convert.mjs` (`SHAPES.aside`) names each row `aside-item` so the importer reads the
  rows as items, not block properties. AEM renders one single-cell row per item, as on da.live.

## Behaviour

Each row becomes `.aside__text.text > .aside__body` or `.factbox.factbox--list >
.factbox__inner > (.factbox__heading, .factbox__list)` (panel grey, 30px light title, square
bullets). 20px between items.

- Placement: the section (`.aside-container`) sits in the grid's `aside-start / aside-end` column.
  After decorating, the block finds the start of its run (the previous section, then back over
  any `continued` sections) and sets `--aside-row` (1 + rendered sections before the run) and
  `--aside-span` (rendered sections in the run, at least 1) on its section, plus class
  `aside-placed`. Above 800px the section is placed at `grid-row: var(--aside-row) / span
  var(--aside-span)`, beside the run. Empty (`:empty`) sections are not counted.
- `<= 800px`: the section spans the single content column and simply follows the run in document
  order; the section before it keeps only `--row-extra` bottom margin.
- If the aside section is the first section, no placement is set.
- Static block: no interaction.

## Dynamic content

None.

## In the Universal Editor

Each row's markers move to its rendered item, so items can be selected, added, moved and removed;
a text item's cell markers move to `.aside__body` (inline editing). After each edit
`ue/scripts/ue.js` re-renders the block, which recomputes the placement. Adding or moving
sections reloads the page.

## Accessibility

- Rendered as plain `div`s: there is no `<aside>` element or `complementary` landmark.
- Headings keep their authored level. No roles or `aria-*` attributes.
- Images carry their authored alt text (imported content uses `alt=""`); links get the site link
  glyphs (`decorateLinks`).

## Deviations from the live site

- Markup only: the live contact column spaces its groups with `<br>` lines (24px); the authored
  content has none, so the same rhythm comes from margins (comment in `aside.css`).

## Acceptance checks

- On a page wider than 800px, the aside section's top aligns with the section it follows, in the
  right-hand column.
- On `/hsbc-uk/inclusion`, the aside spans the sections of its `continued` run
  (`--aside-span` > 1) and renders one text item (image + bold caption) and one `.factbox`.
- "Awards & Highlights" renders in `.factbox__heading`, its list in `.factbox__list`.
- On `/news-and-media`, "HSBC UK Media Relations" renders as an `h2` with a bottom rule.
- At 800px and below, the aside follows the primary content at full column width.
- A sidebar item with a heading followed by a paragraph is not a factbox.

## Files

`aside.js`, `aside.css`, `ue/models/blocks/aside.json`; `styles/styles.css` (page grid,
`continued`, `aside-container`); `scripts/site.js` (`moveInstrumentation`);
`tools/xwalk/convert.mjs` (`SHAPES.aside`).
