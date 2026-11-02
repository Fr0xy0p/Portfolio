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
    const interactiveElements = 'a, button, input, textarea, .project-card, .language-card, .objective-card, .timeline-card, .social-card, .contrib-day-cell, .domain-card, .stage-3d-viewport-card, .card-nav-link, .card-social-item, .stage-3d-mode-btn';
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

  // Header visibility toggle on scroll (hidden on landing for 1:1 reference match)
  function checkHeaderScroll() {
    if (window.scrollY > window.innerHeight * 0.3) {
      document.body.classList.add('scrolled-past-landing');
    } else {
      document.body.classList.remove('scrolled-past-landing');
    }
  }
  window.addEventListener('scroll', checkHeaderScroll, { passive: true });
  checkHeaderScroll();

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
  // 5. Interactive GitHub Contribution Tooltip & Real-Time Profile Sync
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

    // Real-Time Direct GitHub Contribution Sync
    (function syncLiveGitHubContributions(username) {
      const titleElem = document.getElementById('contrib-total-title');
      const statsElem = document.getElementById('contrib-stats-row');
      const syncStatusElem = document.getElementById('contrib-sync-status');

      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];

      function formatDateStr(dateStr) {
        const parts = dateStr.split('-');
        if (parts.length !== 3) return dateStr;
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        const d = parseInt(parts[2], 10);
        return `${monthNames[m]} ${d}, ${y}`;
      }

      function applyData(data) {
        if (!data || !Array.isArray(data.contributions)) return;

        const contribMap = new Map();
        let totalContribs = 0;
        let activeDaysCount = 0;
        let runningStreak = 0;
        let maxStreak = 0;
        let currentStreak = 0;

        const sortedList = [...data.contributions].sort((a, b) => a.date.localeCompare(b.date));

        for (const item of sortedList) {
          contribMap.set(item.date, item);
          const count = item.count || 0;
          totalContribs += count;

          if (count > 0) {
            activeDaysCount++;
            runningStreak++;
            if (runningStreak > maxStreak) {
              maxStreak = runningStreak;
            }
          } else {
            runningStreak = 0;
          }
        }

        // Current streak ending today
        const todayStr = new Date().toISOString().slice(0, 10);
        for (let i = sortedList.length - 1; i >= 0; i--) {
          if (sortedList[i].count > 0) {
            currentStreak++;
          } else {
            if (i === sortedList.length - 1 && sortedList[i].date === todayStr) {
              continue;
            }
            break;
          }
        }

        const displayTotal = data.total && typeof data.total.lastYear === 'number'
          ? data.total.lastYear
          : totalContribs;

        // 1. Update Title
        if (titleElem) {
          titleElem.textContent = `${displayTotal} contributions in the last year`;
        }

        // 2. Update Cells in DOM
        contribCells.forEach(cell => {
          const date = cell.getAttribute('data-date');
          if (!date) return;

          const info = contribMap.get(date);
          if (info) {
            const count = info.count || 0;
            const level = typeof info.level === 'number' ? info.level : 0;

            cell.className = `contrib-day-cell level-${level}`;
            cell.setAttribute('data-level', level);

            let tipText = '';
            if (count === 0) {
              tipText = `No contributions on ${formatDateStr(date)}`;
            } else if (count === 1) {
              tipText = `1 contribution on ${formatDateStr(date)}`;
            } else {
              tipText = `${count} contributions on ${formatDateStr(date)}`;
            }
            cell.setAttribute('data-tip', tipText);
          }
        });

        // 3. Update Summary Stats Row
        if (statsElem) {
          statsElem.innerHTML = `
            <span class="stat-item"><span class="stat-val">${displayTotal}</span> TOTAL</span>
            <span class="stat-sep">·</span>
            <span class="stat-item"><span class="stat-val">${activeDaysCount}</span> ACTIVE DAYS</span>
            <span class="stat-sep">·</span>
            <span class="stat-item"><span class="stat-val">${maxStreak} DAYS</span> MAX STREAK</span>
            <span class="stat-sep">·</span>
            <span class="stat-item"><span class="stat-val">${currentStreak} DAY${currentStreak === 1 ? '' : 'S'}</span> CURRENT</span>
          `;
        }

        // 4. Update Sync Indicator
        if (syncStatusElem) {
          syncStatusElem.innerHTML = `<span class="sync-dot"></span> LIVE SYNCED`;
        }
      }

      // Check LocalStorage cache first for instant paint
      const cacheKey = `gh_contribs_${username}`;
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          applyData(JSON.parse(cached));
        }
      } catch (e) {}

      // Fetch live directly from open CORS proxy
      const apiUrl = `https://github-contributions-api.jogruber.de/v4/${username}?y=last`;
      fetch(apiUrl)
        .then(res => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then(data => {
          applyData(data);
          try {
            localStorage.setItem(cacheKey, JSON.stringify(data));
          } catch (e) {}
        })
        .catch(err => {
          console.warn('Live GitHub contribution sync notification:', err);
          if (syncStatusElem) {
            syncStatusElem.innerHTML = `<span class="sync-dot" style="animation:none;"></span> SYNCED`;
          }
        });
    })('Fr0xy0p');
  }

  // --------------------------------------------------------------------------
  // 6. Direct Dispatch Email Copy Interaction
  // --------------------------------------------------------------------------
  const copyBtn = document.getElementById('copy-email-btn');
  const copyText = document.getElementById('copy-btn-text');
  if (copyBtn && copyText) {
    copyBtn.addEventListener('click', () => {
      const email = 'yuvrajsinghhappy07@gmail.com';
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
  // 7b. Interactive 3D Spatial Viewport Canvas & Mouse Tilt Engine
  // --------------------------------------------------------------------------
  (function init3DViewportEngine() {
    const stageEnv = document.getElementById('landing');
    const container = document.getElementById('stage-3d-perspective-container');
    const card = document.getElementById('stage-3d-viewport-card');
    const shadow = document.getElementById('stage-3d-ambient-shadow');
    const sheen = document.getElementById('card-glass-sheen');
    const angleVal = document.getElementById('telemetry-angle-val');
    const modeBtn = document.getElementById('stage-3d-mode-btn');
    const modeText = document.getElementById('stage-3d-mode-text');

    if (!card || !container) return;

    let is3DActive = true;
    
    // Default resting architectural orientation (matches reference screenshot tilt)
    const defaultRotX = 3.5;
    const defaultRotY = -6.0;
    const defaultShadowX = 18;
    const defaultShadowY = 36;

    let currentRotX = defaultRotX;
    let currentRotY = defaultRotY;
    let targetRotX = defaultRotX;
    let targetRotY = defaultRotY;

    let currentShadowX = defaultShadowX;
    let currentShadowY = defaultShadowY;
    let targetShadowX = defaultShadowX;
    let targetShadowY = defaultShadowY;

    let sheenX = 30;
    let sheenY = 25;
    let targetSheenX = 30;
    let targetSheenY = 25;

    let isMouseOver = false;

    // Mouse Movement Handler inside 3D environment
    function handlePointerMove(e) {
      if (!is3DActive) return;
      isMouseOver = true;

      const rect = container.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Normalized coordinates (-1 to +1)
      const normX = Math.max(-1, Math.min(1, (e.clientX - centerX) / (rect.width / 2)));
      const normY = Math.max(-1, Math.min(1, (e.clientY - centerY) / (rect.height / 2)));

      // Rotations: X depends on vertical offset; Y depends on horizontal offset
      targetRotX = -(normY * 11) + 2.0;
      targetRotY = (normX * 14) - 3.5;

      // Shadow shift inversely proportional to light
      targetShadowX = -(normX * 30) + 18;
      targetShadowY = -(normY * 22) + 36;

      // Sheen reflection position
      targetSheenX = normX * 35 + 50;
      targetSheenY = normY * 35 + 45;
    }

    if (stageEnv) {
      stageEnv.addEventListener('mousemove', handlePointerMove, { passive: true });
      stageEnv.addEventListener('mouseleave', () => {
        isMouseOver = false;
        targetRotX = defaultRotX;
        targetRotY = defaultRotY;
        targetShadowX = defaultShadowX;
        targetShadowY = defaultShadowY;
        targetSheenX = 30;
        targetSheenY = 25;
      });
    }

    // Touch Support: Gentle Drag on Mobile
    if (stageEnv && isTouchDevice) {
      stageEnv.addEventListener('touchmove', (e) => {
        if (!is3DActive || e.touches.length === 0) return;
        const touch = e.touches[0];
        handlePointerMove({ clientX: touch.clientX, clientY: touch.clientY });
      }, { passive: true });

      stageEnv.addEventListener('touchend', () => {
        targetRotX = defaultRotX;
        targetRotY = defaultRotY;
        targetShadowX = defaultShadowX;
        targetShadowY = defaultShadowY;
      });
    }

    // Toggle 3D Mode Button
    if (modeBtn && modeText) {
      modeBtn.addEventListener('click', () => {
        is3DActive = !is3DActive;
        if (is3DActive) {
          targetRotX = defaultRotX;
          targetRotY = defaultRotY;
          targetShadowX = defaultShadowX;
          targetShadowY = defaultShadowY;
          modeText.textContent = '3D VIEW: ACTIVE';
          modeBtn.style.borderColor = 'var(--accent-blue)';
          modeBtn.style.color = 'var(--accent-blue)';
        } else {
          targetRotX = 0;
          targetRotY = 0;
          targetShadowX = 0;
          targetShadowY = 20;
          modeText.textContent = '3D VIEW: FLAT';
          modeBtn.style.borderColor = 'var(--hairline-neutral)';
          modeBtn.style.color = 'var(--text-secondary)';
        }
      });
    }

    // Physics Animation Loop (Spring Lerp)
    function animate3DLoop() {
      // Smooth interpolation (lerp factor 0.08)
      currentRotX += (targetRotX - currentRotX) * 0.08;
      currentRotY += (targetRotY - currentRotY) * 0.08;
      currentShadowX += (targetShadowX - currentShadowX) * 0.08;
      currentShadowY += (targetShadowY - currentShadowY) * 0.08;
      sheenX += (targetSheenX - sheenX) * 0.08;
      sheenY += (targetSheenY - sheenY) * 0.08;

      // Apply 3D transform to card
      card.style.transform = `rotateX(${currentRotX.toFixed(2)}deg) rotateY(${currentRotY.toFixed(2)}deg) scale3d(1, 1, 1)`;

      // Apply dynamic shadow transform
      if (shadow) {
        shadow.style.transform = `translate3d(${currentShadowX.toFixed(1)}px, ${currentShadowY.toFixed(1)}px, -50px) scale(0.96)`;
      }

      // Apply dynamic glass sheen
      if (sheen) {
        sheen.style.background = `radial-gradient(circle at ${sheenX.toFixed(1)}% ${sheenY.toFixed(1)}%, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 65%)`;
      }

      // Update Live Telemetry Angle HUD
      if (angleVal) {
        const signX = currentRotX >= 0 ? '+' : '';
        const signY = currentRotY >= 0 ? '+' : '';
        angleVal.textContent = `RX: ${signX}${currentRotX.toFixed(1)}° · RY: ${signY}${currentRotY.toFixed(1)}°`;
      }

      requestAnimationFrame(animate3DLoop);
    }
    requestAnimationFrame(animate3DLoop);
  })();

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

  // --------------------------------------------------------------------------
  // 9. Real-Time Repository Telemetry Sync (Fr0xy0p/Shx & Fr0xy0p/Automated-code-reviewer)
  // --------------------------------------------------------------------------
  function setupLiveRepoSync(config) {
    const {
      repoUser,
      repoName,
      starsId,
      forksId,
      issuesId,
      langId,
      commitHashId,
      lastPushedId,
      badgeId,
      descId,
      copyBtnId,
      copyTextId
    } = config;

    const starsElem = document.getElementById(starsId);
    const forksElem = document.getElementById(forksId);
    const issuesElem = document.getElementById(issuesId);
    const langElem = document.getElementById(langId);
    const commitHashElem = document.getElementById(commitHashId);
    const lastPushedElem = document.getElementById(lastPushedId);
    const badgeElem = document.getElementById(badgeId);
    const descElem = document.getElementById(descId);

    const cacheKey = `gh_repo_${repoUser}_${repoName}`;

    function formatRelativeTime(dateString) {
      if (!dateString) return 'Recent';
      const date = new Date(dateString);
      const now = new Date();
      const diffSec = Math.floor((now - date) / 1000);

      if (diffSec < 60) return 'Just now';
      if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
      if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
      if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;

      const options = { month: 'short', day: 'numeric', year: 'numeric' };
      return date.toLocaleDateString('en-US', options);
    }

    function applyRepoData(repo, commit) {
      if (repo) {
        if (starsElem && typeof repo.stargazers_count === 'number') {
          starsElem.textContent = repo.stargazers_count.toLocaleString();
        }
        if (forksElem && typeof repo.forks_count === 'number') {
          forksElem.textContent = repo.forks_count.toLocaleString();
        }
        if (issuesElem && typeof repo.open_issues_count === 'number') {
          issuesElem.textContent = repo.open_issues_count.toLocaleString();
        }
        if (langElem && repo.language) {
          if (repoName === 'Kavach') {
            langElem.textContent = 'Python & TS';
          } else {
            langElem.textContent = `${repo.language} (100%)`;
          }
        }
        if (lastPushedElem && repo.pushed_at) {
          lastPushedElem.textContent = formatRelativeTime(repo.pushed_at);
          lastPushedElem.title = new Date(repo.pushed_at).toLocaleString();
        }
        if (descElem && repo.description && repo.description.trim().length > 0) {
          descElem.textContent = repo.description;
        }
      }

      if (commit && commit.sha) {
        if (commitHashElem) {
          commitHashElem.textContent = commit.sha.slice(0, 7);
          if (commit.commit && commit.commit.message) {
            commitHashElem.title = `Latest commit: ${commit.commit.message}`;
          }
        }
      }

      if (badgeElem) {
        badgeElem.innerHTML = `<span class="sync-dot"></span> LIVE SYNCED`;
      }
    }

    // 1. Check LocalStorage Cache for instant paint
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const { repo, commit } = JSON.parse(cached);
        applyRepoData(repo, commit);
      }
    } catch (e) {}

    // 2. Fetch Live from GitHub API (Zero Rate Limit with cache)
    Promise.all([
      fetch(`https://api.github.com/repos/${repoUser}/${repoName}`).then(r => r.ok ? r.json() : null),
      fetch(`https://api.github.com/repos/${repoUser}/${repoName}/commits?per_page=1`).then(r => r.ok ? r.json() : null)
    ])
    .then(([repo, commits]) => {
      const commit = Array.isArray(commits) && commits.length > 0 ? commits[0] : null;
      applyRepoData(repo, commit);
      try {
        localStorage.setItem(cacheKey, JSON.stringify({ repo, commit }));
      } catch (e) {}
    })
    .catch(err => {
      console.warn(`Live ${repoName} repository sync notification:`, err);
      if (badgeElem) {
        badgeElem.innerHTML = `<span class="sync-dot" style="animation:none;"></span> SYNCED`;
      }
    });

    // 3. 1-Click Clone Command Copy Action
    const copyBtn = document.getElementById(copyBtnId);
    const copyText = document.getElementById(copyTextId);
    if (copyBtn && copyText) {
      copyBtn.addEventListener('click', () => {
        const cloneCmd = `git clone https://github.com/${repoUser}/${repoName}.git`;
        navigator.clipboard.writeText(cloneCmd).then(() => {
          copyText.textContent = 'Copied!';
          copyBtn.style.backgroundColor = 'var(--status-emerald)';
          copyBtn.style.borderColor = 'var(--status-emerald)';
          copyBtn.style.color = '#FFFFFF';
          setTimeout(() => {
            copyText.textContent = 'Copy';
            copyBtn.style.backgroundColor = '';
            copyBtn.style.borderColor = '';
            copyBtn.style.color = '';
          }, 2000);
        });
      });
    }
  }

  // Initialize live sync for Shx
  setupLiveRepoSync({
    repoUser: 'Fr0xy0p',
    repoName: 'Shx',
    starsId: 'shx-stars',
    forksId: 'shx-forks',
    issuesId: 'shx-issues',
    langId: 'shx-language',
    commitHashId: 'shx-commit-hash',
    lastPushedId: 'shx-last-pushed',
    badgeId: 'shx-live-badge',
    descId: 'shx-repo-desc',
    copyBtnId: 'copy-clone-btn',
    copyTextId: 'copy-clone-text'
  });

  // Initialize live sync for Kavach
  setupLiveRepoSync({
    repoUser: 'Fr0xy0p',
    repoName: 'Kavach',
    starsId: 'kavach-stars',
    forksId: 'kavach-forks',
    issuesId: 'kavach-issues',
    langId: 'kavach-language',
    commitHashId: 'kavach-commit-hash',
    lastPushedId: 'kavach-last-pushed',
    badgeId: 'kavach-live-badge',
    descId: 'kavach-repo-desc',
    copyBtnId: 'copy-kavach-clone-btn',
    copyTextId: 'copy-kavach-clone-text'
  });

  // Initialize live sync for Automated-code-reviewer
  setupLiveRepoSync({
    repoUser: 'Fr0xy0p',
    repoName: 'Automated-code-reviewer',
    starsId: 'reviewer-stars',
    forksId: 'reviewer-forks',
    issuesId: 'reviewer-issues',
    langId: 'reviewer-language',
    commitHashId: 'reviewer-commit-hash',
    lastPushedId: 'reviewer-last-pushed',
    badgeId: 'reviewer-live-badge',
    descId: 'reviewer-repo-desc',
    copyBtnId: 'copy-reviewer-clone-btn',
    copyTextId: 'copy-reviewer-clone-text'
  });

  // Initialize live sync for Codeforces-Questions
  setupLiveRepoSync({
    repoUser: 'Fr0xy0p',
    repoName: 'Codeforces-Questions',
    starsId: 'cf-stars',
    forksId: 'cf-forks',
    issuesId: 'cf-issues',
    langId: 'cf-language',
    commitHashId: 'cf-commit-hash',
    lastPushedId: 'cf-last-pushed',
    badgeId: 'cf-live-badge',
    descId: 'cf-repo-desc',
    copyBtnId: 'copy-cf-clone-btn',
    copyTextId: 'copy-cf-clone-text'
  });

  // Initialize live sync for MINI-PROJECTS
  setupLiveRepoSync({
    repoUser: 'Fr0xy0p',
    repoName: 'MINI-PROJECTS',
    starsId: 'mini-stars',
    forksId: 'mini-forks',
    issuesId: 'mini-issues',
    langId: 'mini-language',
    commitHashId: 'mini-commit-hash',
    lastPushedId: 'mini-last-pushed',
    badgeId: 'mini-live-badge',
    descId: 'mini-repo-desc',
    copyBtnId: 'copy-mini-clone-btn',
    copyTextId: 'copy-mini-clone-text'
  });

})();
