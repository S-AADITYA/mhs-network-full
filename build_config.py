#!/usr/bin/env python3
"""
Authors data/config.json for the whole network. Run once (python3 build_config.py),
then edit config.json directly from then on. Kept as Python so the big dataset is
easy to read and stays valid JSON.
"""
import json, os

# ---- shared city pools (real, pan-India) -----------------------------------
# tier + known_for give each city page genuinely different local context.
METROS = [
    ("bangalore","Bangalore","Karnataka","metro","India's startup and tech capital"),
    ("mumbai","Mumbai","Maharashtra","metro","the country's media, film and finance hub"),
    ("delhi","Delhi","Delhi NCR","metro","the largest D2C and events market in the north"),
    ("hyderabad","Hyderabad","Telangana","metro","a fast-growing tech and pharma centre"),
    ("chennai","Chennai","Tamil Nadu","metro","a manufacturing, auto and film stronghold"),
    ("kolkata","Kolkata","West Bengal","metro","the cultural capital of the east"),
    ("pune","Pune","Maharashtra","metro","a major education, IT and auto hub"),
    ("ahmedabad","Ahmedabad","Gujarat","metro","a fast-rising trade and textile market"),
]
NCR = [
    ("gurgaon","Gurgaon","Delhi NCR","metro","the corporate heart of NCR"),
    ("noida","Noida","Delhi NCR","metro","a media, IT and startup cluster in NCR"),
    ("navi-mumbai","Navi Mumbai","Maharashtra","metro","a planned commercial extension of Mumbai"),
]
TIER2 = [
    ("jaipur","Jaipur","Rajasthan","tier-2","a tourism, handicraft and jewellery hub"),
    ("chandigarh","Chandigarh","Punjab","tier-2","the affluent gateway to the north"),
    ("kochi","Kochi","Kerala","tier-2","the commercial capital of Kerala"),
    ("lucknow","Lucknow","Uttar Pradesh","tier-2","a growing north-Indian consumer market"),
    ("indore","Indore","Madhya Pradesh","tier-2","the fastest-growing city in central India"),
    ("surat","Surat","Gujarat","tier-2","a textile and diamond powerhouse"),
    ("nagpur","Nagpur","Maharashtra","tier-2","the logistics centre of India"),
    ("coimbatore","Coimbatore","Tamil Nadu","tier-2","a textile and engineering hub"),
    ("bhubaneswar","Bhubaneswar","Odisha","tier-2","a rising eastern IT and education city"),
    ("vizag","Visakhapatnam","Andhra Pradesh","tier-2","the port and industrial hub of the south-east"),
    ("bhopal","Bhopal","Madhya Pradesh","tier-2","a steady central-India consumer base"),
    ("guwahati","Guwahati","Assam","tier-2","the commercial gateway to the north-east"),
    ("thiruvananthapuram","Thiruvananthapuram","Kerala","tier-2","Kerala's capital and IT corridor"),
]
PAN_INDIA = METROS + NCR + TIER2          # 24 cities

# ---- brand-specific city sets ----------------------------------------------
KITCHEN_AREAS = [
    ("hsr-layout","HSR Layout","Bangalore","area","a dense residential and startup pocket"),
    ("electronic-city","Electronic City","Bangalore","area","Bangalore's largest IT corridor"),
    ("koramangala","Koramangala","Bangalore","area","a startup and dining hotspot"),
    ("whitefield","Whitefield","Bangalore","area","a major IT and apartment belt"),
    ("sarjapur-road","Sarjapur Road","Bangalore","area","a fast-growing residential corridor"),
    ("indiranagar","Indiranagar","Bangalore","area","an upmarket social and events zone"),
    ("marathahalli","Marathahalli","Bangalore","area","a busy IT and residential junction"),
    ("jp-nagar","JP Nagar","Bangalore","area","an established south-Bangalore neighbourhood"),
    ("bannerghatta-road","Bannerghatta Road","Bangalore","area","a growing corporate and hospital belt"),
    ("kammasandra","Kammasandra","Bangalore","area","our home base near Electronic City"),
]
TFD_CITIES = METROS[:4] + [TIER2[0], TIER2[3], NCR[0]]   # blr, mum, delhi, hyd, jaipur, lucknow, gurgaon

