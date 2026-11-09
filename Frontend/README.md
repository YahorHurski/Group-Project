# Frontend Client — Online Store Management

> Modern Single Page Application (SPA) built with **React 19**, **Vite**, and **Tailwind CSS v4**.

[![React](https://img.shields.io/badge/React-19.2-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF.svg)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38bdf8.svg)](https://tailwindcss.com/)
[![Oxlint](https://img.shields.io/badge/Oxlint-1.8-orange.svg)](https://oxc.rs/)

---

## 📖 Overview

The Frontend client provides an intuitive, responsive user interface for the Online Store Management application. It delivers a fast shopping experience for regular customers (catalog browsing, real-time cart manipulation, order placement) and a dashboard interface for administrators (product and category CRUD, order management).

---

## 🏛️ Architecture & Modules

The frontend follows a modular, feature-oriented React architecture:

* **`components/`:** Reusable presentational components (buttons, modal windows, navigation bar, cards, inputs).
* **`pages/`:** View-level components representing distinct application routes (Catalog, ProductDetails, Cart, Checkout, Login, Admin).
* **`services/`:** API abstraction layer responsible for HTTP requests (using `fetch` or `axios`) to the ASP.NET Core backend.
* **`context/`:** Global state providers using React Context (e.g., `AuthContext` for JWT authentication and user roles, `CartContext` for shopping cart state).
* **`hooks/`:** Custom React hooks encapsulating business logic (e.g., `useAuth`, `useCart`).
* **`utils/`:** Pure helper functions (currency formatting, date formatters, validation utilities).

---

## 📁 Project Structure

```
Frontend/
├── public/                         # Static public assets
│   ├── favicon.svg                 # Application favicon
│   └── icons.svg                   # SVG icon sprites
├── src/                            # Application source code
│   ├── assets/                     # Media files and images
│   ├── components/                 # Reusable UI components
│   ├── context/                    # State context providers
│   ├── hooks/                      # Custom React hooks
│   ├── pages/                      # Page components
│   ├── services/                   # API client and HTTP services
│   ├── utils/                      # Helper utilities and formatters
│   ├── App.jsx                     # Root component: login / admin panel switch
│   ├── index.css                   # Global styles and Tailwind CSS
│   └── main.jsx                    # Application DOM entry
├── index.html                      # HTML template
├── package.json                    # Dependencies and scripts
├── vite.config.js                  # Bundler configuration
└── .oxlintrc.json                  # Linter configuration
```

---

## 🛠️ Admin Panel (basic)

After signing in as an administrator, the app shows an admin panel with two tabs:

* **Products** — list, create, edit and delete products (name, description, price, stock, category).
* **Categories** — list, create, rename and delete categories.

Non-admin users see an "access denied" message. The JWT is kept in `localStorage` and restored on reload (`src/context/AuthContext.jsx`); all HTTP calls go through `src/services/api.js`, which also turns API validation/conflict errors into readable messages.

During development, Vite proxies `/api` to the backend (`http://localhost:5007` by default, override with the `VITE_API_PROXY_TARGET` environment variable), so no CORS configuration is needed. Run the backend first (`docker compose up -d db`, then `dotnet run` in `Backend/`) and sign in with the seeded development admin described in the backend README.

---

## 📦 Key Dependencies

| Dependency | Purpose |
|---|---|
| `react` & `react-dom` | Core React library for building user interfaces |
| `tailwindcss` | Utility-first CSS framework for responsive styling |
| `@tailwindcss/vite` | Official Vite plugin for Tailwind CSS v4 compilation |
| `vite` | Next-generation frontend build tool and dev server |
| `@vitejs/plugin-react` | Official Vite plugin providing React Fast Refresh and JSX support |
| `oxlint` | High-performance JavaScript/JSX linter |

---

## 🚀 Getting Started

### Prerequisites
* [Node.js](https://nodejs.org/) (version 20 LTS or higher recommended)
* Running ASP.NET Core Backend API

### Installation & Run

1. Navigate to the `Frontend` directory:
   ```bash
   cd Frontend
   ```

2. Install all dependencies:
   ```bash
   npm install
   ```

3. Start the local development server:
   ```bash
   npm run dev
   ```

4. Open your browser at the displayed local URL (typically `http://localhost:5173`).

---

## 🛠️ Available Scripts

In the `Frontend` directory, you can run:

| Command | Description |
|---|---|
| `npm run dev` | Starts the development server with Hot Module Replacement (HMR) |
| `npm run build` | Compiles and optimizes assets for production into the `dist/` folder |
| `npm run preview` | Locally serves the production build for verification |
| `npm run lint` | Runs Oxlint to analyze code quality and potential issues |

---

## 🎨 Styling with Tailwind CSS

Tailwind CSS v4 is directly integrated via `@tailwindcss/vite` in `vite.config.js` and imported in `src/index.css`:

```css
@import "tailwindcss";
```

All Tailwind utility classes (`flex`, `grid`, `text-center`, `bg-indigo-600`, `hover:...`, `dark:...`) are available across all `.jsx` files without additional configuration.
