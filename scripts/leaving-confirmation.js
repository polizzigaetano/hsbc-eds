/*
 * Leaving-HSBC / e-mail confirmations (live .leaving-confirmation interstitials).
 * External links outside the live whitelist and mailto: links open a confirmation dialog whose
 * copy is AUTHORED in two fragments (live copy, interim until Compliance signs it off — see
 * stardust/dynamic-features.md row 4):
 *   /fragments/leaving-hsbc   heading, copy, "proceed" link (#proceed), "cancel" link (#cancel)
 *   /fragments/email-us       same shape
 */
import { loadCSS } from './aem.js';
import { needsLeavingConfirmation } from './site.js';

const FRAGMENTS = {
  external: '/fragments/leaving-hsbc',
  email: '/fragments/email-us',
};

const cache = {};

async function loadDialogContent(kind) {
  if (!cache[kind]) {
    cache[kind] = (async () => {
      const resp = await fetch(`${FRAGMENTS[kind]}.plain.html`);
      if (!resp.ok) return null;
      const html = await resp.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');
      return doc.body;
    })();
  }
  return cache[kind];
}

function el(tag, className, ...children) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  node.append(...children);
  return node;
}

let current = null;

function close() {
  if (!current) return;
  const { lightbox, overlay, opener } = current;
  lightbox.remove();
  overlay.remove();
  document.documentElement.classList.remove('no-scroll');
  current = null;
  opener?.focus();
}

async function open(kind, link) {
  const body = await loadDialogContent(kind);
  if (!body) return false;
  await loadCSS(`${window.hlx.codeBasePath}/styles/lightbox.css`);
  const content = body.cloneNode(true);
  const heading = content.querySelector('h1, h2, h3');
  const paragraphs = [...content.querySelectorAll('p')];
  const proceedPara = paragraphs.find((p) => p.querySelector('a[href*="#proceed"]'));
  const cancelPara = paragraphs.find((p) => p.querySelector('a[href*="#cancel"]'));
  const copy = paragraphs.filter((p) => p !== proceedPara && p !== cancelPara);

  const box = el('div', 'leaving-confirmation');
  if (heading) {
    heading.id = 'leaving-confirmation-heading';
    box.append(el('div', 'leaving-confirmation__heading', heading));
  }
  box.append(el('div', 'leaving-confirmation__copy', ...copy));
  const links = el('div', 'leaving-confirmation__links');
  const proceed = proceedPara?.querySelector('a');
  if (proceed) {
    proceed.className = 'button button--large leaving-confirmation__proceed';
    proceed.href = link.href;
    if (kind === 'external') {
      proceed.target = '_blank';
      proceed.rel = 'noopener nofollow';
    }
    proceed.addEventListener('click', () => setTimeout(close));
    links.append(proceedPara);
  }
  const cancel = cancelPara?.querySelector('a');
  if (cancel) {
    cancel.className = 'button button--large button--link leaving-confirmation__close';
    cancel.addEventListener('click', (e) => {
      e.preventDefault();
      close();
    });
    links.append(cancelPara);
  }
  box.append(links);

  const closer = el('a', 'lightbox__close');
  closer.href = '#';
  closer.title = 'Close notification';
  closer.setAttribute('aria-label', 'Close notification');
  closer.addEventListener('click', (e) => {
    e.preventDefault();
    close();
  });
  const lightbox = el('div', 'lightbox lightbox--active', el('div', 'lightbox__inner', closer, box));
  lightbox.setAttribute('role', 'dialog');
  lightbox.setAttribute('aria-modal', 'true');
  if (heading) lightbox.setAttribute('aria-labelledby', heading.id);
  const overlay = el('div', 'lightbox-overlay lightbox-overlay--active');
  overlay.addEventListener('click', close);
  lightbox.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });
  document.body.append(lightbox, overlay);
  document.documentElement.classList.add('no-scroll');
  current = { lightbox, overlay, opener: link };
  (proceed || closer).focus();
  return true;
}

function kindOf(link) {
  const href = link.getAttribute('href') || '';
  if (href.startsWith('mailto:')) return 'email';
  if (needsLeavingConfirmation(link.href)) return 'external';
  return null;
}

export default function init() {
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href]');
    if (!link || e.defaultPrevented || link.closest('.lightbox, .share')) return;
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    // inside the da.live editor links never navigate
    if (link.closest('.prosemirror-editor')) return;
    const kind = kindOf(link);
    if (!kind) return;
    e.preventDefault();
    open(kind, link).then((shown) => {
      if (!shown) window.open(link.href, kind === 'external' ? '_blank' : '_self', 'noopener');
    });
  });
}
