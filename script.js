/* ============================================================
   KOSMOS — script.js
   ============================================================ */

(function () {
  'use strict';

  /* ---- 1. Canvas Particle + Gradient Background ---- */
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  let W, H, particles = [], mouse = { x: 0, y: 0 };

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', () => { resize(); initParticles(); });

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x  = Math.random() * W;
      this.y  = Math.random() * H;
      this.r  = Math.random() * 1.5 + 0.3;
      this.vx = (Math.random() - 0.5) * 0.25;
      this.vy = (Math.random() - 0.5) * 0.25;
      this.alpha = Math.random() * 0.55 + 0.1;
      this.hue = Math.random() > 0.5 ? 220 : 270;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > W) this.vx *= -1;
      if (this.y < 0 || this.y > H) this.vy *= -1;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${this.hue}, 80%, 70%, ${this.alpha})`;
      ctx.fill();
    }
  }

  function initParticles() {
    const count = Math.floor((W * H) / 8000);
    particles = Array.from({ length: Math.min(count, 180) }, () => new Particle());
  }
  initParticles();

  /* Glow orbs for cosmic ambience */
  const orbs = [
    { x: 0.15, y: 0.25, r: 0.35, color: '91,156,246', speed: 0.0003 },
    { x: 0.85, y: 0.6,  r: 0.30, color: '155,114,245', speed: 0.0004 },
    { x: 0.5,  y: 0.9,  r: 0.25, color: '91,156,246', speed: 0.0002 },
  ];
  let orbT = 0;

  function drawOrbs() {
    orbs.forEach(o => {
      const x = (o.x + Math.sin(orbT * o.speed * 1000) * 0.05) * W;
      const y = (o.y + Math.cos(orbT * o.speed * 1000) * 0.04) * H;
      const r = o.r * Math.max(W, H);
      const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, `rgba(${o.color},0.09)`);
      grad.addColorStop(1, `rgba(${o.color},0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  /* Parallax influence */
  let targetMX = 0, targetMY = 0, curMX = 0, curMY = 0;
  window.addEventListener('mousemove', e => {
    targetMX = (e.clientX / W - 0.5) * 30;
    targetMY = (e.clientY / H - 0.5) * 30;
  });

  function animate(t) {
    orbT = t;
    curMX += (targetMX - curMX) * 0.04;
    curMY += (targetMY - curMY) * 0.04;

    ctx.clearRect(0, 0, W, H);

    /* Deep bg */
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#050508');
    bg.addColorStop(0.5, '#07070f');
    bg.addColorStop(1, '#050505');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    ctx.translate(curMX * 0.3, curMY * 0.3);
    drawOrbs();
    ctx.restore();

    /* Particles */
    ctx.save();
    ctx.translate(curMX * 0.15, curMY * 0.15);
    particles.forEach(p => { p.update(); p.draw(); });
    ctx.restore();

    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);

  /* ---- 2. Custom Cursor ---- */
  const cursor   = document.getElementById('cursor');
  const follower = document.getElementById('cursor-follower');
  let fx = 0, fy = 0, cx = 0, cy = 0;

  document.addEventListener('mousemove', e => {
    cx = e.clientX; cy = e.clientY;
    cursor.style.left = cx + 'px';
    cursor.style.top  = cy + 'px';
  });

  (function animCursor() {
    fx += (cx - fx) * 0.14;
    fy += (cy - fy) * 0.14;
    follower.style.left = fx + 'px';
    follower.style.top  = fy + 'px';
    requestAnimationFrame(animCursor);
  })();

  /* ---- 3. Navbar Scroll ---- */
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  /* ---- 4. Scroll Progress Bar ---- */
  const progressBar = document.getElementById('scroll-progress');
  window.addEventListener('scroll', () => {
    const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight);
    progressBar.style.width = (pct * 100) + '%';
  }, { passive: true });

  /* ---- 5. Scroll Reveal ---- */
  const revealSelectors = '.reveal-up, .reveal-card, .reveal-timeline, .reveal-gallery';
  const revealEls = document.querySelectorAll(revealSelectors);

  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        /* Stagger siblings */
        const siblings = el.parentElement.querySelectorAll(revealSelectors);
        let delay = 0;
        siblings.forEach((s, idx) => { if (s === el) delay = idx * 80; });
        setTimeout(() => el.classList.add('visible'), delay);
        revealObs.unobserve(el);
      }
    });
  }, { threshold: 0.12 });

  revealEls.forEach(el => revealObs.observe(el));

  /* ---- 6. Gallery Filter ---- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      galleryItems.forEach(item => {
        if (filter === 'all' || item.dataset.category === filter) {
          item.classList.remove('hidden');
        } else {
          item.classList.add('hidden');
        }
      });
    });
  });

  /* ---- 7. Lightbox ---- */
  const lightbox = document.getElementById('lightbox');
  const lbImg    = document.getElementById('lb-img');
  const lbTag    = document.getElementById('lb-tag');
  const lbTitle  = document.getElementById('lb-title');
  const lbClose  = document.getElementById('lb-close');
  const lbPrev   = document.getElementById('lb-prev');
  const lbNext   = document.getElementById('lb-next');

  let currentIndex = 0;
  let activeItems = [];

  function openLightbox(index) {
    activeItems = [...document.querySelectorAll('.gallery-item:not(.hidden)')];
    currentIndex = index;
    showItem(currentIndex);
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function showItem(i) {
    const item = activeItems[i];
    if (!item) return;
    const img = item.querySelector('img');
    const tag = item.querySelector('.gallery-tag');
    const title = item.querySelector('h4');

    lbImg.src = img.src.replace('w=600', 'w=1200').replace('w=800', 'w=1400');
    lbImg.alt = img.alt;
    lbTag.textContent   = tag   ? tag.textContent   : '';
    lbTitle.textContent = title ? title.textContent : '';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    setTimeout(() => { lbImg.src = ''; }, 400);
  }

  galleryItems.forEach((item, i) => {
    item.addEventListener('click', () => {
      const visible = [...document.querySelectorAll('.gallery-item:not(.hidden)')];
      const idx = visible.indexOf(item);
      openLightbox(idx >= 0 ? idx : 0);
    });
  });

  lbClose.addEventListener('click', closeLightbox);
  document.querySelector('.lightbox-backdrop').addEventListener('click', closeLightbox);

  lbPrev.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + activeItems.length) % activeItems.length;
    showItem(currentIndex);
  });
  lbNext.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % activeItems.length;
    showItem(currentIndex);
  });

  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') { currentIndex = (currentIndex - 1 + activeItems.length) % activeItems.length; showItem(currentIndex); }
    if (e.key === 'ArrowRight') { currentIndex = (currentIndex + 1) % activeItems.length; showItem(currentIndex); }
  });

  /* ---- 8. Nav Active Link on Scroll ---- */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const sectionObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(l => l.classList.remove('active'));
        const link = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
        if (link) link.classList.add('active');
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => sectionObs.observe(s));

  /* ---- 9. Parallax Hero Title on Scroll ---- */
  const heroTitle = document.querySelector('.hero-title');
  window.addEventListener('scroll', () => {
    if (heroTitle) {
      const y = window.scrollY;
      heroTitle.style.transform = `translateY(${y * 0.18}px)`;
      heroTitle.style.opacity = 1 - y / 500;
    }
  }, { passive: true });

})();
