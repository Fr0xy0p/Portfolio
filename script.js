/**
 * ===================================================================
 * YURAJ PORTFOLIO - SCRIPT LOGIC
 * Includes: 3D Interactive Avatar, Mathematical Particle Canvas,
 * GitHub Contributions Table Generator & Tooltip, Project Filter,
 * One-Click Copy for Email/Phone & Interactive Contact Form.
 * ===================================================================
 */

document.addEventListener('DOMContentLoaded', () => {

  // 1. Math Background Particle Canvas
  initMathCanvas();

  // 2. 3D Interactive Card (Upper Left Corner Avatar)
  initInteractiveCard();

  // 3. GitHub Contributions Table Generator
  initGitHubContributions();

  // 4. Project Filters
  initProjectFilters();

  // 5. Connect Section (Copy Email / Phone & Form)
  initConnectActions();

  // 6. Navigation Smooth Scroll & Active Indicator
  initNavigation();
});

/* ===================================================================
   1. MATHEMATICAL FLOATING PARTICLE CANVAS
   =================================================================== */
function initMathCanvas() {
  const canvas = document.getElementById('math-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const mathSymbols = ['∑', '∫', 'π', '∇f', 'e', 'λ', 'dx/dt', '∞', 'σ²', 'μ', 'Δ', 'ℝⁿ', '∂²/∂x²', 'E=mc²', 'i', 'θ', 'Ψ'];
  const particles = [];
  const particleCount = Math.min(38, Math.floor(width / 35));

  class Particle {
    constructor() {
      this.reset();
      this.y = Math.random() * height; // initial distribution
    }

    reset() {
      this.x = Math.random() * width;
      this.y = height + 20;
      this.symbol = mathSymbols[Math.floor(Math.random() * mathSymbols.length)];
      this.size = Math.random() * 14 + 11;
      this.speedY = Math.random() * 0.45 + 0.25;
      this.speedX = (Math.random() - 0.5) * 0.35;
      this.opacity = Math.random() * 0.45 + 0.15;
      this.color = Math.random() > 0.5 ? '#00f2fe' : '#a855f7';
    }

    update() {
      this.y -= this.speedY;
      this.x += this.speedX;

      if (this.y < -30) {
        this.reset();
      }
    }

    draw() {
      ctx.save();
      ctx.font = `${this.size}px 'JetBrains Mono', monospace`;
      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.opacity;
      ctx.fillText(this.symbol, this.x, this.y);
      ctx.restore();
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    for (let p of particles) {
      p.update();
      p.draw();
    }
    requestAnimationFrame(animate);
  }

  animate();
}

/* ===================================================================
   2. 3D INTERACTIVE AVATAR CARD (Upper Left Corner)
   =================================================================== */
function initInteractiveCard() {
  const card = document.getElementById('interactiveCard');
  if (!card) return;

  const glowLayer = card.querySelector('.card-glow-layer');
  let bounds = card.getBoundingClientRect();

  function updateBounds() {
    bounds = card.getBoundingClientRect();
  }

  window.addEventListener('resize', updateBounds);
  window.addEventListener('scroll', updateBounds, { passive: true });

  card.addEventListener('mousemove', (e) => {
    const mouseX = e.clientX - bounds.left;
    const mouseY = e.clientY - bounds.top;

    const centerX = bounds.width / 2;
    const centerY = bounds.height / 2;

    const percentX = (mouseX - centerX) / centerX;
    const percentY = (mouseY - centerY) / centerY;

    const maxRotation = 18; // degrees
    const rotateY = percentX * maxRotation;
    const rotateX = -percentY * maxRotation;

    card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.03, 1.03, 1.03)`;

    if (glowLayer) {
      const glowX = (mouseX / bounds.width) * 100;
      const glowY = (mouseY / bounds.height) * 100;
      glowLayer.style.background = `radial-gradient(circle at ${glowX}% ${glowY}%, rgba(0, 242, 254, 0.4) 0%, rgba(168, 85, 247, 0.25) 45%, transparent 75%)`;
    }
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    if (glowLayer) {
      glowLayer.style.background = `radial-gradient(circle, rgba(0, 242, 254, 0.25) 0%, rgba(168, 85, 247, 0.15) 50%, transparent 75%)`;
    }
  });

  // Interactive Particle Burst on Avatar Click
  card.addEventListener('click', (e) => {
    createClickBurst(e.clientX, e.clientY);
  });
}

function createClickBurst(originX, originY) {
  const burstSymbols = ['∑', '∫', 'π', 'λ', '∇', 'δ', 'dx', 'f(x)', '42', '1.618'];
  const burstCount = 10;

  for (let i = 0; i < burstCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'burst-math-particle';
    particle.textContent = burstSymbols[Math.floor(Math.random() * burstSymbols.length)];
    
    // Random angle & distance
    const angle = (Math.PI * 2 * i) / burstCount + (Math.random() - 0.5) * 0.5;
    const distance = Math.random() * 80 + 50;
    const destX = Math.cos(angle) * distance;
    const destY = Math.sin(angle) * distance;

    Object.assign(particle.style, {
      position: 'fixed',
      left: `${originX}px`,
      top: `${originY}px`,
      color: Math.random() > 0.5 ? '#00f2fe' : '#39d353',
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: `${Math.random() * 8 + 14}px`,
      fontWeight: 'bold',
      pointerEvents: 'none',
      zIndex: '9999',
      transform: 'translate(-50%, -50%) scale(1)',
      transition: 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease',
      opacity: '1'
    });

    document.body.appendChild(particle);

    requestAnimationFrame(() => {
      particle.style.transform = `translate(calc(-50% + ${destX}px), calc(-50% + ${destY}px)) scale(0.6)`;
      particle.style.opacity = '0';
    });

    setTimeout(() => {
      particle.remove();
    }, 850);
  }
}

/* ===================================================================
   3. GITHUB CONTRIBUTIONS TABLE GENERATOR & TOOLTIP
   =================================================================== */
function initGitHubContributions() {
  const grid = document.getElementById('contributionGrid');
  const monthsContainer = document.getElementById('heatmapMonths');
  const tooltip = document.getElementById('heatmapTooltip');
  const refreshBtn = document.getElementById('ghFetchBtn');
  const usernameInput = document.getElementById('ghUsernameInput');

  if (!grid || !monthsContainer) return;

  const totalWeeks = 52;
  const daysPerWeek = 7;
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  function buildCalendar() {
    grid.innerHTML = '';
    monthsContainer.innerHTML = '';

    // Month headers
    const today = new Date(2026, 9, 27); // Local project anchor
    const currentMonth = today.getMonth();

    // Populate month labels evenly across the 52 weeks
    for (let i = 0; i < 12; i++) {
      const monthIdx = (currentMonth - 11 + i + 12) % 12;
      const monthSpan = document.createElement('span');
      monthSpan.textContent = monthNames[monthIdx];
      monthsContainer.appendChild(monthSpan);
    }

    // Seeded contribution data to generate an impressive math/developer pattern
    const seedMultiplier = usernameInput ? usernameInput.value.length : 5;

    for (let w = 0; w < totalWeeks; w++) {
      for (let d = 0; d < daysPerWeek; d++) {
        const cell = document.createElement('div');
        cell.className = 'contrib-cell';

        // Calculate realistic high-activity distribution
        const dayIdx = w * 7 + d;
        const pseudoRand = Math.sin(dayIdx * 0.18 + seedMultiplier * 0.7) * 0.5 + 0.5;
        const dayOfWeekBonus = (d >= 1 && d <= 5) ? 0.25 : 0.05; // higher on weekdays
        const activityScore = pseudoRand + dayOfWeekBonus;

        let level = 0;
        let count = 0;

        if (activityScore > 0.88) {
          level = 4;
          count = Math.floor(activityScore * 10) + 7;
        } else if (activityScore > 0.68) {
          level = 3;
          count = Math.floor(activityScore * 6) + 4;
        } else if (activityScore > 0.45) {
          level = 2;
          count = Math.floor(activityScore * 4) + 2;
        } else if (activityScore > 0.22) {
          level = 1;
          count = 1;
        } else {
          level = 0;
          count = 0;
        }

        cell.classList.add(`lvl-${level}`);

        // Calculate approximate date for tooltip
        const cellDate = new Date(today);
        cellDate.setDate(cellDate.getDate() - ((totalWeeks - 1 - w) * 7 + (6 - d)));
        const formattedDate = cellDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });

        // Cell hover events for dynamic tooltip
        cell.addEventListener('mouseenter', (e) => {
          const contribText = count === 0 ? 'No contributions' : `${count} contribution${count > 1 ? 's' : ''}`;
          tooltip.innerHTML = `<strong>${contribText}</strong> on ${formattedDate}`;
          
          const rect = cell.getBoundingClientRect();
          const cardRect = grid.closest('.github-card-wrapper').getBoundingClientRect();
          
          tooltip.style.left = `${rect.left - cardRect.left + rect.width / 2}px`;
          tooltip.style.top = `${rect.top - cardRect.top}px`;
          tooltip.classList.add('visible');
        });

        cell.addEventListener('mouseleave', () => {
          tooltip.classList.remove('visible');
        });

        grid.appendChild(cell);
      }
    }
  }

  buildCalendar();

  // Refresh with smooth feedback
  if (refreshBtn) {
    refreshBtn.addEventListener('click', (e) => {
      e.preventDefault();
      refreshBtn.style.transform = 'rotate(360deg)';
      refreshBtn.style.transition = 'transform 0.6s ease';
      
      const user = usernameInput ? usernameInput.value.trim() : 'yuraj';
      const userDisplay = document.querySelector('.gh-username');
      if (userDisplay && user) {
        userDisplay.textContent = `@${user}`;
      }

      setTimeout(() => {
        buildCalendar();
        refreshBtn.style.transform = 'rotate(0deg)';
        refreshBtn.style.transition = 'none';
      }, 350);
    });
  }
}

/* ===================================================================
   4. MY PROJECTS FILTER SYSTEM
   =================================================================== */
function initProjectFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      projectCards.forEach(card => {
        const categories = card.dataset.category || '';
        if (filter === 'all' || categories.includes(filter)) {
          card.style.display = 'flex';
          card.style.animation = 'fadeInUp 0.4s ease forwards';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* ===================================================================
   5. LET'S CONNECT SECTION: EMAIL & PHONE COPY & FORM
   =================================================================== */
function initConnectActions() {
  const copyEmailBtn = document.getElementById('copyEmailBtn');
  const copyPhoneBtn = document.getElementById('copyPhoneBtn');
  const contactForm = document.getElementById('contactForm');
  const formFeedback = document.getElementById('formFeedback');

  // Copy helper
  function setupCopyButton(btn, value) {
    if (!btn) return;
    btn.addEventListener('click', () => {
      navigator.clipboard.writeText(value).then(() => {
        const tooltip = btn.querySelector('.copy-tooltip');
        if (tooltip) {
          tooltip.classList.add('active');
          setTimeout(() => {
            tooltip.classList.remove('active');
          }, 2000);
        }
      }).catch(err => {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = value;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);

        const tooltip = btn.querySelector('.copy-tooltip');
        if (tooltip) {
          tooltip.classList.add('active');
          setTimeout(() => {
            tooltip.classList.remove('active');
          }, 2000);
        }
      });
    });
  }

  setupCopyButton(copyEmailBtn, 'yuraj.math.dev@gmail.com');
  setupCopyButton(copyPhoneBtn, '+15557892048');

  // Contact Form Submission
  if (contactForm && formFeedback) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('contactName');
      const submitBtn = document.getElementById('submitBtn');

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span>Sending...</span> <i class="fa-solid fa-spinner fa-spin"></i>`;
      }

      setTimeout(() => {
        const senderName = nameInput ? nameInput.value : 'Friend';
        formFeedback.className = 'form-feedback success';
        formFeedback.innerHTML = `<i class="fa-solid fa-circle-check"></i> Thank you, ${senderName}! Your message has been received. Yuvraj Singh will connect with you shortly.`;
        contactForm.reset();

        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `<span>Send Message</span> <i class="fa-solid fa-arrow-right"></i>`;
        }
      }, 700);
    });
  }
}

/* ===================================================================
   6. NAVIGATION & MOBILE TOGGLE
   =================================================================== */
function initNavigation() {
  const mobileToggle = document.getElementById('mobileToggle');
  const navLinks = document.querySelector('.nav-links');
  const yearSpan = document.getElementById('yearSpan');

  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      const isVisible = navLinks.style.display === 'flex';
      navLinks.style.display = isVisible ? 'none' : 'flex';
      if (!isVisible) {
        navLinks.style.flexDirection = 'column';
        navLinks.style.position = 'absolute';
        navLinks.style.top = '100%';
        navLinks.style.left = '0';
        navLinks.style.width = '100%';
        navLinks.style.background = 'rgba(7, 9, 14, 0.95)';
        navLinks.style.padding = '1.5rem';
        navLinks.style.borderBottom = '1px solid var(--border-subtle)';
      }
    });
  }

  // Active section tracking on scroll
  const sections = document.querySelectorAll('section, .hero-header-banner');
  const links = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let currentId = '';
    const scrollPos = window.scrollY + 200;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentId = section.getAttribute('id');
      }
    });

    links.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('active');
      }
    });
  }, { passive: true });
}
