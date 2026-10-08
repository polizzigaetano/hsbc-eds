# Blocks

Every block has a functional `README.md` next to its code: what it reproduces from
www.about.hsbc.co.uk, how it is authored (da.live table and AEM / Universal Editor fields), how it
behaves, where dynamic content comes from, how it appears in the editor, accessibility, deliberate
deviations from the live site, and acceptance checks. Read it before changing a block, and update
it in the same change. (`*.md` is in `.hlxignore`: the READMEs are not served.)

| Block | What it is |
|---|---|
| [accordion](accordion/README.md) | Multi-open accordion with tabular-list rows; news archive variant |
| [aside](aside/README.md) | Sidebar column of the 9-3 layout (contacts, factbox lists) |
| [cards](cards/README.md) | Long-form promo card grid (halves, quarters, latest) |
| [carousel](carousel/README.md) | Image carousel with caption overlay, controls and counter |
| [cinemagraph](cinemagraph/README.md) | Muted looping home video with poster and pause/play |
| [columns](columns/README.md) | 6-6 and 3-3-6 layouts of images and rich text |
| [factbox](factbox/README.md) | Grey box of facts inside an article |
| [footer](footer/README.md) | Black utility footer, from the `/footer` document |
| [fragment](fragment/README.md) | Includes a `/fragments/…` document in a page |
| [header](header/README.md) | Fixed header, "doormat" dropdown and mobile tray, from `/nav` |
| [hero](hero/README.md) | Full-bleed banner image band |
| [inline-image](inline-image/README.md) | Image with optional caption, floated or full width |
| [page-description](page-description/README.md) | Date line, page `<h1>` and summary |
| [profile](profile/README.md) | Executive-bio / timeline rows (photo and text) |
| [promo](promo/README.md) | Grey rich-text box (case study) inside an article |
| [search](search/README.md) | Search box and client-side results (`/search`) |
| [share](share/README.md) | Share bar (X, Facebook, LinkedIn) |
| [table](table/README.md) | Rich-text data table |
| [terms-gate](terms-gate/README.md) | Terms of Access modal on the covered bond page |
| [widget](widget/README.md) | Boilerplate widget loader (unused) |

## A new block

Write the README first, as the brief, then build against it. Use these sections, in this order:

```markdown
# <Block title> (`<block-id>`)

What it is, which live component and pages it reproduces, how many pages use it.

## Authoring
### da.live (document)
<example table> + one bullet per row/cell and per option the code handles
### AEM / Universal Editor
component, properties-panel fields, inline vs panel-only fields, items, AEM row shape

## Behaviour
click / hover / keyboard / touch / resize / timers / reduced motion / breakpoints (px)

## Dynamic content
data source, when it loads, loading / empty / error states, limits — or "None."

## In the Universal Editor
appearance and behaviour in the editor (both hosts), what ue/scripts/ue.js re-renders or reveals

## Accessibility
roles, aria-*, focus handling, keyboard support, alt text

## Deviations from the live site
deliberate differences and why — or "None known."

## Acceptance checks
5–10 short, testable statements

## Files
the block's files and what else it depends on
```

The Universal Editor setup shared by all blocks is in [`ue/README.md`](../ue/README.md).
