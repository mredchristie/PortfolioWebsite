// Terminal typing animation
const text = "Hello! I'm Ed Christie, a passionate Applied Software Engineering student specializing in full-stack development, accessible design, and modern web technologies. Currently building innovative solutions with React, PostgreSQL, and Docker while pursuing excellence in software engineering at Cardiff University.";
let index = 0;
const typingElement = document.getElementById('typing-text');
const typingSpeed = 30;

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
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
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
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// GitLab Projects Integration
async function fetchGitLabProjects() {
    const projectsGrid = document.getElementById('projects-grid');
    
    // Replace with your GitLab username and instance URL
    const username = 'c22067305';  // Your GitLab username
    const gitlabInstance = 'https://git.cardiff.ac.uk'; // Cardiff University GitLab
    
    try {
        // GitLab API endpoint for user projects
        const response = await fetch(`${gitlabInstance}/api/v4/users/${username}/projects?order_by=updated_at&per_page=6`);
        
        if (!response.ok) {
            throw new Error('GitLab API request failed');
        }
        
        const repos = await response.json();
        
        // Clear loading message
        projectsGrid.innerHTML = '';
        
        // Filter for public projects - check multiple possible visibility values
        const filteredRepos = repos
            .filter(repo => {
                // GitLab might use different visibility values
                return repo.visibility === 'public' || 
                       repo.public === true || 
                       !repo.visibility || // Sometimes visibility isn't set
                       repo.visibility_level === 20; // GitLab uses numeric levels: 20 = public
            })
            .sort((a, b) => b.star_count - a.star_count)
            .slice(0, 6);
        
        // If no projects after filtering, just show all projects
        if (filteredRepos.length === 0) {
            console.log('No projects matched visibility filter, showing all projects');
            const allProjects = repos.slice(0, 6);
            
            if (allProjects.length === 0) {
                projectsGrid.innerHTML = '<p class="loading">No repositories found. Make sure your username is correct!</p>';
                return;
            }
            
            allProjects.forEach(repo => {
                const projectCard = createGitLabProjectCard(repo);
                projectsGrid.appendChild(projectCard);
            });
            return;
        }
        
        filteredRepos.forEach(repo => {
            const projectCard = createGitLabProjectCard(repo);
            projectsGrid.appendChild(projectCard);
        });
        
    } catch (error) {
        console.error('Error fetching GitLab projects:', error);
        projectsGrid.innerHTML = `
            <div class="loading">
                <p>Unable to load GitLab projects at the moment.</p>
                <p style="margin-top: 1rem; font-size: 0.9rem;">Error: ${error.message}</p>
            </div>
        `;
    }
}

function createGitLabProjectCard(repo) {
    const card = document.createElement('div');
    card.className = 'project-card';
    
    // Get primary language or set default
    const language = repo.topics && repo.topics.length > 0 ? repo.topics[0] : 'Code';
    
    // Determine icon based on language or topics
    const iconMap = {
        'javascript': '⚡',
        'typescript': '💎',
        'python': '🐍',
        'java': '☕',
        'kotlin': '🎯',
        'html': '🌐',
        'css': '🎨',
        'react': '⚛️',
        'Default': '📦'
    };
    const icon = iconMap[language.toLowerCase()] || iconMap['Default'];
    
    // Truncate description if too long
    const description = repo.description 
        ? (repo.description.length > 120 
            ? repo.description.substring(0, 120) + '...' 
            : repo.description)
        : 'No description available';
    
    // Get topics for tech stack
    const topics = repo.topics && repo.topics.length > 0 
        ? repo.topics.slice(0, 5) 
        : [language];
    
    card.innerHTML = `
        <div class="project-header">
            <div class="project-icon">${icon}</div>
            <div class="project-links">
                <a href="${repo.web_url}" target="_blank" rel="noopener noreferrer" class="project-link" aria-label="View on GitLab">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M23.546 10.93L13.067.452c-.604-.603-1.582-.603-2.188 0L.395 10.93c-.526.529-.526 1.387 0 1.914l10.48 10.479c.604.604 1.582.604 2.186 0l10.48-10.48c.527-.527.527-1.385 0-1.913zM6.639 6.639l5.36 5.36-5.36 5.36-5.36-5.36 5.36-5.36zm11.722 0l5.36 5.36-5.36 5.36-5.36-5.36 5.36-5.36z"/>
                    </svg>
                </a>
            </div>
        </div>
        <h3>${repo.name}</h3>
        <p class="project-description">${description}</p>
        <div class="project-tech">
            ${topics.map(topic => `<span class="tech-tag">${topic}</span>`).join('')}
        </div>
    `;
    
    return card;
}

// Intersection Observer for scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for scroll animations
window.addEventListener('load', () => {
    const sections = document.querySelectorAll('.about, .skills, .projects, .contact');
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });
});

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

// Uncomment below to enable cursor particle effect
/*
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

// Load GitLab projects when page loads
fetchGitLabProjects();

// Add console message for developers
console.log('%c👋 Hey there, fellow developer!', 'font-size: 20px; color: #00ff88; font-weight: bold;');
console.log('%cInterested in the code? Check it out on GitLab!', 'font-size: 14px; color: #8892b0;');
console.log('%c🚀 Built with vanilla JS, CSS, and passion', 'font-size: 12px; color: #0099ff;');

// Easter egg: Konami code
let konamiCode = [];
const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.key);
    konamiCode.splice(-konamiSequence.length - 1, konamiCode.length - konamiSequence.length);
    
    if (konamiCode.join('').includes(konamiSequence.join(''))) {
        activateEasterEgg();
    }
});

function activateEasterEgg() {
    document.body.style.animation = 'rainbow 2s linear infinite';
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes rainbow {
            0% { filter: hue-rotate(0deg); }
            100% { filter: hue-rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
    
    setTimeout(() => {
        document.body.style.animation = '';
        style.remove();
    }, 5000);
    
    console.log('%c🎉 KONAMI CODE ACTIVATED! 🎉', 'font-size: 30px; color: #00ff88; font-weight: bold; text-shadow: 0 0 10px #00ff88;');
}

// Update profile image fallback
const profileImg = document.getElementById('profile-img');
profileImg.addEventListener('error', function() {
    // If profile image fails to load, use a gradient placeholder
    this.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    this.style.display = 'flex';
    this.style.alignItems = 'center';
    this.style.justifyContent = 'center';
    this.innerHTML = '<span style="font-size: 80px; color: white;">EC</span>';
});
