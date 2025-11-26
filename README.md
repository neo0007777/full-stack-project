## Auth Portal (Separated Frontend & Backend)

Clean login/signup experience backed by Node/Express, MongoDB, and JWT. The repo now exposes two clear entry points so you can reason about each layer independently:

- `backend/` → API server (Express, MongoDB, JWT).
- `frontend/` → Static UI (HTML/CSS/JS).

### Backend Setup (`backend/`)

1. Install dependencies
   ```
   cd backend
   npm install
   ```
2. Configure environment
   ```
   cp .env.example .env
   ```
   Edit `.env` with:
   - `MONGODB_URI` → your database connection string.
   - `JWT_SECRET` → long random secret.
   - `PORT` *(optional)* → defaults to `4000`.
   - `CLIENT_ORIGINS` *(optional)* → comma-separated list of allowed browser origins. Leave blank to allow all (useful during development).
3. Start MongoDB locally (e.g., `mongodb-community` via Homebrew or Docker) or point `MONGODB_URI` to Atlas/another host.
   - If you skip this step, the server now spins up an **in-memory MongoDB** for local testing, but that data disappears when the process stops.
4. Run the server
   ```
   npm run dev   # nodemon autoreload
   # or
   npm start
   ```
   The API is available at `http://localhost:4000` by default. Root path (`/`) responds with a status JSON; all functional routes live under `/api/auth/*`.

#### API Reference

| Method | Path               | Description                                    |
| ------ | ------------------ | ---------------------------------------------- |
| POST   | `/api/auth/signup` | Create account, returns `{ token, user }`      |
| POST   | `/api/auth/login`  | Validate credentials, returns `{ token, user }`|
| GET    | `/api/auth/me`     | Validate JWT (in `Authorization: Bearer ...`)  |
| POST   | `/api/auth/logout` | Stateless helper to invalidate tokens client-side |

### Frontend Setup (`frontend/`)

This is a lightweight static site. You can open `index.html` directly in a browser or serve it:

```
cd frontend
npx serve .
# or use VS Code / Cursor "Live Server"
```

The script assumes `http://localhost:4000` for the API. If you host the backend elsewhere, define `window.API_BASE_URL` before loading `app.js` or edit the constant at the top of the file.

### Flow Notes

- The page opens on the login form with signup directly below.
- When a JWT already exists in `localStorage`, any new sign-in attempt shows an alert and surfaces the success panel immediately.
- Successful signup/login persists the token, fetches the profile via `/api/auth/me`, and swaps to the success state with logout controls.

# full-stack-project
