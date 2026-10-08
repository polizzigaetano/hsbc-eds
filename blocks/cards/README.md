# Cards (`cards`)

The live long-form promo card grid (`.long-form-promo` in the 4-4-4, 6-6 and 3-3-3-3 layouts) of
www.about.hsbc.co.uk: the home page promos on `/`, the image-less row on `/hsbc-uk/inclusion`, and
the "latest news" and HSBC Group views rows on `/news-and-media`. Used on 3 pages of this site.

## Authoring

### da.live (document)

| Cards (halves, quarters, latest) |  |
|---|---|
| Picture (optional) | `## [Title](link)`, optional date paragraph, description |

- One row per card. Cell 1 (optional): the picture. Without it the card gets
  `long-form-promo--no-image` (text only, no overlap).
- Cell 2: an h2/h3/h4 heading carrying the link (if the heading has no link, the first link in the
  row is used). A row without heading or link is dropped.
- Optional date: a paragraph that is only a date such as `24 September 2026`; it renders bold above
  the description. Without it the card gets `long-form-promo--no-meta`.
- Every other paragraph is the description.
- Options: (none) one row of thirds (4-4-4); `halves` two per row (6-6), full container width;
  `quarters` four per row (3-3-3-3), full container width, meant for image-less cards; `latest`
  4-4-4 row whose authored cards are topped up from the query index.

### AEM / Universal Editor

- Component "Cards": *Options* multiselect (`halves`, `quarters`, `latest`) in the properties panel.
- Item component "Card", added/removed with the + button: *Image* (reference), *Alt text*, *Text*
  (richtext: title h2 with the link, optional date, description). The image is editable in the
  canvas; the text is restructured by the block, so it is edited in the properties panel.
- AEM renders the same two-cell rows as the da.live table.

## Behaviour

Each card becomes `.cards__item > .long-form-promo`: one link (`.long-form-promo__heading`) wraps
the image and the title, followed by the date and description (not linked). The title gets a red
chevron; an external target gets the external glyph, `rel="noopener"` and a hidden
"Opens in new window" instead. External links outside the live whitelist open the leaving-HSBC
confirmation (`scripts/leaving-confirmation.js`).

- Hover/focus on the card link underlines the title.
- Grid breakpoints: default `<= 1080px` one column; `quarters` `<= 1080px` three columns with every
  4n+1 card full width, `<= 800px` one column; `halves` `<= 800px` one column.
- Card container query `<= 400px`: text no longer overlaps the image; `<= 640px` smaller headings.
- No timers or scripted interaction.

## Dynamic content

`latest` only, and only when at least one authored card renders. Authored cards render first; then
`fetchArticles()` (`scripts/site.js`) reads `/query-index.json` (rows under `/news-and-media/` with a
parseable `date` / `publication-date`, newest first). Articles not already shown (by path) and newer
than the newest authored card date are prepended, and the grid is cut back to the authored count
(3 on `/news-and-media`). Index cards use the index `title`, `image` (skipped when it is
`default-meta-image`; empty alt), long date ("24 September 2026") and `description`. Index
unavailable, empty or with nothing newer: the authored cards stay.

## In the Universal Editor

Cards keep their item markers on `.cards__item`, so they can be selected, moved and removed. A card
added with + is not rendered until its text holds a heading with a link (rows without one are
dropped), so select it in the content tree. After each edit `ue/scripts/ue.js` re-renders the
block. The `latest` top-up also runs in the editor; index cards are not content.

## Accessibility

- One link per card, named by the heading text (plus "Opens in new window" when external).
- Glyphs are `aria-hidden`.
- Images sit inside the link next to the heading: decorative alt (`alt=""`) is appropriate.
- Keyboard: one Tab stop per card plus any links in the description.

## Deviations from the live site

None known.

## Acceptance checks

- `/` renders the `halves` grid with 6 cards, two per row at 1440px.
- `/hsbc-uk/inclusion` renders `quarters` cards with `long-form-promo--no-image`.
- Each card's image and title sit inside one `a.long-form-promo__heading`; the description does not.
- A card linking to another host shows the external glyph and "Opens in new window".
- A card with a `24 September 2026` paragraph shows it in `.long-form-promo__date`.
- `/news-and-media` `latest` shows exactly as many cards as authored (3); newer index articles come
  first, then the authored cards in authored order.
- With `/query-index.json` returning 404, `latest` shows the authored cards.

## Files

`cards.js`, `cards.css`, `ue/models/blocks/cards.json`; `scripts/site.js` (`isExternal`,
`fetchArticles`, `formatDate`, `parseDate`, `pathOf`, `moveInstrumentation`); `scripts/aem.js`
(`createOptimizedPicture`).
