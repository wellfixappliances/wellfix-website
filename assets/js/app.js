/* ============================================================
   WELLFIX — CORE JS (FIXED)
   ============================================================ */
'use strict';

/* ── STATE ── */
const state = {
  cartItems: JSON.parse(localStorage.getItem('wf_cart') || '[]'),
  get cartTotal() { return this.cartItems.reduce((s, i) => s + (i.qty || 1), 0); },
  wishlist: new Set(JSON.parse(localStorage.getItem('wf_wish') || '[]'))
};

/* ── HELPERS ── */
const fmt = n => '₹' + Number(n || 0).toLocaleString('en-IN');

function starsSVG(rating) {
  const svgStar = type => {
    const d = 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z';
    const fills = { full: '#F59E0B', half: '#F59E0B', empty: 'none' };
    const strokes = { full: 'none', half: 'none', empty: '#D1D5DB' };
    return `<svg width="11" height="11" viewBox="0 0 24 24" fill="${fills[type]}" stroke="${strokes[type]}" stroke-width="2"><path d="${d}"/></svg>`;
  };
  let html = '';
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) html += svgStar('full');
    else if (rating >= i - 0.5) html += svgStar('half');
    else html += svgStar('empty');
  }
  return `<span class="stars-icon">${html}</span>`;
}

/* ── PRODUCT CARD HTML (uses correct CSS classes) ── */
function productCardHTML(p, isDark = false) {
  const cls = isDark ? 'product-card product-card--dark' : 'product-card';
  const img = p.images?.find(i => i.is_primary)?.url || p.images?.[0]?.url || p.img || '';
  const disc = p.disc || (p.mrp && p.price ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 0);
  const price = p.price;
  const mrp = p.old || p.mrp;
  const badge = p.badge || '';
  const brand = p.brand?.name || p.brand || '';
  const name = p.name || '';
  const warranty = p.warranty || '';
  const id = p.id;
  const safeName = name.replace(/'/g, "\\'").replace(/"/g, '&quot;');

  return `
    <div class="${cls}" onclick="window.location.href=(location.pathname.includes('/pages/')?'':'pages/')+'product.html?id=${id}'" style="cursor:pointer;">
      <div class="product-card__img-wrap">
        ${img
          ? `<img class="product-card__img" src="${img}" alt="${name}" loading="lazy">`
          : `<div class="product-card__img" style="display:flex;align-items:center;justify-content:center;font-size:48px;position:absolute;inset:0;background:var(--gray-25);">📦</div>`}
        <div class="product-card__badges">
          ${badge ? `<span class="badge badge-${badge}">${badge === 'hot' ? 'HOT' : badge === 'sale' ? 'SALE' : 'NEW'}</span>` : ''}
          ${disc > 0 ? `<span class="badge badge-sale">-${disc}%</span>` : ''}
        </div>
        <button class="product-card__wish${state.wishlist.has(id) ? ' is-wished' : ''}"
          onclick="event.stopPropagation();toggleWish('${id}',this)" aria-label="Wishlist">
          <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
          </svg>
        </button>
      </div>
      <div class="product-card__body">
        <div class="product-card__brand">${brand}</div>
        <div class="product-card__name">${name}</div>
        <div class="product-card__pricing">
          <span class="price-now">${fmt(price)}</span>
          ${mrp ? `<span class="price-old">${fmt(mrp)}</span>` : ''}
          ${disc > 0 && !isDark ? `<span style="font-size:11px;color:var(--green-600);font-weight:600;">${disc}% off</span>` : ''}
        </div>
        ${warranty ? `<div class="product-card__warranty">
          <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          ${warranty} Warranty
        </div>` : ''}
        <button class="product-card__add" onclick="event.stopPropagation();addToCart('${id}','${safeName}',${price},'${img}',this)">
          <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 01-8 0"/>
          </svg>
          Add to Cart
        </button>
      </div>
    </div>`;
}

/* ── CART ACTIONS ── */
function saveCart() {
  localStorage.setItem('wf_cart', JSON.stringify(state.cartItems));
}

