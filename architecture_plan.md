# VTT Headless Architecture and Functional Plan

This document defines the production architecture for a headless, authoritative virtual tabletop system. It is intentionally scoped as an MVP-first design: the first milestone is to prove a secure, consistent, authoritative backend and realtime state model before broadening to multiple client presentation targets, rule systems, or advanced content authoring tools.

The architecture is designed around one governing principle: the server is the sole authority for game state, state mutation validation, and authorization. Client applications may render, input commands, and display data, but they do not own or mutate the canonical truth.

---

## 1. Architectural Principles

### 1.1. Headless by Design
The platform is intentionally headless. The backend exists only to provide:
- authenticated API access
- authoritative game-state validation
- secure state mutation and persistence
- realtime event distribution
- identity and access control

Rendering, interaction UX, and tooling are intentionally separated and can be implemented by any client type without changing the core backend logic.

### 1.2. Server-Authoritative State Model
Every gameplay mutation must pass through the backend before it is accepted. The backend validates:
- the acting user
- campaign membership and role
- object ownership or permissions
- session rules and state validity
- deterministic calculation results
- conflict or turn-order requirements

This guarantees the same canonical state regardless of client type or platform.

### 1.3. MVP-First Scope
The initial implementation does not attempt to solve all rule systems, all clients, and all advanced authoring features at once. The project must first prove the following:
- authenticated session creation and role assignment
- authoritative dice evaluation
- stable game session state
- permissioned mutation model
- realtime propagation and client sync
- one end-to-end client target

Once this core is proven, the system can expand to 2D/3D rendering, Discord integration, mobile, custom classes, and broader rule-system support.

---

## 2. System Topology

### 2.1. Core Components
- Authoritative Compute Backend: Next.js 15 with App Router and TypeScript, deployed on Vercel Serverless and Edge Network.
- Identity Layer: Auth.js for browser-based sessions and a dedicated JWT flow for external clients.
- Real-Time Event Broker: Ably Realtime for persistent websocket connectivity and room-based broadcast delivery.
- Database Layer: Neon Serverless Postgres with Drizzle ORM for relational persistence and transactional state guarantees.
- Asset Storage: Vercel Blob for static or managed media, including textures and asset files.

### 2.2. Trust Boundaries
The architecture separates these trust domains explicitly:

1. Browser Application Identity
   - Auth.js session cookie or server session for web clients
   - bound to OAuth provider identity and user account

2. External Client Identity
   - JWT-based identity for mobile, desktop, and non-browser integrations
   - verified on every API request
   - restricted by audience, issuer, and expiry

3. Campaign Access Identity
   - session membership, role assignment, and permission mapping stored in the database
   - not inferred from presentation-layer state

4. Realtime Channel Authorization
   - Ably tokens derived from validated session identity and campaign membership
   - channel permissions are role- and session-aware

This separation is required to avoid mixing web-session semantics, external-device authorization, and campaign-level permissions into a single trust model.

---

## 3. MVP Scope and Feature Delivery Order

### Phase 0: Architecture Contracts and Hardening Requirements
Before implementation, the project must define:
- identity and auth model
- session membership and role model
- state schema versioning plan
- realtime event contract and replay rules
- object-level authorization matrix
- failure, retry, and reconnection design
- test strategy for invariants and auth flows

### Phase 1: Core Authoritative Engine
Deliverables:
- user and campaign model
- session creation and join flow
- role assignment (GM / player)
- authoritative dice API
- state mutation API
- persistence and migration model
- session snapshot and event history model

### Phase 2: Realtime Session Layer
Deliverables:
- room membership model
- Ably token issuance tied to campaign membership
- event message schema with versions and ids
- reconnect and replay model
- turn order and combat-state synchronization

### Phase 3: One Client Target
Deliverables:
- a single end-to-end client integration, preferably a web 2D client
- authoritative state rendering loop
- interaction translation layer
- session state resync on disconnect/reconnect

### Phase 4: Product Expansion
Only after core stability is proven:
- advanced state rules and conditions
- 3D web rendering
- discord interactions
- mobile clients
- asset management and Vercel Blob usage
- class builder / custom ruleset engine
- Fog of War and spatial intelligence

---

## 4. Core Functional Specifications

### M1: Authoritative Headless Dice Engine
The dice engine is the most important early backend capability because it establishes trust and deterministic logic.

Requirements:
- Accept a normalized request payload containing formula, system tag, modifiers, advantage/disadvantage values, and optional context
- Evaluate the calculation entirely server-side
- Return a deterministic result object containing:
  - formula
  - dice rolls
  - modifier totals
  - raw and final evaluation
  - critical hit or threshold flags
  - execution metadata
