import {RandomVgcAgent} from './random.ts';
import {HeuristicVgcAgent} from './heuristic.ts';
import {StrategicVgcAgent} from './strategic.ts';

export type AgentKind = 'strategic' | 'heuristic' | 'random';

export function createAgent(kind: AgentKind) {
  if (kind === 'strategic') return new StrategicVgcAgent();
  if (kind === 'heuristic') return new HeuristicVgcAgent();
  return new RandomVgcAgent();
}