function updateCartUI() {
  const count = state.cartTotal;
  document.querySelectorAll('[data-cart-count], .hdr-cart__count, [data-cart-badge], .mobile-nav__badge').forEach(el => {
    el.textContent = count || '';
    if (el.classList.contains('hdr-cart__count') || el.classList.contains('mobile-nav__badge')) {
      el.style.display = count > 0 ? '' : 'none';
    }
  });
}

function addToCart(id, name, price, img, btn) {
  const existing = state.cartItems.find(i => i.id === id);
  if (existing) existing.qty = (existing.qty || 1) + 1;
  else state.cartItems.push({ id, name, price: Number(price), img, qty: 1 });
  saveCart();
  updateCartUI();
  // Button feedback
  if (btn) {
    const orig = btn.innerHTML;
    btn.classList.add('is-added');
    btn.innerHTML = `<svg fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> Added`;
    setTimeout(() => { btn.classList.remove('is-added'); btn.innerHTML = orig; }, 1800);
  }
  showCartToast(name);
}

function showCartToast(name) {
  let t = document.getElementById('wf-cart-toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'wf-cart-toast';
    t.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%) translateY(10px);background:#1a1a1a;color:#fff;padding:10px 20px;border-radius:8px;font-size:13px;font-weight:500;z-index:9999;transition:all .25s;opacity:0;pointer-events:none;white-space:nowrap;';
    document.body.appendChild(t);
  }
  t.textContent = '✓ Added to cart';
  t.style.opacity = '1';
  t.style.transform = 'translateX(-50%) translateY(0)';
  clearTimeout(t._t);
  t._t = setTimeout(() => {
    t.style.opacity = '0';
    t.style.transform = 'translateX(-50%) translateY(10px)';
  }, 2000);
}

window.toggleWish = function(id, btn) {
  if (state.wishlist.has(id)) {
    state.wishlist.delete(id);
    btn?.classList.remove('is-wished');
  } else {
    state.wishlist.add(id);
    btn?.classList.add('is-wished');
  }
  localStorage.setItem('wf_wish', JSON.stringify([...state.wishlist]));
};

/* ── FLASH TIMER ── */
function startTimer(secs) {
  const hEl = document.getElementById('t-h');
  const mEl = document.getElementById('t-m');
  const sEl = document.getElementById('t-s');
  if (!hEl) return;
  const pad = n => String(n).padStart(2, '0');
  const tick = () => {
    hEl.textContent = pad(Math.floor(secs / 3600));
    mEl.textContent = pad(Math.floor((secs % 3600) / 60));
    sEl.textContent = pad(secs % 60);
    if (secs > 0) secs--; else secs = 86399;
  };
  tick();
  setInterval(tick, 1000);
}

/* ── MOBILE NAV ── */
function initMobileNav() {
  document.querySelectorAll('.mobile-nav__item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.mobile-nav__item').forEach(i => i.classList.remove('is-active'));
      item.classList.add('is-active');
    });
  });
}

/* ── CATEGORY PILLS ── */
function initCatPills() {
  document.querySelectorAll('.cat-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('is-active'));
      pill.classList.add('is-active');
    });
  });
}

/* ── SCROLL REVEAL ── */
function initScrollReveal() {
  if (!window.IntersectionObserver) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.1 });
  document.querySelectorAll('[data-reveal]').forEach(el => obs.observe(el));
}

/* ── MOBILE SEARCH ── */
function initMobileSearch() {
  const overlay = document.getElementById('mobSearchOverlay');
  const openBtn = document.getElementById('mobSearchOpen');
  const closeBtn = document.getElementById('mobSearchClose');
  const backdrop = document.getElementById('mobSearchBackdrop');
  const mobInput = document.getElementById('mobSearchInput');
  if (!overlay) return;
  const openSearch = () => { overlay.classList.add('is-open'); document.body.style.overflow = 'hidden'; setTimeout(() => mobInput?.focus(), 250); };
  const closeSearch = () => { overlay.classList.remove('is-open'); document.body.style.overflow = ''; };
  openBtn?.addEventListener('click', openSearch);
  closeBtn?.addEventListener('click', closeSearch);
  backdrop?.addEventListener('click', closeSearch);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSearch(); });
  document.querySelectorAll('.mob-search-hint').forEach(hint => {
    hint.addEventListener('click', () => { if (mobInput) { mobInput.value = hint.textContent; mobInput.focus(); } });
  });
}

