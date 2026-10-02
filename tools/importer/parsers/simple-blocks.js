/* eslint-disable */
/* global WebImporter */
import {
  block, img, p, heading, link, visibleText, liveImageSrc, cleanRichText, absolute, pageHref,
} from '../utils.js';

/** live .header-area__image → Hero */
export function parseHero(document, el) {
  const image = el.querySelector('.header-area__image img');
  const src = liveImageSrc(image);
  if (!src) return null;
  return block(document, 'Hero', [[img(document, src, image.getAttribute('alt') || '')]]);
}

/** live .share-actions → Share (label row + one row per network link) */
export function parseShare(document, el) {
  const label = visibleText(el.querySelector('.share-actions__label__inner')) || 'Share';
  const rows = [[p(document, label)]];
  el.querySelectorAll('.share-actions__item a').forEach((a) => {
    const text = (a.querySelector('.a11y')?.textContent || '').trim();
    rows.push([p(document, link(document, a.getAttribute('href'), text))]);
  });
  return block(document, 'Share', rows);
}

/** live .page-description → Page Description (tertiary on articles) */
export function parsePageDescription(document, el) {
  const cell = [];
  const meta = visibleText(el.querySelector('.page-description__meta'));
  if (meta) cell.push(p(document, meta));
  const h = el.querySelector('.page-description__heading');
  if (h) cell.push(heading(document, 1, visibleText(h)));
  const summaryEl = el.querySelector('.page-description__summary');
  // a summary authored as a rich-text component keeps its inline formatting and links
  const rich = !!summaryEl?.querySelector('.text, a, em, strong');
  if (summaryEl && visibleText(summaryEl)) {
    if (rich) {
      const clone = cleanRichText(summaryEl.cloneNode(true));
      let holder = clone;
      while (holder.children.length === 1 && holder.firstElementChild.tagName === 'DIV') holder = holder.firstElementChild;
      // block children (p, lists) as authored; loose inline content gathered into paragraphs
      let para = null;
      [...holder.childNodes].forEach((n) => {
        if (n.nodeType === 1 && ['P', 'UL', 'OL'].includes(n.tagName)) {
          para = null;
          if (n.textContent.trim()) cell.push(n);
        } else if (n.nodeType === 1 && n.tagName === 'BR') {
          para = null;
        } else if (n.textContent.trim() || n.nodeType === 1) {
          if (!para) { para = p(document); cell.push(para); }
          para.append(n);
        }
      });
    } else {
      cell.push(p(document, visibleText(summaryEl)));
    }
  }
  const variants = [];
  if (el.classList.contains('page-description--tertiary')) variants.push('tertiary');
  if (summaryEl?.querySelector('.text')) variants.push('rich-summary');
  return {
    table: block(document, variants.length ? `Page Description (${variants.join(', ')})` : 'Page Description', [[cell]]),
    date: meta,
  };
}

/** live .cinemagraph → Cinemagraph (video served from the code origin, poster, sr facts) */
export function parseCinemagraph(document, el) {
  const video = el.querySelector('video');
  const src = video?.getAttribute('data-src') || video?.getAttribute('src') || '';
  const file = src.split('?')[0].split('/').pop();
  const poster = el.querySelector('img.cinemagraph__poster, picture img');
  const facts = visibleText(el.querySelector(':scope > .a11y'));
  const cell = [];
  if (file) cell.push(p(document, link(document, `/media/cinemagraph/${file}`, `/media/cinemagraph/${file}`)));
  if (poster) cell.push(img(document, liveImageSrc(poster), poster.getAttribute('alt') || ''));
  if (facts) cell.push(p(document, facts));
  return block(document, 'Cinemagraph', [[cell]]);
}

/** live 6-6 / 3-3-6 columns of inline images + rich text → Columns (authored order kept) */
export function parseColumns(document, layout, variant = '') {
  const cols = [...layout.querySelectorAll(':scope > .layout__primary, :scope > .layout__secondary, :scope > .layout__tertiary')];
  const cells = cols.map((col) => {
    const cell = [];
    [...col.children].forEach((child) => {
      if (child.matches('.inline-image')) {
        const image = child.querySelector('.inline-image__image img');
        if (image) cell.push(img(document, liveImageSrc(image), image.getAttribute('alt') || ''));
        child.querySelectorAll('.inline-image__content p').forEach((para) => {
          if (para.textContent.trim()) cell.push(cleanRichText(para.cloneNode(true)));
        });
      } else if (child.matches('.text')) {
        const clone = cleanRichText(child.cloneNode(true));
        [...clone.children].forEach((n) => { if (n.tagName !== 'BR') cell.push(n); });
      }
    });
    return cell.length ? cell : '';
  });
  while (cells.length > 1 && cells[cells.length - 1] === '') cells.pop();
  return block(document, variant ? `Columns (${variant})` : 'Columns', [cells]);
}

