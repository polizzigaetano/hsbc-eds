import { moveInstrumentation } from '../../scripts/site.js';

/**
 * table — the live rich-text data table (.inline-table). Variants: `caption` (the first row is
 * the table caption, the live navy bar), `header` (the next row is the column header row, live
 * <thead>). A genuine data table, so it may exceed four columns (D10).
 *
 * Authoring: one row per table row, one cell per column.
 */
// columns of the table-row model (ue/models: cell1..cell8)
const MODEL_COLUMNS = 8;
const isEmpty = (cell) => !cell.textContent.trim() && !cell.querySelector('img, picture, a');

export default function decorate(block) {
  const header = block.classList.contains('header');
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');
  const rows = [...block.children];
  // AEM (crosswalk) renders every column of the row model for every row: drop each row's trailing
  // empty cells, so a row keeps its authored length (cells authored empty at the end of a row are
  // imported with an invisible marker). da.live rows carry only their authored cells.
  if (rows.length && rows.every((r) => r.children.length === MODEL_COLUMNS)) {
    rows.forEach((r) => {
      const cells = [...r.children];
      let last = cells.length;
      while (last > 1 && isEmpty(cells[last - 1])) last -= 1;
      cells.slice(last).forEach((c) => c.remove());
    });
  }
  if (block.classList.contains('caption') && rows.length) {
    const caption = document.createElement('caption');
    const cell = rows.shift().firstElementChild;
    if (cell) caption.append(...cell.childNodes);
    table.append(caption);
  }
  rows.forEach((row, i) => {
    const tr = document.createElement('tr');
    const isHead = header && i === 0;
    [...row.children].forEach((cell) => {
      const td = document.createElement(isHead ? 'th' : 'td');
      if (isHead) td.scope = 'col';
      td.append(...cell.childNodes);
      moveInstrumentation(cell, td);
      tr.append(td);
    });
    moveInstrumentation(row, tr);
    (isHead ? thead : tbody).append(tr);
  });
  if (thead.children.length) table.append(thead);
  table.append(tbody);
  const wrapper = document.createElement('div');
  wrapper.className = 'inline-table-wrapper';
  wrapper.append(table);
  block.replaceChildren(wrapper);
}
