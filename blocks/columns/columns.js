import { moveInstrumentation } from '../../scripts/site.js';

/**
 * columns — the live multi-column layouts of inline images and rich text (home 6-6 "Our
 * headquarters" / "Our CEO", article 6-6 and 3-3-6 image grids). Template-slotted per column.
 * Variant `3-3-6`: two narrow columns and one wide one.
 *
 * Authoring: one row; each cell holds pictures and rich text in reading order.
 */
function figure(holder) {
  const fig = document.createElement('div');
  fig.className = 'inline-image inline-image--vertical inline-image--with-bottom-margin';
  const frame = document.createElement('div');
  frame.className = 'inline-image__image';
  frame.append(holder);
  fig.append(frame);
  return fig;
}

export default function decorate(block) {
  const row = block.firstElementChild;
  const cells = row ? [...row.children] : [];
  block.classList.add(`columns-${cells.length}-cols`);
  const layout = document.createElement('div');
  layout.className = 'columns__layout';

  // Universal Editor: row and cell containers keep their markers on the rendered layout
  if (row) moveInstrumentation(row, layout);
  cells.forEach((cell) => {
    const col = document.createElement('div');
    col.className = 'columns__col';
    moveInstrumentation(cell, col);
    let text = null;
    [...cell.children].forEach((child) => {
      const media = child.matches('picture, img') ? child : child.querySelector('picture, img');
      if (media && !child.textContent.trim()) {
        text = null;
        col.append(figure(child));
        return;
      }
      if (!text) {
        text = document.createElement('div');
        text.className = 'text';
        col.append(text);
      }
      text.append(child);
    });
    layout.append(col);
  });

  block.replaceChildren(layout);
}
