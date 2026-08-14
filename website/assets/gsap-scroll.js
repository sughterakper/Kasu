/* Kasu — GSAP + ScrollTrigger scroll choreography.
   Content rises with a subtle 3D tilt, produce cards swing in with depth,
   full-bleed photos parallax + slow-zoom as you pass them. Degrades to a static
   page if GSAP is unavailable or the visitor prefers reduced motion. */
(function () {
  if (!window.gsap || !window.ScrollTrigger) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  gsap.registerPlugin(ScrollTrigger);
  var EASE = 'power3.out';

  /* Headings & editorial blocks — rise + gentle 3D tilt-up */
  gsap.utils.toArray('.sechead, .lineup h2.big, .eyebrow, .lsub, .loc, .pull, .mcat, .ledger, .receipt')
    .forEach(function (el) {
      gsap.from(el, {
        opacity: 0, y: 46, rotationX: 10, transformPerspective: 900, transformOrigin: '50% 100%',
        duration: 1, ease: EASE,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      });
    });

  /* The produce lineup — staggered rise with a 3D swing */
  gsap.utils.toArray('.cups').forEach(function (track) {
    gsap.from(track.children, {
      opacity: 0, y: 64, rotationY: -12, transformPerspective: 1000, transformOrigin: '50% 50%',
      duration: 1.05, ease: EASE, stagger: 0.09,
      scrollTrigger: { trigger: track, start: 'top 85%', once: true }
    });
  });

  /* Promise steps, pillar cards and the bento grid */
  gsap.utils.toArray('.steps, .pillars, .bento').forEach(function (group) {
    gsap.from(group.children, {
      opacity: 0, y: 42, duration: 0.85, ease: EASE, stagger: 0.1,
      scrollTrigger: { trigger: group, start: 'top 85%', once: true }
    });
  });

  /* Full-bleed photos — parallax drift + slow zoom */
  gsap.utils.toArray('.showcase img').forEach(function (img) {
    gsap.fromTo(img,
      { yPercent: -6, scale: 1.14 },
      { yPercent: 6, scale: 1.24, ease: 'none',
        scrollTrigger: { trigger: img.closest('.showcase'), start: 'top bottom', end: 'bottom top', scrub: true } });
  });
  gsap.utils.toArray('.band img').forEach(function (img) {
    gsap.fromTo(img,
      { yPercent: -8, scale: 1.14 },
      { yPercent: 8, scale: 1.22, ease: 'none',
        scrollTrigger: { trigger: img.closest('.band'), start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  /* Showcase caption drifts up */
  gsap.utils.toArray('.showcase .cap').forEach(function (cap) {
    gsap.from(cap, {
      opacity: 0, y: 26, duration: 1, ease: 'power2.out',
      scrollTrigger: { trigger: cap.closest('.showcase'), start: 'top 72%', once: true }
    });
  });

  /* The price board — tilt up in 3D, items cascade, light sweeps across */
  gsap.utils.toArray('.board').forEach(function (board) {
    gsap.from(board, {
      opacity: 0, y: 60, rotationX: 12, transformPerspective: 1200, transformOrigin: '50% 100%',
      duration: 1.1, ease: EASE,
      scrollTrigger: { trigger: '.boardsec', start: 'top 82%', once: true }
    });
    gsap.from(board.querySelectorAll('.bi'), {
      opacity: 0, y: 16, duration: 0.6, ease: 'power2.out', stagger: 0.05,
      scrollTrigger: { trigger: '.boardsec', start: 'top 74%', once: true }
    });
  });
  gsap.utils.toArray('.board-sheen').forEach(function (sheen) {
    gsap.fromTo(sheen,
      { xPercent: -160, skewX: -14 },
      { xPercent: 420, skewX: -14, ease: 'none',
        scrollTrigger: { trigger: sheen.closest('.boardsec'), start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  /* Split hero: the copy drifts up, the photo drifts down — they part as you leave */
  if (document.querySelector('.split')) {
    gsap.to('.split .copy', {
      y: -40, opacity: .15, ease: 'none',
      scrollTrigger: { trigger: '.split', start: 'top top', end: 'bottom top', scrub: true }
    });
    gsap.to('.split .shotwrap', {
      y: 28, ease: 'none',
      scrollTrigger: { trigger: '.split', start: 'top top', end: 'bottom top', scrub: true }
    });
  }

  /* recalc once fonts/images settle */
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
