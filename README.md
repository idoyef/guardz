# User Entries Application

A complete full-stack web application for submitting and viewing user information, built with **NestJS** (TypeScript) backend and **React (Vite + TypeScript)** frontend. The application follows SOLID principles and clean architecture patterns, designed for deployment on GCP Compute Engine.

## 🚀 Project Overview

This application consists of:

- **Backend**: NestJS REST API with PostgreSQL database
- **Frontend**: React SPA with Vite + TypeScript (served by Nginx in production)
- **Database**: PostgreSQL with TypeORM
- **Deployment**: Docker containers with docker compose

## ✨ Features

### Backend (NestJS + TypeScript)

- ✅ RESTful API with validation
- ✅ PostgreSQL database with TypeORM
- ✅ Clean architecture (Controller → Service → Repository)
- ✅ Tests (unit/E2E)
- ✅ Docker containerization (multi-stage, Node 22, pnpm)
- ✅ Environment-based configuration

### Frontend (React + Vite + TypeScript)

- ✅ Responsive React application
- ✅ Form with real-time validation
- ✅ Component tests with Testing Library/Vitest
- ✅ Dockerized build served by Nginx

## 🏗️ Architecture

```
user-entries-app/
├── backend/                        # NestJS API (Port 8080 in container)
│   ├── src/
│   │   ├── config/                 # Database configuration
│   │   ├── entries/                # Entries module
│   │   │   ├── controllers/        # HTTP handlers
│   │   │   ├── services/           # Business logic
│   │   │   ├── repositories/       # Data access
│   │   │   ├── entities/           # Database entities
│   │   │   ├── dto/                # Data transfer objects
│   │   │   └── interfaces/         # Contracts
│   │   └── main.ts                 # Application entry
│   ├── test/                       # E2E tests
│   ├── Dockerfile                  # Production container (Node 22 + pnpm)
│   └── Dockerfile.dev              # Dev container (Node 22 + pnpm)
├── frontend/                       # React (Vite) app
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/               # API communication
│   │   ├── types/
│   │   └── App.tsx
│   ├── public/
│   ├── nginx.conf                  # SPA + proxy /api -> backend:8080
│   ├── Dockerfile                  # Production image (build → Nginx :80)
│   └── Dockerfile.dev              # Dev (Vite on :3000)
├── database/
│   └── init/                       # SQL scripts (optional)
├── docker-compose.yml              # Production deployment (public :80 only)
├── docker-compose.dev.yaml         # Development environment (hot reload)
└── README.md
```

## 🛠️ Quick Start

### Prerequisites

- Docker & Docker Compose (v2)
- (Optional for manual runs) **Node 22+** and **pnpm**

### 1. Clone and Setup

```bash
git clone <repository-url>
cd user-entries-app
```

### 2. Environment Configuration

```bash
# Backend environment
cp backend/env.example backend/.env
# Edit backend/.env with your database credentials

# Frontend (dev): optional
echo "VITE_API_BASE=/api" > frontend/.env
```

### 3. Run with Docker Compose

#### Development Environment

```bash
# Start all services with hot reload
docker compose -f docker-compose.dev.yaml up --build

# Services:
# - Frontend (Vite): http://localhost:3000
# - Backend API:     http://localhost:8080
# - PostgreSQL:      127.0.0.1:5432
```

**Dev notes**

- Vite proxy sends `/api/*` to `http://backend:8080` (Docker service name).
- Ports are bound to `127.0.0.1` (local-only).
- The frontend container sets `CI=true` and installs deps before `pnpm dev` to avoid TTY issues.

#### Production Environment

```bash
# Start all services in production mode
docker compose -f docker-compose.yml up -d --build

# Public:
# - Frontend (Nginx): http://<server-ip>  (exposes only :80)
# Internal only:
# - Backend (Nest) and Database (Postgres)
```

**Prod notes**

- Nginx proxies `/api/*` → `backend:8080` on the internal network → **no CORS needed**.

### 4. Manual Setup (Alternative)

#### Backend

```bash
cd backend
pnpm install
pnpm run start:dev   # http://localhost:8080
```

#### Frontend

```bash
cd frontend
pnpm install
pnpm dev             # http://localhost:3000
```

#### Database (Dockerized)

```bash
docker run --name postgres-dev   -e POSTGRES_DB=user_entries   -e POSTGRES_PASSWORD=password   -p 5432:5432 -d postgres:15-alpine
```

## 🧪 Testing

### Backend Tests

```bash
cd backend
pnpm test           # unit
pnpm run test:e2e   # e2e
```

### Frontend Tests

```bash
cd frontend
pnpm test
```

## 📊 API Documentation

### Endpoints

#### POST /entries

Create a new user entry

```bash
curl -X POST http://localhost:8080/entries   -H "Content-Type: application/json"   -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "123456789",
    "message": "Hello world"
  }'
```

#### GET /entries

Retrieve all user entries

```bash
curl http://localhost:8080/entries
```

### Data Schema

```typescript
interface Entry {
  id: string; // UUID
  name: string; // Max 100 chars, required
  email: string; // Max 255 chars, required, unique
  phone?: string; // Max 20 chars, optional
  message?: string; // Max 500 chars, optional
  createdAt: Date; // Auto-generated
  updatedAt: Date; // Auto-generated
}
```

## 🚀 GCP Deployment

### 1. Prepare GCP Compute Engine Instance

- Create a VM (e.g., Debian/Ubuntu), open **HTTP (80)**.
- Install Docker & the compose plugin on the VM.

### 2. Deploy Application

```bash
# On the VM
git clone <repository-url>
cd user-entries-app

cp backend/env.example backend/.env
# Edit production values

docker compose -f docker-compose.yml up -d --build
```

### 3. Configure Firewall

- Allow only **TCP 80** publicly. Backend (:8080) and DB are internal.

### 4. Access Application

- Frontend: `http://<EXTERNAL-IP>`
- Backend API (via Nginx proxy): `http://<EXTERNAL-IP>/api/entries`

## 🔧 Configuration

### Environment Variables

#### Backend (`backend/.env`)

```env
# Database
DB_HOST=database
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_DATABASE=user_entries

# Application
PORT=8080
NODE_ENV=production
```

#### Frontend

```env
# Dev optional (browser will call /api -> Vite proxy)
VITE_API_BASE=/api
```

### Docker Compose Configuration

- **database**: PostgreSQL 15 with persistent volume
- **backend**: NestJS API (internal-only in prod)
- **frontend**: Nginx serving static SPA and proxying `/api` → backend

## 🔒 Security Features

- **Input Validation**: DTOs with `class-validator`
- **SQL Injection Prevention**: Parameterized queries via TypeORM
- **CORS**: Typically disabled in prod (same-origin via Nginx). In dev, enable for `http://localhost:3000` if you bypass the proxy.
- **Environment Variables**: Secrets via env files/vars
- **Container Security**: Non-root Node user for backend; minimized images via multi-stage builds
- **Nginx**: SPA fallback + static caching; gzip (optional in config)

## 📈 Performance & Monitoring

### Health Checks

- **Frontend**: `GET /health` (Nginx)
- **Backend**: `GET /health` (recommended) or `GET /entries`
- **Database**: PostgreSQL service status / `pg_isready`
