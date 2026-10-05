#!/usr/bin/env node
/*
 * da.live -> AEM Sites (crosswalk) content package.
 *
 * Reads the PUBLISHED da.live pages (the approved site: localized links, published edits), puts
 * each block into the row shape its Universal Editor model renders on AEM, converts the page with
 * Adobe's own pipeline (helix-html2md -> helix-md2jcr against the root component-*.json) and
 * writes one vault content package plus the asset mapping that @adobe/aem-import-helper uses to
 * upload the images into the DAM:
 *
 *   node tools/xwalk/convert.mjs --out <dir> [--name <package>] [--pilot | --all | <path> ...]
 *
 * Install (on a machine with AEM access, 24h developer token from the Developer Console):
 *   npx @adobe/aem-import-helper aem upload --token token.txt --zip <dir>/<package>.zip \
 *     --asset-mapping <dir>/asset-mapping.json --target https://author-p151992-e1858597.adobeaemcloud.com
 *
 * The libraries are the importer's own (no project dependency): set EXCAT_MARKETPLACES_DIR or
 * XWALK_LIBS_CI / XWALK_LIBS_MCP to their node_modules folders.
 */
/* eslint-disable no-console, no-restricted-syntax, no-await-in-loop -- command-line tool */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const MARKET = process.env.EXCAT_MARKETPLACES_DIR || '/home/node/.excat-marketplaces';
const LIBS_CI = process.env.XWALK_LIBS_CI || `${MARKET}/excat-marketplace/excat/skills/excat-content-import/scripts/node_modules`;
const LIBS_MCP = process.env.XWALK_LIBS_MCP || `${MARKET}/excat-marketplace/excat/tools/excatops-mcp/node_modules`;
const load = (dir, pkg, entry) => import(pathToFileURL(path.join(dir, pkg, entry)).href);

const { JSDOM } = await load(LIBS_CI, 'jsdom', 'lib/api.js');
const { md2jcr } = await load(LIBS_CI, '@adobe/helix-md2jcr', 'src/index.js');
const { html2md } = await load(LIBS_MCP, '@adobe/helix-html2md', 'src/index.js');
const { createJcrPackage, createPage } = await load(LIBS_MCP, '@adobe/helix-importer-jcr-packaging', 'src/index.js');

const SOURCE = 'https://main--hsbc-eds--polizzigaetano.aem.live'; // published da.live site
const SITE = '/content/hsbc-eds';
const DAM = '/content/dam/hsbc-eds';
const CONTENT = path.join(ROOT, 'content'); // original import: the live-site image URLs (names)

// every page of the site (link targets), from the import
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
  const full = path.join(dir, e.name);
  if (e.isDirectory() || (e.isSymbolicLink() && fs.statSync(full).isDirectory())) return walk(full);
  return e.name.endsWith('.plain.html') ? [full] : [];
});
const ALL = walk(CONTENT).map((f) => `/${path.relative(CONTENT, f).replace(/\.plain\.html$/, '')}`).sort();
const PAGES = new Set(ALL);

const PILOT = [
  // the 8 approved archetypes
  '/index', '/news-and-media', '/news-and-media/ambitious-uk-businesses-encouraged-to-go-for-gold',
  '/hsbc-uk/inclusion', '/accessibility', '/history-timeline', '/management-team',
  '/hsbc-uk/regulated-covered-bond-programme',
  // every remaining block and variant
  '/search',
  '/news-and-media/great-block-sports-fans-urged-to-make-use-of-their-in-app-gambling-freeze-feature',
  '/news-and-media/oh-sod-it-im-on-holiday-brits-spend-over-1000-on-foreign-holiday-extras',
  '/news-and-media/hsbc-uk-to-open-new-branch-in-loughborough',
  '/news-and-media/hsbc-uks-lincoln-branch-re-opens-after-major-facelift',
  '/news-and-media/uk-firms-expect-focus-on-sustainability-to-deliver-growth',
  '/news-and-media/hsbc-uk-offer-helps-advance-towards-gbp-300-in-cash',
  '/news-and-media/hours-of-screentime-connectivity-financial-oversight-and-anxiety',
  '/news-and-media/small-business-stars-shine-with-dame-kelly-holmes-and-brian-odriscoll-as-brand-ambassadors',
  '/news-and-media/plant-operator-invests-in-tunnelling-tech-for-uks-first-carbon-capture-development-thanks-to-hsbc-uk',
  '/news-and-media/hsbc-uk-announces-key-retail-banking-appointment',
  '/news-and-media/hsbc-uk-launches-brand-new-wealth-academy-to-attract-and-develop-top-industry-talent',
  '/news-and-media/hsbc-uk-student-account-for-2020-intake-launched',
  // chrome and fragments
  '/nav', '/footer', '/fragments/notes-hsbc-uk', '/fragments/email-us', '/fragments/leaving-hsbc',
];

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 ? args.splice(i, 2)[1] : fallback;
};
const OUT = path.resolve(opt('--out', 'stardust/.work/xwalk/out'));
const NAME = opt('--name', 'hsbc-eds-content');
let targets = args.filter((a) => !a.startsWith('--'));
if (args.includes('--pilot')) targets = PILOT;
if (args.includes('--all')) targets = ALL;
if (!targets.length) {
  console.error('usage: convert.mjs --out <dir> [--name <package>] [--pilot | --all | <path> ...]');
  process.exit(1);
}

