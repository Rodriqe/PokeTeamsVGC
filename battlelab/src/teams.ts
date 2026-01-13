import path from 'node:path';
import fs from 'node:fs/promises';

export type NamedTeam = {name: string; importable: string};

function extractFirstCodeBlock(markdown: string): string | null {
  // Supports ```text ...``` or ``` ...```
  const fence = /```(?:text)?\s*\n([\s\S]*?)\n```/m;
  const m = markdown.match(fence);
  if (!m) return null;
  const raw = m[1] ?? '';
  const cleaned = raw.replace(/\r\n/g, '\n').trim();
  return cleaned.length ? cleaned : null;
}

export async function loadTeam05(repoRoot: string): Promise<string> {
  const team05Path = path.join(repoRoot, 'RegF_Team05_Balanced_PivotControl_Incineroar.md');
  const md = await fs.readFile(team05Path, 'utf8');
  const importable = extractFirstCodeBlock(md);
  if (!importable) throw new Error(`Could not find showdown importable in ${team05Path}`);
  return importable;
}

export async function loadOpponentTeams(repoRoot: string, opponentsDir: string): Promise<NamedTeam[]> {
  const teams: NamedTeam[] = [];

  // 1) Load RegF_Team*.md from repo root (excluding Team05)
  const rootFiles = await fs.readdir(repoRoot);
  for (const f of rootFiles) {
    if (!/^RegF_Team\d+_.*\.md$/i.test(f)) continue;
    if (f.startsWith('RegF_Team05_')) continue;
    const full = path.join(repoRoot, f);
    const md = await fs.readFile(full, 'utf8');
    const importable = extractFirstCodeBlock(md);
    if (!importable) continue;
    teams.push({name: f.replace(/\.md$/i, ''), importable});
  }

  // 2) Load additional .txt importables from battlelab/opponents
  try {
    const oppFiles = await fs.readdir(opponentsDir);
    for (const f of oppFiles) {
      if (!f.toLowerCase().endsWith('.txt')) continue;
      const full = path.join(opponentsDir, f);
      const importable = (await fs.readFile(full, 'utf8')).replace(/\r\n/g, '\n').trim();
      if (!importable) continue;
      teams.push({name: `opponents/${f.replace(/\.txt$/i, '')}`, importable});
    }
  } catch {
    // ignore missing opponents dir
  }

  teams.sort((a, b) => a.name.localeCompare(b.name));
  return teams;
}
