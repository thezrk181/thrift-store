# Project Roadmap: Thrift Store E-Commerce

This document outlines the remaining features and architecture required to take the Thrift Store from its current foundation to a production-ready, fully-featured e-commerce platform. The roadmap is divided into logical phases to ensure steady, testable progress.

---

## Phase 1: Core E-Commerce (The "Launch" MVP)
*Goal: Allow customers to securely browse, add to cart, and actually purchase items.*

- [ ] **Checkout Flow & Payments**
  - Integrate a payment gateway (e.g., Stripe) to handle secure credit card processing.
  - Build a multi-step checkout page (Shipping Info -> Billing Info -> Order Review).
- [ ] **Order Management System (Database Layer)**
  - Create Supabase tables for `orders` and `order_items`.
  - Trigger automated confirmation emails upon successful payment (using Supabase Edge Functions or Resend).
- [ ] **Inventory Decrementing**
  - Automatically reduce stock/mark unique thrift items as "Sold Out" once an order is placed to prevent double-selling.

## Phase 2: Discovery & Search
*Goal: Help customers find specific unique thrift items quickly.*

- [ ] **Global Search**
  - Add a search bar to the Navigation menu (`SiteNav.tsx`).
  - Implement debounced search querying against the Supabase `products` table.
- [ ] **Advanced Filtering & Sorting**
  - On the Category pages, add sidebar filters for:
    - Size (S, M, L, XL, etc.)
    - Color
    - Price Range
    - Condition (New, Like New, Good, Fair)
  - Add sorting options (Price: Low to High, Newest Arrivals).

## Phase 3: User Accounts & Retention
*Goal: Give users a home to manage their relationship with the store.*

- [ ] **User Dashboard**
  - Create a `/profile` route guarded by authentication.
  - **Order History**: Display past orders with statuses (Processing, Shipped, Delivered).
  - **Address Book**: Save shipping addresses for faster future checkouts.
- [ ] **Wishlist (Favorites)**
  - Add a "Heart" icon to `ProductCard.tsx` and product detail pages.
  - Create a Supabase table `wishlists` linked to the user ID.
  - Create a `/wishlist` page for users to view saved items.

## Phase 4: Admin & Store Management
*Goal: Allow store owners to manage inventory without touching the raw database.*

- [ ] **Secure Admin Portal**
  - Create a `/admin` route cluster accessible only to users with an 'admin' role in Supabase.
- [ ] **Product Management Dashboard**
  - UI to add new thrift items, upload images, set prices, and write descriptions.
  - UI to edit or delete existing products.
- [ ] **Order Fulfillment Dashboard**
  - View all customer orders.
  - Update order statuses (e.g., add tracking numbers, mark as "Shipped").

## Phase 5: Growth & Conversion Features (Proposed Enhancements)
*Goal: Boost sales, build trust, and increase average order value.*

- [ ] **Product Reviews & Ratings**
  - Allow verified buyers to leave a 1-5 star review and text feedback on products they've purchased.
- [ ] **Related Products / "You Might Also Like"**
  - On the product detail page, query Supabase for items with similar tags or categories to cross-sell.
- [ ] **Abandoned Cart Recovery**
  - Save cart states to the database for logged-in users.
  - Send automated reminder emails if a cart is abandoned for 24 hours.
- [ ] **Promo Codes & Discounts**
  - Support percentage-based or flat-rate discount codes at checkout.
- [ ] **Newsletter Integration**
  - A footer signup form that syncs with Mailchimp or loops into a Supabase table for marketing blasts.

---

### Next Steps
Review the phases above. When you are ready to begin, we can start executing **Phase 1** to get your checkout system operational!
