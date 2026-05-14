// ============================================================
// WELLFIX ERP — FRONTEND APP JS
// Loads products, banners, categories from Supabase live
// ============================================================

'use strict';

// ── INIT ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  initHeader();
  startFlashTimer(9 * 3600 + 30 * 60 + 0); // 9h 30m countdown
  await Promise.all([
    loadHeroBanners(),
    loadCategories(),
    loadFlashProducts(),
    loadTrendingProducts(),
    loadSiteSettings(),
  ]);
  setupRealtime();
});

// ── HEADER ────────────────────────────────────────────────────
function initHeader() {
  const header = document.getElementById('siteHeader');
  const searchToggle = document.getElementById('searchToggle');
  const mobileSearch = document.getElementById('mobileSearch');
  const searchBack = document.getElementById('searchBack');
  const menuBtn = document.getElementById('menuBtn');

  searchToggle?.addEventListener('click', () => {
    mobileSearch.classList.toggle('is-open');
    if (mobileSearch.classList.contains('is-open')) {
      setTimeout(() => document.getElementById('searchInput')?.focus(), 100);
    }
  });
  searchBack?.addEventListener('click', () => mobileSearch.classList.remove('is-open'));

  document.getElementById('searchInput')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') doSearch(e.target.value.trim());
  });

  // Update cart count from localStorage
  const cart = JSON.parse(localStorage.getItem('wf_cart') || '[]');
  const count = cart.reduce((s, i) => s + (i.qty || 1), 0);
  const countEl = document.getElementById('cartCount');
  if (countEl && count > 0) { countEl.textContent = count; countEl.style.display = 'flex'; }
}

function doSearch(query) {
  if (!query) return;
  window.location.href = 'pages/products.html?search=' + encodeURIComponent(query);
}

// ── SITE SETTINGS ─────────────────────────────────────────────
async function loadSiteSettings() {
  try {
    const settings = await WF.settings.getAll();
    if (settings.meta_title) document.getElementById('pageTitle').textContent = settings.meta_title;
    if (settings.meta_description) document.getElementById('metaDesc')?.setAttribute('content', settings.meta_description);
    if (settings.tagline) { const el = document.getElementById('footerTagline'); if (el) el.textContent = settings.tagline; }
    if (settings.store_name) { const el = document.getElementById('footerCopy'); if (el) el.textContent = `© ${new Date().getFullYear()} ${settings.store_name}. All rights reserved.`; }
  } catch (e) {}
}

// ── HERO BANNERS ──────────────────────────────────────────────
let heroIndex = 0, heroTotal = 0, heroTimer;

