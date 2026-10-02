/**
 * factbox — the live list factbox in an article column (optional heading + rich text).
 *
 * Authoring (one cell): [h2 heading], then paragraphs or a list.
 */
export default function decorate(block) {
  const heading = block.querySelector('h2, h3, h4');
  const inner = document.createElement('div');
  inner.className = 'factbox__inner';
  if (heading) {
    const head = document.createElement('div');
    head.className = 'factbox__heading';
    head.append(heading);
    inner.append(head);
  }
  const list = document.createElement('div');
  list.className = 'factbox__list';
  [...block.children].forEach((row) => {
    [...row.children].forEach((cell) => list.append(...cell.children));
  });
  inner.append(list);
  block.classList.add('factbox--list');
  block.replaceChildren(inner);
}
