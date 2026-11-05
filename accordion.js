// Accordion sections (About, Services, Pricing).
// Built on <details>/<summary>, so they open, close and are announced
// correctly by screen readers even without this script. The script adds:
// - a smooth height animation (skipped when the visitor prefers reduced motion)
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

    const finish = () => {
      animation = null;
      panel.style.overflow = '';
    };

    const animateTo = (open) => {
      // Start from wherever the panel is now, even mid-animation.
      // A closed panel takes no space: zero height and no negative margin.
      const from = details.open
        ? { height: panel.getBoundingClientRect().height, margin: parseFloat(getComputedStyle(panel).marginTop) }
        : { height: 0, margin: 0 };
      if (animation) animation.cancel();
      const restMargin = parseFloat(getComputedStyle(panel).marginTop); // value from the CSS
      if (open) details.open = true;
      const to = open
        ? { height: panel.getBoundingClientRect().height, margin: restMargin }
        : { height: 0, margin: 0 };

      closing = !open;
      panel.style.overflow = 'hidden';
      animation = panel.animate(
        [
          { height: `${from.height}px`, marginTop: `${from.margin}px` },
          { height: `${to.height}px`, marginTop: `${to.margin}px` },
        ],
        { duration: DURATION, easing: EASING }
      );
      animation.onfinish = () => {
        if (!open) {
          details.open = false;
          // If the bar has scrolled off the top, bring it back into view
          if (summary.getBoundingClientRect().top < 0) summary.scrollIntoView({ block: 'start' });
        }
        closing = false;
        finish();
      };
      animation.oncancel = finish;
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
