// ===================== MÓDULO sim =====================
// Simulación determinista: solo enteros, sin DOM, sin red, sin Math.random.
// step(estado, inputA, inputB, defs) muta y devuelve el estado. clone() para rollback.
const Sim = (() => {
  const SUB = 100;                 // 1 px = 100 unidades
  const STAGE_MIN = 40 * SUB, STAGE_MAX = 920 * SUB;
  const G = 80;                    // gravedad base (sub-px / cuadro²)
  const BUF = 6;                   // cuadros de búfer para botones
  const ROUND_FRAMES = 60 * 60;
  const METER_MAX = 1000;
  const JUGGLE_MAX = 5;            // golpes en el aire antes de quedar intocable
  const PERFECT_WIN = 3;           // cuadros para el bloqueo perfecto (empezar a bloquear justo antes)
  const GUARD_COST = 500;          // barra para contragolpe de guardia
  const GROLL_COST = 250;          // barra para esquivar desde la guardia
  const GRAB_WIN = 10;             // cuadros para escapar de un agarre
  const ROLL_T = 22, ROLL_INV = 15;
  const B = { L: 1, R: 2, U: 4, D: 8, P: 16, K: 32, S: 64 };
  const BTN = ['P', 'K', 'S'];

  function newFighter(x, dir, def) {
    return {
      x, y: 0, vx: 0, vy: 0, dir,
      hp: def.def.stats.vida, state: 'idle', t: 0, move: -1, stun: 0, hasHit: false, hitIdx: 0,
      prev: 0, inp: 0, age: { P: 99, K: 99, S: 99 }, hist: [], airUsed: false,
      combo: 0, wins: 0, meter: 0, juggle: 0, knock: false, bounce: false, wall: false,
      hurtKind: 'medio', invul: 0, throwBack: false, rawP: 99, rawK: 99, pdir: 5,
      backAge: 99, perfT: 0, seq: [], named: [], stunPts: 0, stunCool: 0, rollDir: 0, rad: 0,
    };
  }

  function create(defs, seed = 1) {
    return {
      frame: 0, seed, rng: seed >>> 0, phase: 'intro', phaseT: 90, round: 1,
      timer: ROUND_FRAMES, hitstop: 0, freeze: 0, freezeWho: -1, grab: null, winner: -1, roundWinner: -1, events: [], proj: [],
      fighters: [newFighter(330 * SUB, 1, defs[0]), newFighter(630 * SUB, -1, defs[1])],
    };
  }

  function resetRound(s, defs) {
    const keep = s.fighters.map(f => [f.wins, f.meter]);
    s.fighters = [newFighter(330 * SUB, 1, defs[0]), newFighter(630 * SUB, -1, defs[1])];
    s.fighters.forEach((f, i) => { f.wins = keep[i][0]; f.meter = keep[i][1]; });
    s.proj = []; s.timer = ROUND_FRAMES; s.hitstop = 0; s.freeze = 0; s.grab = null; s.round++; s.phase = 'intro'; s.phaseT = 90; s.roundWinner = -1;
  }

  const clone = s => JSON.parse(JSON.stringify(s));

  function checksum(s) {
    let h = 2166136261 >>> 0;
    const mix = v => { h ^= (v | 0) & 0xffff; h = Math.imul(h, 16777619) >>> 0; h ^= (v >> 16) & 0xffff; h = Math.imul(h, 16777619) >>> 0; };
    mix(s.frame); mix(s.timer); mix(s.hitstop); mix(s.freeze); mix(s.rng);
    for (const f of s.fighters) { mix(f.x); mix(f.y); mix(f.vx); mix(f.vy); mix(f.hp); mix(f.t); mix(f.move); mix(f.stun); mix(f.meter); mix(f.juggle); mix(f.stunPts); mix(f.rad); mix(f.state.length); }
    for (const p of s.proj) { mix(p.x); mix(p.y); mix(p.life); mix(p.hits); }
    return h.toString(16).padStart(8, '0');
  }

  const weightOf = def => def.def.stats.peso || 100;

  // --- input ---
  function dirCode(f, bits) {
    const fwd = f.dir > 0 ? B.R : B.L, back = f.dir > 0 ? B.L : B.R;
    const x = (bits & fwd) ? 1 : (bits & back) ? -1 : 0, y = (bits & B.U) ? 1 : (bits & B.D) ? -1 : 0;
    return 5 + x + y * 3; // notación de teclado numérico (6 = adelante, 2 = abajo)
  }
  // frozen: durante pausas de impacto el búfer no envejece (así se pueden encadenar golpes)
  function readInput(f, bits, frozen) {
    f.inp = bits;
    const pressed = bits & ~f.prev;
    const inc = frozen ? 0 : 1;
    for (const b of BTN) f.age[b] = (pressed & B[b]) ? 0 : Math.min(f.age[b] + inc, 99);
    if (pressed & (B.P | B.K | B.S)) f.pdir = dirCode(f, bits);
    f.rawP = (pressed & B.P) ? 0 : Math.min(f.rawP + inc, 99);
    f.rawK = (pressed & B.K) ? 0 : Math.min(f.rawK + inc, 99);
    f.prev = bits;
    const code = dirCode(f, bits), isBack = code === 1 || code === 4 || code === 7;
    const wasBack = f.hist.length > 0 && [1, 4, 7].includes(f.hist[f.hist.length - 1]);
    f.backAge = isBack ? (wasBack ? Math.min(f.backAge + 1, 99) : 0) : 99;
    if (f.perfT > 0) f.perfT--;
    f.hist.push(code);
    if (f.hist.length > 16) f.hist.shift();
  }
  function hasMotion(f, kind) {
    const want = kind === 'DP' ? [6, 2, 3] : [2, 3, 6];
    let k = 0;
    for (const c of f.hist) { if (c === want[k]) k++; if (k === 3) return true; }
    return false;
  }

  // --- elección de movimiento ---
  function startMove(f, idx, def, s) {
    const m = def.def.moves[idx];
    const me = s.fighters.indexOf(f);
    f.state = 'attack'; f.move = idx; f.t = 0; f.hasHit = false; f.hitIdx = 0;
    if (m.boton === 'PK') { f.age.P = 99; f.age.K = 99; f.rawP = 99; f.rawK = 99; } else f.age[m.boton] = 99;
    if (m.estado === 'aire') f.airUsed = true;
    if (m.invul) f.invul = m.invul;
    if (m.agarre) { const backB = f.dir > 0 ? B.L : B.R; f.throwBack = !!(f.inp & backB); }
    if (m.guardia) {
      f.meter -= GUARD_COST; s.hitstop = 0;
      s.events.push({ t: 'guard', who: me, nombre: m.nombre });
    } else if (m.super) {
      f.meter -= METER_MAX; s.freeze = 40; s.freezeWho = me;
      s.events.push({ t: 'super', who: me, nombre: m.nombre });
    } else if (m.boton === 'S' || m.motion) s.events.push({ t: 'special', who: me, nombre: m.nombre });
  }

  // devuelve el índice del movimiento que corresponde al input actual, o -1
  function chooseMove(f, def, estado, only) {
    const moves = def.def.moves;
    const fwdB = f.dir > 0 ? B.R : B.L, backB = f.dir > 0 ? B.L : B.R;
    // la dirección cuenta si está apretada ahora o si lo estaba al apretar el botón (búfer)
    const pd = f.pdir;
    const fwd = !!(f.inp & fwdB) || pd === 6 || pd === 3 || pd === 9;
    const back = !!(f.inp & backB) || pd === 4 || pd === 1 || pd === 7;
    const down = !!(f.inp & B.D) || pd === 1 || pd === 2 || pd === 3;
    const ok = m => !m.guardia && (!only || only.includes(m.id));
    const find = pred => moves.findIndex(m => ok(m) && pred(m));
    let i;
    if (estado === 'aire') {
      for (const b of ['P', 'K']) {
        if (f.age[b] > BUF) continue;
        if (down && (i = find(m => m.estado === 'aire' && m.boton === b && m.dir === 'abajo')) >= 0) return i;
        if ((i = find(m => m.estado === 'aire' && m.boton === b && !m.dir)) >= 0) return i;
      }
      return -1;
    }
    // 1) súper: ↓ + S con la barra llena
    if (f.age.S <= BUF && down && f.meter >= METER_MAX && (i = find(m => m.super)) >= 0) return i;
    // 2) esquiva (↓ + agarre) o agarre (P + K casi juntos)
    if (f.rawP <= 2 && f.rawK <= 2 && down && !only) return -2;
    if (f.rawP <= 2 && f.rawK <= 2 && (i = find(m => m.agarre)) >= 0) return i;
    // 3) comandos (→↓↘ y ↓↘→) + P o K
    if (f.age.P <= BUF || f.age.K <= BUF) {
      for (const kind of ['DP', 'QCF']) {
        if (hasMotion(f, kind) && (i = find(m => m.motion === kind && !m.super)) >= 0) return i;
      }
    }
    // 4) especiales por botón S (con dirección o neutro)
    if (f.age.S <= BUF) {
      if (fwd && (i = find(m => m.boton === 'S' && m.dir === 'adelante' && !m.super)) >= 0) return i;
      if (back && (i = find(m => m.boton === 'S' && m.dir === 'atras' && !m.super)) >= 0) return i;
      if ((i = find(m => m.boton === 'S' && !m.dir && !m.super)) >= 0) return i;
    }
    // 5) normales, con variante por dirección
    for (const b of ['P', 'K']) {
      if (f.age[b] > BUF) continue;
      if (estado === 'pie' && fwd && (i = find(m => m.boton === b && m.estado === 'pie' && m.dir === 'adelante')) >= 0) return i;
      if (estado === 'pie' && back && (i = find(m => m.boton === b && m.estado === 'pie' && m.dir === 'atras')) >= 0) return i;
      if ((i = find(m => m.boton === b && m.estado === estado && !m.dir)) >= 0) return i;
    }
    return -1;
  }
  function tryAttack(f, def, s, estado, only) {
    if (estado === 'aire' && f.airUsed) return false;
    const i = chooseMove(f, def, estado, only);
    if (i === -2) { startRoll(f, s); return true; }
    if (i < 0) return false;
    startMove(f, i, def, s);
    return true;
  }

  function landFromAir(f) { f.y = 0; f.vy = 0; }
  function startRoll(f, s) {
    f.state = 'roll'; f.t = 0; f.rawP = 99; f.rawK = 99; f.age.P = 99; f.age.K = 99;
    s.events.push({ t: 'roll', who: s.fighters.indexOf(f) });
  }
  const pressedAny = f => f.age.P <= 1 || f.age.K <= 1 || f.age.S <= 1;
  function dizzyThreshold(def) { return Math.trunc(def.def.stats.vida * 35 / 100); }
  function recover(s, f, o, def) {
    // fin de una secuencia de daño: ¿queda mareado?
    o.combo = 0; f.juggle = 0; f.knock = false; f.wall = false; f.bounce = false;
    if (f.stunPts >= dizzyThreshold(def)) {
      f.state = 'dizzy'; f.t = 0; f.stun = 110; f.stunPts = 0; f.vx = 0;
      s.events.push({ t: 'dizzy', who: s.fighters.indexOf(f), x: f.x / SUB });
      return;
    }
    f.state = 'idle';
  }

  function updateFighter(s, f, o, def, active) {
    const inp = active ? f.inp : 0;
    const speed = def.def.stats.velocidad, peso = weightOf(def);
    if (f.invul > 0) f.invul--;
    if (f.stunCool > 0) f.stunCool--; else if (f.stunPts > 0) f.stunPts = Math.max(0, f.stunPts - 3);

    switch (f.state) {
      case 'hitstun': {
        f.t++;
        // recuperación aérea: apretar un botón mientras caes después de un lanzamiento
        if (active && (f.y > 0) && f.knock && !f.bounce && !f.wall && f.t >= 16 && f.vy < 0 && pressedAny(f) && f.hp > 0) {
          f.state = 'airtech'; f.t = 0; f.invul = 12; f.vx = -f.dir * 420; f.vy = 620;
          f.age.P = f.age.K = f.age.S = 99; o.combo = 0; f.juggle = 0; f.knock = false;
          s.events.push({ t: 'tech', who: s.fighters.indexOf(f), x: f.x / SUB, y: f.y / SUB, kind: 'aire' });
          return;
        }
        if (f.y > 0 || f.vy > 0) {
          f.vy -= Math.trunc(G * peso / 100) + f.juggle * 6;
          f.y += f.vy; f.x += f.vx;
          if (f.y <= 0) {
            landFromAir(f);
            if (f.bounce) {
              f.bounce = false; f.y = 1; f.vy = Math.trunc(950 * 100 / peso); f.vx = Math.trunc(f.vx / 2);
              s.events.push({ t: 'bounce', x: f.x / SUB, who: s.fighters.indexOf(f) });
            } else if (f.knock) {
              f.state = 'down'; f.t = 0; f.stun = 34; f.vx = Math.trunc(f.vx / 2);
              s.events.push({ t: 'land', x: f.x / SUB, heavy: true });
            }
          }
          return;
        }
        f.x += f.vx; f.vx = Math.trunc(f.vx * 7 / 8);
        if (--f.stun <= 0) recover(s, f, o, def);
        return;
      }
      case 'airtech': {
        f.t++; f.vy -= G; f.y += f.vy; f.x += f.vx;
        if (f.y <= 0) { landFromAir(f); f.state = 'idle'; f.vx = 0; s.events.push({ t: 'land', x: f.x / SUB }); }
        return;
      }
      case 'down': {
        f.t++; f.x += f.vx; f.vx = Math.trunc(f.vx * 3 / 4);
        // levantarse rodando: mantener adelante o atrás mientras estás en el suelo
        const fwdB = f.dir > 0 ? B.R : B.L, backB = f.dir > 0 ? B.L : B.R;
        if (active && f.t >= 10 && (inp & (fwdB | backB))) {
          f.rollDir = (inp & fwdB) ? 1 : -1; f.state = 'wakeup'; f.t = 0;
          s.events.push({ t: 'tech', who: s.fighters.indexOf(f), x: f.x / SUB, y: 0, kind: 'suelo' });
        } else if (f.t >= f.stun) { f.state = 'wakeup'; f.t = 0; f.rollDir = 0; }
        return;
      }
      case 'wakeup': {
        f.t++;
        if (f.rollDir) f.x += f.rollDir * f.dir * 520;
        if (f.t >= (f.rollDir ? 20 : 14)) { recover(s, f, o, def); if (f.state === 'idle') f.invul = 2; f.rollDir = 0; f.dir = o.x >= f.x ? 1 : -1; }
        return;
      }
      case 'dizzy': {
        f.t++;
        if (active && pressedAny(f)) f.stun -= 4;                  // machacar botones para salir antes
        if (active && f.inp !== f.prevDizzyInp && (f.inp & (B.L | B.R | B.U | B.D))) f.stun -= 2;
        f.prevDizzyInp = f.inp & (B.L | B.R | B.U | B.D);
        f.x += f.vx; f.vx = Math.trunc(f.vx * 7 / 8);
        if (f.t >= f.stun) { f.state = 'idle'; f.stunPts = 0; }
        return;
      }
      case 'roll': {
        f.t++;
        f.x += f.dir * Math.max(560, def.def.stats.velocidad * 2);
        if (f.t >= ROLL_T) { f.state = 'idle'; f.dir = o.x >= f.x ? 1 : -1; }
        return;
      }
      case 'grabbed': return;
      case 'blockstun': {
        const fwdB = f.dir > 0 ? B.R : B.L;
        // defensa → ataque: contragolpe (→ + S) o esquiva (↓ + agarre) usando barra
        if (active && f.age.S <= 3 && (f.pdir === 6 || f.pdir === 3 || (inp & fwdB)) && f.meter >= GUARD_COST) {
          const gi = def.def.moves.findIndex(m => m.guardia);
          if (gi >= 0) { startMove(f, gi, def, s); f.vx = 0; return; }
        }
        if (active && f.rawP <= 3 && f.rawK <= 3 && (inp & B.D || f.pdir <= 3) && f.meter >= GROLL_COST) {
          f.meter -= GROLL_COST; f.dir = o.x >= f.x ? 1 : -1; startRoll(f, s); return;
        }
        f.stun--; f.x += f.vx; f.vx = Math.trunc(f.vx * 7 / 8);
        if (f.stun <= 0) f.state = (inp & B.D) ? 'crouch' : 'idle';
        return;
      }
      case 'ko': {
        if (f.y > 0 || f.vy > 0) {
          f.vy -= Math.trunc(G * peso / 100); f.y += f.vy; f.x += f.vx;
          if (f.y <= 0) { landFromAir(f); s.events.push({ t: 'land', x: f.x / SUB, heavy: true }); }
        } else { f.x += f.vx; f.vx = Math.trunc(f.vx * 7 / 8); }
        return;
      }
      case 'attack': {
        const m = def.def.moves[f.move];
        f.t++;
        // agarre tardío: si apretó P y el otro botón llega en 2 cuadros, se convierte en agarre
        if (f.t <= 2 && !m.agarre && m.estado === 'pie' && !m.motion && m.boton !== 'S' && f.rawP <= 2 && f.rawK <= 2 && active) {
          const gi = def.def.moves.findIndex(x => x.agarre);
          if (gi >= 0) { startMove(f, gi, def, s); return; }
        }
        const total = m.startup + m.active + m.recovery;
        const activeNow = f.t >= m.startup && f.t < m.startup + m.active;
        const airborne = f.y > 0 || f.vy > 0;
        if (!airborne) {
          if (m.avance && f.t <= m.startup + m.active) f.vx = f.dir * m.avance;
          else f.vx = Math.trunc(f.vx * 3 / 4);
        }
        if (f.t === m.startup) {
          if (m.salto && !airborne) { f.vy = m.salto; f.y = 1; f.vx = f.dir * (m.avance || 0); }
          if (m.picada && airborne) { f.vx = f.dir * m.picada.vx; f.vy = -m.picada.vy; }
          if (m.proyectil && !s.proj.some(p => p.owner === s.fighters.indexOf(f))) {
            const pr = m.proyectil, me = s.fighters.indexOf(f), foe = s.fighters[1 - me];
            // "cielo": cae sobre la posición actual del rival (ej. la manzana de Newton)
            s.proj.push({
              owner: me, move: f.move, dir: f.dir,
              x: pr.cielo ? foe.x : f.x + f.dir * (m.hitbox.x + (m.hitbox.w >> 1)) * SUB,
              y: pr.cielo ? (pr.altura || 520) * SUB : f.y + m.hitbox.y * SUB,
              w: m.hitbox.w * SUB, h: m.hitbox.h * SUB,
              vx: pr.cielo ? 0 : f.dir * pr.vel, vy: pr.cielo ? -pr.vel : (pr.vy || 0), grav: pr.grav || 0,
              life: pr.vida, hits: m.golpes || 1, cd: 0, big: !!m.super, forma: pr.forma || '',
            });
          }
        }
        // multigolpe: reabre la hitbox cada "intervalo" cuadros
        if (m.golpes > 1 && !m.proyectil && activeNow && f.hasHit && f.hitIdx < m.golpes) {
          const iv = Math.max(1, Math.trunc(m.active / m.golpes));
          if ((f.t - m.startup) % iv === 0) f.hasHit = false;
        }
        if (airborne) {
          f.vy -= G; f.y += f.vy; f.x += f.vx;
          if (f.y <= 0) {
            landFromAir(f);
            if (m.estado === 'aire' || f.t >= m.startup + m.active) { f.state = 'idle'; f.vx = 0; if (m.picada) s.events.push({ t: 'land', x: f.x / SUB }); return; }
          }
        } else f.x += f.vx;
        // cancelación (combos): solo si el golpe conectó
        if (f.hasHit && m.cancel && f.t >= m.startup && active && !airborne) {
          const estado = ((inp & B.D) || (f.pdir >= 1 && f.pdir <= 3)) ? 'agachado' : 'pie';
          if (tryAttack(f, def, s, estado, m.cancel) || tryAttack(f, def, s, 'pie', m.cancel)) return;
        }
        if (f.t >= total) {
          if (f.y > 0) f.state = 'jump';
          else { f.state = 'idle'; f.vx = 0; }
        }
        return;
      }
    }

    // estados libres
    const grounded = f.y === 0 && f.vy === 0;
    if (!grounded) {
      if (active && tryAttack(f, def, s, 'aire')) return;
      f.state = 'jump';
      f.vy -= G; f.y += f.vy; f.x += f.vx;
      if (f.y <= 0) { landFromAir(f); f.state = 'idle'; f.vx = 0; f.airUsed = false; }
      return;
    }
    f.dir = o.x >= f.x ? 1 : -1;
    f.airUsed = false;
    const estado = (inp & B.D) ? 'agachado' : 'pie';
    if (active && tryAttack(f, def, s, estado)) { f.vx = 0; return; }
    const fwdB = f.dir > 0 ? B.R : B.L, backB = f.dir > 0 ? B.L : B.R;
    if (inp & B.U) {
      f.state = 'jump'; f.vy = def.def.stats.salto; f.y = 1;
      f.vx = (inp & fwdB) ? f.dir * speed : (inp & backB) ? -f.dir * speed : 0;
    } else if (inp & B.D) {
      f.state = 'crouch'; f.vx = 0;
    } else if (inp & fwdB) {
      f.state = 'walk'; f.vx = f.dir * speed; f.x += f.vx;
    } else if (inp & backB) {
      f.state = 'walk'; f.vx = -Math.trunc(f.dir * speed * 3 / 4); f.x += f.vx;
    } else { f.state = 'idle'; f.vx = 0; }
  }

  // --- colisiones ---
  function hurtbox(f, def) {
    if (f.invul > 0 || f.state === 'down' || f.state === 'wakeup' || f.state === 'grabbed' || f.state === 'airtech') return null;
    if (f.state === 'roll' && f.t <= ROLL_INV) return null;
    if (f.state === 'hitstun' && f.y > 0 && f.juggle >= JUGGLE_MAX) return null;
    const hw = def.ancho * SUB;
    const low = f.state === 'crouch' || f.state === 'roll' || (f.state === 'attack' && def.def.moves[f.move].estado === 'agachado') ||
      (f.state === 'blockstun' && (f.inp & B.D));
    const h = low ? Math.trunc(def.alto * 70 / 100) : def.alto;
    return { x0: f.x - hw, x1: f.x + hw, y0: f.y, y1: f.y + h * SUB };
  }
  function hitboxWorld(f, m) {
    const hb = m.hitbox;
    const a = f.x + f.dir * hb.x * SUB, b = f.x + f.dir * (hb.x + hb.w) * SUB;
    return { x0: Math.min(a, b), x1: Math.max(a, b), y0: f.y + (hb.y - (hb.h >> 1)) * SUB, y1: f.y + (hb.y + (hb.h >> 1)) * SUB };
  }
  const overlap = (a, b) => !!a && !!b && a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1;

  function isBlocking(d, attackerX, m) {
    if (m.agarre) return false;
    const free = ['idle', 'walk', 'crouch', 'blockstun'].includes(d.state) && d.y === 0;
    // (mareado, rodando o atacando no puede bloquear)
    if (!free) return false;
    const awayB = attackerX > d.x ? B.L : B.R;
    if (!(d.inp & awayB)) return false;
    const down = !!(d.inp & B.D);
    if (m.nivel === 'bajo') return down;
    if (m.nivel === 'alto') return !down;
    return true;
  }
  const throwable = d => d.y === 0 && ['idle', 'walk', 'crouch', 'attack', 'blockstun', 'dizzy'].includes(d.state) && d.invul === 0;

  function applyHit(s, defs, ai, d, m, srcX, box, hb, final, first = true) {
    const di = 1 - ai, a = s.fighters[ai], peso = weightOf(defs[di]);
    let dir = srcX < d.x ? 1 : -1;
    const hx = ((Math.max(box.x0, hb.x0) + Math.min(box.x1, hb.x1)) >> 1) / SUB;
    const hy = ((Math.max(box.y0, hb.y0) + Math.min(box.y1, hb.y1)) >> 1) / SUB;
    const special = m.boton === 'S' || !!m.motion || !!m.super;

    if (isBlocking(d, srcX, m)) {
      if (d.backAge <= PERFECT_WIN && d.state !== 'blockstun') {
        // bloqueo perfecto: casi sin aturdimiento, sin daño, el atacante queda expuesto
        d.state = 'blockstun'; d.stun = Math.max(1, Math.trunc(m.blockstun / 3)); d.vx = 0;
        d.meter = Math.min(METER_MAX, d.meter + 80); d.perfT = 40;
        a.vx = -dir * 450;
        s.hitstop = 9;
        s.events.push({ t: 'perfect', x: hx, y: hy, who: di, dir });
        return;
      }
      a.vx = -dir * 180; // retroceso del atacante al chocar con la guardia
      const chip = special ? Math.trunc(m.damage / 8) : 0;
      d.hp = Math.max(1, d.hp - chip);
      d.state = 'blockstun'; d.stun = m.blockstun;
      d.vx = dir * Math.trunc((m.empuje || 700) * 3 / 4 * 100 / peso);
      a.meter = Math.min(METER_MAX, a.meter + Math.trunc(m.damage / 3));
      d.meter = Math.min(METER_MAX, d.meter + Math.trunc(m.damage / 4));
      s.hitstop = 4 + (m.damage >= 90 ? 2 : 0);
      s.events.push({ t: 'block', x: hx, y: hy, who: di, dir });
      return;
    }

    const dm = d.state === 'attack' ? defs[di].def.moves[d.move] : null;
    const counter = !!dm && d.t < dm.startup + dm.active;
    const airborne = d.y > 0 || d.vy > 0;
    const scale = Math.max(3, 10 - a.combo);
    let dmg = Math.trunc(m.damage * scale / 10);
    if (counter) dmg = Math.trunc(dmg * 12 / 10);
    if (d.state === 'dizzy') dmg = Math.trunc(dmg * 11 / 10);
    d.hp = Math.max(0, d.hp - dmg);
    if (d.state !== 'dizzy') { d.stunPts += dmg + (counter ? 30 : 0); d.stunCool = 100; }
    // combos con nombre (definidos en el JSON del personaje)
    if (a.combo === 0) { a.seq = a.perfT > 0 ? ['perfecto'] : []; a.named = []; }
    if (first) {
      a.seq.push(m.id); if (a.seq.length > 8) a.seq.shift();
      const list = defs[ai].def.combos || [];
      for (let k = 0; k < list.length; k++) {
        const c = list[k].secuencia;
        if (a.named.includes(k) || c.length > a.seq.length) continue;
        let match = true;
        for (let j = 0; j < c.length; j++) if (a.seq[a.seq.length - c.length + j] !== c[j]) { match = false; break; }
        if (match) {
          a.named.push(k); a.meter = Math.min(METER_MAX, a.meter + 120);
          s.events.push({ t: 'named', who: ai, nombre: list[k].nombre });
        }
      }
    }
    a.meter = Math.min(METER_MAX, a.meter + Math.trunc(dmg * 7 / 10) + 10);
    d.meter = Math.min(METER_MAX, d.meter + Math.trunc(dmg / 2));

    if (m.agarre && a.throwBack) {
      // lanzamiento hacia atrás: el rival pasa al otro lado
      d.x = a.x - a.dir * 50 * SUB; dir = -a.dir;
    }
    d.state = 'hitstun'; d.t = 0;
    d.stun = m.hitstun + (counter ? m.hitstun >> 1 : 0);
    d.hurtKind = airborne ? 'aire' : m.nivel === 'bajo' ? 'bajo' : (hb.y1 > d.y + Math.trunc(defs[di].alto * 72 / 100) * SUB ? 'alto' : 'medio');
    const kb = final ? (m.empuje || 600) : 250;
    d.vx = dir * Math.trunc(kb * 100 / peso);
    // atracción (Newton): el golpe arrastra al rival hacia el atacante
    if (m.atrae && final && !airborne) d.vx = -dir * Math.trunc(m.atrae * 100 / peso);
    // radiación (Curie): daño lento que sigue después del golpe
    if (m.radiacion) d.rad = Math.max(d.rad, m.radiacion);

    const efecto = final ? m.efecto : null;
    const lanza = final ? m.lanza : 0;
    if (airborne) {
      d.juggle++;
      d.vy = Math.max(Math.trunc((lanza || 650) * 100 / peso) - d.juggle * 70, 300);
      d.knock = true;
    } else if (lanza) {
      d.vy = Math.trunc(lanza * 100 / peso); d.y = 1; d.knock = true; d.juggle = 1;
    }
    if (efecto === 'derribo') {
      if (!airborne && !lanza) { d.vy = Math.trunc(520 * 100 / peso); d.y = 1; }
      d.knock = true; d.hurtKind = 'aire';
    } else if (efecto === 'suelo') {
      if (airborne) d.vy = -Math.trunc(1100 * 100 / peso);
      else { d.y = 1; d.vy = -400; }
      d.bounce = true; d.knock = true; d.hurtKind = 'aire';
    } else if (efecto === 'pared') {
      d.wall = true; d.knock = true; d.hurtKind = 'aire';
      d.vx = dir * Math.trunc(Math.max(kb, 1500) * 100 / peso);
      d.vy = Math.max(d.vy, 420); d.y = Math.max(d.y, 1);
    }
    else if (efecto === 'electro') {
      // electricidad (Tesla): paraliza un poco más y acerca al mareo
      d.stun += 8; d.stunPts += 45; d.vx = Math.trunc(d.vx / 2);
    }
    if (d.y > 0) d.stun = Math.max(d.stun, 20);

    a.combo++;
    const big = m.damage * (m.golpes || 1) >= 90 || !!efecto || !!lanza || counter;
    s.hitstop = Math.min(16, 5 + Math.trunc(m.damage / 15)) + (counter ? 4 : 0) + (m.super && final ? 10 : 0);
    if (m.golpes > 1 && !final) s.hitstop = 3;
    s.events.push({ t: 'hit', x: hx, y: hy, who: di, dmg, combo: a.combo, big, counter, dir, efecto, agarre: !!m.agarre, rad: !!m.radiacion, atrae: !!(m.atrae && final) });
    if (d.hp <= 0) {
      d.state = 'ko'; d.vy = Math.trunc(1150 * 100 / peso); d.y = Math.max(d.y, 1); d.vx = dir * Math.trunc(600 * 100 / peso);
      s.phase = 'ko'; s.phaseT = 160; s.roundWinner = ai; s.hitstop = 28;
      s.events.push({ t: 'ko', who: di });
    }
  }

  function step(s, inA, inB, defs) {
    s.events = [];
    s.frame++;
    s.rng = (Math.imul(s.rng, 1664525) + 1013904223) >>> 0;
    const F = s.fighters;
    const frozen = s.freeze > 0 || s.hitstop > 0;
    readInput(F[0], inA, frozen); readInput(F[1], inB, frozen);

    if (s.freeze > 0) { s.freeze--; return s; }       // congelamiento del súper
    if (s.hitstop > 0) { s.hitstop--; return s; }     // pausa de impacto

    if (s.phase === 'intro') {
      if (--s.phaseT <= 0) { s.phase = 'fight'; s.events.push({ t: 'fight' }); }
      return s;
    }
    if (s.phase === 'over') return s;

    const active = s.phase === 'fight';
    // agarre en curso: ventana para escapar apretando P+K
    if (s.grab) {
      const g = s.grab, a = F[g.a], d = F[g.d];
      g.t--;
      if (d.rawP <= 3 && d.rawK <= 3) {
        const dir = a.x < d.x ? 1 : -1;
        a.state = 'blockstun'; a.stun = 14; a.vx = -dir * 900;
        d.state = 'blockstun'; d.stun = 14; d.vx = dir * 900; d.rawP = d.rawK = 99;
        s.events.push({ t: 'tech', who: g.d, x: (a.x + d.x) / 2 / SUB, y: 110, kind: 'agarre' });
        s.grab = null;
      } else if (g.t <= 0) {
        const m = defs[g.a].def.moves[a.move];
        const hb = hitboxWorld(a, m), box = { x0: d.x - 2000, x1: d.x + 2000, y0: 0, y1: 20000 };
        d.state = 'idle';
        applyHit(s, defs, g.a, d, m, a.x, box, hb, true, true);
        s.grab = null;
      }
      return s;
    }
    updateFighter(s, F[0], F[1], defs[0], active);
    updateFighter(s, F[1], F[0], defs[1], active);
    // radiación: 3 de daño cada 12 cuadros mientras dure; nunca deja KO por sí sola
    for (const f of F) if (f.rad > 0) {
      f.rad--;
      if (active && f.rad % 12 === 0 && f.hp > 1 && f.state !== 'ko') f.hp = Math.max(1, f.hp - 3);
    }

    // golpes cuerpo a cuerpo (se calculan ambos antes de aplicar: intercambio simultáneo)
    const hits = [];
    for (let i = 0; i < 2; i++) {
      const a = F[i], d = F[1 - i];
      if (a.state !== 'attack' || a.hasHit || d.state === 'ko') continue;
      const m = defs[i].def.moves[a.move];
      if (m.proyectil) continue;
      if (a.t < m.startup || a.t >= m.startup + m.active) continue;
      if (m.agarre && !throwable(d)) continue;
      const hb = hitboxWorld(a, m), box = m.agarre ? { x0: d.x - defs[1 - i].ancho * SUB, x1: d.x + defs[1 - i].ancho * SUB, y0: d.y, y1: d.y + defs[1 - i].alto * SUB } : hurtbox(d, defs[1 - i]);
      if (overlap(hb, box)) hits.push([i, m, a.x, box, hb]);
    }
    for (const [i, m, x, box, hb] of hits) {
      const a = F[i], d = F[1 - i];
      const final = !(m.golpes > 1) || a.hitIdx >= m.golpes - 1;
      a.hasHit = true; a.hitIdx++;
      if (m.agarre) {
        if (s.grab) { // agarre simultáneo: se anulan
          s.grab = null; a.state = 'blockstun'; a.stun = 12; d.state = 'blockstun'; d.stun = 12;
          s.events.push({ t: 'tech', who: i, x: (a.x + d.x) / 2 / SUB, y: 110, kind: 'agarre' });
          continue;
        }
        s.grab = { a: i, d: 1 - i, t: GRAB_WIN };
        d.state = 'grabbed'; d.t = 0; d.vx = 0; a.vx = 0;
        d.x = a.x + a.dir * (defs[i].ancho + defs[1 - i].ancho - 8) * SUB;
        s.events.push({ t: 'grab', who: i });
        continue;
      }
      applyHit(s, defs, i, d, m, x, box, hb, final, a.hitIdx === 1);
    }

    // proyectiles (pueden ser multigolpe)
    for (const p of s.proj) {
      p.x += p.vx; p.life--; if (p.cd > 0) p.cd--;
      if (p.vy || p.grav) {
        p.y += p.vy; p.vy -= p.grav;
        if (p.y - (p.h >> 1) <= 0 && p.vy < 0) { p.life = 0; s.events.push({ t: 'pland', x: p.x / SUB, forma: p.forma, big: p.big }); continue; }
      }
      const d = F[1 - p.owner];
      if (d.state === 'ko' || p.life <= 0 || p.cd > 0) continue;
      const pb = { x0: p.x - (p.w >> 1), x1: p.x + (p.w >> 1), y0: p.y - (p.h >> 1), y1: p.y + (p.h >> 1) };
      const box = hurtbox(d, defs[1 - p.owner]);
      if (overlap(pb, box)) {
        const final = p.hits <= 1;
        const pm = defs[p.owner].def.moves[p.move];
        applyHit(s, defs, p.owner, d, pm, p.x - p.dir * SUB * 50, box, pb, final, p.hits === (pm.golpes || 1));
        p.hits--; p.cd = 6;
        if (p.hits <= 0) p.life = 0;
      }
    }
    if (s.proj.length === 2 && Math.abs(s.proj[0].x - s.proj[1].x) < (s.proj[0].w + s.proj[1].w) >> 1 && Math.abs(s.proj[0].y - s.proj[1].y) < (s.proj[0].h + s.proj[1].h) >> 1) {
      const [p, q] = s.proj;
      s.events.push({ t: 'clash', x: ((p.x + q.x) >> 1) / SUB, y: p.y / SUB });
      const ph = p.hits, qh = q.hits;
      p.hits -= qh; q.hits -= ph;
      if (p.hits <= 0) p.life = 0; if (q.hits <= 0) q.life = 0;
    }
    s.proj = s.proj.filter(p => p.life > 0 && p.x > 0 && p.x < 960 * SUB);

    // cajas de empuje
    const a = F[0], b = F[1];
    const solid = f => !['ko', 'down', 'wakeup', 'roll', 'grabbed'].includes(f.state);
    const wsum = (defs[0].ancho + defs[1].ancho) * SUB - 6 * SUB;
    if (Math.abs(a.x - b.x) < wsum && Math.abs(a.y - b.y) < 120 * SUB && solid(a) && solid(b)) {
      const over = wsum - Math.abs(a.x - b.x);
      const sgn = a.x <= b.x ? -1 : 1;
      a.x += sgn * (over >> 1); b.x -= sgn * (over - (over >> 1));
    }
    // límites del escenario: rebote en pared + transferencia de empuje
    for (let i = 0; i < 2; i++) {
      const f = F[i], o = F[1 - i];
      if (f.x < STAGE_MIN || f.x > STAGE_MAX) {
        const lim = f.x < STAGE_MIN ? STAGE_MIN : STAGE_MAX;
        const excess = f.x - lim;
        f.x = lim;
        if (f.wall && f.state === 'hitstun') {
          f.wall = false; f.vx = -Math.trunc(f.vx * 5 / 10); f.vy = Math.max(f.vy, 750); f.y = Math.max(f.y, 1);
          s.hitstop = Math.max(s.hitstop, 6);
          s.events.push({ t: 'wall', x: lim / SUB, y: f.y / SUB + 80, who: i });
        } else if ((f.state === 'hitstun' || f.state === 'blockstun') && o.state === 'attack' && f.y === 0) o.x -= excess;
      }
    }
    for (const f of F) f.x = Math.max(STAGE_MIN, Math.min(STAGE_MAX, f.x));

    // reloj y fases
    if (s.phase === 'fight') {
      s.timer--;
      if (s.timer <= 0) {
        s.phase = 'ko'; s.phaseT = 150;
        s.roundWinner = a.hp === b.hp ? -1 : (a.hp > b.hp ? 0 : 1);
        s.events.push({ t: 'timeout' });
      }
    } else if (s.phase === 'ko') {
      if (--s.phaseT <= 0) {
        if (s.roundWinner >= 0) F[s.roundWinner].wins++;
        if (F[0].wins >= 2 || F[1].wins >= 2) {
          s.phase = 'over'; s.winner = F[0].wins >= 2 ? 0 : 1;
          s.events.push({ t: 'over', who: s.winner });
        } else {
          resetRound(s, defs);
          s.events.push({ t: 'round', n: s.round });
        }
      }
    }
    return s;
  }

  return { create, step, clone, checksum, B, SUB, STAGE_MIN, STAGE_MAX, METER_MAX, hurtbox, hitboxWorld };
})();

