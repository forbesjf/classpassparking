# Deploying SpotPass

SpotPass runs on **Vercel** (Next.js hosting) with a **Neon** serverless
**PostgreSQL** database. The whole thing fits comfortably in both services'
free tiers.

The flow: create the database → load the schema and seed data → deploy the app
with two environment variables.

---

## 1. Create a Postgres database (Neon)

1. Sign up at [neon.tech](https://neon.tech) and create a project (pick a region
   near your users).
2. In the project dashboard, open **Connection Details** and copy the
   **pooled** connection string. It looks like:

   ```
   postgresql://USER:PASSWORD@ep-xxxx-pooler.REGION.aws.neon.tech/neondb?sslmode=require
   ```

   Use the **pooled** host (it contains `-pooler`) — serverless functions open
   many short-lived connections, and the pooler handles that.

## 2. Load the schema and seed data

From your local checkout, point `DATABASE_URL` at Neon and push the schema:

```bash
# one-off: run against Neon instead of your local database
export DATABASE_URL="postgresql://USER:PASSWORD@ep-xxxx-pooler.REGION.aws.neon.tech/neondb?sslmode=require"

npm install
npm run db:push     # create the tables
npm run db:seed     # load plans, garages, and the demo accounts
```

> This one-time step creates the tables and demo data in your cloud database.
> You can re-run `npm run db:seed` any time (it's idempotent).

## 3. Deploy to Vercel

1. Push this repo to GitHub (already done: `forbesjf/classpassparking`).
2. At [vercel.com/new](https://vercel.com/new), **import** the repository.
   Vercel auto-detects Next.js — no build settings to change. (`npm run build`
   runs `prisma generate` before `next build`.)
3. Before deploying, add **Environment Variables** (Project → Settings →
   Environment Variables), for all environments:

   | Name           | Value                                                        |
   | -------------- | ------------------------------------------------------------ |
   | `DATABASE_URL` | your Neon **pooled** connection string (from step 1)         |
   | `AUTH_SECRET`  | a long random string — generate with `openssl rand -hex 32`  |

4. Click **Deploy**. When it finishes you'll get a public URL like
   `https://spotpass.vercel.app`.

That's it — visit the URL and log in with `demo@spotpass.app` /
`password123` (or the operator account).

---

## Use your Squarespace domain

You can't host this app on Squarespace itself (it only runs Squarespace-built
sites), but if you registered a domain there you can point it at your Vercel
deployment so the app lives at `yourname.com`.

1. **Deploy to Vercel first** (steps above) so you have a working
   `…vercel.app` URL.
2. In **Vercel** → Project → **Settings → Domains**, add your domain — enter
   both `yourname.com` and `www.yourname.com`. Vercel shows the exact DNS
   records it wants.
3. In **Squarespace** → **Settings → Domains** → click your domain →
   **DNS Settings** (Custom Records), add:

   | Type  | Host   | Value                    |
   | ----- | ------ | ------------------------ |
   | A     | `@`    | `76.76.21.21`            |
   | CNAME | `www`  | `cname.vercel-dns.com`   |

   > Use the exact values Vercel displays — they can differ per project. If
   > Squarespace already has conflicting `A`/`CNAME` records for `@` or `www`
   > (from a Squarespace site), remove or replace them.
4. Back in Vercel, wait for the domain to verify (DNS can take minutes to a few
   hours). Vercel then issues an HTTPS certificate automatically.

That's it — your SpotPass deployment is now served from your own domain.

> Domain forwarding (Squarespace's "point to an external URL" option) is **not**
> a good fit here — it redirects and can break paths and HTTPS. Use the DNS
> records above instead.

---

## Notes & tips

- **Every push auto-deploys.** Once connected, Vercel builds and deploys each
  push to the default branch (and gives preview URLs for PRs).
- **Schema changes:** after editing `prisma/schema.prisma`, re-run
  `npm run db:push` against `DATABASE_URL=<Neon URL>` (step 2). For a real
  product you'd switch to versioned migrations (`prisma migrate`).
- **Security for a real launch:** the credit "checkout" is a demo (no real
  payments), and passwords are the only auth factor. Rotate `AUTH_SECRET`,
  add rate limiting, and integrate a real payment provider before handling
  actual users or money.
- **Other hosts:** any platform that runs a Node.js server and reaches a
  Postgres database works (Render, Railway, Fly.io). Set the same two env
  vars and use that platform's Postgres add-on for `DATABASE_URL`.
