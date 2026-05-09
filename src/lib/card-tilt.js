export function initCardTilt(card) {
  const inner = card.querySelector('.project-card-inner');

  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -12;
    const rotateY = ((x - centerX) / centerX) * 16;

    inner.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

    // Gloss effect
    const glossX = (x / rect.width) * 100;
    const glossY = (y / rect.height) * 100;
    card.style.setProperty('--gloss-x', `${glossX}%`);
    card.style.setProperty('--gloss-y', `${glossY}%`);
  });

  card.addEventListener('mouseleave', () => {
    inner.style.transform = 'rotateX(0) rotateY(0)';
  });
}