def svc(slug,name,short,hero,intro,includes,why,frm,faqs):
    return {"slug":slug,"name":name,"short":short,"hero":hero,"intro":intro,
            "includes":includes,"why":why,"from":frm,"faqs":faqs}

def city(t): return {"slug":t[0],"name":t[1],"region":t[2],"tier":t[3],"known_for":t[4]}
def q(a,b): return {"q":a,"a":b}

# ============================ MY HAUL STORE =================================
mhs_services = [
 svc("influencer-marketing","Influencer Marketing","influencer marketing campaigns",
   "Reach the right audience through creators they already trust",
   "We match your brand with vetted creators, run the campaign end to end, and report on reach, engagement and conversions rather than vanity numbers.",
   ["Creator shortlisting from a 30,000+ vetted network","Brief, negotiation and content approvals handled for you","Live tracking of reach, engagement and clicks","A clear post-campaign performance report"],
   "Most campaigns get views but no sales because the wrong creators are chosen. Filtering by audience fit first turns spend into measurable results.",
   "25,000",[q("How do you pick the right creators?","We filter by audience demographics and past performance in your category before shortlisting, so reach is relevant reach."),
              q("Do you handle contracts and payments?","Yes. Negotiation, contracting and creator payments are managed by us. You approve the shortlist and the content.")]),
 svc("ugc-content","UGC Content","user-generated content production",
   "Ad-ready UGC that looks native and converts",
   "We produce authentic creator videos built for paid ads and organic feeds, briefed, shot and edited to your hooks and CTAs.",
   ["Concept and hook writing per product","Creator sourcing and shoot management","Ad-ready edits in multiple aspect ratios","Usage rights sorted for paid campaigns"],
   "Polished brand films get skipped while relatable creator content earns attention and lowers ad cost, giving you volume without a full crew each time.",
   "8,000",[q("Do we get rights to run these as paid ads?","Yes. Usage rights are sorted up front so you can run the content as paid ads without extra licensing."),
            q("How many edits per video?","Each video ships in the aspect ratios you need for Meta, YouTube and Shorts, with hook variations on request.")]),
 svc("celebrity-endorsement","Celebrity Endorsement","celebrity endorsement deals",
   "Borrow a trusted face to move a whole market",
   "We identify, negotiate and manage celebrity and macro-creator endorsements that fit your brand and land your message at scale.",
   ["Celebrity and macro-creator shortlisting by brand fit","Commercials, contracts and usage negotiated for you","Shoot and content coordination end to end","Rollout across the celebrity's and your channels"],
   "A well-matched celebrity gives instant credibility and reach for a launch or repositioning that would take months to build organically.",
   "quote",[q("Which celebrities can you work with?","We work across film, sport and top creators, and shortlist by audience fit and budget before approaching anyone."),
            q("Do you handle the legal side?","Yes. Commercials, usage rights and contracts are negotiated and managed for you.")]),
 svc("brand-awareness","Brand Awareness","brand awareness campaigns",
   "Get remembered, not just seen",
   "Multi-creator awareness campaigns that put a consistent message in front of the right audiences across the platforms they use.",
   ["Multi-platform creator mix built to your audience","Consistent messaging across reels, stories and posts","Reach and frequency planned, not left to chance","Awareness lift tracked through the campaign"],
   "Awareness only pays off when it's consistent and targeted. A planned creator mix builds recall instead of scattering one-off posts.",
   "quote",[q("How do you measure awareness?","We track reach, frequency and engaged views, and where possible run before-and-after recall checks."),
            q("Which platforms do you cover?","Instagram, YouTube, Facebook and LinkedIn, chosen by where your audience actually spends time.")]),
 svc("store-visit","Store Visit","influencer store-visit campaigns",
   "Turn footfall into content and content into footfall",
   "Local creators visit your store, shoot authentic content on site and drive their nearby audience through your doors.",
   ["Local creators matched to your store's catchment","On-site content shot during the visit","Location-tagged posts to drive nearby footfall","Coverage across the creator's stories and reels"],
   "Store visits work twice over: you get real in-store content and the creator's local followers get a reason to walk in.",
   "quote",[q("Do you have creators in my city?","We work with local creators across major Indian cities and match them to your store's catchment area."),
            q("What do we need to provide?","Access to the store during the visit and any product or offer you want featured. We handle the rest.")]),
 svc("review-services","Review Services","product review and reputation services",
   "Shape what people read before they buy",
   "Authentic product reviews and reputation work that build trust across the places customers check before purchasing.",
   ["Genuine product reviews from relevant creators","Coverage across video, social and marketplaces","Reputation monitoring and response strategy","Reporting on sentiment and reach"],
   "Buyers check reviews before they trust a brand. Building honest, visible reviews gives new customers the confidence to purchase.",
   "quote",[q("Are the reviews genuine?","Yes. Creators receive the product and give honest reviews. We don't fabricate feedback."),
            q("Do you cover marketplace reviews too?","We focus on creator and social reviews, and advise on marketplace reputation as part of the strategy.")]),
 svc("creative-ads","Creative Ads","creative ad production",
   "Ads built around a hook, not just a logo",
   "Concept-to-delivery ad creatives designed for performance on Meta, YouTube and e-commerce placements.",
   ["Creative concepting and scripting","Studio or on-location production","Performance edits with hook and CTA variations","Deliverables cut for every placement"],
   "Creative is the biggest lever in paid ads. A strong hook and clear CTA cut cost per result more than any bidding change.",
   "quote",[q("Do you make test variations?","Yes. Each concept ships with hook and CTA variations so you can test and scale the winner."),
            q("Can you edit for every placement?","Yes. Every ad is delivered in the aspect ratios and lengths each placement needs.")]),
 svc("influencer-events","Influencer Events & Activation","influencer events and activations",
   "Fill the room and the feed at once",
   "We plan influencer events, launches and activations, then turn the day into a wave of content across creator channels.",
   ["Creator guest-list curated to your goals","Event coordination and on-ground management","Live coverage across creator stories and reels","Post-event content and reporting"],
   "An event without amplification reaches only the room. Creator-led activation turns one evening into weeks of content and reach.",
   "quote",[q("Do you manage the event on the ground?","Yes. From guest list to on-site coordination and content capture, the activation is run end to end."),
            q("Can you tie this to a product launch?","Absolutely. Launches are a natural fit and we plan the content wave around your launch moment.")]),
 svc("product-shoots","Product Shoots","product and ad shoots",
   "Catalogue and ad visuals that sell",
   "Studio product photography and short-form ad footage that make your product look its best across web, ads and marketplaces.",
   ["Studio product photography","Short-form ad and reel footage","Retouching and marketplace-ready formats","Consistent look across your catalogue"],
   "Weak product visuals lose the sale before the copy is read. Clean, consistent shoots lift conversion across every channel.",
   "quote",[q("Do you shoot for marketplaces?","Yes. We deliver in the formats Amazon, Flipkart and your own site need, retouched and ready."),
            q("Can you do video and stills together?","Yes. We plan shoots to capture both in one session so your catalogue and ads stay consistent.")]),
 svc("web-design","Web Design","web design and development",
   "A site that turns clicks into customers",
   "Clean, fast, conversion-focused websites and landing pages built to match your brand and your campaigns.",
   ["Conversion-focused design and copy structure","Fast, mobile-first build","Landing pages that match your ad campaigns","Analytics and lead capture wired in"],
   "Traffic is wasted on a slow or confusing site. A fast, clear site turns the visitors your campaigns send into leads.",
   "quote",[q("Do you build landing pages for ads?","Yes. We build dedicated landing pages that match each campaign so your ad spend converts."),
            q("Will it be mobile-first?","Yes. Every build is mobile-first, since most of your traffic will arrive on a phone.")]),
 svc("logo-design","Logo Design","logo and brand identity design",
   "An identity that looks the part",
   "Distinctive logo and core brand identity work that gives your brand a consistent, professional face.",
   ["Logo concepts rooted in your positioning","Colour, type and usage guidelines","Files for print, web and social","A simple brand kit your team can reuse"],
   "An inconsistent identity reads as amateur. A clear logo and kit make every touchpoint look deliberate.",
   "quote",[q("How many concepts do we see?","You'll see a set of distinct directions, then we refine the one that fits best."),
            q("Do we get usage guidelines?","Yes. You get colour, type and usage guidance plus files ready for every medium.")]),
 svc("technology-solutions","Technology Solutions","marketing technology solutions",
   "The tech behind campaigns that scale",
   "Custom tools, tracking and integrations that make your campaigns measurable and your marketing operation efficient.",
   ["Campaign tracking and dashboards","Integrations across your marketing stack","Custom tools for creator and lead workflows","Data captured in one place you control"],
   "Campaigns you can't measure can't be improved. The right tracking and tooling turn guesswork into decisions.",
   "quote",[q("Can you centralise our lead data?","Yes. We wire leads and traffic from every campaign into one place you own and can act on."),
            q("Do you integrate with our existing tools?","Yes. We connect to your CRM and marketing stack rather than replacing what works.")]),
]
mhs_niches = [
 {"slug":"beauty-skincare","name":"Beauty & Skincare","line":"beauty and skincare"},
 {"slug":"fashion-apparel","name":"Fashion & Apparel","line":"fashion and apparel"},
 {"slug":"food-beverage","name":"Food & Beverage","line":"food and beverage"},
 {"slug":"health-fitness","name":"Health & Fitness","line":"health, fitness and wellness"},
 {"slug":"d2c-brands","name":"D2C Brands","line":"direct-to-consumer"},
 {"slug":"travel-hospitality","name":"Travel & Hospitality","line":"travel and hospitality"},
 {"slug":"jewellery","name":"Jewellery","line":"jewellery and accessories"},
 {"slug":"home-lifestyle","name":"Home & Lifestyle","line":"home and lifestyle"},
]

