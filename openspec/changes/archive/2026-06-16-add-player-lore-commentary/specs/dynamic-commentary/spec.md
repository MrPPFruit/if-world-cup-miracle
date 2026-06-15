## ADDED Requirements

### Requirement: Source-informed player lore commentary
The system SHALL support curated player-specific lore lines based on public football context.

#### Scenario: Lore only applies to the active player
- **WHEN** a commentary line references a player with curated lore
- **THEN** the lore line MUST be used only for that player and MUST keep the player attached to the active match team

#### Scenario: Lore stays compatible with the football action
- **WHEN** a lore line is selected for a player event
- **THEN** the line MUST match one of that player's supported football roles such as finishing, pace, control, set pieces, saves, or blocks

#### Scenario: Lore remains safe and compact
- **WHEN** source-informed lore appears in match commentary
- **THEN** it MUST be short, non-vulgar, non-harmful, and phrased as playful football context rather than private rumor or personal attack
