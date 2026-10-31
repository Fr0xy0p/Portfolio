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
  // 9. Real-Time Flagship Repository Telemetry Sync (Fr0xy0p/Shx)
  // --------------------------------------------------------------------------
  (function syncLiveShxRepo() {
    const starsElem = document.getElementById('shx-stars');
    const forksElem = document.getElementById('shx-forks');
    const issuesElem = document.getElementById('shx-issues');
    const langElem = document.getElementById('shx-language');
    const commitHashElem = document.getElementById('shx-commit-hash');
    const lastPushedElem = document.getElementById('shx-last-pushed');
    const badgeElem = document.getElementById('shx-live-badge');
    const descElem = document.getElementById('shx-repo-desc');

    const repoUser = 'Fr0xy0p';
    const repoName = 'Shx';
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
          langElem.textContent = `${repo.language} (100%)`;
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
      console.warn('Live Shx repository sync notification:', err);
      if (badgeElem) {
        badgeElem.innerHTML = `<span class="sync-dot" style="animation:none;"></span> SYNCED`;
      }
    });

    // 3. 1-Click Clone Command Copy Action
    const copyCloneBtn = document.getElementById('copy-clone-btn');
    const copyCloneText = document.getElementById('copy-clone-text');
    if (copyCloneBtn && copyCloneText) {
      copyCloneBtn.addEventListener('click', () => {
        const cloneCmd = `git clone https://github.com/${repoUser}/${repoName}.git`;
        navigator.clipboard.writeText(cloneCmd).then(() => {
          copyCloneText.textContent = 'Copied!';
          copyCloneBtn.style.backgroundColor = 'var(--status-emerald)';
          copyCloneBtn.style.borderColor = 'var(--status-emerald)';
          copyCloneBtn.style.color = '#FFFFFF';
          setTimeout(() => {
            copyCloneText.textContent = 'Copy';
            copyCloneBtn.style.backgroundColor = '';
            copyCloneBtn.style.borderColor = '';
            copyCloneBtn.style.color = '';
          }, 2000);
        });
      });
    }
  })();

})();