# ============================ THE FOUNDER'S DREAM ==========================
tfd_services = [
 svc("founder-podcast","Founder Podcast Production","founder podcast production",
   "Turn your founder story into a marketing asset",
   "A cinematic multi-camera podcast shoot in our Bangalore studio, edited Netflix-style, then cut into reels and amplified to founder and investor audiences.",
   ["90-minute multi-camera studio interview","Cinematic editing plus six short-form reels","Full copyright for your ads and decks","Paid distribution to founder and investor communities"],
   "One strong episode gives you credibility content you can reuse in pitch decks, ads and PR for years, positioning you as a leader.",
   "1,16,111",[q("Do I need to be famous to feature?","No. We select on clarity, traction and mindset rather than follower count."),
               q("Do I own the content?","Yes. You receive full copyright and can reuse the episode in ads, decks and PR indefinitely.")]),
 svc("podcast-recording","Podcast Recording Services","professional podcast recording",
   "Studio-grade recording without the setup headache",
   "Book our cinema-grade studio and in-house crew for a clean, professional multi-camera recording, lighting and audio handled for you.",
   ["Multi-camera studio recording","Professional lighting and audio engineering","In-house crew managing the shoot","Raw and edited files delivered"],
   "Home recordings look and sound like home recordings. A proper studio and crew make your content look like it belongs on a major platform.",
   "quote",[q("Is the studio equipped for multi-guest?","Yes. The studio and crew handle solo, co-host and multi-guest formats."),
            q("Do we get raw files too?","Yes. You receive both raw footage and the edited deliverables.")]),
 svc("podcast-hosting","Podcast Hosting Services","podcast hosting and distribution",
   "Get your show live and found everywhere",
   "We host and distribute your podcast across YouTube, Spotify and Apple, set up the channel and optimise it to be discovered.",
   ["Channel setup and optimisation","Distribution to YouTube, Spotify and Apple","Titles, thumbnails and descriptions that get found","Publishing schedule managed for you"],
   "A great episode that no one can find is wasted. Proper hosting and optimisation get your show in front of the right listeners.",
   "quote",[q("Which platforms do you publish to?","YouTube, Spotify, Apple Podcasts and the major directories, set up and optimised."),
            q("Do you help with titles and thumbnails?","Yes. We craft titles, thumbnails and descriptions built to be discovered.")]),
 svc("podcast-agency","Podcast Agency Services","end-to-end podcast agency services",
   "Your whole podcast, handled",
   "Full-service podcast production, from strategy and scripting to recording, editing, distribution and a promotion plan, all in-house.",
   ["Strategy, scripting and guest coordination","Recording, editing and sound design","Distribution and channel management","A tailored podcast marketing plan"],
   "Piecing a podcast together across freelancers is slow and inconsistent. One in-house team keeps quality and momentum steady.",
   "quote",[q("Do you handle everything in-house?","Yes. From consultation to promotion, our in-house team manages every step."),
            q("Can you run an ongoing series?","Yes. We plan and produce ongoing series, not just one-off episodes.")]),
]

