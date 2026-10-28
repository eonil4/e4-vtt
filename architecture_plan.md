# VTT Headless Architecture and Functional Plan

This document defines a production-ready, 100 percent headless, decoupled VTT architecture. The backend functions strictly as an authoritative stateless API and real-time state orchestrator via WebSockets. It is completely agnostic of the rendering layer, natively driving concurrent presentation clients such as 2D Web via Pixi.js, 3D Web via Three.js, Discord via Text and Rich Embeds, and Mobile via Unity.

---

## 1. Architecture and Technology Stack

### System Topology
- Authoritative Compute Backend: Next.js 15 using App Router and TypeScript, deployed on Vercel Serverless and Edge Network. It acts exclusively as a headless JSON API gateway.
- Identity and Access Management: Auth.js for web-based Discord OAuth2 federation, coupled with stateless JSON Web Tokens for decoupled non-browser clients like Unity standalone, Mobile app, or separate Three.js nodes.
- Agnostic Real-Time Event Broker: Ably Realtime. Handles all persistent TCP connections via WebSockets. The backend computes state changes and broadcasts raw delta frames into isolated room nodes mapped via the campaign ID parameter.
- Database and Persistence: Neon Serverless Postgres with transactional connection pooling managed via Drizzle ORM to survive high concurrent stateless bursts across multiple sessions.
- Media Asset Delivery: Vercel Blob. Fast, edge-cached storage holding separate index directories for 2D textures and 3D mesh assets.

---

## 2. Decoupled Functional Specifications

### M1: Authoritative Headless Dice Engine
- Stateless Request Payload: Accepts a system-agnostic signature layout containing the formula string, target system family, and modifier variables.
- Unified Return Payload: Returns an absolute semantic JSON structure containing execution arrays, die-face arrays, exploding iteration details, and final scalar metrics.
- Core Game Mechanics:
  * Algebraic d20 Evaluation: Computes standard d20 plus modifiers math formulas against Target DCs or ACs.
  * Advantage and Disadvantage: Triggered via client-side toggles; the server rolls two d20s and returns the evaluation alongside both raw results.
  * Earthdawn Step-Die Engine: Translates dynamic Actor Step values into a discrete die group array (for example, Step 14 evaluates to 2d6 plus 1d8). It natively handles exploding mechanics securely on the server.
  * Critical Hit Logic: Automatically identifies natural 20s or system-specific critical thresholds, flags the entry, and doubles damage dice pools.

### M2: Spatial and Environment Ledger
- Decoupled Vector Coordinates: The database registers spatial attributes as raw float fields (posX, posY, posZ) alongside full orientation quaternions.
- Core Game Mechanics:
  * Grid Snapping: Token entities snap mathematically to the center of the nearest 5-foot square or hexagonal grid coordinate. Clients handle the visual snap using the raw transform vectors emitted by the server.
  * Movement Ruler: Computes vector lines dynamically during drag operations, returning cumulative distance traversed while factoring in modular difficult terrain modifiers.
  * Abstract Fog of War Map: Line-of-sight algorithms generate spatial polygon vertices on the server based on token sight configurations like Darkvision range, allowing the rendering client to process occlusion locally via WebGL shaders or 3D geometry clipping.

### M3: Rule-Agnostic State and Inventory Matrix
- Polymorphic Schema: Entity tables use a highly schema-less document map jsonb block. Attributes are mapped into relational dictionary bindings, decoupling properties (such as D&D Dexterity Score vs Earthdawn Dexterity Step).
- Core Game Mechanics:
  * Click-to-Roll Integration: Clicking Attributes, Skills, or Weapon nodes on any client fires secure math formulas directly to the dice rolling endpoint.
  * Dynamic Resource Tracking: Real-time mutation workflows for volatile state columns like Hit Points, Spell Slots, or Karma points directly from the token HUD or character dashboard.
  * Status Conditions: Attaching status effects (like Prone, Stunned, or Blinded) injects automatic evaluation flags. These modifiers apply mechanical penalties directly to server-side dice requests or restrict canvas viewport visibility variables.

