#!/usr/bin/env python3
"""
MHS Network Page Engine
-----------------------
One config -> unique SEO pages for every brand, every service, every city
(and every niche where you use that dimension), plus a sitemap per brand.
ALL leads and ALL traffic flow back to ONE place.

USE
  1. Edit data/config.json (add services, cities, niches to any brand).
  2. Set lead_endpoint and ga4_id at the top of config.json.
  3. Run:  python3 generate.py
  4. Upload each folder in output/ to that brand's domain.
  Add a row -> run again -> the page exists. That's "type it and it goes live".

Pure Python 3. No internet or libraries needed.
"""
import json, html, os, shutil
from datetime import date

ROOT = os.path.dirname(__file__)
CFG  = json.load(open(os.path.join(ROOT, "data", "config.json"), encoding="utf-8"))
OUT  = os.path.join(ROOT, "output")

LEAD_ENDPOINT = CFG["lead_endpoint"]
GA4           = CFG.get("ga4_id", "")
NETWORK       = CFG["network_name"]

def esc(s): return html.escape(str(s), quote=True)

def city_context(brand, svc, city):
    """Build a locally-varied paragraph from real city attributes so no two
    city pages read the same. Falls back to a plain note if attributes absent."""
    if city.get("note"):
        return city["note"]
    kf = city.get("known_for", ""); region = city.get("region", ""); tier = city.get("tier", "")
    name = city["name"]; sname = svc["short"]
    # rotate sentence shape by a stable hash so structure varies across cities
    i = sum(ord(c) for c in city["slug"]) % 4
    shapes = [
        f"{name} is {kf}, and we run {sname} for brands across {region} from a team that knows the market here.",
        f"For {sname} in {name}, being {kf} means the audience and the competition are different from anywhere else, and we plan for that.",
        f"We serve {name}, {kf}, across {region}. That local read is what keeps a {name} campaign from looking generic.",
        f"Brands in {name} benefit from its position as {kf}. Our {sname} is tailored to what actually works in this {tier} market.",
    ]
    return shapes[i]

def ga():
    if not GA4: return ""
    return (f'<script async src="https://www.googletagmanager.com/gtag/js?id={GA4}"></script>'
            f'<script>window.dataLayer=window.dataLayer||[];function gtag(){{dataLayer.push(arguments)}}'
            f'gtag("js",new Date());gtag("config","{GA4}");</script>')

CSS = """
:root{{--ink:#141b1e;--ink2:#465055;--line:#e6ebe9;--bg:#f8faf9;--card:#fff;--accent:{accent};--radius:14px}}
*{{box-sizing:border-box}}body{{margin:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif;color:var(--ink);background:var(--bg);line-height:1.62;-webkit-font-smoothing:antialiased}}
a{{color:var(--accent)}}.wrap{{max-width:840px;margin:0 auto;padding:0 22px}}
header.top{{border-bottom:1px solid var(--line);background:var(--card)}}
header.top .wrap{{display:flex;align-items:center;justify-content:space-between;padding:15px 22px}}
.brand{{font-weight:800;font-size:1.1rem;color:var(--ink);text-decoration:none}}
.callbtn{{background:var(--accent);color:#fff;text-decoration:none;padding:9px 16px;border-radius:999px;font-weight:600;font-size:.9rem}}
.hero{{padding:50px 0 28px}}.eyebrow{{font-size:.78rem;font-weight:700;letter-spacing:.09em;text-transform:uppercase;color:var(--accent);margin:0 0 12px}}
h1{{font-size:2rem;line-height:1.16;margin:0 0 14px;font-weight:800;letter-spacing:-.01em}}
.lead{{font-size:1.1rem;color:var(--ink2);margin:0 0 20px}}
.meta{{font-size:.92rem;color:var(--ink2)}}.meta b{{color:var(--ink)}}
section{{padding:28px 0;border-top:1px solid var(--line)}}h2{{font-size:1.35rem;margin:0 0 14px}}
ul.check{{list-style:none;padding:0;margin:0;display:grid;gap:10px}}
ul.check li{{padding-left:28px;position:relative}}
ul.check li:before{{content:"";position:absolute;left:0;top:.55em;width:13px;height:7px;border-left:2.5px solid var(--accent);border-bottom:2.5px solid var(--accent);transform:rotate(-45deg)}}
.card{{background:var(--card);border:1px solid var(--line);border-radius:var(--radius);padding:20px 22px}}
.faq details{{border-bottom:1px solid var(--line);padding:13px 0}}.faq summary{{cursor:pointer;font-weight:650;list-style:none}}
.faq summary::-webkit-details-marker{{display:none}}.faq summary:before{{content:"+";color:var(--accent);font-weight:800;margin-right:10px}}
.faq details[open] summary:before{{content:"–"}}.faq p{{margin:10px 0 2px;color:var(--ink2)}}
form{{background:var(--card);border:1px solid var(--line);border-radius:var(--radius);padding:22px}}
label{{display:block;font-weight:600;font-size:.9rem;margin:14px 0 6px}}
input,textarea{{width:100%;padding:11px 13px;border:1px solid var(--line);border-radius:10px;font-size:1rem;font-family:inherit}}
button.submit{{margin-top:18px;background:var(--accent);color:#fff;border:0;padding:13px 22px;border-radius:999px;font-weight:700;font-size:1rem;cursor:pointer}}
footer{{padding:30px 0;color:var(--ink2);font-size:.85rem;border-top:1px solid var(--line);background:var(--card)}}
footer a{{color:var(--ink2)}}.net{{margin-top:12px}}.net a{{margin-right:14px;white-space:nowrap}}
@media(max-width:560px){{h1{{font-size:1.6rem}}.hero{{padding:34px 0 20px}}}}
@media(prefers-reduced-motion:reduce){{*{{scroll-behavior:auto}}}}
"""

