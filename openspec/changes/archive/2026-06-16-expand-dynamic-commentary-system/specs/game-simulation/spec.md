## ADDED Requirements

### Requirement: Commentary determinism
The system SHALL generate commentary deterministically from the same seed, attributes, and replacement team.

#### Scenario: Same run repeats commentary
- **WHEN** two runs use the same seed, attributes, and replacement team
- **THEN** generated transition lines, knockout commentary lines, path copy, and settlement copy MUST match exactly

#### Scenario: Zero-luck commentary remains deterministic
- **WHEN** `luck = 0` and the same attributes plus replacement team are used
- **THEN** commentary generation MUST NOT introduce unseeded randomness or external data that changes between runs

### Requirement: Commentary does not alter outcomes
The system SHALL keep commentary generation separate from tournament outcome decisions.

#### Scenario: Copy expansion preserves results
- **WHEN** commentary templates or player profiles are expanded
- **THEN** champion/failure outcome, failure stage, scores, standings, and advancement boards MUST remain controlled by the simulation engine rather than by copy selection
