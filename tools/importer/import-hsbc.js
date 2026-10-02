/* eslint-disable */
/* global WebImporter */

/**
 * About HSBC UK importer (same-design replica). One script for every archetype: the live site is
 * a Sitecore component library, so pages are walked layout row by layout row and each live
 * component maps to its EDS block / default content. Section boundaries follow the live layout
 * rows; the closed section-style vocabulary carries the live row spacing:
 *   continued   same live layout row as the previous section (no row gap)
 *   spaced      the first rich text in the section starts with a live <br> spacer line
 *   full        12-column rich text
 *   dropcap     12-column rich text led by a <br> spacer (home "Our services")
 *   disclaimer  notes-to-editors small print, continuing the article body
 *   gap         an empty live 9-3 layout row (its row gap; the section has no content)
 *   gap-wide    an empty live 6-3-3 layout row
 * The home page import also emits /nav, /footer and the two confirmation fragments.
 */

import cleanupTransformer from './transformers/hsbc-cleanup.js';
import {
  parseHero, parseShare, parsePageDescription, parseCinemagraph, parseColumns, cardRow,
  parseProfiles, parseTermsGate, confirmationFragment,
} from './parsers/simple-blocks.js';
import { parseAccordion } from './parsers/accordion.js';
import { parseAside } from './parsers/aside.js';
import {
  block, sectionMetadata, textNodes, visibleText, img, p, link, liveImageSrc, pageHref, cleanRichText,
} from './utils.js';

const transformers = [cleanupTransformer];

const PAGE_TEMPLATE = {
  name: 'hsbc-replica',
  description: 'About HSBC UK — every live archetype through one component walker',
  blocks: [
    { name: 'hero', instances: ['.layout--full .header-area__image'] },
    { name: 'share', instances: ['.share-actions'] },
    { name: 'page-description', instances: ['.page-description'] },
    { name: 'cinemagraph', instances: ['.cinemagraph'] },
    { name: 'columns', instances: ['.layout--6-6:has(.inline-image)'] },
    { name: 'cards', instances: ['.long-form-promo'] },
    { name: 'accordion', instances: ['.accordion'] },
    { name: 'profile', instances: ['.exec-bio'] },
    { name: 'aside', instances: ['.layout__secondary'] },
    { name: 'terms-gate', instances: ['.leaving-confirmation--modal-onload'] },
    { name: 'search', instances: ['.search-box'] },
  ],
};

