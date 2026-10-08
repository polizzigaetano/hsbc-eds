# Header (`header`)

The fixed page chrome of www.about.hsbc.co.uk: skip link, black divisions bar with search, the
primary bar with the HSBC logo and primary navigation (with the "doormat" dropdown), and the
off-canvas tray below 960px. Loaded on every page (295 content pages) from the `/nav` document.

## Authoring

### da.live (document)

The header is not authored as a block table. `scripts/aem.js` `loadHeader()` builds it, and it
loads the `/nav` document (or the path in the page's `nav` metadata) as a fragment. `/nav` has
three sections, in this order:

```
section 1  <p><a href="/"><picture>(HSBC logo, alt "HSBC")</picture></a></p>
---
section 2  - [HSBC UK](/)
               - [Postcode lending data](/hsbc-uk/postcode-lending-data)   (nested list)
               - [Inclusion](/hsbc-uk/inclusion) …
           - [News and media](/news-and-media)
           - [Management team](/management-team)
           - [History](/history-timeline)
---
section 3  - [Personal](https://www.hsbc.co.uk/)
           - [Business](https://www.business.hsbc.uk/en-gb)
```

- Section 1 (brand): the header uses the section's first link. If the section has no link, the
  first picture/image is wrapped in a link to `/`. The image is sized 134×26 (86×22 below 960px)
  and loads eagerly.
- Section 2 (primary): the header uses the first list. Each item needs a link (`li > a`,
  `li > p > a`, optionally inside `strong`). Items without a link are dropped. An item with a
  nested list (`li > ul`) gets a doormat: the item's link as its heading, then the nested links.
- Section 3 (divisions): the first list of links.
- If a section is missing, its part of the header is empty. Extra sections are ignored.
- Page metadata `nav` sets another nav document path.

### AEM / Universal Editor

- Component "Header" (`ue/models/blocks/header.json`) has no fields. It is not in the section +
  menu (`NOT_ADDABLE` in `tools/ue/models.py`).
- On AEM, `/content/hsbc-eds/nav` holds an Image component (logo, no link; the header links it
  home), then two Text components with the lists. `tools/xwalk/convert.mjs` unlinks the logo
  and rewrites internal links to `/content/hsbc-eds/...` paths.
- The AEM page model (`ue/models/page.json`) has no `nav` field, so the override is da.live only.

## Behaviour

The header is `position: fixed` and 91px high on desktop (35px black bar + 56px primary bar),
49px below 960px. It does not change on scroll. The links in it get no external/download glyphs.

- Skip link: "Skip to: Main content" (→ `#main`). It slides in when it has focus (0.3s, none with
  reduced motion). `<main>` gets `id="main"` if it has no id.
- Current section: an item is current on its own page and on any page below one of its links
  (`/` never counts). A current item has a red 5px underline bar.
- Desktop (≥ 960px), doormat items:
  - Clicking the item link toggles its doormat and does not navigate. The doormat heading links
    to the item's page. Opening one doormat closes the others.
  - With a mouse (`(hover: hover) and (pointer: fine)`), hovering the item opens the doormat. It
    closes 200ms after the pointer leaves the item and its doormat. Clicking the link of a
    doormat that hover opened keeps it open. Leaving still closes it after 200ms.
  - A click outside the primary nav closes all doormats. Escape (focus inside the header) closes
    the open one and focuses its link.
- Desktop search: the black bar shows a search button. The field is moved off-screen (as on
  live). Submitting sends `GET /search?q=…`. With an empty field it opens `/search`.
- Below 960px, the black bar and primary list are hidden. A "Menu" toggle (label hidden ≤ 420px)
  opens the 276px off-canvas tray. The tray pushes the header, `main` and `footer` 276px right
  and locks page scroll.
  - Default view: search field (`/search?q=`, submits on Enter), the primary items, then the
    divisions. The current item has a red left bar and an underline.
  - Every primary item opens a sub-view, including items without nested links. The sub-view has
    the item name, a back button, the item as an overview link (underlined while you are in that
    section), then its nested links. Views slide in 0.3s (none with reduced motion).
  - Clicking the uncovered page (mask), Escape or the toggle closes the tray. Escape returns
    focus to the toggle.
- Crossing 960px closes the tray and all doormats.

## Dynamic content

`/nav` (or the `nav` metadata path) loads through `loadFragment()` when the header loads. If the
document is missing, the header shows only the skip link, toggle and search controls.

## In the Universal Editor

The header renders as it does on the published page on both hosts. It is outside `<main>`, so
`ue/scripts/ue.js` does not re-render it. To edit the navigation, open the `/nav` document in the
editor. The header picks up changes after a page reload.

## Accessibility

- `<nav aria-label="Main">` wraps toggle, logo and primary list. Search forms have `role="search"`
  and visually hidden labels ("Search").
- Doormat links have `aria-expanded` and `aria-controls="doormat-N"`. Closed doormats are
  `visibility: hidden`, so they cannot be reached with Tab.
- `aria-current="page"` is set on the current item link, doormat links and tray links.
- Tray toggle: `aria-expanded`, `aria-controls="nav-tray"`. Tray openers: `aria-expanded` and
  `aria-controls` for their sub-view. The back button has `aria-label="Back"`.
- When the tray opens, focus moves to the tray itself (`tabindex="-1"`), not to the search field
  (this avoids raising the phone keyboard). A sub-view moves focus to its back button, and Back
  returns focus to the opener. There is no focus trap.
- Icons are `aria-hidden`. The logo needs alt text ("HSBC") in `/nav`.

## Deviations from the live site

- Doormats also open on mouse hover (live: click only). This is a deliberate addition (see the
  comment in `header.js`).

## Acceptance checks

- At 1280px the header is 91px high, and an item with a nested list in `/nav` has a doormat.
- Clicking "HSBC UK" opens its doormat (`aria-expanded="true"`). A second click, Escape or a
  click elsewhere closes it.
- Hovering "HSBC UK" opens the doormat. Moving the pointer away closes it after about 200ms.
- On `/hsbc-uk/inclusion`, "HSBC UK" has `primary-nav__item--current`, and the Inclusion link has
  `aria-current="page"`.
- At 375px, "Menu" opens a 276px tray. Focus is on `#nav-tray`, and `<html>` has `nav-tray--open`.
- In the tray, an item opens its sub-view (overview link first). Back returns to the default view.
- Clicking the mask or pressing Escape closes the tray.
- Tab on page load shows "Skip to: Main content", which targets `#main`.
- Page metadata `nav: /some-nav` loads `/some-nav.plain.html` instead of `/nav.plain.html`.

## Files

`header.js`, `header.css`, `ue/models/blocks/header.json`; `blocks/fragment/fragment.js`
(`loadFragment`); the `/nav` document; `/icons/search.svg`, `menu.svg`, `chevron-left-small.svg`,
`chevron-right-small.svg`; `.a11y`, the `.icon--*` glyphs and `--nav-height` in
`styles/styles.css`.
