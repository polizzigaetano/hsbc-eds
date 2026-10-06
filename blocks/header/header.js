import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * header — the live about.hsbc.co.uk chrome (template-slotted).
 *
 * /nav document contract (one section per role):
 *   1. brand: a paragraph holding the logo link (<a href="/"><img alt="HSBC"></a>), or the logo
 *      image alone (AEM / Universal Editor Image component), which then links home
 *   2. primary navigation: one <ul> of links; an item with a nested <ul> of links gets the live
 *      dropdown ("doormat": the item's link as its heading, then the nested links)
 *   3. divisions: one <ul> of links (Personal / Business)
 *
 * Desktop: the item's link toggles its doormat (live: it opens on click, stays open until
 * closed; Escape or a click elsewhere closes it). Below 960px the live off-canvas tray: every
 * primary item drills down to a sub-view (the item as an overview link, then its nested links).
 *
 * Chrome-only generated text (a11y labels and controls, allowlisted in the conversion log):
 * "Skip to:", "Main content", "Search", "Menu", "Back".
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

/** the link of a list item, tolerating the delivered <li><p><a> shape */
function linkOf(li) {
  const a = li.querySelector(':scope > a, :scope > p > a, :scope > strong > a, :scope > p > strong > a');
  const p = a && a.parentElement !== li ? a.closest('li > *') : null;
  if (p && p !== a) p.replaceWith(a);
  return a;
}

