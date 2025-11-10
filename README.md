# Notux One

**Notux One** is a full-stack notes workspace that couples a secure Express.js API with a modern React + Vite frontend. It gives authenticated users notebooks, sections, and freeform A4 pages with draggable rich-text blocks, wrapped in a glassmorphism-inspired theme.

Repository: [Sugarcube08/LoginPageUsingReact-N-ExpressAPI](https://github.com/Sugarcube08/LoginPageUsingReact-N-ExpressAPI)

---

## 🚧 Project Status

Active development. Core flows are usable, but new notebook and editor capabilities are landing frequently.

---

## ✨ Highlights

### Backend (`API/`)
- Express 4 server with Helmet, CORS, cookie parsing, and centralized error handling @API/app.js#1-48
- JWT authentication + bcrypt-backed credential flow exposing login, signup, profile, password, and notebook resources @API/controllers/apiController.js#5-195 @API/middleware/auth.js#1-42
- Hierarchical notebook domain (Notebooks → Sections → Pages → Blocks) with dedicated controllers/services and MongoDB persistence @API/routes/notebook.js#1-40 @API/models/Notebooks.js#1-10 @API/models/Pages.js#1-55 @API/models/Blocks.js#1-65
- Response helper and pagination-aware services for consistent API payloads @API/services/notebookService.js#1-92 @API/services/responseService.js#1-9

### Frontend (`Client/`)
- React 19 + Vite 7 + TypeScript app styled with Tailwind 4 and custom gradient theme @Client/package.json#1-62 @Client/src/index.css#1-153
- Router-driven layouts (Theme, Auth, User) with toast notifications and protected routing @Client/src/routes/web.tsx#1-33 @Client/src/components/Theme.tsx#1-78 @Client/src/layouts/UserLayout.tsx
- Notebook explorer with dialogs, context menus, renaming/deleting flows, and section-aware navigation @Client/src/views/users/Notebooks/Notebooks.tsx#1-309
- A4 canvas editor featuring draggable/resizable blocks, inline formatting, and autosized content panes per page @Client/src/views/users/Notebooks/Editor.tsx#1-400

---

## 🧱 Repository Layout

```text
.
├── API/       # Express.js REST API + MongoDB models
├── Client/    # React + Vite frontend
└── PlanOfAction.md
```

| Path | Purpose |
| --- | --- |
| `API/controllers/` | Auth + notebook controllers orchestrating services and responses |
| `API/services/` | Database access, pagination, title helpers, and reusable response builder |
| `API/routes/` | REST endpoints for auth, user profile, notebooks, sections, pages, and blocks |
| `Client/src/views/` | Page-level React components (public auth flows, user dashboards, notebooks) |
| `Client/src/components/` | Cross-cutting UI (buttons, dialogs, PageCard, Theme shell) |
| `Client/src/services/ApiService.ts` | Axios wrapper with token persistence and error handling |

---

## 🧭 Domain Overview

- **Authentication** – Users sign up, log in, and manage profiles with JWT-secured requests @API/controllers/apiController.js#29-195
- **Notebooks** – CRUD endpoints scoped to the authenticated user; notebooks own sections and pages @API/controllers/notebookController.js#5-92
- **Sections & Pages** – Optional section grouping and automatic title generation keep hierarchies tidy @API/controllers/sectionController.js#1-104 @API/controllers/pageController.js#1-109 @API/services/pageTitleService.js#1-82
- **Blocks** – Freeform text blocks live on pages with draggable coordinates and dimensions @API/controllers/blockController.js @API/models/Blocks.js#1-65
- **Editor UI** – The client renders notebooks, sections, and pages, providing dialogs for CRUD and an interactive canvas for block editing @Client/src/views/users/Notebooks/Notebook.tsx#1-873 @Client/src/views/users/Notebooks/Editor.tsx#1-400

---

## 🛠️ Tech Stack

| Layer | Tech |
| --- | --- |
| Backend | Node.js 18+, Express 4, MongoDB, Mongoose, JWT, bcrypt |
| Frontend | React 19, React Router 7, TypeScript, Tailwind CSS 4, Radix UI primitives, Sonner toasts |
| Tooling | Vite 7, ESLint 9, TypeScript 5.9 |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (npm installed)
- MongoDB instance (local or hosted)

### 1. Clone the repo

```bash
git clone https://github.com/Sugarcube08/LoginPageUsingReact-N-ExpressAPI.git
cd LoginPageUsingReact-N-ExpressAPI
```

### 2. Configure environment variables

| Location | Keys |
| --- | --- |
| `API/.env` | `MONGO_URI=<mongodb-connection-string>`<br>`APP_KEY=<jwt-secret>` |
| `Client/.env` | `VITE_API_URL=http://localhost:3000` |

Ensure the API port exported by `API/bin/www` matches the URL in `VITE_API_URL`.

### 3. Install dependencies & run services

```bash
# Backend
cd API
npm install
npm start

# (Optional) seed notebooks/users once a seeder is added

# Frontend (in a second shell)
cd ../Client
npm install
npm run dev
```

Frontend defaults to http://localhost:5173 and proxies API requests to `VITE_API_URL` via the shared Axios instance @Client/src/services/ApiService.ts#1-160.

---

## 📜 Useful Scripts

| Location | Command | Description |
| --- | --- | --- |
| `API/` | `npm start` | Run the Express API (uses `bin/www`) |
| `Client/` | `npm run dev` | Start Vite development server |
| `Client/` | `npm run build` | Type-check then build production assets |
| `Client/` | `npm run preview` | Preview the production build |
| `Client/` | `npm run lint` | Lint the frontend codebase |

---

## 🔌 Selected API Routes

| Method | Route | Description |
| --- | --- | --- |
| `POST` | `/login` | Log in and receive a JWT bearer token |
| `POST` | `/signup` | Register a new user |
| `GET` | `/users/dashboard` | List users with pagination & search |
| `GET` | `/users/notebook` | List notebooks for the current user |
| `POST` | `/users/notebook` | Create a notebook |
| `PUT` | `/users/notebook/:notebookId` | Rename/update notebook metadata |
| `DELETE` | `/users/notebook/:notebookId` | Delete a notebook |
| `POST` | `/users/notebook/:notebookId/section` | Create a section inside a notebook |
| `POST` | `/users/notebook/:notebookId/page` | Create a page (optionally within a section) |
| `GET` | `/users/notebook/:notebookId/page/:pageId` | Fetch page blocks |
| `POST` | `/users/notebook/:notebookId/page/:pageId/block` | Create a block on the page |
| `PUT` | `/users/notebook/:notebookId/page/:pageId/block/:blockId` | Update block content/position |

Paginated services return `data` and `meta` payloads that describe total counts and page cursors for easier table integrations @API/services/apiServices.js#1-137 @API/services/notebookService.js#1-92.

---

## 🎨 Frontend Experience

- **Theme shell** provides gradient background, glass cards, and toast stack @Client/src/components/Theme.tsx#1-78
- **Landing page** introduces the workspace and funnels to auth flows @Client/src/views/public/Home.tsx
- **Auth forms** integrate with the API service and toast errors on failure @Client/src/views/public/Login.tsx @Client/src/views/public/Signup.tsx
- **Notebook hub** offers multi-column layouts, dialogs for CRUD, and context menus for rename/delete operations @Client/src/views/users/Notebooks/Notebooks.tsx#1-309
- **Editor** lets users double-click to create blocks, drag to reposition, and auto-resizes text content @Client/src/views/users/Notebooks/Editor.tsx#1-400

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/amazing-idea`)
3. Commit with clear messages
4. Open a pull request describing motivation, scope, and testing

Bug reports, feature suggestions, and documentation improvements are always welcome!

---

## 📜 License

License information is currently unspecified. Adopt MIT, Apache-2.0, or another OSI-approved license before production launch.

---

## ☕ Support & Socials

[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-Support%20Me-orange?style=flat-square&logo=buy-me-a-coffee)](https://www.buymeacoffee.com/sugarcube08)

[![YouTube Banner](https://img.shields.io/badge/YouTube-%23FF0000.svg?logo=YouTube&logoColor=white)](https://www.youtube.com/@SugarCode-Z?sub_confirmation=1)
[![Instagram Banner](https://img.shields.io/badge/Instagram-%23E4405F.svg?logo=Instagram&logoColor=white)](https://www.instagram.com/sugarcodez)
[![WhatsApp Banner](https://img.shields.io/badge/WhatsApp-%25D366.svg?logo=whatsapp&logoColor=white)](https://whatsapp.com/channel/0029Vb5fFdzKgsNlaxFmhg1T)

---

Built with ❤️ by [SugarCube](https://github.com/Sugarcube08).

