/*
 * Universal Editor support — loaded by scripts.js inside the editor: on *.ue.da.live (da.live
 * content) and on AEM Author (crosswalk), where AEM also injects scripts/editor-support.js.
 * Pattern from adobe-rnd/aem-boilerplate-xwalk editor-support.js and
 * aemsites/da-block-collection ue/scripts/ue.js:
 *  - after every content change the edited block (or default content) is re-rendered from the
 *    editor's response, because the replica blocks restructure their authored DOM; when the
 *    response cannot be applied the page reloads
 *  - selecting an accordion item or a carousel slide in the editor reveals it
 *  - AEM Author only: consecutive richtext elements are grouped into one editable wrapper
 */
import {
  decorateBlock,
  decorateIcons,
  loadBlock,
} from '../../scripts/aem.js';
import { editorHost } from '../../scripts/site.js';
import { decorateRichtext } from './ue-richtext.js';

const CONTENT_EVENTS = [
  'aue:content-patch',
  'aue:content-update',
  'aue:content-add',
  'aue:content-move',
  'aue:content-remove',
  'aue:content-copy',
];

let pending = Promise.resolve();
let initialized = false;
let richtext = false;

/**
 * Editor decoration of freshly decorated content (called by decorateMain and after re-renders):
 * groups AEM Author richtext elements; a no-op for da.live content.
 * @param {Element} container the decorated container
 */
export function decorate(container) {
  if (richtext && container) decorateRichtext(container);
}

function resourceOf(detail) {
  return detail?.request?.target?.resource
    || detail?.request?.target?.container?.resource
    || detail?.request?.to?.container?.resource;
}

async function applyChanges(event) {
  await pending;
  const { detail } = event;
  const resource = resourceOf(detail);
  const content = detail?.response?.updates?.[0]?.content;
  if (!resource || !content) return false;

  const parsed = new DOMParser().parseFromString(content, 'text/html');
  parsed.querySelectorAll('script').forEach((s) => s.remove());
  const element = document.querySelector(`[data-aue-resource="${resource}"]`);
  if (!element) return false;

  // the scripts module is fully evaluated by the time the author edits anything
  const { decorateButtons } = await import('../../scripts/scripts.js');
  const block = element.closest('.block[data-aue-resource]');
  if (block) {
    const blockResource = block.getAttribute('data-aue-resource');
    const fresh = parsed.querySelector(`[data-aue-resource="${blockResource}"]`);
    if (!fresh) return false;
    fresh.style.display = 'none';
    block.insertAdjacentElement('afterend', fresh);
    decorateButtons(fresh);
    decorateIcons(fresh);
    decorateBlock(fresh);
    decorate(fresh);
    await loadBlock(fresh);
    block.remove();
    fresh.style.display = null;
    return true;
  }

  // default content inside a section (sections themselves, adds and moves: reload)
  if (element.matches('main, .section, [data-aue-type="container"]')) return false;
  const replacements = parsed.querySelectorAll(`[data-aue-resource="${resource}"],[data-richtext-resource="${resource}"]`);
  if (!replacements.length) return false;
  const parent = element.parentElement;
  element.replaceWith(...replacements);
  decorateButtons(parent);
  decorateIcons(parent);
  decorate(parent);
  return true;
}

function revealSelection({ detail }) {
  const resource = detail?.resource;
  if (!resource) return;
  const element = document.querySelector(`[data-aue-resource="${resource}"]`);
  if (!element) return;
  const item = element.closest('.accordion__item, .accordion-nested__item');
  if (item) {
    const prefix = item.dataset.prefix || 'accordion';
    if (!item.classList.contains(`${prefix}__item--active`)) {
      item.querySelector(`:scope > .${prefix}__heading`)?.click();
    }
    const outer = item.parentElement?.closest('.accordion__item:not(.accordion__item--active)');
    outer?.querySelector(':scope > .accordion__heading')?.click();
    return;
  }
  const slide = element.closest('.carousel__slide');
  if (slide) {
    const carousel = slide.closest('.carousel.block');
    const index = [...slide.parentElement.children].indexOf(slide);
    carousel?.dispatchEvent(new CustomEvent('carousel:show', { detail: { index } }));
  }
}

/**
 * Starts the editor support once per page (scripts.js and AEM's editor-support.js both call it).
 * @param {object} [options]
 * @param {boolean} [options.aem] force AEM Author mode (richtext grouping)
 */
export default function ue({ aem = false } = {}) {
  if (aem || editorHost() === 'aem') {
    if (!richtext) {
      richtext = true;
      // before the page is decorated, decorateMain() groups it; afterwards, group it now
      if (document.body.classList.contains('appear')) decorate(document);
      // blocks decorate asynchronously: group richtext instrumentation as it appears
      new MutationObserver(() => decorate(document))
        .observe(document, { attributeFilter: ['data-richtext-prop'], subtree: true });
    }
  }
  if (initialized) return;
  initialized = true;
  const main = document.querySelector('main');
  CONTENT_EVENTS.forEach((type) => main?.addEventListener(type, async (event) => {
    event.stopPropagation();
    pending = applyChanges(event);
    const applied = await pending;
    if (!applied) window.location.reload();
  }));
  document.body.addEventListener('aue:ui-select', revealSelection);
}
