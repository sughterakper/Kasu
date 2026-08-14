/* Kasu — rust scroll-progress bar (scroll motion is handled by gsap-scroll.js) */
(function () {
  var bar = document.createElement('div');
  bar.className = 'scrollbar';
  document.body.appendChild(bar);

  var ticking = false;
  function progress() {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
    ticking = false;
  }
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(progress);
  }
  document.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  progress();
})();