- Support standard d20 math, advantage/disadvantage, exploding dice logic, and system-specific critical evaluation

Key design rules:
- no client-side authoritative roll resolution
- no hidden server-side trust assumptions about client input
- dice output must be reproducible and auditable

### M2: Session and Combat State Model
Every campaign session maintains its own authoritative game state.

Requirements:
- each session has a unique state object
- each state mutation increments a version number
- each mutation is serialized and validated before persistence
- initiative ordering is computed server-side
- turn tracking, round tracking, and condition timing are server-authoritative

State responsibilities:
- initiative list
- current turn owner
- round counter
- active conditions with timers / expiration rules
- token placement and identity
- resource values and mutable tactical state

### M3: Spatial and Environment Ledger
The backend tracks spatial data in a canonical format, decoupled from rendering concerns.

Requirements:
- x/y/z coordinates stored as primitive numeric values
- orientation stored as normalized quaternion or equivalent canonical representation
- grid snap and conversion logic executed according to ruleset configuration
- movement and visibility calculations performed on the server
- clients receive normalized data but do not determine authoritative spatial truth

Important: the backend is responsible for spatial correctness, not the client rendering layer.

### M4: Rule-Agnostic Entity and Inventory Model
The system supports different rule systems but must preserve integrity through schema versioning.

Requirements:
- entities include stable ID, type, owner, parent session, and schema version
- attributes that vary by ruleset are stored in a structured, validated map
- status effects and conditions are constrained and typed
- inventory, resources, and combat state are represented with explicit semantics
- unsupported or malformed attributes are rejected at validation time

The goal is flexible rules support without creating unbounded schema chaos.

### M5: Realtime Event and State Broadcast Layer
The architecture must not rely on websocket transport as the source of truth.

Requirements:
- the backend sends state-change events only after successful validation and persistence
- each event contains:
  - event id
  - operation id
  - room id
  - actor id
  - entity id(s)
  - state version before and after
  - event type
  - payload
- clients apply events in order; duplicate or stale events are rejected or reconciled
- reconnect behavior uses authoritative snapshot + delta replay

This makes event ordering, state restoration, and replay possible even in the face of network disruption.

---

## 5. Authentication and Authorization Model

### 5.1. Identity Model Requirements
The system must cleanly distinguish between user identity and campaign-specific access.

Supported identities:
- browser user via Auth.js session
- external device user via JWT
- campaign participant via membership table and session role

Authentication rules:
- every request must be associated with a verified identity
- every request must be associated with an issuer and audience context if JWT is used
- tokens must include expiry and revocation metadata as required by the chosen auth strategy
- identity must be mapped to app-level user records before campaign permissions are checked

### 5.2. Authorization Model
Authorization occurs in a layered model:

1. User identity verification
2. Campaign membership lookup
3. Session role evaluation
4. Permission evaluation on target object or action
5. Final mutation validation

Roles:
- GM: full campaign control over state and room configuration
- Player: limited access to assigned entities, allowed actions, and visible map assets

Permissions must be explicit and object-scoped rather than implicit. The document should not rely on prose-only approximations like “players can write only to their assigned entities.” Instead, the architecture must specify:
- who owns an entity
- who can read or write it
- what action types are allowed
- what data is hidden from view
- what GM override paths exist

### 5.3. Ably Authorization Requirements
Ably tokens are not the primary identity mechanism. They are channel-access credentials.

Requirements:
- token generation occurs only after user identity and session membership are verified
- tokens carry only minimal permissions required for the active room
- channels are isolated by campaign or session room
- membership changes immediately affect authorized channel access
- inactive or revoked users cannot continue receiving room events

---

## 6. Data Model and Persistence Strategy

### 6.1. Core Relational Data
The backend should use relational tables for:
- users
- auth identities and provider mappings
- campaigns and sessions
- session members
- roles and permissions
- entities
- room state snapshots
- audit / event logs
- tokens and session metadata

### 6.2. Structured State Storage
The architecture should not rely on a single “everything is JSON” pattern. Instead:
- strongly typed relational tables for hot/critical fields
- versioned JSON payloads for flexible rules metadata
- explicit validation for schema and ruleset compatibility

This balances flexibility with integrity.

### 6.3. Schema Versioning
Each ruleset, entity type, or session state model must have a version. This reduces mismatches between:
- persisted state
- validation logic
- client expectations
- migration logic

Rules:
- state schema version must be explicit on each entity or session state object
- invalid versions are rejected
- migration logic must be deterministic
- backward compatibility is required for supported versions only

---

## 7. Security Requirements

### 7.1. Input Validation and Canonical Processing
All inputs must be validated before they are used to generate state transitions.

Required validation:
- payload structure validation
- user identity validation
- role and permission validation
- canonical numeric bounds checking
- type consistency constraints
- ruleset compliance checks

