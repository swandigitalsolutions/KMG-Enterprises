# Deploying to Cloudflare Pages

This is a **static site with no build step**. The whole repo root is the site.

## Option A — Connect the Git repo (recommended, auto-deploys on every push)

1. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
2. Pick the **`swandigitalsolutions/KMG-Enterprises`** repo, branch **`main`**
3. Build settings:
   - **Framework preset:** `None`
   - **Build command:** *(leave empty)*
   - **Build output directory:** `/`
4. **Save and Deploy**

Every `git push` to `main` then publishes automatically. `_headers` is applied by Pages.

## Option B — Wrangler CLI (one-off deploy)

```
npx wrangler login          # opens a browser once
npx wrangler pages deploy . --project-name kmg-enterprises --branch main
```

## After the first deploy

Replace the placeholder domain in these files with your real Pages URL
(`<project>.pages.dev`) or custom domain, then push:

- `index.html` — `<link rel="canonical">`, all `og:`/`twitter:` URLs
- `robots.txt` — `Sitemap:` line
- `sitemap.xml` — every `<loc>`

Then in **Google Search Console**: add the domain, paste the verification
token into the commented `<meta name="google-site-verification">` in
`index.html`, redeploy, verify, and submit `/sitemap.xml`.

## Still to add (currently placeholders)

Founder name + photo (`assets/img/temple/founder.jpg`), full factory
address, email, completed-temple photos. Stock photography under
`assets/img/site/` is swap-ready — replace a file keeping its name.
