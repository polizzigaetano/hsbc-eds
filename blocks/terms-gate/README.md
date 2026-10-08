# Terms of Access gate (`terms-gate`)

The live "Terms of Access" modal (`.leaving-confirmation--modal-onload` in a lightbox) that opens on
load on www.about.hsbc.co.uk `/hsbc-uk/regulated-covered-bond-programme`: the visitor ticks an
acknowledgement and accepts, or declines and leaves. Used on 1 page of this site.

## Authoring

### da.live (document)

| Terms Gate |
|---|
| Heading · terms paragraphs · acknowledgement paragraph · `[Accept](#accept)` · `[Decline](…)` |

- One cell, in this order:
  - heading (h1–h3, optional): the dialog title and its accessible name.
  - terms paragraphs: the scrolling copy.
  - acknowledgement paragraph: the last paragraph without a link becomes the checkbox label.
  - Accept: a paragraph whose link contains `#accept` (otherwise the first link paragraph).
  - Decline: the other link paragraph; its href is where decliners go (here
    `https://www.about.hsbc.co.uk/hsbc-uk`). Without it, Decline is absent and × goes to `/`.
- No options. Place the block in its own section: the section takes no space in the page flow.

### AEM / Universal Editor

- Component "Terms of Access gate" (no items): one field, *Heading, terms, acknowledgement, then
  "Accept" (link #accept) and "Decline" (link to the exit page)* (richtext), edited in the
  properties panel (the block restructures its cell).
- AEM renders the same single cell as the da.live table.

## Behaviour

- On load, unless the acceptance cookie exists, the gate opens as a modal: lightbox + overlay
  (`styles/lightbox.css`), page scrolling locked (`html.no-scroll`), focus on the checkbox.
- Accept starts disabled (`button--disabled`, `aria-disabled="true"`); clicks do nothing until the
  checkbox is ticked. Unticking disables it again.
- Accept (enabled): stores the cookie and closes the gate. The `#accept` href never navigates.
- Decline and the × close link send the visitor to the Decline href.
- Tab and Shift+Tab cycle within the dialog. Escape and overlay clicks are not handled.
- Once accepted, later visits render no gate markup at all; the section gets
  `terms-gate--accepted`.

## Dynamic content

Cookie only. Name: the page path without a trailing slash (e.g.
`/hsbc-uk/regulated-covered-bond-programme`); value: the URL-encoded path; `expires` 90 days
after acceptance; `path=/`; `SameSite=Lax`. Read on every load; the 90-day rule is interim, pending
Compliance confirmation (header comment).

## In the Universal Editor

Rendered in the page instead of as a modal (`terms-gate--editor`): static position, dashed border,
no overlay, no scroll lock, no focus move, no cookie check, so the terms can be selected and edited.
The click handlers stay attached (Accept still needs the tick; Decline and × still navigate).
After each edit `ue/scripts/ue.js` re-renders the block.

## Accessibility

- Lightbox: `role="dialog"`, `aria-modal="true"`, `aria-labelledby` the heading.
- The checkbox has a real `<label for>` (the acknowledgement text).
- Accept exposes its state with `aria-disabled`.
- × close: `aria-label` and `title` "Close notification".
- Focus moves to the checkbox on open; Tab is trapped inside the dialog.

## Deviations from the live site

None known.

## Acceptance checks

- Without the cookie, `.lightbox.lightbox--active` is present on load (`gate opens on load`).
- Accept has `button--disabled` before the checkbox is ticked (`accept disabled before tick`);
  clicking it leaves the gate open.
- Ticking the checkbox removes `button--disabled` (`tick enables accept`).
- Accept then closes the gate (`accept closes gate`).
- A cookie named after the page path exists with a 90-day expiry
  (`90-day cookie named after the path`).
- After a reload, no `.lightbox` exists (`gate absent once accepted`).
- Decline (or ×) navigates to `…/hsbc-uk` (`decline leaves for /hsbc-uk`).

## Files

`terms-gate.js`, `terms-gate.css`, `ue/models/blocks/terms-gate.json`; `styles/lightbox.css`
(loaded by the block); `scripts/site.js` (`isUE`).
