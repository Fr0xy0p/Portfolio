/**
 * ============================================================================
 * SWISS STYLE ARCHITECTURAL INTERACTIONS & TELEMETRY — YUVRAJ SINGH
 * Vanilla JavaScript (No Frameworks, No Build Step, Pure Native Logic)
 * Inspired by Daniel Ingrassia (ingrassiadaniel.it)
 * ============================================================================
 */

(function () {
  'use strict';

  // --------------------------------------------------------------------------
  // 1. Accessibility & Touch Detection
  // --------------------------------------------------------------------------
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  // --------------------------------------------------------------------------
  // 2. Custom Architectural Desktop Cursor
  // --------------------------------------------------------------------------
  const cursor = document.getElementById('custom-cursor');
  if (cursor && !isTouchDevice) {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let cursorX = mouseX;
    let cursorY = mouseY;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    }, { passive: true });

    // Interactive Hover Elements
    const interactiveElements = 'a, button, input, textarea, .project-card, .language-card, .objective-card, .timeline-card, .social-card, .contrib-day-cell, .domain-card';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(interactiveElements)) {
        cursor.classList.add('hovering');
      }
    });

    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(interactiveElements)) {
        cursor.classList.remove('hovering');
      }
    });

    function updateCursor() {
      cursorX += (mouseX - cursorX) * 0.22;
      cursorY += (mouseY - cursorY) * 0.22;
      cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;
      requestAnimationFrame(updateCursor);
    }
    requestAnimationFrame(updateCursor);
  }

  // --------------------------------------------------------------------------
  // 3. Navigation, Stage Tracking & HUD Telemetry
  // --------------------------------------------------------------------------
  const siteHeader = document.getElementById('site-header');
  const mobileToggle = document.getElementById('mobile-toggle-btn');
  const mobileNav = document.getElementById('mobile-nav');
  const navItems = document.querySelectorAll('.desktop-nav .nav-item');
  const mobileNavItems = document.querySelectorAll('.mobile-nav-item');
  const sections = document.querySelectorAll('.portfolio-section, #landing');
  const hudStageElem = document.getElementById('hud-stage-name');
  const liveClockElem = document.getElementById('live-clock');

  // Mobile Nav Toggle
  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener('click', () => {
      const isExpanded = mobileToggle.getAttribute('aria-expanded') === 'true';
      mobileToggle.setAttribute('aria-expanded', !isExpanded);
      if (isExpanded) {
        mobileNav.setAttribute('hidden', '');
      } else {
        mobileNav.removeAttribute('hidden');
      }
    });

    mobileNavItems.forEach(item => {
      item.addEventListener('click', () => {
        mobileNav.setAttribute('hidden', '');
        mobileToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Section Observer for HUD Stage Name & Active Nav State
  const sectionObserverOptions = {
    root: null,
    rootMargin: '-25% 0px -60% 0px',
    threshold: 0
  };

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        const stageName = entry.target.getAttribute('data-stage') || (id === 'landing' ? '00 // FORMATION' : id.toUpperCase());

        if (hudStageElem) {
          hudStageElem.textContent = stageName;
        }

        // Active link highlighting
        navItems.forEach(link => {
          const targetSection = link.getAttribute('data-section');
          if (targetSection === id) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });

        mobileNavItems.forEach(link => {
          const targetSection = link.getAttribute('data-section');
          if (targetSection === id) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, sectionObserverOptions);

  sections.forEach(sec => sectionObserver.observe(sec));

  // --------------------------------------------------------------------------
  // 4. Live Telemetry Clock (IST / UTC+05:30)
  // --------------------------------------------------------------------------
  function updateTelemetryClock() {
    if (!liveClockElem) return;
    const now = new Date();
    const options = {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    };
    liveClockElem.textContent = new Intl.DateTimeFormat('en-GB', options).format(now) + ' IST';
  }
  updateTelemetryClock();
  setInterval(updateTelemetryClock, 1000);

  // --------------------------------------------------------------------------
  // 5. Interactive GitHub Contribution Tooltip
  // --------------------------------------------------------------------------
  const contribCells = document.querySelectorAll('.contrib-day-cell');
  if (contribCells.length > 0) {
    let tooltip = document.querySelector('.contrib-floating-tooltip');
    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.className = 'contrib-floating-tooltip';
      document.body.appendChild(tooltip);
    }

    contribCells.forEach(cell => {
      cell.addEventListener('mouseenter', () => {
        const tip = cell.getAttribute('data-tip');
        if (!tip) return;
        tooltip.textContent = tip;
        const rect = cell.getBoundingClientRect();
        tooltip.style.left = (rect.left + rect.width / 2) + 'px';
        tooltip.style.top = rect.top + 'px';
        tooltip.classList.add('visible');
      });

      cell.addEventListener('mouseleave', () => {
        tooltip.classList.remove('visible');
      });
    });
  }

  // --------------------------------------------------------------------------
  // 6. Direct Dispatch Email Copy Interaction
  // --------------------------------------------------------------------------
  const copyBtn = document.getElementById('copy-email-btn');
  const copyText = document.getElementById('copy-btn-text');
  if (copyBtn && copyText) {
    copyBtn.addEventListener('click', () => {
      const email = 'yuraj.math.dev@gmail.com';
      navigator.clipboard.writeText(email).then(() => {
        copyText.textContent = 'Copied to Clipboard!';
        copyBtn.style.backgroundColor = 'var(--status-emerald)';
        copyBtn.style.borderColor = 'var(--status-emerald)';
        copyBtn.style.color = '#FFFFFF';
        setTimeout(() => {
          copyText.textContent = 'Copy Email';
          copyBtn.style.backgroundColor = '';
          copyBtn.style.borderColor = '';
          copyBtn.style.color = '';
        }, 2200);
      }).catch(() => {
        copyText.textContent = email;
      });
    });
  }

  // --------------------------------------------------------------------------
  // 7. Theme Switcher (Light Swiss Editorial <-> Dark Architectural Cobalt)
  // --------------------------------------------------------------------------
  const themeToggle = document.getElementById('theme-toggle-btn');
  if (themeToggle) {
    // Check saved preference; default to light
    const savedTheme = localStorage.getItem('portfolio-theme');
    if (savedTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }

    themeToggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('portfolio-theme', next);
    });
  }

  // --------------------------------------------------------------------------
  // 8. Smooth Enter Landing Viewport Scroll Button
  // --------------------------------------------------------------------------
  const scrollEnterBtn = document.getElementById('scroll-enter-btn');
  if (scrollEnterBtn) {
    scrollEnterBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const heroSec = document.getElementById('hero');
      if (heroSec) {
        heroSec.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

})();