# ============================ THE POWERFUL KITCHEN =========================
kitchen_services = [
 svc("wedding-catering","Wedding Catering","wedding catering",
   "Catering your guests remember long after the day",
   "Custom multi-cuisine wedding menus, North Indian, South Indian, Brahmin-style, Bengali and Rajasthani, cooked fresh with punctual setup and service.",
   ["Menu built around your guest count and cuisines","Fresh-to-order cooking by experienced chefs","Live counters and welcome-drink stations","On-time setup so you focus on guests"],
   "Wedding catering is judged on taste and timing together. Fresh regional cooking with reliable service is what guests remember.",
   "quote",[q("Can you tailor the menu to our region and diet?","Yes. Menus are customised by cuisine, guest count and dietary needs, including full-veg and Brahmin-style options."),
            q("Do you handle live counters?","Yes. Dosa, Chinese wok, chaat and dessert live counters can be added to any package.")]),
 svc("corporate-catering","Corporate Event Catering","corporate event catering",
   "Reliable catering for teams and client events",
   "Refined business catering for team lunches, client hospitality and offsites, with clean presentation and punctual service.",
   ["Menus scaled to headcount and schedule","Buffet or boxed formats for offices","Clearly labelled veg and non-veg options","Setup timed around your meetings"],
   "Corporate catering has to be on time and fuss-free. We plan around your agenda so food is one less thing to manage.",
   "quote",[q("Can you deliver to an office park on schedule?","Yes. Setup is planned around your meeting times so lunch lands when your agenda needs it."),
            q("Do you do boxed individual meals?","Yes. Boxed formats are available where a buffet isn't practical.")]),
 svc("birthday-catering","Birthday Party Catering","birthday party catering",
   "Menus built for a celebration",
   "Crowd-pleasing birthday menus with live counters, kids' snacks and desserts, set up and served so you can enjoy the party.",
   ["Menu tuned to your crowd and age mix","Kids' snacks and dessert counters","Live counters and welcome drinks","Setup and service handled for you"],
   "A birthday spread has to please a mixed crowd. A menu built around your guests keeps everyone, from kids to elders, happy.",
   "quote",[q("Can you cater for kids and adults together?","Yes. We build menus with kids' snacks alongside mains so every guest is covered."),
            q("Do you provide live counters?","Yes. Chaat, Chinese wok, pasta and dessert counters are all available.")]),
 svc("traditional-events","Traditional Event Catering","traditional and cultural event catering",
   "Authentic regional flavours for cultural occasions",
   "Traditional catering for pujas, housewarmings and cultural functions, with authentic regional recipes cooked the way they should be.",
   ["Authentic regional and community menus","Full-veg and satvik options","Traditional serving formats","Respectful, punctual on-site service"],
   "Cultural events call for food that's authentic, not approximate. Regional recipes done right honour the occasion.",
   "quote",[q("Can you do satvik or no-onion-no-garlic menus?","Yes. Satvik and community-specific menus are a core part of what we do."),
            q("Do you cater housewarmings and pujas?","Yes. Traditional functions of every kind are catered with the right regional menu.")]),
 svc("hi-tea-catering","Hi-Tea Catering","hi-tea and snacks catering",
   "Elegant light bites for gatherings",
   "Hi-tea spreads of light bites, snacks and beverages for smaller gatherings, get-togethers and corporate breaks.",
   ["Curated hi-tea snack and beverage menu","Veg and non-veg light bites","Neat presentation and setup","Right-sized portions for the occasion"],
   "A hi-tea is about variety and presentation over volume. A curated spread makes a smaller gathering feel special.",
   "quote",[q("Is hi-tea suitable for corporate breaks?","Yes. Hi-tea is a popular format for meetings, launches and corporate get-togethers."),
            q("Can we mix veg and non-veg?","Yes. The spread is built to your preference across veg and non-veg bites.")]),
 svc("private-party-catering","Private Party Catering","private party and BBQ catering",
   "Stylish dining for social celebrations",
   "Catering for house parties, BBQs and private celebrations, with menus and service tuned to a relaxed social setting.",
   ["Menus for house parties and BBQs","Live grill and counter options","Flexible veg and non-veg spreads","Setup and service that stays out of the way"],
   "A private party should feel effortless for the host. Handled catering and service let you actually enjoy your own event.",
   "quote",[q("Can you do a live BBQ or grill?","Yes. Live grill and counter options are available for private parties."),
            q("Do you cater smaller home gatherings?","Yes. We scale menus and crew to suit intimate home parties as well as larger events.")]),
]

