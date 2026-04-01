# Dota 2 Amateur Tournament Platform — MVP Business Rules

## 1. Purpose

This document defines the **business rules for the MVP version** of the Dota 2 Amateur Tournament Platform.

The MVP focuses only on **team-based tournaments** where **pre-formed teams register together**.

The system intentionally avoids advanced features such as:

* solo player matchmaking
* automatic team balancing
* automatic match detection
* player statistics

The goal of the MVP is to provide a **simple and reliable tournament organizer** for amateur Dota 2 competitions.

---

# 2. Core Entities

The system contains the following main entities.

### User

A user account that can create tournaments and register teams.

### Tournament

An organized competition created by a user.

### Team

A group of players that participates in a tournament.

### Player

A Dota 2 player identified by their **Steam ID**.

### Match

A game played between two teams in the tournament bracket.

---

# 3. Tournament Creation

Any authenticated user can create a tournament.

Tournament fields:

```
name
description
max_teams
start_date
registration_deadline
format
```

Allowed formats (MVP):

```
single_elimination
```

Example:

```
Sunday Dota Cup
Max teams: 8
Format: Single Elimination
```

---

# 4. Tournament States

A tournament has the following states:

```
draft
registration_open
registration_closed
in_progress
completed
```

---

## Draft

Tournament has been created but registration is not open yet.

Organizer may edit tournament settings.

---

## Registration Open

Teams may register.

Conditions:

* number of teams < max_teams
* registration_deadline not reached

---

## Registration Closed

Registration ends when:

* max_teams reached
  OR
* registration_deadline passed

Teams cannot register after this point.

---

## In Progress

The tournament bracket is generated.

Matches can now be played and results recorded.

---

## Completed

The final match result has been recorded.

The champion team is declared.

---

# 5. Team Registration

A team must register as a complete roster.

Each team must provide:

```
team_name
captain_name
players[]
```

---

## Player Information

Each player must provide:

```
nickname
steam_id
```

Example:

```
Team Name: Radiant Kings

Players:

Player1 - SteamID
Player2 - SteamID
Player3 - SteamID
Player4 - SteamID
Player5 - SteamID
```

Team size rule:

```
exactly 5 players
```

Substitutes are not supported in MVP.

---

# 6. Team Registration Rules

A team may register only once per tournament.

The same Steam ID cannot appear in multiple teams within the same tournament.

Validation rules:

```
team must contain exactly 5 players
steam IDs must be unique
```

---

# 7. Bracket Generation

When registration closes, the organizer can generate the tournament bracket.

Supported bracket format:

```
Single Elimination
```

Example:

```
8 Teams

Quarterfinal
Semifinal
Final
```

Teams are seeded randomly.

---

# 8. Match Structure

Each match contains:

```
team_a
team_b
round
status
winner
```

Match statuses:

```
scheduled
completed
```

---

# 9. Match Result Reporting

Match results are entered manually by the organizer.

Process:

```
1. match played in Dota 2
2. organizer records winner
3. bracket updates automatically
```

The system automatically advances the winning team to the next round.

---

# 10. Tournament Bracket Progression

Single elimination progression example:

```
Quarterfinals
Team A vs Team B
Team C vs Team D

Semifinals
Winner 1 vs Winner 2

Final
Winner SF1 vs Winner SF2
```

---

# 11. Organizer Permissions

Organizer can:

```
create tournaments
edit tournament settings
open/close registration
generate bracket
record match results
complete tournament
```

Organizer cannot:

```
edit teams after bracket generation
```

---

# 12. Player Permissions

Players can:

```
register a team
view tournament bracket
view match results
```

Players cannot:

```
edit tournament settings
modify match results
```

---

# 13. Tournament Completion

A tournament is completed when:

```
final match winner is recorded
```

System records:

```
champion team
runner-up team
```

---

# 14. MVP Scope Limitations

The following features are intentionally excluded from the MVP:

```
solo player tournaments
automatic team balancing
match API integration
player statistics
team rankings
Discord integration
```

These features may be added in future versions.

---

# 15. MVP Design Principles

The MVP should prioritize:

```
simplicity
quick tournament creation
minimal friction for teams
clear bracket visualization
```

The platform should allow organizers to create and run tournaments with **minimal setup time**.
