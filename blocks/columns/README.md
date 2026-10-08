# Columns (`columns`)

The live multi-column layouts of inline images and rich text (`.layout--6-6` / `.layout--3-3-6`
with `.inline-image` + `.text`) of www.about.hsbc.co.uk: "Our headquarters" / "Our CEO" on the home
page (`/`) and the before/after image grid on
`/news-and-media/hsbc-uks-lincoln-branch-re-opens-after-major-facelift`. Used on 2 pages of this
site (3 blocks: 2 default, 1 `layout-3-3-6`).

## Authoring

### da.live (document)

| Columns (layout-3-3-6) |  |
|---|---|
| Picture, h2, paragraphs … | Picture, h2, paragraphs … |

- One row; one cell per column. Each cell holds pictures and rich text in reading order.
- Only the first row is read: further rows are discarded.
- Inside a cell, a child that contains a picture/image and no text (e.g. `<p><picture>`) becomes
  an image frame (`.inline-image`); consecutive other children (headings, paragraphs, lists,
  paragraphs mixing an image with text) are grouped into one `.text` box, in order.
- Default layout: two equal columns. Any number of cells is accepted, but the grid always has two
  tracks, so a third cell wraps to a new grid row and a single cell takes half the width (as on
  the Lincoln article's last image).
- Option `layout-3-3-6`: two narrow columns (23.73% each) and one wide one. Example: the Lincoln
  article's "Before:" / "After:" image stacks (two cells; the wide third track stays empty).

### AEM / Universal Editor

- Component "Columns". On AEM this is the core columns component
  (`core/franklin/components/columns/v1/columns`); properties panel: *Columns* (number, default 2),
  *Rows (AEM)* (number, default 1) and *Options* (multiselect: "3-3-6 layout (two narrow, one
  wide)" = `layout-3-3-6`). Cell content is AEM's text, image, title and button components (filter
  `column`).
- On da.live the editor uses the "Columns row" / "Column" items (`columns-row`, `columns-cell`);
  a column accepts text and image components.
- *Rows (AEM)* above 1 creates rows the block does not render (only the first row is used).

## Behaviour

Renders `.columns__layout` (CSS grid) with one `.columns__col` per cell; the block also gets the
class `columns-<n>-cols` (no CSS uses it). The section spans the full content width (primary and
secondary columns) instead of the 9-column primary column. Images are full column width, auto
height; image frames and text boxes have 20px bottom margins.

- Default: 2 equal tracks, gap 1.695%. `<= 800px`: one column, 40px between columns.
- `layout-3-3-6`: `<= 1080px` three equal tracks; `<= 800px` two tracks (gap 2.564%) with the
  first column spanning both (20px below it); `<= 560px` one column, 20px between.
- Static block: no interaction.

## Dynamic content

None.

## In the Universal Editor

The row's markers move to `.columns__layout` and each cell's to its `.columns__col`, so columns can
be selected, added and removed; the text and image components inside keep their own markers and
are moved (not copied) into the frames, so they stay editable inline. After each edit
`ue/scripts/ue.js` re-renders the whole block.

## Accessibility

- No roles or `aria-*` attributes; headings and reading order are the authored ones.
- Images carry their authored alt text (the imported content uses `alt=""`, decorative).
- Links get the site link glyphs (`decorateLinks`).

## Deviations from the live site

None known.

## Acceptance checks

- On `/`, the block renders two `.columns__col`, each with one `.inline-image` and one `.text`
  holding the h2 ("Our headquarters" / "Our CEO").
- Above 800px the two home columns sit side by side; at 800px and below they stack.
- On the Lincoln article, `columns layout-3-3-6` renders "Before:" / "After:" text above three
  image frames per column.
- At 900px wide, the `layout-3-3-6` columns use three equal tracks; at 700px the first column
  spans the full width.
- A second authored row does not render.

## Files

`columns.js`, `columns.css`, `ue/models/blocks/columns.json`; `scripts/site.js`
(`moveInstrumentation`).
