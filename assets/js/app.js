/* ============================================================
   WELLFIX — CORE JS
   Data layer + Component engine + Interactions
   ============================================================ */

'use strict';

/* ── PRODUCT DATA ──────────────────────────────────────────── */
/* To add/edit products: modify the PRODUCTS array below.
   Fields: id, name, brand, price, old (MRP), disc (%), 
           rating, reviews, warranty, badge (hot|sale|new|''),
           img (URL or relative path like 'assets/images/mixer.jpg')  */

const PRODUCTS = [
  {
    id: 1, name: 'Sujata Powermatic Plus 900W', brand: 'Sujata',
    price: 3499, old: 4500, disc: 22, rating: 4.8, reviews: 245,
    warranty: '2 Year', badge: 'hot',
    img: 'https://m.media-amazon.com/images/I/51NVCzNibvL.jpg'
  },
  {
    id: 2, name: 'Preethi Blue Leaf Gold 750W', brand: 'Preethi',
    price: 2799, old: 3800, disc: 26, rating: 4.7, reviews: 189,
    warranty: '2 Year', badge: 'sale',
    img: 'https://pimcdn.sharafdg.com/images/000000000001005673_1?1729168912'
  },
  {
    id: 3, name: 'Butterfly Rapid 3-Burner Stove', brand: 'Butterfly',
    price: 2200, old: 2800, disc: 21, rating: 4.6, reviews: 312,
    warranty: '1 Year', badge: '',
    img: 'https://m.media-amazon.com/images/I/7115Tw3ysWL.jpg'
  },
  {
    id: 4, name: 'Prestige IRIS LPG 2-Burner', brand: 'Prestige',
    price: 1850, old: 2400, disc: 23, rating: 4.5, reviews: 156,
    warranty: '1 Year', badge: '',
    img: 'https://m.media-amazon.com/images/I/51JyelsZUKL.jpg'
  },
  {
    id: 5, name: 'Havells Steamer Ceiling Fan 1200mm', brand: 'Havells',
    price: 1650, old: 2200, disc: 25, rating: 4.4, reviews: 98,
    warranty: '2 Year', badge: 'new',
    img: 'https://m.media-amazon.com/images/I/21954ou6hSL.jpg'
  },
  {
    id: 6, name: 'Prestige Popular Pressure Cooker 5L', brand: 'Prestige',
    price: 1250, old: 1600, disc: 22, rating: 4.8, reviews: 421,
    warranty: '5 Year', badge: 'hot',
    img: 'https://cdn.ae1stcry.com/brainbees/images/products/583x720/9ab0dae708715a.webp'
  },
  {
    id: 7, name: 'Kirloskar Water Motor 0.5HP', brand: 'Kirloskar',
    price: 3200, old: 4000, disc: 20, rating: 4.6, reviews: 88,
    warranty: '1 Year', badge: '',
    img: 'https://5.imimg.com/data5/SELLER/Default/2021/4/EH/QF/RI/89703121/domestic-water-pump-500x500.jpg'
  },
  {
    id: 8, name: 'Butterfly Non-Stick Tawa 250mm', brand: 'Butterfly',
    price: 550, old: 750, disc: 27, rating: 4.4, reviews: 133,
    warranty: '6 Month', badge: 'sale',
    img: 'https://m.media-amazon.com/images/I/81Am4mpaHrL.jpg'
  },
  {
    id: 9, name: 'Pigeon Favourite Kitchen Set', brand: 'Pigeon',
    price: 1999, old: 2800, disc: 29, rating: 4.3, reviews: 204,
    warranty: '1 Year', badge: 'sale',
    img: 'https://m.media-amazon.com/images/I/71aTBdg5FJL.jpg'
  },
  {
    id: 10, name: 'Sujata Marvellex Mixer 900W', brand: 'Sujata',
    price: 4199, old: 5500, disc: 24, rating: 4.9, reviews: 312,
    warranty: '3 Year', badge: 'hot',
    img: 'https://m.media-amazon.com/images/I/51S16m6V4AL.jpg'
  },
  {
    id: 11, name: 'Prestige Deluxe Pressure Pan 3L', brand: 'Prestige',
    price: 899, old: 1200, disc: 25, rating: 4.6, reviews: 177,
    warranty: '2 Year', badge: '',
    img: 'https://m.media-amazon.com/images/I/61HFvYUGjJL.jpg'
  },
  {
    id: 12, name: 'Orient Electric Aeroslim Fan', brand: 'Orient',
    price: 2100, old: 2900, disc: 28, rating: 4.5, reviews: 91,
    warranty: '2 Year', badge: 'new',
    img: 'https://www.greencircletrading.ae/wp-content/uploads/2024/04/orientelectric_ce0130_01__56339.jpg'
  }
];

