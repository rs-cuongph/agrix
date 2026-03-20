# ⚠️ DEPRECATED

This Flutter Web Admin is **deprecated** as of 2026-03-20.

## Replacement

The admin panel has been migrated to **Next.js** and is now part of `apps/web-base/`.

Access the new admin at: `http://localhost:3002/admin`

## Migration Guide

| Flutter Web Admin | Next.js Admin |
|---|---|
| `apps/web-admin/` (Flutter) | `apps/web-base/src/app/admin/` (Next.js) |
| Served on port 8080 | Served on port 3002 |
| Dart/Flutter | TypeScript/React |
| SharedPreferences auth | httpOnly cookie auth |

## Why Deprecated?

- Next.js provides better SEO, server-side rendering, and development speed
- shadcn/ui + Tailwind CSS provides modern UI components
- Single codebase with the public web (web-base)
- Server-side middleware auth is more secure than client-side token storage

Do not make new changes to this directory. Use `apps/web-base/src/app/admin/` instead.
