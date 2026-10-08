# Share bar (`share`)

The live share bar (`.share-actions`) of www.about.hsbc.co.uk: a dark "Share" label and X /
Facebook / LinkedIn intent links, positioned over the top-right of the page banner (e.g.
`/management-team`, every news article). Used on 239 pages of this site.

## Authoring

### da.live (document)

| Share |
|---|
| Share |
| [Share link to this page on X](http://twitter.com/intent/tweet?url={URL}) |
| [Share link to this page on Facebook](https://www.facebook.com/sharer/sharer.php?u={URL}) |
| [Share link to this page on LinkedIn](http://www.linkedin.com/shareArticle?mini=true&url={URL}&title={title}) |

- Place the block at the top of the first section after the banner (as on `/management-team`,
  before the page description).
- Label: the first paragraph without a link ("Share"). Optional; without it no label renders.
- Links: every paragraph with a link becomes one item, in order; only the first link of a
  paragraph is used. The link text is the screen-reader label.
- In the href, `{URL}` (the page URL) and `{title}` (the document title) are filled in at
  runtime, URL-encoded; the encoded forms `%7BURL%7D` / `%7Btitle%7D` (as stored in the
  published content) work too, case-insensitively.
- The network is derived from the href host: `twitter.com` or `x.com` → X icon (item class
  `--twitter`), `facebook.com` → Facebook, `linkedin.com` → LinkedIn. Any other link gets the
  generic share icon and no modifier class.
- No options.

### AEM / Universal Editor

- Component "Share bar" (a single block, no items): *Label* (text), *X link ({URL} = this page)*,
  *Facebook link ({URL} = this page)*, *LinkedIn link ({URL}, {title})* (richtext). On da.live a
  new block starts with the three default links above.
- The label is editable inline in the canvas; the links are edited in the properties panel only.
- AEM renders one row per field (label, X, Facebook, LinkedIn), the same shape as the da.live
  table; links beyond these three cannot be added on AEM.

## Behaviour

Renders `.share-actions` = `.share-actions__label` (share icon + label) + `ul.share-actions__list`
of `li.share-actions__item` (60 x 61px white tiles, red icon, 1px divider between tiles).

- The wrapper has zero height; the bar is absolutely positioned 90px above the section top, at
  the right edge of the primary column: the label extends to the left, the tiles to the right.
- Links get the filled href, `target="_blank"` and `rel="noopener"`.
- Hover / focus on a tile: red background, divider hidden (the icon colour stays red); 0.3s
  transition, none with `prefers-reduced-motion: reduce`.
- `<= 480px`: the bar is in the flow, centred, 15px above the following content; the label is
  hidden.

## Dynamic content

`{URL}` / `{title}` are computed once at decoration from `window.location.href` and
`document.title`. Nothing is fetched.

## In the Universal Editor

The label cell's markers move to the label paragraph; the block itself stays selectable. Hrefs
in the canvas are the filled ones; the editor saves the authored source, not the rendered markup.
After each edit `ue/scripts/ue.js` re-renders the block.

## Accessibility

- Icons are `<i aria-hidden="true">`; each link's name is its authored text in a visually hidden
  `span.a11y` ("Share link to this page on X").
- Links are focusable and keyboard operable; focus shows the red tile. `decorateButtons`
  (`scripts/scripts.js`) also sets each link's `title` to its text.
- Links open a new window without announcing it; the site link glyphs are not applied
  (`decorateLinks` skips `.share`).

## Deviations from the live site

None known.

## Acceptance checks

- On `/management-team`, the bar renders a "Share" label and three items: `--twitter`,
  `--facebook`, `--linkedin`.
- No rendered href contains `{URL}`, `%7BURL%7D`, `{title}` or `%7Btitle%7D`.
- The Facebook href contains `u=` followed by the URL-encoded page URL.
- The LinkedIn href carries both the encoded URL and the encoded document title.
- Every share link has `target="_blank"` and `rel="noopener"`.
- At 480px wide or less the label is hidden and the tiles are centred in the flow.

## Files

`share.js`, `share.css`, `ue/models/blocks/share.json`; `styles/styles.css` (`.icon--x`,
`--facebook`, `--linkedin`, `--share`, `.a11y`); `icons/x.svg`, `facebook.svg`, `linkedin.svg`,
`share.svg`; `scripts/site.js` (`moveInstrumentation`).