### 7.2. Abuse Protection
All public or semi-public API surfaces must be protected by:
- rate limiting
- request size caps
- auth verification on every mutation
- abuse detection for repeated invalid actions
- audit logging for sensitive actions

### 7.3. Sensitive Action Logging
Critical actions such as:
- auth changes
- campaign membership changes
- role escalations
- room takeover or ownership reassignment
- state rollback or replay events

must be auditable.

---

## 8. Operational Safety and Reliability

### 8.1. Failure Modes
Production architecture must explicitly plan for:
- Neon connection failures
- request timeouts
- event delivery delay or loss
- duplicate event replay
- reconnect storms
- role or permission mismatches
- stale client sessions
- corrupted state payloads

### 8.2. Retry and Replay Strategy
The system should define:
- idempotent mutation actions
- deduplication keys for repeated requests
- event sequence ordering constraints
- snapshot reconciliation on disconnect/reconnect
- dead-letter or retry queues for non-critical background work

### 8.3. Observability
The system requires visibility into:
- API auth failures
- mutation validation failures
- state conflicts
- session churn
- realtime delivery errors
- database transaction failures
- operational incidents affecting campaigns or rooms

---

## 9. Testing Strategy

The project should not rely on UI-only validation. The testing strategy must validate the foundations of the system interactively and deterministically.

### 9.1. Deterministic Unit Tests
- dice math and critical evaluation
- advantage/disadvantage calculation
- exploding dice support
- condition modifiers and rules evaluation
- conversion and normalization logic

### 9.2. Authorization and Security Tests
- unauthorized mutation denial
- invalid JWT rejection
- role boundary enforcement
- campaign membership validation
- hidden data access prevention

### 9.3. Realtime Integration Tests
- event ordering validation
- duplicate event handling
- room authorization correctness
- reconnect and replay logic
- state version mismatch handling

### 9.4. Load and Concurrency Tests
- simultaneous mutation handling
- Neon pooling under stress
- session concurrency under peak traffic
- room broadcast saturation behavior
- reconnect load behaviors

### 9.5. Regression and Migration Tests
- old state compatibility
- schema migration correctness
- ruleset compatibility across versions
- rollback safety for state changes

---

## 10. Recommended Delivery Sequence

### Stage 1: Core Backend Foundation
- user lifecycle and auth
- session and role model
- campaign membership
- dice engine
- session mutation API
- persistence model
- API authorization checks

### Stage 2: Realtime Core
- Ably token issuance
- event contract
- room events and message integrity
- replay and resync behavior
- session state sync

### Stage 3: Single Client Integration
- render authoritative state in one client target
- verify realtime sync and user interactions
- confirm permission enforcement and deterministic state updates

### Stage 4: Production Hardening
- auth security review
- load testing
- event replay testing
- operational runbooks
- incident response

### Stage 5: Feature Expansion
- 3D rendering
- Discord integrations
- mobile clients
- custom class builder
- deep spatial and occlusion systems
- asset pipeline and content authoring tools

---

## 11. Final Architectural Assessment

The proposed architecture is viable as a production-grade system, but only if it remains disciplined and MVP-first. The project should not expand into all presentation clients, complex rule engines, and advanced authoring layers before the authoritative backend and realtime state contract are proven.

The highest-priority success criteria are:
- authoritative state correctness
- secure identity and authorization boundaries
- deterministic game logic
- strong event ordering and replay semantics
- explicit validation and versioning
- measurable production readiness before feature breadth is increased

Once these are satisfied, the architecture can expand into the broader VTT platform described in the original vision.

---

## 12. File and Route Blueprint

The following file and route structure should be treated as a target for the implementation phase:

- app/api/auth/...
- app/api/sessions/...
- app/api/campaigns/...
- app/api/rooms/...
- app/api/v1/dice/roll/route.ts
- app/api/v1/turns/route.ts
- app/api/v1/entities/route.ts
- app/api/v1/permissions/route.ts
- lib/auth/...
- lib/state/...
- lib/validation/...
- lib/realtime/...
- db/schema.ts
- db/migrations/...
- tests/unit/...
- tests/integration/...
- tests/load/...

This is a blueprint for implementation progression, not an assumption that all routes and modules must be created before validating the core backend.

---

## 13. Summary

This architecture turns the original concept into a practical, production-oriented backend-first plan. It shifts the project away from a broad product vision and toward a controlled engineering sequence designed to validate the assumptions that matter most:
- can the server be authoritative?
- can clients trust it?
- can state remain consistent and secure under realtime usage?
- can the platform expand without breaking its contracts?

The answer is yes, but only if the architecture remains disciplined, scoped, and validated at each stage.
