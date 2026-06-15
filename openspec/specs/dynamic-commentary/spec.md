## Purpose

Define the dynamic commentary and UI copy system for the World Cup IF mini-game, including simulation-aware text, player-position references, tone safety, length budgets, and legacy copy cleanup.

## Requirements

### Requirement: Simulation-aware commentary
The system SHALL generate commentary from simulation facts instead of independent random copy.

#### Scenario: Commentary reflects match facts
- **WHEN** a China match has an opponent, round, score, penalties, win/loss state, and attribute profile
- **THEN** generated commentary MUST mention facts consistently with that match and MUST NOT imply a different winner, opponent, score, or stage

#### Scenario: Group transition uses group matches
- **WHEN** the transition feed is generated after team replacement
- **THEN** the feed MUST use the selected replacement team, China group opponents, China group match scores, and dominant attribute context

### Requirement: Player-position copy
The system SHALL support static national-team player references that match the player's team and position.

#### Scenario: Star copy matches opponent team
- **WHEN** a commentary line references an opponent player
- **THEN** the player MUST belong to that opponent team's static player profile list

#### Scenario: Position copy matches football event
- **WHEN** a player profile has a goalkeeper, defender, midfielder, forward, or creator role
- **THEN** generated copy MUST use that player in an event compatible with the role, such as saves for goalkeepers, blocks for defenders, control for midfielders, and finishing for forwards

#### Scenario: China player copy remains national-team scoped
- **WHEN** commentary references a China player
- **THEN** the copy MUST treat the player as part of the China national-team game universe and MUST NOT imply China qualified for the real tournament outside this IF simulation

### Requirement: Tone safety and variety
The system SHALL provide varied humorous copy without low, vulgar, or harmful phrasing.

#### Scenario: Humor stays non-harmful
- **WHEN** any generated commentary or settlement copy is shown
- **THEN** it MUST avoid vulgar insults, protected-class attacks, body shaming, and hostile personal humiliation

#### Scenario: Luck increases absurdity without punishment
- **WHEN** luck is high or a match contains VAR, posts, own goals, penalties, or an upset
- **THEN** generated copy MAY become more absurd or meme-like while staying consistent with the positive-miracle role of luck

#### Scenario: Cultural references stay compact
- **WHEN** a cultural or quote-like joke is used
- **THEN** it MUST be short enough for the target UI surface and MUST NOT require long explanatory text to understand

### Requirement: UI copy length budgets
The system SHALL keep generated text within budgets for compact UI surfaces.

#### Scenario: Compact hints stay short
- **WHEN** text is generated for CTA labels, status chips, advancement hints, path small text, or group-result helper copy
- **THEN** it MUST use short-copy templates intended for compact surfaces

#### Scenario: Battle report supports longer text
- **WHEN** text is generated for transition feed lines or knockout battle-report lines
- **THEN** it MAY use longer commentary templates while preserving line readability in the 400x865 mobile viewport

### Requirement: Legacy copy cleanup
The system SHALL avoid showing old demo/fallback copy on real simulation paths.

#### Scenario: Real run has generated copy
- **WHEN** `gameRun` contains generated simulation data
- **THEN** group result, knockout, and settlement screens MUST prefer generated copy and MUST NOT show contradictory old demo copy

#### Scenario: Fallback copy remains non-conflicting
- **WHEN** a screen renders without `gameRun` for development fallback
- **THEN** fallback copy MUST remain generic and MUST NOT imply a fixed tournament path that conflicts with generated data
