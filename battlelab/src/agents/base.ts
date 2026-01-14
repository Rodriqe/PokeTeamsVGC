import {BattleStreams} from '@pkmn/sim';

export type ShowdownRequest = any;

export abstract class BaseAgent {
  protected stream?: BattleStreams.PlayerStream;

  bind(stream: BattleStreams.PlayerStream) {
    this.stream = stream;
  }

  abstract start(): Promise<void>;

  protected async loop(handlers: {
    onLine?: (line: string) => void;
    onRequest: (req: ShowdownRequest) => string;
  }): Promise<void> {
    if (!this.stream) throw new Error('Agent stream not bound');

    for await (const chunk of this.stream) {
      const lines = String(chunk).split('\n');
      for (const line of lines) {
        if (!line) continue;
        handlers.onLine?.(line);
        if (!line.startsWith('|request|')) continue;
        const payload = line.slice('|request|'.length);
        if (!payload) continue;
        let req: ShowdownRequest;
        try {
          req = JSON.parse(payload);
        } catch {
          // Ignore malformed request payloads.
          continue;
        }

        let choice = 'pass';
        try {
          const next = handlers.onRequest(req);
          if (typeof next === 'string' && next.trim().length) choice = next;
        } catch {
          // Fallback to a safe no-op choice to avoid deadlocking the battle.
          choice = 'pass';
        }

        this.stream.write(`>choose ${choice}\n`);
      }
    }
  }
}
