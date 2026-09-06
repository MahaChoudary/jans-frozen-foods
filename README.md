JAN'S Frozen Food — Project Overview

Summary
-------
This repository contains the front-end web application for "JAN'S Frozen Food" an e-commerce-style site for browsing and ordering frozen food products. It's built as a modern single-page React app using Vite and TanStack Router with a small serverless API endpoint for order submission (email forwarding). There is no relational database or external order storage in this repository — orders are emailed (via Resend or logged) and the cart is persisted locally in the browser.

Key goals of this README
- Explain what technologies are used
- Show the project's folder layout and where responsibilities live
- Describe the runtime/data flow (how user interactions travel through the app)
- State clearly what is implemented and what is not (frontend / backend / database)
- Show how to run and deploy the app and required environment variables
- Recommend next steps and improvements

Tech stack
----------
- Runtime/build: Vite (vite)
- Framework: React 19
- Routing: @tanstack/react-router (file-based routes; route tree auto-generated)
- Data fetching/cache: @tanstack/react-query (QueryClient used for route context)
- State: zustand (cart persisted to local storage using zustand/middleware persist)
- Forms/validation helpers: react-hook-form, zod (available via deps)
- UI: Tailwind CSS (v4), lucide-react icons, sonner for toasts, framer-motion used
- Bundling / dev helpers: vite-tsconfig-paths, @vitejs/plugin-react
- Serverless: simple Vercel-style function in api/send-order.ts (uses @vercel/node types)

High-level project status
-------------------------
- Frontend: Mostly implemented. Product listing, product detail, cart, checkout flows, navigation, and many UI components exist.
- Backend: Minimal. A serverless endpoint exists to accept order POSTs and either send email via resend.com (if RESEND_API_KEY is provided) or log to the server console. No authentication, no payments, no admin panel, no order persistence.
- Database: None. All product data is static and served from code (src/data/products.ts). Cart state is persisted in-browser only (localStorage via zustand/persist).
- Tests: No automated tests detected in the repository.

Important files and folders (quick links)
----------------------------------------
- Project root
  - package.json — scripts and dependencies (C:/Users/HP/jan-s-frozen-feast/package.json)
  - index.html — Vite entry HTML (C:/Users/HP/jan-s-frozen-feast/index.html)
  - dist/ — production build output (C:/Users/HP/jan-s-frozen-feast/dist)
- Source (frontend)
  - src/main.tsx — React entrypoint (C:/Users/HP/jan-s-frozen-feast/src/main.tsx)
  - src/router.tsx — creates router and QueryClient context (C:/Users/HP/jan-s-frozen-feast/src/router.tsx)
  - src/routeTree.gen.ts — generated route tree by TanStack Router (C:/Users/HP/jan-s-frozen-feast/src/routeTree.gen.ts)
  - src/routes/ — file-based route components (C:/Users/HP/jan-s-frozen-feast/src/routes/)
    - index.tsx — home
    - products.tsx — product listing (C:/Users/HP/jan-s-frozen-feast/src/routes/products.tsx)
    - products.$id.tsx — product detail
    - cart.tsx — cart page
    - checkout.tsx — checkout form that posts to /api/send-order (C:/Users/HP/jan-s-frozen-feast/src/routes/checkout.tsx)
    - about.tsx, contact.tsx, faq.tsx, deals.tsx, franchise.tsx, testimonials.tsx, categories.tsx
  - src/components/ — UI components (Navbar, Footer, ProductCard, FloatingWhatsApp, Logo, ThemeToggle) (C:/Users/HP/jan-s-frozen-feast/src/components)
  - src/data/products.ts — in-repo product catalog (C:/Users/HP/jan-s-frozen-feast/src/data/products.ts)
  - src/store/cart.ts — zustand cart store with persistence (C:/Users/HP/jan-s-frozen-feast/src/store/cart.ts)
  - src/styles.css — global styles / tailwind utilities (C:/Users/HP/jan-s-frozen-feast/src/styles.css)
- Serverless / API
  - api/send-order.ts — serverless endpoint for submitting orders and emailing via Resend (C:/Users/HP/jan-s-frozen-feast/api/send-order.ts)

How the app works — runtime flow (user -> UI -> API)
---------------------------------------------------
1. Client loads the app (index.html -> src/main.tsx) and TanStack Router initializes via getRouter() (src/router.tsx).
2. Route components live under src/routes/ and are composed by the generated route tree (src/routeTree.gen.ts). The top-level root route (src/routes/__root.tsx) provides a QueryClient and shared layout (Navbar, Footer, Toasts).
3. Product data is static, shipped inside the app at src/data/products.ts. There is no remote product API; routes read directly from this module.
4. When a user adds items to the cart, the zustand store (src/store/cart.ts) updates and persists to localStorage (key: "jans-cart"). The UI reads/reacts to that store.
5. Checkout page collects customer info in a form and, on submit, POSTs JSON to /api/send-order.
6. The serverless endpoint (api/send-order.ts) validates the POST and then either:
   - Uses the Resend API (if RESEND_API_KEY present in environment) to send a plain text email to COMPANY_EMAIL (or default orders@jansfrozenfood.com), or
   - Logs the order body to console if RESEND_API_KEY is not configured.
