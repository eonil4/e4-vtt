# Headless Virtual Tabletop (VTT) Core Engine

A production-ready, 100 percent headless, decoupled Virtual Tabletop backend engineered as an authoritative stateless API and real-time state orchestrator. 

This engine is completely agnostic of the rendering layer, natively driving concurrent presentation clients such as 2D Web via Pixi.js, 3D Web via Three.js, Discord text bots, and Mobile or Desktop apps via Unity.

---

## Core System Features

### Authoritative Server-Side Dice Engine
Prevents client-side manipulation by evaluating all dice math on the server. Features an algebraic d20 engine for advantage/disadvantage mechanics and an exploding Step-Die engine optimized for mechanics like Earthdawn.

### Agnostic Spatial and Environment Ledger
Registers token positioning as raw float matrices and full orientation quaternions in the database. Supports real-time grid snapping, movement distance calculations, and server-side polygon generation for line-of-sight and Fog of War rendering across 2D and 3D viewports.

### Polymorphic Rule and Entity Matrix
Utilizes a highly flexible, schema-less jsonb structure to house character sheets, conditions, and resources. Enables multiple, vastly different roleplaying game systems to run concurrently under the same campaign instance.

### Interactive Custom Prestige Class Builder
Features a rule-based progression tree builder. Supports prerequisite validation checks (such as Base Attack Bonus thresholds or skill allocations) during character level-up requests and handles custom resource scaling blueprints.

### Multi-Session State Machine
Scales horizontally across thousands of concurrent, short-lived serverless sessions. Manages separate combat turn trackers, initiative rankings, and active condition durations per individual campaign instance.

### Serverless-Native Discord Integration
Utilizes the Discord Interactions API via cryptographic HTTP webhooks. Allows players to execute rolls through slash commands and broadcasts critical VTT events directly into linked Discord channels using Rich Embeds.

---

## Tech Stack

- Full-Stack Framework: Next.js 15+ App Router using TypeScript
- Deployment Infrastructure: Vercel Serverless and Edge Network
- Real-Time Layer: Ably Realtime WebSocket pub/sub pub network
- Database and ORM: Neon Serverless Postgres powered by Drizzle ORM
- Cloud Storage: Vercel Blob for edge-cached 2D textures and 3D assets
- Authentication and IAM: Auth.js for web OAuth2 and custom JWT for external mobile/desktop clients

---

## Project Structure

- architecture_plan.md: The comprehensive system design contract and structural specification blueprints.
- roadmap.md: The time-phased execution paths and delivery milestones distributed across consecutive operational phases.
