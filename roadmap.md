# VTT Headless Platform MVP Roadmap

This roadmap narrows the project to a production-first MVP centered on a single ruleset, a single authoritative backend, and a single client target. The goal is to prove the core architecture before broadening to multiple clients, advanced tactical systems, or custom ruleset tooling.

The initial ruleset is Star Wars Revised Edition, selected because it provides a bounded, gameplay-rich, combat-driven foundation suitable for validating the backend architecture.

---

## 1. Design Principles

- The backend is the sole authority for game state and permissions.
- A single client target is used to validate the full flow from session creation to real-time state sync.
- The first release proves identity, combat, movement, dice resolution, and session integrity.
- Additional features are deferred until the backend contract is stable and testable.

---

## 2. Timeline Overview

- Phase 0: Architecture Contracts and Validation Design (Week 1)
- Phase 1: Star Wars Revised Edition MVP Foundation (Weeks 2 to 5)
- Phase 2: Real-Time Combat and Session Playtest (Weeks 6 to 8)
- Phase 3: Production Hardening and Expansion Readiness (Weeks 9 to 12)

---

## 3. Phase Breakdown and Deliverables

### Phase 0: Architecture Contracts and Validation Design (Week 1)
- Goal: Define the canonical architecture before implementation begins.
- Deliverables:
  * final auth model for browser + external client identity
  * session membership and role model
  * state schema versioning plan
  * realtime event contract and replay rules
  * object-level permission model
  * failure, retry, and reconnect strategy
  * acceptance tests for dice, state mutation, and auth

### Phase 1: Star Wars Revised Edition MVP Foundation (Weeks 2 to 5)
- Goal: Build the first full game-session backend for a bounded ruleset and one client target.
- Core deliverables:
  * Next.js app scaffold and API routing structure
  * Neon Postgres schema for users, sessions, members, roles, characters, and state
  * Auth.js session handling and external JWT flow
  * middleware-based auth and permission enforcement
  * server-authoritative dice engine
  * character creation, attributes, skills, talents, wounds, strain, and credits
  * initiative and turn-tracking engine
  * combat action validation and damage resolution
  * token placement and movement model
  * Ably room-token issuance and channel permission mapping
  * session snapshot and event history model

- MVP rules subset:
  * attributes: Brawn, Agility, Intellect, Cunning, Willpower, Presence
  * skill checks and opposed checks
  * initiative order and turn resolution
  * wound and strain tracking
  * simple ranged and melee combat flows
  * basic map/tile movement with canonical server-side coordinates

### Phase 2: Real-Time Combat and Session Playtest (Weeks 6 to 8)
- Goal: Prove that an authoritative backend and a single web client can support a real live session.
- Deliverables:
  * realtime state sync to connected clients
  * reconnect and snapshot replay
  * event ordering and version validation
  * combat UI and initiative tracker
  * character sheet panel and dice roll display
  * map layer with token control and movement interactions
  * gameplay test scripts for repeated playthroughs
  * auth and permission verification under concurrent sessions

- Acceptance criteria:
  * GM creates a session
  * players join and are assigned roles
  * characters are created and persisted
  * skill checks are resolved server-side
  * initiative order is deterministic
  * combat actions update authoritative state
  * a client receives consistent state updates after reconnect

### Phase 3: Production Hardening and Expansion Readiness (Weeks 9 to 12)
- Goal: Turn the MVP into a stable, operationally defensible backend before broadening feature scope.
- Deliverables:
  * load testing and connection-pooling validation
  * auth security review and token lifecycle review
  * event replay and stale-message handling
  * observability, metrics, and incident runbooks
  * migration safety checks and version compatibility validation
  * audit logging for auth, permissions, and state mutation
  * final evaluation of whether to expand to additional clients or advanced systems

---

## 4. Out-of-Scope for the Initial MVP

The following are explicitly deferred:
- 3D rendering and WebGL viewports
- Discord text integration
- mobile client parity
- full machine-generated class builder
- advanced Fog of War and spatial occlusion systems
- arbitrary multi-system rules authoring
- broad asset workflow and Vercel Blob expansion
- complex custom rule-engine tooling

---

## 5. Proposed Phase 1 Task Breakdown

### Core Backend
- initialize monorepo and app skeleton
- configure Neon Postgres and Drizzle schema
- create users, campaigns, sessions, members, and roles
- add auth middleware and session verification
- add rule-set versioning and schema validation

### Combat and Rules Engine
- implement authoritative dice endpoint
- define skill resolution model
- implement initiative order and turn progression
- implement damage, wounds, and strain logic
- define condition handling and state updates

### Realtime and Client Integration
- configure Ably token issuance for room access
- define canonical event payload format
- send server-validated session updates to clients
- build one web 2D board client for session interaction
- validate reconnect and replay behavior

### Verification
- unit tests for dice and combat logic
- authorization tests for GM/player actions
- realtime integration tests for ordering and replay
- load tests for concurrent sessions

---

## 6. Definition of Done for the MVP

The MVP is successful when all of the following are true:
- a GM can create a campaign and session
- players can join and be assigned roles
- characters can be created and updated
- skill checks resolve server-side and deterministically
- initiative and combat flow correctly
- movement and token placement are authoritative
- clients receive consistent updates in real time
- session state survives reconnects and replays
- authorization boundaries hold under invalid input and malicious requests

---

## 7. Recommendation

The project should not broaden to multi-client verification, spatial occlusion, custom class authoring, or Discord support until Phase 1 and Phase 2 are complete and stable. The Star Wars Revised Edition MVP is the correct proving ground for the architecture because it is bounded, combat-centric, and operationally realistic without introducing unnecessary product risk.

This roadmap keeps the original vision intact while turning it into an execution plan that can be shipped, tested, and validated in a disciplined sequence.
