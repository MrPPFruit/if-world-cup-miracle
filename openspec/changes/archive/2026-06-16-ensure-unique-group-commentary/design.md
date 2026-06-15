## Context

The current dynamic commentary system uses deterministic seeded RNG and static player profiles, but many template pools are small. Multiple surfaces in one run can therefore reuse the same visible phrase, and the group result page still shows only score rows plus one summary sentence.

The project constraint is mobile-first: the group page must stay readable in a 400x865 viewport. The right fix is not to dump long paragraphs into compact rows, but to generate short, specific per-match notes and enforce no-repeat behavior in the generator and verification.

## Goals / Non-Goals

**Goals:**
- Guarantee that visible generated copy does not repeat within one run.
- Give each China group match a distinct compact detail note based on match facts.
- Preserve deterministic output for the same seed, attributes, and replacement team.
- Keep group result text compact enough for the existing mobile layout.

**Non-Goals:**
- No change to scoring odds, group standings, knockout path, or zero-luck routes.
- No live player API, backend, LLM calls, or external data.
- No large group page redesign beyond fitting the new details into the existing match panel.

## Decisions

1. Use a run-local copy ledger inside `generateRunCopy`.
   - Rationale: uniqueness is a per-run presentation invariant, not tournament truth. Keeping it in the copy layer avoids touching scoring or advancement.
   - Alternative considered: globally expand every pool until collisions are unlikely. That still cannot guarantee no repeats.

2. Add `groupMatchDetails` as compact generated strings in `SimulationResult.copy`.
   - Rationale: the group result screen already maps `gameRun.chinaMatches`; pairing each match with a short generated note keeps data flow simple and deterministic.
   - Alternative considered: generate JSX-specific notes in `App.jsx`. That would move copy logic back into the view layer and make verification harder.

3. Verify visible text uniqueness by flattening transition lines, knockout commentary, and run copy fields.
   - Rationale: the user's complaint is about what the player sees in one run. Verification should inspect plain text, not just object shape.
   - Alternative considered: checking only template IDs. That misses repeated literal output across different templates.

## Risks / Trade-offs

- [Risk] Strict no-repeat can fail if future pools shrink or new surfaces reuse old copy.
  -> Mitigation: verification samples multiple runs and fails on duplicate visible strings.
- [Risk] More group text can crowd the page.
  -> Mitigation: keep each detail under a short budget and use a secondary line inside each existing match row.
- [Risk] De-duplication fallback might produce awkward suffixes.
  -> Mitigation: prefer sufficiently large pools and only use fallback for short compact copy, never for rich match facts.
