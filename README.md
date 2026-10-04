# Nelbin Joseph: portfolio

Personal portfolio of Nelbin Joseph, AI Automation & Systems Engineer.
Live: https://nelbinxav.github.io/nelbin-portfolio/

Built with Next.js (static export), TypeScript, Tailwind CSS v4, GSAP and OGL. Deployed to GitHub Pages by GitHub Actions on every push to `main`.

## Run it

```bash
npm install
npm run dev                  # http://localhost:3000
npm run build && npm start   # builds the static site to ./out and serves it
```

## Where things live

| To change | Edit |
|---|---|
| Name, role, contact links, site URL, nav | `content/site.ts` |
| Colours, type, spacing, motion | `app/globals.css` (design tokens at the top) |
| Headline numbers | `content/metrics.ts` |
| Systems and case-study cards | `content/systems.ts` |
| A full case study | `content/case-studies/` |
| What I do, process, journey | `content/pillars.ts`, `content/method.ts`, `content/experience.ts` |
| Tools strip | `content/tools.ts` |
| Your photo | `public/photos/profile.jpg`, then run `npm run photos` to regenerate the responsive sizes |

Adding a case study is one data file in `content/case-studies/` plus an entry in its `index.ts`.

## Notes

- Client names are intentionally left out. Ownership wording (Built, Led, Implemented, Contributed, Worked with) is defined in `content/ownership.ts`.
- The 3D hero layer loads only on wide, capable screens and never when the visitor prefers reduced motion.
- If you add a custom domain, set `url` in `content/site.ts` and remove the base path in `.github/workflows/pages.yml`.

All text, imagery and photographs are © Nelbin Joseph. The source code structure may be used as a reference, but please do not reuse the content or photo.
