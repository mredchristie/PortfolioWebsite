// Mobile nav
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  navMenu.classList.toggle('active');
  hamburger.setAttribute('aria-expanded', hamburger.classList.contains('active').toString());
});

document.querySelectorAll('.nav-link').forEach((link) => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
  });
});

// Theme toggle
const themeToggle = document.getElementById('theme-toggle');
themeToggle.addEventListener('click', () => {
  const next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
});

// Navbar scroll shadow
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 100);
});

// ── Filter ────────────────────────────────────────────────────────────
const filterBtns = document.querySelectorAll('.filter-btn');
const items = document.querySelectorAll('.gallery-item');
const visibleCount = document.getElementById('visible-count');
const noResults = document.getElementById('no-results');

function applyFilter(filter) {
  let count = 0;
  items.forEach((item) => {
    const match = filter === 'all' || item.dataset.category === filter;
    item.classList.toggle('hidden', !match);
    if (match) count++;
  });
  visibleCount.textContent = count;
  noResults.hidden = count > 0;
}

filterBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    filterBtns.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    applyFilter(btn.dataset.filter);
  });
});

// Show the initial photo count
applyFilter('all');

// ── Lightbox ──────────────────────────────────────────────────────────
const lightbox = document.getElementById('lightbox');
const lbImg = document.getElementById('lightbox-img');
const lbCounter = document.getElementById('lightbox-counter');

let visibleItems = [];
let currentIndex = 0;

function getVisible() {
  return [...items].filter((i) => !i.classList.contains('hidden'));
}

function openLightbox(item) {
  visibleItems = getVisible();
  currentIndex = visibleItems.indexOf(item);
  showSlide(currentIndex);
  lightbox.hidden = false;
  document.body.style.overflow = 'hidden';
  document.getElementById('lightbox-close').focus();
}

function closeLightbox() {
  lightbox.hidden = true;
  document.body.style.overflow = '';
}

function showSlide(index) {
  const item = visibleItems[index];
  const img = item.querySelector('img');
  lbImg.src = img.src;
  lbImg.alt = img.alt;
  lbCounter.textContent = `${index + 1} / ${visibleItems.length}`;
}

items.forEach((item) => {
  item.addEventListener('click', () => openLightbox(item));
  item.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openLightbox(item);
    }
  });
  item.setAttribute('tabindex', '0');
  item.setAttribute('role', 'button');
  item.setAttribute('aria-label', `View photo: ${item.querySelector('img').alt}`);
});

document.getElementById('lightbox-close').addEventListener('click', closeLightbox);

document.getElementById('lightbox-prev').addEventListener('click', () => {
  currentIndex = (currentIndex - 1 + visibleItems.length) % visibleItems.length;
  showSlide(currentIndex);
});

document.getElementById('lightbox-next').addEventListener('click', () => {
  currentIndex = (currentIndex + 1) % visibleItems.length;
  showSlide(currentIndex);
});

// Close on backdrop click
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
  if (lightbox.hidden) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') {
    currentIndex = (currentIndex - 1 + visibleItems.length) % visibleItems.length;
    showSlide(currentIndex);
  }
  if (e.key === 'ArrowRight') {
    currentIndex = (currentIndex + 1) % visibleItems.length;
    showSlide(currentIndex);
  }
});
