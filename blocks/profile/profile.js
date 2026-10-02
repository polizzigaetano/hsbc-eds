import { moveInstrumentation } from '../../scripts/site.js';

/**
 * profile — the live exec-bio rows (management team, history timeline). Reconstructive: one row
 * per profile.
 *
 * Authoring: one row per profile.
 *   cell 1 (optional): the picture
 *   cell 2: h2 name (or year), the position line as the first paragraph, then the bio text
 */
export default function decorate(block) {
  const rows = [...block.children].map((row) => {
    const media = row.querySelector('picture') || row.querySelector('img');
    const heading = row.querySelector('h2, h3');
    const paragraphs = [...row.querySelectorAll('p, ul, ol')]
      .filter((p) => !p.querySelector('picture, img') && !p.closest('li'));
    const [position, ...text] = paragraphs;

    const bio = document.createElement('div');
    bio.className = 'exec-bio';
    if (media) {
      const image = document.createElement('div');
      image.className = 'exec-bio__image';
      image.append(media.closest('p') || media);
      bio.append(image);
    } else {
      bio.classList.add('exec-bio__no-image');
    }
    const copy = document.createElement('div');
    copy.className = 'exec-bio__copy';
    if (heading) {
      const name = document.createElement('div');
      name.className = 'exec-bio__name';
      name.append(heading);
      copy.append(name);
    }
    if (position) {
      const pos = document.createElement('div');
      pos.className = 'exec-bio__position';
      pos.append(position);
      copy.append(pos);
    }
    if (text.length) {
      const wrap = document.createElement('div');
      wrap.className = 'exec-bio__text exec-bio__text--view-all';
      const inner = document.createElement('div');
      inner.className = 'text exec-bio__text__inner';
      inner.append(...text);
      wrap.append(inner);
      copy.append(wrap);
    }
    bio.append(copy);
    // Universal Editor: the authored row's item markers move to the rendered profile
    moveInstrumentation(row, bio);
    return bio;
  });
  block.replaceChildren(...rows);
}
