/* eslint-disable */
/* global WebImporter */
import {
  block, heading, p, visibleText, cleanRichText,
} from '../utils.js';

/** live .layout__secondary → Aside (one row per sidebar component: text, factbox, contacts) */
export function parseAside(document, secondary) {
  const rows = [];
  let loose = [];
  const flush = () => {
    if (loose.length) rows.push([loose]);
    loose = [];
  };
  [...secondary.childNodes].forEach((n) => {
    if (n.nodeType === 3) {
      if (n.textContent.trim()) loose.push(p(document, n.textContent.trim()));
      return;
    }
    if (n.nodeType !== 1) return;
    if (n.matches('.factbox')) {
      flush();
      const cell = [];
      const h = n.querySelector('.factbox__heading');
      if (h) cell.push(heading(document, 2, visibleText(h)));
      const list = n.querySelector('.factbox__list ul, ul');
      if (list) cell.push(cleanRichText(list.cloneNode(true)));
      rows.push([cell]);
    } else if (n.matches('div.text')) {
      flush();
      const clone = cleanRichText(n.cloneNode(true));
      const cell = [...clone.children].filter((c) => c.tagName !== 'BR' && (c.textContent.trim() || c.querySelector('img')));
      if (cell.length) rows.push([cell]);
    } else if (n.tagName !== 'BR' && (n.textContent.trim() || n.querySelector('img'))) {
      if (/^H[1-6]$/.test(n.tagName)) loose.push(heading(document, 2, visibleText(n)));
      else loose.push(cleanRichText(n.cloneNode(true)));
    }
  });
  flush();
  return rows.length ? block(document, 'Aside', rows) : null;
}
