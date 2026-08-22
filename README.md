# PV Holidays – Industrial Visit Feedback System

A production-ready feedback collection system for PV Holidays to gather student feedback after Industrial Visits and College Tours.

## Features

- 📱 **Mobile-First Feedback Form** – 4-step form optimized for smartphones
- ⭐ **Interactive Star Ratings** – Touch-friendly 1–5 star controls for 8 categories
- 📊 **NPS Scoring** – Net Promoter Score calculation with promoter/passive/detractor breakdown
- 🔐 **Admin Authentication** – JWT-based secure admin access
- 📈 **Analytics Dashboard** – Real-time charts with Recharts
- 📄 **PDF Reports** – Professional PDF generation from live PostgreSQL data
- 📥 **CSV Export** – Download all feedback as CSV
- 🔲 **QR Code Generation** – Per-trip QR codes that link to feedback URLs
- 🛡️ **Duplicate Prevention** – Unique constraint on trip + student prevents re-submission
- ✅ **Email Validation** – Required email field with format validation

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, TypeScript) |
| Styling | Tailwind CSS v4 |
| ORM | Prisma v7 |
| Database | PostgreSQL (Neon) |
| Auth | JWT with jose |
| Charts | Recharts |
| QR Code | qrcode |
| PDF | jsPDF + jspdf-autotable |
| Icons | Lucide React |
| Deployment | Vercel |

## Project Structure

```
pv-holidays-feedback/
├── app/
│   ├── page.tsx                    # Home page
│   ├── feedback/[code]/page.tsx    # Student feedback form
│   ├── admin/
│   │   ├── login/page.tsx          # Admin login
│   │   ├── page.tsx                # Dashboard
│   │   ├── trips/page.tsx          # Trips list
│   │   ├── trips/new/page.tsx      # Create trip
│   │   ├── trips/[id]/page.tsx     # Trip detail + QR
│   │   ├── feedback/page.tsx       # Feedback table
│   │   └── analytics/page.tsx      # Analytics charts
│   └── api/
│       ├── health/route.ts
│       ├── trips/[code]/route.ts
│       ├── feedback/[code]/verify/route.ts
│       ├── feedback/[code]/submit/route.ts
│       ├── admin/login/route.ts
│       ├── admin/trips/route.ts
│       ├── admin/trips/[id]/route.ts
│       ├── admin/feedback/route.ts
│       ├── admin/analytics/route.ts
│       ├── admin/export/route.ts
│       └── reports/trips/[id]/pdf/route.ts
├── components/
│   └── ui/
│       ├── StarRating.tsx
│       ├── NPSSelector.tsx
│       └── MultiSelect.tsx
├── lib/
│   ├── prisma.ts     # Prisma v7 singleton with pg adapter
│   ├── auth.ts       # JWT authentication
│   ├── pdf.ts        # jsPDF report generation
│   └── utils.ts      # Shared utilities
├── prisma/
│   ├── schema.prisma  # Database schema
│   └── seed.ts        # Demo data seed
├── middleware.ts       # Edge middleware for auth protection
├── prisma.config.ts    # Prisma v7 configuration
└── .env.example        # Environment variables template
```

## Local Setup

### Prerequisites

- Node.js 18+
- PostgreSQL database (Neon recommended)

### 1. Clone & Install

```bash
git clone <repo-url>
cd pv-holidays-feedback
npm install
```

### 2. Environment Variables

Copy and configure:

```bash
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL=postgresql://username:password@host:5432/database?sslmode=require
ADMIN_EMAIL=admin@pvholidays.com
ADMIN_PASSWORD=your-secure-password
JWT_SECRET=your-jwt-secret-at-least-32-chars
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database Setup

```bash
# Push schema to database
npx prisma db push

# Generate Prisma client
npx prisma generate