/** top-level items of a nav section: { li, a, subs: [{ li, a }] } */
function navItems(section) {
  const list = section?.querySelector('ul');
  if (!list) return [];
  return [...list.children].map((li) => {
    const a = linkOf(li);
    const nested = li.querySelector(':scope > ul');
    const subs = [...(nested?.children || [])]
      .map((s) => ({ li: s, a: linkOf(s) })).filter((s) => s.a);
    nested?.remove();
    return { li, a, subs };
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

/* ---------- desktop doormat ---------- */

function setOpen(item, open) {
  item.classList.toggle('primary-nav__item--open', open);
  item.querySelector(':scope > .primary-nav__link')?.setAttribute('aria-expanded', String(open));
}

function closeDoormats(nav, except) {
  nav.querySelectorAll('.primary-nav__item--open').forEach((item) => {
    if (item !== except) setOpen(item, false);
  });
}

function buildDoormat(item, a, subs, index) {
  const id = `doormat-${index}`;
  const heading = el('a', { class: 'doormat__heading', href: a.getAttribute('href') }, a.textContent.trim());
  const list = el('ul', { class: 'doormat-nav' });
  subs.forEach((sub) => {
    sub.li.className = 'doormat-nav__item';
    sub.a.classList.add('doormat-nav__link');
    if (isCurrent(sub.a.href)) sub.a.setAttribute('aria-current', 'page');
    list.append(sub.li);
  });
  const doormat = el(
    'div',
    { class: 'doormat doormat-minimal', id },
    heading,
    el('div', { class: 'doormat__inner' }, el('div', { class: 'doormat__content' }, list)),
  );
  item.classList.add('primary-nav__item--has-doormat');
  a.setAttribute('aria-expanded', 'false');
  a.setAttribute('aria-controls', id);
  item.append(doormat);
}

/* ---------- mobile tray ---------- */

function trayLink(href, text, cls) {
  const a = el('a', { class: `nav-tray__link ${cls || ''}`.trim(), href }, text);
  if (isCurrent(href)) a.setAttribute('aria-current', 'page');
  return el('li', { class: 'nav-tray__item' }, a);
}

function buildTray(items, divisions) {
  const tray = el('div', {
    class: 'nav-tray', id: 'nav-tray', hidden: '', tabindex: '-1',
  });

  const search = el('form', {
    class: 'nav-tray__search-form', action: '/search', method: 'GET', role: 'search',
  });
  search.append(
    icon('search'),
    el('label', { class: 'a11y', for: 'search-q-tray' }, 'Search'),
    el('input', {
      class: 'nav-tray__search-input', id: 'search-q-tray', type: 'search', name: 'q', placeholder: 'Search',
    }),
  );

  const primary = el('ul', { class: 'nav-tray__items' });
  const views = items.map(({ a, subs, current }, i) => {
    const id = `nav-tray-sub-view-${i + 1}`;
    const text = a.textContent.trim();
    const open = el('a', {
      class: 'nav-tray__link nav-tray__link--primary nav-tray__link--has-sub-links',
      href: `#${id}`,
      'aria-controls': id,
      'aria-expanded': 'false',
    }, text);
    if (current) open.classList.add('nav-tray__link--current');
    primary.append(el('li', { class: 'nav-tray__item' }, open));

    const back = el('button', { class: 'nav-tray__back-button', type: 'button', 'aria-label': 'Back' }, icon('chevron-left'));
    const list = el(
      'ul',
      { class: 'nav-tray__items nav-tray__items--sub-level3' },
      // live: the section's overview link is underlined while you are in that section
      trayLink(a.getAttribute('href'), text, `nav-tray__link--overview${current ? ' nav-tray__link--in-section' : ''}`),
      ...subs.map((s) => trayLink(s.a.getAttribute('href'), s.a.textContent.trim())),
    );
    return el(
      'div',
      { class: 'nav-tray__view nav-tray__sub-view', id, hidden: '' },
      el('div', { class: 'nav-tray__top-bar' }, el('span', { class: 'nav-tray__sub-heading' }, text), back),
      el('div', { class: 'nav-tray__items-container' }, list),
    );
  });

  const tertiary = el('ul', { class: 'nav-tray__items nav-tray__items--tertiary' });
  divisions.forEach(({ a }) => {
    tertiary.append(el('li', { class: 'nav-tray__item' }, el('a', { class: 'nav-tray__link', href: a.getAttribute('href') }, a.textContent.trim())));
  });

  const main = el(
    'div',
    { class: 'nav-tray__view nav-tray__default-view' },
    el('div', { class: 'nav-tray__top-bar' }, search),
    el('div', { class: 'nav-tray__items-container' }, primary, tertiary),
  );
  tray.append(main, ...views);
  return tray;
}

function showSubView(tray, view) {
  tray.querySelectorAll('.nav-tray__sub-view').forEach((v) => {
    const active = v === view;
    v.classList.toggle('nav-tray__sub-view--active', active);
    // out of the tab order once the 0.3s slide-out has ended
    if (active) v.hidden = false;
    else setTimeout(() => { if (!v.classList.contains('nav-tray__sub-view--active')) v.hidden = true; }, 350);
  });
  tray.classList.toggle('nav-tray--show-sub-view', !!view);
  tray.querySelectorAll('.nav-tray__link--has-sub-links').forEach((a) => {
    a.setAttribute('aria-expanded', String(!!view && a.getAttribute('aria-controls') === view.id));
  });
}

function toggleTray(header, force) {
  const toggle = header.querySelector('.nav-tray__toggle');
  const tray = header.querySelector('.nav-tray');
  const open = force !== undefined ? force : toggle.getAttribute('aria-expanded') !== 'true';
  toggle.setAttribute('aria-expanded', String(open));
  tray.hidden = !open;
  if (!open) showSubView(tray, null);
  document.documentElement.classList.toggle('nav-tray--open', open);
  // focus the tray itself: focusing its search field would raise the phone keyboard
  if (open) tray.focus();
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
  const divisionItems = navItems(divisionsSection);
  divisionItems.forEach(({ li, a }) => {
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
  const items = navItems(primarySection);
  items.forEach((item, i) => {
    const { li, a, subs } = item;
    li.className = 'primary-nav__item';
    a.classList.add('primary-nav__link');
    // the section is current on its own page and on any of its sub-pages
    item.current = isCurrent(a.href) || subs.some((s) => isCurrent(s.a.href));
    if (item.current) {
      li.classList.add('primary-nav__item--current');
      if (isCurrent(a.href)) a.setAttribute('aria-current', 'page');
    }
    // tray copies are read before the doormat takes the nested links
    item.subs = subs.map((s) => ({ a: s.a.cloneNode(true) }));
    if (subs.length) buildDoormat(li, a, subs, i);
    primaryNav.append(li);
  });
  nav.append(toggle, brand, primaryNav);
  primary.append(nav);

  // mobile tray: presentational copies of the nav lists (the originals stay the canonical links)
  const tray = buildTray(items, divisionItems);
  const mask = el('div', { class: 'nav-tray__mask', 'aria-hidden': 'true' });

  const header = el('div', { class: 'header__inner', id: 'header' });
  header.append(skip, secondary, primary, tray, mask);
  block.replaceChildren(header);

  // doormat: the item's link toggles it; Escape or a click elsewhere closes it
  primaryNav.querySelectorAll('.primary-nav__item--has-doormat > .primary-nav__link').forEach((a) => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const item = a.parentElement;
      const open = !item.classList.contains('primary-nav__item--open');
      closeDoormats(primaryNav, item);
      setOpen(item, open);
    });
  });
  document.addEventListener('click', (e) => {
    if (!primaryNav.contains(e.target)) closeDoormats(primaryNav);
  });

  toggle.addEventListener('click', (e) => {
    e.preventDefault();
    toggleTray(header);
  });
  mask.addEventListener('click', () => toggleTray(header, false));
  tray.addEventListener('click', (e) => {
    const opener = e.target.closest('.nav-tray__link--has-sub-links');
    const back = e.target.closest('.nav-tray__back-button');
    if (opener) {
      e.preventDefault();
      const view = tray.querySelector(`#${opener.getAttribute('aria-controls')}`);
      showSubView(tray, view);
      view.querySelector('.nav-tray__back-button')?.focus();
    } else if (back) {
      const view = back.closest('.nav-tray__sub-view');
      showSubView(tray, null);
      tray.querySelector(`[aria-controls="${view.id}"]`)?.focus();
    }
  });
  header.addEventListener('keydown', (e) => {
    if (e.code !== 'Escape') return;
    if (toggle.getAttribute('aria-expanded') === 'true') {
      toggleTray(header, false);
      toggle.focus();
    } else {
      const open = primaryNav.querySelector('.primary-nav__item--open');
      if (open) {
        setOpen(open, false);
        open.querySelector(':scope > .primary-nav__link').focus();
      }
    }
  });
  isDesktop.addEventListener('change', () => {
    toggleTray(header, false);
    closeDoormats(primaryNav);
  });

  // the skip link targets <main>
  const main = document.querySelector('main');
  if (main && !main.id) main.id = 'main';
}
