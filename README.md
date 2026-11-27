# DRIPXEL — The Digital Playground

> Your only limit is you, So Believe in Yourself

An independent creative portfolio and studio for Dripxel.

## Creative direction

Experimental editorial design using graphite, warm ivory, electric cobalt and acid lime. Asymmetric work gallery, expressive typography, abstract motion, scroll reveals and a responsive private studio.

## Technology

- React + TypeScript + Vite
- Custom responsive CSS and animations
- Supabase Authentication
- PostgreSQL and Row Level Security
- Supabase Storage
- Lucide icons

## Local development

After cloning the repository:

```powershell
npm install
Copy-Item .env.example .env.local
```

Configure the Supabase values in `.env.local`, then run:

```powershell
npm run dev
```

Production validation:

```powershell
npm run build
npm run preview
```

## Routes

- `/` — Public portfolio
- `/studio` — Private administrative workspace

The Studio is intentionally not linked in public navigation.

## Studio features

- Owner-only authentication
- Project creation, editing, deletion and publishing
- Homepage content management
- Creator Programs management
- Media uploads and library
- Contact inbox
- Supabase-backed persistent content

## Supabase configuration

See `supabase/README.md`.

For a new Supabase project, apply the migrations in this order:

1. `001_initial_schema.sql`
2. `002_creator_programs.sql`

Do not rerun these migrations on an already configured production database.

Create the owner through Supabase Authentication and register the owner's user UUID in `public.studio_owners`, following the database security policies.

Required environment variables:

```env
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_PUBLISHABLE_OR_ANON_KEY
```

Use `.env.local` locally. Never commit environment credentials or a Supabase service-role key.

## Media and persistence

Project content, Creator Programs and contact messages are stored in Supabase. Uploaded media is stored in the Supabase Storage `media` bucket, not in the Git repository.

## Demo content

The initial project includes sample concept entries for demonstrating the portfolio. Replace them with genuine creative work or clearly label them as concepts before public promotion.

## Cloudflare Pages deployment

Recommended configuration:

- Production branch: `main`
- Framework: Vite
- Build command: `npm run build`
- Build output: `dist`

Configure the Supabase environment variables in Cloudflare Pages. Configure Supabase Authentication redirect URLs for the production domain.

## Production readiness

Complete the remaining functional and security checks before treating the website as fully production-ready, including project gallery testing, media cleanup, inbox controls, contact spam protection, backups, metadata and full deployment verification.