## Purpose

Define the dynamic commentary and UI copy system for the World Cup IF mini-game, including simulation-aware text, player-position references, source-informed player lore, tone safety, length budgets, single-run copy uniqueness, group-stage per-match details, and legacy copy cleanup.

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

### Requirement: Single-run visible copy uniqueness
The system SHALL avoid repeating generated visible commentary or short-copy strings within a single game run, generated visible copy SHALL NOT expose internal ids, and different run seeds SHOULD produce varied generated commentary even when match facts are similar.

#### Scenario: One run has no duplicate generated visible copy
- **WHEN** a game run generates transition lines, knockout commentary, group result copy, advancement hints, path notes, and settlement copy
- **THEN** generated visible text strings MUST NOT repeat within that run

#### Scenario: Deterministic de-duplication remains stable
- **WHEN** two runs use the same seed, attributes, and replacement team
- **THEN** the de-duplicated generated copy MUST match exactly between both runs

#### Scenario: Internal ids stay hidden
- **WHEN** generated visible commentary falls back after normal copy pools are exhausted
- **THEN** visible text MUST NOT contain internal identifiers such as knockout round ids, match ids, or run ids

#### Scenario: Different run seeds vary similar match commentary
- **WHEN** two generated reports share the same match facts but use different run commentary seeds
- **THEN** visible commentary SHOULD differ while still respecting score, team, and player-role facts

#### Scenario: Group transition limits system highlights
- **WHEN** group-stage transition commentary is generated
- **THEN** purple system-highlight text MUST appear only on final whistle score rows
- **AND** the final whistle system text MUST read `终场哨响`

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

### Requirement: Legacy copy cleanup
The system SHALL avoid showing old demo/fallback copy on real simulation paths.

#### Scenario: Real run has generated copy
- **WHEN** `gameRun` contains generated simulation data
- **THEN** group result, knockout, and settlement screens MUST prefer generated copy and MUST NOT show contradictory old demo copy

#### Scenario: Fallback copy remains non-conflicting
- **WHEN** a screen renders without `gameRun` for development fallback
- **THEN** fallback copy MUST remain generic and MUST NOT imply a fixed tournament path that conflicts with generated data