def page(brand, svc, city, niche, others):
    accent = brand["accent"]; bname = brand["name"]; domain = brand["domain"]; phone = brand["phone"]
    niche_part = f" for {niche['name']}" if niche else ""
    niche_line = f" {niche['line']}" if niche else ""
    slug = "-".join([svc["slug"]] + ([niche["slug"]] if niche else []) + [city["slug"]])
    url  = f"{domain}/{slug}/"
    title = f"{svc['name']}{niche_part} in {city['name']} | {bname}"
    desc  = f"{svc['short'].capitalize()}{niche_line} in {city['name']}, {city['region']}. {svc['intro'][:100]}".strip()

    checks = "".join(f"<li>{esc(x)}</li>" for x in svc["includes"])
    faq_html, faq_ld = "", []
    for f in svc["faqs"]:
        faq_html += f"<details><summary>{esc(f['q'])}</summary><p>{esc(f['a'])}</p></details>"
        faq_ld.append({"@type":"Question","name":f["q"],"acceptedAnswer":{"@type":"Answer","text":f["a"]}})
    price = "" if svc["from"] == "quote" else f'<span>From <b>&#8377;{esc(svc["from"])}</b></span>'

    # network links (the legitimate "connected" part)
    net = ""
    if others:
        net = '<div class="net">Part of ' + esc(NETWORK) + ': ' + \
              " ".join(f'<a href="{o["domain"]}">{esc(o["name"])}</a>' for o in others) + '</div>'

    schema = {"@context":"https://schema.org","@type":"Service",
              "name":f"{svc['name']}{niche_part} in {city['name']}",
              "areaServed":city["name"],"provider":{"@type":"LocalBusiness","name":bname},"description":desc}
    faq_block = ('<script type="application/ld+json">'+json.dumps({"@context":"https://schema.org","@type":"FAQPage","mainEntity":faq_ld})+'</script>') if faq_ld else ""

    css = CSS.format(accent=accent)
    return slug, url, f"""<!DOCTYPE html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{esc(title)}</title><meta name="description" content="{esc(desc)}">
<link rel="canonical" href="{url}">
<meta property="og:title" content="{esc(title)}"><meta property="og:description" content="{esc(desc)}"><meta property="og:url" content="{url}">
<script type="application/ld+json">{json.dumps(schema)}</script>{faq_block}
<style>{css}</style>{ga()}</head><body>
<header class="top"><div class="wrap">
<a class="brand" href="{domain}">{esc(bname)}</a>
<a class="callbtn" href="tel:{phone}">Call {esc(phone)}</a></div></header>
<main class="wrap">
<div class="hero">
<p class="eyebrow">{esc(city['name'])} &middot; {esc(city['region'])}</p>
<h1>{esc(svc['name'])}{esc(niche_part)} in {esc(city['name'])}</h1>
<p class="lead">{esc(svc['hero'])}. {esc(svc['intro'])}</p>
<div class="meta">{price}</div>
</div>
<section><h2>What's included</h2><ul class="check">{checks}</ul></section>
<section><h2>Why it matters</h2><p style="color:var(--ink2)">{esc(svc['why'])}</p>
<div class="card" style="margin-top:14px">{esc(city_context(brand, svc, city))}</div></section>
<section class="faq"><h2>Questions people ask</h2>{faq_html}</section>
<section id="book"><h2>Get {esc(svc['name'].lower())} in {esc(city['name'])}</h2>
<p style="color:var(--ink2)">Tell us what you need — we reply within the hour during working hours.</p>
<form action="{LEAD_ENDPOINT}" method="POST">
<input type="hidden" name="brand" value="{esc(bname)}">
<input type="hidden" name="service" value="{esc(svc['name'])}">
<input type="hidden" name="city" value="{esc(city['name'])}">
<input type="hidden" name="source_url" value="{url}">
<label>Your name<input name="name" required></label>
<label>Phone<input name="phone" type="tel" required></label>
<label>What do you need?<textarea name="message" rows="3"></textarea></label>
<button class="submit" type="submit">Request a callback</button></form></section>
</main>
<footer><div class="wrap">{esc(bname)} &middot; {esc(svc['name'])} in {esc(city['name'])}, {esc(city['region'])}.
Call <a href="tel:{phone}">{esc(phone)}</a>{net}</div></footer>
</body></html>"""

