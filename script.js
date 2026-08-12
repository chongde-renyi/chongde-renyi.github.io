Exit code: 0
Wall time: 1 seconds
Output:
const button = document.querySelector('.menu-toggle');
const nav = document.querySelector('#site-nav');
const links = [...document.querySelectorAll('#site-nav a')];

button.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  button.setAttribute('aria-expanded', String(open));
});

links.forEach(link => link.addEventListener('click', () => {
  nav.classList.remove('open');
  button.setAttribute('aria-expanded', 'false');
}));

const sections = [...document.querySelectorAll('main section[id]')];
const observer = new IntersectionObserver(entries => {
  const visible = entries.filter(entry => entry.isIntersecting)
    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
  if (!visible) return;
  links.forEach(link => link.classList.toggle('active', link.hash === `#${visible.target.id}`));
}, { rootMargin: '-25% 0px -60%', threshold: [0, .25, .6] });
sections.forEach(section => observer.observe(section));

