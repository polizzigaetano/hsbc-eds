/**
 * inline-image — the live article image with an optional caption box (template-slotted).
 * Variants: right / left + half / third (live floating-container: the following text wraps
 * around it), bottom-margin, vertical (no 600px crop), infographic (caption over the image).
 *
 * Authoring (one cell): the picture, then the caption paragraph(s).
 */
export default function decorate(block) {
  const media = block.querySelector('picture') || block.querySelector('img');
  const captions = [...block.querySelectorAll('p')].filter((p) => !p.querySelector('picture, img'));

  const frame = document.createElement('div');
  frame.className = 'inline-image__image';
  if (media) frame.append(media.closest('p') || media);
  const parts = [frame];

  if (captions.length) {
    const inner = document.createElement('div');
    inner.className = 'inline-image__inner';
    const content = document.createElement('div');
    content.className = 'inline-image__content';
    content.append(...captions);
    inner.append(content);
    parts.push(inner);
  }
  block.replaceChildren(...parts);
}
