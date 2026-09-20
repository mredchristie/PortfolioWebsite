// Terminal typing animation.
// The copy is authored in index.html so the hero still says something with
// JavaScript off (and so search engines index it). We read it out of the
// element, clear it, then type it back in one character at a time.
const typingElement = document.getElementById('typing-text');
const text = typingElement.textContent.trim();
// Blank it here, at parse time (this script sits at the end of <body>), not on
// `load` - waiting for load would show the finished text and then visibly
// restart it as the animation kicks in.
typingElement.textContent = '';
let index = 0;
const typingSpeed = 10;

function typeWriter() {
  if (index < text.length) {
    typingElement.textContent = text.substring(0, index + 1);
    index++;
    setTimeout(typeWriter, typingSpeed);
  }
}

// Start typing animation when page loads
window.addEventListener('load', () => {
  setTimeout(typeWriter, 500);
});

// Mobile menu toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  navMenu.classList.toggle('active');
  hamburger.setAttribute('aria-expanded', hamburger.classList.contains('active').toString());
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach((link) => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
  });
});

// Light/dark mode toggle
const themeToggle = document.getElementById('theme-toggle');
themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
});

// Navbar scroll effect
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 100) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      const offsetTop = target.offsetTop - 80;
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth',
      });
    }
  });
});

// Intersection Observer for scroll animations
const observerOptions = {
  // Low threshold: tall sections (projects is ~7000px on mobile) can never
  // reach a 10% visible fraction on a phone screen, which left them hidden.
  threshold: 0.02,
  rootMargin: '0px 0px -100px 0px',
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

// Observe elements for scroll animations
window.addEventListener('load', () => {
  const sections = document.querySelectorAll('.about, .skills, .music, .projects, .contact');
  sections.forEach((section) => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(30px)';
    section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(section);
  });
});

/*
// Particle effect on cursor (optional - can be removed if too heavy)
let particles = [];
const particleCount = 30;

class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 3 - 1.5;
        this.speedY = Math.random() * 3 - 1.5;
        this.opacity = 1;
    }
    
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.opacity -= 0.02;
    }
    
    draw(ctx) {
        ctx.fillStyle = `rgba(0, 255, 136, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

*/

/*
// Uncomment below to enable cursor particle effect

const canvas = document.createElement('canvas');
canvas.style.position = 'fixed';
canvas.style.top = '0';
canvas.style.left = '0';
canvas.style.pointerEvents = 'none';
canvas.style.zIndex = '9999';
document.body.appendChild(canvas);

const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

document.addEventListener('mousemove', (e) => {
    if (particles.length < particleCount) {
        particles.push(new Particle(e.clientX, e.clientY));
    }
});

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    particles.forEach((particle, index) => {
        particle.update();
        particle.draw(ctx);
        
        if (particle.opacity <= 0) {
            particles.splice(index, 1);
        }
    });
    
    requestAnimationFrame(animateParticles);
}

animateParticles();

*/

// Unmask transition: helmet shot cross-dissolves into the bare-face shot.
//  - Desktop: scroll-scrubbed while the photo panel is pinned to the viewport.
//  - Mobile: sticky scrubbing is unreliable, so instead auto-play the dissolve
//    once the section scrolls into view (CSS handles the timing).
(function () {
  const track = document.getElementById('reveal-track');
  const stage = document.getElementById('reveal-stage');
  if (!track || !stage) return;

  const clamp = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

  let ticking = false;
  const update = () => {
    ticking = false;
    const rect = track.getBoundingClientRect();
    const scrubDistance = rect.height - window.innerHeight;
    if (scrubDistance <= 0) {
      stage.style.setProperty('--reveal', '1');
      return;
    }
    const raw = clamp(-rect.top / scrubDistance);
    // Hold the helmet for the first 13%, run the morph across the middle 74%,
    // then hold the face for the last 13% — enough of a beat either side for the
    // change to read as begin/transition/settle, without leaving the photo
    // frozen for a screen of scrolling at each end.
    const morph = clamp((raw - 0.13) / 0.74);
    // Smoothstep easing so the morph eases in and out rather than being linear.
    const eased = morph * morph * (3 - 2 * morph);
    stage.style.setProperty('--reveal', eased.toFixed(4));
  };
  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(update);
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
})();

// This creates smooth, directional animations that trigger when scrolling

(function () {
  // Configuration
  const config = {
    threshold: 0.02, // Tiny fraction so very tall sections still trigger on phones
    rootMargin: '0px 0px -100px 0px', // Trigger before element fully in view
    triggerOnce: false, // Animation repeats on scroll
  };

  // Track which sections have been animated
  const animatedSections = new Set();

  // Intersection Observer for scroll-triggered animations
  const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      // Trigger when scrolling into view
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
      } else {
        // Remove class when scrolling away to re-trigger animation
        entry.target.classList.remove('in-view');
      }
    });
  }, config);

  // Generic data-scroll attribute observer
  const elementObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      } else {
        // Remove class when scrolling away to re-trigger animation
        entry.target.classList.remove('active');
      }
    });
  }, config);

  // Wait for DOM to be ready
  function initScrollAnimations() {
    // Observe major sections
    const sections = document.querySelectorAll(
      '.about, .skills, .interests, .music, .projects, .contact'
    );
    sections.forEach((section) => {
      scrollObserver.observe(section);
    });

    // Observe elements with data-scroll attribute
    const scrollElements = document.querySelectorAll('[data-scroll]');
    scrollElements.forEach((element) => {
      elementObserver.observe(element);
    });

    console.log(
      `Scroll animations initialized for ${sections.length} sections and ${scrollElements.length} elements`
    );
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScrollAnimations);
  } else {
    initScrollAnimations();
  }

  // Optional: Parallax effect on scroll
  let ticking = false;

  function updateParallax() {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.parallax-bg');

    parallaxElements.forEach((element) => {
      const speed = element.dataset.speed || 0.5;
      const yPos = -(scrolled * speed);
      element.style.transform = `translateY(${yPos}px)`;
    });

    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(updateParallax);
      ticking = true;
    }
  });
})();

// HTML examples:
// <div data-scroll="fade-up">Content</div>
// <div data-scroll="fade-left" data-scroll-delay="200">Content</div>
// <div data-scroll="zoom-in" data-scroll-delay="400">Content</div>