async function loadHeroBanners() {
  const track = document.getElementById('heroTrack');
  const dotsEl = document.getElementById('heroDots');

  try {
    const banners = await WF.banners.getActive('hero');

    if (!banners.length) {
      // Default fallback banner
      track.innerHTML = `
        <div class="hero-slide">
          <div style="width:100%;height:100%;background:linear-gradient(135deg,var(--green-900),var(--green-700));display:flex;align-items:center;">
            <div class="hero-slide-overlay" style="background:none;">
              <div class="hero-content">
                <span class="hero-badge">Kerala's #1 Appliance Store</span>
                <h1 class="hero-title">Premium Home Appliances at Best Prices</h1>
                <p class="hero-subtitle">100% Genuine products. Expert repair service. Free delivery across Kerala.</p>
                <a href="pages/products.html" class="hero-cta">Shop Now →</a>
              </div>
            </div>
          </div>
        </div>`;
      dotsEl.innerHTML = '';
      return;
    }

    heroTotal = banners.length;
    track.innerHTML = banners.map((b, i) => `
      <div class="hero-slide" data-index="${i}">
        ${b.desktop_image_url ? `<img class="desktop-img" src="${b.desktop_image_url}" alt="${b.title}" loading="${i === 0 ? 'eager' : 'lazy'}">` : ''}
        ${b.mobile_image_url ? `<img class="mobile-img" src="${b.mobile_image_url}" alt="${b.title}" loading="${i === 0 ? 'eager' : 'lazy'}">` : ''}
        <div class="hero-slide-overlay">
          <div class="hero-content">
            ${b.badge_text ? `<span class="hero-badge">${b.badge_text}</span>` : ''}
            <h1 class="hero-title">${b.title}</h1>
            ${b.subtitle ? `<p class="hero-subtitle">${b.subtitle}</p>` : ''}
            ${b.cta_text ? `<a href="${b.cta_url || 'pages/products.html'}" class="hero-cta">${b.cta_text} →</a>` : ''}
          </div>
        </div>
      </div>`).join('');

    dotsEl.innerHTML = banners.map((_, i) => `<div class="hero-dot ${i === 0 ? 'is-active' : ''}" onclick="goSlide(${i})"></div>`).join('');

    document.getElementById('heroPrev')?.addEventListener('click', () => goSlide((heroIndex - 1 + heroTotal) % heroTotal));
    document.getElementById('heroNext')?.addEventListener('click', () => goSlide((heroIndex + 1) % heroTotal));

    if (heroTotal > 1) heroTimer = setInterval(() => goSlide((heroIndex + 1) % heroTotal), 5000);
  } catch (e) {
    track.innerHTML = `<div class="hero-slide"><div style="width:100%;height:100%;background:var(--green-900);"></div></div>`;
  }
}

function goSlide(i) {
  heroIndex = i;
  const track = document.getElementById('heroTrack');
  if (track) track.style.transform = `translateX(-${i * 100}%)`;
  document.querySelectorAll('.hero-dot').forEach((d, idx) => d.classList.toggle('is-active', idx === i));
  clearInterval(heroTimer);
  heroTimer = setInterval(() => goSlide((heroIndex + 1) % heroTotal), 5000);
}

// ── CATEGORIES ────────────────────────────────────────────────
const catIcons = { 'mixers-grinders': '🌀', 'gas-stoves': '🔥', 'fans': '💨', 'pressure-cookers': '♨️', 'water-motors': '💧', 'washing-machines': '🫧', 'cookware-pans': '🍳', 'spare-parts': '🔧' };

async function loadCategories() {
  const el = document.getElementById('catScroll');
  if (!el) return;
  try {
    const cats = await WF.categories.getAll();
    el.innerHTML = cats.map(c => `
      <a href="pages/products.html?cat=${c.slug}" class="cat-pill">
        <div class="cat-pill-icon">${catIcons[c.slug] || '📦'}</div>
        <span class="cat-pill-name">${c.name}</span>
      </a>`).join('');
  } catch (e) { el.innerHTML = ''; }
}

// ── FLASH PRODUCTS ────────────────────────────────────────────
async function loadFlashProducts() {
  const el = document.getElementById('flashProducts');
  if (!el) return;
  try {
    const products = await WF.products.getAll({ limit: 10, active: true });
    const sale = products.filter(p => p.badge === 'sale' || p.badge === 'hot').slice(0, 8);
    if (!sale.length) { document.getElementById('flashSection')?.style && (document.getElementById('flashSection').style.display = 'none'); return; }
    el.innerHTML = sale.map(p => productCardHTML(p)).join('');
  } catch (e) { document.getElementById('flashSection')?.style && (document.getElementById('flashSection').style.display = 'none'); }
}

// ── TRENDING PRODUCTS ─────────────────────────────────────────
async function loadTrendingProducts() {
  const el = document.getElementById('trendingGrid');
  if (!el) return;
  try {
    const products = await WF.products.getAll({ limit: 12, active: true });
    if (!products.length) { el.innerHTML = '<p style="color:var(--gray-300);text-align:center;padding:20px;grid-column:1/-1;">No products yet</p>'; return; }
    el.innerHTML = products.map(p => productCardHTML(p)).join('');
  } catch (e) { el.innerHTML = '<p style="color:var(--gray-300);text-align:center;padding:20px;grid-column:1/-1;">Failed to load products</p>'; }
}

