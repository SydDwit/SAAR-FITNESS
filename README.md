# SAAR FITNESS

Next.js 14 + Tailwind + MongoDB membership system.

## Features
- Staff and Admin login (separate databases)
- Add members with photo upload or camera capture
- Auto-BMI, subscription start/end, and status
- Search and sort members
- Expiration checker with optional email notifications
- Admin CRUD for staff and members

## Quick start
```bash
npm i
cp .env.example .env.local
# edit .env.local for Mongo and SMTP
npm run dev
```

Seed a default admin:
```
curl -X POST http://localhost:3000/api/seed
# login: admin@saarfitness.local / admin123
```

## Notes
- Photos are saved to `/public/uploads`. Ensure the folder exists and your host allows writing to disk.
- The expiration check runs when the staff dashboard loads and via POST `/api/subscriptions/check`. Wire this to a cron in production.
- Databases are split:
  - Admin models -> `MONGODB_URI_ADMIN` + `MONGODB_DBNAME_ADMIN`
  - Staff models -> `MONGODB_URI_STAFF` + `MONGODB_DBNAME_STAFF`
  - Members -> `MONGODB_URI_MEMBERS` + `MONGODB_DBNAME_MEMBERS`
