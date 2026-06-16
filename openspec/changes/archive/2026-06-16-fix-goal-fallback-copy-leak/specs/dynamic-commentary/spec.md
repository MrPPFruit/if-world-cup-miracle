## MODIFIED Requirements

### Requirement: Single-run visible copy uniqueness
The system SHALL avoid repeating generated visible commentary or short-copy strings within a single game run, and generated visible copy SHALL NOT expose internal ids.

#### Scenario: One run has no duplicate generated visible copy
- **WHEN** a game run generates transition lines, knockout commentary, group result copy, advancement hints, path notes, and settlement copy
- **THEN** generated visible text strings MUST NOT repeat within that run

#### Scenario: Deterministic de-duplication remains stable
- **WHEN** two runs use the same seed, attributes, and replacement team
- **THEN** the de-duplicated generated copy MUST match exactly between both runs

#### Scenario: Internal ids stay hidden
- **WHEN** generated visible commentary falls back after normal copy pools are exhausted
- **THEN** visible text MUST NOT contain internal identifiers such as knockout round ids, match ids, or run ids