# ============================ THE POWERFUL ADS =============================
ads_services = [
 svc("ad-film-production","Ad Film Production","ad film and creative production",
   "Scroll-stopping ad films, shot and edited for performance",
   "Concept-to-delivery ad films and performance creatives for Meta, YouTube and e-commerce, designed around hooks that hold attention.",
   ["Creative concepting and scripting","Studio and on-location shoots","Performance edits with hook and CTA variations","Deliverables cut for every placement"],
   "Creative is the biggest lever in paid ads. Films built around a strong hook and clear CTA lower cost per result more than bidding tweaks.",
   "quote",[q("Do you make variations for testing?","Yes. Each concept ships with hook and CTA variations so you can test and scale the winner."),
            q("Can you edit for Meta and YouTube?","Yes. Every film is delivered in the aspect ratios and lengths each placement needs.")]),
 svc("performance-creatives","Performance Creatives","performance ad creatives",
   "Creative built to be tested, not just admired",
   "High-volume performance creatives and UGC-style ads designed for rapid testing and scaling on paid social.",
   ["Multiple concepts and angles per brief","Hook-first edits for paid social","Rapid iteration on what's working","Formats for every placement"],
   "Paid social eats creative fast. A steady flow of testable angles keeps your ad account fresh and your costs down.",
   "quote",[q("How many creatives per batch?","We plan batches around your testing needs, with multiple angles per concept."),
            q("Do you iterate on winners?","Yes. We double down on winning angles and refresh fatigued ones.")]),
 svc("product-shoot","Product Shoot","product photography and video",
   "Product visuals that carry the ad",
   "Studio product photography and video that make your product the hero across ads, web and marketplaces.",
   ["Studio product photography and video","Retouching and marketplace-ready formats","Consistent look across the catalogue","Stills and motion in one session"],
   "The product shot often is the ad. Clean, consistent visuals lift conversion across every channel.",
   "quote",[q("Do you shoot stills and video together?","Yes. We capture both in one session for consistency and value."),
            q("Are files marketplace-ready?","Yes. We deliver in the formats your site and marketplaces require.")]),
 svc("brand-films","Brand Films","brand film production",
   "The film that says who you are",
   "Cinematic brand films for launches, about-us stories and campaigns that build emotion and trust, not just clicks.",
   ["Story and script development","Cinematic direction and production","Music, grade and sound design","Cut-downs for social and ads"],
   "Some moments need story over sales. A well-made brand film builds the trust that performance ads then convert.",
   "quote",[q("Do we get social cut-downs?","Yes. The brand film comes with shorter cuts for social and ads."),
            q("Can you handle the full production?","Yes. From script to final grade, the film is produced end to end.")]),
 svc("social-media-creatives","Social Media Creatives","social media creative production",
   "A consistent, scroll-worthy feed",
   "Ongoing social creative, static and motion, that keeps your brand's feed consistent, on-message and worth following.",
   ["Monthly static and motion creative","On-brand templates and design system","Captions and hooks written to convert","Formats for every platform"],
   "An inconsistent feed loses followers. A steady, on-brand stream of creative keeps your audience engaged between campaigns.",
   "quote",[q("Do you work on a monthly basis?","Yes. Ongoing monthly creative is our most common format for social."),
            q("Do you write captions too?","Yes. Captions and hooks are written to match each piece and drive action.")]),
]
ads_niches = [
 {"slug":"d2c-brands","name":"D2C Brands","line":"direct-to-consumer"},
 {"slug":"beauty-skincare","name":"Beauty & Skincare","line":"beauty and skincare"},
 {"slug":"food-beverage","name":"Food & Beverage","line":"food and beverage"},
 {"slug":"fashion-apparel","name":"Fashion & Apparel","line":"fashion and apparel"},
 {"slug":"real-estate","name":"Real Estate","line":"real estate"},
 {"slug":"edtech","name":"Edtech","line":"education and edtech"},
]

