/* eslint-disable */
/* global WebImporter */

/**
 * About HSBC cleanup: drop everything the EDS runtime re-creates or never ships — tag manager,
 * consent dialogs, CMS scripts, noscript image duplicates, crawler comments.
 * (The chrome is read separately for /nav and /footer before this runs on the page body.)
 */
export default function transform(hookName, element, payload) {
  if (hookName !== 'beforeTransform') return;
  WebImporter.DOMUtils.remove(element, [
    'script',
    'style',
    'noscript',
    'iframe',
    'link',
    '#__tealiumGDPRecModal',
    '#__tealiumGDPRcpPrefs',
    '.cookie-modal',
    '.privacy-prompt-header',
    '.doormat',
    '.lightbox-overlay',
  ]);
  // HTML comments (<!--crawler: off-->)
  const walker = element.ownerDocument.createTreeWalker(element, 128);
  const comments = [];
  while (walker.nextNode()) comments.push(walker.currentNode);
  comments.forEach((c) => c.remove());
}
