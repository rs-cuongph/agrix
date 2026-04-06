FROM node:20-alpine AS builder

WORKDIR /app
COPY package.json package-lock.json ./
# Scaffolding to satisfy npm workspaces
COPY apps/web-base/package.json ./apps/web-base/
COPY apps/backend/package.json ./apps/backend/
COPY packages/shared/typescript/package.json ./packages/shared/typescript/

RUN npm ci

# Copy the rest
COPY . .

# Build web-base
RUN npm run build --workspace=apps/web-base

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/apps/web-base/public ./public
# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder /app/apps/web-base/.next/standalone ./
COPY --from=builder /app/apps/web-base/.next/static ./.next/static

# Note: The standalone output expects to be run securely using server.js
EXPOSE 3002
ENV PORT=3002
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
