FROM node:20-alpine AS builder

WORKDIR /app
COPY package.json package-lock.json ./
# Scaffolding to satisfy npm workspaces
COPY apps/backend/package.json ./apps/backend/
COPY apps/web-base/package.json ./apps/web-base/
COPY packages/shared/typescript/package.json ./packages/shared/typescript/

RUN npm ci

# Build the backend
COPY . .
RUN npm run build --workspace=apps/backend

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
COPY apps/backend/package.json ./apps/backend/
COPY apps/web-base/package.json ./apps/web-base/
COPY packages/shared/typescript/package.json ./packages/shared/typescript/

RUN npm ci --omit=dev

COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
WORKDIR /app/apps/backend

EXPOSE 3001
CMD ["npm", "run", "start:prod"]
