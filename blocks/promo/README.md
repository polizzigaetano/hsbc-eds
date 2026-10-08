# Promo box (`promo`)

A grey box of rich text (usually a customer case study) inside an article. It reproduces the live
`.promo` box nested in the article text of www.about.hsbc.co.uk, e.g.
`/news-and-media/uk-firms-expect-focus-on-sustainability-to-deliver-growth`. Used on 4 pages of
this site.

## Authoring

### da.live (document)

| Promo |
|---|
| [heading 2] · paragraphs |

- One cell of rich text: optionally a heading (2 of the 4 instances start with an `h2`, one with a
  bold paragraph), then paragraphs.
- All element content of every row and cell is kept, in order; it is styled as the site's
  editorial rich text (`.text`).
- Options: none.

### AEM / Universal Editor

- Component "Promo box" — one field `text` (rich text, "Content (heading + paragraphs)").
- The text is edited **inline in the canvas** (the block moves the cell's editor markers onto the
  rendered `.text` element).
- AEM renders the same single-cell shape.

## Behaviour

Renders one `.text` element holding the authored content inside the block.

- Box: `#d7d8d6` (`--c-rule`) background, padding 32px 20px, no margin of its own (spacing comes
  from the section).
- Content uses the editorial rich-text rules of `styles/styles.css` (`.text` paragraphs, `h2`,
  lists, links); the `.text` bottom margin is removed inside the box.
- External and download links get the site link glyphs (`decorateLinks`, outside the editor only).
- Static block: no interaction.

## Dynamic content

None.

## In the Universal Editor

Rendered as on the published page and editable inline. Changes are re-rendered by
`ue/scripts/ue.js` from the editor's response (page reload as fallback). The link glyph
decoration is off in the editor.

## Accessibility

- No roles or aria attributes are added; headings keep their authored level.
- The box is a visual grouping only; it is not announced as a separate region.

## Deviations from the live site

None known.

## Acceptance checks

- The block contains exactly one child, `.text`, holding the authored elements in order.
- The block background is `rgb(215, 216, 214)` with 32px 20px padding.
- An authored `h2` keeps its id and level inside the box.
- The last paragraph adds no extra bottom space inside the box (`.text` margin is 0).
- In the editor, the `.text` element carries the `data-aue-*` markers of the cell.

## Files

`promo.js`, `promo.css`, `ue/models/blocks/promo.json`; `scripts/site.js`
(`moveInstrumentation`), `styles/styles.css` (`.text` rich-text rules).
