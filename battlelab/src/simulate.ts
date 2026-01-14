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
  const battleStream = new BattleStreams.BattleStream();
  const streams = BattleStreams.getPlayerStreams(battleStream);

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
  let ended = false;

  const logAborts = (() => {
    const v = String(process.env.BATTLELAB_LOG_ABORTS ?? '').toLowerCase();
    return v === '1' || v === 'true' || v === 'yes';
  })();

  const finish = (nextWinner: Winner, forceTie: boolean, reason?: string) => {
    if (ended) return;
    ended = true;
    winner = nextWinner;

    if (logAborts && forceTie) {
      const why = reason ?? 'abort';
      // stderr so it doesn't interfere with progress output.
      // eslint-disable-next-line no-console
      console.warn(
        `[battlelab] forcetie reason=${why} turns=${turns} p1=${opts.p1Name} p2=${opts.p2Name} format=${opts.formatid}`,
      );
    }

    // Attempt a graceful tie when we're aborting.
    if (forceTie) {
      try {
        streams.omniscient.write('>forcetie\n');
      } catch {
        // ignore
      }
    }

    // End inputs and hard-stop the battle stream so our reader doesn't hang.
    try {
      streams.omniscient.writeEnd();
    } catch {
      // ignore
    }
    try {
      streams.p1.writeEnd();
      streams.p2.writeEnd();
    } catch {
      // ignore
    }
    try {
      battleStream.destroy();
    } catch {
      // ignore
    }
  };

  const maxTurns = Number(process.env.BATTLELAB_MAX_TURNS ?? 250);
  const timeoutMs = Number(process.env.BATTLELAB_BATTLE_TIMEOUT_MS ?? 120_000);

  // Track turns from omniscient output
  const omniTask = (async () => {
    try {
      for await (const chunk of streams.omniscient) {
        // chunk can include multiple lines
        const lines = String(chunk).split('\n');
        for (const line of lines) {
          if (line.startsWith('|turn|')) {
            const t = Number(line.slice('|turn|'.length));
            if (Number.isFinite(t)) turns = t;

            // Hard stop to avoid extremely long / stuck battles.
            if (!ended && Number.isFinite(maxTurns) && maxTurns > 0 && turns >= maxTurns) {
              finish('draw', true, 'maxTurns');
              return;
            }
          } else if (line.startsWith('|win|')) {
            // winner is the player's name
            const name = line.slice('|win|'.length).trim();
            if (name === opts.p1Name) finish('p1', false);
            else if (name === opts.p2Name) finish('p2', false);
            else finish('draw', false);
            return;
          } else if (line.startsWith('|tie|')) {
            finish('draw', false);
            return;
          }
        }
      }
    } catch {
      // If the underlying stream errors, treat as a draw and stop.
      finish('draw', true, 'streamError');
    }
  })();

  // Bind agents to their player streams and start them (they respond to |request|)
  bindAgentToStream(opts.p1, streams.p1);
  bindAgentToStream(opts.p2, streams.p2);
  // Avoid unhandled rejections; if an agent crashes, end the battle to prevent deadlock.
  void Promise.resolve(opts.p1.start()).catch(() => {
    finish('draw', true, 'agentError:p1');
  });
  void Promise.resolve(opts.p2.start()).catch(() => {
    finish('draw', true, 'agentError:p2');
  });

  // Start battle
  streams.omniscient.write(`>start ${JSON.stringify(spec)}\n`);
  streams.omniscient.write(`>player p1 ${JSON.stringify(p1spec)}\n`);
  streams.omniscient.write(`>player p2 ${JSON.stringify(p2spec)}\n`);

  // Failsafe timeout: if the battle stops producing output, force a tie.
  let timeoutHandle: NodeJS.Timeout | null = null;
  const timeoutTask = new Promise<void>((resolve) => {
    if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) return resolve();
    timeoutHandle = setTimeout(() => {
      finish('draw', true, 'timeout');
      resolve();
    }, timeoutMs);
  });

  // Wait for completion or failsafe triggers.
  await Promise.race([omniTask, timeoutTask]);
  if (timeoutHandle) clearTimeout(timeoutHandle);

  // Give the omniscient reader a brief chance to settle, but don't hang forever.
  await Promise.race([
    omniTask,
    new Promise<void>((resolve) => {
      setTimeout(resolve, 250);
    }),
  ]);

  return {winner, turns};
}
