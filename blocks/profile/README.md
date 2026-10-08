# Profile (`profile`)

The live executive-bio rows (`.exec-bio`) of www.about.hsbc.co.uk: one row per person on
`/management-team` (photo, name, position) and one row per year on `/history-timeline` (picture,
year, event title, story). Used on 2 pages of this site (3 and 19 rows).

## Authoring

### da.live (document)

| Profile |  |
|---|---|
| Picture (optional) | h2 name or year; position paragraph; bio paragraphs/lists |

- One row per profile.
- Cell 1 (optional): the picture. The block takes the first `picture` (or `img`) anywhere in the
  row. Without one the row renders text-only (`exec-bio__no-image`), as for several timeline years.
- Cell 2: rich text, read by element type, not by position in the cell:
  - Name: the first `h2` or `h3` in the row ("David Lindberg", "1836").
  - Position: the first `p`/`ul`/`ol` that holds no image ("CEO of HSBC UK Bank plc", "The
    Birmingham and Midland Bank opens for business"). It is always the position, so a profile
    without a position line shows its first bio paragraph in the position style.
  - Text: every following `p`/`ul`/`ol` (lists nested in a list item stay inside their list).
- Anything else in the row (a second heading, h4–h6, tables, blockquotes) is not rendered.
- No options.

### AEM / Universal Editor

- Component "Profiles" (no properties). Item component "Profile", added/removed with the +
  button: *Image* (reference), *Alt text* (text), *Name or year (h2), position (first paragraph),
  text* (richtext).
- The image is editable in the canvas; the text field is restructured by the block, so it is
  edited in the properties panel only.
- AEM renders the same two-cell rows as the da.live table (`tools/xwalk/convert.mjs` does not
  reshape this block).

## Behaviour

Each row becomes `.exec-bio` = `.exec-bio__image` (floated left) + `.exec-bio__copy` with
`.exec-bio__name` (36px thin), `.exec-bio__position` (23px bold) and
`.exec-bio__text.exec-bio__text--view-all` (the bio, always fully shown). Rows are separated by a
bottom rule (25px / 22px padding); the copy is indented 200px when there is an image.

- Container query on each row: when the row is `<= 560px` wide the image is hidden and the copy
  is not indented.
- Static block: no interaction (the live `--view-all` state; no read-more toggle).

## Dynamic content

None.

## In the Universal Editor

Each row's markers move to its `.exec-bio`, so profiles can be selected, added, moved and removed.
After each edit `ue/scripts/ue.js` re-renders the whole block.

## Accessibility

- The name keeps its authored heading level (`h2`/`h3`), so each profile is reachable by heading.
- No roles or `aria-*` attributes. The image is decorative or described by its alt text (the
  imported content uses `alt=""`; AEM: *Alt text* field). In narrow rows the image is
  `display: none`.
- Links in the bio get the site link glyphs (`decorateLinks`).

## Deviations from the live site

None known.

## Acceptance checks

- `/management-team` renders 3 `.exec-bio` rows, each with an image, an `h2` name and a position.
- `/history-timeline` renders 19 rows; rows without a picture have `exec-bio__no-image` and no
  200px indent.
- The 1836 row shows "The Birmingham and Midland Bank opens for business" in
  `.exec-bio__position` and the story paragraphs in `.exec-bio__text__inner`.
- With a row 560px wide or less, `.exec-bio__image` is not displayed.
- A row whose cell 2 has only an `h2` renders no position or text box.

## Files

`profile.js`, `profile.css`, `ue/models/blocks/profile.json`; `scripts/site.js`
(`moveInstrumentation`).
