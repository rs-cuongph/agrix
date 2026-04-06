# Feature Specification: Docker VPS Deployment

**Feature Branch**: `013-docker-deployment`  
**Created**: 2026-04-05  
**Status**: Draft  
**Input**: User description: "ok , giờ hãy đóng gói vào 1 docker, mục tiêu là chỉ cần clone source ở vps và tiến hành chạy 1 lệnh là tự động setup nginx,... tất cả"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Initial VPS Deployment (Priority: P1)

As a System Administrator, I want to clone the repository on a fresh Virtual Private Server (VPS) and run a single command so that the entire POS system (Web Frontend, Backend, Nginx Reverse Proxy) is set up and accessible over the internet without manual configuring.

**Why this priority**: Core objective of the feature; it eliminates deployment complexity and enables rapid rollouts for new stores or servers.

**Independent Test**: Can be fully tested by cloning the repository on a clean virtual machine, executing the startup command, and successfully accessing the web interface via the machine's IP.

**Acceptance Scenarios**:

1. **Given** a fresh VPS environment with Docker installed, **When** the administrator runs the deployment command, **Then** all required services (Nginx, API Backend, Web Frontend) start successfully.
2. **Given** the services are running, **When** a user accesses the VPS IP or configured domain, **Then** Nginx successfully routes the request to the POS Web Interface without exposing internal application ports.

---

### User Story 2 - System Configuration Management (Priority: P2)

As a System Administrator, I want to be able to configure environment-specific settings (like Domain Names, Ports, and Secrets) through a centralized environment file so that the same Docker configuration works securely across different servers.

**Why this priority**: Essential for security and flexibility across multiple environments (staging, production).

**Independent Test**: Can be fully tested by changing the server port or domain in the configuration file and verifying that deploying the stack reflects the new settings immediately.

**Acceptance Scenarios**:

1. **Given** a `.env` configuration file, **When** the system is deployed, **Then** applications inherit their correct authentication secrets and server paths.

---

### Edge Cases

- What happens if the VPS already has another service occupying port 80 or 443?
- How does the system handle database migrations or initialization when starting for the very first time?
- Are persistent data volumes properly mapped so that a container restart does not wipe database records or user sessions?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a unified orchestration file (e.g., `docker-compose.yml`) encompassing all application layers: Nginx Proxy, Next.js Web Frontend, and API Backend.
- **FR-002**: System MUST include a pre-configured Nginx setup that acts as an API gateway and static file server, automatically routing `/api` traffic to the backend and `/` traffic to the web interface.
- **FR-003**: System MUST NOT expose internal application ports (e.g., 3000, 3001) directly to the host machine; they must only be accessible internally to the Nginx reverse proxy via a Docker network.
- **FR-004**: System MUST allow launching the entire orchestration via a single CLI command (e.g., `docker compose up -d`).
- **FR-005**: System MUST automatically provision SSL certificates for the configured domain via included Certbot integration inside the Docker Compose stack.
- **FR-006**: System MUST persist all essential state on the host machine. The database (PostgreSQL and any required cache like Redis) MUST be fully packaged locally in the Docker Compose network with attached Docker Volumes for persistence.

### Key Entities

- **Docker Compose Stack**: The blueprint defining all services, volumes, and networks.
- **Nginx Reverse Proxy**: The entry point managing external traffic mapping.
- **Environment Context (`.env`)**: Variables parsed during the deployment cycle.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A system administrator can fully deploy the application from scratch on a new VPS in under 5 minutes.
- **SC-002**: Only standard HTTP(S) ports (80/443) or a single specified custom port are exposed to the public internet.
- **SC-003**: 100% of internal container communication utilizes isolated Docker network DNS instead of public IPs.
- **SC-004**: Updating the application to a new version takes a single command and results in less than 30 seconds of system downtime.
