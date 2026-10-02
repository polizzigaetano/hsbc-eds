/**
 * page-description — the live page header: optional date line, the page <h1>, optional summary.
 * Variants: `tertiary` (article pages: ultra-light heading, tighter spacing), `rich-summary`
 * (the live summary is a rich-text component: inline formatting, links, its 20px margin).
 *
 * Authoring: one cell — [p date], h1, [summary: paragraphs and/or a list]. The date is the
 * paragraph before the heading, the summary everything after it. Decorate moves each authored
 * element into its slot.
 */
function slot(className, nodes) {
  const div = document.createElement('div');
  div.className = className;
  div.append(...nodes);
  return div;
}

export default function decorate(block) {
  const heading = block.querySelector('h1, h2');
  // outermost authored elements, in reading order (lists' inner paragraphs stay in their list)
  const all = [...block.querySelectorAll('p, ul, ol, h1, h2')]
    .filter((el) => !el.parentElement.closest('ul, ol, p'));
  const at = heading ? all.indexOf(heading) : -1;
  const before = all.filter((el, i) => i < at && el.tagName === 'P');
  const after = all.filter((el, i) => i > at || (at < 0 && el !== heading));

  const parts = [];
  if (before.length) parts.push(slot('page-description__meta', before));
  if (heading) parts.push(slot('page-description__heading', [heading]));
  // a rich summary (live .text inside the summary) takes the rich-text link treatment
  const rich = block.classList.contains('rich-summary');
  parts.push(slot(rich ? 'page-description__summary text' : 'page-description__summary', after));
  block.replaceChildren(...parts);
}
