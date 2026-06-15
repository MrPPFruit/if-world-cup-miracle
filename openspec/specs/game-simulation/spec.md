## Purpose

Define the first-version pure-frontend game simulation system for the World Cup IF mini-game, including deterministic result generation, luck and attribute effects, ranking-informed match behavior, outcome-first tournament paths, settlement character selection, and commentary determinism boundaries.

## Requirements

### Requirement: Simulation result contract
The system SHALL generate a complete in-memory `SimulationResult` from player attributes, replacement team, and game seed before leaving the transition flow.

#### Scenario: Result drives post-replacement screens
- **WHEN** a player submits valid attributes and a replacement team
- **THEN** group result, knockout, advancement, and settlement screens MUST render from the generated simulation result rather than hardcoded demo constants

#### Scenario: Refresh resets ordinary game state
- **WHEN** the page is refreshed during an ordinary non-share game
- **THEN** the app MUST be allowed to return to the start state without restoring the previous run

### Requirement: Luck and attribute roles
The system SHALL use non-luck attributes to shape football content and use luck to shape positive miracle probability and commentary exaggeration.

#### Scenario: Defensive build changes report flavor
- **WHEN** defense is the dominant non-luck attribute
- **THEN** China match reports MUST favor keeper, bunker, clearance, low-score, and survival events over attacking fireworks

#### Scenario: High luck increases absurd positive events
- **WHEN** luck is high
- **THEN** China match reports MAY contain more VAR favors, posts, own goals, strange accidents, and exaggerated meme-like turns

#### Scenario: Luck does not punish China
- **WHEN** luck changes from low to high with other attributes unchanged
- **THEN** the engine MUST NOT introduce additional negative China-only penalties because of higher luck

### Requirement: Zero-luck determinism
The system SHALL make every `luck = 0` game deterministic for the same attributes and replacement team.

#### Scenario: Same zero-luck configuration repeats exactly
- **WHEN** a player starts two games with the same `luck = 0` attributes and replacement team
- **THEN** the final achievement, opponents, scores, group standings, and settlement payload MUST match exactly

#### Scenario: Zero-luck has no rescue randomness
- **WHEN** a zero-luck match result would eliminate China and the configuration is not an explicit hidden champion route
- **THEN** the engine MUST NOT apply luck rescue or random miracle events

### Requirement: Hidden zero-luck champion routes
The system SHALL support explicit table-driven hidden champion routes for zero-luck games.

#### Scenario: China defeats Japan in hidden zero-luck final
- **WHEN** attributes are exactly `attack=7`, `defense=7`, `midfield=6`, `stamina=5`, `tactics=5`, `luck=0` and China replaces Netherlands
- **THEN** the engine MUST generate a champion route whose final match is China defeating Japan

#### Scenario: Non-hidden zero-luck route fails
- **WHEN** `luck = 0` and the attributes plus replacement team do not match a hidden champion route
- **THEN** the engine MUST produce a non-champion final achievement

### Requirement: Ranking-based football realism
The system SHALL use frozen team ranking data and game ratings so stronger ranked teams usually perform better over large samples.

#### Scenario: Strong team usually beats weak team
- **WHEN** the engine simulates many neutral non-China matches between a high-rated team and a low-rated team
- **THEN** the high-rated team MUST win materially more often than the low-rated team

#### Scenario: Ranking gap affects score margin
- **WHEN** two teams have a large rating gap
- **THEN** the expected score margin MUST generally be larger than for two closely rated teams while still allowing low-score football outcomes

#### Scenario: Upsets remain possible
- **WHEN** a weaker team plays a stronger team outside deterministic hidden routes
- **THEN** the simulation MUST allow occasional upsets rather than enforcing the ranking order as a fixed bracket

### Requirement: Outcome-first tournament path
The system SHALL decide the final achievement first and then generate a consistent tournament path.

#### Scenario: Run plan controls downstream randomness
- **WHEN** a player starts a game after choosing attributes and a replacement team
- **THEN** the engine MUST first create a run plan with final outcome and, for failures, one explicit failure stage among group stage, 32强, 16强, 8强, semifinal, or final
- **AND** match results, scores, and commentary MUST be generated after that plan and remain consistent with it

#### Scenario: Champion result has complete path
- **WHEN** the outcome gate selects champion
- **THEN** the generated path MUST include group advancement, five China knockout wins, a final defeated opponent, champion advancement board state, and champion settlement payload

#### Scenario: Failure result has failure payload
- **WHEN** the outcome gate selects a failure achievement
- **THEN** the generated path MUST stop at the correct round and include failure reason, failure seed, last opponent, final score, and failure settlement payload

### Requirement: Settlement character selection
The system SHALL select settlement character assets from simulation payloads.

#### Scenario: Champion shows final defeated opponent
- **WHEN** China wins the championship
- **THEN** the settlement hero MUST use the final opponent defeated by China as the country defeated character

#### Scenario: Failure shows China defeated variant
- **WHEN** China fails before winning the championship
- **THEN** the settlement hero MUST use one of the China defeated variants selected by failure reason or stable failure seed

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