/* ── LOAD FROM SUPABASE ── */
async function loadFromSupabase() {
  try {
    const { data: products, error } = await db
      .from('products')
      .select('id, name, price, mrp, badge, warranty, is_active, images:product_images(url, is_primary), brand:brands(name), category:categories(name)')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(24);

    if (error || !products?.length) {
      renderStaticProducts();
      return;
    }

    const flashEl = document.getElementById('flash-products');
    const trendEl = document.getElementById('trending-products');
    const flashItems = products.filter(p => p.badge === 'sale' || p.badge === 'hot');

    if (flashEl) {
      const items = flashItems.length ? flashItems : products.slice(0, 8);
      flashEl.innerHTML = items.map(p => productCardHTML(p, true)).join('');
    }
    if (trendEl) {
      trendEl.innerHTML = products.map(p => productCardHTML(p, false)).join('');
    }

  } catch (err) {
    console.warn('Supabase load failed:', err.message);
    renderStaticProducts();
  }
}

/* ── STATIC FALLBACK PRODUCTS ── */
const STATIC_PRODUCTS = [
  { id: 's1', name: 'Sujata Powermatic Plus 900W', brand: 'Sujata', price: 3499, old: 4500, disc: 22, warranty: '2 Year', badge: 'hot', img: 'https://m.media-amazon.com/images/I/51NVCzNibvL.jpg' },
  { id: 's2', name: 'Preethi Blue Leaf Gold 750W', brand: 'Preethi', price: 2799, old: 3800, disc: 26, warranty: '2 Year', badge: 'sale', img: 'https://pimcdn.sharafdg.com/images/000000000001005673_1?1729168912' },
  { id: 's3', name: 'Butterfly Rapid 3-Burner Stove', brand: 'Butterfly', price: 2200, old: 2800, disc: 21, warranty: '1 Year', badge: '', img: 'https://m.media-amazon.com/images/I/7115Tw3ysWL.jpg' },
  { id: 's4', name: 'Prestige IRIS LPG 2-Burner', brand: 'Prestige', price: 1850, old: 2400, disc: 23, warranty: '1 Year', badge: '', img: 'https://m.media-amazon.com/images/I/51JyelsZUKL.jpg' },
  { id: 's5', name: 'Havells Steamer Ceiling Fan 1200mm', brand: 'Havells', price: 1650, old: 2200, disc: 25, warranty: '2 Year', badge: 'new', img: 'https://m.media-amazon.com/images/I/21954ou6hSL.jpg' },
  { id: 's6', name: 'Prestige Popular Pressure Cooker 5L', brand: 'Prestige', price: 1250, old: 1600, disc: 22, warranty: '5 Year', badge: 'hot', img: 'https://cdn.ae1stcry.com/brainbees/images/products/583x720/9ab0dae708715a.webp' },
  { id: 's7', name: 'Kirloskar Water Motor 0.5HP', brand: 'Kirloskar', price: 3200, old: 4000, disc: 20, warranty: '1 Year', badge: '', img: 'https://m.media-amazon.com/images/I/51qMjJWnDeL.jpg' },
];

function renderStaticProducts() {
  const flashEl = document.getElementById('flash-products');
  const trendEl = document.getElementById('trending-products');
  if (flashEl) flashEl.innerHTML = STATIC_PRODUCTS.map(p => productCardHTML(p, true)).join('');
  if (trendEl) trendEl.innerHTML = STATIC_PRODUCTS.map(p => productCardHTML(p, false)).join('');
}

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', () => {
  updateCartUI();
  startTimer(9930);
  initMobileNav();
  initCatPills();
  initScrollReveal();
  initMobileSearch();
  if (typeof db !== 'undefined') loadFromSupabase();
  else renderStaticProducts();
});
