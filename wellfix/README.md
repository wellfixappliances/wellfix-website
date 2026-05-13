# WellFix Appliances — Frontend Developer Guide

## Project Structure

```
wellfix-website/
│
├── index.html                  ← Homepage (entry point)
│
├── assets/
│   ├── css/
│   │   ├── main.css            ← IMPORT ONLY — loads all CSS modules
│   │   ├── tokens.css          ← Design system: colors, spacing, fonts, shadows
│   │   ├── base.css            ← Reset + global utilities + buttons
│   │   ├── header.css          ← Topbar, site header, search, category navbar
│   │   ├── product-card.css    ← Product card component + grid layouts
│   │   ├── sections.css        ← All homepage sections (hero, flash, services, etc)
│   │   └── footer.css          ← Footer + mobile nav + WhatsApp FAB
│   │
│   ├── js/
│   │   └── app.js              ← All JavaScript: data, rendering, cart, timer
│   │
│   └── images/
│       ├── WELLFIX-MAIN-LOGO.png   ← Main header logo
│       ├── WELLFIX-FAVICON.png     ← Browser tab icon
│       └── (add product images here)
│
├── components/
│   ├── header.html             ← Reusable header snippet
│   ├── footer.html             ← Reusable footer snippet
│   └── product-card.html       ← Product card HTML reference
│
└── pages/
    ├── products.html           ← Full products listing page
    ├── services.html           ← Services & repair booking page
    ├── about.html              ← About page
    └── contact.html            ← Contact page
```

---

## How to Edit Products

Open `assets/js/app.js` and find the `PRODUCTS` array at the top.

Each product has these fields:
```js
{
  id: 1,                      // Unique number
  name: 'Product Name Here',  // Full product name
  brand: 'Brand Name',        // Brand (appears in uppercase)
  price: 3499,                // Selling price (in ₹, numbers only)
  old: 4500,                  // MRP / original price
  disc: 22,                   // Discount % (calculated from above)
  rating: 4.8,                // Star rating (0–5, allows .5)
  reviews: 245,               // Number of reviews
  warranty: '2 Year',         // Warranty text
  badge: 'hot',               // 'hot', 'sale', 'new', or '' (empty = no badge)
  img: 'URL or path'          // Image URL or 'assets/images/product.jpg'
}
```

**To add a product:** copy any existing object, paste it at the end of the array, update all fields, give it a unique `id`.

**To remove a product:** delete the whole `{ ... }` block.

**To change price:** update `price` and `old` fields. Update `disc` manually.

---

## How to Add Images

1. Upload images to `assets/images/` folder.
2. Use relative paths in the product data: `img: 'assets/images/your-product.jpg'`
3. Recommended image size: 600×600px, square, white/light background.
4. Format: JPG or WebP (smaller file size).

For pages inside `/pages/`, use `../assets/images/your-image.jpg` (one level up).

---

## How to Edit Banners

Banners are in `index.html` inside the `<!-- HERO BANNERS -->` and `<!-- PROMO BANNERS -->` sections.

Each banner card looks like:
```html
<div class="hero-card">
  <img class="hero-card__img" src="YOUR_IMAGE_URL" alt="Description">
  <div class="hero-card__overlay">
    <div class="hero-card__label">Top Sellers</div>
    <div class="hero-card__title">Your Title</div>
    <a href="#" class="hero-card__cta">Shop Now ...</a>
  </div>
</div>
```

Replace the `src`, label, title, and `href` link to update a banner.

---

## How to Update Categories

Category pills are in `index.html` inside `<!-- CATEGORY PILLS -->`.

Each pill looks like:
```html
<div class="cat-pill">
  <img class="cat-pill__img" src="IMAGE_URL" alt="Category Name">
  <span class="cat-pill__name">Category Name</span>
</div>
```

Add/remove/reorder these `cat-pill` divs to change the category strip.

---

## How to Update Contact / Phone Number

Search for `85900 04349` in any file and replace with the new number.

WhatsApp links follow the format: `https://wa.me/91XXXXXXXXXX?text=Your+message`

---

## Design System Customization

All colors, fonts, spacing are in `assets/css/tokens.css`.

Key variables to change brand color:
```css
--color-primary:       #034732;   /* Main green */
--color-primary-dark:  #023d29;   /* Darker green for hover */
--color-accent:        #e8b429;   /* Gold accent */
```

---

## Scaling to Admin Panel (Future)

This project is structured to support backend integration:

1. **Products**: The `PRODUCTS` array in `app.js` can be replaced with a `fetch()` call to an API endpoint.
   ```js
   const res = await fetch('/api/products');
   const PRODUCTS = await res.json();
   ```

2. **Images**: Currently stored in `assets/images/`. Later move to a CDN (Cloudinary, S3).

3. **Orders/Cart**: Currently client-side state. Add a cart API when backend is ready.

4. **Admin panel suggestion**: 
   - Strapi (headless CMS) or Firebase for product management
   - Admin UI can use the same design tokens from `tokens.css`
   - Keep CSS modules structure — each new page imports `main.css`

---

## File Naming Convention

- HTML: lowercase, hyphens (`product-detail.html`)
- CSS: lowercase, hyphens (`product-card.css`)
- Images: UPPERCASE for logo/favicon (`WELLFIX-LOGO.png`), lowercase for products (`sujata-mixer.jpg`)
- JS: camelCase functions, UPPER_SNAKE for constants

---

## Browser Support

- Chrome, Safari, Firefox, Edge (last 2 versions)
- iOS Safari 14+
- Android Chrome 90+
- Uses CSS variables, Grid, Flexbox — no polyfills needed for target audience
