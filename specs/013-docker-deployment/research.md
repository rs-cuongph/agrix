# Research: Docker VPS Deployment

## Objective 
Identify the most secure, reproducible, and minimal-overhead approach to orchestrate the Agrix Monorepo (Next.js, NestJS backend, PostgreSQL, Redis, MinIO) within a single VPS alongside automatic SSL management via Let's Encrypt.

## Finding 1: SSL & Nginx Proxy Strategy
**Decision:** Use the `nginxproxy/nginx-proxy` and `nginxproxy/acme-companion` duo for automated Docker container routing and SSL certificate generation.
**Rationale:** 
Instead of hardcoding an Nginx config with manual Certbot steps, `nginx-proxy` dynamically reads `VIRTUAL_HOST` environment variables on sibling containers and automatically generates Nginx routing rules. `acme-companion` reads `LETSENCRYPT_HOST` and auto-renews Let's Encrypt certificates. This strictly aligns with the "1-click auto setup" requirement with zero manual config edits needed for new domains.
**Alternatives considered:** 
- Manual Nginx with init-certbot script (rejected due to complexity for initial setup and high failure rate during cert renewal).
- Caddy Server (rejected because Nginx is a more widely supported and established standard for enterprise setups, matching the existing ecosystem knowledge).

## Finding 2: Database Persistence & Bootstrapping
**Decision:** Embed PostgreSQL and Redis inside the Docker Compose network, backing them with isolated Local Docker Volumes. Implement a lightweight initialization container or `docker-entrypoint-initdb.d` script for the backend to ensure automatic Prisma migrations upon the first boot.
**Rationale:** 
Using named volumes (`db_data`, `redis_data`) ensures data is safely persisted to the host machine even if containers are destroyed or recreated. Utilizing Docker's local internal DNS (`postgres:5432`) completely masks the database from the public internet (satisfying FR-003 and SC-002).
**Alternatives considered:**
- Bind mounts (`./data:/var/lib/postgresql/data`) (rejected owing to common file-permission bugs between host OS and container users, especially on varied VPS setups).

## Finding 3: Monorepo Orchestration
**Decision:** Create distinct `Dockerfile`s (or a centralized multi-stage `Dockerfile`) targeting specific apps (`web-base` and `backend`). Ensure the `docker-compose.yml` mounts an `.env` file that exposes `VIRTUAL_HOST=agrix.vn` and `LETSENCRYPT_HOST=agrix.vn` to automate the proxying.
**Rationale:** Prevents giant monolithic containers. Separation of concerns lets the API and Frontend scale independently on the VPS if needed later.
