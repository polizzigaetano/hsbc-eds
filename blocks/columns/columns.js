/**
 * columns — the live 6-6 layout of an inline image over rich text (home "Our headquarters" /
 * "Our CEO"). Template-slotted per column.
 *
 * Authoring: one row; each cell holds a picture followed by the column's rich text (h2, p…).
 */
export default function decorate(block) {
  const row = block.firstElementChild;
  const cells = row ? [...row.children] : [];
  block.classList.add(`columns-${cells.length}-cols`);
  const layout = document.createElement('div');
  layout.className = 'columns__layout';

  cells.forEach((cell) => {
    const col = document.createElement('div');
    col.className = 'columns__col';
    const media = cell.querySelector('picture') || cell.querySelector('img');
    if (media) {
      const holder = media.closest('p') || media;
      const figure = document.createElement('div');
      figure.className = 'inline-image inline-image--vertical inline-image--with-bottom-margin';
      const frame = document.createElement('div');
      frame.className = 'inline-image__image';
      frame.append(holder);
      figure.append(frame);
      col.append(figure);
    }
    const text = document.createElement('div');
    text.className = 'text';
    text.append(...cell.children);
    if (text.children.length) col.append(text);
    layout.append(col);
  });

  block.replaceChildren(layout);
}
