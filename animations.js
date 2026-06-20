// Scroll reveal — each element is observed individually (not the parent
// .reveal-group) so a tall grid with many rows doesn't need its entire
// bounding box to clear the intersection threshold before revealing.
const revealEls = document.querySelectorAll('.reveal, .reveal-item');
if ('IntersectionObserver' in window && revealEls.length) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach((el, i) => {
    if (!el.classList.contains('reveal-item')) {
      el.style.transitionDelay = `${(i % 4) * 0.08}s`;
    }
    observer.observe(el);
  });
} else {
  revealEls.forEach((el) => el.classList.add('in-view'));
}
