# Widget (`widget`)

A generic widget loader carried over from the boilerplate. It replaces a link to `/widgets/…`
with the HTML, CSS and JS of a widget kept in the code repository. It does not reproduce any
component of www.about.hsbc.co.uk. **It is unused.** This repository has no `/widgets/` folder,
and no page links to `/widgets/` or contains a Widget block (0 pages).

## Authoring

### da.live (document)

| Widget |
|---|
| [Widget](/widgets/example) |

- One cell: a link to `/widgets/<folder…>/<name>[.html][?key=value…]`. The block uses the first
  link (`a[href]`). Without a link the block throws a script error (not handled).
- Query parameters become `data-<key>` attributes on the widget element.
- Options: none.
- Auto-block: any link whose `href` contains `/widgets/` (outside a Widget block) becomes a Widget
  block (`buildWidgetAutoBlocks` in `scripts/scripts.js`). If the link is the only content of its
  paragraph, the whole paragraph is replaced. Otherwise only the link is replaced.

### AEM / Universal Editor

- Component "Widget" (`ue/models/blocks/widget.json`) has no fields. It is not in the section +
  menu (`NOT_ADDABLE` in `tools/ue/models.py`, "no widget exists yet"). Existing instances would
  show in the content tree only.
- `tools/xwalk/convert.mjs` has no shape for it.

## Behaviour

For a link `/widgets/a/b/name.html?x=1`, the block:

1. Adds the class `name`, removes the class `block`, and sets `data-source` (the link URL) and
   `data-x="1"`. It renames the `.widget-wrapper` and `.widget-container` section classes to
   `name-wrapper` and `name-container`.
2. Fetches `<codeBasePath>/widgets/a/b/name.html` into the block (replacing the link).
3. Loads `/widgets/a/b/name.css`, then imports `/widgets/a/b/name.js` and awaits its default
   export with the widget element.

The folder is taken from the path segments after the first one, so `/widgets/` must be the first
segment of the path. Interaction is whatever the widget's JS implements. `widget.css` only sets
`display: block`.

## Dynamic content

- Source: the widget's `.html`, `.css` and `.js` files from the code base, loaded when the block
  loads.
- Error: a failure in any step is logged (`failed to load widget …`). The response status is not
  checked, so the body of an error response is inserted into the block (not handled).
- No loading state.

## In the Universal Editor

No special handling in `ue/scripts/ue.js`. The widget renders as it does on the published page.

## Accessibility

Depends on the widget's own HTML and JS. The loader sets no roles or aria-* attributes.

## Deviations from the live site

None known (no live counterpart).

## Acceptance checks

- `grep -r "/widgets/" content` finds no page, and no `widgets/` folder exists (the block is
  unused).
- With a test widget `/widgets/demo.html|css|js`, a paragraph holding only a link to
  `/widgets/demo?mode=a` becomes `<div class="demo" data-mode="a" data-source="…">`, filled with
  `demo.html`.
- The section wrapper of that widget has class `demo-wrapper`, not `widget-wrapper`.
- The widget's `default(widget)` export runs once.
- A missing widget logs `failed to load widget` and leaves the page usable.

## Files

`widget.js`, `widget.css`, `ue/models/blocks/widget.json`; `buildWidgetAutoBlocks` in
`scripts/scripts.js`; `loadCSS` from `scripts/aem.js`; widget assets under `/widgets/` (none yet).
