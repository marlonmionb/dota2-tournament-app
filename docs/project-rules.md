# Project Rules — Dota 2 Amateur Tournament Platform (MVP)

## 1. Purpose

This document defines the **technical and development rules** for the Dota 2 Amateur Tournament Platform.

These rules guide:

* developers working on the project
* AI coding assistants such as GitHub Copilot

All generated code must follow these conventions to maintain consistency, readability, and scalability.

---

# 2. Project Stack

The project must use the following technology stack.

Frontend / Backend framework:

* Next.js

Language:

* TypeScript only (no plain JavaScript)

Styling:

* TailwindCSS

Database:

* PostgreSQL

ORM:

* Prisma

Deployment:

* Vercel (frontend + API routes)
* PostgreSQL hosted on Supabase or Neon

---

# 3. Architecture

The MVP uses a **monolithic web application architecture**.

The Next.js application contains:

* frontend UI
* backend API routes
* server-side logic

No separate backend service should be introduced in the MVP.

Architecture overview:

```
Next.js Application
    ├─ UI Pages
    ├─ API Routes
    └─ Database Access (Prisma)
```

---

# 4. Folder Structure

The repository must follow this structure.

```
/apps
  /web

/src
  /app
  /components
  /lib
  /services
  /repositories
  /types

/prisma
  schema.prisma

/docs
  mvp-business-rules.md
  project-rules.md
```

---

# 5. Code Style Rules

Language:

* TypeScript only

Linting:

* ESLint

Formatting:

* Prettier

Naming conventions:

Files:

```
kebab-case
```

Example:

```
create-tournament-form.tsx
tournament-bracket.tsx
register-team-service.ts
```

React components:

```
PascalCase
```

Example:

```
TournamentBracket.tsx
TeamRegistrationForm.tsx
```

Variables:

```
camelCase
```

---

# 6. React Guidelines

React components must follow these rules.

Components should be:

* small
* reusable
* single responsibility

Business logic must not be placed directly inside UI components.

Instead it must be placed in:

```
/services
```

Example:

```
services/create-tournament.ts
```

---

# 7. Backend Architecture

API routes must follow a layered architecture.

Layers:

```
API Route
↓
Service
↓
Repository
↓
Database
```

Responsibilities:

API Route:

* handle HTTP requests
* validate input

Service:

* contain business logic
* enforce business rules

Repository:

* handle database operations

---

# 8. Database Access Rules

All database access must go through Prisma.

Direct SQL queries should be avoided unless absolutely necessary.

Tables must use:

```
snake_case
```

Example:

```
tournaments
teams
players
matches
team_players
```

Primary keys should use:

```
UUID
```

---

# 9. Validation Rules

All user input must be validated.

Recommended validation library:

```
zod
```

Validation must occur at:

* API request boundary
* service layer

Example validations:

* team must contain exactly 5 players
* steam IDs must be unique
* tournament max teams must be positive

---

# 10. Error Handling

All API endpoints must implement consistent error handling.

Error response format:

```
{
  error: "error_message"
}
```

HTTP status codes must follow REST conventions.

Examples:

```
400 - validation error
404 - resource not found
500 - internal server error
```

---

# 11. API Design

The API must follow REST conventions.

Example endpoints:

Create tournament:

```
POST /api/tournaments
```

List tournaments:

```
GET /api/tournaments
```

Register team:

```
POST /api/tournaments/{id}/teams
```

Generate bracket:

```
POST /api/tournaments/{id}/generate-bracket
```

Report match result:

```
POST /api/matches/{id}/result
```

---

# 12. Authentication (MVP)

Authentication can be implemented using:

NextAuth

Supported providers:

* Google
* Discord
* email

Authentication is required for:

* creating tournaments
* registering teams
* managing matches

Viewing tournaments does not require authentication.

---

# 13. Bracket Generation Rules

Bracket generation must occur only when:

```
registration_closed
```

Once generated:

* teams cannot change
* registration cannot reopen

Bracket generation must:

* seed teams randomly
* generate matches for the first round

---

# 14. Match Result Rules

Match results can only be recorded when:

```
tournament status = in_progress
```

When a match winner is recorded:

* the winning team advances to the next round automatically

---

# 15. Testing

Testing framework:

```
Vitest
```

Tests must cover:

* tournament creation
* team registration rules
* bracket generation
* match progression

---

# 16. Performance Rules

Queries must avoid unnecessary joins.

Frequently accessed data should be indexed.

Recommended indexes:

```
tournament_id
team_id
match_id
```

---

# 17. Security Rules

The following must be enforced:

* validate all user input
* never expose database credentials
* never expose server environment variables to frontend

Environment variables must be stored in:

```
.env
```

---

# 18. Documentation Rules

All major modules must contain comments explaining their purpose.

Complex logic such as bracket generation must be documented.

Project documentation must be stored in:

```
/docs
```

---

# 19. AI Code Generation Rules

When AI assistants generate code they must:

* follow this document
* follow the business rules document
* use TypeScript
* use Prisma for database access
* follow the defined folder structure
* avoid introducing additional frameworks

---

# 20. MVP Scope Protection

Developers must avoid adding features outside the MVP scope.

Excluded features include:

```
solo tournaments
match automation
player statistics
team rankings
```

These features must only be implemented after the MVP is stable.