7. The endpoint returns an orderId (JFF-<timestamp-ish>) and the client shows a success screen. There is no further server-side order persistence.

Data flow summary (text diagram)
User -> Browser -> React app (routes/components) -> local state (zustand persisted) -> Checkout POST -> api/send-order.ts -> (Resend email OR server log) -> Client success flow

What's implemented (detailed)
- Full client SPA with routes: home, products, product detail, categories, cart, checkout, contact, about, FAQ, deals, franchise, testimonials.
- Product listing, filters, search, sorting, product card components.
- Cart management (add, set quantity, remove, clear, subtotal calculation) with local persistence.
- Checkout form with client-side validation (required fields) and a POST to serverless email endpoint.
- Serverless order handler that constructs a plaintext order email and attempts to call resend.com when env var is present.
- UI polish: Tailwind-based styles, iconography, toasts, mobile responsive layout, sticky order summary on checkout.

What's missing / incomplete (gaps and risks)
- No persistent backend database or admin/order dashboard: orders are not stored in a DB.
- No authentication or user accounts.
- No payment integration — only Cash-On-Delivery flow is provided.
- The api/send-order.ts expects environment variables for Resend (RESEND_API_KEY) to actually email orders; if not set the order is only logged.
- No automated tests discovered.
- No error-reporting or retry logic for the email sending beyond console.error.

Environment variables
- RESEND_API_KEY (optional): API key for resend.com to actually send order emails. If not present, the endpoint will print orders to the server log.
- COMPANY_EMAIL (optional): Destination email for order notifications. Defaults to orders@jansfrozenfood.com.

Local development (how to run)
1. Ensure Node.js (recommended 18+) and npm are installed.
2. Install dependencies:
   npm install
3. Run dev server:
   npm run dev
4. Open http://localhost:5173 (or the port Vite prints) to view the app.
5. The cart persists in browser localStorage. To test order submission locally:
   - Start the dev server which also serves the api/ folder endpoints with Vite's dev server if configured for it, or deploy to a Vercel/local server that supports serverless functions.
   - If using Resend to actually send emails, set RESEND_API_KEY and COMPANY_EMAIL in your environment before running.

Notes on running serverless API locally
- Vite dev server does not automatically emulate Vercel serverless functions. To test api/send-order.ts locally you can:
  - Deploy to Vercel (recommended) and use the generated deployment preview; or
  - Create a small local Node/Express adapter that imports the logic from api/send-order.ts and exposes /api/send-order for local testing; or
  - Use a Vercel CLI or other Function runner that supports @vercel/node handlers.

Build & deployment
- Build: npm run build -> writes production files to dist/
- Preview: npm run preview
- Recommended deployment target: Vercel (supports static site + serverless functions), Netlify (with small adjustments), or any static hosting plus a serverless/email backend.
- When deploying to Vercel, place api/send-order.ts in the /api folder (already present) and configured environment variables in the Vercel project settings.

Recommended next steps / roadmap
1. Add a persistent order storage (database) and an admin dashboard to list and manage orders. Example stack: PostgreSQL + Next.js API routes or serverless functions.
2. Add payment integration (Stripe) for online card payments and order confirmation flow.
3. Add automated tests (unit + integration) for critical flows (cart arithmetic, checkout validation, API request/response handling).
4. Add rate-limiting and server-side validation on the order endpoint to reduce spam and protect endpoints.
5. Add email templates (HTML) and SMS/WhatsApp integrations for better notifications.
6. Add CI (GitHub Actions) for linting and test runs.
7. Consider moving product data to a headless CMS or a small DB for dynamic content updates.

Notes for maintainers
- The router uses a generated route tree. Do not edit src/routeTree.gen.ts — instead edit files under src/routes and let the route generator update the tree.
- Cart persistence key: "jans-cart" (in src/store/cart.ts)
- Order endpoint behavior (send vs log) controlled by RESEND_API_KEY (in api/send-order.ts)

How to contact/where to start reading code
- Start: src/main.tsx -> src/router.tsx -> src/routes/__root.tsx (layout) -> src/routes/index.tsx (home) -> src/routes/products.tsx and src/data/products.ts for core product flows.

License & authorship
- No license file detected. Add an appropriate LICENSE.md if you need to publish or share this project.

If you'd like, next actions I can take
- Create a short architecture diagram or sequence diagram text for README.
- Implement a simple local adapter for the api/send-order.ts so you can test the endpoint under Vite dev.
- Add CI linting and a basic test to validate the cart arithmetic.

(Assistant identity) Note: I'm an AI assistant using Copilot CLI runtime in VS Code and can continue exploring or making edits if you want changes to this README or code changes next.
