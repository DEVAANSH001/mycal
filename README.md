# MyCal (Cal.com-style Scheduling App)

MyCal is a full-stack scheduling app where hosts can publish event links and guests can book time slots.

## What is currently implemented

- User authentication (register / login / demo login) with JWT — demo credentials: `devaanshdubey2211@gmail.com` / `demo123`
- Event type management (create, update, delete, activate/deactivate)
- Weekly availability with multiple slots per day
- Date overrides (block a date or set custom hours)
- Global buffer time applied to all event types
- Public profile and public booking pages
- Slot generation with conflict prevention and timezone handling
- Booking management (upcoming/past/cancelled)
- Cancel and reschedule flows with email notifications
- Demo seed user and demo login UI button


## Tech Stack

### Frontend
- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- Lucide React

### Backend
- Node.js + Express 5
- PostgreSQL (Neon compatible)
- Drizzle ORM + Drizzle Kit
- JWT + bcryptjs
- Resend (transactional emails)

---

## Monorepo Structure

```text
mycal/
├─ backend/
│  ├─ drizzle.config.js
│  ├─ package.json
│  └─ src/
│     ├─ index.js
│     ├─ seed.js
│     ├─ controllers/
│     ├─ database/
│     ├─ middleware/
│     ├─ routes/
│     └─ lib/
└─ frontend/
	 ├─ package.json
	 └─ src/
			├─ app/
			├─ components/
			├─ context/
			└─ lib/
```

---

## Environment Variables

### Backend (`backend/.env`)

```env
PORT=5000
DATABASE_URL=postgresql://...
JWT_SECRET=your_jwt_secret

# Email (Resend)
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=MyCal <onboarding@resend.dev>
# Optional fallback supported in code:
FROM_EMAIL=MyCal <onboarding@resend.dev>

# Optional demo user selector for auth.controller demoLogin helper
DEMO_USER_EMAIL=devaanshdubey2211@gmail.com
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## Local Setup

### 1) Prerequisites
- Node.js 18+
- PostgreSQL database (Neon or local)

### 2) Backend

```bash
cd backend
npm install
npm run db:push
npm run dev
```

Backend runs on `http://localhost:5000` by default.

### 3) Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`.

### 4) Optional seed data

```bash
cd backend
npm run seed
```

Creates demo user:
- Email: `devaanshdubey2211@gmail.com`
- Password: `demo123`
- Username: `demo`

---

## Scripts

### Backend scripts
- `npm run dev` → start API with watch mode (`tsx watch src/index.js`)
- `npm run start` → start API (`node src/index.js`)
- `npm run seed` → insert demo user + sample event types + weekday availability
- `npm run db:push` → push schema to DB
- `npm run db:generate` → generate migrations
- `npm run db:migrate` → run migrations
- `npm run db:studio` → open Drizzle Studio

### Frontend scripts
- `npm run dev` → start Next.js dev server
- `npm run build` → production build
- `npm run start` → run production build
- `npm run lint` → run ESLint

---

## Backend Architecture

### Entry and middleware
- `backend/src/index.js`
	- Enables `cors({ origin: true, credentials: true })`
	- Parses JSON via `express.json()`
	- Mounts all API route groups
	- Health endpoint: `GET /health`

- `backend/src/middleware/auth.middleware.js`
	- Expects `Authorization: Bearer <token>`
	- Verifies JWT with `JWT_SECRET`
	- Injects `req.user`

### Database schema (Drizzle)
- `users`
- `event_types`
- `availability`
- `date_overrides`
- `bookings`
- enum: `booking_status` = `upcoming | cancelled | completed`

Defined in: `backend/src/database/schema.js`

---

## API Routes

Base URL: `http://localhost:5000`

### Auth (`/api/auth`)
- `POST /register`
- `POST /login`
- `GET /me` (protected)

### Event Types (`/api/event-types`) — protected
- `GET /`
- `POST /`
- `PUT /:id`
- `DELETE /:id`

### Availability (`/api/availability`) — protected
- `GET /`
- `POST /`
- `GET /overrides`
- `POST /overrides`
- `DELETE /overrides/:id`
- `GET /buffer-time`
- `POST /buffer-time`

### Bookings (`/api/bookings`) — protected
- `GET /?filter=upcoming|past|cancelled`
- `PATCH /:id/cancel`
- `PATCH /:id/reschedule`

### Public (`/api/public`)
- `GET /:username`
- `GET /:username/:slug`
- `GET /:username/:slug/available-days?month=YYYY-MM`
- `GET /:username/:slug/slots?date=YYYY-MM-DD&tz=IANA_TZ`
- `POST /:username/:slug/book`

---

## Frontend Architecture

### Core app routing
- Landing page: `frontend/src/app/page.tsx`
- Auth pages:
	- `frontend/src/app/(auth)/login/page.tsx`
	- `frontend/src/app/(auth)/signup/page.tsx`
- Public pages:
	- `frontend/src/app/[username]/page.tsx`
	- `frontend/src/app/[username]/[slug]/page.tsx`
	- `frontend/src/app/[username]/[slug]/confirmed/page.tsx`
- Dashboard pages:
	- `frontend/src/app/dashboard/page.tsx` (event types)
	- `frontend/src/app/dashboard/availability/page.tsx`
	- `frontend/src/app/dashboard/bookings/page.tsx`

### Auth/session flow
- `frontend/src/context/AuthContext.tsx`
	- Stores token and user in `localStorage`
	- Provides `login`, `register`, `logout`
	- Redirects to dashboard after auth

### API utility
- `frontend/src/lib/api.ts`
	- Uses `NEXT_PUBLIC_API_URL`
	- Automatically adds JWT Authorization header if token exists

---

## Booking Logic (How slots are calculated)

Implemented in `backend/src/controllers/public.controller.js`:

1. Resolve host by `username` and event type by `slug`
2. Check date override for selected date
	 - blocked day => no slots
	 - custom override hours => use override window
3. Else use weekly availability rows for day-of-week
4. Generate slots by `duration + bufferTime`
5. Query existing upcoming bookings on same date
6. Remove overlapping slots (double-booking protection)
7. Remove past slots using host timezone + visitor timezone context
8. Return slot list and host timezone

On booking creation (`POST /book`):
- validates conflicts again
- inserts booking with status `upcoming`
- generates Jitsi link
- sends confirmation/notification emails asynchronously

---

## Email Notifications

Implemented in `backend/src/lib/emails.js` using Resend:

- Booker confirmation email (new booking)
- Host notification email (new booking)
- Cancellation emails (booker + host)
- Reschedule emails (booker + host)

---

## Important implementation note

- The app currently generates **Jitsi** links (`https://meet.jit.si/...`) for meetings.

---

## Quick Manual Test Checklist

1. Register a new user
2. Create at least one event type
3. Set weekly availability
4. Open public link (`/{username}/{slug}`)
5. Book a slot with a second email
6. Verify booking appears in dashboard
7. Cancel or reschedule and verify email notifications

---

