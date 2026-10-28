# VTT Headless Platform Decoupled Development Roadmap

This document establishes the strategic, time-phased execution path for building and verifying the headless virtual tabletop infrastructure across consecutive functional horizons.

---

## 1. Timeline Overview
- Phase 1: Headless API Foundation, Identity and Core Mechanics (Weeks 1 to 3)
- Phase 2: Multi-Client Core Target Verification, Class Builder and Game State (Weeks 4 to 6)
- Phase 3: Spatial Occlusions and Volume Polishing (Weeks 7 to 9)

---

## 2. Phase Breakdown and Deliverables

### Phase 1: Headless API Foundation, Identity and Core Mechanics (Weeks 1 to 3)
- Goal: Establish the authoritative, secure computation layer and setup multi-tenant routing protocols.
- Tasks:
  * Initialize project monorepo configurations using Next.js 15, Tailwind, and Vercel CLI environments.
  * Spin up Neon Serverless Postgres clusters; provision pooling driver configurations to survive high concurrent stateless bursts.
  * Identity Setup: Configure Auth.js OAuth2 flows alongside custom dynamic serverless JWT generation utilities for external presentation app environments.
  * Authentication Middleware: Deploy Edge-optimized JWT verification guards inside the global middleware routing layer to shield campaign operations.
  * Authoritative Game Logic: Build the secure server-side dice endpoint computing algebraic d20, advantage math, and exploding step-die algorithms.
  * Isolated Ably Broker: Deploy dynamic token-grant routers handing specific channel permissions out to third-party clients based on validated session role contexts.

### Phase 2: Multi-Client Core Target Verification, Class Builder and Game State (Weeks 4 to 6)
- Goal: Verify presentation fidelity across diverse presentation layers and launch rule customization matrices.
- Tasks:
  * Custom Class Builder API: Deploy REST API endpoints under the custom systems routing path to validate, store, and fetch modular JSON prestige class progression blueprints.
  * Level-Up Validation Service: Build the server-side validation pipeline that parses prerequisites trees whenever an actor requests a character sheet state modification.
  * 2D Web Target: Deploy the React and Pixi.js viewport canvas component, mapping database float units into 2D grid snapping alignments.
  * 3D Web Target Architecture: Deliver a baseline Three.js sandbox module parsing raw float coordinate structures to adjust 3D mesh matrices instantly inside WebGL viewports.
  * Discord Text Target: Configure the secure HTTP interactions endpoint to process incoming slash parameters and map results directly into markdown panels.
  * Combat and Resource Pipeline: Build state management routers inside Next.js to handle isolated turn changes, initiative tracking, and volatile resource mutation workflows.
  * Asset Pipeline: Configure Vercel Blob file rules to house separate, access-controlled directory bindings for 2D textures and 3D glTF models.

### Phase 3: Spatial Occlusions and Volume Polishing (Weeks 7 to 9)
- Goal: Deliver tactical depth updates and complete multi-tenant environment validation.
- Tasks:
  * Establish centralized server-side vector raycast routines to distribute line-of-sight blocker indices to all active client rendering layers for Fog of War occlusion.
  * Finalize standard client SDK libraries to standardize authentication handshakes and pub/sub message formatting across all deployment channels.
  * Perform final multi-tenant stress testing across thousands of concurrent, short-lived serverless operations to verify connection-pooling resilience under peak load.
