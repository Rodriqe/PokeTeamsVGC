import {runEvaluation} from './evaluate.ts';

function getArg(name: string, fallback?: string): string | undefined {
  const idx = process.argv.findIndex((a) => a === `--${name}`);
  if (idx === -1) return fallback;
  return process.argv[idx + 1] ?? fallback;
}

function getNumberArg(name: string, fallback: number): number {
  const v = getArg(name);
  if (!v) return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

const games = getNumberArg('games', 50);
const agent = (getArg('agent', 'strategic') ?? 'strategic') as 'strategic' | 'heuristic' | 'random';
const opponentAgent = (getArg('opponentAgent', 'random') ?? 'random') as 'strategic' | 'heuristic' | 'random';
const repoRoot = getArg('repoRoot');

async function main() {
  await runEvaluation({
    gamesPerOpponent: games,
    agent,
    opponentAgent,
    repoRoot,
  });
}

// Keep the event loop alive while async work runs.
// Node may otherwise exit early if the workload is promise/microtask-heavy.
const keepAlive = setInterval(() => {}, 1 << 30);

main()
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => {
    clearInterval(keepAlive);
  });
