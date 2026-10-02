/* eslint-disable */
/* global WebImporter */
import {
  block, img, p, heading, visibleText, liveImageSrc, cleanRichText,
} from '../utils.js';

/**
 * Article components (wave 2): inline images (+ floating containers), data tables, promo boxes,
 * factboxes and the image carousel.
 */

/** live .inline-image → one Inline Image block (variants from the live modifiers / container) */
export function parseInlineImage(document, el, floating) {
  const image = el.querySelector('.inline-image__image img');
  const src = liveImageSrc(image);
  if (!src) return null;
  const variants = [];
  if (floating) {
    if (floating.matches('.floating-container--left')) variants.push('left');
    else variants.push('right');
    if (floating.matches('.floating-container--third')) variants.push('third');
    else if (floating.matches('.floating-container--half')) variants.push('half');
  }
  if (el.matches('.inline-image--with-bottom-margin')) variants.push('bottom-margin');
  if (el.matches('.inline-image--vertical')) variants.push('vertical');
  if (el.matches('.inline-image--infographic, .inline-image--transparent-caption')) variants.push('infographic');
  const cell = [img(document, src, image.getAttribute('alt') || '')];
  el.querySelectorAll('.inline-image__content p').forEach((para) => {
    if (para.textContent.trim()) cell.push(cleanRichText(para.cloneNode(true)));
  });
  return block(document, variants.length ? `Inline Image (${variants.join(', ')})` : 'Inline Image', [[cell]]);
}

/** live data table (.inline-table-wrapper / bare table) → Table (header) */
export function parseTable(document, el) {
  const table = el.matches('table') ? el : el.querySelector('table');
  if (!table) return null;
  const rows = [];
  let header = false;
  table.querySelectorAll('tr').forEach((tr) => {
    const cells = [...tr.children].filter((c) => /^T[DH]$/.test(c.tagName));
    if (!cells.length) return;
    if (tr.closest('thead') || cells.every((c) => c.tagName === 'TH')) header = header || rows.length === 0;
    rows.push(cells.map((c) => {
      const clone = cleanRichText(c.cloneNode(true));
      const kids = [...clone.childNodes].filter((n) => n.nodeType === 1 || n.textContent.trim());
      return kids.length ? kids : '';
    }));
  });
  if (!rows.length) return null;
  // the live caption bar becomes the first row of a `caption` variant
  const caption = visibleText(table.querySelector('caption'));
  const variants = [];
  if (caption) {
    rows.unshift([p(document, caption)]);
    variants.push('caption');
  }
  if (header) variants.push('header');
  return block(document, variants.length ? `Table (${variants.join(', ')})` : 'Table', rows);
}

/** live .promo box → Promo (rich text in one cell) */
export function parsePromo(document, el) {
  const clone = cleanRichText(el.cloneNode(true));
  const cell = [...clone.children].filter((n) => n.tagName !== 'BR' && n.textContent.trim());
  return cell.length ? block(document, 'Promo', [[cell]]) : null;
}

/** live .factbox (in the article column) → Factbox */
export function parseFactbox(document, el) {
  const cell = [];
  const h = el.querySelector('.factbox__heading');
  if (h) cell.push(heading(document, 2, visibleText(h)));
  const body = el.querySelector('.factbox__list, .factbox__copy') || el;
  const clone = cleanRichText(body.cloneNode(true));
  [...clone.children].forEach((n) => { if (n.textContent.trim() && !n.matches('.factbox__heading')) cell.push(n); });
  return cell.length ? block(document, 'Factbox', [[cell]]) : null;
}

/** live .carousel (image + caption slides) → Carousel, one row per slide */
export function parseCarousel(document, el) {
  const rows = [];
  el.querySelectorAll('.carousel__slide').forEach((slide) => {
    const image = slide.querySelector('img');
    const src = liveImageSrc(image);
    if (!src) return;
    const cell = [];
    const title = visibleText(slide.querySelector('.video__heading, .inline-image__heading'));
    if (title) cell.push(heading(document, 3, title));
    slide.querySelectorAll('.video__description p, .inline-image__content p').forEach((para) => {
      if (para.textContent.trim()) cell.push(cleanRichText(para.cloneNode(true)));
    });
    rows.push([img(document, src.trim(), image.getAttribute('alt') || ''), cell.length ? cell : '']);
  });
  return rows.length ? block(document, 'Carousel', rows) : null;
}
