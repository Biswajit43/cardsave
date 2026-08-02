# Batua — v2.0

A polished v2.0 upgrade: password manager at its core, with dedicated vaults for cards, UPI
IDs, and gift vouchers — all sensitive data gated behind your login password before it's
ever revealed. Premium fintech visual identity (deep navy + gold), Framer Motion throughout,
Ctrl+K global search, and a real MongoDB-backed API.

```
Batua/
├── backend/     Node.js + Express + MongoDB (Mongoose) REST API
└── frontend/    React (Vite) + Tailwind CSS SPA
```

## Tech stack

**Frontend:** React.js (Vite), React Router DOM, Tailwind CSS, Axios, React Hook Form,
Context API, Framer Motion, lucide-react icons, `qrcode` for UPI QR generation.

**Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT authentication, bcryptjs, Multer, dotenv.

## What's new in v2.0

- **Password vault** — the primary vault type: site, username, password, notes, favicon,
  password-strength badge on entry, secure reveal on view.
- **Secure reveal, everywhere** — full card numbers/CVVs, voucher codes/PINs, and saved
  passwords are hidden by default (`select: false` in Mongoose) and only appear after you
  re-enter your **existing login password** (no second password system). Revealed data
  auto-hides again after 30 seconds with a live countdown.
- **Auto-detect** — card network (Visa/Mastercard/RuPay/Amex) from the card number, and UPI
  provider (GPay/PhonePe/Paytm/BHIM) from the handle.
- **UPI QR codes** — generated client-side from the UPI ID, with copy / download PNG / share.
- **Dashboard** — total passwords, cards, UPI IDs, vouchers, and a recently-added feed
  (`GET /api/dashboard/summary`).
- **Global search (Ctrl+K / Cmd+K)** — searches passwords, cards, UPI IDs, and vouchers at once.
- **Favorites**, **undo-delete** (10s toast), copy-with-animation, smooth page transitions —
  all via Framer Motion.
- Merged **Vault** screen (Passwords / Cards / UPI / Vouchers as one segmented control) plus
  **Activity** (expenses) and **Profile** (account, backup/export, log out).

## 1. Prerequisites

- Node.js 18+
- A MongoDB database — either:
  - Local: `mongodb://127.0.0.1:27017/Batua` (install MongoDB Community Server), or
  - Free cloud instance: [MongoDB Atlas](https://www.mongodb.com/atlas) — copy the connection string.

## 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env`:

```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/Batua
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=30d
CLIENT_ORIGIN=http://localhost:5173
```

Run it:

```bash
npm run dev      # nodemon, auto-restarts on change
# or
npm start        # plain node
```

The API boots on `http://localhost:5000`. Check `http://localhost:5000/api/health` for a
`{ status: "ok" }` response once MongoDB is connected.

## 3. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env
```

`frontend/.env`:

```
VITE_API_URL=http://localhost:5000/api
```

Run it:

```bash
npm run dev
```

Open `http://localhost:5173`. Production build (`npm run build`) has been verified clean.

## 4. First run

1. Start MongoDB (local service or Atlas cluster reachable from `MONGO_URI`).
2. Start the backend (`npm run dev` in `backend/`).
3. Start the frontend (`npm run dev` in `frontend/`).
4. Sign up — you'll land on the Home dashboard.
5. Try the Vault tab (Passwords / Cards / UPI / Vouchers), tap an item to open its detail
   sheet, and tap **Reveal** to see the secure-reveal flow in action (it asks for your login
   password, then shows the sensitive fields for 30 seconds).
6. Press **Ctrl+K** (or **Cmd+K** on Mac) anywhere in the app to search everything at once.

## API reference

All routes except `/auth/register|login` require `Authorization: Bearer <token>`.

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Sign in |
| GET  | `/api/auth/me` | Current user + card count |
| PUT  | `/api/auth/profile` | Update name/vault name/theme/telegram |
| PUT  | `/api/auth/password` | Change password |
| POST | `/api/auth/verify-password` | Re-check login password (used by secure reveal) |
| GET/POST | `/api/cards` | List (search/type filter, sensitive fields excluded) / create card |
| PUT/DELETE | `/api/cards/:id` | Update / delete card |
| POST | `/api/cards/:id/reveal` | Password-gated: full card number, CVV, holder |
| GET/POST | `/api/upi` | List (app filter) / create UPI ID (auto-detects provider) |
| PUT/DELETE | `/api/upi/:id` | Update / delete UPI ID |
| GET/POST | `/api/vouchers` | List + summary (code/PIN excluded) / create voucher |
| POST | `/api/vouchers/:id/reveal` | Password-gated: code, PIN |
| POST | `/api/vouchers/:id/redeem` | Redeem an amount from a voucher |
| PUT/DELETE | `/api/vouchers/:id` | Update / delete voucher |
| GET/POST | `/api/passwords` | List (password excluded) / create entry |
| POST | `/api/passwords/:id/reveal` | Password-gated: the stored password |
| PUT/DELETE | `/api/passwords/:id` | Update / delete entry |
| GET/POST | `/api/expenses` | List (tab filter) / create expense |
| GET | `/api/expenses/summary` | Today/month totals + top merchant |
| PUT/DELETE | `/api/expenses/:id` | Update / delete expense |
| GET | `/api/dashboard/summary` | Counts across all vaults + recently added |
| GET | `/api/backup/export` | Full JSON backup (all vaults, including passwords) |
| POST | `/api/backup/import` | Restore from a JSON backup |

## Deployment

- **Backend**: deploy `backend/` to any Node host (Render, Railway, Fly.io, EC2…) with the
  env vars above set; point `MONGO_URI` at Atlas in production.
- **Frontend**: `npm run build` in `frontend/` produces a static `dist/` folder — deploy to
  Vercel, Netlify, or any static host, with `VITE_API_URL` set to your deployed backend URL.
- Update `CLIENT_ORIGIN` on the backend to your deployed frontend's URL for CORS.

## Known follow-ups (not yet done)

- Loading skeletons are not implemented (basic empty states only).
- "Favorite" and "pinned" were unified into a single star toggle for scope reasons.
- Recurring-expense detection is schema-ready (`isRecurring`) but not yet surfaced in the UI
  beyond the existing Recurring tab filter.

