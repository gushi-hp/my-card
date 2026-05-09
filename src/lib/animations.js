import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function setupScrollAnimations() {
  // Kill existing ScrollTriggers to avoid duplicates on page transitions
  ScrollTrigger.getAll().forEach(st => st.kill());

  // Animate skill bars
  document.querySelectorAll('.skill-bar-fill').forEach((bar) => {
    const targetWidth = bar.dataset.width || '0%';
    bar.style.width = '0';
    ScrollTrigger.create({
      trigger: bar.closest('.skill-bars') || bar,
      start: 'top 80%',
      onEnter: () => {
        gsap.to(bar, { width: targetWidth, duration: 1.5, ease: 'power3.out' });
      },
    });
  });

  // Animate stat numbers
  document.querySelectorAll('.stat-number[data-target]').forEach((el) => {
    const target = parseInt(el.dataset.target, 10);
    if (isNaN(target)) return;
    ScrollTrigger.create({
      trigger: el.closest('.stats-row') || el,
      start: 'top 90%',
      onEnter: () => {
        gsap.fromTo(el, { innerText: 0 }, {
          innerText: target,
          duration: 2,
          snap: { innerText: 1 },
          ease: 'power2.out',
          onUpdate: function() {
            const suffix = el.dataset.suffix || '';
            el.innerText = Math.round(this.targets()[0].innerText) + suffix;
          },
        });
      },
    });
  });

  // Stagger project cards
  ScrollTrigger.batch('.project-card', {
    start: 'top 85%',
    onEnter: (batch) => {
      gsap.fromTo(batch, { opacity: 0, y: 60 }, {
        opacity: 1, y: 0,
        stagger: 0.12,
        duration: 0.8,
        ease: 'power3.out',
      });
    },
  });

  // Timeline items
  ScrollTrigger.batch('.timeline-item', {
    start: 'top 85%',
    onEnter: (batch) => {
      gsap.fromTo(batch, { opacity: 0, x: -30 }, {
        opacity: 1, x: 0,
        stagger: 0.15,
        duration: 0.7,
        ease: 'power2.out',
      });
    },
  });

  // Refresh after a tick to let DOM settle
  ScrollTrigger.refresh();
}
