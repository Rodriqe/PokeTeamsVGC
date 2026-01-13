import {Dex} from '@pkmn/sim';

const CANDIDATE_FORMATS = [
  // Common guesses for VGC 2024 Regulation F
  'gen9vgc2024regulationf',
  'gen9vgc2024regf',
  'gen9vgc2024regulationfbo3',
  // Fallbacks (may not match official rules, but keep harness runnable)
  'gen9doublesou',
  'gen9doubles',
];

export function resolveFormatId(): string {
  const env = process.env.BATTLELAB_FORMATID;
  if (env) return env;

  for (const id of CANDIDATE_FORMATS) {
    try {
      const format = Dex.formats.get(id);
      // Most Dex implementations mark non-existing formats with exists=false
      // If that property isn't present, accessing may still throw when starting.
      if ((format as any)?.exists !== false) return id;
    } catch {
      // ignore
    }
  }

  throw new Error(
    `Could not resolve a usable format id. Tried: ${CANDIDATE_FORMATS.join(', ')}. ` +
      `Set BATTLELAB_FORMATID to a valid format on your machine.`
  );
}