def build():
    if os.path.isdir(OUT): shutil.rmtree(OUT)
    os.makedirs(OUT)
    brands = CFG["brands"]
    total = 0; per_brand = []
    for b in brands:
        others = [o for o in brands if o["key"] != b["key"]]
        bdir = os.path.join(OUT, b["key"]); os.makedirs(bdir, exist_ok=True)
        urls = []
        use_niche = b.get("pattern") == "service_niche_city" and b.get("niches")
        niches = b["niches"] if use_niche else [None]
        for svc in b["services"]:
            for niche in niches:
                for city in b["cities"]:
                    slug, url, htmlpage = page(b, svc, city, niche, others)
                    fdir = os.path.join(bdir, slug); os.makedirs(fdir, exist_ok=True)
                    open(os.path.join(fdir, "index.html"), "w", encoding="utf-8").write(htmlpage)
                    urls.append(url)
        # per-brand sitemap + robots
        today = date.today().isoformat()
        sm = ['<?xml version="1.0" encoding="UTF-8"?>','<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
        sm += [f"  <url><loc>{u}</loc><lastmod>{today}</lastmod></url>" for u in urls]
        sm.append("</urlset>")
        open(os.path.join(bdir, "sitemap.xml"), "w", encoding="utf-8").write("\n".join(sm))
        open(os.path.join(bdir, "robots.txt"), "w", encoding="utf-8").write(
            f'User-agent: *\nAllow: /\nSitemap: {b["domain"]}/sitemap.xml\n')
        per_brand.append((b["name"], len(urls))); total += len(urls)
    # network index (for you)
    rows = "".join(f"<li><b>{esc(n)}</b>: {c} pages</li>" for n, c in per_brand)
    open(os.path.join(OUT, "index.html"), "w", encoding="utf-8").write(
        f"<!DOCTYPE html><meta charset=utf-8><title>{esc(NETWORK)}</title>"
        f"<style>body{{font-family:sans-serif;max-width:640px;margin:40px auto;padding:0 20px}}</style>"
        f"<h1>{esc(NETWORK)}</h1><p><b>{total} pages</b> generated across {len(brands)} brands.</p><ul>{rows}</ul>")
    return total, per_brand

if __name__ == "__main__":
    total, pb = build()
    print(f"{NETWORK}: {total} pages across {len(pb)} brands")
    for n, c in pb: print(f"  {n:24s} {c:4d} pages")
    print("\nOutput in output/<brand>/ . Add rows to data/config.json and re-run to scale.")
