/**
 * ============================================================================
 * SWISS GENERATIVE 3D GEOMETRIC SHAPE ENGINE (V3.0)
 * Pure Vanilla JavaScript — Zero Frameworks, 60 FPS Native
 * Features:
 *   - 5 Distinct Iconic 3D Geometries:
 *       1. Geodesic Sphere with Planetary Rings (Hero)
 *       2. Parametric Möbius Infinity Ribbon [∞] (Manifesto)
 *       3. Mathematical Wave Surface Grid (Skills & Mathematics)
 *       4. Intertwined Double Helix / Algorithm DNA (Projects)
 *       5. Airy Constellation Ring & Starfield (GitHub & Contact)
 *   - Progressive Density Reduction: Dots become significantly LESS DENSE while scrolling
 *   - Elastic Cursor Gravitational Lens with Spring Return
 *   - Micro-Constellation Hairlines between Nearby Nodes
 *   - High-DPI & Mobile Responsive Optimization
 * ============================================================================
 */

(function () {
  'use strict';

  const container = document.getElementById('threejs-particle-scene') || document.body;

  let canvas = document.getElementById('dots-canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'dots-canvas';
    canvas.className = 'threejs-particle-scene';
    canvas.setAttribute('aria-hidden', 'true');
    container.prepend(canvas);
  }

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let isRunning = false;
  let animationFrameId = null;

  // Viewport & Resolution
  let width = window.innerWidth;
  let height = window.innerHeight;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);

  // Mouse & Lens Physics
  const pointer = {
    x: width / 2,
    y: height / 2,
    targetX: width / 2,
    targetY: height / 2,
    active: false,
    radius: 140
  };

  // Scroll Tracking & Density Telemetry
  let targetScrollY = window.scrollY;
  let currentScrollY = window.scrollY;
  let scrollVelocity = 0;
  let scrollProgress = 0;
  let lastScrollCheckY = window.scrollY;

  // Performance Telemetry
  let frameCount = 0;
  let fpsTimer = performance.now();
  let currentFps = 60.0;
  const fpsElem = document.getElementById('canvas-fps');
  const particlesElem = document.getElementById('hud-particles-count');

  // Particle Counts (Clean, discrete, well-spaced dots — avoids overcrowded fog)
  const isMobile = width < 768;
  const PARTICLE_COUNT = isMobile ? 1600 : 3600;

  // Pre-allocated Coordinate Buffers for 5 Distinct Shapes
  const s1X = new Float32Array(PARTICLE_COUNT);
  const s1Y = new Float32Array(PARTICLE_COUNT);
  const s1Z = new Float32Array(PARTICLE_COUNT);

  const s2X = new Float32Array(PARTICLE_COUNT);
  const s2Y = new Float32Array(PARTICLE_COUNT);
  const s2Z = new Float32Array(PARTICLE_COUNT);

  const s3X = new Float32Array(PARTICLE_COUNT);
  const s3Y = new Float32Array(PARTICLE_COUNT);
  const s3Z = new Float32Array(PARTICLE_COUNT);

  const s4X = new Float32Array(PARTICLE_COUNT);
  const s4Y = new Float32Array(PARTICLE_COUNT);
  const s4Z = new Float32Array(PARTICLE_COUNT);

  const s5X = new Float32Array(PARTICLE_COUNT);
  const s5Y = new Float32Array(PARTICLE_COUNT);
  const s5Z = new Float32Array(PARTICLE_COUNT);

  // Particle Properties
  const phase = new Float32Array(PARTICLE_COUNT);
  const speed = new Float32Array(PARTICLE_COUNT);
  const baseSize = new Float32Array(PARTICLE_COUNT);
  const isKeyNode = new Uint8Array(PARTICLE_COUNT);

  // Screen-space buffers for micro-constellation links
  const MAX_SIGNAL_NODES = isMobile ? 50 : 110;
  const screenNodeX = new Float32Array(MAX_SIGNAL_NODES);
  const screenNodeY = new Float32Array(MAX_SIGNAL_NODES);
  const screenNodeZ = new Float32Array(MAX_SIGNAL_NODES);

  // Initialize the 5 Iconic Mathematical Shapes
  function generateGeometries() {
    const minDim = Math.min(width, height);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      phase[i] = Math.random() * Math.PI * 2;
      speed[i] = 0.6 + Math.random() * 0.8;
      isKeyNode[i] = i < MAX_SIGNAL_NODES ? 1 : 0;
      baseSize[i] = isKeyNode[i] ? 2.5 : (Math.random() < 0.12 ? 1.8 : 1.15);

      // ----------------------------------------------------------------------
      // 1. SHAPE 1: GEODESIC SPHERE WITH PLANETARY RINGS (Hero)
      // ----------------------------------------------------------------------
      const phi = Math.acos(1 - 2 * (i / PARTICLE_COUNT));
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      const sphereR = minDim * 0.32;

      if (i % 4 === 0) {
        // Tilted concentric planetary rings
        const ringAngle = (i / PARTICLE_COUNT) * Math.PI * 8;
        const ringR = minDim * 0.46;
        s1X[i] = Math.cos(ringAngle) * ringR;
        s1Y[i] = Math.sin(ringAngle) * ringR * 0.32;
        s1Z[i] = Math.sin(ringAngle) * ringR * 0.88;
      } else {
        s1X[i] = sphereR * Math.sin(phi) * Math.cos(theta);
        s1Y[i] = sphereR * Math.sin(phi) * Math.sin(theta);
        s1Z[i] = sphereR * Math.cos(phi);
      }

      // ----------------------------------------------------------------------
      // 2. SHAPE 2: PARAMETRIC MÖBIUS INFINITY RIBBON [∞] (Manifesto)
      // ----------------------------------------------------------------------
      const u = (i / PARTICLE_COUNT) * Math.PI * 4;
      const v = ((i % 45) / 45 - 0.5) * (minDim * 0.22);
      const mobiusR = minDim * 0.34;
      s2X[i] = (mobiusR + v * Math.cos(u * 0.5)) * Math.cos(u);
      s2Y[i] = (mobiusR + v * Math.cos(u * 0.5)) * Math.sin(u) * 0.55;
      s2Z[i] = v * Math.sin(u * 0.5);

      // ----------------------------------------------------------------------
      // 3. SHAPE 3: MATHEMATICAL WAVE SURFACE GRID (Skills & Core)
      // ----------------------------------------------------------------------
      const cols = Math.floor(Math.sqrt(PARTICLE_COUNT));
      const row = Math.floor(i / cols);
      const col = i % cols;
      const gx = (col / cols - 0.5) * (width * 0.72);
      const gy = (row / cols - 0.5) * (height * 0.65);
      const dCenter = Math.hypot(gx, gy) * 0.012;
      s3X[i] = gx;
      s3Y[i] = gy;
      s3Z[i] = Math.sin(dCenter * 3) * Math.cos(gx * 0.02) * (minDim * 0.24);

      // ----------------------------------------------------------------------
      // 4. SHAPE 4: INTERTWINED DOUBLE HELIX / ALGORITHM DNA (Projects)
      // ----------------------------------------------------------------------
      const isStrandB = i % 2 === 1;
      const hAngle = (i / PARTICLE_COUNT) * Math.PI * 14;
      const hRadius = minDim * 0.26;
      const hOffset = isStrandB ? Math.PI : 0;
      if (i % 14 === 0) {
        // Cross rungs connecting the two strands
        const fRung = (i % 28) / 28;
        s4X[i] = (Math.cos(hAngle) * (1 - fRung) + Math.cos(hAngle + Math.PI) * fRung) * hRadius;
        s4Y[i] = ((i / PARTICLE_COUNT) - 0.5) * height * 0.75;
        s4Z[i] = (Math.sin(hAngle) * (1 - fRung) + Math.sin(hAngle + Math.PI) * fRung) * hRadius;
      } else {
        s4X[i] = Math.cos(hAngle + hOffset) * hRadius;
        s4Y[i] = ((i / PARTICLE_COUNT) - 0.5) * height * 0.75;
        s4Z[i] = Math.sin(hAngle + hOffset) * hRadius;
      }

      // ----------------------------------------------------------------------
      // 5. SHAPE 5: AIRY CONSTELLATION RING & STARFIELD (GitHub & Contact)
      // ----------------------------------------------------------------------
      const cAngle = (i / PARTICLE_COUNT) * Math.PI * 2 + (i % 5);
      const cDist = minDim * 0.32 + (((i * 17) % 100) / 100) * (minDim * 0.45);
      s5X[i] = Math.cos(cAngle) * cDist;
      s5Y[i] = (((i * 31) % 100) - 50) * 1.5;
      s5Z[i] = Math.sin(cAngle) * cDist * 0.75;
    }
  }

  // Canvas Resizing
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    ctx.scale(dpr, dpr);
    generateGeometries();
  }

  // Camera & Rotation State
  let camRotX = 0;
  let camRotY = 0;
  let targetCamRotX = 0;
  let targetCamRotY = 0;

  // Smoothstep utility
  function smoothstep(min, max, value) {
    const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
    return x * x * (3 - 2 * x);
  }

  // Main Render Loop (60 FPS Native)
  function render(time) {
    if (!isRunning) return;

    // Real-time FPS Calculation
    frameCount++;
    const now = performance.now();
    if (now - fpsTimer >= 500) {
      currentFps = (frameCount * 1000) / (now - fpsTimer);
      if (fpsElem) {
        fpsElem.textContent = currentFps.toFixed(1) + ' FPS';
      }
      frameCount = 0;
      fpsTimer = now;
    }

    ctx.clearRect(0, 0, width, height);

    // Scroll Dynamics & Velocity
    targetScrollY = window.scrollY;
    const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    const targetScrollProgress = Math.min(Math.max(targetScrollY / maxScroll, 0), 1);

    currentScrollY += (targetScrollY - currentScrollY) * 0.08;
    scrollProgress += (targetScrollProgress - scrollProgress) * 0.06;

    const rawVel = targetScrollY - lastScrollCheckY;
    lastScrollCheckY = targetScrollY;
    scrollVelocity += (rawVel - scrollVelocity) * 0.15;
    const absVelocity = Math.abs(scrollVelocity);

    // ------------------------------------------------------------------------
    // DYNAMIC DENSITY REDUCTION:
    // As you scroll down the page, dots become significantly LESS DENSE!
    // Hero: 100% density (clean full shape)
    // Scrolling down: progressively thins out to ~35% density so content is crisp
    // During active scroll velocity: particles further thin out to avoid clutter
    // ------------------------------------------------------------------------
    const baseDensity = 1.0 - (scrollProgress * 0.62); // 1.0 at top down to 0.38 at bottom
    const velThinning = Math.min(absVelocity * 0.003, 0.16);
    const activeDensity = Math.max(0.32, baseDensity - velThinning);
    const activeDotCount = Math.floor(PARTICLE_COUNT * activeDensity);

    // Update HUD particles count with active density
    if (particlesElem && frameCount % 12 === 0) {
      particlesElem.textContent = activeDotCount.toLocaleString() + ' PTS';
    }

    // Smooth Cursor Tracking
    pointer.x += (pointer.targetX - pointer.x) * 0.08;
    pointer.y += (pointer.targetY - pointer.y) * 0.08;

    // 3D Camera Rotation (Mouse orbit + continuous rotation + scroll tilt)
    const mouseNormX = (pointer.x / width - 0.5);
    const mouseNormY = (pointer.y / height - 0.5);

    targetCamRotY = mouseNormX * 0.65 + (scrollProgress * Math.PI * 1.4) + time * 0.0001;
    targetCamRotX = mouseNormY * -0.5 + Math.sin(scrollProgress * Math.PI * 2) * 0.2;

    camRotX += (targetCamRotX - camRotX) * 0.05;
    camRotY += (targetCamRotY - camRotY) * 0.05;

    const cosY = Math.cos(camRotY);
    const sinY = Math.sin(camRotY);
    const cosX = Math.cos(camRotX);
    const sinX = Math.sin(camRotX);

    const focalLength = 520;
    const centerX = width * 0.5;
    const centerY = height * 0.5;
    const cameraBaseZ = 620;

    // Theme Color Tokens
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const baseR = isDark ? 67 : 10;
    const baseG = isDark ? 97 : 38;
    const baseB = isDark ? 238 : 238;

    const t = time * 0.001;

    // ------------------------------------------------------------------------
    // MULTI-STAGE SHAPE INTERPOLATION:
    // 0.00 - 0.25 : Shape 1 (Sphere & Rings) -> Shape 2 (Möbius Infinity)
    // 0.25 - 0.50 : Shape 2 (Möbius Infinity) -> Shape 3 (Wave Grid)
    // 0.50 - 0.75 : Shape 3 (Wave Grid) -> Shape 4 (Double Helix)
    // 0.75 - 1.00 : Shape 4 (Double Helix) -> Shape 5 (Constellation Ring)
    // ------------------------------------------------------------------------
    let w1 = 0, w2 = 0, w3 = 0, w4 = 0, w5 = 0;
    if (scrollProgress < 0.25) {
      const f = smoothstep(0, 0.25, scrollProgress);
      w1 = 1 - f;
      w2 = f;
    } else if (scrollProgress < 0.50) {
      const f = smoothstep(0.25, 0.50, scrollProgress);
      w2 = 1 - f;
      w3 = f;
    } else if (scrollProgress < 0.75) {
      const f = smoothstep(0.50, 0.75, scrollProgress);
      w3 = 1 - f;
      w4 = f;
    } else {
      const f = smoothstep(0.75, 1.00, scrollProgress);
      w4 = 1 - f;
      w5 = f;
    }

    let signalIndex = 0;

    // ------------------------------------------------------------------------
    // RENDER ACTIVE PARTICLES PASS
    // ------------------------------------------------------------------------
    for (let i = 0; i < activeDotCount; i++) {
      // 1. Manifold position interpolation
      let wx = s1X[i] * w1 + s2X[i] * w2 + s3X[i] * w3 + s4X[i] * w4 + s5X[i] * w5;
      let wy = s1Y[i] * w1 + s2Y[i] * w2 + s3Y[i] * w3 + s4Y[i] * w4 + s5Y[i] * w5;
      let wz = s1Z[i] * w1 + s2Z[i] * w2 + s3Z[i] * w3 + s4Z[i] * w4 + s5Z[i] * w5;

      // 2. Subtle organic breathing oscillation
      const breath = Math.sin(t * speed[i] + phase[i]) * 3.5;
      wx += breath;
      wy += breath;

      // 3. 3D Rotation Matrix (Yaw + Pitch)
      let x1 = wx * cosY + wz * sinY;
      let z1 = -wx * sinY + wz * cosY;

      let y2 = wy * cosX - z1 * sinX;
      let z2 = wy * sinX + z1 * cosX + cameraBaseZ;

      if (z2 <= 20) continue;

      // 4. Perspective Projection
      const scale = focalLength / z2;
      let px = centerX + x1 * scale;
      let py = centerY + y2 * scale;

      if (px < -15 || px > width + 15 || py < -15 || py > height + 15) continue;

      // 5. Cursor Gravitational Deflection & Lens
      const dx = px - pointer.targetX;
      const dy = py - pointer.targetY;
      const distSq = dx * dx + dy * dy;
      let lensForce = 0;

      if (distSq < 19600 && pointer.active) { // within 140px
        const dist = Math.sqrt(distSq);
        lensForce = (1 - dist / 140);
        const push = lensForce * 22;
        px += (dx / dist) * push;
        py += (dy / dist) * push;
      }

      // 6. Smooth Depth Attenuation & Density Boundary Fade
      const depthAlpha = Math.max(0, Math.min(1, 1 - (z2 - 350) / 720));
      let alpha = depthAlpha * 0.75;

      // Smooth edge fade for dots near the active cutoff threshold (no abrupt popping)
      if (i > activeDotCount * 0.82) {
        const edgeFade = (activeDotCount - i) / (activeDotCount * 0.18);
        alpha *= Math.max(0, edgeFade);
      }

      let pSize = baseSize[i] * scale;
      if (lensForce > 0) {
        alpha = Math.min(1.0, alpha + lensForce * 0.35);
        pSize += lensForce * 1.2;
      }

      // Record key nodes for constellation lines
      if (isKeyNode[i] === 1 && signalIndex < MAX_SIGNAL_NODES) {
        screenNodeX[signalIndex] = px;
        screenNodeY[signalIndex] = py;
        screenNodeZ[signalIndex] = z2;
        signalIndex++;
      }

      // 7. Draw the dot
      ctx.fillStyle = `rgba(${baseR}, ${baseG}, ${baseB}, ${alpha})`;
      ctx.fillRect(px, py, pSize, pSize);
    }

    // ------------------------------------------------------------------------
    // CONSTELLATION MESH PASS (Faint Hairline Links)
    // ------------------------------------------------------------------------
    const maxLinkDist = isMobile ? 40 : 65;
    const maxLinkDistSq = maxLinkDist * maxLinkDist;
    const linkAlphaMax = (isDark ? 0.30 : 0.18) * activeDensity;

    for (let j = 0; j < signalIndex; j++) {
      const sjx = screenNodeX[j];
      const sjy = screenNodeY[j];
      let linksDrawn = 0;

      for (let k = j + 1; k < signalIndex; k++) {
        if (linksDrawn >= 2) break;
        const skx = screenNodeX[k];
        const sky = screenNodeY[k];

        const cdx = sjx - skx;
        const cdy = sjy - sky;
        const cdistSq = cdx * cdx + cdy * cdy;

        if (cdistSq < maxLinkDistSq) {
          const prox = 1 - Math.sqrt(cdistSq) / maxLinkDist;
          ctx.strokeStyle = `rgba(${baseR}, ${baseG}, ${baseB}, ${prox * linkAlphaMax})`;
          ctx.lineWidth = 0.55;
          ctx.beginPath();
          ctx.moveTo(sjx, sjy);
          ctx.lineTo(skx, sky);
          ctx.stroke();
          linksDrawn++;
        }
      }
    }

    animationFrameId = requestAnimationFrame(render);
  }

  // Controls & Lifecycle
  function start() {
    if (prefersReducedMotion) {
      renderStatic();
      return;
    }
    if (!isRunning) {
      isRunning = true;
      fpsTimer = performance.now();
      animationFrameId = requestAnimationFrame(render);
    }
  }

  function stop() {
    if (isRunning) {
      isRunning = false;
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    }
  }

  function renderStatic() {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = 'rgba(10, 38, 238, 0.35)';
    for (let i = 0; i < 280; i++) {
      ctx.fillRect(Math.random() * width, Math.random() * height, 1.3, 1.3);
    }
  }

  // Pointer Listeners
  window.addEventListener('mousemove', (e) => {
    pointer.targetX = e.clientX;
    pointer.targetY = e.clientY;
    pointer.active = true;
  }, { passive: true });

  document.addEventListener('mouseleave', () => {
    pointer.active = false;
  });

  window.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      pointer.targetX = e.touches[0].clientX;
      pointer.targetY = e.touches[0].clientY;
      pointer.active = true;
    }
  }, { passive: true });

  window.addEventListener('touchend', () => {
    pointer.active = false;
  });

  // Tab Visibility Listener
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else start();
  });

  // Debounced Window Resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 100);
  });

  // Initialize
  resize();
  start();

  window.__particleEngine = {
    resize: resize,
    refresh: () => {}
  };
})();