const ue = (f) => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
const definition = ue('component-definition.json');
// md2jcr matches a table header ("Inline Image (right, half)") against the component title; the
// editor titles stay author-friendly, so the conversion matches on the AEM block name instead
definition.groups.forEach((g) => g.components.forEach((c) => {
  const name = c.plugins?.xwalk?.page?.template?.name;
  if (name) c.title = name;
}));
const UE = {
  models: ue('component-models.json'),
  definition,
  filters: ue('component-filters.json'),
};

/* ---------- assets: published media -> readable DAM paths ---------- */

const assetMap = new Map(); // download URL (published media) -> DAM path
const damTaken = new Map(); // DAM path -> download URL
const ORIGINAL_PREFIX = /^\/-\/media\/(uk\/)?(en\/)?/i;

function damPathFor(download, original) {
  if (assetMap.has(download)) return assetMap.get(download);
  const ext = path.extname(new URL(download).pathname).toLowerCase();
  let rel = null;
  if (original) {
    try {
      const { pathname } = new URL(original);
      if (ORIGINAL_PREFIX.test(pathname)) rel = pathname.replace(ORIGINAL_PREFIX, '');
    } catch { /* relative or invalid: fall back */ }
  }
  if (rel) {
    const dir = path.posix.dirname(rel).toLowerCase().replace(/[^a-z0-9/_-]+/g, '-');
    let base = path.posix.basename(rel, path.posix.extname(rel)).replace(/[^A-Za-z0-9_-]+/g, '-');
    if (!base) base = 'image';
    rel = `${dir}/${base}${ext}`;
  } else {
    rel = `media/${path.posix.basename(new URL(download).pathname)}`;
  }
  let dam = `${DAM}/${rel}`;
  // the same live file name for a different picture: keep both
  for (let n = 2; damTaken.has(dam) && damTaken.get(dam) !== download; n += 1) {
    dam = `${DAM}/${rel.replace(/(\.[a-z0-9]+)$/, `-${n}$1`)}`;
  }
  damTaken.set(dam, download);
  assetMap.set(download, dam);
  return dam;
}

/* ---------- block shapes: da.live table -> the rows the AEM model renders ---------- */

const cell = (doc, ...nodes) => {
  const c = doc.createElement('div');
  c.append(...nodes);
  return c;
};
const row = (doc, ...cs) => {
  const r = doc.createElement('div');
  r.append(...cs);
  return r;
};
const pictureOf = (el) => el.querySelector('picture') || el.querySelector('img');

const SHAPES = {
  // one row per field: [image] [caption]
  'inline-image': (block, doc) => {
    const content = block.querySelector(':scope > div > div');
    if (!content) return;
    const media = pictureOf(content);
    const captions = [...content.children].filter((n) => !n.contains(media) && n !== media);
    const rows = [];
    if (media) rows.push(row(doc, cell(doc, media)));
    if (captions.length) rows.push(row(doc, cell(doc, ...captions)));
    block.replaceChildren(...rows);
  },
  // [text: video link + facts] [poster]
  cinemagraph: (block, doc) => {
    const content = block.querySelector(':scope > div > div');
    if (!content) return;
    const media = pictureOf(content);
    const rest = [...content.children].filter((n) => !n.contains(media) && n !== media);
    const rows = [row(doc, cell(doc, ...rest))];
    if (media) rows.push(row(doc, cell(doc, media)));
    block.replaceChildren(...rows);
  },
  // AEM renders all 8 model cells per row and the table block drops a row's trailing empty cells:
  // a cell authored empty at the end of a row gets a zero-width space so it is kept
  table: (block) => {
    [...block.children].forEach((r) => {
      const cs = [...r.children];
      for (let i = cs.length - 1; i >= 0 && !cs[i].textContent.trim() && !cs[i].querySelector('img, a'); i -= 1) {
        if (i > 0 && cs.slice(0, i).some((c) => c.textContent.trim() || c.querySelector('img, a'))) {
          cs[i].textContent = '​';
        }
      }
    });
  },
  // single-field items: name the child component so they are not read as block properties
  aside: (block, doc) => {
    [...block.children].forEach((r) => r.prepend(cell(doc, doc.createTextNode('aside-item'))));
  },
};