/** a live .long-form-promo → one Cards row */
export function cardRow(document, promo) {
  const image = promo.querySelector('.long-form-promo__image img');
  const anchor = promo.querySelector('a.long-form-promo__heading');
  const title = visibleText(promo.querySelector('.long-form-promo__inner h2, .long-form-promo__inner h3'));
  const href = anchor ? anchor.getAttribute('href') : '#';
  const body = [heading(document, 2, link(document, pageHref(href), title))];
  const date = visibleText(promo.querySelector('.long-form-promo__date'));
  if (date) body.push(p(document, date));
  promo.querySelectorAll('.long-form-promo__inner-content p').forEach((para) => {
    const text = visibleText(para);
    if (text) body.push(p(document, text));
  });
  return [image ? img(document, liveImageSrc(image), image.getAttribute('alt') || '') : '', body];
}

/** live .exec-bio run → Profile */
export function parseProfiles(document, bios) {
  const rows = bios.map((bio) => {
    const image = bio.querySelector('img.exec-bio__image, .exec-bio__image img');
    const cell = [];
    const name = visibleText(bio.querySelector('.exec-bio__name'));
    if (name) cell.push(heading(document, 2, name));
    const position = visibleText(bio.querySelector('.exec-bio__position'));
    if (position) cell.push(p(document, position));
    const text = bio.querySelector('.exec-bio__text__inner, .exec-bio__text');
    if (text) {
      const clone = cleanRichText(text.cloneNode(true));
      clone.querySelectorAll('p').forEach((para) => {
        if (para.textContent.trim()) cell.push(para);
      });
    }
    return [image ? img(document, liveImageSrc(image), image.getAttribute('alt') || '') : '', cell];
  });
  return block(document, 'Profile', rows);
}

/** live Terms of Access lightbox → Terms Gate */
export function parseTermsGate(document, gate) {
  const cell = [];
  const h = gate.querySelector('.leaving-confirmation__heading');
  if (h) {
    const clone = cleanRichText(h.cloneNode(true));
    const out = heading(document, 2);
    [...clone.childNodes].forEach((n) => out.append(n));
    cell.push(out);
  }
  gate.querySelectorAll('p.leaving-confirmation__copy').forEach((para) => {
    cell.push(cleanRichText(para.cloneNode(true)));
  });
  const label = visibleText(gate.querySelector('.leaving-confirmation__checkbox-label'));
  if (label) cell.push(p(document, label));
  const accept = visibleText(gate.querySelector('.leaving-confirmation__proceed')) || 'Accept';
  const decline = visibleText(gate.querySelector('.leaving-confirmation__close')) || 'Decline';
  const back = gate.getAttribute('data-return-url') || '/';
  cell.push(p(document, link(document, '#accept', accept)));
  cell.push(p(document, link(document, pageHref(back), decline)));
  return block(document, 'Terms Gate', [[cell]]);
}

/** a live interstitial (.leaving-confirmation) → fragment body (heading, copy, proceed, cancel) */
export function confirmationFragment(document, box) {
  const main = document.createElement('div');
  const h = box.querySelector('.leaving-confirmation__heading');
  if (h) {
    const clone = cleanRichText(h.cloneNode(true));
    const out = heading(document, 2);
    [...clone.childNodes].forEach((n) => out.append(n));
    main.append(out);
  }
  box.querySelectorAll('p.leaving-confirmation__copy').forEach((para) => {
    main.append(cleanRichText(para.cloneNode(true)));
  });
  const proceed = visibleText(box.querySelector('.leaving-confirmation__proceed'));
  const cancel = visibleText(box.querySelector('.leaving-confirmation__close'));
  if (proceed) main.append(p(document, link(document, '#proceed', proceed)));
  if (cancel) main.append(p(document, link(document, '#cancel', cancel)));
  return main;
}

export { absolute };
