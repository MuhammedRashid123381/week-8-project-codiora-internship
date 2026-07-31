/* ========================================
   IMPORTS - API SERVICE LAYER
   ======================================== */
import {
  getProfileData,
  getAboutData,
  getSkillsData,
  getProjectsData,
  getContactData,
  getBlogData,
  getFilteredProjects,
  searchProjects,
  filterProjectsByCategory
} from './services/api.js';

/* ========================================
   LOADING STATE MANAGEMENT
   ======================================== */
const LOADING_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error'
};

let appState = {
  projects: [],
  skills: [],
  articles: [],
  profile: {},
  contact: {},
  loadingState: LOADING_STATES.IDLE,
  projectsLoading: false,
  skillsLoading: false
};

/* ========================================
   HELPER: Show Skeleton Loader
   ======================================== */
function showSkeletonLoader(containerId, count = 4) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  let html = '';
  for (let i = 0; i < count; i++) {
    html += `
      <div class="skeleton-card" style="animation-delay: ${i * 50}ms">
        <div class="skeleton-image"></div>
        <div class="skeleton-content">
          <div class="skeleton-line skeleton-title"></div>
          <div class="skeleton-line skeleton-desc"></div>
          <div class="skeleton-line skeleton-desc"></div>
        </div>
      </div>
    `;
  }
  container.innerHTML = html;
}

/* ========================================
   HELPER: Show Error State
   ======================================== */
function showErrorState(containerId, errorMessage = 'Failed to load content') {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  container.innerHTML = `
    <div class="error-state" style="text-align: center; padding: 2rem;">
      <i class="bi bi-exclamation-triangle" style="font-size: 2.5rem; color: var(--clr-primary); margin-bottom: 1rem; display: block;"></i>
      <p style="color: var(--clr-text-md); margin-bottom: 1rem;">${errorMessage}</p>
      <button class="btn btn-primary btn-sm" onclick="location.reload()">
        <i class="bi bi-arrow-clockwise"></i> Retry
      </button>
    </div>
  `;
}

/* ========================================
   1. INITIALIZE APP - Load all data
   ======================================== */
async function initializeApp() {
  try {
    appState.loadingState = LOADING_STATES.LOADING;

    showSkeletonLoader('skillsGrid', 7);
    showSkeletonLoader('projectsGrid', 4);
    showSkeletonLoader('blogGrid', 3);

    const [profileData, aboutData, skillsData, projectsData, contactData, blogData] = await Promise.all([
      getProfileData(),
      getAboutData(),
      getSkillsData(),
      getProjectsData(),
      getContactData(),
      getBlogData()
    ]);
    
    appState.profile = profileData;
    appState.skills = skillsData || [];
    appState.projects = projectsData || [];
    appState.contact = contactData;
    appState.articles = blogData || [];
    
    appState.loadingState = LOADING_STATES.SUCCESS;
    
    renderSkills();
    renderProjects();
    renderBlog();
    updateContactLinks();
    
  } catch (error) {
    console.error('Error initializing app:', error);
    appState.loadingState = LOADING_STATES.ERROR;
    showErrorState('skillsGrid', 'Failed to load skills');
    showErrorState('projectsGrid', 'Failed to load projects');
    showErrorState('blogGrid', 'Failed to load articles');
  }
}

/* ========================================
   RENDER SKILLS SECTION
   ======================================== */
function renderSkills() {
  const skillsGrid = document.querySelector('.skills-grid');
  if (!skillsGrid) return;
  
  if (!appState.skills || appState.skills.length === 0) {
    showErrorState('skillsGrid', 'No skills available');
    return;
  }
  
  let html = '';
  appState.skills.forEach((skill, index) => {
    const iconClass = skill.icon || 'bi-star-fill';
    const categoryClass = `skill-${skill.category || 'default'}`;
    
    html += `
      <div class="skill-card" data-reveal data-delay="${index * 80}">
        <div class="skill-icon-wrap ${categoryClass}">
          <i class="bi ${iconClass}"></i>
        </div>
        <h3 class="skill-name">${skill.name}</h3>
        <p class="skill-desc">${skill.description}</p>
        <div class="skill-bar"><div class="skill-fill" data-width="${skill.percentage}"></div></div>
        <span class="skill-pct">${skill.percentage}%</span>
      </div>
    `;
  });
  
  skillsGrid.innerHTML = html;
  
  const skillCards = document.querySelectorAll('.skill-card');
  if (window.skillObserver) {
    skillCards.forEach(card => window.skillObserver.observe(card));
  }
  
  if (window.revealObserver) {
    skillCards.forEach(card => window.revealObserver.observe(card));
  }
}

/* ========================================
   RENDER PROJECTS SECTION
   ======================================== */
