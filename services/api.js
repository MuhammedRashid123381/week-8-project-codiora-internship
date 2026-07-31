/**
 * API Service Layer
 * Centralized fetch logic for all portfolio data
 * Handles loading states, errors, and fallbacks
 */

const API_BASE_URL = './data';

/**
 * Generic fetch wrapper with error handling
 * @param {string} endpoint - The data file path (e.g., 'profile.json')
 * @returns {Promise<Object>} - Parsed JSON data or fallback object
 */
async function fetchData(endpoint) {
  try {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`);
    
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
    
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    return { success: false, error: error.message };
  }
}

/**
 * Fetch profile/hero data
 * @returns {Promise<Object>} - Hero section data
 */
export async function getProfileData() {
  const result = await fetchData('profile.json');
  
  if (!result.success) {
    return {
      name: 'Muhammad Rashid',
      profession: 'Frontend Developer',
      bio: 'Passionate about crafting responsive, visually appealing web applications with clean code and modern UI/UX principles.',
      resume: 'cv/mycv.pdf',
      stats: [
        { number: '1+', label: 'Year Exp.' },
        { number: '7+', label: 'Skills' },
        { number: '4+', label: 'Projects' }
      ],
      socialLinks: [
        { icon: 'bi-github', url: 'https://github.com/Rashid062-glitch', label: 'GitHub' },
        { icon: 'bi-linkedin', url: 'https://www.linkedin.com/in/muhammad-rashid-07a3a4402', label: 'LinkedIn' },
        { icon: 'bi-envelope-fill', url: 'mailto:itainrashiid@gmail.com', label: 'Email' }
      ]
    };
  }
  
  return result.data;
}

/**
 * Fetch about section data
 * @returns {Promise<Object>} - About section content
 */
export async function getAboutData() {
  const result = await fetchData('profile.json');
  
  if (!result.success) {
    return {
      description: 'I\'m Muhammad Rashid, a BSIT student at Sindh Agriculture University, Tando Jam, with over a year of hands-on frontend development experience. I thrive on building clean, performant, and accessible web interfaces that users genuinely enjoy.',
      experience: '1+ Year Frontend Development',
      education: 'BSIT - Sindh Agriculture University Tando Jam Sindh Pakistan',
      careerGoals: 'Become A Full-stack Developer',
      interests: 'UI/UX Design, Modern Web Tech'
    };
  }
  
  return result.data.about || result.data;
}

/**
 * Fetch all skills
 * @returns {Promise<Array>} - Array of skill objects
 */
export async function getSkillsData() {
  const result = await fetchData('skills.json');
  
  if (!result.success) {
    return [
      { name: 'HTML5', icon: 'bi-filetype-html', percentage: 92, category: 'markup', description: 'Semantic markup, accessibility, SEO-friendly structure.' },
      { name: 'CSS3', icon: 'bi-filetype-css', percentage: 88, category: 'styling', description: 'Flexbox, Grid, animations, custom properties.' },
      { name: 'JavaScript', icon: 'bi-filetype-js', percentage: 80, category: 'scripting', description: 'ES6+, DOM manipulation, async programming.' },
      { name: 'Responsive Design', icon: 'bi-phone-fill', percentage: 90, category: 'design', description: 'Mobile-first layouts, media queries, fluid grids.' },
      { name: 'Git', icon: 'bi-git', percentage: 75, category: 'tools', description: 'Version control, branching strategies, commits.' },
      { name: 'GitHub', icon: 'bi-github', percentage: 78, category: 'tools', description: 'Repository management, collaboration, GitHub Pages.' },
      { name: 'UI/UX Design', icon: 'bi-palette-fill', percentage: 70, category: 'design', description: 'Design thinking, wireframing, visual hierarchy.' }
    ];
  }
  
  return result.data;
}

/**
 * Fetch all projects
 * @returns {Promise<Array>} - Array of project objects
 */
export async function getProjectsData() {
  const result = await fetchData('projects.json');
  
  if (!result.success) {
    return [
      {
        id: 'music-player',
        title: 'Music Player App',
        description: 'A fully responsive music player featuring playback controls, a draggable progress bar, and a sleek modern UI built entirely with HTML, CSS, and vanilla JavaScript.',
        category: 'web',
        technologies: ['HTML5', 'CSS3', 'JavaScript', 'Web Audio'],
        image: 'music',
        github: 'https://github.com/Rashid062-glitch/Music_player_app_proejct.git',
        live: 'https://rashid062-glitch.github.io/Music_player_app_proejct/'
      },
      {
        id: 'image-gallery',
        title: 'Image Gallery',
        description: 'A responsive image gallery with a masonry-style grid, lightbox preview, and smooth transition effects.',
        category: 'web',
        technologies: ['HTML5', 'CSS3', 'JavaScript', 'CSS Grid'],
        image: 'gallery',
        github: 'https://github.com/Rashid062-glitch/Image_Gallery_project.git',
        live: 'https://rashid062-glitch.github.io/Image_Gallery_project/'
      },
      {
        id: 'login-form',
        title: 'Login Form',
        description: 'A modern authentication UI featuring real-time form validation, a password visibility toggle, fully responsive layout.',
        category: 'uiux',
        technologies: ['HTML5', 'CSS3', 'JavaScript'],
        image: 'login',
        github: 'https://github.com/Rashid062-glitch/Loginform_project.git',
        live: 'https://rashid062-glitch.github.io/Loginform_project/'
      },
      {
        id: 'weather-app',
        title: 'Weather App',
        description: 'A clean weather application with real-time data display, city search functionality, and responsive layout.',
        category: 'data',
        technologies: ['HTML5', 'CSS3', 'JavaScript', 'REST API'],
        image: 'weather',
        github: '#',
        live: '#'
      }
    ];
  }
  
  return result.data;
}

/**
 * Fetch contact information
 * @returns {Promise<Object>} - Contact data with email, phone, social links
 */
export async function getContactData() {
  const result = await fetchData('contact.json');
  
  if (!result.success) {
    return {
      email: 'itainrashiid@gmail.com',
      phone: '+92-XXXXXXXXX',
      address: 'Tando Jam, Sindh, Pakistan',
      socialLinks: [
        { icon: 'bi-github', url: 'https://github.com/Rashid062-glitch', label: 'GitHub' },
        { icon: 'bi-linkedin', url: 'https://www.linkedin.com/in/muhammad-rashid-07a3a4402', label: 'LinkedIn' },
        { icon: 'bi-envelope-fill', url: 'mailto:itainrashiid@gmail.com', label: 'Email' }
      ]
    };
  }
  
  return result.data;
}

/**
 * Fetch blog articles
 * @returns {Promise<Array>} - Array of blog article objects
 */
export async function getBlogData() {
  const result = await fetchData('blog.json');
  
  if (!result.success) {
    return [
      {
        id: 'css-techniques',
        title: 'Modern CSS Techniques Every Frontend Developer Should Know',
        category: 'CSS',
        date: 'Jun 12, 2026',
        readTime: '6 min read',
        image: 'images/blog_1.jpg',
        description: 'From container queries to the new color functions, a practical tour of the CSS features that are changing how we build layouts in 2026.',
        body: '<p>CSS has quietly absorbed a huge amount of layout and logic that used to require JavaScript...</p>'
      },
      {
        id: 'js-performance',
        title: 'JavaScript Performance Optimization Tips',
        category: 'JavaScript',
        date: 'Jun 5, 2026',
        readTime: '8 min read',
        image: 'images/blog_2.jpg',
        description: 'Debouncing, event delegation, lazy loading, and the small habits that keep interfaces fast.',
        body: '<p>Most performance problems in frontend JavaScript come from doing too much work too often...</p>'
      },
      {
        id: 'web-accessibility',
        title: 'Web Accessibility Best Practices',
        category: 'Accessibility',
        date: 'May 28, 2026',
        readTime: '7 min read',
        image: 'images/blog_3.jpg',
        description: 'A practical checklist for semantic markup, keyboard navigation, and ARIA patterns.',
        body: '<p>Accessibility isn\'t a separate feature bolted onto a finished site...</p>'
      }
    ];
  }
  
  return result.data;
}

/**
 * Search projects by name, description, or technologies
 * @param {Array} projects - Array of project objects
 * @param {string} query - Search query string
 * @returns {Array} - Filtered projects
 */
export function searchProjects(projects, query) {
  if (!query || query.trim() === '') return projects;
  
  const lowerQuery = query.toLowerCase();
  return projects.filter(project => 
    project.title.toLowerCase().includes(lowerQuery) ||
    project.description.toLowerCase().includes(lowerQuery) ||
    project.technologies.some(tech => tech.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Filter projects by category
 * @param {Array} projects - Array of project objects
 * @param {string} category - Category to filter by
 * @returns {Array} - Filtered projects
 */
export function filterProjectsByCategory(projects, category) {
  if (category === 'all') return projects;
  return projects.filter(project => project.category === category);
}

/**
 * Filter projects by technology
 * @param {Array} projects - Array of project objects
 * @param {string} technology - Technology to filter by
 * @returns {Array} - Filtered projects
 */
export function filterProjectsByTechnology(projects, technology) {
  if (!technology) return projects;
  return projects.filter(project => 
    project.technologies.some(tech => tech.toLowerCase() === technology.toLowerCase())
  );
}

/**
 * Combined search and filter
 * @param {Array} projects - Array of project objects
 * @param {string} searchQuery - Search query
 * @param {string} category - Category filter
 * @returns {Array} - Filtered and searched projects
 */
export function getFilteredProjects(projects, searchQuery = '', category = 'all') {
  let filtered = searchProjects(projects, searchQuery);
  filtered = filterProjectsByCategory(filtered, category);
  return filtered;
}