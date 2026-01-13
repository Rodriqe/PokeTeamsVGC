import {BattleStreams} from '@pkmn/sim';
import {BaseAgent, type ShowdownRequest} from './base.ts';

type Side = 'p1' | 'p2';

type Slot = 'a' | 'b';

type OpponentArchetype =
  | 'rain'
  | 'trickroom'
  | 'snow'
  | 'sun'
  | 'chienpao_dnite'
  | 'unknown';

function normalizeSpecies(raw: string): string {
  return raw
    .trim()
    .replace(/^\s*[^|]*\|/g, '')
    .replace(/,.*$/, '')
    .trim();
}

function parsePokeLine(line: string): string | null {
  // |poke|p2|Incineroar, M|
  const parts = line.split('|');
  if (parts.length < 4) return null;
  return normalizeSpecies(parts[3] ?? '');
}

function parseSwitchLine(line: string): {side: Side; slot: Slot; species: string} | null {
  // |switch|p2a: Pelipper|Pelipper, M|100/100
  const parts = line.split('|');
  if (parts.length < 4) return null;
  const who = (parts[2] ?? '').trim();
  const m = who.match(/^(p[12])([ab]):/);
  if (!m) return null;
  const side = m[1] as Side;
  const slot = m[2] as Slot;
  const species = normalizeSpecies(parts[3] ?? '');
  return {side, slot, species};
}

function parseFaintLine(line: string): {side: Side; slot: Slot} | null {
  // |faint|p2a: Pelipper
  const parts = line.split('|');
  if (parts.length < 3) return null;
  const who = (parts[2] ?? '').trim();
  const m = who.match(/^(p[12])([ab]):/);
  if (!m) return null;
  return {side: m[1] as Side, slot: m[2] as Slot};
}

function parseTurn(line: string): number | null {
  if (!line.startsWith('|turn|')) return null;
  const n = Number(line.slice('|turn|'.length));
  return Number.isFinite(n) ? n : null;
}

function hasSideCondition(req: ShowdownRequest, id: string): boolean {
  const sc = req?.side?.sideConditions;
  return Boolean(sc && Object.prototype.hasOwnProperty.call(sc, id));
}

