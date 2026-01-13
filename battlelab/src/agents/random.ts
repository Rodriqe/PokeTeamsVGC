import {BattleStreams} from '@pkmn/sim';
import {BaseAgent, type ShowdownRequest} from './base.ts';

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function firstAvailableSwitch(req: ShowdownRequest): string {
  const side = req?.side;
  const pokemon = side?.pokemon as any[] | undefined;
  if (!pokemon) return 'pass';
  // choose first non-active, not fainted
  for (let i = 0; i < pokemon.length; i++) {
    const p = pokemon[i];
    if (p?.active) continue;
    if (p?.condition?.includes('fnt')) continue;
    return `switch ${i + 1}`;
  }
  return 'pass';
}

function chooseForActive(active: any): string {
  const moves: any[] = (active?.moves ?? []).filter((m: any) => !m.disabled);
  if (moves.length === 0) return 'pass';
  const move = pick(moves);
  const rawIndex = (active.moves as any[]).findIndex((m: any) => m.id === move.id);
  const moveIndex = rawIndex >= 0 ? rawIndex + 1 : 1;

  // Basic target handling for doubles.
  const target = move.target as string | undefined;
  if (target === 'adjacentFoe' || target === 'any') return `move ${moveIndex} 1`;
  if (target === 'adjacentAlly') return `move ${moveIndex} -1`;
  return `move ${moveIndex}`;
}

function buildChoice(req: ShowdownRequest): string {
  if (req?.wait) return 'pass';

  const forceSwitch: boolean[] | undefined = req?.forceSwitch;
  if (forceSwitch?.some(Boolean)) {
    const parts = forceSwitch.map((fs) => (fs ? firstAvailableSwitch(req) : 'pass'));
    return parts.join(', ');
  }

  const actives: any[] = req?.active ?? [];
  if (actives.length === 0) return 'pass';

  const parts = actives.map((a) => chooseForActive(a));
  return parts.join(', ');
}

export class RandomVgcAgent extends BaseAgent {
  start(): Promise<void> {
    return this.loop({
      onRequest: (req) => buildChoice(req),
    });
  }

  // This gets called by the battle runner.
  bind(stream: BattleStreams.PlayerStream) {
    super.bind(stream);
  }
}
