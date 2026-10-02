import { createOptimizedPicture } from '../../scripts/aem.js';
import {
  isExternal, fetchArticles, formatDate, parseDate, pathOf, moveInstrumentation,
} from '../../scripts/site.js';

/**
 * cards — the live long-form promo card grid (reconstructive: authors add/remove cards).
 *
 * Variants (grid model):
 *   (none)    4-4-4 row inside the primary column
 *   halves    6-6 rows, full container width
 *   quarters  3-3-3-3 rows, full container width (image-less cards)
 *   latest    4-4-4 "latest news" row: authored cards are the fallback; the query index tops
 *             them up with newer /news-and-media/ articles (same count, newest first)
 *
 * Authoring: one row per card.
 *   cell 1 (optional): the card picture
 *   cell 2: h2 with the title link, optional date paragraph ("24 September 2026"), description
 * The whole card head (image + title) becomes the link, as on the live site; external targets
 * get the external glyph and screen-reader suffix.
 *
 * @ew-exempt all (latest variant) — index-driven cards; authored rows are the no-JS fallback
 */

const DATE_RE = /^\s*\d{1,2}\s+[A-Za-z]+\s+\d{4}\s*$/;

function el(tag, className, ...children) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  node.append(...children);
  return node;
}

function icon(name) {
  const i = el('i', `icon icon--${name}`);
  i.setAttribute('aria-hidden', 'true');
  return i;
}

/** wrap the heading's inline content in a span (the hover underline target) + glyph */
function dressHeading(h, external) {
  const title = el('span', '', ...h.childNodes);
  if (external) {
    const a11y = el('span', 'a11y', 'Opens in new window');
    h.append(icon('external'), title, ' ', a11y);
  } else {
    h.append(title, icon('chevron'));
  }
}

function buildCard({
  href, media, heading, date, body,
}) {
  const external = isExternal(href);
  const card = el('div', 'long-form-promo');
  if (!date) card.classList.add('long-form-promo--no-meta');
  if (!media) card.classList.add('long-form-promo--no-image');

  const link = el('a', 'long-form-promo__heading');
  link.href = href;
  if (external) link.rel = 'noopener';
  if (media) link.append(el('div', 'long-form-promo__image', media));
  dressHeading(heading, external);
  link.append(el('div', 'long-form-promo__inner', heading));
  card.append(link);

  const content = el('div', 'long-form-promo__inner-content');
  if (date) content.append(el('div', 'long-form-promo__meta', el('div', 'long-form-promo__date', date)));
  content.append(...body);
  card.append(content);
  return card;
}

function readRow(row) {
  const media = row.querySelector('picture') || row.querySelector('img');
  const heading = row.querySelector('h2, h3, h4');
  const link = heading?.querySelector('a') || row.querySelector('a');
  if (!heading || !link) return null;
  const href = link.getAttribute('href');
  // EW6: card-as-link — unwrap the authored anchor, keep its text in the heading
  link.replaceWith(...link.childNodes);
  const paragraphs = [...row.querySelectorAll('p')].filter((p) => !p.querySelector('picture, img'));
  const date = paragraphs.find((p) => DATE_RE.test(p.textContent));
  const body = paragraphs.filter((p) => p !== date);
  const mediaHolder = media ? (media.closest('p') || media) : null;
  return {
    href, media: mediaHolder, heading, date, body, path: pathOf(href), row,
  };
}

function cardFromIndex(entry) {
  const heading = el('h2', '', entry.title);
  const media = entry.image && !entry.image.includes('default-meta-image')
    ? createOptimizedPicture(entry.image, '', false, [{ media: '(max-width: 479px)', width: '800' }, { width: '800' }])
    : null;
  return {
    href: entry.path,
    media,
    heading,
    date: el('p', '', formatDate(entry.parsedDate)),
    body: entry.description ? [el('p', '', entry.description)] : [],
    path: entry.path,
    generated: true,
  };
}

function render(block, items) {
  const grid = el('div', 'cards__grid');
  items.forEach((item) => {
    const cell = el('div', 'cards__item', item.node);
    // Universal Editor: the authored row's item markers move to the rendered card
    if (item.row) moveInstrumentation(item.row, cell);
    grid.append(cell);
  });
  block.replaceChildren(grid);
}

async function topUp(block, cards) {
  const articles = await fetchArticles();
  if (!articles.length) return;
  const known = new Set(cards.map((c) => c.path));
  const newest = cards.reduce((d, c) => {
    const t = parseDate(c.date?.textContent.trim())?.getTime() || 0;
    return Math.max(d, t);
  }, 0);
  const fresh = articles
    .filter((a) => !known.has(a.path) && a.parsedDate.getTime() > newest)
    .map(cardFromIndex)
    .map((c) => ({ ...c, node: buildCard(c) }));
  if (fresh.length) render(block, [...fresh, ...cards].slice(0, cards.length));
}

export default function decorate(block) {
  const cards = [...block.children].map(readRow).filter(Boolean)
    .map((c) => ({ ...c, node: buildCard(c) }));
  render(block, cards);

  // the index top-up never blocks the section: authored cards render first
  if (block.classList.contains('latest') && cards.length) topUp(block, cards);
}
