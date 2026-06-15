## Why

The current prototype has a polished mobile UI, but tournament results, scores, opponents, advancement boards, and settlement paths are still hardcoded for demonstration. The next product step is to replace that demo script with a deterministic, testable, pure-frontend game simulation engine that can generate believable and shareable World Cup IF runs.

## What Changes

- Introduce a frontend-only game simulation engine that produces a full tournament result from attributes and replacement team.
- Freeze a FIFA men's ranking snapshot as source data and derive game-balanced team ratings from it.
- Make luck a controlled outcome and event-exaggeration input, while non-luck attributes drive match content and report flavor.
- Add deterministic zero-luck hidden champion routes, including a fixed China vs Japan final victory route.
- Connect generated simulation output to group result, knockout, advancement, and settlement screens.
- Preserve the existing UI layout decisions and settlement character asset API.
- Add CDN-log pixel telemetry and static deployment safety requirements for the COS/CDN production path.

## Capabilities

### New Capabilities
- `game-simulation`: Rules and outputs for generating tournament paths, scores, reports, zero-luck routes, and settlement payloads from a player configuration.
- `static-deployment-telemetry`: Static-site build, deployment, security, and CDN-log telemetry requirements for the production domain.

### Modified Capabilities

## Impact

- Affects `src/App.jsx`, new `src/game/*` modules, `src/characterAssets.js` call sites, and production build configuration.
- Affects documentation in `AGENTS.md`, `README.md`, and Comet/OpenSpec artifacts.
- Requires tests or deterministic checks for hidden zero-luck routes, seeded repeatability, luck probability bands, ranking-based strength sanity, static build structure, and telemetry pixel availability.