function executeTransformers(hookName, element, payload) {
  transformers.forEach((fn) => {
    try {
      fn.call(null, hookName, element, { ...payload, template: PAGE_TEMPLATE });
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august',
  'september', 'october', 'november', 'december'];

function isoDate(text) {
  const m = (text || '').trim().match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/);
  if (!m) return '';
  const month = MONTHS.findIndex((name) => name.startsWith(m[2].toLowerCase().slice(0, 3)));
  if (month < 0) return '';
  return `${m[3]}-${String(month + 1).padStart(2, '0')}-${m[1].padStart(2, '0')}`;
}

/* ---------------- section builder ---------------- */

class Sections {
  constructor(document) {
    this.document = document;
    this.list = [];
    this.current = null;
  }

  open(style) {
    this.current = { nodes: [], style: style || '', hasText: false, lastWasText: false };
    this.list.push(this.current);
    return this.current;
  }

  ensure() {
    return this.current || this.open();
  }

  addBlock(table) {
    if (!table) return;
    const s = this.ensure();
    s.nodes.push(table);
    s.lastWasText = false;
  }

  /** rich text of one live .text component */
  addText(nodes, { leadingBreak = false } = {}) {
    if (!nodes.length) return;
    let s = this.ensure();
    if (s.lastWasText) s = this.open('continued');
    if (!s.hasText && leadingBreak && !s.style) s.style = 'spaced';
    s.nodes.push(...nodes);
    s.hasText = true;
    s.lastWasText = true;
  }

  close() {
    this.current = null;
  }

  render(main) {
    const doc = this.document;
    const sections = this.list.filter((s) => s.nodes.length || s.isGap);
    sections.forEach((s, i) => {
      s.nodes.forEach((n) => main.append(n));
      if (s.style) main.append(sectionMetadata(doc, s.style));
      if (i < sections.length - 1) main.append(doc.createElement('hr'));
    });
  }
}

/* ---------------- components ---------------- */

function addTextComponent(sections, document, textEl) {
  const disclaimer = textEl.querySelector(':scope > .disclaimer');
  if (disclaimer) disclaimer.remove();
  const { nodes, leadingBreak } = textNodes(document, textEl);
  sections.addText(nodes.filter((n) => n.tagName !== 'DIV'), { leadingBreak });
  if (disclaimer) {
    const { nodes: small } = textNodes(document, disclaimer);
    sections.open('disclaimer');
    sections.current.nodes.push(...small);
    sections.current.hasText = true;
  }
}

function cardsBlock(document, promos, variant) {
  const rows = promos.map((promo) => cardRow(document, promo));
  return block(document, variant ? `Cards (${variant})` : 'Cards', rows);
}

function processPrimary(sections, document, primary, ctx) {
  let bios = [];
  const flushBios = () => {
    if (bios.length) sections.addBlock(parseProfiles(document, bios));
    bios = [];
  };
  [...primary.children].forEach((c) => {
    if (!c.matches('.exec-bio')) flushBios();
    if (c.matches('.share-actions')) {
      sections.addBlock(parseShare(document, c));
    } else if (c.matches('.page-description')) {
      const { table, date } = parsePageDescription(document, c);
      if (date) ctx.date = date;
      sections.addBlock(table);
    } else if (c.matches('.text')) {
      addTextComponent(sections, document, c);
    } else if (c.matches('.accordion')) {
      sections.addBlock(parseAccordion(document, c, { archive: !!c.querySelector('dl.tabular-list, .tabular-list__date') }));
    } else if (c.matches('.exec-bio')) {
      bios.push(c);
    } else if (c.matches('.layout-container')) {
      c.querySelectorAll(':scope > .layout--4-4-4').forEach((grid) => {
        const promos = [...grid.querySelectorAll('.long-form-promo')];
        if (promos.length) sections.addBlock(cardsBlock(document, promos, grid.matches('.layout--spaced') ? 'latest' : ''));
      });
    } else if (c.matches('.search-box')) {
      // live results page: the box label + the no-results message become the Search block
      const label = visibleText(c.querySelector('label')) || c.querySelector('input')?.getAttribute('placeholder') || 'Search';
      const empty = visibleText(primary.querySelector('.search-result-summary p'));
      sections.addBlock(block(document, 'Search', [[p(document, label)], [p(document, empty)]]));
    } else if (c.matches('.search-results, .tabs')) {
      // rendered by the Search block from the query index
    } else if (c.matches('.long-form-promo')) {
      sections.addBlock(cardsBlock(document, [c], ''));
    } else if (c.textContent.trim() || c.querySelector('img')) {
      // loose rich text directly in the column
      const clone = cleanRichText(c.cloneNode(true));
      sections.addText([clone]);
    }
  });
  flushBios();
}

function processRow(sections, document, row, ctx) {
  const primary = row.querySelector(':scope > .layout__primary');
  const secondary = row.querySelector(':scope > .layout__secondary');
  const hasContent = (el) => el && (el.textContent.trim() || el.querySelector('img'));

  if (row.matches('.cinemagraph')) {
    sections.open();
    sections.addBlock(parseCinemagraph(document, row));
    sections.close();
    return;
  }
  if (row.matches('.layout--12')) {
    primary?.querySelectorAll(':scope > .text').forEach((t) => {
      const { nodes, leadingBreak } = textNodes(document, t);
      sections.open(t.matches('.text--dropcap') && leadingBreak ? 'dropcap' : 'full');
      sections.current.nodes.push(...nodes);
      sections.current.hasText = true;
    });
    sections.close();
    return;
  }
  if (row.matches('.layout--6-6, .layout--3-3-3-3, .layout--4-4-4')) {
    const promos = [...row.querySelectorAll('.long-form-promo')];
    if (promos.length) {
      const variant = row.matches('.layout--6-6') ? 'halves' : row.matches('.layout--3-3-3-3') ? 'quarters' : '';
      const prev = sections.list[sections.list.length - 1];
      // consecutive live rows of the same grid are ONE authored cards block
      if (prev && prev.cardsVariant === variant && prev.cardsPromos) {
        prev.cardsPromos.push(...promos);
        prev.nodes[prev.nodes.length - 1] = cardsBlock(document, prev.cardsPromos, variant);
      } else {
        const s = sections.open();
        s.cardsVariant = variant;
        s.cardsPromos = promos;
        s.nodes.push(cardsBlock(document, promos, variant));
      }
      sections.close();
      return;
    }
    if (row.querySelector('.inline-image')) {
      sections.open();
      sections.addBlock(parseColumns(document, row));
      sections.close();
      return;
    }
  }
  if (!hasContent(primary) && !hasContent(secondary)) {
    // an empty live layout row still adds its 20px row gap: an empty `gap` section carries it
    const gap = sections.open(row.matches('.layout--6-3-3') ? 'gap-wide' : 'gap');
    gap.isGap = true;
    sections.close();
    return;
  }
  sections.open();
  if (primary) processPrimary(sections, document, primary, ctx);
  if (hasContent(secondary)) {
    const aside = parseAside(document, secondary);
    if (aside) {
      sections.open();
      sections.addBlock(aside);
    }
  }
  sections.close();
}

function buildPage(document, url) {
  const live = document.querySelector('main#page') || document.querySelector('main');
  const sections = new Sections(document);
  const ctx = {};

  const gate = document.querySelector('.lightbox .leaving-confirmation--modal-onload');
  if (gate) {
    sections.open();
    sections.addBlock(parseTermsGate(document, gate));
    sections.close();
  }

  [...live.children].forEach((child) => {
    if (child.matches('.layout--full')) {
      const hero = parseHero(document, child);
      if (hero) {
        sections.open();
        sections.addBlock(hero);
        sections.close();
      }
    } else if (child.matches('.layout-container')) {
      [...child.children].forEach((row) => processRow(sections, document, row, ctx));
    }
  });

  const main = document.createElement('div');
  sections.render(main);

  // page metadata (config only — D14)
  const meta = {};
  const title = document.querySelector('title');
  if (title) meta.Title = title.textContent.replace(/\s+/g, ' ').trim();
  const desc = document.querySelector('meta[name="description"]');
  if (desc?.content) meta.Description = desc.content.trim();
  const keywords = document.querySelector('meta[name="keywords"]');
  if (keywords?.content) meta.Keywords = keywords.content.trim();
  const iso = isoDate(ctx.date);
  if (iso && new URL(url).pathname.startsWith('/news-and-media/')) meta['Publication Date'] = iso;
  main.append(WebImporter.Blocks.getMetadataBlock(document, meta));
  return main;
}

/* ---------------- chrome + fragments (emitted with the home page) ---------------- */

function buildNav(document) {
  const main = document.createElement('div');
  const logo = document.querySelector('.brand img');
  const brand = p(document);
  const home = link(document, '/', '');
  home.textContent = '';
  if (logo) home.append(img(document, liveImageSrc(logo), logo.getAttribute('alt') || 'HSBC'));
  brand.append(home);
  main.append(brand, document.createElement('hr'));
  const primary = document.createElement('ul');
  (document.querySelector('.primary-nav')?.querySelectorAll(':scope > .primary-nav__item > .primary-nav__link') || []).forEach((a) => {
    const li = document.createElement('li');
    li.append(link(document, pageHref(a.getAttribute('href')), visibleText(a)));
    primary.append(li);
  });
  main.append(primary, document.createElement('hr'));
  const divisions = document.createElement('ul');
  (document.querySelector('.divisions-nav')?.querySelectorAll('.divisions-nav__link') || []).forEach((a) => {
    const li = document.createElement('li');
    li.append(link(document, a.getAttribute('href'), visibleText(a)));
    divisions.append(li);
  });
  main.append(divisions);
  return main;
}

function buildFooter(document) {
  const main = document.createElement('div');
  const list = document.createElement('ul');
  document.querySelectorAll('.footer__utility__list .footer__link').forEach((a) => {
    const li = document.createElement('li');
    li.append(link(document, pageHref(a.getAttribute('href')), visibleText(a)));
    list.append(li);
  });
  main.append(list, document.createElement('hr'));
  main.append(p(document, visibleText(document.querySelector('.footer__copyright'))));
  return main;
}

/**
 * Shared documents ride the home page URL with ?eds-doc=<name> (the bulk runner imports one
 * document per URL): nav, footer, leaving-hsbc, email-us.
 */
const SHARED_DOCS = {
  nav: { path: '/nav', build: (document) => buildNav(document) },
  footer: { path: '/footer', build: (document) => buildFooter(document) },
  'leaving-hsbc': {
    path: '/fragments/leaving-hsbc',
    build: (document) => confirmationFragment(document, document.querySelector('#leaving-confirmation, .leaving-confirmation:not(.leaving-confirmation--email):not(.leaving-confirmation--modal-onload)')),
  },
  'email-us': {
    path: '/fragments/email-us',
    build: (document) => confirmationFragment(document, document.querySelector('#leaving-confirmation--email, .leaving-confirmation--email')),
  },
};

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const originalURL = params?.originalURL || url;
    const source = new URL(originalURL);
    const pathname = source.pathname.replace(/\/$/, '').replace(/\.html?$/, '');

    const shared = SHARED_DOCS[source.searchParams.get('eds-doc')];
    if (shared) {
      const element = shared.build(document);
      WebImporter.rules.adjustImageUrls(element, url, originalURL);
      return [{
        element,
        path: WebImporter.FileUtils.sanitizePath(shared.path),
        report: { title: shared.path, template: 'shared-document' },
      }];
    }

    executeTransformers('beforeTransform', document.body, payload);
    const main = buildPage(document, originalURL);
    executeTransformers('afterTransform', main, payload);

    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, originalURL);

    const path = WebImporter.FileUtils.sanitizePath(pathname === '' ? '/index' : pathname);
    return [{
      element: main,
      path,
      report: { title: document.title, template: PAGE_TEMPLATE.name },
    }];
  },
};
