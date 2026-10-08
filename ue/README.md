# Universal Editor (UE) for About HSBC UK

Content lives in da.live (Author Bus); the Universal Editor edits it through
`https://<branch>--hsbc-eds--polizzigaetano.ue.da.live/<path>` (open a page from da.live → *Open in UE*).
The same code also supports the Universal Editor on AEM Author (crosswalk, `/content/hsbc-eds`), which
loads `scripts/editor-support.js`; `editorHost()` tells the two apart.
Reference: https://www.aem.live/docs/ew/developing/universal-editor and `aemsites/da-block-collection`.

## Files

| file | role |
|---|---|
| `ue/models/**` | per-block definitions, models and filters (generated from `tools/ue/models.py`) |
| `component-definition.json`, `component-models.json`, `component-filters.json` (root) | the bundles the editor reads |
| `ue/scripts/ue.js` | loaded by `scripts/scripts.js` inside the editor only (`*.ue.da.live` and AEM Author, `editorHost()`): re-renders a block from the editor's response after each change (reload fallback); selecting an accordion item / carousel slide reveals it |
| `scripts/editor-support.js` | requested by AEM Author (crosswalk) for pages opened in the editor; starts the same `ue.js` in AEM mode |
| `ue/scripts/ue-richtext.js` | AEM Author only: groups default text instrumented element by element (`data-richtext-*`) into one editable wrapper |
| `scripts/site.js` → `moveInstrumentation()`, `isUE()`, `editorHost()` | blocks move the `data-aue-*` markers from authored rows/cells to the elements they render |

Each block's own behaviour in the editor is described in its `blocks/<name>/README.md`.

## Changing a model

1. Edit `tools/ue/models.py`, then from the repo root:
   `python3 tools/ue/models.py && node tools/ue/build-json.mjs`
2. `node tools/ue/build-json.mjs --check` exits 1 when the bundles are stale (no npm dependencies).
3. A new block: add it to `models.py` — the section filter lists every block automatically.

Every component definition needs `plugins.xwalk.page` creation metadata as well as the `plugins.da`
configuration; without it, the Universal Editor cannot create the component.
On AEM the block's CSS class comes from `template.name`, so it is the title-cased block id ("Inline
Image" → `inline-image`), never the editor title (`block_name()` in `models.py`). Columns use AEM's
core columns component (filter `column`); Title and Button are AEM's default content for headings
and link paragraphs (defined for editing, not in the + menu). Content for the AEM site is
generated with `tools/xwalk/convert.mjs` (see its README).

Header, Footer and Widget are defined (existing instances show in the content tree) but are not in
a section's + menu (`NOT_ADDABLE` in `models.py`): header and footer are page chrome loaded on every
page from `/nav` and `/footer`, and no widget exists yet. A new Fragment points to
`/fragments/notes-hsbc-uk`; its path and link text are edited in the properties panel. In the editor
the fragment renders inside its block, so it stays selectable; on the published page it is unwrapped
as before.

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
