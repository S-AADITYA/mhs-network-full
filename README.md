# MHS Page Engine

A system that turns your data into thousands of unique, SEO-ready pages — and a clear path to scale it to 10,000. You edit data, run one command, and every page is built for you.

## What this is

- **Input:** three data files (`services`, `locations`, `case_studies`).
- **Output:** one unique page per service × location, plus `sitemap.xml` and `robots.txt`.
- **Maths:** 20 services × 500 locations = 10,000 pages. 50 services × 200 locations = 10,000. You reach scale by growing the *data*, not by hand-building pages.

The current sample (3 services × 3 locations) generates 9 pages. It scales the moment you add rows.

## The publish loop ("I type it and it goes live")

1. Open a file in `data/` and add a service or a location.
2. Run `python3 generate.py`.
3. The new pages appear in `output/`.
4. Your host redeploys `output/` (automatic once set up — see Deploy).

That is the whole loop. No page is ever built by hand.

## Setup (one time)

1. Install Python 3 (already on most Macs/Linux; on Windows get it from python.org).
2. Open `generate.py` and set `SITE_URL`, `BRAND`, `PHONE`, `LEAD_EMAIL`, and `GA4_ID`.
3. Run `python3 generate.py`.

## The rule that decides success or failure

Google penalises mass-produced pages that add no real value ("scaled content abuse"). This engine is built to avoid that: every page pulls **real, specific** content — the service's own details, the location's `local_note`, a matching case study, service-specific FAQs.

Your only job is to keep that content genuinely useful. The `local_note` field is the most important one — it's what stops Google seeing your pages as duplicates. Never leave it generic. Write something true about serving that area.

Start with 50–100 strong pages, see what ranks, then scale the winners. Do not dump 10,000 thin pages on day one.

## Deploy (making it live + auto-publish)

Upload the `output/` folder to any static host. Recommended: **Netlify**, **Vercel**, or **Cloudflare Pages** (all have free tiers). To get true auto-publish:

1. Put this whole project in a GitHub repository.
2. Connect the repo to Netlify/Vercel.
3. Set the build command to `python3 generate.py` and the publish directory to `output`.

Now editing a data file and pushing to GitHub rebuilds and publishes automatically. That is the "goes live" part, done properly.

### Vercel + GitHub + Supabase

This repository includes `vercel.json`, so Vercel can build with `python generate.py` and publish `output/` automatically.

Supabase lead capture is scaffolded in `supabase/`. Run `supabase/schema.sql` in the Supabase SQL editor, deploy `supabase/functions/leads`, and set `lead_endpoint` in `data/config.json` to:

```
https://YOUR_PROJECT_REF.supabase.co/functions/v1/leads
```

Set the Edge Function secrets `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in Supabase. Never put the service-role key in this repository or in generated HTML.

## Where the click and lead data is stored

Two separate streams, both flowing back to you:

- **Clicks / sessions / which pages perform:** set `GA4_ID` in `generate.py` to your Google Analytics 4 ID. Every page then reports traffic to one dashboard. (PostHog works the same way if you prefer it.)
- **Leads (people filling the form):** each page has a lead form. Point it at a form backend — the template uses **Formspree** (`YOUR_FORM_ID`), which emails you each lead and stores them. Alternatives that store leads in a database: **Basin**, **Formspark**, or your own endpoint into Airtable / a CRM (HubSpot free tier, Zoho).

So: traffic data lands in GA4, lead data lands in your form backend / CRM. One place for "who's visiting," one for "who wants to buy."

## Ads note

You do **not** need 10,000 pages for ads. Ads need a few strong landing pages that match the ad's promise. Scale (SEO) and ads are separate games — this engine serves SEO; for ads, point campaigns at your best few generated pages.

## Files

```
data/services.json        <- your services (edit)
data/locations.json       <- your locations (edit)
data/case_studies.json    <- your proof (edit)
generate.py               <- the engine (set your settings at the top)
output/                   <- generated site (upload this)
```
