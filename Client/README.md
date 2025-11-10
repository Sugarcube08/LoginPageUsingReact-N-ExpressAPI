# Login Client (React + Vite)

The **Client** package delivers the React interface for the Notux-One project. It pairs a themable dashboard UI with polished authentication flows that talk to the Express API.

---

## ✨ Highlights
- React 19 + Vite 7 bootstrapped with TypeScript and Tailwind 4 (@Client/src/App.tsx#1-28; @Client/index.html#1-28)
- Role-focused layouts (public, auth, user) that drive routing via React Router 7 (@Client/src/routes/web.tsx#1-30; @Client/src/Components/UserLayout.tsx#20-210)
- Axios interceptor with token persistence, automatic auth header attachment, and redirect handling for 401 responses (@Client/src/services/ApiInterceptor.ts#12-87)
- Reusable data table, profile, and settings experiences built with Tailwind utility classes (@Client/src/views/users/Dashboard.tsx#8-104; @Client/src/views/users/UserProfile.tsx#24-421)

---

## 🚀 Quick Start

```bash
cd Client
npm install
npm run dev
```

Access the dev server at the URL printed by Vite (default `http://localhost:5173`). Ensure the API is running and that `VITE_API_URL` points to it.

---

## 🔧 Environment Variables

Create a `.env` file (copy `.env.development` if present):

```
VITE_API_URL=http://localhost:3000
VITE_TIMEOUT=10000    # optional request timeout in ms
```

These values feed the Axios instance that powers API calls (@Client/src/services/ApiInterceptor.ts#12-27).

---

## 📜 NPM Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server with hot module reload |
| `npm run build` | Type-check (`tsc -b`) then build production assets |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint across the codebase with the provided config |

Script definitions live in `package.json` (@Client/package.json#6-23).

---

## 🧭 Routing & Layouts

React Router defines public, auth, and protected user routes in `src/routes/web.tsx`:

- `/` → marketing-style landing page with quick calls to action (@Client/src/views/public/Home.tsx#10-67)
- `/auth/login` and `/auth/signup` → auth flows using themed forms (@Client/src/views/public/Login.tsx#16-195)
- `/user/*` → guarded dashboard, profile, and settings pages, rendered inside `UserLayout` (@Client/src/Components/UserLayout.tsx#20-210)

`App.tsx` wires the router into the component tree and exposes navigation helpers for programmatic redirects (@Client/src/App.tsx#1-28).

---

## 🔐 Authentication Flow

1. Login and signup forms send credentials to the backend via the shared `apiService` helper (@Client/src/services/ApiService.ts#38-73).
2. Successful logins persist the `Bearer` token in `localStorage`, which the Axios interceptor appends to subsequent requests (@Client/src/views/public/Login.tsx#30-41; @Client/src/services/ApiInterceptor.ts#25-36).
3. Protected layouts verify authentication and fetch the active user on mount, redirecting to `/auth/login` if no token is present (@Client/src/Components/UserLayout.tsx#32-55).
4. 401 responses clear stale tokens and push visitors back to the login screen (@Client/src/services/ApiInterceptor.ts#52-84).

---

## 🗂️ Project Structure

```text
src/
├── Components/         # Layouts, navigation, data visualisations
├── context/            # ApiStruct context for table normalisation
├── hooks/              # Theming utilities and shared hooks
├── routes/             # Centralised router definitions
├── services/           # Axios instance + generic API helper
├── utils/              # Navigation bridge helpers
└── views/              # Page-level components (public & user)
```

Key implementations:
- `ApiStructContext` describes response metadata so tables understand how to read pagination (@Client/src/context/ApiStructContext.tsx#1-52)
- `GenericDataTable` consumes the context to render sortable, paginated datasets (@Client/src/Components/GenericDataTable.tsx#1-364)
- `UserProfile` demonstrates optimistic updates against the `/users/user` endpoint (@Client/src/views/users/UserProfile.tsx#137-417)

---

## 🎨 Styling & Theming

Tailwind CSS (v4) powers the design system, with additional CSS tokens defined in `src/index.css`. Theme switching is available inside `UserLayout`, synchronised with `localStorage` for persistence (@Client/src/Components/UserLayout.tsx#21-200).

Global UI patterns—background gradients, glassmorphism, button states—are handled with Tailwind utility classes and a small custom theme hook (`src/hooks/useTheme`).

---

## 🌐 API Integration Patterns

- Use `apiService` for most calls—pass `url`, `method`, `data`, or `body` as needed (@Client/src/services/ApiService.ts#38-73).
- For requests that require manual abort semantics or custom headers, provide them via the `ApiConfig` options.
- Responses return the Axios `.data` payload, so components can destructure API metadata directly (see `Dashboard` for an example table integration @Client/src/views/users/Dashboard.tsx#14-101).

---

## 🛠️ Development Tips
- Run the backend API first to avoid 401/404 errors during development.
- Tailwind classes are purged automatically in production builds; stick to literal class names.
- Store transient UI state in component-level hooks and reserve context for cross-cutting concerns like API metadata.
- Keep tokens in `localStorage` only for this demo—consider rotating tokens or using HTTP-only cookies for production deployments.

---

## ➕ Extending the Frontend
- Add new protected routes by extending `src/routes/web.tsx` and updating the navigation list in `UserLayout`.
- Inject additional columns or filters into the dashboard by customising `GenericDataTable` props.
- Hook into other backend endpoints by composing new helpers in `src/services/` so they benefit from existing interceptors.

---

## 🤝 Contributing

Follow the repository-wide guidelines in the root README. Pull requests that improve UX, accessibility, or developer experience are welcome.

---

## 📜 License

This frontend inherits the license specified at the repository root. Confirm the project license before shipping to production.
