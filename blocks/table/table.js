import { moveInstrumentation } from '../../scripts/site.js';

/**
 * table — the live rich-text data table (.inline-table). Variants: `caption` (the first row is
 * the table caption, the live navy bar), `header` (the next row is the column header row, live
 * <thead>). A genuine data table, so it may exceed four columns (D10).
 *
 * Authoring: one row per table row, one cell per column.
 */
export default function decorate(block) {
  const header = block.classList.contains('header');
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');
  const rows = [...block.children];
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
