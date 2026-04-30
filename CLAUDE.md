# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev           # start dev server at http://localhost:3000
npm run build         # production build
npm run start         # serve production build
npm run lint          # ESLint (eslint-config-next/core-web-vitals + typescript)
npm test              # run Jest test suite
npm run test:coverage # run tests with V8 coverage (threshold: 100%)
```

## Architecture

This is a Next.js **App Router** project with source rooted at `src/`. Entry points:

- `src/app/layout.tsx` — root layout; loads Geist Sans and Geist Mono via `next/font/google`, sets global metadata
- `src/app/page.tsx` — home route (`/`); upload state machine (idle → uploading → success/error)
- `src/app/globals.css` — global styles including CSS custom properties for light/dark theme

### API routes

- `POST /api/upload` — `src/app/api/upload/route.ts` — parses multipart form data, delegates to `imageService.saveImage`
- `GET /api/download/[filename]` — `src/app/api/download/[filename]/route.ts` — delegates to `imageService.getImage`, streams bytes with `Content-Disposition: attachment`

### Backend

- `src/backend/services/imageService.ts` — file validation (type, size), writes to `public/uploads/`, reads for download
- `src/backend/lib/fsPromises.ts` — thin re-export of `fs/promises`; exists so tests can mock it as a user module (SWC bypasses `jest.mock` for Node.js built-in imports)

### Frontend components

All components under `src/frontend/components/`, each colocated with a `.module.css` and a `.test.tsx`:

- `Dropzone` — wraps react-dropzone, emits accepted/rejected files
- `Header` — title + light/dark theme toggle button
- `UploadLoader` — spinner shown during upload
- `UploadSuccess` — preview image, share (copy URL), download, and reset
- `UploadError` — error message and reset

### Styling

CSS Modules (`.module.css` files colocated with components). No Tailwind or CSS-in-JS. Light/dark theme via `data-theme` attribute on `<html>`.

### Storage

No database. Files are written to `public/uploads/` and served as static assets at `/uploads/<filename>`.

## Testing

Jest 29 with two projects:

- **node** — runs `src/backend/**` and `src/app/api/**` tests; uses a custom environment (`jest.env.node.js`) that injects Node 18+ fetch globals (`Response`, `Request`, `FormData`, `File`) into Jest's vm sandbox
- **jsdom** — runs `src/frontend/**` and `src/app/*.test.tsx`; uses `jest-environment-jsdom` with `@testing-library/react`

Coverage is collected from `src/**/*.{ts,tsx}` excluding test files and `src/backend/lib/fsPromises.ts` (always mocked). Threshold: 100% across statements, branches, functions, and lines.

## Non-standard Next.js version

This project runs **Next.js 16.2.4** with **React 19.2.4** — APIs and conventions may differ from training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. The docs are organized as:

```
node_modules/next/dist/docs/
  01-app/
    01-getting-started/
    02-guides/        # feature-specific guides (forms, auth, caching, etc.)
    03-api-reference/ # components, directives, file conventions, config, CLI
```
