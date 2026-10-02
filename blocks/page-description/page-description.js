/**
 * page-description — the live page header: optional date line, the page <h1>, optional summary.
 * Variant: `tertiary` (article pages: ultra-light heading, tighter spacing).
 *
 * Authoring: one cell — [p date], h1, [p summary]. The date is the paragraph before the heading,
 * the summary the paragraph(s) after it. Decorate moves each authored element into its slot.
 */
function slot(className, nodes) {
  const div = document.createElement('div');
  div.className = className;
  div.append(...nodes);
  return div;
}

export default function decorate(block) {
  const heading = block.querySelector('h1, h2');
  const paragraphs = [...block.querySelectorAll('p')];
  const all = [...block.querySelectorAll('p, h1, h2')];
  const before = heading ? paragraphs.filter((p) => all.indexOf(p) < all.indexOf(heading)) : [];
  const after = paragraphs.filter((p) => !before.includes(p));

  const parts = [];
  if (before.length) parts.push(slot('page-description__meta', before));
  if (heading) parts.push(slot('page-description__heading', [heading]));
  parts.push(slot('page-description__summary', after));
  block.replaceChildren(...parts);
}
