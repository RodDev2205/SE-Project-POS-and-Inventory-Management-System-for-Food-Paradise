# Copilot / AI Agent Instructions for POS and Inventory System

This repository contains a Node.js/Express backend (MySQL) and a React + Vite frontend. The notes below are focused on actionable, project-specific guidance so an AI agent can be immediately productive.

**Architecture & Big Picture**
- Backend: `backend/server.js` boots an Express `app` (see `backend/src/app.js`) and attaches Socket.IO via `backend/src/socket/chatSocket.js`.
- Frontend: `web-app/frontend` is a Vite + React app that communicates with the backend via REST and Socket.IO (`socket.io-client`).
- Database: MySQL accessed with `mysql2` (see `backend/src/config/db.js`). Many controllers use `db.execute` or `db.query` directly.
- Auth: JWT-based. Tokens contain `{ user_id, role_id, branch_id }` and are validated in `backend/src/middlewares/verifyToken.js`. Role gating is done via `requireRole.js`.

**Developer workflows & important commands**
- Run backend in dev: from `backend/` run `npm run dev` (nodemon -> `server.js`).
- Run frontend in dev: from `web-app/frontend/` run `npm run dev` (Vite).
- Production start backend: from `backend/` run `npm start`.
- Common ports: backend default `PORT=5200`; Socket.IO and APIs use the same server.

**Project-specific patterns & gotchas**
- Mixed ESM and CJS: repository is ESM (`"type": "module"`) but some print utilities are CommonJS (`*.cjs`). See dynamic import pattern in `backend/src/app.js` where print modules are imported with `await import('../usb-test-print.cjs')`.
- Auth headers: APIs expect `Authorization: Bearer <token>`; sockets send token in `socket.handshake.auth.token` and are verified in `chatSocket.js`.
- Role IDs: numeric codes are used (examples: `2` = Admin, `3` = SuperAdmin). Many route protections use `requireRole(2, 3)` or role checks inside sockets/controllers.
- Branch scoping: Admins (role 2) are restricted to their `branch_id`. Controllers and sockets enforce this—follow their checks when making changes (see `chatSocket.js` and `chatController.js`).
- DB usage: controllers frequently use parameterized SQL strings and `db.execute`/`db.query`. Preserve the parameter order and error logging style (they log DB errors with `console.error` and return 500 JSON responses).

**Key files to reference for examples**
- `backend/server.js` — server + Socket.IO wiring.
- `backend/src/app.js` — central Express app and route registration.
- `backend/src/socket/chatSocket.js` — socket auth, branch rooms, message flows, and message status handling.
- `backend/src/controllers/*` — patterns for DB usage, response shapes, and error handling. Example: `inventoryController.js` (`addIngredient`) shows how `req.user.branch_id` is used and how `total_servings` is calculated before INSERT.
- `backend/src/middlewares/verifyToken.js` and `requireRole.js` — token parsing and role authorization.
- `backend/src/config/db.js` — DB connection pool (use this for DB queries).
- `usb-test-print.cjs` / `print.cjs` — printer integrations use native/CJS modules; prefer dynamic imports.

**Behavioral guidance for code edits**
- Preserve JWT semantics: do not change token payload fields unless updating all auth consumers (backend, sockets, frontend).
- When modifying role checks, update both HTTP routes and socket authorization logic to avoid privilege mismatches.
- Keep ESM module style; when a CJS interop is required, use `await import()` as in `app.js`.
- Follow existing error response shapes: typically `{ message: "..." }` or `{ error: "..." }` with appropriate HTTP status codes.

**Testing & debugging tips**
- Reproduce socket flows with a local frontend or `socket.io-client` scripts; tokens must be valid JWTs signed with `process.env.JWT_SECRET`.
- Use `nodemon` for backend hot reload (`npm run dev`). Backend logs include helpful `console.log` statements (e.g., JWT decoded payload, DB errors, created chat room IDs).

**Environment variables** (discoverable from code)
- `JWT_SECRET` — required for JWT signing/verification.
- `PORT` — server port (defaults to 5200).
- DB credentials are in `backend/src/config/db.js` (read before making changes that touch DB connection).

If anything in this summary is unclear or you want additional examples (e.g., specific controller patterns, SQL schema snippets, or Socket.IO message formats), tell me which area to expand and I will iterate.
