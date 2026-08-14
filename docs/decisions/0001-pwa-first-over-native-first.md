# ADR-0001: PWA-First Architecture for Mobile & Desktop

- **Status:** Accepted
- **Date:** 2026-08-14
- **Decision owners:** Lumina Core Architecture

## Context and problem statement

Lumina is a mobile-first operating system for solo photographers and videographers working in the field and at their editing desk. We must choose an application distribution and runtime architecture that provides fast mobile ergonomics, offline readability, and instant updates without the high maintenance overhead and store review gates of dual native mobile apps (Android/iOS).

## Decision drivers

- **Mobile-First Experience:** Must feel fast, compact, and installable on Android devices with home screen icon and full-screen launch.
- **Desktop Usability:** Must adapt seamlessly to laptop/desktop screen density without a separate web application.
- **Zero-Friction Deployment:** Instant global updates via web deployment; no app store approvals or fees.
- **Single Developer Sustainability:** Solo maintainability with a unified TypeScript codebase.

## Considered options

1. **Option A (PWA-First via Vite PWA / Workbox) — Selected**
2. **Option B (React Native / Expo from Day One)**
3. **Option C (Separate Web SPA + Native Kotlin/Swift Apps)**

## Decision outcome

Chosen: **Option A (PWA-First)**, because modern Web APIs (Service Workers, Web App Manifest, IndexedDB, Google Picker) fully satisfy the operational requirements of Lumina. A single responsive React + TypeScript application deployed to Cloudflare Workers Static Assets provides instant updates and offline read access at zero hosting cost.

### Positive consequences
- Single unified codebase for mobile, tablet, and desktop.
- Instant deployments and hotfixes without app store review delays.
- Native-like install experience on Android Chrome and desktop Chrome/Edge/Safari.
- Seamless integration with web-based authentication and Google OAuth flows.

### Negative consequences / trade-offs
- Push notifications on iOS have platform-specific limitations (requires iOS 16.4+ and Home Screen installation).
- Advanced background file synchronization is constrained by browser lifecycle.

## Rejected alternatives

### Option B: React Native / Expo
- *Why rejected:* Increases development complexity, requires managing app store certificates, introduces separate web/mobile rendering layers, and is unnecessary given that Lumina is an operational tool rather than a heavy native device sensor application.

## Confirmation

Verified by successful installation of PWA manifest on Android Chrome, cold-start app shell caching via Workbox, and persistent offline query reading via IndexedDB.

## Follow-up / revisit trigger

If real-world mobile usage demonstrates a strict requirement for background push notifications or Google Play Store distribution, wrap the production web build with **Capacitor** without rewriting UI or business logic.
