# Personal Website (MVP Skeleton)

This repository contains the initial project skeleton for a minimalist personal website using Next.js App Router and TypeScript.

Project planning docs live in `docs/`:
- `docs/PRD.md`
- `docs/ARCHITECTURE.md`
- `docs/TASKS.md`

## Tech Stack

- Next.js (App Router)
- TypeScript
- React

No non-essential dependencies were added.

## Requirements

- Node.js 20+
- npm 10+ (recommended)

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Available Scripts

- `npm run dev` - start local dev server
- `npm run lint` - run ESLint checks
- `npm run typecheck` - run TypeScript checks (`tsc --noEmit`)
- `npm run build` - create production build
- `npm run start` - run production server after build

## CI (GitHub Actions)

This project uses a minimal CI workflow at `.github/workflows/ci.yml`.

Triggers:
- Pull requests to `main`
- Pushes to `main`

Checks run in CI:
- `npm ci`
- `npm run lint`
- `npm run typecheck`
- `npm run build`

CI uses Node.js 22 to match the project's runtime constraints.

## Deployment (Vercel)

The project is intended to deploy on Vercel with the standard Next.js setup.

Expected behavior:
- Every push to `main` can deploy to Production.
- Every pull request can generate a Vercel Preview deployment.

Recommended Vercel settings:
- Install command: `npm ci`
- Build command: `npm run build`
- Node.js runtime: `22.x`

Environment variable:
- `NEXT_PUBLIC_SITE_URL` (canonical site URL, e.g. `https://example.com`)
  - Local fallback exists (`http://localhost:3000`) if unset.

## Current Routes

- `/` - Home placeholder
- `/blog` - Blog placeholder
- `/tags` - Tags placeholder
- `/404` - Explicit 404 route placeholder
- `not-found` UI handled by `src/app/not-found.tsx`

## Directory Structure

```text
.
|- archive/
|  |- logs/
|  `- notes/
|- content/
|  |- posts/
|  `- resources.ts
|- data/
|  `- nextjs/
|- docs/
|  |- ARCHITECTURE.md
|  |- PERFORMANCE_BASELINE.md
|  |- PRD.md
|  `- TASKS.md
|- lib/
|  |- posts.ts
|  |- resource-display.ts
|  `- resources.ts
|- public/
|  |- leetcode-cookbook/
|  |- avatar.png
|  `- og-default.svg
|- src/
|  |- app/
|  `- components/
|- .eslintrc.json
|- .gitignore
|- next-env.d.ts
|- next.config.ts
|- package-lock.json
|- package.json
`- tsconfig.json
```

## Notes

- Historical logs and one-off notes are archived under `archive/`.
- GitHub/Next.js data snapshots are archived under `data/nextjs/`.
- Upcoming implementation tasks are tracked in `docs/TASKS.md`.
