import { loadCSS } from '../../scripts/aem.js';

/**
 * terms-gate — the live "Terms of Access" modal shown on load (Covered Bond programme).
 * Behaviour observed live (stardust/.work/replica/probe-gate.mjs): the gate opens on load unless
 * the acceptance cookie exists; Accept stays disabled until the checkbox is ticked; Accept stores
 * a 90-day cookie named after the page path and closes the gate; Decline and × send the visitor
 * to the Decline link's target. Interim: the 90-day rule is carried over unchanged pending
 * Compliance confirmation (stardust/dynamic-features.md row 7).
 *
 * Authoring (one cell): the heading, the terms paragraphs, the acknowledgement paragraph, then
 * two link paragraphs — "Accept" (href "#accept") and "Decline" (href = where decliners go).
 * Generated label (allowlisted): "Close notification".
 */
const COOKIE_DAYS = 90;

function el(tag, className, ...children) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  node.append(...children);
  return node;
}

export default async function decorate(block) {
  const cookieName = window.location.pathname.replace(/\/$/, '') || '/';
  const accepted = document.cookie.split('; ').some((c) => c.startsWith(`${cookieName}=`));
  const section = block.closest('.section');

  const heading = block.querySelector('h1, h2, h3');
  const paragraphs = [...block.querySelectorAll('p')];
  const linkParas = paragraphs.filter((p) => p.querySelector('a'));
  const acceptPara = linkParas.find((p) => p.querySelector('a[href*="#accept"]')) || linkParas[0];
  const declinePara = linkParas.find((p) => p !== acceptPara);
  const textParas = paragraphs.filter((p) => !linkParas.includes(p));
  const labelPara = textParas.pop();

  if (accepted) {
    // live omits the gate markup once the terms were accepted
    block.replaceChildren();
    section?.classList.add('terms-gate--accepted');
    return;
  }
  await loadCSS(`${window.hlx.codeBasePath}/styles/lightbox.css`);

  const returnUrl = declinePara?.querySelector('a')?.getAttribute('href') || '/';
  const gate = el('div', 'leaving-confirmation leaving-confirmation--modal-onload');
  gate.id = 'leaving-confirmation--modal-onload';
  gate.dataset.returnUrl = returnUrl;
  if (heading) {
    heading.id = heading.id || 'terms-gate-heading';
    gate.append(el('div', 'leaving-confirmation__heading', heading));
  }
  gate.append(el('div', 'leaving-confirmation__copy', ...textParas));

  const checkbox = el('input', 'leaving-confirmation__checkbox');
  checkbox.type = 'checkbox';
  checkbox.id = 'leaving-confirmation__confirm';
  const label = el('label', 'leaving-confirmation__checkbox-label');
  label.htmlFor = checkbox.id;
  if (labelPara) label.append(labelPara);
  gate.append(el('div', 'leaving-confirmation__checkbox-wrap form--fancy', checkbox, label));

  const links = el('div', 'leaving-confirmation__links');
  const accept = acceptPara?.querySelector('a');
  const decline = declinePara?.querySelector('a');
  if (accept) {
    accept.className = 'button button--large leaving-confirmation__proceed button--disabled';
    accept.setAttribute('aria-disabled', 'true');
    accept.rel = 'noopener nofollow';
    links.append(acceptPara);
  }
  if (decline) {
    decline.className = 'button button--large button--link leaving-confirmation__close';
    links.append(declinePara);
  }
  gate.append(links);

  const close = el('a', 'lightbox__close');
  close.href = '#';
  close.title = 'Close notification';
  close.setAttribute('aria-label', 'Close notification');
  const lightbox = el('div', 'lightbox lightbox--scroll', el('div', 'lightbox__inner', close, gate));
  lightbox.setAttribute('role', 'dialog');
  lightbox.setAttribute('aria-modal', 'true');
  if (heading) lightbox.setAttribute('aria-labelledby', heading.id);
  const overlay = el('div', 'lightbox-overlay');
  block.replaceChildren(lightbox, overlay);

  const leave = (e) => {
    e?.preventDefault();
    window.location.href = returnUrl;
  };
  const open = () => {
    document.documentElement.classList.add('no-scroll');
    lightbox.classList.add('lightbox--active');
    overlay.classList.add('lightbox-overlay--active');
    checkbox.focus({ preventScroll: true });
  };
  const closeGate = () => {
    lightbox.classList.remove('lightbox--active');
    overlay.classList.remove('lightbox-overlay--active');
    document.documentElement.classList.remove('no-scroll');
  };

  checkbox.addEventListener('change', () => {
    accept?.classList.toggle('button--disabled', !checkbox.checked);
    accept?.setAttribute('aria-disabled', String(!checkbox.checked));
  });
  accept?.addEventListener('click', (e) => {
    e.preventDefault();
    if (accept.classList.contains('button--disabled')) return;
    const expires = new Date(Date.now() + COOKIE_DAYS * 864e5).toUTCString();
    document.cookie = `${cookieName}=${encodeURIComponent(cookieName)}; expires=${expires}; path=/; SameSite=Lax`;
    closeGate();
  });
  decline?.addEventListener('click', leave);
  close.addEventListener('click', leave);
  lightbox.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const focusables = [...lightbox.querySelectorAll('a[href], input, button')];
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  open();
}
