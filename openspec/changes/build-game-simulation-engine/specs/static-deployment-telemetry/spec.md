## ADDED Requirements

### Requirement: Static build output
The system SHALL build as a static frontend site suitable for Tencent Cloud COS and CDN deployment.

#### Scenario: Build emits correct root structure
- **WHEN** `npm run build` completes
- **THEN** `dist/index.html` MUST exist and the build MUST NOT create `dist/dist/index.html`

#### Scenario: Main game works without backend
- **WHEN** the built site is served as static files
- **THEN** the core game flow MUST run without requiring server APIs, database access, login, or external runtime data fetches

### Requirement: Production source-map safety
The system SHALL keep production sourcemaps disabled.

#### Scenario: Vite sourcemap disabled
- **WHEN** production build configuration is inspected
- **THEN** Vite build sourcemaps MUST be false

#### Scenario: No map artifacts
- **WHEN** `npm run build` completes
- **THEN** no `.map` files MUST exist under `dist/assets/`

### Requirement: CDN-log telemetry pixel
The system SHALL support first-version analytics through CDN log pixel requests only.

#### Scenario: Pixel asset exists in build
- **WHEN** `npm run build` completes
- **THEN** `dist/__track/pixel.gif` MUST exist

#### Scenario: Telemetry does not require backend
- **WHEN** `track(eventName, data)` is called
- **THEN** the frontend MUST request `/__track/pixel.gif` with query parameters and MUST NOT require a backend endpoint

#### Scenario: Telemetry avoids sensitive data
- **WHEN** telemetry events are emitted
- **THEN** event parameters MUST NOT include phone number, WeChat id, real name, precise location, identity number, email, secret, or admin credential data

### Requirement: No long-term game persistence
The system SHALL avoid long-term ordinary game state persistence.

#### Scenario: Session id is not progress save
- **WHEN** the telemetry helper stores an anonymous session id in `sessionStorage`
- **THEN** it MUST NOT store attributes, replacement team, tournament path, score history, or settlement result for continuation

#### Scenario: No localStorage progress
- **WHEN** ordinary game state changes
- **THEN** the app MUST NOT write progress to `localStorage` or persistent browser storage
