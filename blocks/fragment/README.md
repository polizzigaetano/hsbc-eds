# Fragment (`fragment`)

Includes the content of another document (a fragment under `/fragments/`) in a page. It has no
counterpart component on www.about.hsbc.co.uk. It is the standard Edge Delivery fragment block
(block collection), with Universal Editor handling added. No local content page embeds a fragment
today. Notes to editors stay per article. `/fragments/notes-hsbc-uk` holds the current
boilerplate for new releases. `loadFragment()` also loads the header (`/nav`) and the footer
(`/footer`).

## Authoring

### da.live (document)

| Fragment |
|---|
| [/fragments/notes-hsbc-uk](/fragments/notes-hsbc-uk) |

- One cell: a link to the fragment path. Without a link, the block's text is used as the path.
- The path must be site-relative (`/…`). Absolute URLs (`https://…`) and `//…` are not loaded:
  the block keeps its authored link.
- Options: none.
- Auto-block: a link whose `href` contains `/fragments/` (outside a Fragment block) is inlined
  without a table (`buildAutoBlocks` in `scripts/scripts.js`). The link's pathname is loaded, and
  the link's parent element (normally its paragraph) is replaced by the fragment's sections.

### AEM / Universal Editor

- Component "Fragment": "Fragment path" (`url`, required, e.g. `/fragments/notes-hsbc-uk`) and
  "Link text" (`urlText`). Both are edited in the properties panel only, because the canvas shows
  the fragment's content and not the link.
- A new Fragment points to `/fragments/notes-hsbc-uk`.
- `tools/xwalk/convert.mjs` has no shape for this block. On AEM, internal links become
  `/content/hsbc-eds/...` paths. The fragments are converted as pages.

## Behaviour

`loadFragment(path)` fetches `<path>.plain.html` and rebases `./media_…` image and `srcset` URLs
to the fragment's folder. It then runs `decorateMain()` (auto-blocks, sections, blocks, buttons)
and loads the fragment's sections, blocks included.

- Published page, Fragment block alone in its section: the page section is replaced by the
  fragment's sections. The page section's own classes and style are dropped.
- Published page, Fragment block next to other content: the content of the fragment's sections
  is moved into the page section, in place of the block. The fragment's section classes are dropped.
- Links inside fragments get no external/download glyphs, because `decorateLinks()` only runs on
  a `main` that is attached to the page.
- Static block: no interaction.

## Dynamic content

- Source: `<path>.plain.html` on the current host, fetched when the block loads.
- Error: if the fetch fails (for example a 404, or a fragment that is not published), the block
  returns early and keeps its authored link. A failed auto-block is logged to the console, and
  the link stays.
- No loading state and no caching. Each instance fetches its fragment.

### Dialog fragments (dependency of `scripts/leaving-confirmation.js`)

`/fragments/leaving-hsbc` (external links outside the whitelist) and `/fragments/email-us`
(`mailto:` links) hold the copy of the live confirmation dialogs. Each has a heading, copy
paragraphs, a `#proceed` link paragraph and a `#cancel` link paragraph. They are fetched directly
(not through this block) on first use and cached. If a fragment cannot be loaded, the link opens
without a dialog. Keep both `#` links, and preview and publish the fragments.

## In the Universal Editor

On both hosts (`isUE()`), the Fragment block is not unwrapped. The fragment's sections render
inside the block, so the block keeps its editor markers, and its section can still be selected,
re-pointed or removed. After a change in the properties panel, `ue/scripts/ue.js` re-renders the
block and the fragment loads again. The fragment's own content is edited in its own document.
Auto-blocking still runs in the editor, so a bare `/fragments/` link in text is replaced by the
fragment content. Use the Fragment block when it must stay selectable.

## Accessibility

The block adds nothing. Headings, alt text and link text come from the fragment document. Check
that the fragment's heading levels fit the pages that include it.

## Deviations from the live site

None known.

## Acceptance checks

- A Fragment block linking `/fragments/notes-hsbc-uk` shows the "HSBC UK" / "HSBC Holdings plc"
  paragraphs, and no `.fragment` element remains on the published page.
- Alone in a section, the block's section is replaced by the fragment's section(s).
- With other content in the section, the fragment content appears in the block's place in that
  section.
- A paragraph holding only a `/fragments/…` link is replaced by the fragment content.
- A Fragment block pointing at a missing path keeps its link, and the page has no script error.
- In the Universal Editor, the fragment renders inside `.fragment[data-aue-resource]`.
- Images in a fragment load from the fragment's folder (`./media_` rebased).

## Files

`fragment.js` (exports `loadFragment`, the only cross-block import), `fragment.css` (empty),
`ue/models/blocks/fragment.json`; `buildAutoBlocks` in `scripts/scripts.js`; `isUE` in
`scripts/site.js`; `scripts/leaving-confirmation.js` (dialog fragments).
