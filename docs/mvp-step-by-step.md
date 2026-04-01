# Dota 2 Tournament Platform — MVP Step-by-Step

_Last updated: 2026-03-26_

## Goal

Deliver a usable MVP where organizers can:

1. Create tournaments.
2. Open registrations.
3. Register full teams (5 players).
4. Generate a single-elimination bracket.
5. Report match results.
6. Finish the tournament with a champion.

---

## Current Status Snapshot

### Already done

- [x] Next.js + TypeScript + Prisma project structure is in place.
- [x] PostgreSQL schema and initial migration exist for users, tournaments, teams, players, and matches.
- [x] Authentication exists (Google, Discord, plus dev credentials login in development).
- [x] Tournament CRUD basics exist:
  - [x] list tournaments
  - [x] create tournament
  - [x] get tournament details
- [x] Tournament status transitions exist for organizer:
  - [x] `DRAFT -> REGISTRATION_OPEN`
  - [x] `REGISTRATION_OPEN -> REGISTRATION_CLOSED`
- [x] Team registration flow exists (UI + API + service + repository).
- [x] Team validation rules are enforced:
  - [x] exactly 5 players
  - [x] unique Steam IDs in the same team
  - [x] unique Steam IDs across tournament teams
  - [x] unique team name per tournament
- [x] Bracket generation endpoint exists and sets tournament to `IN_PROGRESS`.
- [x] Match result endpoint exists and marks a match as completed with a winner.
- [x] Tournament and bracket pages exist in the UI.

### Partially done / pending

- [ ] Automatic close by `registration_deadline` is not implemented yet.
- [x] Bracket progression (advance winner to next match) is implemented.
- [x] Full bracket tree (later rounds linked with `nextMatchId`) is implemented.
- [x] Tournament auto-completion on final match result is implemented.
- [ ] Tournament completion flow is not wired end-to-end in UI (status updates are automatic from final result).
- [ ] MVP acceptance tests (integration/e2e) are not implemented yet.

---

## MVP Execution Plan (Follow in Order)

## Step 1 — Environment and baseline verification

### Objective
Ensure local development is healthy before feature completion.

### Tasks

- [ ] Confirm `.env` contains required variables (`DATABASE_URL`, `AUTH_SECRET`, OAuth keys).
- [ ] Run migrations and verify DB connectivity.
- [ ] Start app and confirm sign-in + tournament pages load.

### Done when

- [ ] App starts without runtime errors.
- [ ] You can sign in and access `/tournaments`.

---

## Step 2 — Enforce registration deadline behavior

### Objective
Match business rule: registration closes when max teams is reached **or** deadline passes.

### Tasks

- [ ] Add service logic to block new registration if current time is past `registrationDeadline`.
- [ ] Auto-set status to `REGISTRATION_CLOSED` when deadline has passed and registration was still open.
- [ ] Decide trigger strategy:
  - [ ] API-read trigger (close on read/write actions), or
  - [ ] scheduled job/cron trigger.
- [ ] Update tournament detail/list reads to reflect closed status quickly.

### Done when

- [ ] Teams cannot register after deadline.
- [ ] Tournament status becomes `REGISTRATION_CLOSED` after deadline.

---

## Step 3 — Build full bracket progression

### Objective
Support complete single-elimination lifecycle, not only first-round results.

### Tasks

- [ ] Update bracket generation to create all rounds.
- [ ] Link matches using `nextMatchId` so each match knows where winner advances.
- [ ] Handle winner placement into next round (team A or team B slot).
- [ ] Keep seeding random for round 1.

### Done when

- [ ] Bracket includes quarter/semi/final (depending on team count).
- [ ] Every non-final match points to a valid next match.

---

## Step 4 — Implement winner advancement on result submission

### Objective
Match business rule: reporting a winner should automatically progress bracket.

### Tasks

- [ ] Extend `recordMatchResult` to:
  - [ ] mark current match completed
  - [ ] place winner into next linked match
  - [ ] detect when final is completed
- [ ] Prevent invalid operations:
  - [ ] reporting result twice
  - [ ] winner not in current match
  - [ ] advancing into a locked/invalid next match slot

### Done when

- [ ] Submitting result updates next-round match automatically.
- [ ] Final winner can be derived from final match result.

---

## Step 5 — Wire tournament completion end-to-end

### Objective
Allow tournament to move from `IN_PROGRESS` to `COMPLETED` safely.

### Tasks

- [ ] Expose API route for completion action (organizer only).
- [ ] Add UI action/button for organizer on tournament page.
- [ ] Reuse existing rule: all matches must be completed.
- [ ] Show champion in UI when completed.

### Done when

- [ ] Organizer can complete tournament only after all matches are complete.
- [ ] Status shows `COMPLETED` and champion is visible.

---

## Step 6 — Strengthen MVP quality gates

### Objective
Reduce risk before production deployment.

### Tasks

- [ ] Add integration tests for core APIs:
  - [ ] create tournament
  - [ ] register team
  - [ ] generate bracket
  - [ ] submit result
  - [ ] complete tournament
- [ ] Add at least one end-to-end happy path test.
- [ ] Validate edge cases:
  - [ ] duplicate Steam IDs
  - [ ] registration after deadline
  - [ ] invalid state transitions

### Done when

- [ ] Core flows are covered by automated tests.
- [ ] CI passes consistently.

---

## Step 7 — MVP release checklist

### Objective
Ship a stable MVP release.

### Tasks

- [ ] Verify production environment variables.
- [ ] Run Prisma migration in target environment.
- [ ] Smoke test critical flows in production-like environment.
- [ ] Document known limitations (out of MVP scope):
  - [ ] no solo matchmaking
  - [ ] no auto match detection from Dota API
  - [ ] no substitutes
  - [ ] no advanced stats

### Done when

- [ ] MVP is deployable with known constraints documented.

---

## Suggested Implementation Order for the Next Sprint

1. Step 2 (deadline behavior)
2. Step 3 (full bracket structure)
3. Step 4 (winner auto-advance)
4. Step 5 (completion + champion)
5. Step 6 (tests)
6. Step 7 (release)

---

## Quick Progress Tracker

- MVP foundation: 80% complete
- Core missing behavior: registration deadline auto-close and test coverage
- Highest risk if skipped: registration status drift after deadline
