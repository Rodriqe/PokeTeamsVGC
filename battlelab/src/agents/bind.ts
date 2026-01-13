import {BattleStreams} from '@pkmn/sim';
import type {Agent} from '../simulate.ts';
import {BaseAgent} from './base.ts';

export function bindAgentToStream(agent: Agent, stream: BattleStreams.PlayerStream): void {
  // Our agents implement bind(); Random/Heuristic extend BaseAgent.
  if (agent instanceof BaseAgent) {
    agent.bind(stream);
    return;
  }
  // If someone plugs in a different agent type later, they can expose bind() too.
  (agent as any).bind?.(stream);
}
