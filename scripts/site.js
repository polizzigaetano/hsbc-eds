/*
 * Site helpers shared by blocks (the only cross-block module besides aem.js / fragment.js).
 * Live behaviour mirrored from www.about.hsbc.co.uk; interim decisions are listed in
 * stardust/dynamic-features.md.
 */

/** hosts that are "this site" (the live origin stays internal while it serves legacy media) */
const SITE_HOSTS = ['www.about.hsbc.co.uk', 'about.hsbc.co.uk'];

/** live HSBC.countryExternalWhitelist: external, but no leaving interstitial */
export const LEAVING_WHITELIST = [
  'https://www.hsbc.com',
  'https://www.hsbc.co.uk/current-accounts/products/advance/',
  'https://www.hsbc.co.uk/current-accounts/products/premier/day-to-day-banking/bank-account/',
];

const DOWNLOAD_EXT = /\.(pdf|xlsx?|docx?|pptx?|csv|zip)$/i;

export function toURL(href) {
  try {
    return new URL(href, window.location.href);
  } catch (e) {
    return null;
  }
}

export function isExternal(href) {
  const url = toURL(href);
  if (!url || !/^https?:$/.test(url.protocol)) return false;
  if (url.host === window.location.host) return false;
  return !SITE_HOSTS.includes(url.host);
}

export function isDownload(href) {
  const url = toURL(href);
  return !!url && DOWNLOAD_EXT.test(url.pathname);
}

export function needsLeavingConfirmation(href) {
  if (!isExternal(href)) return false;
  return !LEAVING_WHITELIST.some((prefix) => href.startsWith(prefix));
}

function icon(name) {
  const i = document.createElement('i');
  i.className = `icon icon--${name}`;
  i.setAttribute('aria-hidden', 'true');
  return i;
}

function a11y(text) {
  const span = document.createElement('span');
  span.className = 'a11y';
  span.textContent = text;
  return span;
}

/**
 * Live rich-text link treatment: an external-link glyph before external links (+ "Opens in new
 * window" for screen readers) and a download glyph before document links (+ "Download").
 * Generated strings are screen-reader labels only (allowlisted in the conversion log).
 * @param {Element} root container to decorate
 */
export function decorateLinks(root) {
  root.querySelectorAll('a[href]').forEach((a) => {
    if (a.dataset.linkDecorated) return;
    if (a.closest('header, footer, .cards, .share, .hero, .terms-gate, .cinemagraph, .accordion li')) return;
    if (a.querySelector('img, picture')) return;
    a.dataset.linkDecorated = 'true';
    const href = a.getAttribute('href');
    if (isDownload(href)) {
      a.before(icon('download'));
      a.prepend(a11y(' Download'));
    } else if (isExternal(href)) {
      a.before(icon('external'));
      a.append(a11y(' Opens in new window'));
      a.rel = 'noopener';
    }
  });
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December'];

/** parse an index / metadata date (ISO, "3 August 2022", or epoch seconds) */
export function parseDate(value) {
  if (value === undefined || value === null || value === '') return null;
  if (/^\d{9,11}$/.test(String(value))) return new Date(Number(value) * 1000);
  const m = String(value).match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/);
  if (m) {
    const abbr = m[2].toLowerCase().slice(0, 3);
    const month = MONTHS.findIndex((name) => name.toLowerCase().startsWith(abbr));
    if (month >= 0) return new Date(Date.UTC(Number(m[3]), month, Number(m[1])));
  }
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** "24 September 2026" (long) / "24 Sep 2026" (short), as the live listings print them */
export function formatDate(date, style = 'long') {
  if (!date) return '';
  const month = MONTHS[date.getUTCMonth()];
  return `${date.getUTCDate()} ${style === 'short' ? month.slice(0, 3) : month} ${date.getUTCFullYear()}`;
}

export function monthName(date) {
  return MONTHS[date.getUTCMonth()];
}

let indexPromise;
/**
 * Loads the site query index (all pages, following the offset pagination).
 * @returns {Promise<Array<Object>>} index rows ([] when the index is unavailable)
 */
export function fetchIndex() {
  if (!indexPromise) {
    indexPromise = (async () => {
      const rows = [];
      let offset = 0;
      try {
        for (;;) {
          // eslint-disable-next-line no-await-in-loop
          const resp = await fetch(`/query-index.json?offset=${offset}&limit=500`);
          if (!resp.ok) break;
          // eslint-disable-next-line no-await-in-loop
          const json = await resp.json();
          rows.push(...(json.data || []));
          offset += (json.data || []).length;
          if (!json.data?.length || offset >= (json.total || 0)) break;
        }
      } catch (e) {
        // index unavailable: blocks keep their authored rows
      }
      return rows;
    })();
  }
  return indexPromise;
}

/** index rows that are news articles, newest first, with a parsed date */
export async function fetchArticles() {
  const rows = await fetchIndex();
  return rows
    .filter((r) => r.path && r.path.startsWith('/news-and-media/'))
    .map((r) => ({ ...r, parsedDate: parseDate(r.date || r['publication-date']) }))
    .filter((r) => r.parsedDate)
    .sort((a, b) => b.parsedDate - a.parsedDate);
}

/** normalise a link to a comparable path (localized or still pointing at the live host) */
export function pathOf(href) {
  const url = toURL(href);
  if (!url) return href;
  return url.pathname.replace(/\.html$/, '').replace(/\/$/, '') || '/';
}
