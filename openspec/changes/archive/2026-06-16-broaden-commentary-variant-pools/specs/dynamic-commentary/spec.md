## MODIFIED Requirements

### Requirement: Single-run visible copy uniqueness
The system SHALL avoid repeating generated visible commentary or short-copy strings within a single game run, generated visible copy SHALL NOT expose internal ids, different run seeds SHOULD produce varied generated commentary even when match facts are similar, and fixed-fact commentary samples SHOULD maintain a minimum diversity floor across multiple commentary seeds.

#### Scenario: Fixed facts maintain sample diversity
- **WHEN** the same match facts are generated with multiple different commentary seeds
- **THEN** the sample SHOULD contain multiple distinct visible outputs rather than collapsing to one or two repeated reports
- **AND** the output MUST still respect score, team, player-role, UI budget, and semantic-highlight rules
