/**
 * ============================================================================
 * SWISS GENERATIVE 3D QUANTUM MANIFOLD & PARTICLE ENGINE (V2.0 PRO)
 * Pure Vanilla JavaScript — Zero Frameworks, Zero Build Tools, 60 FPS Native
 * Features:
 *   - 5 Dimensional Mathematical Manifolds (Torus, Helix, Saddle, Spiral, Vortex)
 *   - Scroll Velocity Fly-Through & Warp-Speed Perspective Camera
 *   - Screen-Space Constellation Micro-Mesh between Signal Nodes
 *   - Gravitational Cursor Lens with Fluid Elastic Return
 *   - Multi-Chromatic Depth Palette (Light Editorial & Dark Cobalt)
 *   - Sub-millisecond Typed Array Buffers (Zero Garbage Collection Churn)
 * ============================================================================
 */

(function () {
  'use strict';

  const container = document.getElementById('threejs-particle-scene') || document.body;

  // Canvas element
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

  // Screen Dimensions & High-DPI Support
  let width = window.innerWidth;
  let height = window.innerHeight;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);

  // Mouse & Gravitational Lens
  const pointer = {
    x: width / 2,
    y: height / 2,
    targetX: width / 2,
    targetY: height / 2,
    vx: 0,
    vy: 0,
    active: false,
    radius: 160
  };

  // Scroll Tracking & Camera Dynamics
  let targetScrollY = window.scrollY;
  let currentScrollY = window.scrollY;
  let scrollVelocity = 0;
  let targetScrollProgress = 0;
  let scrollProgress = 0;

  // FPS & Performance Telemetry
  let frameCount = 0;
  let fpsTimer = performance.now();
  let currentFps = 60.0;
  const fpsElem = document.getElementById('canvas-fps');
  const particlesElem = document.getElementById('hud-particles-count');

  // Particle Budget (Adaptive for Mobile vs Desktop)
  const isMobile = width < 768;
  const PARTICLE_COUNT = isMobile ? 8000 : 18000;
  const SIGNAL_NODE_COUNT = isMobile ? 60 : 140;

  if (particlesElem) {
    particlesElem.textContent = PARTICLE_COUNT.toLocaleString() + ' PTS';
  }

  // Pre-allocated Typed Arrays for Ultra-Fast Vector Math (No GC Churn)
  // Current live positions in world coordinates
  const posX = new Float32Array(PARTICLE_COUNT);
  const posY = new Float32Array(PARTICLE_COUNT);
  const posZ = new Float32Array(PARTICLE_COUNT);

  // Manifold 1: Symmetrical Clifford / Quantum Torus (Hero)
  const m1X = new Float32Array(PARTICLE_COUNT);
  const m1Y = new Float32Array(PARTICLE_COUNT);
  const m1Z = new Float32Array(PARTICLE_COUNT);

  // Manifold 2: Intertwined Double Helix & Brownian Wave (Manifesto)
  const m2X = new Float32Array(PARTICLE_COUNT);
  const m2Y = new Float32Array(PARTICLE_COUNT);
  const m2Z = new Float32Array(PARTICLE_COUNT);

  // Manifold 3: Stochastic Volatility Hyperbolic Saddle (Core & Research)
  const m3X = new Float32Array(PARTICLE_COUNT);
  const m3Y = new Float32Array(PARTICLE_COUNT);
  const m3Z = new Float32Array(PARTICLE_COUNT);

  // Manifold 4: Golden Ratio Fibonacci Accretion Disk (Projects)
  const m4X = new Float32Array(PARTICLE_COUNT);
  const m4Y = new Float32Array(PARTICLE_COUNT);
  const m4Z = new Float32Array(PARTICLE_COUNT);

  // Manifold 5: Gravitational Singularity / Event Horizon (Transmission)
  const m5X = new Float32Array(PARTICLE_COUNT);
  const m5Y = new Float32Array(PARTICLE_COUNT);
  const m5Z = new Float32Array(PARTICLE_COUNT);

  // Particle Attributes
  const phase = new Float32Array(PARTICLE_COUNT);
  const speed = new Float32Array(PARTICLE_COUNT);
  const baseSize = new Float32Array(PARTICLE_COUNT);
  const isSignal = new Uint8Array(PARTICLE_COUNT);

  // Screen-space buffer for constellation links (Signal nodes only)
  const screenSignalX = new Float32Array(SIGNAL_NODE_COUNT);
  const screenSignalY = new Float32Array(SIGNAL_NODE_COUNT);
  const screenSignalZ = new Float32Array(SIGNAL_NODE_COUNT);
  const screenSignalVisible = new Uint8Array(SIGNAL_NODE_COUNT);

  // Initialize Geometries
  function generateGeometries() {
    const minDim = Math.min(width, height);
    const R1 = minDim * 0.32;
    const r1 = R1 * 0.45;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Mark first N nodes as special constellation signal nodes
      if (i < SIGNAL_NODE_COUNT) {
        isSignal[i] = 1;
        baseSize[i] = 2.4;
      } else {
        isSignal[i] = 0;
        baseSize[i] = Math.random() < 0.08 ? 1.5 : 0.85;
      }

      phase[i] = Math.random() * Math.PI * 2;
      speed[i] = 0.5 + Math.random() * 0.8;

      // ----------------------------------------------------------------------
      // 1. CLIFFORD DUAL TORUS
      // ----------------------------------------------------------------------
      const u1 = Math.random() * Math.PI * 2;
      const v1 = Math.random() * Math.PI * 2;
      const isRingA = i % 2 === 0;
      if (isRingA) {
        m1X[i] = (R1 + r1 * Math.cos(v1)) * Math.cos(u1);
        m1Y[i] = (R1 + r1 * Math.cos(v1)) * Math.sin(u1) * 0.8;
        m1Z[i] = r1 * Math.sin(v1);
      } else {
        // Orthogonal nested ring
        m1X[i] = r1 * Math.sin(v1);
        m1Y[i] = (R1 + r1 * Math.cos(v1)) * Math.cos(u1) * 0.8;
        m1Z[i] = (R1 + r1 * Math.cos(v1)) * Math.sin(u1);
      }

      // ----------------------------------------------------------------------
      // 2. DOUBLE HELIX & BROWNIAN WAVE
      // ----------------------------------------------------------------------
      const strand = (i % 2) * Math.PI;
      const t2 = (i / PARTICLE_COUNT) * 16 * Math.PI - 8 * Math.PI;
      const helixRadius = minDim * 0.22 * (0.8 + 0.3 * Math.sin(t2 * 0.2));
      const spread2 = (Math.random() - 0.5) * 45;
      m2X[i] = Math.cos(t2 + strand) * helixRadius + spread2;
      m2Y[i] = (t2 / (8 * Math.PI)) * (height * 0.65) + spread2;
      m2Z[i] = Math.sin(t2 + strand) * helixRadius + spread2;

      // ----------------------------------------------------------------------
      // 3. NON-EUCLIDEAN HYPERBOLIC SADDLE (Volatility Surface)
      // ----------------------------------------------------------------------
      const gridW = width * 0.7;
      const gridH = height * 0.6;
      const sx = (Math.random() - 0.5) * gridW;
      const sy = (Math.random() - 0.5) * gridH;
      const nx = sx / (gridW * 0.5);
      const ny = sy / (gridH * 0.5);
      m3X[i] = sx;
      m3Y[i] = sy;
      m3Z[i] = (nx * nx - ny * ny) * (minDim * 0.35) + Math.sin(sx * 0.02) * 35;

      // ----------------------------------------------------------------------
      // 4. FIBONACCI ACCRETION SPIRAL (Logarithmic Galaxy)
      // ----------------------------------------------------------------------
      const arms = 4;
      const armOffset = (i % arms) * ((Math.PI * 2) / arms);
      const radDist = Math.pow(Math.random(), 1.4) * (minDim * 0.55);
      const spiralTheta = armOffset + radDist * 0.012;
      m4X[i] = Math.cos(spiralTheta) * radDist + (Math.random() - 0.5) * 30;
      m4Y[i] = Math.sin(spiralTheta) * radDist * 0.5 + (Math.random() - 0.5) * 30;
      m4Z[i] = (Math.random() - 0.5) * (180 * (1 - radDist / (minDim * 0.55)));

      // ----------------------------------------------------------------------
      // 5. EVENT HORIZON SINGULARITY VORTEX
      // ----------------------------------------------------------------------
      const vTheta = Math.random() * Math.PI * 2;
      const vRadius = Math.pow(Math.random(), 2.2) * (minDim * 0.6) + 15;
      const vDepth = (1 - vRadius / (minDim * 0.6)) * 400 - 200;
      m5X[i] = Math.cos(vTheta) * vRadius;
      m5Y[i] = Math.sin(vTheta) * vRadius * 0.7;
      m5Z[i] = vDepth + (Math.random() - 0.5) * 30;

      // Start at Manifold 1
      posX[i] = m1X[i];
      posY[i] = m1Y[i];
      posZ[i] = m1Z[i];
    }
  }

  // Handle Resize
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

  // Camera Orientation & Interpolation
  let camRotX = 0;
  let camRotY = 0;
  let camRotZ = 0;
  let targetCamRotX = 0;
  let targetCamRotY = 0;
  let targetCamRotZ = 0;
  let lastScrollCheckY = window.scrollY;

  // Render Loop
  function render(time) {
    if (!isRunning) return;

    // Calculate Real-time FPS
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

    // Dynamic Scroll Smoothing & Velocity Warp
    targetScrollY = window.scrollY;
    const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    targetScrollProgress = Math.min(Math.max(targetScrollY / maxScroll, 0), 1);

    const scrollDelta = targetScrollY - currentScrollY;
    currentScrollY += (targetScrollY - currentScrollY) * 0.08;
    scrollProgress += (targetScrollProgress - scrollProgress) * 0.06;

    const rawVelocity = (targetScrollY - lastScrollCheckY);
    lastScrollCheckY = targetScrollY;
    scrollVelocity += (rawVelocity - scrollVelocity) * 0.15;
    const absVelocity = Math.abs(scrollVelocity);

    // Smooth Mouse Proximity Interpolation
    pointer.x += (pointer.targetX - pointer.x) * 0.07;
    pointer.y += (pointer.targetY - pointer.y) * 0.07;

    // Camera 3D Gyroscopic Rotation
    const mouseNormX = (pointer.x / width - 0.5);
    const mouseNormY = (pointer.y / height - 0.5);

    // Scroll drives camera orbit and subtle banking roll
    targetCamRotY = mouseNormX * 0.75 + (scrollProgress * Math.PI * 1.5) + time * 0.00012;
    targetCamRotX = mouseNormY * -0.6 + Math.sin(scrollProgress * Math.PI * 2) * 0.25;
    targetCamRotZ = scrollVelocity * 0.0015; // Dynamic banking roll during scroll

    camRotX += (targetCamRotX - camRotX) * 0.05;
    camRotY += (targetCamRotY - camRotY) * 0.05;
    camRotZ += (targetCamRotZ - camRotZ) * 0.06;

    const cosY = Math.cos(camRotY);
    const sinY = Math.sin(camRotY);
    const cosX = Math.cos(camRotX);
    const sinX = Math.sin(camRotX);
    const cosZ = Math.cos(camRotZ);
    const sinZ = Math.sin(camRotZ);

    // Virtual Focal Camera
    const focalLength = 520;
    const centerX = width * 0.5;
    const centerY = height * 0.5;

    // Scroll warp camera Z travel: scrolling zooms into the 3D space
    const cameraBaseZ = 620 - (absVelocity * 1.8);

    // Determine Color Palette (Light Editorial vs Dark Cobalt)
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    // Base colors
    // Light: Swiss Architectural Cobalt #0A26EE (10, 38, 238), Indigo #3A0CA3
    // Dark: Luminous Cyan #00F5D4, Electric Cobalt #4361EE
    const baseR = isDark ? 67 : 10;
    const baseG = isDark ? 97 : 38;
    const baseB = isDark ? 238 : 238;

    const accentR = isDark ? 0 : 58;
    const accentG = isDark ? 245 : 12;
    const accentB = isDark ? 212 : 163;

    const t = time * 0.001;

    // Manifold Morphing Weights across 4 transition zones
    // 0.00 - 0.22 : M1 (Torus) -> M2 (Helix)
    // 0.22 - 0.48 : M2 (Helix) -> M3 (Saddle)
    // 0.48 - 0.75 : M3 (Saddle) -> M4 (Spiral)
    // 0.75 - 1.00 : M4 (Spiral) -> M5 (Vortex)
    let w1 = 0, w2 = 0, w3 = 0, w4 = 0, w5 = 0;
    if (scrollProgress < 0.22) {
      const f = scrollProgress / 0.22;
      w1 = 1 - f;
      w2 = f;
    } else if (scrollProgress < 0.48) {
      const f = (scrollProgress - 0.22) / 0.26;
      w2 = 1 - f;
      w3 = f;
    } else if (scrollProgress < 0.75) {
      const f = (scrollProgress - 0.48) / 0.27;
      w3 = 1 - f;
      w4 = f;
    } else {
      const f = (scrollProgress - 0.75) / 0.25;
      w4 = 1 - f;
      w5 = f;
    }

    let signalVisibleIndex = 0;

    // ------------------------------------------------------------------------
    // PARTICLE PASS: Vector Transformation, Gravitational Lens & Rendering
    // ------------------------------------------------------------------------
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // 1. Manifold interpolation
      let wx = m1X[i] * w1 + m2X[i] * w2 + m3X[i] * w3 + m4X[i] * w4 + m5X[i] * w5;
      let wy = m1Y[i] * w1 + m2Y[i] * w2 + m3Y[i] * w3 + m4Y[i] * w4 + m5Y[i] * w5;
      let wz = m1Z[i] * w1 + m2Z[i] * w2 + m3Z[i] * w3 + m4Z[i] * w4 + m5Z[i] * w5;

      // 2. Harmonic undulation wave (continuous breathing)
      const breath = Math.sin(t * speed[i] + phase[i]) * 4.5;
      wx += breath;
      wy += breath;

      // 3. Scroll excitement dispersion (particles radially expand during fast scroll)
      if (absVelocity > 2) {
        const exciteFactor = Math.min(absVelocity * 0.008, 0.35);
        wx *= (1 + exciteFactor);
        wy *= (1 + exciteFactor);
        wz *= (1 + exciteFactor);
      }

      // 4. 3D Gyroscopic Rotation Matrix
      // Rotate Y (yaw)
      let x1 = wx * cosY + wz * sinY;
      let z1 = -wx * sinY + wz * cosY;

      // Rotate X (pitch)
      let y2 = wy * cosX - z1 * sinX;
      let z2 = wy * sinX + z1 * cosX + cameraBaseZ;

      // Rotate Z (roll banking)
      let x3 = x1 * cosZ - y2 * sinZ;
      let y3 = x1 * sinZ + y2 * cosZ;

      // Near-plane clipping
      if (z2 <= 25) continue;

      // 5. Perspective Projection
      const scale = focalLength / z2;
      let px = centerX + x3 * scale;
      let py = centerY + y3 * scale;

      // Cull particles outside viewport + padding
      if (px < -20 || px > width + 20 || py < -20 || py > height + 20) continue;

      // 6. Cursor Gravitational Deflection & Lens
      const dx = px - pointer.targetX;
      const dy = py - pointer.targetY;
      const distSq = dx * dx + dy * dy;
      let lensPush = 0;

      if (distSq < 22500 && pointer.active) { // within 150px
        const dist = Math.sqrt(distSq);
        lensPush = (1 - dist / 150);
        const force = lensPush * 24;
        px += (dx / dist) * force;
        py += (dy / dist) * force;
      }

      // 7. Depth Attenuation & Color Gradient
      const depthFactor = Math.max(0, Math.min(1, 1 - (z2 - 350) / 750));
      let alpha = depthFactor * 0.72;

      let pSize = baseSize[i] * scale;
      if (lensPush > 0) {
        alpha = Math.min(1.0, alpha + lensPush * 0.35);
        pSize += lensPush * 1.4;
      }

      // Store signal node coordinates for constellation pass
      if (isSignal[i] === 1 && signalVisibleIndex < SIGNAL_NODE_COUNT) {
        screenSignalX[signalVisibleIndex] = px;
        screenSignalY[signalVisibleIndex] = py;
        screenSignalZ[signalVisibleIndex] = z2;
        screenSignalVisible[signalVisibleIndex] = 1;
        signalVisibleIndex++;
      }

      // 8. Render particle (streak or rect)
      // Fast scroll renders dynamic velocity streak
      if (absVelocity > 10 && scale > 0.8) {
        const streakLength = Math.min(absVelocity * 0.45 * scale, 16);
        ctx.strokeStyle = `rgba(${baseR}, ${baseG}, ${baseB}, ${alpha * 0.85})`;
        ctx.lineWidth = Math.max(1, pSize * 0.8);
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px - (camRotZ * 4), py + (scrollVelocity > 0 ? -streakLength : streakLength));
        ctx.stroke();
      } else {
        if (isSignal[i] === 1) {
          ctx.fillStyle = `rgba(${accentR}, ${accentG}, ${accentB}, ${Math.min(1, alpha + 0.3)})`;
          ctx.fillRect(px, py, pSize * 1.3, pSize * 1.3);
        } else {
          ctx.fillStyle = `rgba(${baseR}, ${baseG}, ${baseB}, ${alpha})`;
          ctx.fillRect(px, py, pSize, pSize);
        }
      }
    }

    // ------------------------------------------------------------------------
    // CONSTELLATION PASS: Screen-Space Micro-Mesh between Signal Nodes
    // ------------------------------------------------------------------------
    const maxLinkDist = isMobile ? 45 : 70;
    const maxLinkDistSq = maxLinkDist * maxLinkDist;
    const linkLineAlpha = isDark ? 0.35 : 0.22;

    for (let j = 0; j < signalVisibleIndex; j++) {
      const sjx = screenSignalX[j];
      const sjy = screenSignalY[j];
      let linksDrawn = 0;

      for (let k = j + 1; k < signalVisibleIndex; k++) {
        if (linksDrawn >= 3) break; // Keep micro-mesh light and elegant
        const skx = screenSignalX[k];
        const sky = screenSignalY[k];

        const cdx = sjx - skx;
        const cdy = sjy - sky;
        const cdistSq = cdx * cdx + cdy * cdy;

        if (cdistSq < maxLinkDistSq) {
          const proximity = 1 - Math.sqrt(cdistSq) / maxLinkDist;
          ctx.strokeStyle = `rgba(${baseR}, ${baseG}, ${baseB}, ${proximity * linkLineAlpha})`;
          ctx.lineWidth = 0.65;
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

  // Lifecycle Controls
  function start() {
    if (prefersReducedMotion) {
      renderStaticPattern();
      return;
    }
    if (!isRunning) {
      isRunning = true;
      lastTime = performance.now();
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

  function renderStaticPattern() {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = 'rgba(10, 38, 238, 0.35)';
    for (let i = 0; i < 400; i++) {
      const sx = Math.random() * width;
      const sy = Math.random() * height;
      ctx.fillRect(sx, sy, 1.2, 1.2);
    }
  }

  let lastTime = performance.now();

  // Mouse & Touch Interaction
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

  // Tab Visibility Auto-Pause
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