function canTeamPreview(req: ShowdownRequest): boolean {
  return Boolean(req?.teamPreview);
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

const TR_SETTERS = new Set([
  'Hatterene',
  'Farigiraf',
  'Porygon2',
  'Indeedee-F',
  'Cresselia',
  'Oranguru',
  'Amoonguss', // often on TR teams even if not setter
]);

const HIGH_VALUE_TARGETS = [
  // speed control / disruption / fragile enablers
  'Tornadus',
  'Pelipper',
  'Ninetales-Alola',
  // TR setters
  'Hatterene',
  'Farigiraf',
  'Porygon2',
  'Indeedee-F',
  'Cresselia',
  'Oranguru',
  // major threats
  'Chien-Pao',
  'Dragonite',
  'Urshifu-Rapid-Strike',
  'Gholdengo',
  'Archaludon',
  'Raging Bolt',
  'Baxcalibur',
  'Iron Hands',
  'Ogerpon-Wellspring',
];

const FAIRY_VALUE_TARGETS = new Set([
  'Urshifu-Rapid-Strike',
  'Roaring Moon',
  'Dragonite',
  'Chien-Pao',
  'Raging Bolt',
  'Garchomp',
  'Hydreigon',
]);

export class StrategicVgcAgent extends BaseAgent {
  private opponentRoster = new Set<string>();
  private opponentActive: Record<Slot, string | null> = {a: null, b: null};
  private opponentAlive: Record<Slot, boolean> = {a: true, b: true};

  private myJustSwitchedIn: Record<Slot, boolean> = {a: false, b: false};
  private turn = 0;
  private teraUsed = false;
  private trickRoomActive = false;
  private trickRoomStartTurn: number | null = null;
  private trickRoomStartPending = false;

  // Called for every protocol line.
  protected onLine(line: string): void {
    const t = parseTurn(line);
    if (t !== null) {
      this.turn = t;

      // If we saw Trick Room start before a |turn| update, attach it now.
      if (this.trickRoomStartPending && this.trickRoomStartTurn === null) {
        this.trickRoomStartTurn = this.turn;
        this.trickRoomStartPending = false;
      }

      // "just switched in" should only apply to the first decision of that turn.
      this.myJustSwitchedIn = {a: false, b: false};
      return;
    }

    if (line.startsWith('|poke|')) {
      const species = parsePokeLine(line);
      if (species) this.opponentRoster.add(species);
      return;
    }

    if (line.startsWith('|switch|')) {
      const sw = parseSwitchLine(line);
      if (!sw) return;
      if (sw.side === 'p2') {
        this.opponentActive[sw.slot] = sw.species;
        this.opponentAlive[sw.slot] = true;
      } else {
        // our side
        this.myJustSwitchedIn[sw.slot] = true;
      }
      return;
    }

    if (line.startsWith('|faint|')) {
      const f = parseFaintLine(line);
      if (!f) return;
      if (f.side === 'p2') this.opponentAlive[f.slot] = false;
      return;
    }

    if (line.startsWith('|-terastallize|')) {
      // |-terastallize|p1a: Incineroar|Ghost
      const parts = line.split('|');
      const who = (parts[2] ?? '').trim();
      if (who.startsWith('p1')) this.teraUsed = true;
      return;
    }

    if (line.startsWith('|-fieldstart|')) {
      // |-fieldstart|move: Trick Room
      if (line.toLowerCase().includes('trick room')) {
        this.trickRoomActive = true;
        // Prefer the current known turn; otherwise mark as pending until we see |turn|.
        if (this.turn > 0) this.trickRoomStartTurn = this.turn;
        else this.trickRoomStartPending = true;
      }
      return;
    }

    if (line.startsWith('|-fieldend|')) {
      if (line.toLowerCase().includes('trick room')) {
        this.trickRoomActive = false;
        this.trickRoomStartTurn = null;
        this.trickRoomStartPending = false;
      }
      return;
    }
  }

  private trickRoomTurnsLeft(): number | null {
    if (!this.trickRoomActive) return 0;
    if (this.trickRoomStartTurn === null || this.turn === 0) return null;
    const elapsed = this.turn - this.trickRoomStartTurn;
    const left = 5 - elapsed;
    return left > 0 ? left : 0;
  }

  start(): Promise<void> {
    return this.loop({
      onLine: (l) => this.onLine(l),
      onRequest: (req) => this.choose(req),
    });
  }

  bind(stream: BattleStreams.PlayerStream) {
    super.bind(stream);
  }

  private classifyOpponent(): OpponentArchetype {
    const has = (s: string) => this.opponentRoster.has(s);

    if (has('Pelipper') || has('Archaludon')) return 'rain';
    if (has('Ninetales-Alola') || has('Baxcalibur')) return 'snow';
    if (has('Torkoal') || has('Hatterene')) return 'sun';
    if (has('Chien-Pao') || has('Dragonite')) return 'chienpao_dnite';

    // Trick Room signals
    for (const s of this.opponentRoster) {
      if (TR_SETTERS.has(s)) return 'trickroom';
    }

    return 'unknown';
  }

  private choose(req: ShowdownRequest): string {
    if (req?.wait) return 'pass';

    // Team preview (choose 4 + lead order)
    if (canTeamPreview(req)) {
      return this.chooseTeam(req);
    }

    // Forced switches
    const forceSwitch: boolean[] | undefined = req?.forceSwitch;
    if (forceSwitch?.some(Boolean)) {
      const parts = forceSwitch.map((fs) => (fs ? this.firstAvailableSwitch(req) : 'pass'));
      return parts.join(', ');
    }

    // Regular move selection
    const actives: any[] = req?.active ?? [];
    if (actives.length === 0) return 'pass';

    const parts = actives.map((a, idx) => this.chooseForActive(a, req, idx));
    return parts.join(', ');
  }

  private chooseTeam(req: ShowdownRequest): string {
    // Our team order in Team 05 importable:
    // 1 Incineroar, 2 Tornadus, 3 Urshifu-R, 4 Flutter Mane, 5 Rillaboom, 6 Landorus-T
    const arch = this.classifyOpponent();

    // Default: Tornadus+Flutter lead, Incin+Ursh back
    let selection = [2, 4, 1, 3];

    if (arch === 'rain') {
      // Anti-water: lead Rilla+Ursh, bring Incin+Torn
      selection = [5, 3, 1, 2];
    } else if (arch === 'trickroom' || arch === 'sun') {
      // TR denial: lead Torn+Incin, bring Flutter+Ursh
      selection = [2, 1, 4, 3];
    } else if (arch === 'snow') {
      // Keep Incin + Tailwind, plus strong attackers
      selection = [2, 1, 3, 4];
    } else if (arch === 'chienpao_dnite') {
      // Double Fake Out + Tailwind option
      selection = [1, 5, 2, 3];
    }

    // Protocol: in VGC team preview, the order defines leads (first 2) and back (next 2).
    return `team ${selection.join('')}`;
  }

  private firstAvailableSwitch(req: ShowdownRequest): string {
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

  private isTwoFoesAlive(): boolean {
    return Boolean(this.opponentAlive.a && this.opponentAlive.b);
  }

  private opponentLooksLikeTrickRoomNow(): boolean {
    const a = this.opponentActive.a;
    const b = this.opponentActive.b;
    if (a && TR_SETTERS.has(a)) return true;
    if (b && TR_SETTERS.has(b)) return true;
    return false;
  }

  private pickTrThreatTarget(): number {
    return this.pickTarget([
      'Torkoal',
      'Iron Hands',
      'Ursaluna',
      'Ursaluna-Bloodmoon',
      'Hatterene',
      'Farigiraf',
      'Porygon2',
      'Amoonguss',
    ]);
  }

  private pickTarget(preferred: string[]): number {
    // In doubles from p1 perspective: target 1 => p2a, target 2 => p2b
    const a = this.opponentActive.a;
    const b = this.opponentActive.b;
    for (const s of preferred) {
      if (a === s) return 1;
      if (b === s) return 2;
    }
    for (const s of HIGH_VALUE_TARGETS) {
      if (a === s) return 1;
      if (b === s) return 2;
    }
    return 1;
  }

  private getMyHpFraction(req: ShowdownRequest, slotIndex: number): number | null {
    // Best-effort: find the active pokemon entry from req.side.pokemon
    const sideMons: any[] | undefined = req?.side?.pokemon;
    if (!sideMons) return null;
    const actives = sideMons.filter((p) => p?.active);
    const me = actives[slotIndex];
    const cond: string | undefined = me?.condition;
    const m = cond?.match(/(\d+)\/(\d+)/);
    if (!m) return null;
    const hp = Number(m[1]);
    const max = Number(m[2]);
    if (!Number.isFinite(hp) || !Number.isFinite(max) || max <= 0) return null;
    return hp / max;
  }

  private chooseForActive(active: any, req: ShowdownRequest, slotIndex: number): string {
    const moves: any[] = (active?.moves ?? []).filter((m: any) => !m.disabled);
    if (moves.length === 0) return 'pass';

    const mySpecies: string | undefined = active?.pokemon?.species ?? active?.species;
    const species = typeof mySpecies === 'string' ? mySpecies : undefined;

    // Helper to build move choice
    const moveIndexById = (id: string): number | null => {
      const rawIdx = (active.moves as any[]).findIndex((m: any) => m.id === id);
      return rawIdx >= 0 ? rawIdx + 1 : null;
    };

    const chooseMove = (id: string, target?: number): string | null => {
      const idx = moveIndexById(id);
      if (!idx) return null;
      const m = moves.find((x) => x.id === id);
      if (!m) return null;

      const tgt = target ?? this.defaultTargetForMove(m);
      if (tgt === undefined) return `move ${idx}`;
      return `move ${idx} ${tgt}`;
    };

    const canTera = Boolean((req?.active?.[slotIndex] as any)?.canTerastallize);
    const withTera = (choice: string, shouldTera: boolean): string => {
      if (!shouldTera) return choice;
      if (this.teraUsed) return choice;
      if (!canTera) return choice;
      return `${choice} terastallize`;
    };

    const targetFor = (preferred: string[]): number => this.pickTarget(preferred);

    // If Trick Room is up, shift to stalling/pivoting lines when available.
    // When TR is about to end, start preparing to regain speed control.
    const trLeft = this.trickRoomTurnsLeft();
    const trAboutToEnd = trLeft !== null && trLeft <= 1;

    if (this.trickRoomActive) {
      const hpFrac = this.getMyHpFraction(req, slotIndex);
      const protectId = moves.find((m) => m.id === 'protect')?.id;
      const detectId = moves.find((m) => m.id === 'detect')?.id;

      // Prefer Protect/Detect if low-ish HP to burn a TR turn.
      if (!trAboutToEnd && hpFrac !== null && hpFrac <= 0.45) {
        if (protectId) {
          const pr = chooseMove('protect');
          if (pr) return pr;
        }
        if (detectId) {
          const de = chooseMove('detect');
          if (de) return de;
        }
      }

      // Tornadus: usually stop clicking Tailwind during TR.
      if (species === 'Tornadus') {
        if (trAboutToEnd && !hasSideCondition(req, 'tailwind')) {
          const tw = chooseMove('tailwind');
          if (tw) return tw;
        }
        const bw = chooseMove('bleakwindstorm');
        if (bw) return bw;
        const taunt = chooseMove('taunt', this.pickTrThreatTarget());
        if (taunt) return taunt;
        const pr = chooseMove('protect');
        if (pr) return pr;
      }

      // Landorus: U-turn to reposition into Incin/Rilla is often better under TR.
      if (species === 'Landorus-Therian') {
        const ut = chooseMove('uturn', this.pickTrThreatTarget());
        if (ut) return ut;
      }

      // Incineroar: Parting Shot early to cut damage under TR.
      if (species === 'Incineroar') {
        const ps = chooseMove('partingshot', this.pickTrThreatTarget());
        if (ps) return ps;
      }
    }

    // 1) Tornadus logic
    if (species === 'Tornadus') {
      if (this.opponentLooksLikeTrickRoomNow()) {
        const taunt = chooseMove('taunt', targetFor(['Hatterene', 'Farigiraf', 'Porygon2', 'Indeedee-F', 'Cresselia', 'Oranguru']));
        if (taunt) return taunt;
      }
      if (!hasSideCondition(req, 'tailwind')) {
        const tw = chooseMove('tailwind');
        if (tw) return tw;
      }
      const bw = chooseMove('bleakwindstorm');
      if (bw) return bw;
      const protect = chooseMove('protect');
      if (protect) return protect;
    }

    // 2) Fake Out on switch-in (Incin/Rilla)
    const justIn = slotIndex === 0 ? this.myJustSwitchedIn.a : this.myJustSwitchedIn.b;
    if (justIn) {
      const fo = chooseMove('fakeout', targetFor([
        // deny speed control / setup / burst damage
        'Tornadus',
        'Pelipper',
        'Ninetales-Alola',
        'Chien-Pao',
        'Dragonite',
        'Archaludon',
        'Gholdengo',
        'Hatterene',
        'Farigiraf',
      ]));
      if (fo) return fo;
    }

    // 3) Species-specific default priorities
    if (species === 'Urshifu-Rapid-Strike') {
      const tgt = targetFor(['Archaludon', 'Incineroar', 'Iron Hands', 'Gholdengo', 'Chien-Pao', 'Dragonite']);
      const ss = chooseMove('surgingstrikes', tgt);
      if (ss) return withTera(ss, true);
      const cc = chooseMove('closecombat', tgt);
      if (cc) return cc;
      const aj = chooseMove('aquajet', tgt);
      if (aj) return aj;
      const detect = chooseMove('detect');
      if (detect) return detect;
    }

    if (species === 'Flutter Mane') {
      if (this.isTwoFoesAlive()) {
        const dg = chooseMove('dazzlinggleam');
        const oppA = this.opponentActive.a;
        const oppB = this.opponentActive.b;
        const wantFairyTera = Boolean((oppA && FAIRY_VALUE_TARGETS.has(oppA)) || (oppB && FAIRY_VALUE_TARGETS.has(oppB)));
        if (dg) return withTera(dg, wantFairyTera);
      }
      const tgt = targetFor(['Urshifu-Rapid-Strike', 'Roaring Moon', 'Dragonite', 'Chien-Pao', 'Raging Bolt', 'Garchomp']);
      const mb = chooseMove('moonblast', tgt);
      if (mb) return withTera(mb, true);
      const sb = chooseMove('shadowball', tgt);
      if (sb) return sb;
      const protect = chooseMove('protect');
      if (protect) return protect;
    }

    if (species === 'Incineroar') {
      const ps = chooseMove('partingshot', targetFor(['Gholdengo', 'Archaludon', 'Dragonite', 'Iron Hands', 'Raging Bolt']));
      if (ps && this.turn >= 2) return ps;
      const ko = chooseMove('knockoff', targetFor(['Gholdengo', 'Archaludon', 'Raging Bolt', 'Iron Hands', 'Amoonguss']));
      if (ko) return ko;
      const fb = chooseMove('flareblitz', targetFor(['Amoonguss', 'Rillaboom', 'Ninetales-Alola', 'Baxcalibur']));
      if (fb) return fb;
    }

    if (species === 'Rillaboom') {
      const tgt = targetFor(['Pelipper', 'Ogerpon-Wellspring', 'Archaludon', 'Raging Bolt']);
      const gg = chooseMove('grassyglide', tgt);
      if (gg) return gg;
      const wh = chooseMove('woodhammer', tgt);
      if (wh) return withTera(wh, false);
      const ko = chooseMove('knockoff', tgt);
      if (ko) return ko;
    }

    if (species === 'Landorus-Therian') {
      if (this.isTwoFoesAlive()) {
        const rs = chooseMove('rockslide');
        if (rs) return rs;
      }
      const tgt = targetFor(['Incineroar', 'Raging Bolt', 'Iron Hands', 'Gholdengo', 'Archaludon']);
      const st = chooseMove('stompingtantrum', tgt);
      if (st) return st;
      const tb = chooseMove('terablast', tgt);
      if (tb) return withTera(tb, true);
      const ut = chooseMove('uturn', tgt);
      if (ut) return ut;
    }

    // Fallback: choose a random enabled move
    const m = pick(moves);
    const rawIndex = (active.moves as any[]).findIndex((x: any) => x.id === m.id);
    const moveIndex = rawIndex >= 0 ? rawIndex + 1 : 1;
    const target = this.defaultTargetForMove(m);
    if (target === undefined) return `move ${moveIndex}`;
    return `move ${moveIndex} ${target}`;
  }

  private defaultTargetForMove(move: any): number | undefined {
    // For doubles: 1/2 are foes, -1 ally. We default to slot 1.
    const target = move?.target as string | undefined;
    if (target === 'adjacentFoe' || target === 'any' || target === 'normal') return 1;
    if (target === 'adjacentAlly') return -1;
    // Spread moves (allAdjacentFoes/allAdjacent) don't need explicit target.
    return undefined;
  }
}
