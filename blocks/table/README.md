# Table (`table`)

The live rich-text data table (`.inline-table` / `.inline-table-wrapper`) of
www.about.hsbc.co.uk, used in news articles for rates, statistics and branch lists (e.g.
`/news-and-media/great-block-sports-fans-urged-to-make-use-of-their-in-app-gambling-freeze-feature`).
Used on 24 pages of this site (35 tables: 31 `header`, 4 plain, none with `caption`).

## Authoring

### da.live (document)

| Table (caption, header) |  |  |
|---|---|---|
| Caption text (`caption` only) |  |  |
| Column heading | Column heading | Column heading |
| Cell | Cell | Cell |

- One row per table row, one cell per column. Cells are rich text (paragraphs, bold, links,
  images). A data table, so it may have more than four columns (up to 8 on AEM, see below).
- Rows may have different cell counts; each row renders exactly the cells it has. Empty cells
  inside a row are kept.
- Option `caption`: the first row's **first cell** becomes the `<caption>` (navy bar); any other
  cells of that row are discarded.
- Option `header`: the first remaining row (the row after the caption, if any) becomes the
  `<thead>` row of `<th scope="col">`. Only one header row is supported.
- Without options, every row is a body row of `<td>`.
- Not handled: `rowspan` / `colspan`, row headers (`<th>` in body rows), several header rows.
  Example: on the gambling-freeze article the live title row "EURO 24 - …" spans 6 columns
  (`colspan="6"`) and the column titles are a second `<thead>` row; here the title is a single
  `<th>` and the column titles render as a body row.

### AEM / Universal Editor

- Component "Table": properties panel field *Options* (multiselect: "First row is the caption" =
  `caption`, "Header row" = `header`).
- Item component "Table row", added/removed with the + button: fields *Column 1* … *Column 8*
  (`cell1`–`cell8`, richtext). Cells are editable inline in the canvas.
- AEM renders all 8 model columns for every row. When every row of the block has exactly 8
  cells, the block drops each row's trailing empty cells (keeping at least one), so a row keeps
  its authored length. A cell counts as empty when its text is blank after `trim()` and it holds
  no `img`, `picture` or `a`.
- `tools/xwalk/convert.mjs` (`SHAPES.table`) puts a zero-width space into cells authored empty at
  the end of a row, so they survive this trimming.
- Branch `xwalk-full-migration` changes this: the marker is stored as `&nbsp;`, and `isEmpty`
  only strips ASCII whitespace so a non-breaking space keeps the cell. On `main`, `trim()` also
  strips `&nbsp;`, so an `&nbsp;`-only trailing cell is dropped.

## Behaviour

Renders `div.inline-table-wrapper > table` (optional `caption`, optional `thead`, `tbody`); the
authored rows are replaced.

- Full width of the column; rows panel grey, header row rule grey; cells padded
  `10px 10px 10px 20px` with a bottom rule, left aligned, baseline aligned; header cells bold.
- Wide tables scroll horizontally inside the wrapper (`overflow-x: auto`); the table is not
  restacked on small screens.
- Caption: navy `#3e505d` bar, white 30px light type; `<= 640px` 24px regular.
- Static block: no interaction.

## Dynamic content

None.

## In the Universal Editor

Rows and cells keep their editor markers (`moveInstrumentation` onto `tr` and `td`/`th`), so rows
can be selected, added, moved and removed, and cells are edited inline. The caption row's markers
are not moved to the `<caption>`, so with `caption` the first row is not selectable in the
canvas. After each edit `ue/scripts/ue.js` re-renders the whole block.

## Accessibility

- A real `<table>`; header cells are `<th scope="col">`; the caption is a `<caption>` element.
- No row headers, no `aria-*` attributes. The scroll wrapper is not focusable, so a wide table
  cannot be scrolled with the keyboard alone.
- External and document links in cells get the site link glyphs (`decorateLinks`).

## Deviations from the live site

None known (deliberate). See the not-handled spans and multi-row headers above.

## Acceptance checks

- A `table header` block renders one `thead tr` whose cells are `th[scope="col"]`.
- A plain `table` block renders no `thead`; all rows are in `tbody`.
- With `caption`, `table > caption` holds the first row's first-cell content.
- A row authored with fewer cells renders that many `td` (no padding cells added).
- On AEM, a row with cells 1–3 filled renders 3 cells, not 8.
- A table wider than the viewport scrolls inside `.inline-table-wrapper`, not the page.
- At `<= 640px` the caption font size is 24px.

## Files

`table.js`, `table.css`, `ue/models/blocks/table.json`; `scripts/site.js`
(`moveInstrumentation`); `tools/xwalk/convert.mjs` (`SHAPES.table`).
