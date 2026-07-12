# Dota 2 Amateur Tournament Platform

A web platform to organize amateur Dota 2 tournaments — built with Next.js, TypeScript, Prisma, and TailwindCSS.

Supports single-elimination tournaments with full bracket progression, TBD slots, rank-capped registration, and media uploads for tournaments and teams.

## Stack

- **Runtime / Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Database**: PostgreSQL
- **ORM**: Prisma 7
- **Auth**: NextAuth v5 (Auth.js) with Google & Discord
- **Storage**: Supabase Storage (team logos and tournament images)
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
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only) |

### 3. Run database migrations

```bash
npx prisma migrate dev
```

### 4. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Database Schema (Current)

### Core tournament models

- **Tournament**
  - Core fields: `name`, `description`, `maxTeams`, `startDate`, `registrationDeadline`, `format`, `status`
  - Organizer relation: `organizerId -> User`
  - Media and links: `imageUrl`, `discordUrl`, `streamUrl`
  - Financial fields: `entryFee`, `prizePool` (`Float`), `currency` (default `USD`)
  - Rule fields: `region`, `maxRankTier`

- **Team**
  - Core fields: `teamName`, `captainName`, `tournamentId`
  - Media: `logoUrl`
  - Registration ownership: `registeredById -> User` (nullable, `SET NULL` on user delete)
  - Unique constraint per tournament: `(teamName, tournamentId)`

- **Player**
  - Core fields: `nickname`, `steamId`, `teamId`
  - Indexed by `steamId` and `teamId`

- **Match**
  - Bracket graph fields: `nextMatchId`, `nextMatchSlot` (`TEAM_A` | `TEAM_B`)
  - Team slots are nullable (`teamAId`, `teamBId`) to support TBD bracket positions
  - Result field: `winnerId`

### Enums

- `TournamentFormat`: `SINGLE_ELIMINATION`
- `TournamentStatus`: `DRAFT`, `REGISTRATION_OPEN`, `REGISTRATION_CLOSED`, `IN_PROGRESS`, `COMPLETED`
- `MatchStatus`: `SCHEDULED`, `COMPLETED`
- `MatchSlot`: `TEAM_A`, `TEAM_B`

### Recent migration highlights

- Added tournament metadata: `image_url`, `discord_url`, `stream_url`, `region`, `max_rank_tier`
- Added financial fields: `entry_fee`, `prize_pool` (migrated to `DOUBLE PRECISION`), `currency`
- Added team metadata and ownership: `logo_url`, `registered_by_id`
- Enhanced bracket tree support with nullable match slots and `next_match_slot`

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
  migrations/           # Database migration history
```

## Architecture

```
API Route → Service → Repository → Prisma → PostgreSQL
```

## Key API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/tournaments` | Create a tournament |
| `GET` | `/api/tournaments/:id` | Get tournament details |
| `PUT` | `/api/tournaments/:id` | Edit tournament |
| `DELETE` | `/api/tournaments/:id` | Delete tournament |
| `POST` | `/api/tournaments/:id/open-registration` | Open tournament registration |
| `POST` | `/api/tournaments/:id/close-registration` | Close tournament registration |
| `POST` | `/api/tournaments/:id/teams` | Register a team |
| `GET` | `/api/tournaments/:id/teams` | List registered teams |
| `PUT` | `/api/tournaments/:id/teams/:teamId` | Edit a registered team |
| `POST` | `/api/tournaments/:id/generate-bracket` | Generate bracket |
| `POST` | `/api/matches/:id/result` | Record match result |
| `POST` | `/api/upload/logo` | Upload a team logo image |
| `POST` | `/api/upload/tournament-image` | Upload a tournament cover image |
| `GET` | `/api/steam/:accountId` | Fetch player profile from OpenDota |
