import {BattleStreams, Teams} from '@pkmn/sim';
import {bindAgentToStream} from './agents/bind.ts';

export type Winner = 'p1' | 'p2' | 'draw';

export type Agent = {
  start(): Promise<void> | void;
};

export type SimulateOptions = {
  formatid: string;
  p1Name: string;
  p2Name: string;
  p1TeamImportable: string;
  p2TeamImportable: string;
  p1: Agent;
  p2: Agent;
  seed?: number[];
};

export async function simulateBattle(opts: SimulateOptions): Promise<{winner: Winner; turns: number}> {
  const streams = BattleStreams.getPlayerStreams(new BattleStreams.BattleStream());

  const p1team = Teams.pack(Teams.import(opts.p1TeamImportable));
  const p2team = Teams.pack(Teams.import(opts.p2TeamImportable));

  const spec = {
    formatid: opts.formatid,
    seed: opts.seed,
  } as any;

  const p1spec = {name: opts.p1Name, team: p1team};
  const p2spec = {name: opts.p2Name, team: p2team};

  let winner: Winner = 'draw';
  let turns = 0;

  // Track turns from omniscient output
  const omniTask = (async () => {
    for await (const chunk of streams.omniscient) {
      // chunk can include multiple lines
      const lines = String(chunk).split('\n');
      for (const line of lines) {
        if (line.startsWith('|turn|')) {
          const t = Number(line.slice('|turn|'.length));
          if (Number.isFinite(t)) turns = t;
        } else if (line.startsWith('|win|')) {
          // winner is the player's name
          const name = line.slice('|win|'.length).trim();
          if (name === opts.p1Name) winner = 'p1';
          else if (name === opts.p2Name) winner = 'p2';
          else winner = 'draw';
        } else if (line.startsWith('|tie|')) {
          winner = 'draw';
        }
      }
    }
  })();

  // Bind agents to their player streams and start them (they respond to |request|)
  bindAgentToStream(opts.p1, streams.p1);
  bindAgentToStream(opts.p2, streams.p2);
  void opts.p1.start();
  void opts.p2.start();

  // Start battle
  streams.omniscient.write(`>start ${JSON.stringify(spec)}\n`);
  streams.omniscient.write(`>player p1 ${JSON.stringify(p1spec)}\n`);
  streams.omniscient.write(`>player p2 ${JSON.stringify(p2spec)}\n`);

  // Wait for the omniscient stream to finish
  await omniTask;

  return {winner, turns};
}
