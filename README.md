# Dental Clinic Sample Website

**Live:** https://darwindhas1.github.io/dental-clinic-sample/

A finished, demo-ready website for a Malaysian dental clinic. Plain HTML, CSS and
vanilla JS — no framework, no build step. Drop the folder on any static host.

---

## Clinic config

Every clinic-specific value lives in **[`js/config.js`](js/config.js)**. Change it there
and it changes on every page, because the markup binds to it through
`data-cfg="KEY"` attributes.

```
CLINIC_NAME     = Senyum Dental Clinic
TAGLINE         = Gentle, Modern Dental Care
CITY            = Ipoh, Perak
ADDRESS         = 12, Jalan Sultan Idris Shah, 30000 Ipoh, Perak   (sample)
PHONE_DISPLAY   = +60 5-000 0000                                   (sample)
EMAIL           = hello@senyumdental.my                            (sample)
HOURS           = Mon to Sat 9:00am to 9:00pm · Sun & Public Holidays closed
WHATSAPP_NUMBER = (empty — floating icon is inert until this is filled in)
CURRENCY        = RM
LANGUAGE        = English only
```

`config.js` also holds the six service names and prices, the three dentists, the
social links and the map coordinates.

### Three things config.js does *not* control

These are static in the HTML and need a find-and-replace when you rebrand:

1. The `<title>` and `<meta name="description">` on each of the nine pages.
2. The `Dentist` JSON-LD block at the top of `index.html`.
3. The domain in `sitemap.xml` and `robots.txt` — these currently point at the
   GitHub Pages URL below and must be changed if you move the site.

The header and footer markup is duplicated in each page (deliberately — no build
step), so if you restructure the nav, change it in all nine files.

---

## Pages

| File | What it is |
|---|---|
| `index.html` | Home — hero, family plan, services, how it works, dentists, reviews, FAQ, blog preview, CTA |
| `about.html` | Story, values, stats, full team, clinic gallery with lightbox |
| `services.html` | All six treatments as alternating rows, plus FAQ and CTA |
| `blog.html` | Six article cards |
| `blog-post.html` | One complete sample article with author box and related posts |
| `appointment.html` | Booking form with dentist / service / date / time |
| `contact.html` | Contact cards, message form, Leaflet + OpenStreetMap map |
| `privacy.html` | Sample PDPA-style privacy notice |
| `404.html` | Custom not-found page |

---

## WhatsApp button

A floating green button sits bottom-right on every page. With
`WHATSAPP_NUMBER` empty it shows the icon and tooltip but does nothing when
clicked. Fill it in (international format, no `+` — e.g. `60123456789`) and the
JS builds the `wa.me` link with the prefilled message automatically.

## Forms

All three forms (home CTA, appointment, contact) are **front-end only**: they
validate, show a success toast, and reset. Nothing is sent anywhere. Each form is
marked with a `<!-- WEB3FORMS: add access key here for live clients -->` comment
where a real endpoint goes.

---

## Media

Photography is from Pexels, processed into sized WebP under `assets/img/`.
Photographer credits are in [`assets/img/credits.json`](assets/img/credits.json).
The six service illustrations in `assets/icons/` are original SVGs drawn for this
site — nothing to license.

To refresh the photography:

```bash
cp .env.example .env     # then paste your own keys
npm install
npm run media            # all assets
node scripts/fetch-media.mjs --only=hero-smile,dentist-1   # just a few
```

`scripts/fetch-media.mjs` is the **only** place API keys are used. They are read
from `.env`, which is gitignored, and never appear in any HTML, CSS or client JS —
the published site serves local files only.

---

## Running locally

```bash
npx serve .
```

Any static server works; there is nothing to compile.

## Deploying to Cloudflare Pages

**From the dashboard:** Workers & Pages → Create → Pages → Connect to Git → pick
this repo → Framework preset **None**, Build command **empty**, Build output
directory **`/`** → Save and Deploy.

**From the CLI:**

```bash
npx wrangler pages deploy . --project-name dental-clinic-sample
```

---

## Notes for live clients

- Patient reviews on the home page are written samples, marked in the HTML with
  `<!-- SAMPLE REVIEWS: replace with real Google reviews for live clients -->`.
- All prices, the address, the phone number and the email are placeholders.
- The privacy notice is sample wording and should be reviewed against the PDPA
  before a real clinic publishes it.
