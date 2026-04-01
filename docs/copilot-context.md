# Copilot Context

This project is a web platform to organize amateur tournaments for Dota 2.

Players register as complete teams. Each team has exactly 5 players.

One user registers the entire team by providing the Steam IDs of all players.

The platform allows organizers to:

* create tournaments
* open team registrations
* generate a tournament bracket
* record match results

The MVP supports only:

* team-based tournaments
* single elimination brackets
* manual match result reporting

Technology stack:

Frontend + backend:
Next.js (App Router)

Language:
TypeScript

Styling:
TailwindCSS + shadcn/ui

Database:
PostgreSQL

ORM:
Prisma

Architecture:

API Routes → Services → Repositories → Prisma Database
