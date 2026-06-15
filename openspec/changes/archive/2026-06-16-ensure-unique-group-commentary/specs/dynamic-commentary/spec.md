## ADDED Requirements

### Requirement: Single-run visible copy uniqueness
The system SHALL avoid repeating generated visible commentary or short-copy strings within a single game run.

#### Scenario: One run has no duplicate generated visible copy
- **WHEN** a game run generates transition lines, knockout commentary, group result copy, advancement hints, path notes, and settlement copy
- **THEN** generated visible text strings MUST NOT repeat within that run

#### Scenario: Deterministic de-duplication remains stable
- **WHEN** two runs use the same seed, attributes, and replacement team
- **THEN** the de-duplicated generated copy MUST match exactly between both runs

### Requirement: Group-stage per-match detail copy
The system SHALL generate compact group-stage detail copy for each China group match.

#### Scenario: Three China group matches have distinct detail notes
- **WHEN** China completes its three group-stage matches
- **THEN** the group result payload MUST include one detail note per China match
- **AND** the three detail notes MUST be distinct from each other

#### Scenario: Group detail reflects match facts
- **WHEN** a group match detail is generated
- **THEN** it MUST reflect the match's opponent, result shape, score pressure, attribute style, or luck tone without implying a different score or opponent

#### Scenario: Group detail remains compact
- **WHEN** group match detail text is shown on the group result page
- **THEN** each detail note MUST stay within the compact group-match text budget
