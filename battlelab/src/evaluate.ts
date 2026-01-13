import path from 'node:path';
import fs from 'node:fs/promises';
import {simulateBattle} from './simulate.ts';
import {loadOpponentTeams, loadTeam05} from './teams.ts';
import {resolveFormatId} from './formats.ts';
import {createAgent} from './agents/factory.ts';
import type {AgentKind} from './agents/factory.ts';

export type EvaluationOptions = {
  gamesPerOpponent: number;
  agent: AgentKind;
  opponentAgent: AgentKind;
  repoRoot?: string;
};

export async function runEvaluation(opts: EvaluationOptions): Promise<void> {
  const battlelabDir = process.cwd();
  const repoRoot = opts.repoRoot
    ? path.resolve(opts.repoRoot)
    : path.resolve(battlelabDir, '..');

  const formatid = resolveFormatId();

  const team05 = await loadTeam05(repoRoot);
  const opponents = await loadOpponentTeams(repoRoot, path.join(battlelabDir, 'opponents'));

  if (opponents.length === 0) {
    throw new Error('No opponent teams found. Add some in battlelab/opponents or keep RegF_Team*.md in repo root.');
  }

  const results: Array<{
    opponentName: string;
    games: number;
    wins: number;
    losses: number;
    draws: number;
    avgTurns: number;
  }> = [];

  for (const opp of opponents) {
    let wins = 0;
    let losses = 0;
    let draws = 0;
    let turnsTotal = 0;

    for (let i = 0; i < opts.gamesPerOpponent; i++) {
      const p1 = createAgent(opts.agent);
      const p2 = createAgent(opts.opponentAgent);

      const outcome = await simulateBattle({
        formatid,
        p1Name: 'Team05',
        p2Name: opp.name,
        p1TeamImportable: team05,
        p2TeamImportable: opp.importable,
        p1,
        p2,
        seed: [Date.now() % 0x7fffffff, i, 1337, 42],
      });

      turnsTotal += outcome.turns;
      if (outcome.winner === 'p1') wins++;
      else if (outcome.winner === 'p2') losses++;
      else draws++;
    }

    const avgTurns = turnsTotal / Math.max(1, opts.gamesPerOpponent);
    results.push({
      opponentName: opp.name,
      games: opts.gamesPerOpponent,
      wins,
      losses,
      draws,
      avgTurns,
    });

    // Simple progress output
    const winrate = ((wins / Math.max(1, opts.gamesPerOpponent)) * 100).toFixed(1);
    console.log(`${opp.name}: ${wins}-${losses}-${draws} (winrate ${winrate}%), avgTurns ${avgTurns.toFixed(1)}`);
  }

  const outDir = path.join(battlelabDir, 'results');
  await fs.mkdir(outDir, {recursive: true});
  const outPath = path.join(outDir, `latest.json`);
  await fs.writeFile(outPath, JSON.stringify({
    formatid,
    options: opts,
    results,
    createdAt: new Date().toISOString(),
  }, null, 2));

  console.log(`\nSaved: ${outPath}`);
}
