import {
  fetchArticles, formatDate, monthName, parseDate, pathOf,
} from '../../scripts/site.js';

/**
 * accordion — the live multi-open accordion with tabular lists (reconstructive).
 *
 * Authoring: one row per item — cell 1 the item heading (h2/h3), cell 2 the panel content.
 * Panel content, in authored order:
 *   - prose (p, h4…) renders as rich text
 *   - a list (ul) renders as the live tabular list, one row per <li>:
 *       documents  <li><a href="…pdf">Title</a> English PDF 167.89 KB</li>
 *       articles   <li>24 Sep 2026 <a href="/news-and-media/…">Title</a> optional description</li>
 *   - (default variant) headings one level below the item heading open NESTED items: each such
 *     heading and the content up to the next one become a nested accordion (live
 *     accordion-nested, e.g. Covered Bond "Investor reports" by year).
 *
 * Variant `news-archive`: year items of month headings (h4) and article lists. The authored rows
 * are the baseline archive; the query index tops it up with newer /news-and-media/ articles
 * (placed by year and month, de-duplicated by path) — never blocking the first render.
 *
 * EW7: the heading row is the click target; the <button> is a chevron-only toggle named by the
 * heading (aria-labelledby), so the authored heading stays editable.
 * @ew-exempt <li> article rows added from the query index (news-archive) — index-driven
 */

let uid = 0;

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

function headingLevel(h) {
  return h ? Number(h.tagName.slice(1)) : 2;
}

/* ---------- tabular list rows ---------- */

const SIZE_RE = /(\d[\d.,]*\s*(?:KB|MB|GB|bytes?))\s*$/i;

function splitAroundLink(li, a) {
  const before = [];
  const after = [];
  let seen = false;
  [...li.childNodes].forEach((n) => {
    if (n === a || (n.nodeType === 1 && n.contains(a))) {
      seen = true;
      return;
    }
    (seen ? after : before).push(n);
  });
  return { before, after };
}

function textOf(nodes) {
  return nodes.map((n) => n.textContent).join('').replace(/\s+/g, ' ').trim();
}

function decorateDocumentRow(li, a) {
  const { after } = splitAroundLink(li, a);
  const meta = textOf(after);
  after.forEach((n) => n.remove());
  const size = (meta.match(SIZE_RE) || [])[1] || '';
  const rest = meta.replace(SIZE_RE, '').trim().split(' ').filter(Boolean);
  const type = rest.length ? rest.pop() : '';
  const language = rest.join(' ');

  const title = el('span', 'tabular-list__title', ...a.childNodes);
  a.append(icon('download'), el('span', 'a11y', 'Download'), title);
  const id = `doc-${uid += 1}`;
  a.setAttribute('aria-describedby', id);
  const wrapper = el('span', 'tabular-list__title-wrapper', a, el('span', 'tabular-list__description'));
  const row = el('span', 'tabular-list__row');
  row.id = id;
  row.append(
    el('span', 'tabular-list__cell'),
    el('span', 'tabular-list__cell', language),
    el('span', 'tabular-list__cell', type),
    el('span', 'tabular-list__cell tabular-list__file-size', size),
  );
  li.replaceChildren(el('div', 'tabular-list__details', wrapper, row));
}

function articleRow(li, { date, link, description }) {
  const title = el('span', 'tabular-list__title', ...link.childNodes);
  link.append(title);
  const details = el(
    'div',
    'tabular-list__details',
    el('span', 'tabular-list__title-wrapper', link, ' ', icon('chevron'), ' ', el('span', 'tabular-list__description', ...description)),
  );
  li.replaceChildren(el('div', 'tabular-list__cell tabular-list__date', date), details);
  return li;
}

function decorateArticleRow(li, a) {
  const { before, after } = splitAroundLink(li, a);
  const date = textOf(before);
  before.forEach((n) => n.remove());
  const description = after.filter((n) => n.textContent.trim());
  return articleRow(li, { date, link: a, description });
}

function decorateList(ul, archive) {
  const wrap = el('div', 'tabular-list');
  ul.before(wrap);
  wrap.append(ul);
  [...ul.children].forEach((li) => {
    li.classList.add('tabular-list__item');
    const a = li.querySelector('a');
    if (!a) return;
    if (archive) decorateArticleRow(li, a);
    else decorateDocumentRow(li, a);
  });
  return wrap;
}

/* ---------- panel content ---------- */

/** group panel children into .text runs and tabular lists, in authored order */
function renderFlow(nodes, archive) {
  const out = [];
  let text = null;
  nodes.forEach((n) => {
    if (n.tagName === 'UL' || n.tagName === 'OL') {
      text = null;
      out.push(decorateList(n, archive));
    } else {
      if (!text) {
        text = el('div', 'text');
        out.push(text);
      }
      text.append(n);
    }
  });
  return out;
}