/* ---------- one page ---------- */

// page metadata delivered as <meta> (the published .plain.html carries none): model field names
const META_NAMES = ['description', 'keywords', 'publication-date', 'theme', 'robots'];
const CHROME = /^\/(nav|footer|fragments\/.+)$/;
const escapeXml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** md2jcr output -> valid JCR XML, as AEM renders it */
function repairXml(xml) {
  return xml
    // bare "&" in attribute values (link query strings) make the whole page invalid XML
    .replace(/&(?!(amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)/g, '&amp;')
    // rich text: md2jcr wraps headings and lists in <p>, which a browser turns into empty <p>s
    .replace(/&lt;p&gt;(&lt;(h[1-6]|ul|ol|blockquote|table)(&gt;| ))/g, '$1')
    .replace(/(&lt;\/(h[1-6]|ul|ol|blockquote|table)&gt;)&lt;\/p&gt;/g, '$1')
    // block options: html2md spells "rich-summary" as "rich summary"; store the multiselect's
    // option values, multi-valued ("right, half" -> [right,half])
    .replace(/ classes="([^"[\]]*)"/g, (m, list) => {
      const values = list.split(',').map((v) => v.trim().replace(/\s+/g, '-')).filter(Boolean);
      return ` classes="[${values.join(',')}]"`;
    });
}

function originalImages(pagePath) {
  const file = path.join(CONTENT, `${pagePath}.plain.html`);
  if (!fs.existsSync(file)) return [];
  const doc = new JSDOM(fs.readFileSync(file, 'utf8')).window.document;
  return [...doc.querySelectorAll('img')].map((img) => img.getAttribute('src'));
}

function localizeLink(a) {
  const href = a.getAttribute('href');
  // in-page links (#accept, #proceed…) and query-only links stay as they are
  if (!href || href.startsWith('#') || href.startsWith('?')) return;
  // the cinemagraph video: da.live delivers the link without its extension; the text has it
  if (/-mp4$/.test(href) && /\.mp4$/.test(a.textContent.trim())) {
    a.setAttribute('href', a.textContent.trim());
    return;
  }
  let url;
  try {
    url = new URL(href, `${SOURCE}/`);
  } catch {
    return;
  }
  if (url.origin !== SOURCE) return;
  const pathname = url.pathname.replace(/\.html$/, '').replace(/\/$/, '') || '/index';
  if (!PAGES.has(pathname)) return; // media, search queries…: unchanged
  a.setAttribute('href', `${SITE}${pathname}${url.search}${url.hash}`);
}

const PREVIEW = SOURCE.replace('.aem.live', '.aem.page');
const previewOnly = new Set();

async function fetchText(url, pagePath) {
  let resp = await fetch(url);
  // previewed but never published on da.live (e.g. fragments): take the preview
  if (resp.status === 404 && pagePath) {
    resp = await fetch(url.replace(SOURCE, PREVIEW));
    if (resp.ok) previewOnly.add(pagePath);
  }
  if (!resp.ok) throw new Error(`${url}: ${resp.status} from the da.live site`);
  return resp.text();
}

