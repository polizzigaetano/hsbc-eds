# Carousel (`carousel`)

The live image carousel of www.about.hsbc.co.uk: slides of a picture with a dark caption overlay,
prev/next controls and a "1 / 3" counter, as on
`/news-and-media/hsbc-uk-to-open-new-branch-in-loughborough` (three historic branch photos).
Used on 1 page of this site.

## Authoring

### da.live (document)

| Carousel |  |
|---|---|
| Picture | Caption (optional heading + paragraphs) |

- One row per slide. Cell 1: the picture (if cell 1 is missing, the first picture in the row is
  used; a slide without a picture renders an empty frame).
- Cell 2 (optional): the caption. Plain text, paragraphs and an optional h2/h3 are kept as authored.
  An empty or missing caption cell renders no overlay.
- No options.

### AEM / Universal Editor

- Component "Carousel": no properties.
- Item component "Slide", added/removed with the + button: *Image* (reference), *Alt text*,
  *Caption* (richtext). The image and the caption are editable inline in the canvas.
- AEM renders the same two-cell rows as the da.live table.

## Behaviour

Rendered as a controls bar (Previous, current / total, Next) above a list of slides stacked in one
grid cell, so the block takes the height of the tallest slide. Slide 1 shows on load.

- Previous / Next buttons step one slide and wrap around (Next on the last slide shows slide 1,
  Previous on slide 1 shows the last).
- The counter and a visually hidden live region update to "n / total".
- A `carousel:show` event on the block (`detail.index`, 0-based) shows that slide; indexes wrap.
- No autoplay, no swipe, no keyboard arrow handling, no transition animation.
- Container query `<= 560px` (block width): the caption moves below the image on black instead of
  overlaying it.
- A single slide still shows the controls ("1 / 1").

## Dynamic content

None.

## In the Universal Editor

Slides keep their item markers on `li.carousel__slide` and the caption marker on
`.carousel__overlay-inner`, so slides can be selected, added, moved and removed. Inactive slides are
hidden and `inert`; selecting a slide (e.g. in the content tree, `aue:ui-select`) makes
`ue/scripts/ue.js` dispatch `carousel:show` so it becomes visible. After each edit the block is
re-rendered from the editor response and returns to slide 1. A new slide with an empty caption
still gets an (empty) overlay so the caption can be typed.

## Accessibility

- Block: `role="region"`, `aria-roledescription="carousel"` (no accessible name is set).
- Controls are `<button type="button">` with visually hidden "Previous Slide" / "Next Slide";
  chevron icons are `aria-hidden`.
- Inactive slides: `aria-hidden="true"` and `inert`; the active slide `aria-hidden="false"`.
- A polite live region announces "n / total" on every change (set to "1 / total" on load).
- Alt text: describe the photo; the caption carries credits and context.

## Deviations from the live site

None known.

## Acceptance checks

- The Loughborough article renders 3 slides with the counter "1 / 3" and slide 1 visible.
- Next shows slide 2 and the counter "2"; Previous on slide 1 shows slide 3.
- Exactly one slide has `data-state="active"`; the others are `aria-hidden="true"` and `inert`.
- Each slide shows its caption in `.carousel__overlay` (on the image at 1440px, below it at 360px).
- `block.dispatchEvent(new CustomEvent('carousel:show', { detail: { index: 2 } }))` shows slide 3.
- No slide changes without a click (no autoplay).

## Files

`carousel.js`, `carousel.css`, `ue/models/blocks/carousel.json`; `scripts/site.js`
(`moveInstrumentation`); `ue/scripts/ue.js` (reveal on selection).
