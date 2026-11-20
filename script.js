/*
 * UPFOREX — Standalone premium homepage interactions
 * No frameworks, APIs, third-party CDN or tracking dependencies.
 * Original brand palette is controlled by style.css; no dynamic colour changes.
 */
(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const byId = id => document.getElementById(id);
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const icon = (name) => '<svg class="icon" aria-hidden="true"><use href="#i-' + name + '"></use></svg>';

  function initNavigation() {
    const header = byId('siteHeader');
    const progress = byId('scrollProgress');
    const topButton = byId('backToTop');
    const menu = byId('primaryNav');
    const toggle = byId('menuToggle');
    let scheduled = false;

    function updateScroll() {
      scheduled = false;
      const scrolled = window.scrollY || document.documentElement.scrollTop;
      const available = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      header?.classList.toggle('is-scrolled', scrolled > 28);
      topButton?.classList.toggle('is-shown', scrolled > 660);
      if (progress) progress.style.width = (clamp(scrolled / available, 0, 1) * 100).toFixed(2) + '%';
    }
    function onScroll() {
      if (!scheduled) {
        scheduled = true;
        requestAnimationFrame(updateScroll);
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    updateScroll();

    function closeMenu(restoreFocus = false) {
      if (!menu || !toggle) return;
      menu.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open navigation');
      toggle.innerHTML = icon('menu');
      if (restoreFocus) toggle.focus();
    }
    toggle?.addEventListener('click', () => {
      const opening = !menu?.classList.contains('is-open');
      menu?.classList.toggle('is-open', opening);
      toggle.setAttribute('aria-expanded', String(opening));
      toggle.setAttribute('aria-label', opening ? 'Close navigation' : 'Open navigation');
      toggle.innerHTML = icon(opening ? 'close' : 'menu');
    });
    $$('a', menu || document.createElement('nav')).forEach(link => link.addEventListener('click', () => closeMenu()));
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && menu?.classList.contains('is-open')) closeMenu(true); });
    document.addEventListener('pointerdown', e => {
      if (menu?.classList.contains('is-open') && !menu.contains(e.target) && !toggle?.contains(e.target)) closeMenu();
    });
    window.matchMedia('(min-width: 951px)').addEventListener?.('change', e => { if (e.matches) closeMenu(); });
    topButton?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'instant' : 'smooth' }));
    const year = byId('year');
    if (year) year.textContent = String(new Date().getFullYear());

    // Keep the active navigation link aligned to the currently visible section.
    const navLinks = $$('#primaryNav a[href^="#"]');
    const sections = navLinks.map(a => ({ link: a, section: $(a.getAttribute('href') === '#top' ? '#hero' : a.getAttribute('href')) })).filter(x => x.section);
    if ('IntersectionObserver' in window && sections.length) {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const active = sections.find(s => s.section === entry.target);
          if (!active) return;
          sections.forEach(s => { s.link.classList.toggle('active', s === active); if (s === active) s.link.setAttribute('aria-current', 'location'); else s.link.removeAttribute('aria-current'); });
        });
      }, { rootMargin: '-25% 0px -64% 0px', threshold: 0 });
      sections.forEach(x => observer.observe(x.section));
    }
  }

  function initReveals() {
    const elements = $$('.reveal');
    if (!elements.length || !('IntersectionObserver' in window) || reducedMotion.matches) return;
    // Pre-mark top-of-page content so introducing animation never produces flashes.
    elements.forEach(el => {
      if (el.getBoundingClientRect().top < window.innerHeight * .95) el.classList.add('is-visible');
    });
    // Delay is capped per section: the entire entrance sequence stays around 1-1.4 seconds.
    $$('.scene').forEach(section => {
      $$('.reveal', section).forEach((el, i) => el.style.setProperty('--stagger', Math.min(i * 76, 390) + 'ms'));
    });
    document.body.classList.add('motion-ready');
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -5% 0px', threshold: .06 });
    elements.forEach(el => observer.observe(el));
    // If someone arrives via a deep link, show that destination immediately.
    if (window.location.hash) {
      const target = $(window.location.hash);
      if (target) $$('.reveal', target).forEach(el => el.classList.add('is-visible'));
    }
  }

  function initHoverDepth() {
    if (!finePointer.matches || reducedMotion.matches) return;
    $$('.market-card').forEach(card => {
      let scheduled = false, x = 0, y = 0;
      card.addEventListener('pointermove', e => {
        const rect = card.getBoundingClientRect();
        x = clamp((e.clientX - rect.left) / rect.width, 0, 1);
        y = clamp((e.clientY - rect.top) / rect.height, 0, 1);
        if (scheduled) return;
        scheduled = true;
        requestAnimationFrame(() => {
          scheduled = false;
          card.style.setProperty('--rx', ((.5 - y) * 5).toFixed(2) + 'deg');
          card.style.setProperty('--ry', ((x - .5) * 5).toFixed(2) + 'deg');
          card.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
          card.style.setProperty('--my', (y * 100).toFixed(1) + '%');
        });
      }, { passive: true });
      card.addEventListener('pointerleave', () => {
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
        card.style.setProperty('--mx', '50%');
        card.style.setProperty('--my', '50%');
      });
    });
    const hero = byId('heroVisual');
    const art = $('.hero-image-frame', hero || document);
    if (hero && art) {
      let raf = 0, x = 0, y = 0;
      hero.addEventListener('pointermove', e => {
        const rect = hero.getBoundingClientRect();
        x = ((e.clientX - rect.left) / rect.width - .5) * 11;
        y = ((e.clientY - rect.top) / rect.height - .5) * 11;
        if (!raf) raf = requestAnimationFrame(() => {
          raf = 0;
          art.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`;
        });
      }, { passive: true });
      hero.addEventListener('pointerleave', () => { art.style.transform = ''; });
    }
  }

  function initVideo() {
    const video = byId('ecnVideo');
    const play = byId('videoPlay');
    const mute = byId('videoMute');
    if (!video || !play || !mute) return;
    const muteText = $('span', mute);
    video.muted = true;
    video.controls = false;
    video.addEventListener('play', update);
    video.addEventListener('pause', update);
    video.addEventListener('ended', update);
    video.addEventListener('volumechange', update);
    function update() {
      const playing = !video.paused && !video.ended;
      play.classList.toggle('is-playing', playing);
      play.setAttribute('aria-label', playing ? 'Pause ECN trading video' : 'Play ECN trading video');
      play.innerHTML = icon(playing ? 'pause' : 'play');
      mute.setAttribute('aria-label', video.muted ? 'Unmute video' : 'Mute video');
      mute.innerHTML = icon(video.muted ? 'muted' : 'volume') + '<span>' + (video.muted ? 'Sound off' : 'Sound on') + '</span>';
    }
    async function togglePlayback() {
      if (!video.paused && !video.ended) { video.pause(); return; }
      try { await video.play(); } catch (error) {
        // Keep poster and usable controls when the browser rejects playback.
        console.warn('Video playback was prevented:', error);
        update();
      }
    }
    play.addEventListener('click', togglePlayback);
    video.addEventListener('click', togglePlayback);
    mute.addEventListener('click', () => { video.muted = !video.muted; update(); });
    video.addEventListener('error', () => { play.disabled = true; play.setAttribute('aria-label', 'Video unavailable'); });
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => { if (!entry.isIntersecting && !video.paused) video.pause(); });
      }, { threshold: .12 });
      observer.observe(video);
    }
    update();
  }

  function initPlatformSlider() {
    const images = $$('#slideStack .platform-slide');
    const counter = byId('slideCounter');
    const prev = byId('slidePrev');
    const next = byId('slideNext');
    const showcase = $('.platform-showcase');
    if (!images.length || !counter || !prev || !next) return;
    let current = 0;
    let interval = null;
    let isVisible = false;
    let pausedByInteraction = false;
    function show(index) {
      current = (index + images.length) % images.length;
      images.forEach((img, i) => { img.classList.toggle('active', i === current); img.setAttribute('aria-hidden', String(i !== current)); });
      counter.textContent = String(current + 1).padStart(2,'0') + ' / ' + String(images.length).padStart(2,'0');
    }
    function stopAuto() { if (interval !== null) { window.clearInterval(interval); interval = null; } }
    function startAuto() {
      stopAuto();
      if (!reducedMotion.matches && isVisible && !document.hidden && !pausedByInteraction) interval = window.setInterval(() => show(current + 1), 6500);
    }
    prev.addEventListener('click', () => { show(current - 1); startAuto(); });
    next.addEventListener('click', () => { show(current + 1); startAuto(); });
    showcase?.addEventListener('mouseenter', () => { pausedByInteraction = true; stopAuto(); });
    showcase?.addEventListener('mouseleave', () => { pausedByInteraction = false; startAuto(); });
    showcase?.addEventListener('focusin', () => { pausedByInteraction = true; stopAuto(); });
    showcase?.addEventListener('focusout', e => { if (!showcase.contains(e.relatedTarget)) { pausedByInteraction = false; startAuto(); } });
    document.addEventListener('visibilitychange', startAuto);
    if ('IntersectionObserver' in window && showcase) {
      const observer = new IntersectionObserver(entries => { isVisible = entries[0]?.isIntersecting ?? false; startAuto(); }, { threshold: .15 });
      observer.observe(showcase);
    } else { isVisible = true; startAuto(); }
    show(0);
  }

  /*
   * Dotted geographic globe: spherical projection of land points derived from an
   * equirectangular public geographic texture. Canvas 2D works without WebGL.
   * Land is stored as compact signed 16-bit latitude/longitude coordinates.
   */
  const LAND_COORDS_BASE64 = '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SBd0BEgXjAVIF6QGSBccDEgXMw1IF0wOSBdkD0gXfBBIF5QRSBesEkgXxBNIF9wUSBf0FUgXDBdIFyQYSBc7GUgXVBpIF2wbSBeEHEgXnB1IF7MeSBfMH0gX5CBIF/whSBcUI0gXLCRIF0QlSBdcJkgXdCdIF4woSBekKUgXvCpIF9QrSBfsLEgXBC5IFxwvSBc0MEgXTDFIF2QySBd8M0gXlDRIF6w1SBfDNkgX3DdIF/Q4SBcMOkgXOzxIF4Q/YBjhv2AY+cBgGBHCYBgpw2AYQcRgGFnFYBhxxmAYicdgGKHIYBi5yWAY0cpgGOnLYBgBzWAYGc5gGDHPYBhJ0GAYYdFgGHnSYBiR02AYqdRgGMHVYBjZ1mAY8ddgGAnZYBgh2mAYOdtgGLnsYBjR7WAY6e5gGJkCYBiwA2AYyQRgGOEFYBgpCWAYQQpgGFkLYBhxDGAYiQ1gGKEOYBi5D2AY0RBgGOkRYBgBE2AYGRRgGDEVYBhJFmAYYRdgGHkYYBiQGWAYqRpgGMEbYBjYHGAY8B1gGAgfYBghIGAYOSFgGFEiYBhpI2AYgCRgGJklYBixJmAYySdgGOEoYBj4KWAYEStgGCksYBhBLWAYWS5gGHAvYBiJMGAYoTFgGLkyYBjRM2AY6DRgGAE2YBgYN2AYMThgGEk5YBhgOmAYeTtgGJA8YBipPWAYwT5gGPFAYBgJQmAYIUNgGDlEeBnWu3gZHr94GTbAeBlOwXgZZsJ4GX7DeBmWxHgZrsV4GcbGeBnex3gZ9sh4GQ7KeBkmy3gZPsx4GVbNeBluzngZhs94GZ7QeBm20XgZztJ4GebTeBn+1HgZFtZ4GS7XeBlG2HgZXtl4GXbaeBmO23gZptx4Gb7deBk243gZT+R4GWfleBn263gZDu14GSbueBk+73gZ/vd4GRb5eBku+ngZHgV4GTUGeBlOB3gZlgp4Ga4LeBnGDHgZDhB4GSYReBk+EngZVhN4GW4UeBmGFXgZnhZ4GbYXeBnOGHgZ5hl4Gf4aeBkWHHgZLh14GUYeeBleH3gZdiB4GY4heBmmIngZviN4GdYkeBnuJXgZBid4GR4oeBk2KXgZTip4GWYreBl+LHgZli14Ga4ueBnGL3gZ3jB4GfYxeBkNM3gZJjR4GT01eBlWNngZbTd4GYU4eBmeOXgZtTp4Gc47eBnlPHgZ/T14GRY/eBkuQHgZRkF4GV1CeBl2Q3gZjkR4GaZFkBoUupAapcCQGrzBkBrUwpAa7MOQGgTFkBodxpAaNMeQGkzIkBpkyZAafMqQGpXLkBqszJAaxM2QGtzOkBr0z5AaDNGQGiTSkBqE1pAazNmQGvzbkBoU3ZAaRN+QGqXjkBq85JAaZOyQGnztkBqU7pAarO+QGsTwkBrc8ZAa9PKQGqQGkBq8B5Aa1AiQGuwJkBoEC5AaHAyQGjMNkBpMDpAalBGQGtwUkBr0FZAaDBeQGiQYkBo7GZAaVBqQGmwbkBqEHJAanB2QGrMekBrMH5Aa5CCQGvwhkBoUI5AaLCSQGkQlkBpcJpAadCeQGowokBqkKZAavCqQGtQrkBrsLJAaBC6QGhwvkBo0MJAaTDGQGmQykBp8M5AalDSQGqw1kBrDNpAa3DeQGvQ4kBoMOpAaJDuQGjs8kBpUPZAabD6QGoQ/kBqcQJAatEGQGsxCkBrkQ5Aa/ESQGhRGqBspw6gbedKoG5HTqBup1KgbwdWoG9nWqBs526gbad2oG4HeqBuZ36gbseCoG8nhqBvh4qgb+eOoG6HrqBu57Kgb0e2oG+nuqBsC8KgbGfGoGzHyqBtK86gbYfSoG3n1qBsxFagbqRqoG8EbqBvwHagbCB+oGyEgqBs5IagbUSKoG2kjqBuAJKgbmSWoG7EmqBvJJ6gb4SioG/gpqBsRK6gbKSyoG0EtqBtZLqgbcC+oG4kwqBuhMagb0TOoG+g0qBsBNqgbGDeoGzE4qBtJOagbYDq/HJ7Qvxy20b8cjtu/HN/qvxz2678cDu2/HCbuvxw+778cV/C/HG/xvxyG8r8cnvO/HLb0vxzO9b8c5va/HIYVvxymIr8cviO/HNYkvxzuJb8cBie/HB4ovxw2Kb8cTirYHWzV2B3829gd1OXYHRzp2B006tgdTOvYHWTs2B187dgdlO7YHazv2B3E8Ngd3PHYHfTy2B0M9NgdJPXYHTz22B1U99gddCfYHYwo2B2kKdgdvCrwHlHc8B5p3fAemd/wHrHg8B7J4fAeQefwHlno8B5x6fAeierwHqHr8B657PAe0e3wHunu8B4C8PAeGfHwHjHy8B5K8/AeYfTwHnn18B6R9vAeqffwHskE8B7hBfAe+QbwHrEm8B7JJwggvt0IINbeCCDu3wggBuEIIB7iCCA24wggT+QIIGflCCCu6AggxukIIPbrCCAO7QggJu4IID7vCCBX8Aggb/EIIIby';
  function initGlobe() {
    const canvas = byId('globeCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;
    const raw = atob(LAND_COORDS_BASE64);
    const bytes = Uint8Array.from(raw, c => c.charCodeAt(0));
    const view = new DataView(bytes.buffer);
    const lands = [];
    for (let i = 0; i < bytes.length; i += 4) {
      const lat = view.getInt16(i, true) / 100 * Math.PI / 180;
      const lon = view.getInt16(i + 2, true) / 100 * Math.PI / 180;
      lands.push({ lat, lon, cosLat: Math.cos(lat), sinLat: Math.sin(lat) });
    }
    let running = true;
    let visible = true;
    let animationId = 0;
    let lastPaint = 0;
    let startedAt = 0;
    let logical = 360;
    let scale = 1;
    const mobile = window.matchMedia('(max-width: 700px)');

    function resize() {
      const box = canvas.getBoundingClientRect();
      logical = clamp(Math.round(box.width || 360), 200, 540);
      scale = Math.min(window.devicePixelRatio || 1, mobile.matches ? 1.5 : 2);
      canvas.width = Math.round(logical * scale);
      canvas.height = Math.round(logical * scale);
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      paint(performance.now());
    }
    function drawGrid(cx, cy, radius, rotation) {
      ctx.lineWidth = .62;
      ctx.strokeStyle = 'rgba(56,177,220,.15)';
      for (let latitude = -60; latitude <= 60; latitude += 30) {
        ctx.beginPath();
        let started = false;
        const lat = latitude * Math.PI / 180;
        for (let d = -89; d <= 89; d += 3) {
          const a = d * Math.PI / 180;
          const x = Math.cos(lat) * Math.sin(a);
          const y = -Math.sin(lat);
          const px = cx + radius * x, py = cy + radius * y;
          if (!started) { ctx.moveTo(px, py); started = true; } else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }
      for (let longitude = -180; longitude <= 180; longitude += 30) {
        ctx.beginPath();
        let started = false;
        for (let latDeg = -88; latDeg <= 88; latDeg += 4) {
          const lat = latDeg * Math.PI / 180;
          const diff = longitude * Math.PI / 180 - rotation;
          const z = Math.cos(lat) * Math.cos(diff);
          if (z <= 0) { started = false; continue; }
          const x = Math.cos(lat) * Math.sin(diff);
          const y = -Math.sin(lat);
          const px = cx + radius * x, py = cy + radius * y;
          if (!started) { ctx.moveTo(px, py); started = true; } else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }
    }
    function point(cx, cy, radius, lat, lon, angle) {
      const diff = lon - angle;
      const cos = Math.cos(lat);
      const z = cos * Math.cos(diff);
      return { x: cx + cos * Math.sin(diff) * radius, y: cy - Math.sin(lat) * radius, z };
    }
    function drawLinks(cx, cy, radius, angle, sites) {
      ctx.lineWidth = .82;
      const links = [[0,1],[1,2],[2,3],[3,4],[0,4]];
      links.forEach(([a,b]) => {
        const from = sites[a], to = sites[b];
        ctx.beginPath();
        let started = false;
        for (let i = 0; i <= 28; i++) {
          const t = i / 28;
          const p = point(cx,cy,radius, from[0] + (to[0]-from[0]) * t, from[1] + (to[1]-from[1]) * t, angle);
          if (p.z <= .075) { started = false; continue; }
          if (!started) { ctx.moveTo(p.x,p.y); started=true; } else ctx.lineTo(p.x,p.y);
        }
        ctx.strokeStyle = 'rgba(29,197,251,.32)';
        ctx.stroke();
      });
      sites.forEach(site => {
        const p = point(cx,cy,radius,site[0],site[1],angle);
        if (p.z <= .07) return;
        ctx.fillStyle = 'rgba(126,232,255,.96)';
        ctx.beginPath(); ctx.arc(p.x,p.y, 2.2,0,Math.PI*2); ctx.fill();
      });
    }
    function paint(now) {
      if (!ctx || !logical) return;
      const cx = logical / 2, cy = logical / 2;
      const radius = logical * .455;
      const rotation = (24 + (reducedMotion.matches ? 0 : (now - startedAt) * .000095 * 180 / Math.PI)) * Math.PI / 180;
      ctx.clearRect(0, 0, logical, logical);
      ctx.save();
      const atmosphere = ctx.createRadialGradient(cx,cy,radius*.6,cx,cy,radius*1.13);
      atmosphere.addColorStop(0,'rgba(0,61,110,0)');
      atmosphere.addColorStop(.76,'rgba(22,161,232,.08)');
      atmosphere.addColorStop(.96,'rgba(32,172,250,.13)');
      atmosphere.addColorStop(1,'rgba(0,103,205,0)');
      ctx.fillStyle = atmosphere;
      ctx.beginPath();ctx.arc(cx,cy,radius*1.13,0,2*Math.PI);ctx.fill();
      const body = ctx.createRadialGradient(cx-radius*.27,cy-radius*.31,radius*.08,cx,cy,radius*1.18);
      body.addColorStop(0,'#073759');body.addColorStop(.45,'#052440');body.addColorStop(.77,'#031527');body.addColorStop(1,'#020e18');
      ctx.fillStyle = body;
      ctx.beginPath();ctx.arc(cx,cy,radius,0,2*Math.PI);ctx.fill();
      ctx.save();ctx.beginPath();ctx.arc(cx,cy,radius-.5,0,2*Math.PI);ctx.clip();
      drawGrid(cx,cy,radius,rotation);
      const step = mobile.matches ? 2 : 1;
      for (let i = 0; i < lands.length; i += step) {
        const p = lands[i];
        const angle = p.lon - rotation;
        const z = p.cosLat * Math.cos(angle);
        if (z <= .02) continue;
        const x = cx + p.cosLat * Math.sin(angle) * radius;
        const y = cy - p.sinLat * radius;
        const alpha = .33 + z * .63;
        ctx.fillStyle = `rgba(58,199,246,${alpha.toFixed(2)})`;
        const dot = (mobile.matches ? 1.14 : 1.38) * (.60 + z * .51);
        ctx.fillRect(x,y,dot,dot);
      }
      const rad = Math.PI / 180;
      drawLinks(cx,cy,radius,rotation,[[40.7*rad,-74*rad],[51.5*rad,-.1*rad],[25.2*rad,55.3*rad],[1.3*rad,103.8*rad],[35.6*rad,139.7*rad]]);
      const shadow = ctx.createLinearGradient(cx-radius,cy,cx+radius,cy);
      shadow.addColorStop(0,'rgba(0,0,0,.14)');shadow.addColorStop(.43,'rgba(0,0,0,0)');shadow.addColorStop(1,'rgba(0,4,15,.59)');
      ctx.fillStyle=shadow;ctx.fillRect(cx-radius,cy-radius,radius*2,radius*2);
      ctx.restore();
      ctx.strokeStyle = 'rgba(84,209,254,.55)';ctx.lineWidth=1.5;
      ctx.beginPath();ctx.arc(cx,cy,radius,0,2*Math.PI);ctx.stroke();
      const highlight = ctx.createLinearGradient(cx-radius,cy-radius,cx+radius,cy+radius);
      highlight.addColorStop(0,'rgba(180,239,255,.50)');highlight.addColorStop(.4,'rgba(73,196,242,.01)');highlight.addColorStop(1,'rgba(73,196,242,.30)');
      ctx.strokeStyle=highlight;ctx.lineWidth=3;
      ctx.beginPath();ctx.arc(cx,cy,radius-2,-2.55,-.3);ctx.stroke();
      ctx.restore();
    }
    function tick(now) {
      animationId = 0;
      if (!running || document.hidden || !visible || reducedMotion.matches) return;
      if (!startedAt) startedAt = now;
      if (now - lastPaint >= (mobile.matches ? 54 : 35)) {
        lastPaint = now;
        paint(now);
      }
      animationId = window.requestAnimationFrame(tick);
    }
    function start() {
      if (animationId || reducedMotion.matches || document.hidden || !visible) return;
      animationId = window.requestAnimationFrame(tick);
    }
    function stop() { if (animationId) cancelAnimationFrame(animationId); animationId=0; }
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => { visible = entries[0]?.isIntersecting ?? false; if (visible) start(); else stop(); }, { threshold:.02 });
      observer.observe(canvas);
    }
    document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); else start(); });
    window.addEventListener('pagehide', () => { running=false; stop(); });
    if ('ResizeObserver' in window) {
      const ro = new ResizeObserver(resize);ro.observe(canvas);
    } else window.addEventListener('resize', resize, { passive:true });
    if (reducedMotion.addEventListener) reducedMotion.addEventListener('change', () => { if (reducedMotion.matches) { stop();paint(performance.now()); } else start(); });
    resize(); start();
  }

  document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initReveals();
    initHoverDepth();
    initVideo();
    initPlatformSlider();
    initGlobe();
  });
})();
