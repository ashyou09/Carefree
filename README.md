# Carefree — 30-Day Skin & Gut Plan

A mobile-first web app for a 30-day skin and gut routine: today's checklist, night-by-night serum schedule,
product tracker with Amazon links, veg/egg food plan, diary and a 30-day progress tracker.
Data is saved in MongoDB Atlas and syncs across devices.

**Stack:** Next.js 15 (App Router) · MongoDB Atlas · bcrypt password hashing · JWT in an httpOnly cookie (30 days) · Vercel

## Features
- Login / sign-up. Passwords are hashed with bcrypt; the session cookie keeps you logged in for 30 days.
- First account (`manorama`) is created automatically on first run from `SEED_*` env vars.
- **Today:** Day X of 30, morning steps, tonight's routine (changes automatically by week and weekday), food & habit ticks, diary, reaction flag. Go back to fill missed days.
- **Routine:** 4-week night schedule, face packs, golden rules.
- **Products:** 10 products with Amazon links; mark Bought / Using / Running low / Finished.
- **Food:** meal plan with veg or egg options, drinks, low-BP care.
- **Progress:** 30-day heat-map tracker, streak, average skin feel, diary notes.
- Live sync: saves instantly and refreshes every 15 s and whenever the app is reopened, so a phone and laptop stay in step.
- Settings: change start date, change password, log out. Dark mode follows the phone.

## Run locally
```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev                  # http://localhost:3000
```

## Deploy on Vercel
1. **MongoDB Atlas**
   - *Database Access* → Add a database user (username + strong password, role "Read and write to any database").
   - *Network Access* → Add IP Address → `0.0.0.0/0` (Vercel uses changing IPs).
   - *Database* → Connect → Drivers → copy the `mongodb+srv://…` string and put your user's password in it.
2. **Vercel** → Add New Project → import this GitHub repo.
3. In *Environment Variables* add:
   | Name | Value |
   |---|---|
   | `MONGODB_URI` | your connection string |
   | `MONGODB_DB` | `skinplan` |
   | `AUTH_SECRET` | output of `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
   | `SEED_USERNAME` | `manorama` |
   | `SEED_NAME` | `Manorama` |
   | `SEED_PASSWORD` | the first password |
4. Deploy. Open the site and log in.

## Data model
- `users`: `{ username (unique), name, passwordHash, startDate, productStatus, createdAt }`
- `logs`: `{ userId, date (YYYY-MM-DD, unique per user), checks{}, rating, note, reaction, updatedAt }`

## Notes
- After the first login, change the starter password from **Settings → Change password**.
- This is general wellness guidance, not medical advice.
