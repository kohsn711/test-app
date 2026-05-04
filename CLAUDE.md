# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # start dev server (Next.js Turbopack)
npm run build    # production build
npm run start    # serve production build
npm run lint     # ESLint (flat config, v9)
```

No test runner is configured.

## Stack

- **Next.js 16.2.4** with App Router — see AGENTS.md warning about breaking changes
- **React 19.2.4**
- **Tailwind CSS v4** — configured via `@tailwindcss/postcss` in `postcss.config.mjs`, not `tailwind.config.js`
- **TypeScript** — strict mode; path alias `@/*` maps to the repo root
- **ESLint v9** — flat config in `eslint.config.mjs` (no `.eslintrc`)

## Architecture

This is a bare Next.js App Router project. All routes live under `app/`:

- `app/layout.tsx` — root layout; applies Geist fonts via CSS variables, sets `<html>` and `<body>` baseline classes
- `app/page.tsx` — home route (`/`)
- `app/globals.css` — global styles; Tailwind is imported here

There is no `pages/` directory; use the App Router exclusively. Server Components are the default — mark files `"use client"` only when browser APIs or interactivity are needed.
