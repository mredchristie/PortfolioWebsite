// Light/dark mode toggle
document.getElementById('theme-toggle').addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
});

// Code snippets collection
// Add your snippets here following this format:

const snippets = [
  {
    id: 1,
    title: 'Jenkins CI/CD Deployment Script',
    description:
      'Complete Jenkins server setup with Java, Gradle, MariaDB, and Git SSH configuration for automated SpringBoot deployment',
    language: 'bash',
    tags: ['jenkins', 'ci-cd', 'java', 'gradle', 'mariadb', 'deployment'],
    date: '2025-01-28',
    code: `#!/bin/bash
# Exit on first error
# This is a script for springboot application - to setup and deploy on a Jenkins server.
# There are a few missing bits like passwords and private key, and they are to fill in yourself :)
set -e
echo "cd to /root directory..."
cd /root
echo "whoami..."
whoami
echo "pwd..."
pwd
# Upgrade first off
echo "upgrading..."
sudo dnf upgrade -y -q
# Create directory for Java installation
sudo mkdir -p /opt/java
cd /opt/java
# Download Java JDK
sudo curl -sLO https://github.com/adoptium/temurin17-binaries/releases/download/jdk-17.0.14%2B7/OpenJDK17U-jdk_x64_linux_hotspot_17.0.14_7.tar.gz
# Extract the downloaded archive
sudo tar xvfz OpenJDK17U-jdk_x64_linux_hotspot_17.0.14_7.tar.gz
# Set up environment variables
echo 'export PATH=/opt/java/jdk-17.0.14+7/bin:$PATH' | sudo tee -a /etc/profile.d/java.sh
echo 'export JAVA_HOME=/opt/java/jdk-17.0.14+7' | sudo tee -a /etc/profile.d/java.sh
# Source the new environment variables
source /etc/profile.d/java.sh
# Verify Java installation
java --version
javac --version
# Setup Gradle
sudo mkdir -p /opt/gradle
cd /opt/gradle
sudo wget -q https://services.gradle.org/distributions/gradle-8.1.1-bin.zip -O gradle.zip
sudo unzip -q gradle.zip
sudo rm gradle.zip
echo 'export PATH=/opt/gradle/gradle-8.1.1/bin:$PATH' | sudo tee -a /etc/profile.d/gradle.sh
source /etc/profile.d/gradle.sh
gradle --version
# MariaDB setup
echo "setting up mariadb"
sudo dnf install mariadb-server -y
echo "starting and enabling MariaDB service"
sudo systemctl start mariadb
sudo systemctl enable mariadb
sudo mysql -e "CREATE DATABASE springboot_demo;"
sudo mysql -e "CREATE USER 'springuser'@'localhost' IDENTIFIED BY '<password>';"
sudo mysql -e "GRANT ALL ON springboot_demo.* TO 'springuser'@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES"
# Install git
echo "Installing git"
sudo dnf install git -y
# Ensure .ssh directory exists
mkdir -p ~/.ssh
chmod 700 ~/.ssh
# Add the private key
<priv_key>
echo "$PRIVATE_KEY" >~/.ssh/id_rsa
sudo chmod 400 ~/.ssh/id_rsa
echo "hi"
sudo ssh-keyscan git.cardiff.ac.uk >>~/.ssh/known_hosts
echo "hi hi"
# Attempt to clone the repository with error handling
git clone <repo_url> || {
    echo "Git clone failed. Checking SSH connection..."
    ssh -vT git@git.cardiff.ac.uk || true
    exit 1
}
cd <directory> || exit 1
# Build and run the project
if [ -f "./gradlew" ]; then
    ./gradlew build
    ./gradlew bootRun
else
    gradle build
    gradle bootRun
fi
echo "Changing to the project directory..."
echo "end of script..."`,
  },
];

// DOM elements
const snippetsGrid = document.getElementById('snippets-grid');
const searchInput = document.getElementById('search-input');
const filterButtons = document.querySelectorAll('.filter-btn');
const noResults = document.getElementById('no-results');
const scrollProgress = document.getElementById('scroll-progress');

// State
let currentFilter = 'all';
let currentSearch = '';

// Render snippets
function renderSnippets() {
  const filteredSnippets = snippets.filter((snippet) => {
    const matchesFilter =
      currentFilter === 'all' ||
      snippet.language === currentFilter ||
      snippet.tags.includes(currentFilter);

    const matchesSearch =
      currentSearch === '' ||
      snippet.title.toLowerCase().includes(currentSearch.toLowerCase()) ||
      snippet.description.toLowerCase().includes(currentSearch.toLowerCase()) ||
      snippet.tags.some((tag) => tag.toLowerCase().includes(currentSearch.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  if (filteredSnippets.length === 0) {
    snippetsGrid.style.display = 'none';
    noResults.style.display = 'block';
    return;
  }

  snippetsGrid.style.display = 'grid';
  noResults.style.display = 'none';

  snippetsGrid.innerHTML = filteredSnippets
    .map(
      (snippet) => `
        <div class="snippet-card" data-id="${snippet.id}">
            <div class="snippet-header">
                <div class="snippet-title-section">
                    <h3>${snippet.title}</h3>
                    <p class="snippet-description">${snippet.description}</p>
                </div>
                <span class="snippet-language">${snippet.language}</span>
            </div>
            <div class="snippet-code-wrapper">
                <button class="copy-button" onclick="copyCode(${snippet.id})">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    Copy
                </button>
                <div class="snippet-code">
                    <pre><code>${escapeHtml(snippet.code)}</code></pre>
                </div>
            </div>
            <div class="snippet-footer">
                <div class="snippet-tags">
                    ${snippet.tags.map((tag) => `<span class="snippet-tag">${tag}</span>`).join('')}
                </div>
                <span class="snippet-date">${snippet.date}</span>
            </div>
        </div>
    `
    )
    .join('');
}

// Escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Copy code to clipboard
function copyCode(snippetId) {
  const snippet = snippets.find((s) => s.id === snippetId);
  if (!snippet) return;

  navigator.clipboard.writeText(snippet.code).then(() => {
    const button = document.querySelector(`[data-id="${snippetId}"] .copy-button`);
    const originalText = button.innerHTML;

    button.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            Copied!
        `;
    button.classList.add('copied');

    setTimeout(() => {
      button.innerHTML = originalText;
      button.classList.remove('copied');
    }, 2000);
  });
}

// Search handler
searchInput.addEventListener('input', (e) => {
  currentSearch = e.target.value;
  renderSnippets();
});

// Filter handlers
filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    filterButtons.forEach((btn) => {
      btn.classList.remove('active');
      btn.setAttribute('aria-pressed', 'false');
    });
    button.classList.add('active');
    button.setAttribute('aria-pressed', 'true');
    currentFilter = button.dataset.filter;
    renderSnippets();
  });
});

// Scroll progress bar
function updateScrollProgress() {
  const windowHeight = window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight - windowHeight;
  const scrolled = window.scrollY;
  const progress = (scrolled / documentHeight) * 100;
  scrollProgress.style.width = progress + '%';
}

window.addEventListener('scroll', updateScrollProgress);
window.addEventListener('resize', updateScrollProgress);

// Mobile menu
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

// Initialize
renderSnippets();
updateScrollProgress();
