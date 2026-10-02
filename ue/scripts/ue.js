/*
 * Universal Editor support — loaded by scripts.js only on *.ue.da.live (da.live content edited
 * in the Universal Editor). Pattern from adobe/aem-boilerplate-xwalk editor-support.js and
 * aemsites/da-block-collection ue/scripts/ue.js:
 *  - after every content change the edited block (or default content) is re-rendered from the
 *    editor's response, because the replica blocks restructure their authored DOM; when the
 *    response cannot be applied the page reloads
 *  - selecting an accordion item or a carousel slide in the editor reveals it
 */
import {
  decorateBlock,
  decorateIcons,
  loadBlock,
} from '../../scripts/aem.js';

const CONTENT_EVENTS = [
  'aue:content-patch',
  'aue:content-update',
  'aue:content-add',
  'aue:content-move',
  'aue:content-remove',
  'aue:content-copy',
];

let pending = Promise.resolve();

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

export default function ue() {
  const main = document.querySelector('main');
  CONTENT_EVENTS.forEach((type) => main?.addEventListener(type, async (event) => {
    event.stopPropagation();
    pending = applyChanges(event);
    const applied = await pending;
    if (!applied) window.location.reload();
  }));
  document.body.addEventListener('aue:ui-select', revealSelection);
}
