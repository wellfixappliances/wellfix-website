# WellFix ERP — Complete Setup & Deployment Guide

## WHAT THIS ERP IS

A fully connected ecommerce ecosystem where:
- **Frontend website** (wellfixappliances.github.io) loads products, banners, categories, reviews LIVE from Supabase
- **Admin panel** lets you manage everything — changes appear on the website INSTANTLY
- **No manual file editing needed** after initial setup

---

## SYSTEM ARCHITECTURE

```
┌──────────────────────────────────────────────────────┐
│                   SUPABASE (FREE)                     │
│  PostgreSQL DB  │  Storage  │  Auth  │  Realtime      │
└──────────────────────────────────────────────────────┘
         ↑ reads                    ↑ reads/writes
         │                          │
┌────────────────┐        ┌─────────────────────┐
│  FRONTEND SITE │        │    ADMIN PANEL       │
│  (GitHub Pages)│        │    (GitHub Pages)    │
│                │        │                      │
│  index.html    │        │  login.html          │
│  products.html │        │  dashboard.html      │
│  blog.html     │        │  products.html       │
│  etc.          │        │  orders.html         │
└────────────────┘        │  banners.html        │
                          │  blog.html           │
                          │  reviews.html        │
                          │  analytics.html      │
                          │  settings.html       │
                          └─────────────────────┘
```

---

## STEP 1 — CREATE SUPABASE PROJECT (10 minutes)