function renderProjects(filteredProjects = null) {
  const projectsGrid = document.getElementById('projectsGrid');
  if (!projectsGrid) return;
  
  const projects = filteredProjects || appState.projects;
  
  if (!projects || projects.length === 0) {
    projectsGrid.innerHTML = '';
    const emptyEl = document.getElementById('projectsEmpty');
    if (emptyEl) emptyEl.hidden = false;
    return;
  }
  
  const emptyEl = document.getElementById('projectsEmpty');
  if (emptyEl) emptyEl.hidden = true;
  
  let html = '';
  projects.forEach((project, index) => {
    const imageType = project.image || 'music';
    const techTags = (project.technologies || [])
      .map(tech => `<span class="tag">${tech}</span>`)
      .join('');
    
    html += `
      <div class="project-card" 
           data-reveal 
           data-delay="${index * 120}"
           data-category="${project.category}"
           data-project-id="${project.id}"
           tabindex="0"
           role="button"
           aria-haspopup="dialog"
           aria-label="View details for ${project.title} project">
        <div class="project-thumb project-thumb--${imageType}">
          <div class="project-thumb-inner">
            ${getProjectPlaceholder(imageType)}
          </div>
          <div class="project-overlay">
            <a href="${project.github}" class="btn btn-sm btn-white" target="_blank" rel="noopener" aria-label="View ${project.title} source code on GitHub"><i class="bi bi-github" aria-hidden="true"></i> Code</a>
            <a href="${project.live}" class="btn btn-sm btn-primary" target="_blank" rel="noopener" aria-label="View live demo of ${project.title}">Live <i class="bi bi-box-arrow-up-right" aria-hidden="true"></i></a>
          </div>
        </div>
        <div class="project-body">
          <div class="project-tags">${techTags}</div>
          <h3 class="project-title">${project.title}</h3>
          <p class="project-desc">${project.description}</p>
          <div class="project-links">
            <a href="${project.github}" class="link-btn" target="_blank" rel="noopener"><i class="bi bi-github" aria-hidden="true"></i> GitHub</a>
            <a href="${project.live}" class="link-btn link-btn--accent" target="_blank" rel="noopener"><i class="bi bi-play-circle-fill" aria-hidden="true"></i> Live Demo</a>
          </div>
        </div>
      </div>
    `;
  });
  
  projectsGrid.innerHTML = html;
  
  if (window.revealObserver) {
    document.querySelectorAll('.project-card[data-reveal]').forEach(card => {
      window.revealObserver.observe(card);
    });
  }
  
  bindProjectCardEvents();
}

/* ========================================
   PROJECT PLACEHOLDER GENERATOR
   ======================================== */
