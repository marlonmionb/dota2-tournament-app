# Dota 2 Amateur Tournament Platform

A web platform to organize amateur Dota 2 tournaments — built with Next.js, TypeScript, Prisma, and TailwindCSS.

## Stack

- **Runtime / Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Database**: PostgreSQL
- **ORM**: Prisma 7
- **Auth**: NextAuth v5 (Auth.js) with Google & Discord
- **Validation**: Zod

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` | Random secret (`openssl rand -base64 32`) |
| `ENABLE_DEV_LOGIN` | Optional in development (`true` by default, set `false` to disable) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth credentials |
| `DISCORD_CLIENT_ID` / `DISCORD_CLIENT_SECRET` | Discord OAuth credentials |

### 3. Run database migrations

```bash
npx prisma migrate dev --name init
```

### 4. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
  app/                  # Next.js pages and API routes
    api/
      auth/             # NextAuth handler
      tournaments/      # Tournament CRUD + team registration + bracket
      matches/          # Match result reporting
    tournaments/        # UI pages
  lib/                  # Prisma client, Auth config, validations, business rules
  repositories/         # Database access layer
  services/             # Business logic layer
  types/                # Shared TypeScript types

prisma/
  schema.prisma         # Database schema
```

## Architecture

```
API Route → Service → Repository → Prisma → PostgreSQL
```

## Key API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/tournaments` | List all tournaments |
| `POST` | `/api/tournaments` | Create a tournament |
| `GET` | `/api/tournaments/:id` | Get tournament details |
| `POST` | `/api/tournaments/:id/teams` | Register a team |
| `POST` | `/api/tournaments/:id/generate-bracket` | Generate bracket |
| `POST` | `/api/matches/:id/result` | Record match result |
