# Deployment Quickstart Guide

This guide describes how to deploy the Agrix platform on a fresh VPS using the 1-click Docker setup.

## Prerequisites

1. A raw Linux VPS (Ubuntu 22.04 LTS recommended).
2. Root or sudo access.
3. A properly pointed domain name (e.g. `pos.agrix.vn` and `api.agrix.vn`) resolving to the VPS IP address.

## Step 1: Install Dependencies
If Docker is not installed, run:
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
```

## Step 2: Clone & Configure
```bash
git clone https://github.com/[repo]/agrix.git
cd agrix/docker

# Copy the sample environment
cp .env.example .env

# Edit .env to add your production URL and Secrets
nano .env
```
Ensure you provide the correct `DOMAIN` (for Let's Encrypt), `LETSENCRYPT_EMAIL`, and `DATABASE_URL`.

## Step 3: 1-Click Launch
```bash
docker compose up -d --build
```

The system will now:
1. Build the frontend and backend images.
2. Spin up PostgreSQL and Redis.
3. Start the Nginx Proxy.
4. Auto-request Let's Encrypt SSL certificates for your domain.

Access your app securely at `https://your-domain.com`.
