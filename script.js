// Terminal typing animation
const text =
  "Hello! I'm Ed Christie, a passionate Applied Software Engineering student specializing in full-stack development, accessible design, and modern web technologies. Currently building innovative solutions with React, PostgreSQL, and Docker while pursuing excellence in software engineering at Cardiff University.";
let index = 0;
const typingElement = document.getElementById('typing-text');
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
  threshold: 0.1,
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
  const sections = document.querySelectorAll('.about, .skills, .projects, .contact');
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

// Update profile image fallback
const profileImg = document.getElementById('profile-img');
profileImg.addEventListener('error', function () {
  // If profile image fails to load, use a gradient placeholder
  this.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  this.style.display = 'flex';
  this.style.alignItems = 'center';
  this.style.justifyContent = 'center';
  this.innerHTML = '<span style="font-size: 80px; color: white;">EC</span>';
});

// This creates smooth, directional animations that trigger when scrolling

(function () {
  // Configuration
  const config = {
    threshold: 0.15, // How much of element must be visible (15%)
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
    const sections = document.querySelectorAll('.about, .skills, .interests, .projects, .contact');
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

// Scroll animation observer for snippets section
const snippetsScrollObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && entry.boundingClientRect.top > 0) {
        entry.target.classList.add('in-view');
        snippetsScrollObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.15,
    rootMargin: '0px 0px -100px 0px',
  }
);

// Observe the snippets section when it exists
function observeSnippetsSection() {
  const snippetsSection = document.querySelector('.snippets-section');
  if (snippetsSection) {
    snippetsScrollObserver.observe(snippetsSection);
  }
}

// Initialize after snippets are rendered
const originalRenderSnippets = renderSnippets;
renderSnippets = function () {
  originalRenderSnippets();
  // Reset animation state when re-rendering (e.g., after search/filter)
  setTimeout(() => {
    const snippetsSection = document.querySelector('.snippets-section');
    if (snippetsSection) {
      snippetsSection.classList.add('in-view');
    }
  }, 100);
};

// Observe on page load
observeSnippetsSection();
