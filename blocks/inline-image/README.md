# Inline image (`inline-image`)

An image inside article text with an optional caption box, optionally floated so the following text
wraps around it. It reproduces the live `.inline-image` (and `.floating-container`) of
www.about.hsbc.co.uk article pages, e.g.
`/news-and-media/oh-sod-it-im-on-holiday-brits-spend-over-1000-on-foreign-holiday-extras`
(`right half`). Used 33 times on 30 pages of this site.

## Authoring

### da.live (document)

| Inline image (right, half) |
|---|
| picture · [caption paragraph(s)] |

- One cell: the picture, then optional caption paragraphs. Only the first picture is used.
- Caption: every paragraph without an image (23 of 33 instances have one). Lists, headings and
  other non-paragraph content are dropped. Without a caption only the image renders.
- Options (combine one float with one width):
  - `right` / `left` — floats the block wrapper right / left (35px gap to the text, 35px below,
    min-width 290px); the following content of the section wraps around it.
  - `half` / `third` — wrapper width 50% / 33% of the section.
  - `bottom-margin` — 20px below the block.
  - `vertical` — removes the 600px height crop (tall images show in full).
  - `infographic` — caption laid over the bottom of the image.
- In use: `right half` 7, `right third` 6, `left half` 1, `bottom-margin` 7, none 12; `vertical`
  and `infographic` are supported but not used by current content.

### AEM / Universal Editor

- Component "Inline image" — fields `classes` (multiselect "Options": Float right, Float left, Half
  width, Third width, Bottom margin, Uncropped (vertical), Caption over image), `image` (asset
  reference), `imageAlt` ("Alt text") and `text` (rich text, label "Picture and caption
  paragraph(s)").
- The image is edited inline in the canvas; the caption and the options in the properties panel.
- AEM shape (`SHAPES['inline-image']` in `tools/xwalk/convert.mjs`): one row with the image and a
  second row with the caption; `text` holds only the caption there.

## Behaviour

Renders `.inline-image__image` (the picture, `max-height: 600px`, cropped) and, when captioned,
`.inline-image__inner > .inline-image__content` (the caption box).

- Caption box: `#253038` background, max 514px wide, pulled 35px up over the image, padding
  25px 40px 18px; white uppercase 12px text, 12px between paragraphs.
- `width <= 1180px`: the caption box spans the width with 13px side margins.
- `width <= 800px`: floats are removed (full width, 35px below).
- `width <= 600px`: no overlap, padding 25px, text 16px.
- A section containing a `right`/`left` image becomes `display: flow-root` so it contains the float.
- `infographic`: the caption sits at the bottom of the image on a 70% black band (max 685px, 16px,
  not uppercase); when the block is `<= 560px` wide (container query) it moves below the image on
  black.
- Static block: no interaction.

## Dynamic content

None.

## In the Universal Editor

Rendered as on the published page. Changes are re-rendered by `ue/scripts/ue.js` from the editor's
response (page reload as fallback); floats apply in the canvas too.

## Accessibility

- No roles or aria attributes are added; the caption is plain paragraphs, not a `figcaption`.
- 30 of 33 images have an empty alt; add alt text when the image carries information.

## Deviations from the live site

None known.

## Acceptance checks

- A cell picture + `p` renders `.inline-image__image` and `.inline-image__content` with the `p`.
- A picture without caption renders no `.inline-image__inner`.
- `right half` at 1440px: the wrapper floats right at 50% width and the next paragraph wraps.
- At `width <= 800px` the same block is unfloated and full width.
- Without `vertical`, an image taller than 600px is cropped to 600px.
- The caption box overlaps the image by 35px above 600px viewport width, not below.
- `infographic` places the caption over the image on a translucent black band.

## Files

`inline-image.js`, `inline-image.css`, `ue/models/blocks/inline-image.json`;
`tools/xwalk/convert.mjs` (AEM row shape).
