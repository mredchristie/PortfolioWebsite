/* Click/tap handling for the nav "More" dropdown.
 *
 * The menu already opens on :hover and :focus-within in styles.css, so mouse
 * and keyboard work with this file absent, and below 768px the dropdown is
 * flattened into the hamburger panel and always visible. This only covers the
 * remaining case: a touch device wide enough to get the desktop nav, where
 * there is no hover to give.
 *
 * Shared by every page that carries the navbar.
 */
document.querySelectorAll('.nav-more').forEach((wrap) => {
  const toggle = wrap.querySelector('.nav-more-toggle');
  const menu = wrap.querySelector('.nav-more-menu');
  if (!toggle || !menu) return;

  const setOpen = (open) => toggle.setAttribute('aria-expanded', String(open));
  const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';

  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    setOpen(!isOpen());
  });

  // Click anywhere else closes it.
  document.addEventListener('click', (e) => {
    if (isOpen() && !wrap.contains(e.target)) setOpen(false);
  });

  // Escape closes it and puts focus back on the button, so keyboard users are
  // not dropped at the top of the document.
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen()) {
      setOpen(false);
      toggle.focus();
    }
  });

  // Following a link should not leave the menu flagged open behind you.
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
});