async function convert(pagePath) {
  const plain = await fetchText(`${SOURCE}${pagePath}.plain.html`, pagePath);
  const dom = new JSDOM(`<html><head></head><body><main>${plain}</main></body></html>`);
  const doc = dom.window.document;
  const main = doc.querySelector('main');
  const report = {
    path: pagePath, blocks: {}, images: 0, renamed: 0,
  };

  // section styles: delivered as section classes -> Section Metadata (style)
  [...main.children].forEach((section) => {
    const style = [...section.classList].join(', ');
    if (!style) return;
    section.removeAttribute('class');
    const sm = doc.createElement('div');
    sm.className = 'section-metadata';
    sm.append(row(doc, cell(doc, doc.createTextNode('style')), cell(doc, doc.createTextNode(style))));
    section.append(sm);
  });

  // page metadata: delivered in the page head -> Metadata (model fields) + AEM page title
  const meta = {};
  if (!CHROME.test(pagePath)) {
    const head = new JSDOM(await fetchText(`${SOURCE}${pagePath === '/index' ? '/' : pagePath}`)).window.document;
    meta.title = head.querySelector('title')?.textContent.trim();
    META_NAMES.forEach((name) => {
      const value = head.querySelector(`meta[name="${name}"]`)?.getAttribute('content');
      if (value) meta[name] = value;
    });
    const text = (value) => cell(doc, doc.createTextNode(value));
    const rows = META_NAMES.filter((n) => n !== 'description' && meta[n])
      .map((n) => row(doc, text(n), text(meta[n])));
    if (rows.length) {
      const block = doc.createElement('div');
      block.className = 'metadata';
      block.append(...rows);
      const last = doc.createElement('div');
      last.append(block);
      main.append(last);
    }
  }

  // images: published media, named after the live-site file where the order matches
  const originals = originalImages(pagePath);
  const imgs = [...main.querySelectorAll('img')];
  const named = originals.length === imgs.length;
  imgs.forEach((img, i) => {
    const media = new URL(img.getAttribute('src'), `${SOURCE}${pagePath}`);
    const download = `${SOURCE}${media.pathname}`;
    const dam = damPathFor(download, named ? originals[i] : null);
    if (!dam.includes('/media/media_')) report.renamed += 1;
    img.setAttribute('src', dam);
    img.removeAttribute('loading');
    img.closest('picture')?.querySelectorAll('source').forEach((s) => s.remove());
    report.images += 1;
  });

  main.querySelectorAll('a[href]').forEach(localizeLink);

  // a linked picture in default content (the nav logo): AEM's Image component has no link, and
  // md2jcr would turn it into an empty Button; keep the picture (the header links the logo home)
  main.querySelectorAll(':scope > div > p > a > picture').forEach((picture) => {
    const a = picture.parentElement;
    if (a.parentElement.children.length === 1 && a.children.length === 1) {
      report.unlinked = (report.unlinked || 0) + 1;
      a.replaceWith(picture);
    }
  });

  main.querySelectorAll(':scope > div > div[class]').forEach((block) => {
    const name = block.classList[0];
    if (name === 'metadata' || name === 'section-metadata') return;
    report.blocks[name] = (report.blocks[name] || 0) + 1;
    SHAPES[name]?.(block, doc);
  });

  const md = await html2md(dom.serialize(), {
    log: {
      info() {}, warn: console.warn, error: console.error, debug() {},
    },
    url: `${SOURCE}${pagePath}`,
  });
  let xml = repairXml(await md2jcr(md, UE));
  // AEM's own title and description (not page-metadata model fields)
  const props = [];
  if (meta.title) props.push(`jcr:title="${escapeXml(meta.title)}"`);
  if (meta.description) props.push(`jcr:description="${escapeXml(meta.description)}"`);
  if (props.length) xml = xml.replace('<jcr:content ', `<jcr:content ${props.join(' ')} `);
  return { md, xml, report };
}

/* ---------- run ---------- */

fs.mkdirSync(OUT, { recursive: true });
const pages = [];
const reports = [];
for (const pagePath of targets) {
  // eslint-disable-next-line no-await-in-loop
  const { md, xml, report } = await convert(pagePath);
  const base = path.join(OUT, 'pages', pagePath === '/' ? 'index' : pagePath.slice(1));
  fs.mkdirSync(path.dirname(base), { recursive: true });
  fs.writeFileSync(`${base}.md`, md);
  fs.writeFileSync(`${base}.xml`, xml);
  pages.push(createPage(pagePath, xml, `${SOURCE}${pagePath}`));
  reports.push(report);
  console.log(`${pagePath}: ${report.images} images (${report.renamed} named), blocks ${JSON.stringify(report.blocks)}`);
}

await createJcrPackage(OUT, pages, [], SITE, DAM, NAME);
// the uploader downloads each URL and stores it at its DAM path
fs.writeFileSync(path.join(OUT, 'asset-mapping.json'), `${JSON.stringify(Object.fromEntries(assetMap), null, 2)}\n`);
fs.writeFileSync(path.join(OUT, 'report.json'), `${JSON.stringify(reports, null, 2)}\n`);
if (previewOnly.size) console.log(`\nnot published on da.live (converted from the preview): ${[...previewOnly].join(', ')}`);
console.log(`\n${pages.length} pages, ${assetMap.size} assets -> ${path.join(OUT, `${NAME}.zip`)}`);
