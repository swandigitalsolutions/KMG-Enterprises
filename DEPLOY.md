# Deploying KMG Enterprises

Static site — no build step, no dependencies. Publish the repository root.

| | Cloudflare Pages | Vercel |
|---|---|---|
| Framework preset | **None** | **Other** |
| Build command | *(leave empty)* | *(leave empty)* |
| Output / root directory | `/` | `./` |
| Config file used | `_headers` | `vercel.json` |

Both config files set the same security headers and the same caching policy,
so the site behaves identically on either host.

## Cloudflare Pages

**Git (recommended)** — Workers & Pages → Create → Pages → Connect to Git →
pick `swandigitalsolutions/KMG-Enterprises`, framework preset **None**, leave
the build command empty, output directory `/`. Every push to `main` redeploys.

**Direct upload**

```bash
npx wrangler pages deploy . --project-name kmg-enterprises --branch main
```

## Vercel

**Git** — Add New → Project → import the repo → framework preset **Other**,
leave the build command empty. Every push to `main` redeploys.

**CLI**

```bash
npx vercel --prod
```

## After the first deploy

1. **Point the domain at the real URL.** The live domain appears in four
   places; search and replace the placeholder in each:

   - `index.html` — `<link rel="canonical">`, `og:url`, `og:image`,
     `twitter:image`
   - `sitemap.xml` — every `<loc>` and `<image:loc>`
   - `robots.txt` — the `Sitemap:` line

   Current placeholder: `https://swandigitalsolutions.github.io/KMG-Enterprises`

2. **Google Search Console** — add the property, verify (paste the token into
   the commented-out `google-site-verification` meta in `index.html`), then
   submit `sitemap.xml`.

3. **Check the social preview** with the Facebook Sharing Debugger and
   X Card Validator — both should show `assets/img/og-cover.jpg` (1200×630).

## Caching note

`assets/css/*` and `assets/js/*` are cached hard and forever because the HTML
requests them with a `?v=<content hash>` that changes whenever the file does.
**If you edit a CSS or JS file, re-stamp those hashes** or returning visitors
will keep the old copy:

```bash
python - <<'PY'
import io, hashlib, re
s = io.open("index.html", encoding="utf-8").read()
for f in ["assets/css/style.css", "assets/js/scene.js",
          "assets/js/app.js", "assets/js/assistant.js"]:
    v = hashlib.md5(io.open(f, "rb").read()).hexdigest()[:8]
    s = re.sub(re.escape(f) + r"\?v=[0-9a-f]{8}", f + "?v=" + v, s)
io.open("index.html", "w", encoding="utf-8").write(s)
print("hashes re-stamped")
PY
```

Images are cached for a week with background revalidation, so swapping a
project photo under the same filename reaches visitors without a rename.

## Local preview

```bash
python -m http.server 8080
# then open http://localhost:8080
```

## Raw photography

The original client photo drop is **not** in this repository — it was 188 MB,
included duplicate 41 MB PDFs, and exceeded Cloudflare Pages' 25 MB per-file
limit. Every image the site actually uses lives in `assets/img/`. The originals
remain in the git history (`git show 919fb1c:photos/`).
