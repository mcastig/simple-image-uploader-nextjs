# Simple Image Uploader

A Next.js 16 application for uploading and sharing images. Drag-and-drop a JPG, PNG, or GIF (max 2 MB), get a shareable URL, and download the image — all without a database. Files are stored on disk under `public/uploads/`.

## Features

- Drag-and-drop upload via react-dropzone
- Accepts JPG, PNG, and GIF up to 2 MB
- Copy-to-clipboard share link
- One-click download
- Light/dark theme toggle
- 100% test coverage (55 tests)

## Getting Started

```bash
npm install
npm run dev       # http://localhost:3000
```

## Scripts

```bash
npm run dev           # start dev server
npm run build         # production build
npm run start         # serve production build
npm run lint          # ESLint
npm test              # run test suite
npm run test:coverage # run tests with coverage report
```

## Project Structure

```
src/
  app/
    api/
      upload/           # POST /api/upload — accepts multipart form, saves file
      download/[filename]/ # GET /api/download/:filename — streams file for download
    layout.tsx          # root layout (Geist font, metadata)
    page.tsx            # home page — upload state machine
  backend/
    lib/fsPromises.ts   # thin fs/promises re-export (enables mocking in tests)
    services/imageService.ts # file save/read logic
  frontend/
    components/
      Dropzone/         # drag-and-drop input
      Header/           # title + theme toggle
      UploadError/      # error state UI
      UploadLoader/     # in-progress state UI
      UploadSuccess/    # success state UI (share + download)
```

## Storage

No database. Uploaded files are written to `public/uploads/` and served as static assets at `/uploads/<filename>`.

## Tech Stack

- **Next.js 16.2.4** / **React 19.2.4** — App Router
- **react-dropzone** — file drag-and-drop
- **Jest 29** + **React Testing Library** — unit tests with 100% coverage
- **CSS Modules** — scoped styles, no Tailwind