function getProjectPlaceholder(type) {
  const placeholders = {
    music: `<svg viewBox="0 0 280 160" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Music player app interface preview">
      <rect width="280" height="160" rx="12" fill="#1e1040"/>
      <rect x="30" y="20" width="220" height="120" rx="10" fill="#0d0825"/>
      <circle cx="140" cy="62" r="28" fill="url(#musicGrad)"/>
      <circle cx="140" cy="62" r="16" fill="#0d0825"/>
      <circle cx="140" cy="62" r="5" fill="#9926f0"/>
      <circle cx="88" cy="62" r="14" fill="#1e1040"/>
      <circle cx="192" cy="62" r="14" fill="#1e1040"/>
      <polygon points="84,56 84,68 96,62" fill="#bb6ef5"/>
      <polygon points="184,56 184,68 196,62" fill="#bb6ef5" transform="rotate(180,190,62)"/>
      <rect x="40" y="105" width="200" height="5" rx="3" fill="#1e1040"/>
      <rect x="40" y="105" width="120" height="5" rx="3" fill="url(#musicGrad)"/>
      <circle cx="160" cy="107" r="6" fill="#fff"/>
      <rect x="60" y="120" width="100" height="7" rx="3" fill="#bb6ef5" opacity=".5"/>
      <rect x="80" y="132" width="60" height="5" rx="2" fill="#9926f0" opacity=".3"/>
      <defs>
        <linearGradient id="musicGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#9926f0"/>
          <stop offset="100%" stop-color="#bb6ef5"/>
        </linearGradient>
      </defs>
    </svg>`,
    gallery: `<svg viewBox="0 0 280 160" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Image gallery grid preview">
      <rect width="280" height="160" rx="12" fill="#1e1040"/>
      <rect x="20" y="15" width="74" height="60" rx="8" fill="url(#gal1)"/>
      <rect x="103" y="15" width="74" height="60" rx="8" fill="url(#gal2)"/>
      <rect x="186" y="15" width="74" height="60" rx="8" fill="url(#gal3)"/>
      <rect x="20" y="85" width="74" height="60" rx="8" fill="url(#gal4)"/>
      <rect x="103" y="85" width="74" height="60" rx="8" fill="url(#gal5)"/>
      <rect x="186" y="85" width="74" height="60" rx="8" fill="url(#gal6)"/>
      <defs>
        <linearGradient id="gal1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#9926f0"/><stop offset="100%" stop-color="#4a1a8e"/></linearGradient>
        <linearGradient id="gal2" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#7b2ff7"/><stop offset="100%" stop-color="#bb6ef5"/></linearGradient>
        <linearGradient id="gal3" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#bb6ef5"/><stop offset="100%" stop-color="#9926f0"/></linearGradient>
        <linearGradient id="gal4" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#4a1a8e"/><stop offset="100%" stop-color="#7b2ff7"/></linearGradient>
        <linearGradient id="gal5" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#9926f0"/><stop offset="100%" stop-color="#bb6ef5"/></linearGradient>
        <linearGradient id="gal6" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#7b2ff7"/><stop offset="100%" stop-color="#4a1a8e"/></linearGradient>
      </defs>
    </svg>`,
    login: `<svg viewBox="0 0 280 160" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Login form UI preview">
      <rect width="280" height="160" rx="12" fill="#1e1040"/>
      <rect x="55" y="12" width="170" height="136" rx="12" fill="#0d0825"/>
      <rect x="95" y="25" width="90" height="10" rx="5" fill="#9926f0" opacity=".8"/>
      <circle cx="140" cy="56" r="18" fill="#1e1040"/>
      <circle cx="140" cy="52" r="8" fill="#bb6ef5" opacity=".5"/>
      <ellipse cx="140" cy="68" rx="12" ry="7" fill="#bb6ef5" opacity=".3"/>
      <rect x="75" y="82" width="130" height="14" rx="7" fill="#1e1040"/>
      <rect x="75" y="102" width="130" height="14" rx="7" fill="#1e1040"/>
      <circle cx="86" cy="89" r="4" fill="#9926f0" opacity=".5"/>
      <circle cx="86" cy="109" r="4" fill="#9926f0" opacity=".5"/>
      <rect x="96" y="86" width="80" height="6" rx="3" fill="#2d1d6e"/>
      <rect x="96" y="106" width="80" height="6" rx="3" fill="#2d1d6e"/>
      <rect x="85" y="122" width="110" height="18" rx="9" fill="url(#loginGrad)"/>
      <rect x="110" y="128" width="60" height="6" rx="3" fill="#fff" opacity=".7"/>
      <defs>
        <linearGradient id="loginGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#9926f0"/>
          <stop offset="100%" stop-color="#7b2ff7"/>
        </linearGradient>
      </defs>
    </svg>`,
    weather: `<svg viewBox="0 0 280 160" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Weather app dashboard preview">
      <rect width="280" height="160" rx="12" fill="#1e1040"/>
      <rect x="30" y="20" width="220" height="120" rx="12" fill="url(#weatherGrad)"/>
      <rect x="50" y="35" width="100" height="8" rx="4" fill="#fff" opacity=".7"/>
      <text x="120" y="80" font-size="36" font-weight="800" fill="#fff" text-anchor="middle">28°</text>
      <path d="M80,70 Q75,60 85,55 Q95,50 100,60 Q110,55 115,65 Q120,60 125,70Z" fill="#fff" opacity=".6"/>
      <rect x="60" y="100" width="120" height="6" rx="3" fill="#fff" opacity=".4"/>
      <rect x="50" y="115" width="35" height="15" rx="6" fill="#fff" opacity=".1"/>
      <rect x="95" y="115" width="35" height="15" rx="6" fill="#fff" opacity=".1"/>
      <rect x="140" y="115" width="35" height="15" rx="6" fill="#fff" opacity=".1"/>
      <defs>
        <linearGradient id="weatherGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#7b2ff7"/>
          <stop offset="100%" stop-color="#9926f0"/>
        </linearGradient>
      </defs>
    </svg>`
  };
  
  return placeholders[type] || placeholders.music;
}

/* ========================================
   RENDER BLOG SECTION
   ======================================== */
function renderBlog() {
  const blogGrid = document.querySelector('.blog-grid');
  if (!blogGrid) return;
  
  if (!appState.articles || appState.articles.length === 0) {
    showErrorState('blogGrid', 'No articles available');
    return;
  }
  
  let html = '';
  appState.articles.forEach((article, index) => {
    html += `
      <article class="blog-card" data-reveal data-delay="${index * 120}" data-article-id="${article.id}">
        <div class="blog-thumb">
          <img
            src="${article.image}"
            alt="${article.title}"
            width="800" height="450"
            loading="lazy"
            class="blog-img"
          />
          <span class="blog-category-pill">${article.category}</span>
        </div>
        <div class="blog-body">
          <div class="blog-meta">
            <span><i class="bi bi-calendar3" aria-hidden="true"></i> ${article.date}</span>
            <span><i class="bi bi-clock" aria-hidden="true"></i> ${article.readTime}</span>
          </div>
          <h3 class="blog-title">${article.title}</h3>
          <p class="blog-desc">${article.description}</p>
          <div class="blog-footer">
            <div class="blog-author">
              <i class="bi bi-person-circle" aria-hidden="true"></i>
              <span>Muhammad Rashid</span>
            </div>
            <button type="button" class="read-more-btn" data-article="${article.id}" aria-haspopup="dialog">
              Read More <i class="bi bi-arrow-right" aria-hidden="true"></i>
            </button>
          </div>
        </div>
      </article>
    `;
  });
  
  blogGrid.innerHTML = html;
  
  if (window.revealObserver) {
    document.querySelectorAll('.blog-card[data-reveal]').forEach(card => {
      window.revealObserver.observe(card);
    });
  }
  
  bindBlogCardEvents();
}