### M4: Multi-Session Combat State Machine
- Isolated Turn-Tracking: Every unique session maintains its own discrete state machine inside the database. Advancing turns triggers structural mutations in Neon and broadcasts a unified payload via Ably. Rendering engines catch this payload to animate localized UI elements (such as pulsing 2D shaders, 3D spotlight shifts, or Discord channel announcement updates).
- Core Game Mechanics:
  * Initiative Automation: Actors trigger an instant server roll that maps results directly onto that session's layout, sorting descending based on rule-set priorities.
  * Turn and Duration Tracking: Increments game rounds dynamically and automatically counts down or purges active status conditions when a character's turn starts or ends.

### M5: Discord Serverless Interaction Layer
- Dynamic Guild Mappings: Listens to a secure interactions route to evaluate slash parameters. The webhook reads the sender's Discord Guild/Channel ID, cross-references it in the Neon database to find the linked VTT Campaign ID, and executes rules contextually within 3 seconds.
- Core Game Mechanics:
  * Remote Dice Commands: Evaluates roll slash parameters, returning cryptographic results directly inside Discord chat via rich embeds.
  * Event Notifications: Fires critical hits, catastrophic failures, lethal death saving throws, and initiative alerts as stylized Rich Embed notifications directly into configured Discord server channels.

### M6: Headless Authentication and Authorization
- Browser Clients (Web 2D and 3D): Authenticate via OAuth2 using the Discord Provider via Auth.js, storing session cookies natively.
- Non-Browser Clients (Mobile, Unity): Authenticate via a dedicated token exchange endpoint that verifies OAuth states and returns a short-lived, state-independent JWT signed with HMAC-SHA256.
- Role-Based Access Control (RBAC): Every database campaign entry maps users to explicit session roles: GAMEMASTER or PLAYER.
  * GAMEMASTER: Full read/write over all scene matrices, visibility flags, Fog of War layers, and NPC entities.
  * PLAYER: Read-only for map assets, read/write restricted strictly to entities explicitly assigned to their User ID.
- Tokenized Ably Authorization: The Ably token generation endpoint parses the active client JWT or Cookie, verifies campaign membership in Neon, and encodes restricted channel permissions.

### M7: Interactive Custom Prestige Class and Subclass Builder
- Agnostic Blueprint Schema: Deploys a flexible JSON schema structure stored in Neon to represent dynamic class progression trees. Gamemasters or authorized designers can build custom Prestige Classes directly via endpoints.
- Core Builder Mechanics:
  * Prerequisites Engine: Encodes conditional evaluation nodes for level-up validation. Prerequisites support d20 minimum Base Attack Bonuses (BAB), specific feat strings, attribute thresholds, skill-rank allocations, or cross-system equivalents (e.g., Earthdawn Circle steps).
  * Dynamic Progression Matrices: Maps level-by-level scalar rewards (Hit Die modifications, Saving Throw bonuses, Base Attack progressions) and complex arrays of customized clickable features.
  * Polymorphic Spellcasting / Resource Scaling: Integrates configurable progression paths allowing custom classes to either scale up existing caster levels (+1 level of existing spellcasting class) or build a standalone resource curve with dedicated unlock slots.
  * Client Presentation Autonomy: The JSON output serves as a responsive blueprint contract. Web clients interpret it into interactive node-based drag-and-drop dashboards, while mobile or text clients present it as sequential select menus or rich reference documentation.

---

## 3. Technical Core Blueprints (Headless Contract Architecture)

### 3.1. Authoritative Dice Engine Return Contract Spec
- File Endpoint Path: app/api/v1/dice/roll/route.ts
- Operation: Captures incoming POST requests containing formula strings, system tags, and optional advantage parameters. It computes mathematical evaluations entirely server-side and responds with JSON metadata including a unique roll ID, execution timestamps, an array of individual die results, constant modifiers, final totals, and critical outcome flags.

### 3.2. Headless Agnostic Database Schema Architecture
- File Configuration Path: db/schema.ts
- Operation: Utilizes Drizzle ORM pgTable structures to construct relational tables inside Neon Postgres. The core layout maps global user tables, master campaign configuration records, session role-mapping junction tables (handling Gamemaster and Player RBAC partitions), and a spatial entities data block storing absolute double-precision float matrices (posX, posY, posZ), raw quaternion orientation blocks, polymorphic jsonb system blocks, and multi-format graphics metadata.
