import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * footer — the live black utility footer (template-slotted).
 *
 * /footer document contract:
 *   section 1: one <ul> of utility links
 *   section 2: the copyright paragraph
 */
export default async function decorate(block) {
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  const utility = document.createElement('div');
  utility.className = 'footer__utility';
  const inner = document.createElement('div');
  inner.className = 'footer__inner';
  utility.append(inner);

  if (fragment) {
    const list = fragment.querySelector('ul');
    if (list) {
      const nav = document.createElement('nav');
      nav.className = 'footer__utility__nav';
      nav.setAttribute('aria-label', 'Footer');
      list.classList.add('footer__utility__list');
      list.querySelectorAll(':scope > li').forEach((li) => {
        li.classList.add('footer__item');
        const a = li.querySelector('a');
        if (a) {
          if (a.parentElement.tagName === 'P') a.parentElement.replaceWith(a);
          a.classList.add('footer__link');
        }
      });
      nav.append(list);
      inner.append(nav);
    }
    const copyright = [...fragment.querySelectorAll('p')].find((p) => !p.closest('ul'));
    if (copyright) {
      const wrap = document.createElement('div');
      wrap.className = 'footer__copyright';
      wrap.append(copyright);
      inner.append(wrap);
    }
  }

  block.replaceChildren(utility);
}