/* ========================================
   UPDATE CONTACT LINKS
   ======================================== */
function updateContactLinks() {
  if (!appState.contact) return;
  
  const contactLinks = document.querySelector('.contact-links');
  if (!contactLinks) return;
  
  let html = '';
  
  if (appState.contact.email) {
    html += `
      <a href="mailto:${appState.contact.email}" class="contact-link">
        <div class="contact-link-icon"><i class="bi bi-envelope-fill" aria-hidden="true"></i></div>
        <div>
          <strong>Email</strong>
          <span>${appState.contact.email}</span>
        </div>
      </a>
    `;
  }
  
  if (appState.contact.socialLinks && appState.contact.socialLinks.length > 0) {
    appState.contact.socialLinks.forEach(link => {
      if (link.label === 'GitHub') {
        html += `
          <a href="${link.url}" class="contact-link">
            <div class="contact-link-icon"><i class="bi ${link.icon}" aria-hidden="true"></i></div>
            <div>
              <strong>${link.label}</strong>
              <span>github.com</span>
            </div>
          </a>
        `;
      } else if (link.label === 'LinkedIn') {
        html += `
          <a href="${link.url}" class="contact-link">
            <div class="contact-link-icon"><i class="bi ${link.icon}" aria-hidden="true"></i></div>
            <div>
              <strong>${link.label}</strong>
              <span>linkedin.com</span>
            </div>
          </a>
        `;
      }
    });
  }
  
  if (html) {
    contactLinks.innerHTML = html;
  }
}

/* ========================================
   BIND PROJECT CARD EVENTS
   ======================================== */
function bindProjectCardEvents() {
  const projectsGrid = document.getElementById('projectsGrid');
  if (!projectsGrid) return;
  
  if (window.projectGridListener) {
    projectsGrid.removeEventListener('click', window.projectGridListener);
    projectsGrid.removeEventListener('keydown', window.projectGridListener);
  }
  
  window.projectGridListener = function(e) {
    if (e.target.closest('a')) return;
    const card = e.target.closest('.project-card');
    if (card) openProjectModal(card.dataset.projectId);
  };
  
  projectsGrid.addEventListener('click', window.projectGridListener);
  
  projectsGrid.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const card = e.target.closest('.project-card');
    if (!card) return;
    e.preventDefault();
    openProjectModal(card.dataset.projectId);
  });
}

/* ========================================
   BIND BLOG CARD EVENTS
   ======================================== */
function bindBlogCardEvents() {
  const blogGrid = document.querySelector('.blog-grid');
  if (!blogGrid) return;
  
  if (window.blogGridListener) {
    blogGrid.removeEventListener('click', window.blogGridListener);
  }
  
  window.blogGridListener = function(e) {
    const trigger = e.target.closest('.read-more-btn') || e.target.closest('.blog-thumb');
    if (!trigger) return;
    const card = trigger.closest('.blog-card');
    if (card) openArticleModal(card.dataset.articleId);
  };
  
  blogGrid.addEventListener('click', window.blogGridListener);
}

/* ========================================
   OPEN PROJECT MODAL (Updated)
   ======================================== */
