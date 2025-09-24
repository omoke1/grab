# Scratchpad

## Background and Motivation
Grab is a Next.js app that lets users pay a small fee to download videos from Farcaster casts, track usage analytics, and view a history of downloads. We want to remove mock implementations and integrate Farcaster Mini Apps so Grab can run inside Farcaster clients and Base app. This includes using the official SDK for lifecycle/ready, auth, and wallet interactions, and preparing the app with a valid Mini App manifest and deployment setup.

Reference: Farcaster Mini Apps Getting Started (`https://miniapps.farcaster.xyz/docs/getting-started`).

## Key Challenges and Analysis
- Mini App lifecycle: must call `sdk.actions.ready()` after UI is ready; otherwise users see an infinite splash.
- Auth & wallet: replace mocked wallet connect and tx simulation with real wallet interactions compatible with Farcaster Mini Apps and Base (ETH/USDC on Base chain).
- Payment flow: replace random tx hashes and timeouts with an onchain transfer/contract call via wallet; surface real tx hash and link to Basescan.
- Manifest & routing: add a Mini App manifest and ensure the landing route is fast, stable, and mobile-friendly for in-client rendering.
- Removing mocks without breaking UI: the code currently uses mocked hooks for wallet and onchain storage; we need dependency-injected managers and graceful fallbacks off-platform.
- Deployment & domain: production URL must be stable and accessible for Farcaster; ensure correct headers and static asset availability.
- File size & SRP constraints: refactor large components into ViewModel/Manager/Coordinator layers to keep files small and focused.

## High-level Task Breakdown
1) SDK and App Wiring
- Install `@farcaster/miniapp-sdk`.
- Create `farcaster/FarcasterProvider.tsx` to initialize SDK, expose context, and coordinate lifecycle.
- In `app/layout.tsx`, mount provider and call `sdk.actions.ready()` when fonts/styles are loaded.
- Add a `useFarcaster()` hook for access to context.

2) Manifest and Discovery
- Create `public/miniapp.json` (icon, name, description, entrypoint, universal links) per docs.
- Add link tag in `app/layout.tsx` if required for discovery.
- Document dev-mode enablement and validation steps in README.

3) Auth and Wallet Integration (ETH on Base)
- Replace mocked connect in `app/page.tsx` with Quick Auth + wallet availability via SDK.
- Add `wallet/WalletManager.ts` using viem to build and send transactions via the Mini App wallet surface.
- Detect chain capabilities and ensure Base chain is selected; show prompt if unsupported.

4) Payment Flow Refactor (Video Downloader)
- Refactor `components/video-downloader.tsx` to remove simulated payment, random tx hashes, and timeouts.
- Use `WalletManager` to:
  - Build payment (0.0005 ETH or 0.50 USDC) transaction to a configured recipient.
  - Await confirmation and capture `transactionHash`.
  - Persist to history with real status and amounts.
- Add config in `.env.local` for recipient address and stablecoin contract (USDC on Base).

5) Onchain Storage Scope
- Remove fake onchain storage writes in `components/onchain-storage.tsx`.
- Replace with:
  - Export/download analytics JSON (keep).
  - If onchain storage is required later, define an interface and stub a no-op `OnchainStorageManager` behind a feature flag.

6) Analytics & History
- Keep analytics local for now but remove any seeded/mock sessions on first run.
- Ensure `localStorage` hydration is robust and typed.
- Add export/import to allow state portability between environments.

7) UI/Architecture Refactor
- Introduce layers per user rules:
  - ViewModels: UI state and event wiring per component.
  - Managers: `WalletManager`, `PaymentsManager`, `AnalyticsManager`, `HistoryManager`.
  - Coordinator: simple flow coordinator for tab navigation.
- Split large components (>200 lines) into smaller files.

8) Configuration & Secrets
- Add `.env.local` keys: `NEXT_PUBLIC_MINIAPP_NAME`, `NEXT_PUBLIC_BASE_RECIPIENT`, `NEXT_PUBLIC_USDC_ADDRESS`, `NEXT_PUBLIC_BASE_CHAIN_ID`.
- Add a `config/index.ts` to centralize addresses, chain IDs, and payment prices.

9) QA & Readiness for Farcaster/Base
- Ensure `sdk.actions.ready()` is called exactly once post-first-render and fonts load.
- Validate Mini App manifest via Farcaster Developer Mode.
- Test payment flow on Base testnet or small mainnet amount; verify Basescan links.
- Confirm mobile UX within Farcaster client (keyboard, viewport, no fixed-position issues).

10) Deployment
- Prepare production deploy (Vercel) with stable domain; ensure `public/miniapp.json` is hosted at `/.well-known/` or documented path as required.
- Document Universal Links and share behaviors.

## Success Criteria
- App loads inside Farcaster client without infinite splash; `ready()` confirmed.
- No mocked wallet or onchain storage code paths remain; all wallet interactions are real through the SDK.
- Payments create verifiable transactions on Base; tx hash shown with Basescan link.
- Mini App manifest passes validation in Developer Mode.
- Components refactored to respect file/function size limits and SRP.
- Clear environment configuration and deployment steps documented.

## References
- Getting Started — Farcaster Mini Apps: `https://miniapps.farcaster.xyz/docs/getting-started`
