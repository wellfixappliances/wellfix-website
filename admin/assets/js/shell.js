// ============================================================
// WELLFIX ERP — ADMIN SHELL JS
// Fixed: correct base path, session handling, no redirect loop
// ============================================================

'use strict';

const BASE = '/wellfix-website';

const AdminShell = {
  user: null,

  async init(pageTitle = 'Dashboard') {
    // Get session
    const { data: { session }, error } = await db.auth.getSession();

    // No session = go to login
    if (!session || error) {
      window.location.href = BASE + '/admin/login.html';
      return null;
    }

    // Get profile
    const { data: profile } = await db
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    // No profile or inactive = go to login
    if (!profile || !profile.is_active) {
      await db.auth.signOut();
      window.location.href = BASE + '/admin/login.html';
      return null;
    }

    this.user = { ...session.user, profile };
    this._renderShell(pageTitle);
    this._updateUserUI();
    return this.user;
  },

  _renderShell(pageTitle) {
    const shell = document.getElementById('adminShell');
    if (!shell) return;

    const currentPage = window.location.pathname.split('/').pop().replace('.html', '');

    const navItems = [
      { group: 'Main', items: [
        { page: 'dashboard', label: 'Dashboard', icon: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>' },
        { page: 'analytics', label: 'Analytics', icon: '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>' },
      ]},
      { group: 'Catalogue', items: [
        { page: 'products', label: 'Products', icon: '<path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>' },
        { page: 'categories', label: 'Categories', icon: '<path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>' },
        { page: 'brands', label: 'Brands', icon: '<circle cx="12" cy="12" r="10"/>' },
        { page: 'inventory', label: 'Inventory', icon: '<path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>' },
      ]},
      { group: 'Commerce', items: [
        { page: 'orders', label: 'Orders', icon: '<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>', badge: true },
        { page: 'customers', label: 'Customers', icon: '<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>' },
        { page: 'coupons', label: 'Coupons', icon: '<path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>' },
        { page: 'reviews', label: 'Reviews', icon: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>' },
      ]},
      { group: 'Services', items: [
        { page: 'services', label: 'Bookings', icon: '<path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>', badge: true },
      ]},
      { group: 'Content', items: [
        { page: 'homepage', label: 'Homepage', icon: '<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>' },
        { page: 'banners', label: 'Banners', icon: '<rect x="3" y="3" width="18" height="18" rx="2"/>' },
        { page: 'blog', label: 'Blog', icon: '<path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>' },
        { page: 'media', label: 'Media', icon: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>' },
      ]},
      { group: 'System', items: [
        { page: 'seo', label: 'SEO', icon: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>' },
        { page: 'users', label: 'Admin Users', icon: '<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>' },
        { page: 'settings', label: 'Settings', icon: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>' },
      ]},
    ];

    const navHTML = navItems.map(group => `
      <div class="nav-section-label">${group.group}</div>
      ${group.items.map(item => `
        <a href="${BASE}/admin/${item.page}.html"
           class="nav-link ${currentPage === item.page ? 'is-active' : ''}"
           data-tooltip="${item.label}">
          <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="16" height="16">
            ${item.icon}
          </svg>
          <span class="nav-link__text">${item.label}</span>
          ${item.badge ? `<span class="nav-badge" id="badge-${item.page}" style="display:none;">0</span>` : ''}
        </a>`).join('')
      }`).join('');

    shell.innerHTML = `
      <div class="sidebar-overlay" id="sidebarOverlay"></div>
      <div class="toast" id="toast">
        <svg fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
        <span id="toastMsg"></span>
      </div>
      <aside class="sidebar" id="sidebar">
        <div class="sidebar__brand">
          <div class="sidebar__logo">
            <img src="${BASE}/frontend/assets/images/WELLFIX-MAIN-LOGO.png" alt="WellFix"
              onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"
              style="width:28px;height:28px;">
            <span style="display:none;font-family:var(--font-display);font-size:14px;font-weight:800;color:#fff;align-items:center;justify-content:center;">W</span>
          </div>
          <div class="sidebar__brand-info">
            <div class="sidebar__brand-name">WellFix</div>
            <div class="sidebar__brand-role" id="sidebarRole">Admin</div>
          </div>
        </div>
        <nav class="sidebar__nav">${navHTML}</nav>
        <div class="sidebar__footer">
          <div class="sidebar__user" onclick="AdminShell.logout()">
            <div class="sidebar__avatar" id="userAvatar">A</div>
            <div class="sidebar__user-info">
              <div class="sidebar__user-name" id="userName">Loading...</div>
              <div class="sidebar__user-role">Click to logout</div>
            </div>
          </div>
        </div>
      </aside>
      <div class="topbar" id="topbar">
        <button class="topbar__menu-btn" onclick="AdminShell.toggleSidebar()">
          <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <div class="topbar__crumb">
          WellFix
          <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="width:12px;height:12px;"><polyline points="9 18 15 12 9 6"/></svg>
          <span>${pageTitle}</span>
        </div>
        <div class="topbar__spacer"></div>
        <div class="topbar__search">
          <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="search" placeholder="Search...">
        </div>
        <div class="topbar__actions">
          <button class="topbar__icon-btn">
            <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
          </button>
        </div>
        <a href="${BASE}/frontend/index.html" target="_blank" class="topbar__view-site">
          <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          <span>View Site</span>
        </a>
      </div>`;

    document.getElementById('sidebarOverlay').addEventListener('click', () => this.closeSidebar());
    this._loadBadges();
  },

  _updateUserUI() {
    const p = this.user?.profile;
    if (!p) return;
    const name = p.full_name || this.user.email;
    const role = (p.role || 'staff').replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
    const el1 = document.getElementById('userName');
    const el2 = document.getElementById('userAvatar');
    const el3 = document.getElementById('sidebarRole');
    if (el1) el1.textContent = name;
    if (el2) el2.textContent = name.charAt(0).toUpperCase();
    if (el3) el3.textContent = role;
  },

  async _loadBadges() {
    try {
      const [orders, bookings] = await Promise.all([
        db.from('orders').select('id', { count: 'exact' }).eq('status', 'pending'),
        db.from('service_bookings').select('id', { count: 'exact' }).eq('status', 'new')
      ]);
      const ob = document.getElementById('badge-orders');
      const sb = document.getElementById('badge-services');
      if (ob && orders.count > 0) { ob.textContent = orders.count; ob.style.display = 'flex'; }
      if (sb && bookings.count > 0) { sb.textContent = bookings.count; sb.style.display = 'flex'; }
    } catch (e) {}
  },

  toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const topbar = document.getElementById('topbar');
    const main = document.getElementById('mainWrap');
    if (window.innerWidth <= 900) {
      sidebar.classList.toggle('is-mobile-open');
      overlay.classList.toggle('is-visible');
    } else {
      sidebar.classList.toggle('is-collapsed');
      topbar.classList.toggle('is-expanded');
      if (main) main.classList.toggle('is-expanded');
    }
  },

  closeSidebar() {
    document.getElementById('sidebar')?.classList.remove('is-mobile-open');
    document.getElementById('sidebarOverlay')?.classList.remove('is-visible');
  },

  async logout() {
    await db.auth.signOut();
    window.location.href = BASE + '/admin/login.html';
  }
};

// Toast
function toast(msg, isError = false) {
  const el = document.getElementById('toast');
  const msgEl = document.getElementById('toastMsg');
  if (!el || !msgEl) return;
  msgEl.textContent = msg;
  el.className = 'toast' + (isError ? ' is-error' : '');
  el.classList.add('is-show');
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.remove('is-show'), 3000);
}

// Helpers
function formatCurrency(amount) {
  return '₹' + Number(amount || 0).toLocaleString('en-IN');
}
function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
function debounce(fn, ms = 300) {
  let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}
function confirmDialog(msg) { return window.confirm(msg); }
async function uploadFile(file, folder = 'general') {
  const ext = file.name.split('.').pop();
  const filename = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { data, error } = await db.storage.from('media').upload(filename, file, { cacheControl: '3600' });
  if (error) throw error;
  const { data: { publicUrl } } = db.storage.from('media').getPublicUrl(filename);
  return { url: publicUrl, filename };
}
function renderBadge(status) {
  const map = {
    active: 'badge-active', inactive: 'badge-inactive',
    pending: 'badge-pending', confirmed: 'badge-active',
    processing: 'badge-info', delivered: 'badge-active',
    cancelled: 'badge-danger', returned: 'badge-danger',
    new: 'badge-danger', assigned: 'badge-pending',
    in_progress: 'badge-info', completed: 'badge-active',
    draft: 'badge-inactive', published: 'badge-active',
    approved: 'badge-active',
  };
  const cls = map[status] || 'badge-inactive';
  const label = (status || '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  return `<span class="badge ${cls}">${label}</span>`;
}
function actionBtns(onEdit, onDelete) {
  return `<div style="display:flex;gap:4px;">
    <button class="btn-icon" onclick="${onEdit}" title="Edit">
      <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </svg>
    </button>
    <button class="btn-icon danger" onclick="${onDelete}" title="Delete">
      <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <polyline points="3 6 5 6 21 6"/>
        <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
        <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
      </svg>
    </button>
  </div>`;
}
function skeletonRows(cols = 6, rows = 5) {
  return Array(rows).fill(0).map(() =>
    `<tr>${Array(cols).fill(0).map(() =>
      `<td><div class="skeleton" style="height:14px;border-radius:4px;"></div></td>`
    ).join('')}</tr>`
  ).join('');
}

window.AdminShell = AdminShell;
window.toast = toast;
window.formatCurrency = formatCurrency;
window.formatDate = formatDate;
window.slugify = slugify;
window.debounce = debounce;
window.confirmDialog = confirmDialog;
window.uploadFile = uploadFile;
window.renderBadge = renderBadge;
window.actionBtns = actionBtns;
window.skeletonRows = skeletonRows;