/* ── STATE ─────────────────────────────────────────────────── */
const state = {
  cart: new Map(),
  wishlist: new Set(),
  cartTotal: 2,   // demo pre-filled
};

/* ── HELPERS ───────────────────────────────────────────────── */
const fmt = n => '₹' + n.toLocaleString('en-IN');

function starsSVG(rating) {
  const svgStar = (type) => {
    const paths = {
      full: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
      half: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77V2z',
      empty: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z'
    };
    const fills = { full: '#F59E0B', half: '#F59E0B', empty: 'none' };
    const strokes = { full: 'none', half: 'none', empty: '#D1D5DB' };
    return `<svg width="11" height="11" viewBox="0 0 24 24" fill="${fills[type]}" stroke="${strokes[type]}" stroke-width="2"><path d="${paths[type]}"/></svg>`;
  };
  let html = '';
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) html += svgStar('full');
    else if (rating >= i - 0.5) html += svgStar('half');
    else html += svgStar('empty');
  }
  return `<span class="stars-icon">${html}</span>`;
}

/* ── PRODUCT CARD HTML ─────────────────────────────────────── */
function productCardHTML(p, isDark = false) {
  const cls = isDark ? 'product-card product-card--dark' : 'product-card';
  const badgeHTML = p.badge
    ? `<span class="badge badge-${p.badge}">${p.badge === 'hot' ? 'HOT' : p.badge === 'sale' ? 'SALE' : 'NEW'}</span>`
    : '';
  const discHTML = p.disc ? `<span class="badge badge-sale">-${p.disc}%</span>` : '';
  const isWished = state.wishlist.has(p.id);
  const heartIcon = isWished
    ? `<svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`
    : `<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>`;

  return `
    <div class="${cls}" data-id="${p.id}">
      <div class="product-card__img-wrap">
        <img class="product-card__img" src="${p.img}" alt="${p.name}" loading="lazy">
        <div class="product-card__badges">
          ${badgeHTML}
          ${isDark ? discHTML : ''}
        </div>
        <button class="product-card__wish${isWished ? ' is-wished' : ''}"
          onclick="toggleWish(${p.id}, this)" aria-label="Wishlist">
          ${heartIcon}
        </button>
      </div>
      <div class="product-card__body">
        <div class="product-card__brand">${p.brand}</div>
        <div class="product-card__name">${p.name}</div>
        <div class="product-card__stars">
          ${starsSVG(p.rating)}
          <span class="stars-count">(${p.reviews})</span>
        </div>
        <div class="product-card__pricing">
          <span class="price-now">${fmt(p.price)}</span>
          ${p.old ? `<span class="price-old">${fmt(p.old)}</span>` : ''}
          ${p.disc && !isDark ? `<span class="price-off">${p.disc}% off</span>` : ''}
        </div>
        <div class="product-card__warranty">
          <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          ${p.warranty} Warranty
        </div>
        <button class="product-card__add" onclick="addToCart(${p.id}, this)">
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

/* ── CART ACTIONS ──────────────────────────────────────────── */
function updateCartUI() {
  const count = state.cartTotal;
  document.querySelectorAll('[data-cart-count]').forEach(el => el.textContent = count);
  document.querySelectorAll('[data-cart-badge]').forEach(el => el.textContent = count);
}

window.addToCart = function(id, btn) {
  state.cartTotal++;
  updateCartUI();
  const add = btn || event.target.closest('.product-card__add');
  if (!add) return;
  const orig = add.innerHTML;
  add.classList.add('is-added');
  add.innerHTML = `<svg fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg> Added`;
  setTimeout(() => { add.classList.remove('is-added'); add.innerHTML = orig; }, 1800);
};

window.toggleWish = function(id, btn) {
  if (state.wishlist.has(id)) {
    state.wishlist.delete(id);
    btn.classList.remove('is-wished');
    btn.innerHTML = `<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>`;
  } else {
    state.wishlist.add(id);
    btn.classList.add('is-wished');
    btn.innerHTML = `<svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`;
  }
  document.querySelectorAll('[data-wish-count]').forEach(el => el.textContent = state.wishlist.size || '');
};

/* ── FLASH TIMER ───────────────────────────────────────────── */
function startTimer(secs) {
  const hEl = document.getElementById('t-h');
  const mEl = document.getElementById('t-m');
  const sEl = document.getElementById('t-s');
  if (!hEl) return;
  const pad = n => String(n).padStart(2, '0');
  const tick = () => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    hEl.textContent = pad(h);
    mEl.textContent = pad(m);
    sEl.textContent = pad(s);
    if (secs > 0) secs--;
    else secs = 86399;
  };
  tick();
  setInterval(tick, 1000);
}

/* ── MOBILE NAV ACTIVE ─────────────────────────────────────── */
function initMobileNav() {
  document.querySelectorAll('.mobile-nav__item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.mobile-nav__item').forEach(i => i.classList.remove('is-active'));
      item.classList.add('is-active');
    });
  });
}

/* ── CATEGORY PILLS ACTIVE ─────────────────────────────────── */
function initCatPills() {
  document.querySelectorAll('.cat-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('is-active'));
      pill.classList.add('is-active');
    });
  });
}

/* ── RENDER FUNCTIONS ──────────────────────────────────────── */
function renderFlashProducts() {
  const container = document.getElementById('flash-products');
  if (!container) return;
  container.innerHTML = PRODUCTS.slice(0, 8).map(p => productCardHTML(p, true)).join('');
}

function renderTrendingProducts() {
  const container = document.getElementById('trending-products');
  if (!container) return;
  container.innerHTML = PRODUCTS.map(p => productCardHTML(p, false)).join('');
}

/* ── INTERSECTION OBSERVER (lazy animate) ──────────────────── */
function initScrollReveal() {
  const els = document.querySelectorAll('[data-reveal]');
  if (!els.length || !window.IntersectionObserver) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  els.forEach(el => obs.observe(el));
}

/* ── MOBILE SEARCH OVERLAY ─────────────────────────────────── */
function initMobileSearch() {
  const overlay  = document.getElementById('mobSearchOverlay');
  const openBtn  = document.getElementById('mobSearchOpen');
  const closeBtn = document.getElementById('mobSearchClose');
  const backdrop = document.getElementById('mobSearchBackdrop');
  const mobInput = document.getElementById('mobSearchInput');

  if (!overlay) return;

  function openSearch() {
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => mobInput && mobInput.focus(), 250);
  }

  function closeSearch() {
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  if (openBtn)  openBtn.addEventListener('click', openSearch);
  if (closeBtn) closeBtn.addEventListener('click', closeSearch);
  if (backdrop) backdrop.addEventListener('click', closeSearch);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeSearch();
  });

  document.querySelectorAll('.mob-search-hint').forEach(hint => {
    hint.addEventListener('click', () => {
      if (mobInput) {
        mobInput.value = hint.textContent;
        mobInput.focus();
      }
    });
  });
}

/* ── INIT ──────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  renderFlashProducts();
  renderTrendingProducts();
  startTimer(9930);
  initMobileNav();
  initCatPills();
  initScrollReveal();
  updateCartUI();
  initMobileSearch();
});
