// provenance: stardust:replica Phase 3 — A2 cinemagraph state machine, mirroring the live classes
// (cinemagraph--active / cinemagraph--paused, data-props-poster-on-pause) and toggle labels as
// observed in the gate browser: >=780px the component activates and autoplays (pause icon,
// "Pause background video"); <780px the server markup is left untouched (play icon + "Pause
// background video" label — live server default, mirrored in the HTML). Reduced-motion starts paused.
document.querySelectorAll('.cinemagraph').forEach((root) => {
  const video = root.querySelector('.cinemagraph__video');
  const toggle = root.querySelector('.cinemagraph__toggle');
  const icon = toggle.querySelector('.icon');
  const label = toggle.querySelector('.a11y');
  const wide = window.matchMedia('(min-width: 780px)').matches;
  const setState = (playing) => {
    root.classList.toggle('cinemagraph--paused', !playing);
    icon.classList.toggle('icon--pause', playing);
    icon.classList.toggle('icon--play', !playing);
    label.textContent = playing ? toggle.dataset.labelPause : toggle.dataset.labelPlay;
    if (playing) video.play().catch(() => {}); else video.pause();
  };
  const wantsPlay = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!wide) return;
  root.classList.add('cinemagraph--active');
  setState(wantsPlay);
  toggle.addEventListener('click', () => setState(root.classList.contains('cinemagraph--paused')));
});
