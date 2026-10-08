# Search (`search`)

The site search box and results list of the www.about.hsbc.co.uk `/search` page. It is an
interim, client-side version. Results come from this site's query index and replace the live
server-side search. Used on 1 page (`/search`), which the header search forms submit to.

## Authoring

### da.live (document)

| Search |
|---|
| Search |
| No results found. Please try a different search term. |

- Row 1: the field label, which is also the placeholder and the submit button title. If it is
  empty, the field has no placeholder and its label is empty.
- Row 2: the no-results message. If it is empty, nothing is shown when no page matches.
- Each row uses the cell's first paragraph, or the cell itself when it holds bare text (as on
  the published `/search`). Further rows are ignored.
- Options: none.

### AEM / Universal Editor

- Component "Search": "Field label / placeholder" (`label`) and "No-results message" (`empty`),
  both text fields, one row each.
- `tools/xwalk/convert.mjs` has no shape for this block. On AEM the rows are the same as in da.live.

## Behaviour

The block renders `form.search-box__inner` (search field and a black 48px button with the search
glyph, up to 580px wide), then `.search-results` with the no-results message and `ul.search__results`.

- Query: from `?q=` (the header forms) or `?query=` (the live results page form). The query is
  trimmed and filled into the field. The form submits `GET` to the current path as `q`.
- Matching: the query is split on whitespace and lowercased. A page matches when every word
  occurs (as a substring) in its title or description. Pages whose `robots` contains `noindex`
  are left out.
- Order: first by the number of query words in the title, then newest `date` first.
- Each result shows the title as a link to the page path (the path if there is no title), the
  date as "17 June 2021" when the page has one, and the description when present.
- No query: only the form is shown. A query with no matches: the no-results message.
- No result limit, pagination, highlighting or result count.

## Dynamic content

- Source: `/query-index.json`, through `fetchIndex()` in `scripts/site.js`. Pages are fetched 500
  rows at a time until `total` is reached. The result is cached for the page view. The index
  only covers published pages of this site (fields: `path`, `title`, `description`, `date`,
  `robots`).
- It loads only when there is a query.
- Loading: no indicator. The list stays empty until the index arrives.
- Error: if the index cannot be loaded, the result is empty, so the no-results message shows.

## In the Universal Editor

- `moveInstrumentation()` moves each row's markers onto the element that renders it (the label
  inside the visually hidden `<label>`, the message inside `.search__empty`).
- In the canvas, the label is visually hidden. The message only shows for a query with no
  matches. Edit both fields in the properties panel, unless you open the page with such a query.
- No other editor-specific rendering.

## Accessibility

- `role="search"` on the form. The field (`#search-body`, `type="search"`) has a `<label>` that
  is visually hidden (`.a11y`).
- The submit button's accessible name comes from its `title` (row 1). The glyph is `aria-hidden`.
- Results are a list of links. There is no live region, so updates are not announced. Focus is
  not moved.

## Deviations from the live site

- The live site searches on the server. Here the search runs in the browser over the query index
  (title and description only, this site only), as an interim (see the header comment of
  `search.js` and `stardust/dynamic-features.md` row 1).

## Acceptance checks

- `/search` without parameters shows the form and no results or message.
- `/search?q=inclusion` lists `/hsbc-uk/inclusion`, with title and description.
- `/search?query=inclusion` gives the same results, and the field shows "inclusion".
- `/search?q=zzzzqqq` shows "No results found. Please try a different search term."
- With two words, every result contains both words in its title or description.
- Results with a title match come before description-only matches. Ties are ordered newest first.
- Submitting the form reloads the page with `?q=<text>`.
- The header search (desktop and tray) lands here with the query applied.

## Files

`search.js`, `search.css`, `ue/models/blocks/search.json`; `fetchIndex`, `parseDate`,
`formatDate`, `moveInstrumentation` in `scripts/site.js`; `/query-index.json`; the
`/search` document.