1. Go to **https://supabase.com** → Sign up free
2. Click **New Project**
3. Name: `wellfix-erp` | Password: (save it!) | Region: Asia South (Mumbai)
4. Wait ~2 minutes for project to boot
5. Go to **Settings → API**
6. Copy:
   - **Project URL** (looks like: https://abcdefgh.supabase.co)
   - **anon public key** (long string starting with eyJ...)

---

## STEP 2 — RUN DATABASE SCHEMA

1. In Supabase → Click **SQL Editor** (left sidebar)
2. Click **+ New query**
3. Open file: `backend/schema.sql` from this project
4. Paste the ENTIRE contents
5. Click **Run**
6. You should see "Success. No rows returned"

This creates all tables: products, categories, brands, banners, orders, customers, reviews, blog_posts, etc.

---

## STEP 3 — CREATE STORAGE BUCKETS

In Supabase → **Storage** → Create these buckets (all set to **Public**):

| Bucket Name | Purpose |
|-------------|---------|
| `media` | All general uploads, products, banners |
| `avatars` | Admin user profile photos |

Click each bucket → Settings → **Public bucket: ON**

---

## STEP 4 — CONNECT YOUR SUPABASE TO THE CODE

Open file: `backend/config/supabase.js`

Replace lines 12-13:
```js
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
```

With your actual values:
```js
const SUPABASE_URL = 'https://abcdefgh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

**IMPORTANT:** This one file is used by BOTH frontend and admin. Change it once.

---

## STEP 5 — CREATE FIRST ADMIN USER

1. In Supabase → **Authentication → Users**
2. Click **Invite user**
3. Enter your email → Send invite
4. Open your email → Accept invite → Set your password
5. Now go to **Table Editor → profiles**
6. Find your record → Click to edit → Change `role` to `super_admin`
7. Save

You can now log in at `/admin/login.html`

---

## STEP 6 — DEPLOY TO GITHUB PAGES

### Option A: Upload directly to GitHub

1. Go to **https://github.com** → Your repo (`wellfixappliances/wellfix-website`)
2. Upload all files maintaining this folder structure:

```
wellfix-website/
├── index.html              ← frontend/index.html
├── assets/
│   ├── css/main.css
│   ├── js/app.js
│   └── images/
│       ├── WELLFIX-MAIN-LOGO.png
│       └── WELLFIX-FAVICON.png
├── pages/
├── admin/
│   ├── login.html
│   ├── dashboard.html
│   ├── products.html
│   ├── orders.html
│   ├── banners.html
│   ├── services.html
│   ├── reviews.html
│   ├── customers.html
│   ├── categories.html
│   ├── brands.html
│   ├── inventory.html
│   ├── blog.html
│   ├── media.html
│   ├── homepage.html
│   ├── analytics.html
│   ├── seo.html
│   ├── settings.html
│   ├── users.html
│   └── assets/
│       ├── css/admin.css
│       └── js/shell.js
├── backend/
│   ├── schema.sql
│   └── config/supabase.js    ← CRITICAL: has your keys
└── frontend/
    └── assets/images/         ← logo images used by admin
```

3. Go to repo **Settings → Pages → Source: main branch / root**
4. Site will be live at: `https://wellfixappliances.github.io/wellfix-website/`

### Option B: Git push

```bash
git clone https://github.com/wellfixappliances/wellfix-website
# Copy all ERP files into the repo folder
git add .
git commit -m "WellFix ERP v2.0 - full connected system"
git push origin main
```

---

## ADMIN PANEL — HOW EACH PAGE WORKS

### 🔐 Login (`admin/login.html`)
- Secure login via Supabase Auth
- Session is maintained via JWT token
- Every other admin page checks session first — unauthorized users get redirected to login
- Forgot password sends email via Supabase

### 📊 Dashboard (`admin/dashboard.html`)
- Live stats pulled from Supabase on every load
- Revenue, orders, customers, bookings — all real numbers
- Realtime order updates via Supabase WebSocket subscription
- Low stock alerts auto-show when products are running low

### 📦 Products (`admin/products.html`)
- Full CRUD — Add, Edit, Delete products
- Multi-image upload (up to 6 images) — stored in Supabase Storage
- First image = main product image automatically
- Toggle Featured / Trending — appears on homepage immediately
- Margin calculator auto-shows when cost price is filled
- Changes appear on FRONTEND WEBSITE instantly on next page load

### 📋 Orders (`admin/orders.html`)
- All orders listed, filterable by status
- Click any order to see full details: items, customer, address
- Update order status — WhatsApp notify button per order
- Realtime — new orders appear without page refresh

### 🎯 Banners (`admin/banners.html`)
- Upload separate **desktop** (1920×720) and **mobile** (1080×1350) images
- Enable/disable banners with toggle — frontend respects this instantly
- Schedule banners with start/end dates
- Hero, Promo, Category banner positions

### 🔧 Service Bookings (`admin/services.html`)
- See all repair booking requests
- Update status: New → Assigned → In Progress → Completed
- WhatsApp button per booking to contact customer directly

### ⭐ Reviews (`admin/reviews.html`)
- Customer reviews pending approval show here
- Click Approve → review appears on product page immediately
- Delete spam or fake reviews

### ✍️ Blog (`admin/blog.html`)
- Full rich text editor (bold, italic, headings, lists, links, images, tables)
- Draft → Publish workflow
- SEO title and description per post
- Published posts appear on frontend instantly

### 🖼️ Media Library (`admin/media.html`)
- Central store for ALL uploaded images
- Drag & drop upload support
- Click any image to copy its URL
- Organized by folder (products, banners, blog, general)

### 🏠 Homepage Manager (`admin/homepage.html`)
- Toggle each homepage section on/off
- Sections: Offer Strip, Hero Banners, Categories, Flash Sale, Trending, Brands, Services, Reviews
- Order/visibility saved to database → frontend reads it on load

### 📁 Categories (`admin/categories.html`)
- Add/edit/delete product categories
- Nested categories supported (parent → child)
- Slug auto-generated from name
- Frontend category pills load from this table

### 🏷️ Brands (`admin/brands.html`)
- Add/edit/delete brands
- Brands appear in product add/edit dropdowns immediately

### 📦 Inventory (`admin/inventory.html`)
- See all products with live stock levels
- Update stock inline — no modal needed
- Low stock warning banner shows when items are running low

### 📈 Analytics (`admin/analytics.html`)
- Revenue totals pulled from orders table
- Sales by category breakdown
- Top products
- Customer location distribution
- Order status breakdown

### 🔍 SEO (`admin/seo.html`)
- Meta title and description for homepage
- Product page title/description templates
- Local SEO data (business name, address, hours)
- Values saved to site_settings table → frontend reads on load

### ⚙️ Settings (`admin/settings.html`)
- Store name, address, hours, phone, WhatsApp number
- Shipping: free shipping threshold, default fee
- Payment methods toggle
- Social media links
- All saved to site_settings table → frontend reads dynamically

### 👥 Admin Users (`admin/users.html`)
- See all team members
- Change roles: Super Admin / Admin / Staff / Inventory / Content
- Deactivate accounts
- Invite new team members via email

---

## HOW FRONTEND ↔ ADMIN SYNC WORKS

```
ADMIN CHANGES PRODUCT
        ↓
Supabase database updated
        ↓
Frontend next page load
calls WF.products.getAll()
        ↓
Gets fresh data from Supabase
        ↓
Renders updated product cards
```

For **Realtime** (orders, product stock):
```
New order placed
        ↓
Supabase fires WebSocket event
        ↓
Dashboard.html listening via
WF.realtime.onOrdersChange()
        ↓
Dashboard table auto-refreshes
without page reload
```

---

## ADDING YOUR REAL LOGO

Copy your logo files to these paths:
- `frontend/assets/images/WELLFIX-MAIN-LOGO.png`
- `frontend/assets/images/WELLFIX-FAVICON.png`

These are referenced by both frontend and admin automatically.

---

## ADDING PRODUCTS (First time)

1. Log in to admin → `admin/login.html`
2. Go to **Categories** → Add your categories (Mixers, Stoves, Fans, etc.)
3. Go to **Brands** → Add brands (Sujata, Preethi, etc.)
4. Go to **Products** → Click "Add Product"
5. Fill name, brand, category, price, stock
6. Upload product images (drag & drop supported)
7. Click "Publish Product"
8. Open your website — product appears immediately

---

## CONNECTING CUSTOM DOMAIN LATER

1. Buy domain (e.g. wellfixappliances.com)
2. In GitHub repo → Settings → Pages → Custom domain
3. At your domain registrar → Add CNAME record:
   - Name: `www`
   - Value: `wellfixappliances.github.io`
4. Add A records for apex domain (GitHub provides IPs)
5. Check "Enforce HTTPS" in GitHub Pages settings

---

## FREE TIER LIMITS (What you get for free)

| Service | Free Limit | Notes |
|---------|-----------|-------|
| Supabase Database | 500MB | ~1 million products |
| Supabase Storage | 1GB | Plenty for images |
| Supabase Auth | 50,000 users | More than enough |
| Supabase Realtime | 200 concurrent | Fine for start |
| GitHub Pages | Unlimited | Static hosting |
| Supabase API | 500MB data transfer/month | ~500k page loads |

---

## TROUBLESHOOTING

**"Invalid API key" error**
→ Check `backend/config/supabase.js` — your URL and key must match Supabase project settings

**Products not showing on frontend**
→ Check Supabase → Table Editor → products table → is `is_active = true`?
→ Check RLS policies are set correctly (run schema.sql again if needed)

**Images not uploading**
→ Go to Supabase → Storage → `media` bucket → Settings → Make sure "Public bucket" is ON

**Login not working**
→ Check that you accepted the invite email and set your password
→ Check your profile row in Supabase → profiles table → `is_active = true`

**Admin says "Access denied"**
→ Check your `role` in profiles table — should be `super_admin` or `admin`

---

## FILE STRUCTURE REFERENCE

```
wellfix-erp/
├── frontend/
│   ├── index.html                    ← Homepage (loads from Supabase)
│   └── assets/
│       ├── css/main.css              ← All frontend styles
│       ├── js/app.js                 ← Frontend logic, loads from Supabase
│       └── images/                   ← Logo files go here
│
├── admin/
│   ├── login.html                    ← Secure admin login
│   ├── dashboard.html                ← Live stats & overview
│   ├── products.html                 ← Full product management + image upload
│   ├── orders.html                   ← Order management + status updates
│   ├── banners.html                  ← Hero banner upload + scheduling
│   ├── services.html                 ← Repair booking management
│   ├── reviews.html                  ← Review approval system
│   ├── customers.html                ← Customer database
│   ├── categories.html               ← Category management
│   ├── brands.html                   ← Brand management
│   ├── inventory.html                ← Stock level management
│   ├── blog.html                     ← Blog CMS with rich editor
│   ├── media.html                    ← Media library
│   ├── homepage.html                 ← Homepage section manager
│   ├── analytics.html                ← Sales analytics
│   ├── seo.html                      ← SEO settings
│   ├── settings.html                 ← Store settings
│   ├── users.html                    ← Admin user management
│   └── assets/
│       ├── css/admin.css             ← All admin styles
│       └── js/shell.js               ← Admin shell: auth, sidebar, helpers
│
├── backend/
│   ├── schema.sql                    ← Full database schema (run in Supabase)
│   └── config/supabase.js            ← API client (WF object) - ADD YOUR KEYS HERE
│
└── docs/
    └── SETUP_GUIDE.md                ← This file
```

---

## SUPPORT

WhatsApp: +91 85900 04349
Email: info@wellfixappliances.com
