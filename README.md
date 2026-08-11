# SpotPass 🅿️

**One membership. Every garage in the city.**

SpotPass is a ClassPass-style subscription marketplace for parking. Members
get a monthly bundle of **credits** and spend them to book guaranteed spots
across a network of partner garages — no per-lot apps, no meters, no circling
the block.

This is a full-stack demo app built with the Next.js App Router.

---

## Features

- 🔎 **Explore** — browse the garage network on a live, interactive map with
  search, sorting (price / availability / distance), and amenity filters.
- 🅿️ **Garage detail** — hours, amenities, per-hour credit pricing, and live
  availability.
- 💳 **Credit-based booking** — reserve a spot for a chosen date/duration;
  credits are deducted atomically and a spot is held.
- 📊 **Dashboard** — credit balance, current plan, upcoming/active bookings
  with **check-in / check-out / cancel** actions, booking history, and a
  credit-activity ledger.
- 🎟️ **Membership tiers** — Pay As You Go, Starter, Commuter, and All-Access,
  each granting monthly credits. Switch plans anytime.
- 🔐 **Auth** — email/password accounts with JWT session cookies. New members
  get 40 welcome credits.

## Tech stack

| Layer     | Choice                                  |
| --------- | --------------------------------------- |
| Framework | Next.js 14 (App Router) + TypeScript    |
| Styling   | Tailwind CSS                            |
| Database  | SQLite via Prisma ORM                   |
| Auth      | `jose` (JWT) + `bcryptjs`, httpOnly cookie |
| Validation| Zod                                     |

The interactive map is a dependency-free SVG projection of each garage's
latitude/longitude — no external map tiles required.

## Getting started

```bash
npm install          # install dependencies (also runs `prisma generate`)
npm run db:push      # create the SQLite database from the schema
npm run db:seed      # load membership plans, 12 garages, and a demo user
npm run dev          # start the dev server at http://localhost:3000
```

Or reset the database to a clean seeded state at any time:

```bash
npm run db:reset
```

### Demo account

```
email:    demo@spotpass.app
password: password123
```

The demo user is on the **Commuter** plan with 300 credits.

## Environment

Copy `.env.example` to `.env` (the setup script does this automatically):

```bash
cp .env.example .env
```

```
DATABASE_URL="file:./dev.db"
AUTH_SECRET="<a long random string>"
```

> Replace `AUTH_SECRET` with a strong random value before deploying.

## Project structure

```
prisma/
  schema.prisma        # User, Plan, Garage, Booking, CreditTransaction
  seed.ts              # plans, garages, demo user
src/
  app/
    page.tsx           # landing
    explore/           # map + list of garages
    garage/[slug]/     # garage detail + booking
    dashboard/         # bookings, credits, activity
    membership/        # plans + FAQ
    login/ register/   # auth pages
    api/
      auth/            # register / login / logout
      bookings/        # create booking + PATCH actions
      membership/      # change plan
  components/          # UI (Navbar, GarageCard, CityMap, BookingForm, …)
  lib/                 # db, auth, garages, formatting helpers
```

## How credits work

Every garage has a per-hour credit rate. Booking `hours` at a garage costs
`creditsPerHour × hours`. Bookings, cancellations (with refund), and plan
changes are all recorded as `CreditTransaction` rows, so the dashboard ledger
always reconciles with the balance.

---

_A demo application — not a real parking service._
