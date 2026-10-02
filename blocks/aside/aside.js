/**
 * aside — the live 9-3 layout's secondary column (media-relations contacts, sidebar image +
 * caption, factbox). The aside section sits AFTER the sections it accompanies; on desktop it is
 * placed beside them in the page grid (from the first section of the run — the section before
 * it plus any `continued` sections chained before that), below 800px it simply follows them.
 *
 * Authoring: one row per sidebar item; each cell is rich text.
 *   - an item whose heading is followed by a list renders as the live factbox
 *   - headings in other items render as the live contact-details heading (rule under)
 */
function placeBeside(block) {
  const section = block.closest('.section');
  if (!section) return;
  let start = section.previousElementSibling;
  while (start && start.classList.contains('continued') && start.previousElementSibling) {
    start = start.previousElementSibling;
  }
  if (!start) return;
  const siblings = [...section.parentElement.children];
  const rendered = (s) => s !== section && !s.matches(':empty');
  const startRow = siblings.slice(0, siblings.indexOf(start)).filter(rendered).length + 1;
  const span = siblings.slice(siblings.indexOf(start), siblings.indexOf(section))
    .filter(rendered).length;
  section.style.setProperty('--aside-row', String(startRow));
  section.style.setProperty('--aside-span', String(Math.max(span, 1)));
  section.classList.add('aside-placed');
}

export default function decorate(block) {
  const items = [...block.children].map((row) => {
    const cell = row.firstElementChild || row;
    const item = document.createElement('div');
    const heading = cell.querySelector('h2, h3, h4');
    const isFactbox = heading && heading.nextElementSibling
      && ['UL', 'OL'].includes(heading.nextElementSibling.tagName);
    if (isFactbox) {
      item.className = 'factbox factbox--list';
      const inner = document.createElement('div');
      inner.className = 'factbox__inner';
      const head = document.createElement('div');
      head.className = 'factbox__heading';
      head.append(heading);
      const list = document.createElement('div');
      list.className = 'factbox__list';
      list.append(...cell.children);
      inner.append(head, list);
      item.append(inner);
    } else {
      item.className = 'aside__text text';
      item.append(...cell.children);
    }
    return item;
  });
  block.replaceChildren(...items);
  placeBeside(block);
}