config = {
 "_comment":"Full network config. Add services, cities or niches to any brand and re-run generate.py. lead_endpoint and ga4_id centralise ALL leads and traffic from ALL brands.",
 "network_name":"The MHS Network",
 "lead_endpoint":"https://formspree.io/f/YOUR_FORM_ID",
 "ga4_id":"",
 "brands":[
   {"key":"mhs","name":"My Haul Store","domain":"https://www.myhaulstore.com","phone":"+91-8904989995",
    "accent":"#e23744","central":True,"tagline":"India's influencer marketing agency","pattern":"service_niche_city",
    "services":mhs_services,"cities":[city(c) for c in PAN_INDIA],"niches":mhs_niches},
   {"key":"tfd","name":"The Founder's Dream","domain":"https://thefoundersdream.in","phone":"+91-9670340369",
    "accent":"#c99a3b","central":False,"tagline":"India's founder podcast platform","pattern":"service_city",
    "services":tfd_services,"cities":[city(c) for c in TFD_CITIES],"niches":[]},
   {"key":"kitchen","name":"The Powerful Kitchen","domain":"https://thepowerfulkitchen.com","phone":"+91-7795580761",
    "accent":"#c0562b","central":False,"tagline":"Premium event catering, Bangalore","pattern":"service_city",
    "services":kitchen_services,"cities":[city(c) for c in KITCHEN_AREAS],"niches":[]},
   {"key":"ads","name":"The Powerful Ads","domain":"https://thepowerfulads.com","phone":"+91-8904989995",
    "accent":"#2563c9","central":False,"tagline":"Creative ad production","pattern":"service_niche_city",
    "services":ads_services,"cities":[city(c) for c in PAN_INDIA],"niches":ads_niches},
 ]
}

out = os.path.join(os.path.dirname(__file__),"data","config.json")
json.dump(config, open(out,"w",encoding="utf-8"), ensure_ascii=False, indent=1)
# quick projection
def count(b):
    n = len(b["services"])*len(b["cities"])
    if b["pattern"]=="service_niche_city" and b["niches"]: n*=len(b["niches"])
    return n
print("Wrote", out)
for b in config["brands"]:
    print(f'  {b["name"]:24s} {len(b["services"])} svc x {len(b.get("niches") or [1])} niche x {len(b["cities"])} city = {count(b):,}')
print("TOTAL:", f'{sum(count(b) for b in config["brands"]):,}', "pages")
