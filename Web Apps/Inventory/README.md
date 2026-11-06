# Inventory

React and Vite frontend for Inventory (KKAQ import and related views).

## Local development

1. Copy `.env.example` to `.env.local`.
2. Set `VITE_API_BASE_URL` to the backend origin used for local development (`http://localhost:5291`).
3. Start ApiGateway and UserService, then run `npm run dev`.

The frontend calls the API origin directly in development so Windows-authenticated requests resolve against the backend instead of going through the Vite dev server.

## Scripts

- `npm run dev` starts the Vite development server.
- `npm run build` creates a production build.
- `npm run preview` serves the production build locally.
- `npm run lint` runs ESLint.
- `npm run run-dev` starts ApiGateway, UserService, and Vite (port 5173).
- `npm run stop-dev` stops the local stack.

## IIS deployment

The production build uses relative API URLs, so when the frontend and API are served from the same IIS site no frontend code change is required.

1. `npm ci` and `npm run build`
2. Copy `dist\*` to `C:\inetpub\Mes\Apps\Inventory\`
3. URL: `http://<server>:8090/apps/inventory/`

Auth uses the same UserService endpoints as Part Master (`/api/userservice/auth-status`, `/api/userservice/login`).
