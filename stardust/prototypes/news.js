// provenance: stardust:replica Phase 3 — A3 accordion, mirroring the live state machine
// (accordion__item--active on the item, aria-expanded on the button, chevron ⌄ → ˰, panel shown).
// Live markup carries data-toggle="false": opening one year does not close the others.
document.querySelectorAll('.accordion').forEach((acc) => {
  acc.querySelectorAll('.accordion__item').forEach((item) => {
    const button = item.querySelector('.accordion__heading button');
    const panel = item.querySelector('.accordion__content');
    const icon = button.querySelector('.icon');
    button.addEventListener('click', () => {
      const open = !item.classList.contains('accordion__item--active');
      item.classList.toggle('accordion__item--active', open);
      button.setAttribute('aria-expanded', String(open));
      icon.classList.toggle('icon--chevron-down', !open);
      icon.classList.toggle('icon--chevron-up', open);
      panel.hidden = !open;
    });
  });
});
