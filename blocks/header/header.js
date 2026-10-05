import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * header — the live about.hsbc.co.uk chrome (template-slotted).
 *
 * /nav document contract (one section per role):
 *   1. brand: a paragraph holding the logo link (<a href="/"><img alt="HSBC"></a>), or the logo
 *      image alone (AEM / Universal Editor Image component), which then links home
 *   2. primary navigation: one <ul> of links
 *   3. divisions: one <ul> of links (Personal / Business)
 *
 * Chrome-only generated text (a11y labels and controls, allowlisted in the conversion log):
 * "Skip to:", "Main content", "Search", "Menu".
 */

const isDesktop = window.matchMedia('(min-width: 960px)');

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
  node.append(...children);
  return node;
}

function icon(name) {
  return el('i', { class: `icon icon--${name}`, 'aria-hidden': 'true' });
}

function isCurrent(href) {
  try {
    const { pathname } = new URL(href, window.location);
    if (pathname === '/') return false;
    const here = window.location.pathname.replace(/\/$/, '');
    return here === pathname || here.startsWith(`${pathname}/`);
  } catch (e) {
    return false;
  }
}

/** list items of a nav section, tolerating the delivered <li><p><a> shape */
function listLinks(section) {
  if (!section) return [];
  return [...section.querySelectorAll('li')].map((li) => {
    const a = li.querySelector('a');
    const p = a && a.parentElement.tagName === 'P' ? a.parentElement : null;
    if (p) p.replaceWith(a);
    return { li, a };
  }).filter(({ a }) => a);
}

function buildSearch() {
  const form = el('form', {
    class: 'search-box', action: '/search', method: 'GET', role: 'search',
  });
  const fields = el('div', { class: 'search-box__fields' });
  const id = 'search-q';
  fields.append(
    el('label', { class: 'a11y', for: id }, 'Search'),
    el('input', {
      class: 'search-box__input', id, type: 'search', name: 'q',
    }),
    el('button', { class: 'search-box__submit', type: 'submit', title: 'Search' }, icon('search')),
  );
  form.append(fields);
  return form;
}

function toggleTray(header, force) {
  const toggle = header.querySelector('.nav-tray__toggle');
  const tray = header.querySelector('.nav-tray');
  const open = force !== undefined ? force : toggle.getAttribute('aria-expanded') !== 'true';
  toggle.setAttribute('aria-expanded', String(open));
  tray.hidden = !open;
  document.documentElement.classList.toggle('nav-tray--open', open);
  if (open) tray.querySelector('a, button, input')?.focus();
}

export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);
  const sections = fragment ? [...fragment.querySelectorAll(':scope > .section')] : [];
  const [brandSection, primarySection, divisionsSection] = sections;

  // skip links
  const skip = el('div', { class: 'skip-links' });
  const skipInner = el('div', { class: 'skip-links__inner' });
  skipInner.append(
    el('div', { class: 'skip-links__list-label' }, 'Skip to:'),
    el('ul', { class: 'skip-links__list' }, el('li', { class: 'skip-links__list-item' }, el('a', { href: '#main' }, 'Main content'))),
  );
  skip.append(skipInner);

  // secondary bar: divisions + search
  const secondary = el('div', { class: 'header__secondary' });
  const secContainer = el('div', { class: 'header__container' });
  const divisions = el('ul', { class: 'divisions-nav' });
  listLinks(divisionsSection).forEach(({ li, a }) => {
    a.classList.add('divisions-nav__link');
    a.replaceChildren(el('span', { class: 'divisions-nav__link-wrap' }, ...a.childNodes));
    divisions.append(li);
  });
  const tools = el('div', { class: 'site-tools' }, buildSearch());
  secContainer.append(divisions, tools);
  secondary.append(secContainer);

  // primary bar: tray toggle, brand, primary nav
  const primary = el('div', { class: 'header__primary' });
  const nav = el('nav', { class: 'header__container', 'aria-label': 'Main' });
  const toggle = el('a', {
    class: 'nav-tray__toggle', href: '#', 'aria-expanded': 'false', 'aria-controls': 'nav-tray',
  }, el('span', { class: 'nav-tray__toggle-label' }, 'Menu'), icon('menu'));
  const brand = el('div', { class: 'brand' });
  let logoLink = brandSection?.querySelector('a');
  if (!logoLink) {
    // a logo authored without a link (the Universal Editor's Image component on AEM) links home
    const logo = brandSection?.querySelector('picture') || brandSection?.querySelector('img');
    if (logo) logoLink = el('a', { href: '/' }, logo);
  }
  if (logoLink) {
    logoLink.classList.add('brand__logo');
    const img = logoLink.querySelector('img');
    if (img) {
      img.classList.add('logo');
      img.width = 134;
      img.height = 26;
      img.loading = 'eager';
    }
    brand.append(logoLink);
  }
  const primaryNav = el('ul', { class: 'primary-nav' });
  listLinks(primarySection).forEach(({ li, a }) => {
    li.classList.add('primary-nav__item');
    a.classList.add('primary-nav__link');
    if (isCurrent(a.href)) {
      li.classList.add('primary-nav__item--current');
      a.setAttribute('aria-current', 'page');
    }
    primaryNav.append(li);
  });
  nav.append(toggle, brand, primaryNav);
  primary.append(nav);

  // mobile tray: presentational copies of the nav lists (the originals stay the canonical links)
  const tray = el('div', { class: 'nav-tray', id: 'nav-tray', hidden: '' });
  const trayNav = primaryNav.cloneNode(true);
  trayNav.className = 'nav-tray__primary';
  const trayDivisions = divisions.cloneNode(true);
  trayDivisions.className = 'nav-tray__divisions';
  tray.append(buildSearch(), trayNav, trayDivisions);
  tray.querySelector('#search-q').id = 'search-q-tray';
  tray.querySelector('label').setAttribute('for', 'search-q-tray');

  const header = el('div', { class: 'header__inner', id: 'header' });
  header.append(skip, secondary, primary, tray);
  block.replaceChildren(header);

  toggle.addEventListener('click', (e) => {
    e.preventDefault();
    toggleTray(header);
  });
  header.addEventListener('keydown', (e) => {
    if (e.code === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      toggleTray(header, false);
      toggle.focus();
    }
  });
  isDesktop.addEventListener('change', () => toggleTray(header, false));

  // the skip link targets <main>
  const main = document.querySelector('main');
  if (main && !main.id) main.id = 'main';
}
