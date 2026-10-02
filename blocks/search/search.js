import {
  fetchIndex, formatDate, parseDate, moveInstrumentation,
} from '../../scripts/site.js';

/**
 * search — site search on /search, backed by the query index (interim: replaces the live
 * server-side search; see stardust/dynamic-features.md row 1).
 *
 * Authoring:
 *   row 1: the search field label / placeholder ("Search")
 *   row 2: the no-results message
 * The query comes from ?q= (header search) or ?query= (the live results page form).
 *
 * @ew-exempt all — index-driven results; the authored rows are labels
 */
function el(tag, className, ...children) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  node.append(...children);
  return node;
}

function terms(query) {
  return query.toLowerCase().split(/\s+/).filter(Boolean);
}

function render(results, list, empty, query) {
  list.replaceChildren();
  empty.hidden = !query || results.length > 0;
  results.forEach((r) => {
    const link = el('a', '', el('span', 'search__title', r.title || r.path));
    link.href = r.path;
    const item = el('li', 'search__item', link);
    const date = parseDate(r.date);
    if (date) item.append(el('span', 'search__date', formatDate(date)));
    if (r.description) item.append(el('span', 'search__description', r.description));
    list.append(item);
  });
}

export default async function decorate(block) {
  const rows = [...block.children];
  const labelPara = rows[0]?.querySelector('p') || rows[0]?.firstElementChild;
  const emptyPara = rows[1]?.querySelector('p') || rows[1]?.firstElementChild;
  const labelText = labelPara?.textContent.trim() || '';
  // Universal Editor: the two text fields' markers onto the paragraphs that render them
  moveInstrumentation(rows[0]?.firstElementChild, labelPara);
  moveInstrumentation(rows[1]?.firstElementChild, emptyPara);

  const params = new URLSearchParams(window.location.search);
  const query = (params.get('q') || params.get('query') || '').trim();

  const form = el('form', 'search-box__inner');
  form.action = window.location.pathname;
  form.method = 'GET';
  form.setAttribute('role', 'search');
  const fields = el('div', 'search-box__fields');
  const label = el('label', 'a11y');
  label.htmlFor = 'search-body';
  if (labelPara) label.append(labelPara);
  const input = el('input', 'search-box__input');
  input.id = 'search-body';
  input.type = 'search';
  input.name = 'q';
  input.placeholder = labelText;
  input.value = query;
  const submit = el('button', 'search-box__submit');
  submit.type = 'submit';
  submit.title = labelText;
  const glyph = el('i', 'icon icon--search');
  glyph.setAttribute('aria-hidden', 'true');
  submit.append(glyph);
  fields.append(label, input, submit);
  form.append(fields);

  const list = el('ul', 'search__results');
  const empty = el('div', 'search__empty');
  if (emptyPara) empty.append(emptyPara);
  empty.hidden = true;
  block.replaceChildren(form, el('div', 'search-results', empty, list));

  if (!query) return;
  const words = terms(query);
  const index = await fetchIndex();
  const results = index
    .filter((r) => !/noindex/i.test(r.robots || ''))
    .map((r) => {
      const title = (r.title || '').toLowerCase();
      const hay = `${title} ${(r.description || '').toLowerCase()}`;
      if (!words.every((w) => hay.includes(w))) return null;
      return { ...r, score: words.filter((w) => title.includes(w)).length };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score || (parseDate(b.date) || 0) - (parseDate(a.date) || 0));
  render(results, list, empty, query);
}
