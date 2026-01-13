# BattleLab (Team 05 evaluator)

This folder runs **offline simulations** using the Pokémon Showdown simulator (via `@pkmn/sim`).

## Goal
- Pit **RegF Team 05** vs a set of opponent teams (your finalists) and measure win rate / average turns.
- Provide a pluggable place to swap in a smarter agent later.

## Setup
From this folder:

```bash
npm install
npm run eval -- --games 50
```

## Where do opponents come from?
- By default it loads all `RegF_Team*.md` from the repo root and extracts the first showdown importable code block.
- You can also drop extra importables as `.txt` files into `battlelab/opponents/`.

## Common commands
- Run 100 games vs each team:
  - `npm run eval -- --games 100`
- Use the strategic agent for Team 05 (default):
  - `npm run eval -- --agent strategic --games 200`
- Use random agent (baseline):
  - `npm run eval -- --agent random --games 200`
- Make opponents tougher too:
  - `npm run eval -- --agent strategic --opponentAgent heuristic --games 200`

## Notes / limitations
- This is a **simulation harness**, not a trained RL model yet.
- The heuristic agent is intentionally simple; start here, then iterate.
- If the default `@pkmn/sim` build doesn’t include the VGC Reg F format id on your machine, set `BATTLELAB_FORMATID`:
  - `BATTLELAB_FORMATID=gen9vgc2024regulationf npm run eval -- --games 50`
