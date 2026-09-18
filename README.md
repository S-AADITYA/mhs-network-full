# MHS Network

A Next.js app that turns one content tree — brands, services, locations and
categories — into thousands of unique, SEO-ready pages, with an admin dashboard
for editing that content and working the leads those pages bring in.

Currently **3,112 pages across 4 brands**.

## How pages are generated

Every page is one combination:

```
service  ×  category  ×  location     ->  /ads/ad-film-production-d2c-brands-mumbai/
service  ×  location                  ->  /kitchen/wedding-catering-hsr-layout/
```

Which shape a brand uses is set by its `pattern` (`service_niche_city` or
`service_city`). Add a service or a location and every combination for it comes
into existence — you grow the *data*, not the pages.

The slug shape lives in one place, [`lib/data/combos.ts`](lib/data/combos.ts).
Changing it changes every indexed URL, so treat it as fixed.

## Routes

| Route | What it is |
| --- | --- |
| `/` | Network home, links to each brand |
| `/[brand]/` | Brand landing page |
| `/[brand]/services/` | Every service, linked to every location |
| `/[brand]/cities/` | Every location, linked to every service |
| `/[brand]/[slug]/` | The generated page — the thing that ranks |
| `/[brand]/sitemap.xml` | Per-brand sitemap, using that brand's own domain |
| `/[brand]/robots.txt` | Per-brand robots |
| `/admin/` | Dashboard (auth required) |

Pages are prerendered at build time and revalidate hourly, so content edits
appear without a redeploy. Rows added later render on first request.

## Content lives in two places

The app reads content from **Supabase** when it is configured, and falls back to
[`data/config.json`](data/config.json) when it is not. Both produce the same
shape, so pages never branch on the source. The fallback means the public site
keeps working even if the database is unreachable.

Set `CONTENT_SOURCE=config` to force the fallback.

## Setup

```bash
npm install
cp .env.example .env.local   # fill in Supabase, or leave it out to use config.json
npm run dev
```

### Connecting Supabase

1. Create a Supabase project.
2. Run [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql)
   in the SQL editor.
3. Put the project URL and keys in `.env.local` (see `.env.example`).
4. Seed the content tree from `config.json`:

   ```bash
   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npm run seed
   ```

   The seed upserts on `(brand_key, slug)`, so it is safe to re-run.
5. Create an admin user in Supabase Auth (Authentication → Users → Add user).
   Anyone who can sign in can edit content and read leads, so only add people
   who should have that.

## Leads

The form on every page posts to `/api/leads`, which validates and inserts using
the service key. `leads` has RLS on with no select policy for `anon`, so leads
are never readable from the browser — only through the authenticated admin.

`/admin/leads` lists, filters, searches and re-statuses them, and
`/api/leads/export` returns CSV (formula-injection escaped, auth required).

Without Supabase the endpoint returns 503 and the form says so, rather than
silently dropping a lead.

## Admin

`middleware.ts` gates `/admin/*` on a Supabase session and closes the area
entirely when Supabase is not configured. Content edits write through server
actions that re-check the session, then revalidate the affected brand's pages.

## Scaling and the rule that matters

Google penalises mass-produced pages that add no real value ("scaled content
abuse"). What keeps these pages legitimate is that each one pulls real,
specific content: the service's own detail, a locally-varied paragraph built
from the location's attributes, and service-specific FAQs.

The `note` field on a location is the strongest signal — it replaces the
generated paragraph entirely. Never leave it generic, and start with 50–100
strong pages rather than dumping thousands of thin ones.

## Project layout

```
app/[brand]/[slug]/   the generated page
app/admin/            dashboard, leads, content editors
lib/data/             content providers (Supabase + config.json) and slug logic
lib/supabase/         browser, server and service-role clients
supabase/migrations/  schema
scripts/seed.mjs      config.json -> Supabase
data/config.json      seed content (built by build_config.py)
```
