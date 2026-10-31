/**
 * ============================================================================
 * SWISS GENERATIVE 3D PARTICLE & MATHEMATICAL MANIFOLD ENGINE
 * Pure Vanilla JavaScript (No Frameworks, No CDN Dependencies, 60 FPS Native)
 * Inspired by Daniel Ingrassia (ingrassiadaniel.it)
 * ============================================================================
 */

(function () {
  'use strict';

  const container = document.getElementById('threejs-particle-scene') || document.body;
  
  // Create or reuse canvas
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

  // Diagnostics and Controls
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let isRunning = false;
  let animationFrameId = null;

  // Dimensions & Device Pixel Ratio
  let width = window.innerWidth;
  let height = window.innerHeight;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);

  // Mouse & Virtual Cursor
  const pointer = {
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    active: false,
    radius: 180
  };

  // FPS Telemetry
  let lastTime = performance.now();
  let frameCount = 0;
  let fpsTimer = performance.now();
  let currentFps = 60.0;

  // HUD Elements
  const fpsElem = document.getElementById('canvas-fps');
  const particlesElem = document.getElementById('hud-particles-count');

  // Particle Point Cloud Configuration
  const PARTICLE_COUNT = width < 768 ? 9000 : 20000;
  if (particlesElem) {
    particlesElem.textContent = (PARTICLE_COUNT).toLocaleString() + ' PTS';
  }

  // Pre-allocated Particle Arrays for optimal cache coherence & zero GC churn
  const originX = new Float32Array(PARTICLE_COUNT);
  const originY = new Float32Array(PARTICLE_COUNT);
  const originZ = new Float32Array(PARTICLE_COUNT);

  const posX = new Float32Array(PARTICLE_COUNT);
  const posY = new Float32Array(PARTICLE_COUNT);
  const posZ = new Float32Array(PARTICLE_COUNT);

  const shapeTorusX = new Float32Array(PARTICLE_COUNT);
  const shapeTorusY = new Float32Array(PARTICLE_COUNT);
  const shapeTorusZ = new Float32Array(PARTICLE_COUNT);

  const shapeWaveX = new Float32Array(PARTICLE_COUNT);
  const shapeWaveY = new Float32Array(PARTICLE_COUNT);
  const shapeWaveZ = new Float32Array(PARTICLE_COUNT);

  const shapeGalaxyX = new Float32Array(PARTICLE_COUNT);
  const shapeGalaxyY = new Float32Array(PARTICLE_COUNT);
  const shapeGalaxyZ = new Float32Array(PARTICLE_COUNT);

  const phase = new Float32Array(PARTICLE_COUNT);
  const speed = new Float32Array(PARTICLE_COUNT);
  const baseSize = new Float32Array(PARTICLE_COUNT);

  // Initialize Point Cloud Geometries
  function generateGeometries() {
    const R = Math.min(width, height) * 0.28;
    const r = R * 0.42;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // 1. Torus Knot / Quantum Harmonic Manifold
      const u = Math.random() * Math.PI * 2;
      const v = Math.random() * Math.PI * 2;
      shapeTorusX[i] = (R + r * Math.cos(v)) * Math.cos(u);
      shapeTorusY[i] = (R + r * Math.cos(v)) * Math.sin(u) * 0.85;
      shapeTorusZ[i] = r * Math.sin(v);

      // 2. Planar Harmonic Wave Lattice
      const gridW = width * 0.85;
      const gridH = height * 0.7;
      const gx = (Math.random() - 0.5) * gridW;
      const gy = (Math.random() - 0.5) * gridH;
      shapeWaveX[i] = gx;
      shapeWaveY[i] = gy;
      shapeWaveZ[i] = Math.sin(gx * 0.015) * Math.cos(gy * 0.015) * 80;

      // 3. Cosmic Logarithmic Galaxy Vortex
      const arms = 3;
      const armAngle = (i % arms) * ((Math.PI * 2) / arms);
      const dist = Math.pow(Math.random(), 1.6) * (width * 0.45);
      const theta = armAngle + dist * 0.008;
      shapeGalaxyX[i] = Math.cos(theta) * dist + (Math.random() - 0.5) * 45;
      shapeGalaxyY[i] = Math.sin(theta) * dist * 0.6 + (Math.random() - 0.5) * 45;
      shapeGalaxyZ[i] = (Math.random() - 0.5) * (140 * (1 - dist / (width * 0.45)));

      // Set initial positions
      originX[i] = shapeTorusX[i];
      originY[i] = shapeTorusY[i];
      originZ[i] = shapeTorusZ[i];

      posX[i] = originX[i];
      posY[i] = originY[i];
      posZ[i] = originZ[i];

      phase[i] = Math.random() * Math.PI * 2;
      speed[i] = 0.4 + Math.random() * 0.8;
      baseSize[i] = Math.random() < 0.05 ? 1.8 : 0.9;
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

  // Smooth Interpolation State
  let rotX = 0;
  let rotY = 0;
  let targetRotX = 0;
  let targetRotY = 0;

  // Render Loop (60 FPS Native)
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

    // Scroll Depth Morphing
    const scrollY = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? Math.min(Math.max(scrollY / maxScroll, 0), 1) : 0;

    // Mouse Tracking Lerp
    pointer.x += (pointer.targetX - pointer.x) * 0.06;
    pointer.y += (pointer.targetY - pointer.y) * 0.06;

    targetRotY = (pointer.x / width - 0.5) * 0.8 + time * 0.00015;
    targetRotX = (pointer.y / height - 0.5) * -0.5;

    rotX += (targetRotX - rotX) * 0.05;
    rotY += (targetRotY - rotY) * 0.05;

    const cosY = Math.cos(rotY);
    const sinY = Math.sin(rotY);
    const cosX = Math.cos(rotX);
    const sinX = Math.sin(rotX);

    // Determine Theme Palette
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const focalLength = 480;
    const centerX = width * 0.5;
    const centerY = height * 0.5;

    // Batch Rendering Setup
    const baseR = isDark ? 43 : 10;
    const baseG = isDark ? 64 : 38;
    const baseB = isDark ? 253 : 238;

    const t = time * 0.001;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Morph between geometries based on scroll depth
      let tx, ty, tz;
      if (progress < 0.35) {
        const factor = progress / 0.35;
        tx = shapeTorusX[i] * (1 - factor) + shapeWaveX[i] * factor;
        ty = shapeTorusY[i] * (1 - factor) + shapeWaveY[i] * factor;
        tz = shapeTorusZ[i] * (1 - factor) + shapeWaveZ[i] * factor;
      } else if (progress < 0.75) {
        const factor = (progress - 0.35) / 0.4;
        tx = shapeWaveX[i] * (1 - factor) + shapeGalaxyX[i] * factor;
        ty = shapeWaveY[i] * (1 - factor) + shapeGalaxyY[i] * factor;
        tz = shapeWaveZ[i] * (1 - factor) + shapeGalaxyZ[i] * factor;
      } else {
        tx = shapeGalaxyX[i];
        ty = shapeGalaxyY[i];
        tz = shapeGalaxyZ[i];
      }

      // Add harmonic undulation
      const wave = Math.sin(t * speed[i] + phase[i]) * 4;
      tx += wave;
      ty += wave;

      // 3D Rotation (Y axis then X axis)
      let x1 = tx * cosY + tz * sinY;
      let z1 = -tx * sinY + tz * cosY;

      let y2 = ty * cosX - z1 * sinX;
      let z2 = ty * sinX + z1 * cosX + 600;

      // Perspective Projection
      if (z2 <= 20) continue;
      const scale = focalLength / z2;
      const px = centerX + x1 * scale;
      const py = centerY + y2 * scale;

      if (px < -10 || px > width + 10 || py < -10 || py > height + 10) continue;

      // Cursor Proximity Interaction
      const dx = px - pointer.targetX;
      const dy = py - pointer.targetY;
      const dist = Math.hypot(dx, dy);

      let alpha = Math.min(0.85, (1 - (z2 - 300) / 700) * 0.7);
      let size = baseSize[i] * scale;

      if (dist < 120 && pointer.active) {
        const push = (1 - dist / 120);
        alpha = Math.min(1, alpha + push * 0.4);
        size += push * 1.5;
      }

      ctx.fillStyle = `rgba(${baseR}, ${baseG}, ${baseB}, ${alpha})`;
      ctx.fillRect(px, py, size, size);
    }

    animationFrameId = requestAnimationFrame(render);
  }

  // Lifecycle Controls
  function start() {
    if (prefersReducedMotion) {
      renderStaticScene();
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

  function renderStaticScene() {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = 'rgba(10, 38, 238, 0.4)';
    for (let i = 0; i < 300; i++) {
      const rx = Math.random() * width;
      const ry = Math.random() * height;
      ctx.fillRect(rx, ry, 1.5, 1.5);
    }
  }

  // Mouse / Touch Event Listeners
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

  // Pause on Tab Visibility Change
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else start();
  });

  // Debounced Resize Listener
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(resize, 100);
  });

  // Initialize
  resize();
  start();

  window.__particleEngine = {
    resize: resize,
    refresh: () => {}
  };
})();
