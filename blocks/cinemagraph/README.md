# Cinemagraph (`cinemagraph`)

The live muted, looping hero video with a poster image and a pause/play control (`.cinemagraph`)
at the top of the www.about.hsbc.co.uk home page (`/`), showing the facts "14.5 million retail and
wealth customers / 600,000 business clients / More than 23,000 colleagues". Used on 1 page of this
site.

## Authoring

### da.live (document)

| Cinemagraph |
|---|
| `/media/cinemagraph/260618-tracking-slow-motion.mp4` (link) · poster picture · facts paragraph |

- One cell holding three paragraphs:
  - a link whose href ends in `.mp4` or `.webm` (a query string is allowed), served from the code
    origin: commit the file under `/media/cinemagraph/`. Without such a link there is no video.
  - the poster picture; alt = the facts it shows. Without it nothing shows below 780px.
  - the screen-reader description of the facts. Every paragraph that holds neither the video link
    nor a picture is moved into a visually hidden `.a11y` container.
- No options.

### AEM / Universal Editor

- Component "Cinemagraph (looping video)" (no + item; a new one starts with a placeholder link
  `/media/cinemagraph/video.mp4`, an empty poster and placeholder facts text).
- Fields: *Video link (.mp4 on the code origin), poster, facts* (richtext), *Poster image*
  (reference), *Poster alt text*. The poster is editable in the canvas; the text field is edited in
  the properties panel (the block replaces its cell).
- On AEM, `tools/xwalk/convert.mjs` reshapes the block into two rows: [video link + facts]
  [poster]. It also restores the `.mp4` href that da.live delivers as `…-mp4` (see below). The
  block reads its whole content, so both shapes render the same.

## Behaviour

Rendered as `div.cinemagraph` holding a `<video>` (muted, loop, playsinline), the hidden facts, the
poster and a 44px toggle button at the bottom left.

- Decided once at decoration, from `(min-width: 780px)`: below 780px, or without a video link, the
  block stays inactive: poster only, no toggle, no playback.
- At `>= 780px` with a video link the block gets `cinemagraph--active`: the video replaces the
  poster and the toggle shows. It plays unless `prefers-reduced-motion: reduce`, in which case it
  starts paused.
- Toggle: pause hides the video and shows the poster again (`cinemagraph--paused`,
  `data-props-poster-on-pause="yes"`); play resumes. The icon and label swap.
- No resize or orientation listener: crossing 780px after load changes only what the CSS shows.
- Known content issue: the published home page links `/media/cinemagraph/260618-tracking-slow-motion-mp4`
  (da.live drops the extension from the href; the text still ends `.mp4`). The block does not
  recognise that href, so the published home page shows the poster only, at every width.

## Dynamic content

None.

## In the Universal Editor

No special handling: the block decorates as on the site (video active in a wide editor canvas).
After each edit `ue/scripts/ue.js` re-renders the block from the editor response.

## Accessibility

- The video is `aria-hidden="true"`; the facts are given as poster alt text and as visually hidden
  text.
- Toggle: `<button type="button">` with visually hidden "Pause background video" (playing) or
  "Play background video" (paused); the icon is `aria-hidden`.
- Reduced motion is respected on load (no autoplay).
- Alt text: state the facts shown in the poster.

## Deviations from the live site

None known.

## Acceptance checks

- At 1440px with a `.mp4` link, `.cinemagraph--active` is present (`cinemagraph active >= 780`).
- At 1440px the toggle label changes from "Pause background video" to "Play background video" on
  click, and the poster shows again (`cinemagraph toggle`).
- At 375px `.cinemagraph--active` is absent and the poster shows (`cinemagraph inactive < 780`).
- With reduced motion at 1440px the block is active but paused, label "Play background video".
- The facts text is in `.a11y`; the video has `aria-hidden="true"`.
- `/media/cinemagraph/260618-tracking-slow-motion.mp4` is served from the code origin.

## Files

`cinemagraph.js`, `cinemagraph.css`, `ue/models/blocks/cinemagraph.json`,
`media/cinemagraph/260618-tracking-slow-motion.mp4`; `tools/xwalk/convert.mjs` (AEM shape and
`.mp4` href repair).
