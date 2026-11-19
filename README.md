# Open Creative Suite website

The static product site for **Open Creative Suite**: [PixelDotNet](https://github.com/OpenCreativeSuite/PixelDotNet) and [VectorDotNet](https://github.com/OpenCreativeSuite/VectorDotNet).

No frameworks, no bundler and no runtime dependencies. Product pages, sitemap and metadata are generated from one file (`content.json`) into plain HTML, with a shared CSS/JS layer.

## Preview locally

```sh
node scripts/build.mjs
node scripts/serve.mjs
```

Open <http://localhost:4173>. `npm run build` and `npm run serve` also work if npm scripts are enabled.

## Adding or changing a product

1. Open `content.json`.
2. Copy a product object and edit it. It drives the home card, the product page, the footer, the schema.org data and the sitemap.

Key fields:

| Field | Purpose |
| --- | --- |
| `slug` | URL: `apps/<slug>/` and the image folder name. |
| `name`, `titleLines`, `category`, `shortCategory` | Display name, stacked hero lines, and category labels. `titleLines` is optional; longer names can be split, e.g. `["Pixel", "DotNet"]`. |
| `accent`, `accentSoft` | The product's one colour and a pale tint used in UI details. |
| `tagline`, `blurb` | Short sales line and hero paragraph. |
| `version`, `released`, `size`, `license`, `licenseShort` | Shown in specs and meta. The live version is refreshed from GitHub Releases in the browser. |
| `repo` | `Owner/Repo` on GitHub. Used for release, source and licence links. |
| `docs` | Optional user-guide URL. |
| `images.hero` | `{ file, alt }` for the main screenshot. Remove `images` entirely to fall back to the generated CSS mock-up. |
| `images.shots` | Up to three `{ file, label, caption }` gallery screenshots. |
| `features` | Six `{ title, body }` entries. |
| `formats`, `platforms` | File formats and supported operating systems. |
| `shotWidth`, `shotHeight` | Intrinsic screenshot dimensions, used as image attributes to prevent layout shift. |

3. Put screenshots in `assets/img/apps/<slug>/`. They are normally copied from the product repo's `docs/screenshots/` folder.
4. Run `node scripts/build.mjs`.

The build writes `index.html`, `about.html`, `404.html`, `apps/<slug>/index.html`, `sitemap.xml` and `robots.txt`. **Do not edit those generated files by hand.** Change the templates in `scripts/build.mjs` or the data in `content.json` and rebuild.

The site adapts to any number of products: home cards, hero tiles, the receipt, “previous / next” links and the suite index all derive from `content.json`.

## Deploying to GitHub Pages

1. Set `site.url` in `content.json` to the final site URL. If the site lives at a project path such as `https://example.github.io/opencreativesuite/`, include that path. It is used for canonical URLs, social cards, the sitemap and the 404 page.
2. Update `site.github`, `site.community` and `site.licenseUrl` to the real organisation.
3. Push the repository.
4. In **Settings → Pages → Build and deployment**, choose **GitHub Actions**. The included workflow (`.github/workflows/pages.yml`) builds the site and publishes it. Alternatively choose “Deploy from a branch” and serve the repository root; `.nojekyll` is already present.

## Licensing

The products are **source-available** under the Apache License 2.0 with the Commons Clause. Each product repo contains a `LICENSE.md` with the full terms and a plain-English summary.

The site deliberately says “source-available” rather than “open source”: the no-resale condition means the licence is not OSI-approved open source. Keep the `license` and `licenseShort` fields in `content.json` in sync if the licence ever changes, and update the copy in `scripts/build.mjs` (`why`, `source` and about/licensing sections) plus `about.html`’s FAQ answers.

## File map

```
content.json               site settings + all products
scripts/build.mjs          generator (templates, SVG, CSS mock-ups)
scripts/serve.mjs          tiny local server
scripts/capture.mjs        optional headless screenshot helper for review
assets/css/site.css        the whole design system
assets/js/site.js          menu, reveal, copy, version hydration
assets/img/apps/<slug>/    real product screenshots
assets/img/og.png          social card
apps/<slug>/index.html     generated product pages
index.html                 generated home page
```

## Notes

- Screenshots come from the product repos. Refresh them whenever the UI changes.
- Version labels are static fallbacks; `site.js` checks the GitHub Releases API and updates them when a newer release exists. If the API is unavailable, the page keeps working with the fallback.
- Fonts are Archivo and IBM Plex Mono via Google Fonts, with system fallbacks.
- The CSS mock-up renderer is still used on any product that has no `images` entry, so new tools can launch before screenshots exist.
