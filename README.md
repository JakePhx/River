# LinkData

LinkData is a lightweight, Twitter-styled social application and supporting libraries. Users can post short messages, follow other users, block users, and view a recommended feed made from follows. The project is implemented with a clean architecture approach on the backend and a React-based frontend (uses `react-router`) on the client side.

## Key Features
- Create, read and list posts
- Follow and unfollow users
- Block and unblock users
- Recommended feed aggregated from followed users
- Clean, testable backend architecture (domain / application / infrastructure / interfaces)

Planned / in-progress features:
- Group functionality (coming soon)
- Robust notifications system (planned)

## Tech Stack
- Backend: NestJS (TypeScript)
- Database: Prisma ORM (schema located under `apps/api/prisma`)
- Security: JWT, bcrypt (implemented inside `apps/api/src/infrastructure/security`)
- Frontend: React with `react-router` (`apps/web`)
- Monorepo tooling: pnpm workspaces

## Project Structure (backend highlights)
- `apps/api/src/domain` - domain rules and business invariants
- `apps/api/src/application` - use-cases, DTOs and ports (clean architecture)
- `apps/api/src/infrastructure` - Prisma, repositories, config, security
- `apps/api/src/interfaces` - HTTP controllers, guards, filters and strategies
- `apps/web` - React-Router frontend project
- `packages/shared` - shared types, models and validators

## Getting Started (development)
Prerequisites:
- Node.js (>= 16)
- pnpm (recommended)
- PostgreSQL or other database supported/used by Prisma

1. Install dependencies (from repository root):

```bash
pnpm install
```

2. Backend: prepare environment

- Copy or create an `.env` file for the API. See `apps/api` for the environment validation and expected variables.
- Run Prisma migrations and generate client (from `apps/api`):

```bash
cd apps/api
pnpm install
pnpm exec prisma generate
pnpm exec prisma migrate dev --name init
```

3. Start the backend (development):

```bash
cd apps/api
pnpm run start:dev
```

4. Frontend

The frontend uses React and `react-router` for client-side routing, and redux-toolkit for state manageemtn. Typical start commands for the frontend project is:

```bash
pnpm install
pnpm run start:dev
```

Adjust the commands above to match the frontend's package scripts and folder layout.

## Architecture notes
The backend follows a Clean Architecture (hexagonal-inspired) style:
- `domain` contains business rules and validation
- `application` contains use-cases, DTOs and ports (interfaces) that define repository and service contracts
- `infrastructure` contains concrete implementations (Prisma repositories, security implementations like bcrypt and JWT signer)
- `interfaces` adapts the application layer to HTTP (controllers, guards, filters)

This separation makes business logic testable and independent of framework and persistence concerns.