# Seed with demo data
npx prisma db seed
```

### 4. Development Server

```bash
npm run dev
```

Open http://localhost:3000

## Demo Data

After seeding, the following demo data is available:

| | |
|---|---|
| **Feedback URL** | http://localhost:3000/feedback/KOCHI2026 |
| **Admin Login** | http://localhost:3000/admin |
| **Admin Email** | admin@pvholidays.com |
| **Admin Password** | pvadmin2024 |
| **Sample Roll Numbers** | 2024CSE01, 2024ECE02, 2024MECH03 |

## Key URLs

| URL | Description |
|-----|-------------|
| `/` | Home page |
| `/feedback/KOCHI2026` | Student feedback form |
| `/admin` | Admin dashboard |
| `/admin/login` | Admin login |
| `/admin/trips` | Trips management |
| `/admin/feedback` | Feedback table |
| `/admin/analytics` | Analytics charts |

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/trips/[code]` | Get trip by feedback code |
| POST | `/api/feedback/[code]/verify` | Verify roll number |
| POST | `/api/feedback/[code]/submit` | Submit feedback |
| POST | `/api/admin/login` | Admin login |
| GET | `/api/admin/trips` | List all trips |
| POST | `/api/admin/trips` | Create trip |
| GET | `/api/admin/trips/[id]` | Get trip details |
| PUT | `/api/admin/trips/[id]` | Update trip |
| DELETE | `/api/admin/trips/[id]` | Delete trip |
| GET | `/api/admin/feedback` | List feedback |
| GET | `/api/admin/analytics` | Analytics data |
| GET | `/api/admin/export` | CSV export |
| GET | `/api/reports/trips/[id]/pdf` | PDF report |

## PDF Reports

Click **Download Final Feedback Report** on:
- Trip detail page → PDF Report button
- Admin Dashboard → row download icon
- Analytics page → PDF Report button (when trip selected)

PDF includes:
- Trip information
- Summary statistics (students, responses, response rate)
- Average ratings for all 8 categories
- NPS breakdown (promoters/passives/detractors)
- What students liked most
- Improvement areas
- Learning from Industrial Visit responses
- Student comments
- Approved testimonials

## Vercel Deployment

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial deploy"
git push origin main
```

### 2. Deploy to Vercel

1. Import repository in [Vercel Dashboard](https://vercel.com)
2. Add environment variables in Vercel → Settings → Environment Variables
3. Deploy

### Environment Variables for Vercel

| Key | Value |
|-----|-------|
| `DATABASE_URL` | Your Neon PostgreSQL URL |
| `ADMIN_EMAIL` | Your admin email |
| `ADMIN_PASSWORD` | Secure admin password |
| `JWT_SECRET` | Random 64-char string |
| `NEXT_PUBLIC_APP_URL` | Your Vercel URL (e.g. https://pv-holidays.vercel.app) |

### 3. Post-Deploy

After deploying, run schema push from local:

```bash
# Push schema to production database
npx prisma db push

# Seed production data (optional - only for demo)
npx prisma db seed
```

## Troubleshooting

### PrismaClientInitializationError

In Prisma v7, a driver adapter is required. Ensure `lib/prisma.ts` uses `PrismaPg`:

```typescript
import { PrismaPg } from '@prisma/adapter-pg'
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })
```

### PDF Generation Fails

PDF requires actual feedback data. If "No feedback submitted", submit at least one feedback first.

### Admin Login Fails

Check `.env` values for `ADMIN_EMAIL` and `ADMIN_PASSWORD`. Default credentials:
- Email: `admin@pvholidays.com`
- Password: `pvadmin2024`

### QR Code Not Generating

Ensure `NEXT_PUBLIC_APP_URL` is set to your production URL for correct QR links.

## Production Commands

```bash
npm run build    # Build for production
npm run start    # Start production server
npx prisma db push    # Push schema changes
npx prisma db seed    # Re-seed data
npx prisma studio     # Open Prisma Studio
```

---

**PV Holidays** · Chennai, India · Industrial Visit Feedback System