function toggleItem(item, open) {
  const { prefix } = item.dataset;
  const button = item.querySelector(`:scope > .${prefix}__heading .${prefix}__toggle`);
  const panel = item.querySelector(`:scope > .${prefix}__content`);
  const chevron = button.querySelector('.icon');
  item.classList.toggle(`${prefix}__item--active`, open);
  button.setAttribute('aria-expanded', String(open));
  chevron.classList.toggle('icon--chevron-down', !open);
  chevron.classList.toggle('icon--chevron-up', open);
  panel.hidden = !open;
}

function buildItem(prefix, heading, contentNodes) {
  uid += 1;
  const item = el('div', `${prefix}__item`);
  item.dataset.prefix = prefix;
  const headId = heading.id || `${prefix}-heading-${uid}`;
  heading.id = headId;
  const panelId = `${prefix}-panel-${uid}`;

  const toggle = el('button', `${prefix}__toggle`, icon('chevron-down'));
  toggle.type = 'button';
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-controls', panelId);
  toggle.setAttribute('aria-labelledby', headId);
  const head = el('div', `${prefix}__heading`, el('div', `${prefix}__title`, heading), toggle);
  head.addEventListener('click', (e) => {
    if (e.target.closest(`.${prefix}__content`)) return;
    toggleItem(item, !item.classList.contains(`${prefix}__item--active`));
  });

  const inner = el('div', `${prefix}__inner`, ...contentNodes);
  const panel = el('div', `${prefix}__content`, inner);
  panel.id = panelId;
  panel.setAttribute('role', 'region');
  panel.setAttribute('aria-labelledby', headId);
  panel.hidden = true;
  item.append(head, panel);
  return item;
}

function renderPanel(nodes, level, archive) {
  if (archive) return renderFlow(nodes, true);
  const nestedTag = `H${Math.min(level + 1, 6)}`;
  const groups = [];
  const lead = [];
  nodes.forEach((n) => {
    if (n.tagName === nestedTag) groups.push({ heading: n, nodes: [] });
    else if (groups.length) groups[groups.length - 1].nodes.push(n);
    else lead.push(n);
  });
  const out = renderFlow(lead, false);
  if (groups.length) {
    const nested = el('div', 'accordion-nested__mid--hiddenitems');
    groups.forEach((g) => nested.append(buildItem('accordion-nested', g.heading, renderFlow(g.nodes, false))));
    out.push(nested);
  }
  return out;
}

/* ---------- news archive top-up from the query index ---------- */

function yearOf(item) {
  return item.querySelector('.accordion__title').textContent.trim();
}

function ensureMonth(inner, month) {
  const headings = [...inner.querySelectorAll(':scope > .text h4')];
  const found = headings.find((h) => h.textContent.trim() === month);
  if (found) return found.closest('.text').nextElementSibling?.querySelector('ul');
  const text = el('div', 'text', el('h4', '', month));
  const list = el('ul');
  const wrap = el('div', 'tabular-list', list);
  inner.prepend(text, wrap);
  return list;
}

async function topUpArchive(block, prefixLevel) {
  const articles = await fetchArticles();
  if (!articles.length) return;
  const known = new Set([...block.querySelectorAll('.tabular-list a[href]')].map((a) => pathOf(a.getAttribute('href'))));
  const fresh = articles.filter((a) => !known.has(a.path)).reverse(); // oldest first, prepend
  fresh.forEach((entry) => {
    const year = String(entry.parsedDate.getUTCFullYear());
    let item = [...block.querySelectorAll(':scope > .accordion__item')].find((i) => yearOf(i) === year);
    if (!item) {
      const h = el(`h${prefixLevel}`, '', year);
      item = buildItem('accordion', h, []);
      const later = [...block.querySelectorAll(':scope > .accordion__item')].find((i) => Number(yearOf(i)) < Number(year));
      if (later) later.before(item); else block.append(item);
    }
    const inner = item.querySelector('.accordion__inner');
    const list = ensureMonth(inner, monthName(entry.parsedDate));
    if (!list) return;
    const link = el('a', '', entry.title);
    link.href = entry.path;
    const li = articleRow(el('li', 'tabular-list__item'), {
      date: formatDate(entry.parsedDate, 'short'),
      link,
      description: [],
    });
    // keep the month newest-first
    const rows = [...list.children];
    const next = rows.find((r) => {
      const d = parseDate(r.querySelector('.tabular-list__date')?.textContent.trim());
      return d && d < entry.parsedDate;
    });
    if (next) next.before(li); else list.append(li);
  });
}

export default function decorate(block) {
  const archive = block.classList.contains('news-archive');
  const rows = [...block.children];
  let level = 3;
  const items = rows.map((row) => {
    const [titleCell, contentCell] = row.children;
    if (!titleCell) return null;
    let heading = titleCell.querySelector('h1, h2, h3, h4, h5, h6');
    if (!heading) {
      // harness-only fallback: a bare-text title cell (DA content always carries the heading)
      heading = el('h3');
      heading.append(...(titleCell.querySelector('p') || titleCell).childNodes);
    }
    level = headingLevel(heading);
    const nodes = contentCell ? [...contentCell.children] : [];
    return buildItem('accordion', heading, renderPanel(nodes, level, archive));
  }).filter(Boolean);
  block.replaceChildren(...items);

  if (archive) topUpArchive(block, level);
}
