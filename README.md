# KMG Enterprises — Website

Premium single-page website for **KMG Enterprises** — temple construction, temple
stone manufacturing, stone carving and parking / paving stones.

## Open it

Just double-click **`index.html`** — it runs from the file system, no build step,
no server. (Internet is needed the first time so the fonts and the 3D library
load from their CDNs.)

For the cleanest experience (and so the photo files load), serve the folder:

```
cd kmg-enterprises
python -m http.server 8080
# then open http://localhost:8080
```

## What's inside

```
kmg-enterprises/
├─ index.html                 all page content + sections
├─ assets/
│  ├─ css/style.css           full design system (dark + gold, responsive, light/dark aware)
│  ├─ js/scene.js             Three.js 3D — hero temple + product stone viewer
│  ├─ js/app.js               preloader, nav, scroll reveals, 3D tilt, cursor, form → WhatsApp
│  └─ img/
│     ├─ parking/             ← put the 8 parking photos here (see PLACE-PHOTOS-HERE.txt)
│     └─ temple/              ← optional temple / factory photos (temple-1.jpg …)
```

## 3D / premium features

- **Hero:** procedurally-built South-Indian *gopuram* temple (Three.js). Auto-rotates,
  drag to spin, parallaxes as you scroll. Warm key + rim lighting, soft shadows,
  drifting dust motes, exponential fog.
- **Products:** interactive 3D stone viewer — switch between Temple Pillar, Mandapam
  Stone, Paving Stone and Gopuram Block; drag to rotate.
- 3D tilt on every card, magnetic buttons, custom cursor, scroll-reveal animations,
  running expertise marquee, retina (2×) rendering.
- Fully responsive; respects `prefers-reduced-motion`; graceful fallback if WebGL
  is unavailable.

## Logo

Save the company logo as **`assets/img/logo.png`** (a version with a transparent
or trimmed background works best). It then appears in the nav bar, the loading
screen and the footer. Until the file exists, the site falls back to the "KMG
Temple Stone" text lockup automatically.

## Adding your photos

Drop the parking / paving photos into `assets/img/parking/` named
`parking-1.jpg` … `parking-8.jpg` (mapping is in
`assets/img/parking/PLACE-PHOTOS-HERE.txt`). They appear automatically in the
**Parking** gallery section, the Products card, the Projects strip and the main
Gallery. Until a file exists, that slot shows a stone-texture placeholder — nothing
breaks.

Use high-resolution files (1600 px wide or more) so they stay crisp on HD screens.

## Still to fill in (currently shown as gold placeholders)

- Founder name + photograph
- Complete factory address
- Email address
- WhatsApp number / designation
- Temple project photos and project details

## Contact wiring

- Phone links: **91083 18319**, **95359 88986**
- Floating button + contact link → WhatsApp `wa.me/919108318319`
- The enquiry form opens WhatsApp to 91083 18319 with all fields pre-filled
  (no backend needed). Swap for a mail/CRM endpoint later if you want.
