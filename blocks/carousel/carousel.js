/**
 * carousel — the live image carousel (slides of a picture + caption overlay, prev/next controls
 * and a "1 / 3" counter). Reconstructive: one row per slide.
 *
 * Authoring: one row per slide — cell 1 the picture, cell 2 the caption (optional heading + p).
 * Generated control labels (allowlisted): "Previous Slide", "Next Slide", the slide counter.
 */
function el(tag, className, ...children) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  node.append(...children);
  return node;
}

function icon(name) {
  const i = el('span', `icon icon--${name}`);
  i.setAttribute('aria-hidden', 'true');
  return i;
}

export default function decorate(block) {
  const slides = [...block.children].map((row) => {
    const [mediaCell, captionCell] = row.children;
    const media = (mediaCell || row).querySelector('picture') || (mediaCell || row).querySelector('img');
    const slide = el('li', 'carousel__slide');
    const frame = el('div', 'carousel__image');
    if (media) frame.append(media.closest('p') || media);
    slide.append(frame);
    const caption = captionCell ? [...captionCell.children] : [];
    if (caption.length) {
      slide.append(el('div', 'carousel__overlay', el('div', 'carousel__overlay-inner', ...caption)));
    }
    return slide;
  });
  if (!slides.length) return;

  const list = el('ul', 'carousel__slides', ...slides);
  const current = el('span', 'carousel__meta carousel__meta--current-slide', '1');
  const total = el('span', 'carousel__meta carousel__meta--total-slides', ` / ${slides.length}`);
  const prev = el('button', 'carousel__control carousel__control--previous', el('span', 'a11y', 'Previous Slide'), icon('chevron-left'));
  const next = el('button', 'carousel__control carousel__control--next', el('span', 'a11y', 'Next Slide'), icon('chevron'));
  prev.type = 'button';
  next.type = 'button';
  const controls = el(
    'div',
    'carousel__controls',
    el('div', 'carousel__controls-inner', prev, el('div', 'carousel__meta-wrap', current, total), next),
  );
  const status = el('div', 'a11y');
  status.setAttribute('aria-live', 'polite');
  block.replaceChildren(controls, el('div', 'carousel__head', list), status);
  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'carousel');

  let index = 0;
  const show = (i) => {
    index = (i + slides.length) % slides.length;
    slides.forEach((s, n) => {
      const active = n === index;
      s.dataset.state = active ? 'active' : 'inactive';
      s.setAttribute('aria-hidden', String(!active));
      s.inert = !active;
    });
    current.textContent = String(index + 1);
    status.textContent = `${index + 1} / ${slides.length}`;
  };
  prev.addEventListener('click', () => show(index - 1));
  next.addEventListener('click', () => show(index + 1));
  show(0);
}
