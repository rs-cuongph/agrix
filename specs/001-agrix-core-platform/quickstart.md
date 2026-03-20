# Quickstart: Web Admin (Next.js)

## Prerequisites
- Node.js 18+
- Backend running on `localhost:3000` (see backend quickstart)
- Seeded database (`npm run seed` in backend)

## Development

```bash
# From project root
cd apps/web-base

# Install dependencies (includes Tailwind + shadcn/ui)
npm install

# Start dev server (port 3002)
npm run dev
```

## Access Admin

1. Open `http://localhost:3002/admin`
2. You will be redirected to `/admin/login`
3. Login with:
   - Username: `admin`
   - Password: `admin123`
4. After login, you'll see the admin dashboard

## Admin Routes

| Route | Description |
|-------|-------------|
| `/admin` | Dashboard — revenue, top products, alerts |
| `/admin/login` | Login page |
| `/admin/products` | Products CRUD (create, edit, delete) |
| `/admin/orders` | Order history (read-only) |
| `/admin/customers` | Customer list + debt management |
| `/admin/blog` | Blog post management |
| `/admin/settings` | System settings |

## Build for Production

```bash
cd apps/web-base
npm run build
npm run start
```
