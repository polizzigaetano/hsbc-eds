// provenance: stardust:replica Phase 3 — A6 behaviour, mirroring the live state machines observed in the
// gate browser (stardust/.work/replica/probe-gate.mjs, probe-clicks.mjs):
//  • nested accordion: multi-open, accordion-nested__item--active, chevron ⌄ → ˰
//  • Terms-of-Access gate: opens on load unless the acceptance cookie exists; Accept is disabled until
//    the checkbox is ticked; Accept stores a 90-day cookie named after the page path and closes the gate;
//    Decline and × send the visitor to data-return-url (/hsbc-uk).
document.querySelectorAll('.accordion-nested__item').forEach((item) => {
  const button = item.querySelector('.accordion-nested__heading button');
  const panel = item.querySelector('.accordion-nested__content');
  const icon = button.querySelector('.icon');
  button.addEventListener('click', () => {
    const open = !item.classList.contains('accordion-nested__item--active');
    item.classList.toggle('accordion-nested__item--active', open);
    button.setAttribute('aria-expanded', String(open));
    icon.classList.toggle('icon--chevron-down', !open);
    icon.classList.toggle('icon--chevron-up', open);
    panel.hidden = !open;
  });
});

(() => {
  const lightbox = document.querySelector('.lightbox');
  const gate = lightbox && lightbox.querySelector('#leaving-confirmation--modal-onload');
  if (!gate) return;
  const overlay = document.querySelector('.lightbox-overlay');
  // live names the cookie after the page path; the prototype is served from another path, so it pins it
  const cookieName = lightbox.dataset.gatePath || window.location.pathname;
  const accepted = document.cookie.split('; ').some((c) => c.startsWith(`${cookieName}=`));
  if (accepted) { lightbox.remove(); overlay.remove(); return; } // live omits the gate markup once accepted
  const checkbox = gate.querySelector('.leaving-confirmation__checkbox');
  const accept = gate.querySelector('.leaving-confirmation__proceed');
  const leave = () => { window.location.href = gate.dataset.returnUrl || '/'; };
  document.documentElement.classList.add('no-scroll');
  lightbox.classList.add('lightbox--active');
  overlay.classList.add('lightbox-overlay--active');
  checkbox.addEventListener('change', () => accept.classList.toggle('button--disabled', !checkbox.checked));
  accept.addEventListener('click', (e) => {
    e.preventDefault();
    if (accept.classList.contains('button--disabled')) return;
    const expires = new Date(Date.now() + 90 * 864e5).toUTCString();
    document.cookie = `${cookieName}=${encodeURIComponent(cookieName)}; expires=${expires}; path=/`;
    lightbox.classList.remove('lightbox--active');
    overlay.classList.remove('lightbox-overlay--active');
    document.documentElement.classList.remove('no-scroll');
  });
  gate.querySelector('.leaving-confirmation__close').addEventListener('click', (e) => { e.preventDefault(); leave(); });
  lightbox.querySelector('.lightbox__close').addEventListener('click', (e) => { e.preventDefault(); leave(); });
})();
