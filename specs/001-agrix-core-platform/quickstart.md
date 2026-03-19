# Quickstart — Agrix Core Platform

## Prerequisites

- **Docker** & **Docker Compose** (v2+)
- **Flutter SDK** 3.x (for mobile/web-admin development)
- **Node.js** 20+ & **npm** 9+ (for backend & web-base development)
- **Git**

## 1. Clone & Setup

```bash
git clone <repo-url> agrix
cd agrix
```

## 2. Start Backend Services (Docker)

```bash
# Copy environment template
cp docker/.env.example docker/.env
# Edit docker/.env with your database password, MinIO keys, OpenAI API key, etc.

# Start PostgreSQL, MinIO, NestJS backend
cd docker
docker compose up -d
```

Services will be available at:
- **NestJS API**: `http://localhost:3000`
- **MinIO Console**: `http://localhost:9001`
- **PostgreSQL**: `localhost:5432`

## 3. Run Database Migrations

```bash
cd apps/backend
npm install
npm run migration:run
```

## 4. Run Flutter Mobile App

```bash
cd apps/mobile
flutter pub get
flutter run -d <device_id>
```

## 5. Run Flutter Web Admin

```bash
cd apps/web-admin
flutter pub get
flutter run -d chrome
```

## 6. Run Next.js Web Base

```bash
cd apps/web-base
npm install
npm run dev
```

Available at: `http://localhost:3001`

## 7. Run Tests

```bash
# Backend tests
cd apps/backend && npm test

# Flutter unit tests
cd apps/mobile && flutter test

# Flutter integration tests
cd apps/mobile && flutter test integration_test/

# Next.js tests
cd apps/web-base && npm test
```

## Key Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection | `postgres://user:pass@localhost:5432/agrix` |
| `MINIO_ENDPOINT` | MinIO host | `localhost` |
| `MINIO_ACCESS_KEY` | MinIO access | `minioadmin` |
| `MINIO_SECRET_KEY` | MinIO secret | `minioadmin` |
| `OPENAI_API_KEY` | For AI Chatbot | `sk-...` |
| `JWT_SECRET` | JWT signing key | `your-secret-key` |
