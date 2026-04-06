# Architecture & Data Persistence (DevOps)

Since this feature primarily pertains to container orchestration and deployment automation, no new application-side databases or entities are introduced.

## Docker Networking & Volumes

1.  **Network: `agrix-net` (Bridge)**
    *   **Purpose**: Internal isolated network for all containers.
    *   **Access**: Public internet traffic terminates at `nginx-proxy`, and only `nginx-proxy` sits on both the host-layer (port 80/443) and `agrix-net`.
2.  **Volume: `db_data`**
    *   **Purpose**: Backs the `/var/lib/postgresql/data` directory of the `postgres` container.
3.  **Volume: `redis_data`**
    *   **Purpose**: Backs the Redis store (if applicable).
4.  **Volume: `minio_data`**
    *   **Purpose**: Persistent volume for object files uploaded to MinIO.
5.  **Volume: `certs` & `vhost.d` & `html`**
    *   **Purpose**: Shared volumes between `nginx-proxy` and `acme-companion` to persist ACME challenge proofs and generated SSL certificates.
