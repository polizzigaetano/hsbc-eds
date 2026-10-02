/* eslint-disable */
/* global WebImporter */
import {
  block, heading, link, p, visibleText, cleanRichText, absolute, pageHref,
} from '../utils.js';

/**
 * live .accordion → Accordion: 2 columns, one row per item —
 * title cell (the item heading) | content cell (panel body: rich text and tabular lists).
 * Nested live accordions become sub-headings (one level down) inside the content cell.
 */

/** live news row (dl .tabular-list__item) → <li>date <a>title</a> description</li> */
function articleItem(document, row) {
  const li = document.createElement('li');
  const date = visibleText(row.querySelector('.tabular-list__date'));
  const a = row.querySelector('.tabular-list__title-wrapper a, a');
  const title = visibleText(row.querySelector('.tabular-list__title')) || visibleText(a);
  const description = visibleText(row.querySelector('.tabular-list__description'));
  if (date) li.append(`${date} `);
  li.append(link(document, pageHref(a?.getAttribute('href') || '#'), title));
  if (description) li.append(` ${description}`);
  return li;
}

/** live document row (ul .tabular-list__item) → <li><a>title</a> language type size</li> */
function documentItem(document, row) {
  const li = document.createElement('li');
  const a = row.querySelector('.tabular-list__title-wrapper a, a');
  const title = visibleText(row.querySelector('.tabular-list__title')) || visibleText(a);
  const href = a?.getAttribute('href') || '#';
  li.append(link(document, href.includes('/-/media/') ? absolute(href) : pageHref(href), title));
  const cells = [...row.querySelectorAll('.tabular-list__row .tabular-list__cell')]
    .map((c) => c.textContent.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
  if (cells.length) li.append(` ${cells.join(' ')}`);
  return li;
}

function listFrom(document, list) {
  const ul = document.createElement('ul');
  const rows = [...list.querySelectorAll(':scope > .tabular-list__item, :scope > li, :scope > div')];
  rows.forEach((row) => {
    const isArticle = !!row.querySelector('.tabular-list__date');
    ul.append(isArticle ? articleItem(document, row) : documentItem(document, row));
  });
  return ul;
}

/** flatten an accordion inner into authored content nodes */
function innerContent(document, inner, level) {
  const out = [];
  [...inner.children].forEach((child) => {
    if (child.matches('.text')) {
      const clone = cleanRichText(child.cloneNode(true));
      [...clone.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          if (n.textContent.trim()) out.push(p(document, n.textContent.trim()));
        } else if (n.nodeType === 1 && n.tagName !== 'BR' && n.textContent.trim()) {
          // a bare inline link at the top of the text component becomes its own paragraph
          out.push(['A', 'STRONG', 'EM'].includes(n.tagName) ? p(document, n) : n);
        }
      });
    } else if (child.matches('.tabular-list, dl, ul')) {
      out.push(listFrom(document, child));
    } else if (child.matches('.accordion-nested__mid--hiddenitems, .accordion-nested')) {
      child.querySelectorAll(':scope .accordion-nested__item').forEach((item) => {
        out.push(heading(document, level + 1, visibleText(item.querySelector('.accordion-nested__heading'))));
        const nestedInner = item.querySelector('.accordion-nested__inner');
        if (nestedInner) out.push(...innerContent(document, nestedInner, level + 1));
      });
    }
  });
  return out;
}

/** live .accordion → Accordion (or Accordion (news-archive) for the year archive) */
export function parseAccordion(document, acc, { archive = false } = {}) {
  const rows = [];
  acc.querySelectorAll(':scope > .accordion__item').forEach((item) => {
    const h = item.querySelector(':scope > .accordion__heading');
    const level = Number((h?.tagName || 'H3').slice(1)) || 3;
    const titleCell = heading(document, level, visibleText(h));
    const inner = item.querySelector('.accordion__inner');
    const contentCell = inner ? innerContent(document, inner, level) : [p(document, '')];
    rows.push([titleCell, contentCell]);
  });
  return block(document, archive ? 'Accordion (news-archive)' : 'Accordion', rows);
}
