/**
 * cinemagraph — the live muted looping hero video with poster and pause control (home).
 * Template-slotted; behaviour mirrors the observed live state machine: at >= 780px the component
 * activates (cinemagraph--active) and autoplays unless reduced motion is preferred; below 780px
 * the poster shows and the server-default toggle markup is left untouched.
 *
 * Authoring (one cell):
 *   - a paragraph with a link to the .mp4 (served from the code origin, /media/…)
 *   - the poster picture (alt = the facts it shows)
 *   - a paragraph with the screen-reader description of the facts
 *
 * @ew-exempt <a> video source link (text-as-metadata, not displayed)
 * Generated control labels (allowlisted): "Play background video", "Pause background video".
 */
const LABEL_PLAY = 'Play background video';
const LABEL_PAUSE = 'Pause background video';

export default function decorate(block) {
  const links = [...block.querySelectorAll('a[href]')];
  const source = links.find((a) => /\.(mp4|webm)(\?|$)/i.test(a.getAttribute('href')));
  const media = block.querySelector('picture') || block.querySelector('img');
  const facts = [...block.querySelectorAll('p')]
    .filter((p) => !p.contains(source) && !p.querySelector('picture, img'));

  const root = document.createElement('div');
  root.className = 'cinemagraph';
  root.dataset.propsPosterOnPause = 'yes';

  const video = document.createElement('video');
  video.className = 'cinemagraph__video';
  if (source) video.src = source.getAttribute('href');
  video.loop = true;
  video.muted = true;
  video.playsInline = true;
  video.setAttribute('playsinline', '');
  video.setAttribute('aria-hidden', 'true');
  root.append(video);

  if (facts.length) {
    const sr = document.createElement('div');
    sr.className = 'a11y';
    sr.append(...facts);
    root.append(sr);
  }

  if (media) {
    const poster = document.createElement('div');
    poster.className = 'cinemagraph__poster';
    poster.append(media.closest('p') || media);
    const img = poster.querySelector('img');
    if (img) {
      img.loading = 'eager';
      img.fetchPriority = 'high';
    }
    root.append(poster);
  }

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'cinemagraph__toggle cinemagraph__toggle--bottom-left';
  const icon = document.createElement('span');
  icon.className = 'icon icon--play';
  icon.setAttribute('aria-hidden', 'true');
  const label = document.createElement('span');
  label.className = 'a11y';
  label.textContent = LABEL_PAUSE; // live server default
  toggle.append(icon, label);
  root.append(toggle);

  block.replaceChildren(root);

  const setState = (playing) => {
    root.classList.toggle('cinemagraph--paused', !playing);
    icon.classList.toggle('icon--pause', playing);
    icon.classList.toggle('icon--play', !playing);
    label.textContent = playing ? LABEL_PAUSE : LABEL_PLAY;
    if (playing) video.play().catch(() => {}); else video.pause();
  };

  const wide = window.matchMedia('(min-width: 780px)').matches;
  if (!wide || !source) return;
  const wantsPlay = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  root.classList.add('cinemagraph--active');
  setState(wantsPlay);
  toggle.addEventListener('click', () => setState(root.classList.contains('cinemagraph--paused')));
}
