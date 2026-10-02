/* eslint-disable */
/* global WebImporter */

/**
 * Shared helpers for the About HSBC importer. The live site is Sitecore rich text: icon-font
 * glyphs (<i class="icon…">), screen-reader suffixes (<span class="a11y">) and CMS attributes are
 * presentation the EDS runtime re-creates, so they are dropped from authored content.
 */

import MIGRATED_ARTICLES from './migrated-articles.js';

export const LIVE_ORIGIN = 'https://www.about.hsbc.co.uk';

/**
 * Link localization (stage of the import): live pages already in the EDS content tree are linked
 * root-relative; every other live link stays fully qualified (the honest boundary until the
 * wave that migrates it — add the path here and re-run the import).
 */
export const MIGRATED_PATHS = [
  '/',
  '/news-and-media',
  '/hsbc-uk/inclusion',
  '/hsbc-uk/regulated-covered-bond-programme',
  '/accessibility',
  '/history-timeline',
  '/management-team',
  '/search',
  ...MIGRATED_ARTICLES,
];

const KEEP_ATTRS = {
  A: ['href'],
  IMG: ['src', 'alt'],
  TD: ['colspan', 'rowspan'],
  TH: ['colspan', 'rowspan'],
};

/** absolute URL on the live origin (documents/media stay on the live host — interim) */
export function absolute(href) {
  if (!href) return href;
  try {
    return new URL(href, LIVE_ORIGIN).href;
  } catch (e) {
    return href;
  }
}

/**
 * Page links are authored fully qualified on the live origin (D4); the pipeline's
 * localize-links stage rewrites the ones whose target exists in the migrated content tree.
 */
export function pageHref(href) {
  if (!href) return href;
  if (/^(mailto:|tel:|#)/i.test(href)) return href;
  const abs = absolute(href);
  try {
    const url = new URL(abs);
    const path = url.pathname.replace(/\.html?$/, '').replace(/\/$/, '') || '/';
    if (url.origin === LIVE_ORIGIN && MIGRATED_PATHS.includes(path)) return `${path}${url.search}${url.hash}`;
  } catch (e) { /* keep absolute */ }
  return abs;
}

/** strip presentation from a rich-text subtree, in place */
export function cleanRichText(root) {
  root.querySelectorAll('script, style, noscript, i.icon, i[class*="icon"], em[class*="icon"], span[class*="icon"], span.a11y, .share-actions').forEach((n) => n.remove());
  root.querySelectorAll('*').forEach((el) => {
    const keep = KEEP_ATTRS[el.tagName] || [];
    [...el.attributes].forEach((attr) => {
      if (!keep.includes(attr.name)) el.removeAttribute(attr.name);
    });
    if (el.tagName === 'A' && el.getAttribute('href')) {
      const href = el.getAttribute('href');
      el.setAttribute('href', href.includes('/-/media/') ? absolute(href) : pageHref(href));
    }
    if (el.tagName === 'IMG') {
      const src = el.getAttribute('src');
      if (src) el.setAttribute('src', absolute(src));
    }
  });
  // spans carry nothing once classes are gone
  root.querySelectorAll('span').forEach((span) => span.replaceWith(...span.childNodes));
  return root;
}

/** the visible text of an element, minus screen-reader suffixes */
export function visibleText(el) {
  if (!el) return '';
  const clone = el.cloneNode(true);
  clone.querySelectorAll('.a11y, i[class*="icon"], em[class*="icon"], span[class*="icon"], script, style').forEach((n) => n.remove());
  return clone.textContent.replace(/\s+/g, ' ').trim();
}

export function img(document, src, alt = '') {
  const image = document.createElement('img');
  image.src = absolute(src);
  image.alt = alt || '';
  return image;
}

export function p(document, ...children) {
  const para = document.createElement('p');
  para.append(...children);
  return para;
}

export function heading(document, level, ...children) {
  const h = document.createElement(`h${level}`);
  h.append(...children);
  return h;
}

export function link(document, href, text) {
  const a = document.createElement('a');
  a.href = href;
  a.textContent = text;
  return a;
}

export function block(document, name, rows) {
  return WebImporter.DOMUtils.createTable([[name], ...rows], document);
}

export function sectionMetadata(document, style) {
  return WebImporter.DOMUtils.createTable([['Section Metadata'], ['style', style]], document);
}

/** the real image source of a live (lazy) image */
export function liveImageSrc(image) {
  if (!image) return null;
  return image.getAttribute('data-src') || image.getAttribute('src');
}

/**
 * Rich-text children of a live .text component as clean authored nodes.
 * Leading <br> spacers are reported (styled by the section) and never authored.
 */
export function textNodes(document, textEl) {
  const clone = cleanRichText(textEl.cloneNode(true));
  const INLINE = ['A', 'STRONG', 'EM', 'B', 'I', 'U', 'SUB', 'SUP', 'CODE', 'SMALL'];
  const nodes = [];
  let leadingBreak = false;
  let started = false;
  let inline = null; // open paragraph collecting loose inline content
  const flush = () => {
    if (inline && inline.textContent.trim()) nodes.push(inline);
    inline = null;
  };
  [...clone.childNodes].forEach((n) => {
    if (n.nodeType === 3 || (n.nodeType === 1 && INLINE.includes(n.tagName))) {
      if (!n.textContent.trim() && !inline) return;
      if (!inline) inline = p(document);
      inline.append(n.nodeType === 3 ? n.textContent.replace(/\s+/g, ' ') : n);
      started = true;
      return;
    }
    if (n.nodeType !== 1) return;
    if (n.tagName === 'BR') {
      if (inline) flush();
      else if (!started) leadingBreak = true;
      return;
    }
    flush();
    if (n.tagName === 'DIV') {
      // nested wrappers (e.g. disclaimer) are handled by the caller
      if (n.children.length || n.textContent.trim()) nodes.push(n);
      return;
    }
    if (!n.textContent.trim() && !n.querySelector('img')) return;
    nodes.push(n);
    started = true;
  });
  flush();
  return { nodes, leadingBreak };
}
