# Factbox (`factbox`)

A light-grey box of facts (optional heading, then text or a bulleted list) inside an article. It
reproduces the live `.factbox.factbox--list` of www.about.hsbc.co.uk, on
`/news-and-media/great-block-sports-fans-urged-to-make-use-of-their-in-app-gambling-freeze-feature`.
Used twice on 1 page of this site.

## Authoring

### da.live (document)

| Factbox |
|---|
| [heading] · paragraphs or a list |

- One cell. The first `h2`, `h3` or `h4` in the block becomes the box heading (optional; neither
  current instance has one).
- Everything else in the cell(s) follows as the box body, in order. The current instances are a
  single text paragraph with line breaks; bare text in a cell is wrapped in a `<p>` by the page
  decoration before the block runs.
- Options: none (the block always adds `factbox--list`, the live modifier).

### AEM / Universal Editor

- Component "Factbox" — one field `text` (rich text, "Content (optional heading, paragraphs or a
  list)").
- The text is edited in the **properties panel**; the block restructures its content, so the canvas
  is not inline-editable.
- AEM renders the same single-cell shape.

## Behaviour

Renders `.factbox__inner` (padding 29px 28px 25px) with an optional `.factbox__heading` and a
`.factbox__list` body.

- Box: `#ededed` (`--c-panel`) background, black text, 20px below.
- Heading: light font, 30px, line-height 1, -0.04em tracking, 20px below.
- Body paragraphs: `-4px 0 15px` margins (none after the last); lists use square bullets, 18px
  indent, 11px between items, line-height 1.5.
- Static block: no interaction.

## Dynamic content

None.

## In the Universal Editor

Rendered as on the published page. Edits in the properties panel are re-rendered by
`ue/scripts/ue.js` from the editor's response (page reload as fallback).

## Accessibility

- No roles or aria attributes are added; the heading keeps its authored level.
- The box is a visual grouping only; it is not announced as a separate region.

## Deviations from the live site

None known.

## Acceptance checks

- The block has class `factbox--list` and one child, `.factbox__inner`.
- A cell `h2` + `ul` renders `.factbox__heading > h2` then `.factbox__list > ul`.
- Without a heading there is no `.factbox__heading`.
- Bare text with `<br>` line breaks renders as one paragraph inside `.factbox__list`.
- The background is `rgb(237, 237, 237)`; list items show square bullets.

## Files

`factbox.js`, `factbox.css`, `ue/models/blocks/factbox.json`.
