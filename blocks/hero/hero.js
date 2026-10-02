/**
 * hero — the live full-bleed header-area image band (template-slotted).
 *
 * Authoring: one row, one cell holding the banner picture (1520x400 source, decorative alt "").
 * Decorate moves the authored <picture> into the band slot; the band crops it to 22.57% of the
 * viewport width exactly like the live .header-area__image.
 */
export default function decorate(block) {
  const media = block.querySelector('picture') || block.querySelector('img');
  const area = document.createElement('div');
  area.className = 'header-area';
  const band = document.createElement('div');
  band.className = 'header-area__image';
  area.append(band);
  if (media) {
    const holder = media.closest('p') || media;
    band.append(holder);
    const img = band.querySelector('img');
    if (img) {
      img.loading = 'eager';
      img.fetchPriority = 'high';
    }
  }
  block.replaceChildren(area);
}
