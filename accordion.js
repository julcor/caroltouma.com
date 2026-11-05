// Accordion sections (About, Services, Pricing).
// Built on <details>/<summary>, so they open, close and are announced
// correctly by screen readers even without this script. The script adds:
// - a fade in and out, like the link hover (skipped when the visitor prefers reduced motion)
// - opening the matching section when the URL has #about, #services or #pricing
// - opening every section before printing
(() => {
  const DURATION = 400;
  const EASING = 'ease';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const accordions = [...document.querySelectorAll('details.accordion')];

  accordions.forEach((details) => {
    const summary = details.querySelector('summary');
    const panel = details.querySelector('.panel');
    let animation = null;
    let closing = false;

    const animateTo = (open) => {
      // Fade from wherever the panel is now, even mid-fade
      const from = details.open ? parseFloat(getComputedStyle(panel).opacity) : 0;
      if (animation) animation.cancel();
      if (open) details.open = true;

      closing = !open;
      animation = panel.animate(
        [{ opacity: from }, { opacity: open ? 1 : 0 }],
        { duration: DURATION, easing: EASING }
      );
      animation.onfinish = () => {
        animation = null;
        closing = false;
        if (!open) {
          details.open = false;
          // If the bar has scrolled off the top, bring it back into view
          if (summary.getBoundingClientRect().top < 0) summary.scrollIntoView({ block: 'start' });
        }
      };
    };

    summary.addEventListener('click', (event) => {
      if (reduceMotion.matches) return; // native instant toggle
      event.preventDefault();
      const isOpen = details.open && !closing;
      animateTo(!isOpen);
    });
  });

  // Open the section named in the URL (e.g. caroltouma.com/#pricing)
  const openFromHash = () => {
    const target = location.hash && document.getElementById(location.hash.slice(1));
    const details = target && target.querySelector('details.accordion');
    if (!details) return;
    details.open = true;
    target.scrollIntoView({ block: 'start' });
  };
  openFromHash();
  window.addEventListener('hashchange', openFromHash);

  // Printed copies should include everything
  window.addEventListener('beforeprint', () => accordions.forEach((d) => { d.open = true; }));
})();
