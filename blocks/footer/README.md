# Footer (`footer`)

The black utility footer of www.about.hsbc.co.uk: a row of utility links (Accessibility, Privacy
notice, Terms of use, Cookie notice, Contact and support) and the copyright line. Loaded on every
page (295 content pages) from the `/footer` document.

## Authoring

### da.live (document)

The footer is not authored as a block table. `scripts/aem.js` `loadFooter()` builds it, and it
loads the `/footer` document (or the path in the page's `footer` metadata) as a fragment:

```
section 1  - [Accessibility](/accessibility)
           - [Privacy notice](https://www.about.hsbc.co.uk/privacy-notice)
           - [Terms of use](…)  - [Cookie notice](…)  - [Contact and support](https://www.hsbc.co.uk/help/)
---
section 2  © HSBC Group 2026. All rights reserved
```

- Links: the footer uses the first list (`ul`) in the document. A link wrapped in a paragraph
  (`li > p > a`) is unwrapped. Other lists are ignored.
- Copyright: the first paragraph that is not inside a list.
- Anything else in the document (headings, more paragraphs, images) is not rendered.
- If there is no list or no paragraph, that part is left out.
- Page metadata `footer` sets another footer document path.

### AEM / Universal Editor

- Component "Footer" (`ue/models/blocks/footer.json`) has no fields. It is not in the section +
  menu (`NOT_ADDABLE` in `tools/ue/models.py`).
- On AEM, `/content/hsbc-eds/footer` holds the same two sections as Text components.
  `tools/xwalk/convert.mjs` rewrites links to site pages into `/content/hsbc-eds/...` paths.
- The AEM page model (`ue/models/page.json`) has no `footer` field, so the override is da.live only.

## Behaviour

The footer renders as `.footer__utility` > `.footer__inner`. Inside are a
`<nav class="footer__utility__nav">` with the floated link list, and `.footer__copyright`.

- Desktop: the links float left with 20px gaps, and the copyright floats right.
- At 959px and below, the copyright moves under the links, on the left.
- At 640px and below, the line height drops to 1.34.
- Footer links get no external/download glyphs (`decorateLinks` skips `footer`). The site-wide
  leaving dialog (`scripts/leaving-confirmation.js`) still handles external links that are not on
  the whitelist, such as "Contact and support". Links to `www.about.hsbc.co.uk` count as this site.
- Static block: no interaction of its own.

## Dynamic content

`/footer` (or the `footer` metadata path) loads through `loadFragment()` when the footer loads,
after the page sections. If the document is missing, the footer renders as an empty black bar.
The footer stays `visibility: hidden` until the block has loaded (`styles/styles.css`).

## In the Universal Editor

The footer renders as it does on the published page on both hosts. It is outside `<main>`, so
`ue/scripts/ue.js` does not re-render it. To edit it, open the `/footer` document in the editor.
The page footer picks up changes after a page reload. The leaving dialog is off in the editor.

## Accessibility

- The link list is wrapped in `<nav aria-label="Footer">`.
- Link text comes from the document. The footer generates no text.

## Deviations from the live site

None known.

## Acceptance checks

- Every page has a black footer with the five utility links and the copyright line.
- The links are in `nav.footer__utility__nav[aria-label="Footer"]`, and each `li` has class
  `footer__item`.
- At 1280px the copyright is on the right of the links. At 768px it is below them, on the left.
- Changing the copyright in `/footer` and publishing it updates every page.
- Page metadata `footer: /some-footer` loads `/some-footer.plain.html`.
- "Contact and support" opens the "You are leaving about.hsbc.co.uk" dialog (once the
  `/fragments/leaving-hsbc` fragment is published).

## Files

`footer.js`, `footer.css`, `ue/models/blocks/footer.json`; `blocks/fragment/fragment.js`
(`loadFragment`); the `/footer` document.
