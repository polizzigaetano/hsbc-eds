# Universal Editor (UE) for About HSBC UK

Content lives in da.live (Author Bus); the Universal Editor edits it through
`https://<branch>--hsbc-eds--polizzigaetano.ue.da.live/<path>` (open a page from da.live → *Open in UE*).
Reference: https://www.aem.live/docs/ew/developing/universal-editor and `aemsites/da-block-collection`.

## Files

| file | role |
|---|---|
| `ue/models/**` | per-block definitions, models and filters (generated from `tools/ue/models.py`) |
| `component-definition.json`, `component-models.json`, `component-filters.json` (root) | the bundles the editor reads |
| `ue/scripts/ue.js` | loaded by `scripts/scripts.js` only on `*.ue.da.live`: re-renders a block from the editor's response after each change (reload fallback); selecting an accordion item / carousel slide reveals it |
| `scripts/site.js` → `moveInstrumentation()`, `isUE()` | blocks move the `data-aue-*` markers from authored rows/cells to the elements they render |

## Changing a model

1. Edit `tools/ue/models.py`, then from the repo root:
   `python3 tools/ue/models.py && node tools/ue/build-json.mjs`
2. `node tools/ue/build-json.mjs --check` exits 1 when the bundles are stale (no npm dependencies).
3. A new block: add it to `models.py` — the section filter lists every block automatically.

Every component definition needs `plugins.xwalk.page` creation metadata as well as the `plugins.da`
configuration; without it, the Universal Editor cannot create the component.

New default Text components start with an empty paragraph (`<p><br></p>`) so there is a visible
editing area before the author types.

## How the replica blocks behave in the editor

- **Blocks and items** (cards, accordion items, sidebar items, profiles, slides, table rows, columns
  cells) keep their editor markers, so they can be selected, added, moved and removed.
- **Fields** are inline-editable in the canvas only where the rendered element holds exactly the
  authored content (accordion titles, promo text, sidebar text, table cells, slide captions, the
  share label, search labels, every image). Fields whose content the block restructures (card text,
  page description, profile text, factbox, terms, inline-image caption) are edited in the
  **properties panel**, which reads and writes the source — decorated markup is never saved back.
- The **Terms of Access** gate renders in the page instead of as a modal; the leaving-HSBC dialogs
  and the link glyph decoration are off in the editor.
- **Section style**: one value; author styles (Full width, Notes to editors) and the import's layout
  rhythm styles (Layout, advanced) are grouped in one picker.