// ── PRODUCT CARD HTML ─────────────────────────────────────────
function productCardHTML(p) {
  const primaryImg = p.images?.find(i => i.is_primary)?.url || p.images?.[0]?.url;
  const disc = p.mrp && p.price ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 0;
  return `
    <div class="product-card" onclick="window.location.href='pages/product.html?id=${p.id}'">
      <div class="product-card__img-wrap">
        ${primaryImg ? `<img class="product-card__img" src="${primaryImg}" alt="${p.name}" loading="lazy">` : `<div class="product-card__img" style="display:flex;align-items:center;justify-content:center;font-size:40px;">📦</div>`}
        ${p.badge ? `<span class="product-card__badge ${p.badge}">${p.badge.toUpperCase()}</span>` : ''}
      </div>
      <div class="product-card__body">
        <div class="product-card__brand">${p.brand?.name || ''}</div>
        <div class="product-card__name">${p.name}</div>
        <div class="product-card__pricing">
          <span class="product-card__price">₹${Number(p.price).toLocaleString('en-IN')}</span>
          ${p.mrp ? `<span class="product-card__mrp">₹${Number(p.mrp).toLocaleString('en-IN')}</span>` : ''}
          ${disc > 0 ? `<span class="product-card__disc">${disc}% off</span>` : ''}
        </div>
        <button class="product-card__add" onclick="addToCart(event,'${p.id}','${p.name.replace(/'/g,"\\'")}',${p.price},'${primaryImg||''}')">
          <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add to Cart
        </button>
      </div>
    </div>`;
}

// ── CART ──────────────────────────────────────────────────────
function addToCart(e, id, name, price, img) {
  e.stopPropagation();
  const cart = JSON.parse(localStorage.getItem('wf_cart') || '[]');
  const existing = cart.find(i => i.id === id);
  if (existing) existing.qty = (existing.qty || 1) + 1;
  else cart.push({ id, name, price, img, qty: 1 });
  localStorage.setItem('wf_cart', JSON.stringify(cart));
  const total = cart.reduce((s, i) => s + (i.qty || 1), 0);
  const countEl = document.getElementById('cartCount');
  if (countEl) { countEl.textContent = total; countEl.style.display = 'flex'; }
  showToastFE('Added to cart!');
}

function showToastFE(msg) {
  let el = document.getElementById('feToast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'feToast';
    el.style.cssText = 'position:fixed;bottom:70px;left:50%;transform:translateX(-50%) translateY(60px);background:#1a1a1a;color:#fff;padding:10px 18px;border-radius:10px;font-size:13px;font-weight:500;z-index:999;transition:transform .25s,opacity .25s;opacity:0;white-space:nowrap;pointer-events:none;';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.style.transform = 'translateX(-50%) translateY(0)';
  el.style.opacity = '1';
  clearTimeout(el._t);
  el._t = setTimeout(() => { el.style.transform = 'translateX(-50%) translateY(60px)'; el.style.opacity = '0'; }, 2000);
}

// ── FLASH TIMER ───────────────────────────────────────────────
function startFlashTimer(seconds) {
  let remaining = seconds;
  function tick() {
    const h = Math.floor(remaining / 3600);
    const m = Math.floor((remaining % 3600) / 60);
    const s = remaining % 60;
    const pad = n => String(n).padStart(2, '0');
    const hEl = document.getElementById('timerH');
    const mEl = document.getElementById('timerM');
    const sEl = document.getElementById('timerS');
    if (hEl) hEl.textContent = pad(h);
    if (mEl) mEl.textContent = pad(m);
    if (sEl) sEl.textContent = pad(s);
    if (remaining <= 0) return;
    remaining--;
    setTimeout(tick, 1000);
  }
  tick();
}

// ── REALTIME ──────────────────────────────────────────────────
function setupRealtime() {
  WF.realtime.onProductsChange(() => {
    loadFlashProducts();
    loadTrendingProducts();
  });
}
