// ============================================================
// WELLFIX ERP — SUPABASE CLIENT CONFIG
// Used by BOTH frontend and admin
// ============================================================

const SUPABASE_URL = 'https://qjzaoiejqtjaipyraike.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqemFvaWVqcXRqYWlweXJhaWtlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3MjcyMjIsImV4cCI6MjA5NDMwMzIyMn0.llAb5lQ5noGQ3e-Ev1XINRWSFd0f4hOIclLURawfzL4';

// DO NOT change below this line
const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── API Helpers ──────────────────────────────────────────────

const WF = {

  auth: {
    async login(email, password) {
      const { data, error } = await db.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data;
    },
    async logout() {
      await db.auth.signOut();
      window.location.href = '/wellfix-website/admin/login.html';
    },
    async getUser() {
      const { data: { user } } = await db.auth.getUser();
      if (!user) return null;
      const { data: profile } = await db.from('profiles').select('*').eq('id', user.id).single();
      return { ...user, profile };
    },
    async requireAuth() {
      const user = await this.getUser();
      if (!user) window.location.href = '/wellfix-website/admin/login.html';
      return user;
    }
  },

  products: {
    async getAll(filters = {}) {
      let q = db.from('products')
        .select('*, brand:brands(name,slug), category:categories(name,slug), images:product_images(url,sort_order,is_primary)')
        .order('created_at', { ascending: false });
      if (filters.active !== false) q = q.eq('is_active', true);
      if (filters.featured) q = q.eq('is_featured', true);
      if (filters.trending) q = q.eq('is_trending', true);
      if (filters.category_id) q = q.eq('category_id', filters.category_id);
      if (filters.brand_id) q = q.eq('brand_id', filters.brand_id);
      if (filters.badge) q = q.eq('badge', filters.badge);
      if (filters.limit) q = q.limit(filters.limit);
      if (filters.search) q = q.ilike('name', `%${filters.search}%`);
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },
    async getById(id) {
      const { data, error } = await db.from('products')
        .select('*, brand:brands(*), category:categories(*), images:product_images(*)')
        .eq('id', id).single();
      if (error) throw error;
      return data;
    },
    async create(product) {
      const { data, error } = await db.from('products').insert(product).select().single();
      if (error) throw error;
      return data;
    },
    async update(id, updates) {
      const { data, error } = await db.from('products').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    async delete(id) {
      const { error } = await db.from('products').delete().eq('id', id);
      if (error) throw error;
    },
    async addImage(productId, url, isPrimary = false) {
      const { data, error } = await db.from('product_images')
        .insert({ product_id: productId, url, is_primary: isPrimary, sort_order: 0 }).select().single();
      if (error) throw error;
      return data;
    },
    async deleteImage(imageId) {
      const { error } = await db.from('product_images').delete().eq('id', imageId);
      if (error) throw error;
    }
  },

  categories: {
    async getAll() {
      const { data, error } = await db.from('categories').select('*').eq('is_active', true).order('sort_order');
      if (error) throw error;
      return data || [];
    },
    async create(cat) {
      const { data, error } = await db.from('categories').insert(cat).select().single();
      if (error) throw error;
      return data;
    },
    async update(id, updates) {
      const { data, error } = await db.from('categories').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    async delete(id) {
      const { error } = await db.from('categories').delete().eq('id', id);
      if (error) throw error;
    }
  },

  brands: {
    async getAll() {
      const { data, error } = await db.from('brands').select('*').eq('is_active', true).order('name');
      if (error) throw error;
      return data || [];
    },
    async create(brand) {
      const { data, error } = await db.from('brands').insert(brand).select().single();
      if (error) throw error;
      return data;
    },
    async update(id, updates) {
      const { data, error } = await db.from('brands').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    }
  },

  banners: {
    async getActive() {
      const { data, error } = await db.from('banners').select('*').eq('is_active', true).order('sort_order');
      if (error) throw error;
      return data || [];
    },
    async getAll() {
      const { data, error } = await db.from('banners').select('*').order('sort_order');
      if (error) throw error;
      return data || [];
    },
    async create(banner) {
      const { data, error } = await db.from('banners').insert(banner).select().single();
      if (error) throw error;
      return data;
    },
    async update(id, updates) {
      const { data, error } = await db.from('banners').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    async delete(id) {
      const { error } = await db.from('banners').delete().eq('id', id);
      if (error) throw error;
    }
  },

  orders: {
    async getAll(filters = {}) {
      let q = db.from('orders').select('*, items:order_items(*)').order('created_at', { ascending: false });
      if (filters.status) q = q.eq('status', filters.status);
      if (filters.limit) q = q.limit(filters.limit);
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },
    async getById(id) {
      const { data, error } = await db.from('orders').select('*, items:order_items(*)').eq('id', id).single();
      if (error) throw error;
      return data;
    },
    async create(order, items) {
      const orderNum = 'WF-' + Date.now().toString().slice(-6);
      const { data: newOrder, error } = await db.from('orders').insert({ ...order, order_number: orderNum }).select().single();
      if (error) throw error;
      if (items?.length) await db.from('order_items').insert(items.map(i => ({ ...i, order_id: newOrder.id })));
      return newOrder;
    },
    async updateStatus(id, status) {
      const { data, error } = await db.from('orders').update({ status }).eq('id', id).select().single();
      if (error) throw error;
      return data;
    }
  },

  services: {
    async getAll(filters = {}) {
      let q = db.from('service_bookings').select('*').order('created_at', { ascending: false });
      if (filters.status) q = q.eq('status', filters.status);
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },
    async create(booking) {
      const bookingNum = 'SV-' + Date.now().toString().slice(-6);
      const { data, error } = await db.from('service_bookings')
        .insert({ ...booking, booking_number: bookingNum }).select().single();
      if (error) throw error;
      return data;
    },
    async update(id, updates) {
      const { data, error } = await db.from('service_bookings').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    }
  },

  reviews: {
    async getAll() {
      const { data, error } = await db.from('reviews')
        .select('*, product:products(name)').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    async getForProduct(productId) {
      const { data, error } = await db.from('reviews')
        .select('*').eq('product_id', productId).eq('is_approved', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    async getHomepage() {
      const { data, error } = await db.from('reviews')
        .select('*').eq('is_approved', true).eq('is_featured', true).limit(6);
      if (error) throw error;
      return data || [];
    },
    async submit(review) {
      const { data, error } = await db.from('reviews').insert(review).select().single();
      if (error) throw error;
      return data;
    },
    async approve(id) {
      const { data, error } = await db.from('reviews').update({ is_approved: true }).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    async delete(id) {
      const { error } = await db.from('reviews').delete().eq('id', id);
      if (error) throw error;
    }
  },

  blog: {
    async getPublished(limit = 10) {
      const { data, error } = await db.from('blog_posts').select('*').eq('status', 'published')
        .order('published_at', { ascending: false }).limit(limit);
      if (error) throw error;
      return data || [];
    },
    async getAll() {
      const { data, error } = await db.from('blog_posts').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    async save(post) {
      if (post.id) {
        const { data, error } = await db.from('blog_posts').update(post).eq('id', post.id).select().single();
        if (error) throw error;
        return data;
      }
      const { data, error } = await db.from('blog_posts').insert(post).select().single();
      if (error) throw error;
      return data;
    },
    async delete(id) {
      const { error } = await db.from('blog_posts').delete().eq('id', id);
      if (error) throw error;
    }
  },

  media: {
    async upload(file, folder = 'general') {
      const ext = file.name.split('.').pop();
      const filename = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await db.storage.from('media').upload(filename, file, { cacheControl: '3600' });
      if (error) throw error;
      const { data: { publicUrl } } = db.storage.from('media').getPublicUrl(filename);
      return publicUrl;
    },
    async getAll(folder) {
      let q = db.from('media').select('*').order('created_at', { ascending: false });
      if (folder) q = q.eq('folder', folder);
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },
    async delete(id, filename) {
      if (filename) await db.storage.from('media').remove([filename]);
      await db.from('media').delete().eq('id', id);
    }
  },

  settings: {
    async get(key) {
      const { data } = await db.from('site_settings').select('value').eq('key', key).single();
      return data?.value || null;
    },
    async getAll() {
      const { data } = await db.from('site_settings').select('*');
      return data?.reduce((acc, row) => ({ ...acc, [row.key]: row.value }), {}) || {};
    },
    async set(key, value) {
      const { error } = await db.from('site_settings').upsert({ key, value, updated_at: new Date().toISOString() });
      if (error) throw error;
    }
  },

  homepage: {
    async getSections() {
      const { data, error } = await db.from('homepage_sections').select('*').order('sort_order');
      if (error) throw error;
      return data || [];
    },
    async updateSection(id, updates) {
      const { error } = await db.from('homepage_sections').update(updates).eq('id', id);
      if (error) throw error;
    }
  },

  customers: {
    async getAll() {
      const { data, error } = await db.from('customers').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    async create(customer) {
      const { data, error } = await db.from('customers').insert(customer).select().single();
      if (error) throw error;
      return data;
    }
  },

  coupons: {
    async validate(code, orderAmount) {
      const { data, error } = await db.from('coupons')
        .select('*').eq('code', code.toUpperCase()).eq('is_active', true).single();
      if (error || !data) throw new Error('Invalid or expired coupon');
      if (data.usage_limit && data.used_count >= data.usage_limit) throw new Error('Coupon usage limit reached');
      if (data.min_order_amount && orderAmount < data.min_order_amount) throw new Error(`Minimum order ₹${data.min_order_amount} required`);
      if (data.ends_at && new Date(data.ends_at) < new Date()) throw new Error('Coupon has expired');
      return data;
    },
    async getAll() {
      const { data, error } = await db.from('coupons').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  },

  analytics: {
    async getDashboardStats() {
      const PAID_STATUSES = ['confirmed','processing','shipped','delivered','paid'];
      const [orders, products, customers, bookings] = await Promise.all([
        db.from('orders').select('total, status, payment_status, created_at'),
        db.from('products').select('id, stock_qty, low_stock_threshold', { count: 'exact' }),
        db.from('customers').select('id', { count: 'exact' }),
        db.from('service_bookings').select('id, status', { count: 'exact' })
      ]);
      const allOrders = orders.data || [];
      const thisMonth = new Date(); thisMonth.setDate(1); thisMonth.setHours(0,0,0,0);
      // Only count confirmed/delivered orders for revenue — NOT cancelled
      const paidOrders = allOrders.filter(o => PAID_STATUSES.includes(o.status) && o.status !== 'cancelled');
      const monthPaid = paidOrders.filter(o => new Date(o.created_at) >= thisMonth);
      const revenue = monthPaid.reduce((s, o) => s + (parseFloat(o.total) || 0), 0);
      const totalRevenue = paidOrders.reduce((s, o) => s + (parseFloat(o.total) || 0), 0);
      const lowStock = (products.data || []).filter(p => (p.stock_qty || 0) <= (p.low_stock_threshold || 5)).length;
      return {
        revenue: revenue.toFixed(2),
        total_revenue: totalRevenue.toFixed(2),
        orders_count: monthPaid.length,
        total_orders: allOrders.filter(o => o.status !== 'cancelled').length,
        cancelled_orders: allOrders.filter(o => o.status === 'cancelled').length,
        customers_count: customers.count || 0,
        bookings_count: bookings.count || 0,
        low_stock_count: lowStock,
        pending_orders: allOrders.filter(o => o.status === 'pending').length,
        pending_payment: allOrders.filter(o => o.payment_status === 'pending_verification').length
      };
    }
  }
};

window.WF = WF;
window.db = db;
