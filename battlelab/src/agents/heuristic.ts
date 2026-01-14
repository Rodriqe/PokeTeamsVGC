import {BattleStreams} from '@pkmn/sim';
import {BaseAgent, type ShowdownRequest} from './base.ts';

function hasSideCondition(req: ShowdownRequest, id: string): boolean {
  const sc = req?.side?.sideConditions;
  return Boolean(sc && Object.prototype.hasOwnProperty.call(sc, id));
}

const UTILITY_LAST = new Set([
  'protect',
  'detect',
  'taunt',
  'partingshot',
]);

function chooseForActiveHeuristic(active: any, req: ShowdownRequest): string {
  const moves: any[] = (active?.moves ?? []).filter((m: any) => !m.disabled);
  if (moves.length === 0) return 'pass';

  // 1) Tailwind if available and not active
  const tailwind = moves.find((m) => m.id === 'tailwind');
  if (tailwind && !hasSideCondition(req, 'tailwind')) {
    const rawIdx = (active.moves as any[]).findIndex((m: any) => m.id === 'tailwind');
    const idx = rawIdx >= 0 ? rawIdx + 1 : 1;
    return `move ${idx}`;
  }

  // 2) Fake Out early (very naive target)
  const fakeOut = moves.find((m) => m.id === 'fakeout');
  if (fakeOut) {
    const rawIdx = (active.moves as any[]).findIndex((m: any) => m.id === 'fakeout');
    const idx = rawIdx >= 0 ? rawIdx + 1 : 1;
    return `move ${idx} 1`;
  }

  // 3) Otherwise: pick a non-utility move first (request payload often doesn't include category)
  const chosen = moves.find((m) => !UTILITY_LAST.has(m.id)) ?? moves[0];
  const rawIndex = (active.moves as any[]).findIndex((m: any) => m.id === chosen.id);
  const moveIndex = rawIndex >= 0 ? rawIndex + 1 : 1;

  const target = chosen.target as string | undefined;
  if (target === 'adjacentFoe' || target === 'any') return `move ${moveIndex} 1`;
  if (target === 'adjacentAlly') return `move ${moveIndex} -1`;
  return `move ${moveIndex}`;
}

function firstAvailableSwitch(req: ShowdownRequest): string {
  const side = req?.side;
  const pokemon = side?.pokemon as any[] | undefined;
  if (!pokemon) return 'pass';
  for (let i = 0; i < pokemon.length; i++) {
    const p = pokemon[i];
    if (p?.active) continue;
    if (p?.condition?.includes('fnt')) continue;
    return `switch ${i + 1}`;
  }
  return 'pass';
}

function buildChoice(req: ShowdownRequest): string {
  if (req?.wait) return 'pass';

  // VGC requires selecting 4 Pokémon at team preview.
  if (req?.teamPreview) {
    const teamSize = (req?.side?.pokemon as any[] | undefined)?.length ?? 6;
    const pickN = Math.min(4, teamSize);
    const picked = Array.from({length: pickN}, (_, i) => i + 1);
    return `team ${picked.join('')}`;
  }

  const forceSwitch: boolean[] | undefined = req?.forceSwitch;
  if (forceSwitch?.some(Boolean)) {
    const parts = forceSwitch.map((fs) => (fs ? firstAvailableSwitch(req) : 'pass'));
    return parts.join(', ');
  }

  const actives: any[] = req?.active ?? [];
  if (actives.length === 0) return 'pass';

  const parts = actives.map((a) => chooseForActiveHeuristic(a, req));
  return parts.join(', ');
}

export class HeuristicVgcAgent extends BaseAgent {
  start(): Promise<void> {
    return this.loop({
      onRequest: (req) => buildChoice(req),
    });
  }

  bind(stream: BattleStreams.PlayerStream) {
    super.bind(stream);
  }
}
