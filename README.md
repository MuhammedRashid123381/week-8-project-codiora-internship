# Muhammad Rashid — Portfolio Website

A responsive, accessible frontend developer portfolio built with vanilla HTML, CSS, and JavaScript. Content (profile, skills, projects, blog, contact) is served through a small API service layer that reads local JSON files, with graceful fallbacks if a fetch fails.

## Live Demo
Add your deployed link here (e.g. GitHub Pages) once published.

## GitHub Repository
https://github.com/Rashid062-glitch

## Features
- Responsive layout for mobile, tablet, laptop, and desktop
- Light / dark theme toggle with saved preference
- Animated scroll reveal and skill-bar animations (IntersectionObserver)
- Services section outlining core offerings (Frontend Development, Responsive Web Design, UI/UX Design, Website Maintenance)
- Filterable project grid with an accessible modal showing tech, features, challenges, and solutions
- Blog section with article modal
- Validated contact form (inline errors, character counter, success state)
- Typewriter effect on the hero role text
- Skeleton loaders and error states while data loads
- Semantic markup, ARIA labels, keyboard-navigable modals, and visible focus states

## Technologies Used
- HTML5, CSS3 (custom properties, Grid, Flexbox, backdrop-filter)
- Vanilla JavaScript (ES Modules, Fetch API, IntersectionObserver)
- Bootstrap Icons, Google Fonts (Plus Jakarta Sans, Inter)

## Project Structure
```
portfolio/
├── index.html
├── style.css
├── script.js
├── services/
│   └── api.js          # Fetch layer for all portfolio data
├── data/
│   ├── profile.json
│   ├── skills.json
│   ├── projects.json
│   ├── blog.json
│   └── contact.json
└── images/
    ├── profile-hero.jpg
    ├── profile-about.jpg
    ├── blog_1.jpg
    ├── blog_2.jpg
    └── blog_3.jpg
```

## Installation / Running Locally
This site has no build step. Because it fetches local JSON files, serve it over HTTP rather than opening `index.html` directly (the `file://` protocol blocks `fetch`).

```bash
# From the project folder
python3 -m http.server 8000
# then open http://localhost:8000
```

Any static server works equally well (e.g. the VS Code "Live Server" extension).

## Accessibility & Performance Notes
- Alt text provided on all meaningful images; decorative icons marked `aria-hidden`
- Modals trap focus and close on `Escape` or outside click
- Form fields expose `aria-invalid` and linked error messages
- Images use explicit `width`/`height` to avoid layout shift, with `loading="lazy"` off the critical path
