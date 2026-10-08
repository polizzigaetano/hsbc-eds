# Hero (`hero`)

The full-bleed banner image band at the top of a page; it reproduces the live
`.layout--full > .header-area > .header-area__image` of www.about.hsbc.co.uk (for example on
`/hsbc-uk/inclusion` and every `/news-and-media/*` article). Used on 291 pages of this site.

## Authoring

### da.live (document)

| Hero |
|---|
| banner picture |

- One row, one cell: the banner picture. The source images are 1520x400.
- Alt text: 287 of the 291 banners have an empty alt (decorative); 4 article banners carry a description.
- Only the first `<picture>` (or bare `<img>`) is used; any other cell content is discarded.
- An empty cell renders an empty band of the same height (no placeholder).
- Options: none.

### AEM / Universal Editor

- Component "Hero (banner)" — fields `image` ("Banner image (1520x400)", asset reference) and
  `imageAlt` ("Alt text").
- The image is edited inline in the canvas; the alt text in the properties panel.
- AEM renders the same single-cell shape (the alt field is written to the `<img>`).

## Behaviour

Renders `.header-area > .header-area__image > picture`. The section (`.hero-container`) spans the
full viewport grid (`full-start / full-end`).

- The band is `height: 0; padding-bottom: 22.5694%` of its width with `overflow: hidden`: the image
  is 100% wide and the part below the band (the 1520x400 image is 26.3% tall) is cropped.
- 31px margin below the band; 0 at `width <= 640px`.
- `width >= 1920px`: the image is capped at 2000px and centred.
- The banner `<img>` is set to `loading="eager"` and `fetchpriority="high"` (it is the LCP image).
- Pages without a hero section get 20px of top padding on `main` instead (`styles/styles.css`).
- Static block: no interaction.

## Dynamic content

None.

## In the Universal Editor

Rendered exactly as on the published page. After each change `ue/scripts/ue.js` re-renders the block
from the editor's response (page reload as fallback). No editor-specific rendering.

## Accessibility

- No roles or aria attributes are added.
- Banners are decorative by default (`alt=""`); give the alt text only when the image carries
  meaning not repeated in the page heading.
- Links inside the hero are excluded from the site link decoration (`decorateLinks` in `scripts/site.js`).

## Deviations from the live site

None known.

## Acceptance checks

- The block renders `.header-area > .header-area__image` containing the authored picture.
- At 1440px viewport the band is 325px tall (22.57% of the width) and crops the image bottom.
- The banner `<img>` has `loading="eager"` and `fetchpriority="high"`.
- The section spans the full viewport width, outside the 1180px content column.
- Below the band there is 31px spacing at desktop and none at `width <= 640px`.
- At `width >= 1920px` the image is at most 2000px wide and centred.
- An authored empty alt stays empty.

## Files

`hero.js`, `hero.css`, `ue/models/blocks/hero.json`; `styles/styles.css` (section grid and the
no-hero padding), `scripts/site.js` (`decorateLinks` exclusion).
