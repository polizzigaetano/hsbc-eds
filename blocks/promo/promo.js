import { moveInstrumentation } from '../../scripts/site.js';

/**
 * promo — the live grey promo box inside article text (heading + paragraphs).
 *
 * Authoring (one cell): rich text.
 */
export default function decorate(block) {
  const text = document.createElement('div');
  text.className = 'text';
  [...block.children].forEach((row) => {
    [...row.children].forEach((cell) => {
      text.append(...cell.children);
      moveInstrumentation(cell, text);
    });
  });
  block.replaceChildren(text);
}