function openProjectModal(projectId) {
  const project = appState.projects.find(p => p.id === projectId);
  if (!project) return;
  
  const projectModal = document.getElementById('projectModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalDesc = document.getElementById('modalDesc');
  const modalTech = document.getElementById('modalTech');
  const modalFeatures = document.getElementById('modalFeatures');
  const modalChallenges = document.getElementById('modalChallenges');
  const modalSolutions = document.getElementById('modalSolutions');
  const modalDuration = document.getElementById('modalDuration');
  const modalGithub = document.getElementById('modalGithub');
  const modalLive = document.getElementById('modalLive');
  
  modalTitle.textContent = project.title;
  modalDesc.textContent = project.description;
  
  modalTech.innerHTML = (project.technologies || [])
    .map(t => `<span class="tag">${t}</span>`)
    .join('');
  
  modalFeatures.innerHTML = (project.features || [])
    .map(f => `<li>${f}</li>`)
    .join('');
  
  modalChallenges.textContent = project.challenges || '';
  modalSolutions.textContent = project.solutions || '';
  modalDuration.textContent = project.duration || '';
  
  modalGithub.href = project.github || '#';
  modalLive.href = project.live || '#';
  
  renderGallery(project.image);
  openModal(projectModal);
}

/* ========================================
   OPEN ARTICLE MODAL (Updated)
   ======================================== */
function openArticleModal(articleId) {
  const article = appState.articles.find(a => a.id === articleId);
  if (!article) return;
  
  const articleModal = document.getElementById('articleModal');
  const articleModalImg = document.getElementById('articleModalImg');
  const articleModalTitle = document.getElementById('articleModalTitle');
  const articleModalMeta = document.getElementById('articleModalMeta');
  const articleModalBody = document.getElementById('articleModalBody');
  
  articleModalImg.src = article.image;
  articleModalImg.alt = article.title;
  articleModalTitle.textContent = article.title;
  articleModalMeta.innerHTML = `
    <span><i class="bi bi-tag" aria-hidden="true"></i> ${article.category}</span>
    <span><i class="bi bi-calendar3" aria-hidden="true"></i> ${article.date}</span>
    <span><i class="bi bi-clock" aria-hidden="true"></i> ${article.readTime}</span>
  `;
  articleModalBody.innerHTML = article.body || '';
  
  openModal(articleModal);
}

/* ========================================
   PROJECT FILTERING (Updated to use API)
   ======================================== */
function applyProjectFilter(category) {
  const filtered = filterProjectsByCategory(appState.projects, category);
  renderProjects(filtered);
}

/* ========================================
   MAIN INITIALIZATION
   ======================================== */
document.addEventListener('DOMContentLoaded', () => {
  
  initializeApp();

  /* ------------------------------------------
     2. THEME TOGGLE (Dark/Light Mode)
  ------------------------------------------ */
  const themeToggle = document.getElementById('themeToggle');
  const STORAGE_KEY = 'portfolio-theme';

  function setTheme(theme) {
    const isDark = theme === 'dark';
    document.body.classList.toggle('theme-dark', isDark);
    themeToggle.innerHTML = isDark
      ? '<i class="bi bi-moon-stars-fill"></i>'
      : '<i class="bi bi-sun-fill"></i>';
    themeToggle.classList.toggle('switched', isDark);
    localStorage.setItem(STORAGE_KEY, theme);
  }

  function initTheme() {
    const savedTheme = localStorage.getItem(STORAGE_KEY) || 'light';
    setTheme(savedTheme);
  }

  themeToggle.addEventListener('click', () => {
    const isDark = document.body.classList.contains('theme-dark');
    setTheme(isDark ? 'light' : 'dark');
  });

  initTheme();

  /* ------------------------------------------
     3. NAVBAR: scroll state + active links
  ------------------------------------------ */
  const navbar   = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  function updateNavbar() {
    navbar.classList.toggle('scrolled', window.scrollY > 60);

    let currentId = '';
    sections.forEach(section => {
      const sectionTop    = section.offsetTop - 100;
      const sectionHeight = section.offsetHeight;
      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        currentId = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      const isActive = link.getAttribute('href') === `#${currentId}`;
      link.classList.toggle('active', isActive);
    });
  }

  let scrollTicking = false;
  function onScroll() {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(() => {
      updateNavbar();
      toggleBackToTop();
      scrollTicking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  updateNavbar();

  /* ------------------------------------------
     4. HAMBURGER MENU
  ------------------------------------------ */
  const hamburger  = document.getElementById('hamburger');
  const navLinksEl = document.getElementById('navLinks');

  hamburger.addEventListener('click', () => {
    const isOpen = navLinksEl.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  navLinksEl.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-link')) return;
    navLinksEl.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });

  /* ------------------------------------------
     5. SCROLL REVEAL  (IntersectionObserver)
  ------------------------------------------ */
  const revealEls = document.querySelectorAll('[data-reveal]');

  window.revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el    = entry.target;
        const delay = parseInt(el.dataset.delay || '0', 10);
        setTimeout(() => el.classList.add('revealed'), delay);
        window.revealObserver.unobserve(el);
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
  );

  revealEls.forEach(el => window.revealObserver.observe(el));

  /* ------------------------------------------
     6. SKILL BAR ANIMATION
  ------------------------------------------ */
  const skillCards = document.querySelectorAll('.skill-card');

  window.skillObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const fill  = entry.target.querySelector('.skill-fill');
        const width = fill ? fill.dataset.width : 0;
        if (fill) {
          setTimeout(() => { fill.style.width = `${width}%`; }, 200);
        }
        window.skillObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.4 }
  );

  skillCards.forEach(card => window.skillObserver.observe(card));

  /* ------------------------------------------
     7. PROJECT FILTERING SYSTEM
  ------------------------------------------ */
  const filterBar    = document.querySelector('.project-filters');
  const projectsGrid = document.getElementById('projectsGrid');
  const projectsEmpty = document.getElementById('projectsEmpty');

  if (filterBar) {
    filterBar.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;

      filterBar.querySelectorAll('.filter-btn').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      applyProjectFilter(btn.dataset.filter);
    });
  }

  /* ------------------------------------------
     8. PROJECT MODAL
  ------------------------------------------ */
  const projectModal = document.getElementById('projectModal');
  const modalGallery = document.getElementById('modalGallery');
  const modalCloseBtn = document.getElementById('modalClose');

  let galleryIndex = 0;
  let galleryTotal = 0;

  const GALLERY_SVG_BUILDERS = {
    music: (i) => `
      <svg viewBox="0 0 700 394" xmlns="http://www.w3.org/2000/svg">
        <rect width="700" height="394" fill="#0d0825"/>
        <rect x="60" y="40" width="580" height="314" rx="18" fill="#1e1040"/>
        <circle cx="350" cy="150" r="${70 - i * 6}" fill="#9926f0" opacity="${0.9 - i * 0.15}"/>
        <circle cx="350" cy="150" r="${40 - i * 4}" fill="#0d0825"/>
        <rect x="110" y="270" width="480" height="10" rx="5" fill="#2d1d6e"/>
        <rect x="110" y="270" width="${180 + i * 60}" height="10" rx="5" fill="#bb6ef5"/>
        <circle cx="${110 + 180 + i * 60}" cy="275" r="10" fill="#fff"/>
        <rect x="260" y="300" width="180" height="12" rx="6" fill="#bb6ef5" opacity="0.5"/>
      </svg>`,
    gallery: (i) => `
      <svg viewBox="0 0 700 394" xmlns="http://www.w3.org/2000/svg">
        <rect width="700" height="394" fill="#0d0825"/>
        <rect x="40" y="${30 + i * 10}" width="200" height="160" rx="10" fill="#9926f0" opacity="0.7"/>
        <rect x="250" y="${50 - i * 10}" width="200" height="${180 + i * 10}" rx="10" fill="#7b2ff7" opacity="0.6"/>
        <rect x="460" y="${40 + i * 15}" width="200" height="170" rx="10" fill="#bb6ef5" opacity="0.5"/>
        <rect x="40" y="220" width="300" height="140" rx="10" fill="#4a1a8e" opacity="0.6"/>
        <rect x="360" y="250" width="300" height="110" rx="10" fill="#9926f0" opacity="0.45"/>
      </svg>`,
    login: (i) => `
      <svg viewBox="0 0 700 394" xmlns="http://www.w3.org/2000/svg">
        <rect width="700" height="394" fill="#0d0825"/>
        <rect x="200" y="30" width="300" height="334" rx="18" fill="#1e1040"/>
        <circle cx="350" cy="110" r="38" fill="#bb6ef5" opacity="0.5"/>
        <rect x="240" y="${180 + i * 4}" width="220" height="32" rx="10" fill="#0d0825"/>
        <rect x="240" y="${230 + i * 4}" width="220" height="32" rx="10" fill="#0d0825"/>
        <rect x="240" y="${290 + i * 2}" width="220" height="40" rx="20" fill="#9926f0"/>
      </svg>`,
    weather: (i) => `
      <svg viewBox="0 0 700 394" xmlns="http://www.w3.org/2000/svg">
        <rect width="700" height="394" fill="#0d0825"/>
        <rect x="80" y="40" width="540" height="314" rx="18" fill="#7b2ff7" opacity="0.25"/>
        <text x="350" y="${190 + i * 5}" font-size="64" font-weight="800" fill="#fff" text-anchor="middle">${24 + i * 2}°</text>
        <path d="M280,150 Q270,130 290,120 Q310,108 322,128 Q340,118 350,138 Q362,128 372,150Z" fill="#fff" opacity="0.55"/>
        <rect x="140" y="280" width="120" height="50" rx="10" fill="#fff" opacity="0.12"/>
        <rect x="290" y="280" width="120" height="50" rx="10" fill="#fff" opacity="0.12"/>
        <rect x="440" y="280" width="120" height="50" rx="10" fill="#fff" opacity="0.12"/>
      </svg>`
  };

  function renderGallery(galleryKey) {
    const builder = GALLERY_SVG_BUILDERS[galleryKey] || GALLERY_SVG_BUILDERS.music;
    galleryTotal = 3;
    galleryIndex = 0;

    let slidesHtml = '';
    for (let i = 0; i < galleryTotal; i++) {
      slidesHtml += `<div class="modal-gallery-slide${i === 0 ? ' active' : ''}" data-slide="${i}">${builder(i)}</div>`;
    }

    let dotsHtml = '<div class="modal-gallery-nav">';
    for (let i = 0; i < galleryTotal; i++) {
      dotsHtml += `<button type="button" class="modal-gallery-dot${i === 0 ? ' active' : ''}" data-go="${i}" aria-label="Show screenshot ${i + 1}"></button>`;
    }
    dotsHtml += '</div>';

    modalGallery.innerHTML = `
      ${slidesHtml}
      <button type="button" class="modal-gallery-arrow modal-gallery-arrow--prev" aria-label="Previous screenshot"><i class="bi bi-chevron-left"></i></button>
      <button type="button" class="modal-gallery-arrow modal-gallery-arrow--next" aria-label="Next screenshot"><i class="bi bi-chevron-right"></i></button>
      ${dotsHtml}
    `;
  }

  function goToSlide(index) {
    const slides = modalGallery.querySelectorAll('.modal-gallery-slide');
    const dots   = modalGallery.querySelectorAll('.modal-gallery-dot');
    galleryIndex = (index + galleryTotal) % galleryTotal;

    slides.forEach((s, i) => s.classList.toggle('active', i === galleryIndex));
    dots.forEach((d, i) => d.classList.toggle('active', i === galleryIndex));
  }

  modalGallery.addEventListener('click', (e) => {
    if (e.target.closest('.modal-gallery-arrow--prev')) {
      goToSlide(galleryIndex - 1);
    } else if (e.target.closest('.modal-gallery-arrow--next')) {
      goToSlide(galleryIndex + 1);
    } else {
      const dot = e.target.closest('.modal-gallery-dot');
      if (dot) goToSlide(parseInt(dot.dataset.go, 10));
    }
  });

  modalCloseBtn.addEventListener('click', () => closeModal(projectModal));

  /* ------------------------------------------
     9. BLOG ARTICLE MODAL
  ------------------------------------------ */
  const articleModal      = document.getElementById('articleModal');
  const articleCloseBtn   = document.getElementById('articleModalClose');

  articleCloseBtn.addEventListener('click', () => closeModal(articleModal));

  /* ------------------------------------------
     10. SHARED MODAL HELPERS
     Focus trap, ESC to close, outside click to close
  ------------------------------------------ */
  let lastFocusedElement = null;
  let activeModal = null;

  window.openModal = function(modalEl) {
    lastFocusedElement = document.activeElement;
    activeModal = modalEl;

    modalEl.removeAttribute('hidden');
    document.body.classList.add('modal-open');

    requestAnimationFrame(() => modalEl.classList.add('is-open'));

    const focusables = getFocusableElements(modalEl);
    if (focusables.length) focusables[0].focus();
  };

  window.closeModal = function(modalEl) {
    modalEl.classList.remove('is-open');
    document.body.classList.remove('modal-open');

    const onTransitionEnd = () => {
      modalEl.setAttribute('hidden', '');
      modalEl.removeEventListener('transitionend', onTransitionEnd);
    };
    modalEl.addEventListener('transitionend', onTransitionEnd);

    activeModal = null;
    if (lastFocusedElement) lastFocusedElement.focus();
  };

  function getFocusableElements(container) {
    return Array.from(
      container.querySelectorAll(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      )
    ).filter(el => el.offsetParent !== null);
  }

  document.addEventListener('keydown', (e) => {
    if (!activeModal) return;

    if (e.key === 'Escape') {
      closeModal(activeModal);
      return;
    }

    if (e.key === 'Tab') {
      const focusables = getFocusableElements(activeModal);
      if (!focusables.length) return;

      const first = focusables[0];
      const last  = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  [projectModal, articleModal].forEach(modalEl => {
    modalEl.addEventListener('click', (e) => {
      if (e.target === modalEl) closeModal(modalEl);
    });
  });

  /* ------------------------------------------
     11. CONTACT FORM VALIDATION
  ------------------------------------------ */
  const contactForm  = document.getElementById('contactForm');
  const formSuccess  = document.getElementById('formSuccess');
  const submitBtn    = document.getElementById('submitBtn');
  const submitBtnText = submitBtn.querySelector('.submit-btn-text');
  const messageCount = document.getElementById('messageCount');

  const FIELD_RULES = {
    name: {
      validate: (val) => {
        if (!val) return 'Please enter your full name.';
        if (val.length < 2) return 'Name must be at least 2 characters.';
        if (val.length > 60) return 'Name must be under 60 characters.';
        return '';
      }
    },
    email: {
      validate: (val) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!val) return 'Please enter your email address.';
        if (!emailRegex.test(val)) return 'Please enter a valid email address.';
        return '';
      }
    },
    message: {
      validate: (val) => {
        if (!val) return 'Please write a message.';
        if (val.length < 15) return 'Message must be at least 15 characters.';
        if (val.length > 800) return 'Message must be under 800 characters.';
        return '';
      }
    }
  };

  function setFieldState(id, errorMessage) {
    const input = document.getElementById(id);
    const error = document.getElementById(`${id}Error`);
    const hasError = Boolean(errorMessage);

    input.classList.toggle('error', hasError);
    input.classList.toggle('valid', !hasError && input.value.trim() !== '');
    input.setAttribute('aria-invalid', String(hasError));
    error.textContent = errorMessage;

    return !hasError;
  }

  function validateField(id) {
    const input = document.getElementById(id);
    const message = FIELD_RULES[id].validate(input.value.trim());
    return setFieldState(id, message);
  }

  function updateSubmitState() {
    const allValid = Object.keys(FIELD_RULES).every(id => {
      const input = document.getElementById(id);
      return FIELD_RULES[id].validate(input.value.trim()) === '';
    });
    submitBtn.disabled = !allValid;
  }

  contactForm.addEventListener('input', (e) => {
    const id = e.target.id;
    if (!FIELD_RULES[id]) return;

    validateField(id);
    updateSubmitState();

    if (id === 'message') {
      messageCount.textContent = `${e.target.value.length} / 800`;
    }
  });

  contactForm.addEventListener('blur', (e) => {
    const id = e.target.id;
    if (FIELD_RULES[id]) validateField(id);
  }, true);

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const results = Object.keys(FIELD_RULES).map(validateField);
    const allValid = results.every(Boolean);
    updateSubmitState();

    if (!allValid) {
      const firstInvalid = contactForm.querySelector('.form-input.error');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    submitBtn.disabled = true;
    submitBtnText.textContent = 'Sending...';
    submitBtn.querySelector('i').className = 'bi bi-hourglass-split';

    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtnText.textContent = 'Send Message';
      submitBtn.querySelector('i').className = 'bi bi-send-fill';

      formSuccess.classList.add('show');
      contactForm.reset();
      messageCount.textContent = '0 / 800';

      ['name', 'email', 'message'].forEach(id => {
        const input = document.getElementById(id);
        input.classList.remove('error', 'valid');
        input.setAttribute('aria-invalid', 'false');
        document.getElementById(`${id}Error`).textContent = '';
      });

      setTimeout(() => formSuccess.classList.remove('show'), 5000);
    }, 1400);
  });

  updateSubmitState();

  /* ------------------------------------------
     12. BACK TO TOP BUTTON
  ------------------------------------------ */
  const backToTop = document.getElementById('backToTop');

  function toggleBackToTop() {
    backToTop.classList.toggle('visible', window.scrollY > 400);
  }

  toggleBackToTop();

  /* ------------------------------------------
     13. FOOTER YEAR
  ------------------------------------------ */
  document.getElementById('year').textContent = new Date().getFullYear();

  /* ------------------------------------------
     14. SMOOTH SCROLL POLYFILL
  ------------------------------------------ */
  if (!CSS.supports('scroll-behavior', 'smooth')) {
    document.body.addEventListener('click', (e) => {
      const anchor = e.target.closest('a[href^="#"]');
      if (!anchor) return;
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  /* ------------------------------------------
     15. TYPEWRITER EFFECT on Hero role text
  ------------------------------------------ */
  (function typewriter() {
    const roles = [
      'Frontend Developer',
      'UI/UX Enthusiast',
      'Responsive Design Advocate',
    ];

    const el = document.querySelector('.hero-role');
    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.textContent = roles[0];
      return;
    }

    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function tick() {
      const current = roles[roleIndex];

      if (!isDeleting) {
        el.textContent = current.substring(0, charIndex + 1);
        charIndex++;

        if (charIndex === current.length) {
          setTimeout(() => { isDeleting = true; tick(); }, 1800);
          return;
        }
      } else {
        el.textContent = current.substring(0, charIndex - 1);
        charIndex--;

        if (charIndex === 0) {
          isDeleting = false;
          roleIndex  = (roleIndex + 1) % roles.length;
        }
      }

      const speed = isDeleting ? 50 : 85;
      setTimeout(tick, speed);
    }

    setTimeout(tick, 800);
  })();

  /* ------------------------------------------
     16. CARD TILT EFFECT on project cards
  ------------------------------------------ */
  let tiltRaf = null;

  if (projectsGrid) {
    projectsGrid.addEventListener('mousemove', (e) => {
      const card = e.target.closest('.project-card');
      if (!card) return;

      if (tiltRaf) cancelAnimationFrame(tiltRaf);
      tiltRaf = requestAnimationFrame(() => {
        const rect = card.getBoundingClientRect();
        const x  = e.clientX - rect.left;
        const y  = e.clientY - rect.top;
        const cx = rect.width  / 2;
        const cy = rect.height / 2;
        const rotateX = ((y - cy) / cy) * -4;
        const rotateY = ((x - cx) / cx) *  4;

        card.style.transform = `translateY(-8px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      });
    });

    projectsGrid.addEventListener('mouseleave', (e) => {
      const card = e.target.closest('.project-card');
      if (!card) return;
      card.style.transform = '';
      card.style.transition = 'transform 0.4s ease';
    }, true);

    projectsGrid.addEventListener('mouseenter', (e) => {
      const card = e.target.closest('.project-card');
      if (!card) return;
      card.style.transition = 'transform 0.1s ease';
    }, true);
  }

});
