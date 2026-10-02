/**
 * share — the live share bar (X / Facebook / LinkedIn intent links), positioned over the banner.
 *
 * Authoring (one row per item):
 *   row 1: the label paragraph ("Share")
 *   rows 2..n: a paragraph with one share link; the link text is the screen-reader label and the
 *     href carries the live templates {URL} and {title}, filled in at runtime.
 * The network (icon) is derived from the href host.
 */
const NETWORKS = [
  { match: /twitter\.com|x\.com/, name: 'twitter', icon: 'x' },
  { match: /facebook\.com/, name: 'facebook', icon: 'facebook' },
  { match: /linkedin\.com/, name: 'linkedin', icon: 'linkedin' },
];

function fillTemplate(href) {
  const url = encodeURIComponent(window.location.href);
  const title = encodeURIComponent(document.title);
  return href
    .replace(/\{URL\}|%7BURL%7D/gi, url)
    .replace(/\{title\}|%7Btitle%7D/gi, title);
}

export default function decorate(block) {
  const paragraphs = [...block.querySelectorAll('p')];
  const label = paragraphs.find((p) => !p.querySelector('a'));
  const links = paragraphs.filter((p) => p.querySelector('a'));

  const root = document.createElement('div');
  root.className = 'share-actions';

  if (label) {
    const outer = document.createElement('div');
    outer.className = 'share-actions__label';
    const inner = document.createElement('div');
    inner.className = 'share-actions__label__inner';
    const i = document.createElement('i');
    i.className = 'icon icon--share';
    i.setAttribute('aria-hidden', 'true');
    inner.append(i, label);
    outer.append(inner);
    root.append(outer);
  }

  const list = document.createElement('ul');
  list.className = 'share-actions__list';
  links.forEach((p) => {
    const a = p.querySelector('a');
    const href = a.getAttribute('href') || '';
    const network = NETWORKS.find((n) => n.match.test(href));
    const li = document.createElement('li');
    li.className = `share-actions__item${network ? ` share-actions__item--${network.name}` : ''}`;
    a.href = fillTemplate(href);
    a.target = '_blank';
    a.rel = 'noopener';
    const text = document.createElement('span');
    text.className = 'a11y';
    text.append(...a.childNodes);
    const i = document.createElement('i');
    i.className = `icon icon--${network ? network.icon : 'share'}`;
    i.setAttribute('aria-hidden', 'true');
    a.append(i, text);
    li.append(p);
    list.append(li);
  });
  root.append(list);
  block.replaceChildren(root);
}
