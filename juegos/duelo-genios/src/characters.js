// ===================== MÓDULO characters =====================
// Personajes = datos. Plantilla de poses compartida + validador + presupuesto de balance.
const Characters = (() => {
  // Ángulos en grados. 0 = hacia abajo, 90 = hacia adelante, 180 = hacia arriba.
  // lean: inclinación del torso (positivo = hacia adelante). Brazos/piernas: ángulo absoluto.
  // A = extremidad delantera, B = trasera.
  const P = (lean, head, ua, fa, ub, fb, ta, sa, tb, sb) => ({ lean, head, ua, fa, ub, fb, ta, sa, tb, sb });
  const BASE_POSES = {
    idle:       P(6, 0, 40, 150, 15, 145, 22, 2, -22, -8),
    walk1:      P(8, 0, 35, 150, 20, 145, 32, 12, -12, -25),
    walk2:      P(8, 0, 45, 152, 10, 140, 4, -18, -30, -4),
    crouch:     P(22, -10, 55, 150, 30, 145, 75, -30, 60, -40),
    jump:       P(10, 0, 60, 160, -20, 120, 75, -20, 30, -60),
    // golpes de pie
    jab_w:      P(2, 0, 30, 125, 20, 145, 24, 2, -24, -8),
    jab_h:      P(14, 0, 90, 90, 5, 140, 26, 4, -26, -8),
    strong_w:   P(-12, 5, -25, 70, 55, 160, 28, 4, -30, -12),
    strong_h:   P(26, 0, 93, 91, -35, 40, 42, 12, -42, -22),
    kick_w:     P(-4, 0, 50, 155, -10, 130, 75, -40, -8, -4),
    kick_h:     P(-22, 5, 60, 160, -40, 100, 96, 94, -10, -5),
    high_w:     P(-10, 0, 50, 160, -20, 120, 115, 30, -6, -2),
    high_h:     P(-38, 8, 70, 170, -60, 60, 138, 142, -12, -4),
    upper_w:    P(28, -5, 20, 50, 30, 140, 70, -25, 50, -40),
    upper_h:    P(-12, 10, 172, 176, 20, 90, 30, 12, -18, -40),
    head_w:     P(-15, -10, 30, 140, 20, 140, 26, 4, -30, -10),
    head_h:     P(55, 25, 10, 70, -10, 60, 40, 8, -45, -30),
    grab_w:     P(22, 0, 82, 82, 76, 86, 30, 6, -28, -10),
    grab_h:     P(-24, -5, 150, 165, 140, 160, 26, 4, -34, -14),
    // agachado
    cjab_w:     P(20, -10, 40, 130, 30, 145, 75, -30, 60, -40),
    cjab_h:     P(30, -10, 92, 92, 25, 140, 75, -30, 60, -40),
    sweep_w:    P(30, -5, 60, 150, 40, 150, 70, 10, 40, -40),
    sweep_h:    P(38, -5, 70, 150, 50, 150, 90, 92, 40, -38),
    // aire
    air_w:      P(5, 0, 70, 160, -30, 110, 80, -30, 20, -70),
    air_h:      P(-12, 5, 70, 165, -40, 100, 55, 50, -20, -85),
    airp_w:     P(10, 0, 40, 150, -20, 120, 70, -30, 30, -60),
    airp_h:     P(25, 5, 68, 58, -30, 100, 65, -25, 25, -60),
    dive_w:     P(20, 0, 100, 170, -40, 90, 95, -20, 20, -80),
    dive_h:     P(28, 5, 110, 170, -50, 80, 42, 38, -40, -100),
    stomp_w:    P(0, 0, 90, 170, 80, 170, 85, -40, 70, -50),
    stomp_h:    P(-5, 0, 120, 170, 110, 170, 6, 2, -6, -2),
    // especiales
    push_w:     P(-8, 0, 20, 100, 10, 95, 26, 4, -26, -10),
    push_h:     P(16, 0, 86, 88, 80, 92, 34, 6, -30, -12),
    lunge_w:    P(30, -5, -30, 40, -40, 30, 50, -20, -30, -40),
    lunge_h:    P(40, 0, 115, 100, 95, 90, 40, 10, -45, -30),
    ram_w:      P(35, 15, -10, 60, -20, 50, 45, -15, -30, -35),
    ram_h:      P(62, 25, 10, 80, -10, 70, 30, 5, -50, -40),
    super_w:    P(-18, -10, 150, 172, 150, 172, 30, 6, -30, -12),
    // reacciones
    hurt:       P(-25, -20, -20, 50, -40, 30, 18, 8, -26, -10),
    hurt_high:  P(-32, -32, -30, 40, -55, 20, 16, 6, -28, -14),
    hurt_mid:   P(42, 22, 20, 60, 10, 50, 30, 0, -20, -22),
    hurt_low:   P(10, -12, 40, 120, 20, 110, 55, 15, -22, -10),
    hurt_air:   P(-40, -22, 165, 140, -125, -100, 60, 20, 20, -30),
    down:       P(0, 0, 12, 12, -12, -12, 4, 0, -4, 0),
    block:      P(-6, -5, 70, 172, 55, 168, 20, 2, -26, -10),
    cblock:     P(10, -10, 70, 172, 55, 168, 75, -30, 60, -40),
    win:        P(-4, 10, 170, 178, 15, 145, 16, 0, -16, -4),
    dizzy:      P(-8, -18, 10, 40, -10, 30, 14, 4, -18, -8),
    grabbed:    P(-20, -25, 120, 150, 100, 140, 10, -10, -10, -20),
  };
  const POSE_KEYS = ['lean', 'head', 'ua', 'fa', 'ub', 'fb', 'ta', 'sa', 'tb', 'sb'];

  // Atajo para escribir movimientos sin repetir claves (los JSON finales quedan completos)
  const mv = (o) => Object.assign({ nivel: 'medio' }, o);

  // ---------------- CIENTÍFICOS OFICIALES ----------------
  // Cada poder tiene un campo "ciencia": la idea real que lo inspira (se muestra en la pausa).

  const NEWTON = {
    meta: { id: 'newton', nombre: 'Newton', autor: 'Profe Felipe', version: 3, lema: 'Gravedad y control del espacio',
      dato: 'Isaac Newton (1643–1727) formuló las tres leyes del movimiento y la ley de gravitación universal.' },
    stats: { vida: 950, velocidad: 290, salto: 1450, peso: 105 },
    rig: {
      proporciones: { torso: 60, cabeza: 17, brazo: 38, antebrazo: 38, muslo: 46, pierna: 46 },
      grosor: { cuerpo: 28, brazo: 12, pierna: 14 },
      paleta: { piel: '#f0c8a0', ropa: '#6b4428', acento: '#d62828', ojos: '#2b2b2b', manos: '#f0c8a0', mangas: '#53331c' },
      piezas: [{ tipo: 'peluca', color: '#ece6da' }, { tipo: 'levita', color: '#53331c' }, { tipo: 'corbatin', color: '#f5f5f5' }],
    },
    moves: [
      mv({ id: 'jab', nombre: 'Primera ley', boton: 'P', estado: 'pie', startup: 4, active: 3, recovery: 9, damage: 38, hitstun: 15, blockstun: 9, hitbox: { x: 20, y: 140, w: 80, h: 26 }, poses: ['jab_w', 'jab_h'], cancel: ['directo', 'patada', 'gravedad', 'principia'],
        ciencia: 'Inercia: un cuerpo sigue en reposo o en movimiento si nada lo obliga a cambiar.' }),
      mv({ id: 'directo', nombre: 'Segunda ley', boton: 'P', dir: 'adelante', estado: 'pie', startup: 10, active: 4, recovery: 16, damage: 78, hitstun: 20, blockstun: 12, hitbox: { x: 25, y: 140, w: 92, h: 30 }, avance: 300, empuje: 1100, efecto: 'pared', poses: ['strong_w', 'strong_h'], cancel: ['principia'],
        ciencia: 'F = m·a: más fuerza produce más aceleración. Por eso este golpe lanza contra la pared.' }),
      mv({ id: 'patada', nombre: 'Patada inercial', boton: 'K', estado: 'pie', startup: 7, active: 4, recovery: 16, damage: 64, hitstun: 18, blockstun: 11, hitbox: { x: 25, y: 92, w: 92, h: 30 }, poses: ['kick_w', 'kick_h'], cancel: ['manzana', 'principia'] }),
      mv({ id: 'alta', nombre: 'Órbita', boton: 'K', dir: 'adelante', estado: 'pie', nivel: 'alto', startup: 13, active: 4, recovery: 20, damage: 80, hitstun: 22, blockstun: 12, hitbox: { x: 20, y: 172, w: 98, h: 44 }, efecto: 'derribo', poses: ['high_w', 'high_h'] }),
      mv({ id: 'cjab', nombre: 'Golpe bajo', boton: 'P', estado: 'agachado', startup: 4, active: 3, recovery: 8, damage: 32, hitstun: 14, blockstun: 8, hitbox: { x: 18, y: 110, w: 80, h: 24 }, poses: ['cjab_w', 'cjab_h'], cancel: ['barrida', 'prisma'] }),
      mv({ id: 'barrida', nombre: 'Barrida', boton: 'K', estado: 'agachado', nivel: 'bajo', startup: 8, active: 4, recovery: 18, damage: 58, hitstun: 22, blockstun: 10, hitbox: { x: 30, y: 16, w: 98, h: 30 }, efecto: 'derribo', poses: ['sweep_w', 'sweep_h'] }),
      mv({ id: 'airep', nombre: 'Puño aéreo', boton: 'P', estado: 'aire', nivel: 'alto', startup: 4, active: 6, recovery: 6, damage: 46, hitstun: 15, blockstun: 9, hitbox: { x: 15, y: 60, w: 70, h: 34 }, poses: ['airp_w', 'airp_h'] }),
      mv({ id: 'airek', nombre: 'Patada aérea', boton: 'K', estado: 'aire', nivel: 'alto', startup: 5, active: 8, recovery: 6, damage: 60, hitstun: 17, blockstun: 10, hitbox: { x: 10, y: 20, w: 72, h: 60 }, poses: ['air_w', 'air_h'] }),
      mv({ id: 'picada', nombre: 'Caída libre', boton: 'K', dir: 'abajo', estado: 'aire', nivel: 'alto', startup: 6, active: 16, recovery: 8, damage: 62, hitstun: 18, blockstun: 10, hitbox: { x: 0, y: 4, w: 62, h: 40 }, picada: { vx: 300, vy: 1600 }, efecto: 'suelo', poses: ['stomp_w', 'stomp_h'],
        ciencia: 'Todos los cuerpos caen con la misma aceleración si no hay aire: unos 9,8 m/s².' }),
      mv({ id: 'manzana', nombre: 'La manzana', boton: 'S', motion: 'QCF', estado: 'pie', startup: 14, active: 2, recovery: 22, damage: 72, hitstun: 22, blockstun: 12, nivel: 'alto', hitbox: { x: 0, y: 0, w: 44, h: 44 }, proyectil: { vel: 200, vida: 120, cielo: true, grav: 28, forma: 'manzana' }, efecto: 'derribo', poses: ['push_w', 'win'],
        ciencia: 'Cuenta la leyenda que ver caer una manzana inspiró a Newton a pensar que la misma fuerza mueve la Luna.' }),
      mv({ id: 'gravedad', nombre: 'Gravitación', boton: 'S', dir: 'adelante', estado: 'pie', startup: 12, active: 6, recovery: 20, damage: 48, hitstun: 26, blockstun: 12, hitbox: { x: 40, y: 120, w: 140, h: 90 }, atrae: 1500, fx: 'gravedad', poses: ['push_w', 'grab_w'], cancel: ['jab'],
        ciencia: 'F = G·m₁·m₂ / r²: dos masas siempre se atraen. Aquí el rival es arrastrado hacia ti.' }),
      mv({ id: 'prisma', nombre: 'Prisma', boton: 'S', dir: 'adelante', motion: 'DP', estado: 'pie', startup: 3, active: 12, recovery: 22, damage: 82, hitstun: 30, blockstun: 12, hitbox: { x: 8, y: 150, w: 62, h: 100 }, salto: 1450, avance: 220, lanza: 1300, invul: 6, fx: 'prisma', poses: ['upper_w', 'upper_h'],
        ciencia: 'Newton mostró con un prisma que la luz blanca es la mezcla de todos los colores.' }),
      mv({ id: 'agarre', nombre: 'Gravitación universal', boton: 'PK', estado: 'pie', startup: 3, active: 2, recovery: 22, damage: 100, hitstun: 30, blockstun: 1, hitbox: { x: 8, y: 120, w: 52, h: 70 }, agarre: true, efecto: 'suelo', poses: ['grab_w', 'grab_h'] }),
      mv({ id: 'contra', nombre: 'Acción y reacción', boton: 'S', dir: 'adelante', guardia: true, estado: 'pie', startup: 4, active: 4, recovery: 22, damage: 60, hitstun: 24, blockstun: 10, hitbox: { x: 15, y: 130, w: 82, h: 60 }, invul: 10, empuje: 1300, efecto: 'pared', poses: ['strong_w', 'strong_h'],
        ciencia: 'Tercera ley: a toda acción corresponde una reacción igual y opuesta. Te devuelve el golpe.' }),
      mv({ id: 'principia', nombre: 'Principia', boton: 'S', dir: 'abajo', super: true, estado: 'pie', startup: 6, active: 2, recovery: 30, damage: 70, golpes: 4, nivel: 'alto', hitstun: 24, blockstun: 8, hitbox: { x: 0, y: 0, w: 130, h: 120 }, proyectil: { vel: 1000, vida: 80, cielo: true, altura: 300, grav: 60, forma: 'manzana' }, lanza: 1300, invul: 12, poses: ['super_w', 'win'],
        ciencia: 'En 1687 publicó los Principia, el libro que unió la física del cielo y la de la Tierra.' }),
    ],
    combos: [
      { nombre: 'Ley de gravitación', secuencia: ['gravedad', 'jab', 'directo'] },
      { nombre: 'Tres leyes', secuencia: ['jab', 'patada', 'principia'] },
      { nombre: 'Caída libre', secuencia: ['picada', 'prisma'] },
      { nombre: 'Luz blanca', secuencia: ['cjab', 'prisma'] },
      { nombre: 'Acción y reacción', secuencia: ['perfecto', 'contra'] },
    ],
  };

  const TESLA = {
    meta: { id: 'tesla', nombre: 'Tesla', autor: 'Profe Felipe', version: 3, lema: 'Veloz y eléctrico',
      dato: 'Nikola Tesla (1856–1943) inventó el motor de corriente alterna, la base de la red eléctrica actual.' },
    stats: { vida: 920, velocidad: 380, salto: 1550, peso: 88 },
    rig: {
      proporciones: { torso: 64, cabeza: 16, brazo: 42, antebrazo: 42, muslo: 50, pierna: 52 },
      grosor: { cuerpo: 22, brazo: 10, pierna: 12 },
      paleta: { piel: '#ecc7a5', ropa: '#1f2238', acento: '#4cc9f0', ojos: '#2e4a6e', manos: '#ecc7a5', mangas: '#171a2c' },
      piezas: [{ tipo: 'pelo', color: '#16161a' }, { tipo: 'bigote', color: '#16161a' }, { tipo: 'levita', color: '#171a2c' }, { tipo: 'corbatin', color: '#4cc9f0' }],
    },
    moves: [
      mv({ id: 'jab', nombre: 'Chispa', boton: 'P', estado: 'pie', startup: 3, active: 3, recovery: 9, damage: 34, hitstun: 15, blockstun: 9, hitbox: { x: 20, y: 145, w: 84, h: 26 }, fx: 'chispas', poses: ['jab_w', 'jab_h'], cancel: ['jab', 'directo', 'bobina', 'alterna', 'arco', 'rayo'] }),
      mv({ id: 'directo', nombre: 'Corriente continua', boton: 'P', dir: 'adelante', estado: 'pie', startup: 9, active: 4, recovery: 16, damage: 66, hitstun: 20, blockstun: 12, hitbox: { x: 25, y: 145, w: 96, h: 30 }, avance: 320, empuje: 1000, poses: ['strong_w', 'strong_h'], cancel: ['bobina', 'alterna', 'rayo'],
        ciencia: 'La corriente continua (la de las pilas) fluye siempre en un mismo sentido.' }),
      mv({ id: 'patada', nombre: 'Patada inducida', boton: 'K', estado: 'pie', startup: 6, active: 4, recovery: 15, damage: 58, hitstun: 18, blockstun: 11, hitbox: { x: 25, y: 98, w: 100, h: 30 }, poses: ['kick_w', 'kick_h'], cancel: ['bobina', 'arco'] }),
      mv({ id: 'alta', nombre: 'Arco alto', boton: 'K', dir: 'adelante', estado: 'pie', nivel: 'alto', startup: 12, active: 4, recovery: 20, damage: 80, hitstun: 22, blockstun: 12, hitbox: { x: 20, y: 185, w: 104, h: 44 }, efecto: 'derribo', poses: ['high_w', 'high_h'] }),
      mv({ id: 'cjab', nombre: 'Chispa baja', boton: 'P', estado: 'agachado', startup: 4, active: 3, recovery: 8, damage: 30, hitstun: 14, blockstun: 8, hitbox: { x: 18, y: 115, w: 86, h: 24 }, fx: 'chispas', poses: ['cjab_w', 'cjab_h'], cancel: ['barrida', 'alterna'] }),
      mv({ id: 'barrida', nombre: 'Barrida', boton: 'K', estado: 'agachado', nivel: 'bajo', startup: 8, active: 4, recovery: 18, damage: 56, hitstun: 22, blockstun: 10, hitbox: { x: 30, y: 16, w: 110, h: 30 }, efecto: 'derribo', poses: ['sweep_w', 'sweep_h'] }),
      mv({ id: 'airep', nombre: 'Descarga aérea', boton: 'P', estado: 'aire', nivel: 'alto', startup: 4, active: 6, recovery: 6, damage: 44, hitstun: 15, blockstun: 9, hitbox: { x: 15, y: 70, w: 76, h: 34 }, fx: 'chispas', poses: ['airp_w', 'airp_h'] }),
      mv({ id: 'airek', nombre: 'Patada aérea', boton: 'K', estado: 'aire', nivel: 'alto', startup: 5, active: 8, recovery: 6, damage: 56, hitstun: 17, blockstun: 10, hitbox: { x: 10, y: 20, w: 76, h: 60 }, poses: ['air_w', 'air_h'] }),
      mv({ id: 'picada', nombre: 'Pararrayos', boton: 'K', dir: 'abajo', estado: 'aire', nivel: 'alto', startup: 6, active: 14, recovery: 8, damage: 58, hitstun: 18, blockstun: 10, hitbox: { x: 5, y: 4, w: 64, h: 40 }, picada: { vx: 1000, vy: 1100 }, efecto: 'electro', fx: 'chispas', poses: ['dive_w', 'dive_h'],
        ciencia: 'Un rayo busca el camino más fácil hacia el suelo; el pararrayos se lo ofrece.' }),
      mv({ id: 'bobina', nombre: 'Bobina de Tesla', boton: 'S', motion: 'QCF', estado: 'pie', startup: 11, active: 2, recovery: 22, damage: 62, hitstun: 20, blockstun: 14, hitbox: { x: 40, y: 145, w: 60, h: 34 }, proyectil: { vel: 1100, vida: 45, forma: 'rayo' }, efecto: 'electro', poses: ['push_w', 'push_h'],
        ciencia: 'La bobina de Tesla eleva el voltaje a millones de voltios y lanza chispas por el aire.' }),
      mv({ id: 'alterna', nombre: 'Corriente alterna', boton: 'S', dir: 'adelante', motion: 'DP', estado: 'pie', startup: 4, active: 15, recovery: 24, damage: 30, golpes: 3, hitstun: 26, blockstun: 10, hitbox: { x: -10, y: 150, w: 90, h: 120 }, salto: 1350, lanza: 1250, invul: 5, efecto: 'electro', fx: 'chispas', poses: ['upper_w', 'upper_h', 'super_w'],
        ciencia: 'La corriente alterna cambia de sentido 50 veces por segundo en Chile. Golpea de ida y vuelta.' }),
      mv({ id: 'arco', nombre: 'Arco voltaico', boton: 'S', dir: 'atras', estado: 'pie', startup: 9, active: 8, recovery: 20, damage: 70, hitstun: 22, blockstun: 12, hitbox: { x: 10, y: 130, w: 70, h: 60 }, avance: 1250, efecto: 'electro', fx: 'chispas', poses: ['lunge_w', 'lunge_h'],
        ciencia: 'Un arco voltaico es una chispa continua que salta entre dos puntos con mucho voltaje.' }),
      mv({ id: 'agarre', nombre: 'Electroshock', boton: 'PK', estado: 'pie', startup: 3, active: 2, recovery: 22, damage: 92, hitstun: 30, blockstun: 1, hitbox: { x: 8, y: 130, w: 56, h: 70 }, agarre: true, efecto: 'electro', fx: 'chispas', poses: ['grab_w', 'grab_h'] }),
      mv({ id: 'contra', nombre: 'Jaula de Faraday', boton: 'S', dir: 'adelante', guardia: true, estado: 'pie', startup: 4, active: 4, recovery: 22, damage: 56, hitstun: 24, blockstun: 10, hitbox: { x: 15, y: 140, w: 88, h: 60 }, invul: 10, empuje: 1200, efecto: 'derribo', fx: 'chispas', poses: ['strong_w', 'strong_h'],
        ciencia: 'Una jaula de metal reparte la carga por fuera y protege lo que está dentro.' }),
      mv({ id: 'rayo', nombre: 'Rayo de la muerte', boton: 'S', dir: 'abajo', super: true, estado: 'pie', startup: 8, active: 2, recovery: 30, damage: 50, golpes: 6, hitstun: 22, blockstun: 8, hitbox: { x: 50, y: 140, w: 110, h: 70 }, proyectil: { vel: 950, vida: 90, forma: 'rayo' }, lanza: 1300, invul: 16, efecto: 'electro', poses: ['super_w', 'push_h'],
        ciencia: 'Tesla anunció un "rayo de la muerte" que nunca construyó. Aquí sí funciona.' }),
    ],
    combos: [
      { nombre: 'Alto voltaje', secuencia: ['jab', 'jab', 'bobina'] },
      { nombre: 'Circuito cerrado', secuencia: ['jab', 'directo', 'alterna'] },
      { nombre: 'Cortocircuito', secuencia: ['cjab', 'alterna'] },
      { nombre: 'Tormenta eléctrica', secuencia: ['picada', 'alterna'] },
      { nombre: 'Jaula de Faraday', secuencia: ['perfecto', 'contra'] },
    ],
  };

  const DARWIN = {
    meta: { id: 'darwin', nombre: 'Darwin', autor: 'Profe Felipe', version: 3, lema: 'Resistente y adaptable',
      dato: 'Charles Darwin (1809–1882) propuso la evolución por selección natural. Pasó por Chile en el Beagle en 1834–35.' },
    stats: { vida: 1100, velocidad: 255, salto: 1350, peso: 122 },
    rig: {
      proporciones: { torso: 62, cabeza: 18, brazo: 38, antebrazo: 38, muslo: 44, pierna: 44 },
      grosor: { cuerpo: 32, brazo: 13, pierna: 15 },
      paleta: { piel: '#e8c09a', ropa: '#4a4636', acento: '#7cb342', ojos: '#2b2b2b', manos: '#e8c09a', mangas: '#36322a' },
      piezas: [{ tipo: 'calva', color: '#eeeeea' }, { tipo: 'barba', color: '#eeeeea' }, { tipo: 'levita', color: '#36322a' }],
    },
    moves: [
      mv({ id: 'jab', nombre: 'Golpe naturalista', boton: 'P', estado: 'pie', startup: 5, active: 3, recovery: 10, damage: 44, hitstun: 15, blockstun: 9, hitbox: { x: 20, y: 140, w: 80, h: 28 }, poses: ['jab_w', 'jab_h'], cancel: ['directo', 'patada', 'pinzones', 'arbol'] }),
      mv({ id: 'directo', nombre: 'Golpe del Beagle', boton: 'P', dir: 'adelante', estado: 'pie', startup: 11, active: 4, recovery: 17, damage: 80, hitstun: 21, blockstun: 12, hitbox: { x: 25, y: 140, w: 92, h: 32 }, avance: 300, empuje: 1100, poses: ['strong_w', 'strong_h'], cancel: ['pinzones', 'galapago'],
        ciencia: 'El HMS Beagle dio la vuelta al mundo en 5 años; Darwin recorrió Chile de Chiloé a Copiapó.' }),
      mv({ id: 'patada', nombre: 'Patada de campo', boton: 'K', estado: 'pie', startup: 8, active: 4, recovery: 17, damage: 66, hitstun: 18, blockstun: 11, hitbox: { x: 25, y: 92, w: 90, h: 32 }, poses: ['kick_w', 'kick_h'], cancel: ['pinzones', 'galapago'] }),
      mv({ id: 'alta', nombre: 'Patada alta', boton: 'K', dir: 'adelante', estado: 'pie', nivel: 'alto', startup: 14, active: 4, recovery: 21, damage: 80, hitstun: 22, blockstun: 12, hitbox: { x: 20, y: 170, w: 96, h: 44 }, efecto: 'derribo', poses: ['high_w', 'high_h'] }),
      mv({ id: 'cjab', nombre: 'Golpe bajo', boton: 'P', estado: 'agachado', startup: 5, active: 3, recovery: 9, damage: 36, hitstun: 14, blockstun: 8, hitbox: { x: 18, y: 110, w: 78, h: 26 }, poses: ['cjab_w', 'cjab_h'], cancel: ['barrida', 'arbol'] }),
      mv({ id: 'barrida', nombre: 'Barrida', boton: 'K', estado: 'agachado', nivel: 'bajo', startup: 9, active: 4, recovery: 19, damage: 64, hitstun: 22, blockstun: 10, hitbox: { x: 30, y: 16, w: 96, h: 30 }, efecto: 'derribo', poses: ['sweep_w', 'sweep_h'] }),
      mv({ id: 'airep', nombre: 'Puño aéreo', boton: 'P', estado: 'aire', nivel: 'alto', startup: 5, active: 6, recovery: 6, damage: 50, hitstun: 15, blockstun: 9, hitbox: { x: 15, y: 60, w: 70, h: 34 }, poses: ['airp_w', 'airp_h'] }),
      mv({ id: 'airek', nombre: 'Patada aérea', boton: 'K', estado: 'aire', nivel: 'alto', startup: 6, active: 8, recovery: 6, damage: 64, hitstun: 17, blockstun: 10, hitbox: { x: 10, y: 20, w: 70, h: 60 }, poses: ['air_w', 'air_h'] }),
      mv({ id: 'picada', nombre: 'Caparazón', boton: 'K', dir: 'abajo', estado: 'aire', nivel: 'alto', startup: 7, active: 14, recovery: 10, damage: 70, hitstun: 18, blockstun: 10, hitbox: { x: -10, y: 0, w: 60, h: 40 }, picada: { vx: 200, vy: 1500 }, efecto: 'suelo', poses: ['stomp_w', 'stomp_h'] }),
      mv({ id: 'pinzones', nombre: 'Pinzones', boton: 'S', motion: 'QCF', estado: 'pie', startup: 13, active: 2, recovery: 24, damage: 40, golpes: 2, hitstun: 20, blockstun: 12, hitbox: { x: 40, y: 150, w: 56, h: 44 }, proyectil: { vel: 600, vida: 120, forma: 'pinzon' }, poses: ['push_w', 'push_h'],
        ciencia: 'Los pinzones de Galápagos tienen picos distintos según lo que comen en cada isla.' }),
      mv({ id: 'galapago', nombre: 'Galápago', boton: 'S', dir: 'atras', estado: 'pie', startup: 10, active: 10, recovery: 22, damage: 84, hitstun: 24, blockstun: 14, hitbox: { x: 10, y: 100, w: 66, h: 60 }, avance: 1000, empuje: 1300, efecto: 'pared', invul: 4, poses: ['ram_w', 'ram_h'],
        ciencia: 'Las tortugas gigantes de cada isla de Galápagos tienen caparazones de forma distinta.' }),
      mv({ id: 'arbol', nombre: 'Árbol de la vida', boton: 'S', dir: 'adelante', motion: 'DP', estado: 'pie', startup: 4, active: 12, recovery: 24, damage: 86, hitstun: 30, blockstun: 12, hitbox: { x: 8, y: 150, w: 64, h: 100 }, salto: 1350, avance: 200, lanza: 1300, invul: 6, fx: 'hojas', poses: ['upper_w', 'upper_h'],
        ciencia: 'Darwin dibujó un árbol en su cuaderno: todas las especies comparten antepasados.' }),
      mv({ id: 'agarre', nombre: 'El más apto', boton: 'PK', estado: 'pie', startup: 3, active: 2, recovery: 22, damage: 98, hitstun: 30, blockstun: 1, hitbox: { x: 8, y: 120, w: 52, h: 70 }, agarre: true, empuje: 900, efecto: 'derribo', poses: ['grab_w', 'grab_h'],
        ciencia: '"Más apto" no es el más fuerte, sino el que mejor encaja con su ambiente.' }),
      mv({ id: 'contra', nombre: 'Adaptación', boton: 'S', dir: 'adelante', guardia: true, estado: 'pie', startup: 4, active: 4, recovery: 22, damage: 60, hitstun: 24, blockstun: 10, hitbox: { x: 15, y: 130, w: 82, h: 60 }, invul: 10, empuje: 1100, efecto: 'derribo', fx: 'hojas', poses: ['strong_w', 'strong_h'] }),
      mv({ id: 'seleccion', nombre: 'Selección natural', boton: 'S', dir: 'abajo', super: true, estado: 'pie', startup: 9, active: 2, recovery: 30, damage: 38, golpes: 7, hitstun: 22, blockstun: 8, hitbox: { x: 50, y: 140, w: 110, h: 110 }, proyectil: { vel: 560, vida: 150, forma: 'pinzon' }, lanza: 1300, invul: 16, poses: ['super_w', 'push_h'],
        ciencia: 'Los individuos con rasgos útiles sobreviven y dejan más descendencia. Así cambian las especies.' }),
    ],
    combos: [
      { nombre: 'Variación', secuencia: ['jab', 'patada', 'pinzones'] },
      { nombre: 'Especiación', secuencia: ['jab', 'directo', 'galapago'] },
      { nombre: 'Raíces comunes', secuencia: ['cjab', 'arbol'] },
      { nombre: 'Islas Galápagos', secuencia: ['picada', 'arbol'] },
      { nombre: 'Adaptación', secuencia: ['perfecto', 'contra'] },
    ],
  };

  const LAMARCK = {
    meta: { id: 'lamarck', nombre: 'Lamarck', autor: 'Profe Felipe', version: 3, lema: 'El alcance más largo',
      dato: 'Jean-Baptiste Lamarck (1744–1829) propuso una de las primeras teorías de la evolución, aunque su mecanismo resultó incorrecto.' },
    stats: { vida: 1040, velocidad: 310, salto: 1500, peso: 98 },
    rig: {
      proporciones: { torso: 58, cabeza: 16, brazo: 48, antebrazo: 48, muslo: 50, pierna: 50 },
      grosor: { cuerpo: 24, brazo: 11, pierna: 13 },
      paleta: { piel: '#f2cfa8', ropa: '#2e5e4e', acento: '#f2b134', ojos: '#2b2b2b', manos: '#f2cfa8', mangas: '#234a3d' },
      piezas: [{ tipo: 'pelo', color: '#d8d8d4' }, { tipo: 'levita', color: '#234a3d' }, { tipo: 'corbatin', color: '#ffffff' }],
    },
    moves: [
      mv({ id: 'jab', nombre: 'Brazo largo', boton: 'P', estado: 'pie', startup: 5, active: 3, recovery: 10, damage: 36, hitstun: 15, blockstun: 9, hitbox: { x: 20, y: 148, w: 104, h: 26 }, poses: ['jab_w', 'jab_h'], cancel: ['directo', 'cuello', 'escala', 'jirafa'] }),
      mv({ id: 'directo', nombre: 'Uso y desuso', boton: 'P', dir: 'adelante', estado: 'pie', startup: 12, active: 5, recovery: 18, damage: 72, hitstun: 20, blockstun: 12, hitbox: { x: 30, y: 148, w: 150, h: 30 }, empuje: 1200, estira: 160, poses: ['strong_w', 'strong_h'], cancel: ['cuello', 'jirafa'],
        ciencia: 'Lamarck creía que un órgano usado mucho se agranda. Por eso este brazo se estira.' }),
      mv({ id: 'patada', nombre: 'Patada larga', boton: 'K', estado: 'pie', startup: 8, active: 4, recovery: 17, damage: 62, hitstun: 18, blockstun: 11, hitbox: { x: 25, y: 96, w: 112, h: 30 }, poses: ['kick_w', 'kick_h'], cancel: ['cuello'] }),
      mv({ id: 'alta', nombre: 'Patada alta', boton: 'K', dir: 'adelante', estado: 'pie', nivel: 'alto', startup: 14, active: 4, recovery: 20, damage: 82, hitstun: 22, blockstun: 12, hitbox: { x: 20, y: 180, w: 112, h: 46 }, efecto: 'derribo', poses: ['high_w', 'high_h'] }),
      mv({ id: 'cjab', nombre: 'Golpe bajo', boton: 'P', estado: 'agachado', startup: 5, active: 3, recovery: 9, damage: 30, hitstun: 14, blockstun: 8, hitbox: { x: 18, y: 112, w: 100, h: 24 }, poses: ['cjab_w', 'cjab_h'], cancel: ['barrida', 'escala'] }),
      mv({ id: 'barrida', nombre: 'Barrida', boton: 'K', estado: 'agachado', nivel: 'bajo', startup: 9, active: 4, recovery: 19, damage: 56, hitstun: 22, blockstun: 10, hitbox: { x: 30, y: 16, w: 118, h: 30 }, efecto: 'derribo', poses: ['sweep_w', 'sweep_h'] }),
      mv({ id: 'airep', nombre: 'Puño aéreo', boton: 'P', estado: 'aire', nivel: 'alto', startup: 5, active: 6, recovery: 6, damage: 44, hitstun: 15, blockstun: 9, hitbox: { x: 15, y: 70, w: 92, h: 34 }, poses: ['airp_w', 'airp_h'] }),
      mv({ id: 'airek', nombre: 'Patada aérea', boton: 'K', estado: 'aire', nivel: 'alto', startup: 6, active: 8, recovery: 6, damage: 56, hitstun: 17, blockstun: 10, hitbox: { x: 10, y: 20, w: 82, h: 60 }, poses: ['air_w', 'air_h'] }),
      mv({ id: 'picada', nombre: 'Picada', boton: 'K', dir: 'abajo', estado: 'aire', nivel: 'alto', startup: 7, active: 14, recovery: 10, damage: 60, hitstun: 18, blockstun: 10, hitbox: { x: 5, y: 4, w: 70, h: 40 }, picada: { vx: 900, vy: 1000 }, efecto: 'suelo', poses: ['dive_w', 'dive_h'] }),
      mv({ id: 'cuello', nombre: 'Cuello de jirafa', boton: 'S', motion: 'QCF', estado: 'pie', startup: 13, active: 5, recovery: 22, damage: 80, hitstun: 24, blockstun: 12, hitbox: { x: 40, y: 200, w: 150, h: 60 }, lanza: 1250, estiraCuello: 340, poses: ['head_w', 'head_h'],
        ciencia: 'Su ejemplo famoso: las jirafas estiran el cuello para comer y sus crías nacen con él más largo. Hoy sabemos que no funciona así.' }),
      mv({ id: 'escala', nombre: 'Escala natural', boton: 'S', dir: 'adelante', motion: 'DP', estado: 'pie', startup: 4, active: 12, recovery: 24, damage: 80, hitstun: 30, blockstun: 12, hitbox: { x: 8, y: 160, w: 70, h: 110 }, salto: 1500, avance: 240, lanza: 1300, invul: 5, estira: 140, poses: ['upper_w', 'upper_h'],
        ciencia: 'Lamarck pensaba que los seres vivos suben por una escalera hacia formas más complejas.' }),
      mv({ id: 'agarre', nombre: 'Herencia adquirida', boton: 'PK', estado: 'pie', startup: 3, active: 2, recovery: 22, damage: 94, hitstun: 30, blockstun: 1, hitbox: { x: 8, y: 130, w: 60, h: 70 }, agarre: true, efecto: 'pared', poses: ['grab_w', 'grab_h'],
        ciencia: 'Los caracteres adquiridos en vida (como músculos) no se heredan: no cambian el ADN.' }),
      mv({ id: 'contra', nombre: 'Respuesta al medio', boton: 'S', dir: 'adelante', guardia: true, estado: 'pie', startup: 5, active: 4, recovery: 22, damage: 56, hitstun: 24, blockstun: 10, hitbox: { x: 15, y: 145, w: 120, h: 60 }, invul: 10, empuje: 1300, efecto: 'pared', estira: 150, poses: ['strong_w', 'strong_h'] }),
      mv({ id: 'jirafa', nombre: 'Evolución jirafa', boton: 'S', dir: 'abajo', super: true, estado: 'pie', startup: 7, active: 30, recovery: 26, damage: 44, golpes: 6, hitstun: 22, blockstun: 8, hitbox: { x: 40, y: 170, w: 160, h: 120 }, lanza: 1400, invul: 10, estira: 170, estiraCuello: 300, poses: ['super_w', 'strong_h', 'head_h'],
        ciencia: 'Lamarck fue quien inventó la palabra "biología" y defendió que las especies cambian.' }),
    ],
    combos: [
      { nombre: 'Uso continuo', secuencia: ['jab', 'directo', 'cuello'] },
      { nombre: 'Escalera', secuencia: ['cjab', 'escala'] },
      { nombre: 'Largo alcance', secuencia: ['jab', 'cuello'] },
      { nombre: 'Respuesta al medio', secuencia: ['perfecto', 'contra'] },
    ],
  };

  const CURIE = {
    meta: { id: 'curie', nombre: 'Curie', autor: 'Profe Felipe', version: 3, lema: 'La radiación no perdona',
      dato: 'Marie Curie (1867–1934) descubrió el polonio y el radio. Fue la primera persona en ganar dos premios Nobel, en Física y Química.' },
    stats: { vida: 940, velocidad: 330, salto: 1550, peso: 86 },
    rig: {
      proporciones: { torso: 56, cabeza: 16, brazo: 36, antebrazo: 36, muslo: 46, pierna: 48 },
      grosor: { cuerpo: 24, brazo: 10, pierna: 12 },
      paleta: { piel: '#f3d2b5', ropa: '#24242c', acento: '#7cfc00', ojos: '#3b2a20', manos: '#f3d2b5', mangas: '#24242c' },
      piezas: [{ tipo: 'mono', color: '#4a3426' }, { tipo: 'falda', color: '#1c1c22' }, { tipo: 'corbatin', color: '#e8e8e8' }],
    },
    moves: [
      mv({ id: 'jab', nombre: 'Matraz', boton: 'P', estado: 'pie', startup: 4, active: 3, recovery: 9, damage: 34, hitstun: 15, blockstun: 9, hitbox: { x: 20, y: 135, w: 78, h: 26 }, poses: ['jab_w', 'jab_h'], cancel: ['jab', 'directo', 'radio', 'desintegra', 'gamma', 'nobel'] }),
      mv({ id: 'directo', nombre: 'Polonio', boton: 'P', dir: 'adelante', estado: 'pie', startup: 9, active: 4, recovery: 16, damage: 62, hitstun: 20, blockstun: 12, hitbox: { x: 25, y: 135, w: 88, h: 30 }, avance: 300, empuje: 1000, radiacion: 60, fx: 'radiacion', poses: ['strong_w', 'strong_h'], cancel: ['radio', 'gamma', 'nobel'],
        ciencia: 'El polonio fue su primer descubrimiento; lo nombró así por Polonia, su país natal.' }),
      mv({ id: 'patada', nombre: 'Patada', boton: 'K', estado: 'pie', startup: 6, active: 4, recovery: 15, damage: 58, hitstun: 18, blockstun: 11, hitbox: { x: 25, y: 90, w: 88, h: 30 }, poses: ['kick_w', 'kick_h'], cancel: ['radio', 'desintegra'] }),
      mv({ id: 'alta', nombre: 'Patada alta', boton: 'K', dir: 'adelante', estado: 'pie', nivel: 'alto', startup: 12, active: 4, recovery: 20, damage: 78, hitstun: 22, blockstun: 12, hitbox: { x: 20, y: 166, w: 96, h: 44 }, efecto: 'derribo', poses: ['high_w', 'high_h'] }),
      mv({ id: 'cjab', nombre: 'Golpe bajo', boton: 'P', estado: 'agachado', startup: 4, active: 3, recovery: 8, damage: 30, hitstun: 14, blockstun: 8, hitbox: { x: 18, y: 106, w: 78, h: 24 }, poses: ['cjab_w', 'cjab_h'], cancel: ['barrida', 'gamma'] }),
      mv({ id: 'barrida', nombre: 'Barrida', boton: 'K', estado: 'agachado', nivel: 'bajo', startup: 8, active: 4, recovery: 17, damage: 54, hitstun: 22, blockstun: 10, hitbox: { x: 30, y: 16, w: 96, h: 30 }, efecto: 'derribo', poses: ['sweep_w', 'sweep_h'] }),
      mv({ id: 'airep', nombre: 'Puño aéreo', boton: 'P', estado: 'aire', nivel: 'alto', startup: 4, active: 6, recovery: 6, damage: 44, hitstun: 15, blockstun: 9, hitbox: { x: 15, y: 60, w: 70, h: 34 }, poses: ['airp_w', 'airp_h'] }),
      mv({ id: 'airek', nombre: 'Patada aérea', boton: 'K', estado: 'aire', nivel: 'alto', startup: 5, active: 8, recovery: 6, damage: 56, hitstun: 17, blockstun: 10, hitbox: { x: 10, y: 20, w: 72, h: 60 }, poses: ['air_w', 'air_h'] }),
      mv({ id: 'picada', nombre: 'Picada', boton: 'K', dir: 'abajo', estado: 'aire', nivel: 'alto', startup: 6, active: 14, recovery: 8, damage: 58, hitstun: 18, blockstun: 10, hitbox: { x: 5, y: 4, w: 64, h: 40 }, picada: { vx: 800, vy: 1100 }, efecto: 'suelo', poses: ['dive_w', 'dive_h'] }),
      mv({ id: 'radio', nombre: 'Radio', boton: 'S', motion: 'QCF', estado: 'pie', startup: 13, active: 2, recovery: 22, damage: 48, hitstun: 20, blockstun: 14, hitbox: { x: 40, y: 130, w: 46, h: 46 }, proyectil: { vel: 450, vida: 160, forma: 'radio' }, radiacion: 180, poses: ['push_w', 'push_h'],
        ciencia: 'El radio brilla solo en la oscuridad. Su radiación daña las células aunque no se sienta.' }),
      mv({ id: 'desintegra', nombre: 'Desintegración', boton: 'S', dir: 'atras', estado: 'pie', startup: 10, active: 18, recovery: 22, damage: 26, golpes: 4, hitstun: 20, blockstun: 10, hitbox: { x: -40, y: 110, w: 150, h: 140 }, radiacion: 120, fx: 'radiacion', poses: ['super_w', 'push_h'],
        ciencia: 'Los átomos radiactivos se desintegran solos y liberan energía en todas direcciones.' }),
      mv({ id: 'gamma', nombre: 'Rayos gamma', boton: 'S', dir: 'adelante', motion: 'DP', estado: 'pie', startup: 3, active: 12, recovery: 24, damage: 78, hitstun: 30, blockstun: 12, hitbox: { x: 8, y: 150, w: 62, h: 100 }, salto: 1550, avance: 220, lanza: 1300, invul: 6, fx: 'radiacion', poses: ['upper_w', 'upper_h'],
        ciencia: 'Los rayos gamma son la radiación más penetrante: hace falta plomo grueso para frenarlos.' }),
      mv({ id: 'agarre', nombre: 'Muestra radiactiva', boton: 'PK', estado: 'pie', startup: 3, active: 2, recovery: 22, damage: 84, hitstun: 30, blockstun: 1, hitbox: { x: 8, y: 120, w: 52, h: 70 }, agarre: true, radiacion: 120, efecto: 'derribo', poses: ['grab_w', 'grab_h'] }),
      mv({ id: 'contra', nombre: 'Escudo de plomo', boton: 'S', dir: 'adelante', guardia: true, estado: 'pie', startup: 4, active: 4, recovery: 22, damage: 54, hitstun: 24, blockstun: 10, hitbox: { x: 15, y: 130, w: 82, h: 60 }, invul: 10, empuje: 1200, efecto: 'derribo', poses: ['strong_w', 'strong_h'],
        ciencia: 'El plomo es muy denso y absorbe la radiación; por eso se usa en los delantales de rayos X.' }),
      mv({ id: 'nobel', nombre: 'Doble Nobel', boton: 'S', dir: 'abajo', super: true, estado: 'pie', startup: 6, active: 30, recovery: 26, damage: 42, golpes: 6, hitstun: 22, blockstun: 8, hitbox: { x: -30, y: 120, w: 160, h: 140 }, avance: 500, lanza: 1400, invul: 10, radiacion: 240, fx: 'radiacion', poses: ['super_w', 'push_h', 'win'],
        ciencia: 'Nobel de Física en 1903 y de Química en 1911: nadie más lo ha logrado en dos ciencias distintas.' }),
    ],
    combos: [
      { nombre: 'Vida media', secuencia: ['jab', 'directo', 'radio'] },
      { nombre: 'Reacción en cadena', secuencia: ['jab', 'jab', 'desintegra'] },
      { nombre: 'Rayos X', secuencia: ['cjab', 'gamma'] },
      { nombre: 'Escudo de plomo', secuencia: ['perfecto', 'contra'] },
    ],
  };

  const OFICIALES = [NEWTON, TESLA, DARWIN, LAMARCK, CURIE];
  const PRESUPUESTO = 1200;
  const SUPER_MAX_DANO = 320;
  const PIEZAS_VALIDAS = ['peluca', 'pelo', 'calva', 'mono', 'barba', 'bigote', 'levita', 'falda', 'corbatin', 'lentes', 'orejas', 'cola', 'banda', 'alas', 'collar', 'cresta', 'pico', 'cuernos', 'hocico'];
  const FX = ['chispas', 'gravedad', 'radiacion', 'prisma', 'hojas'];
  const FORMAS = ['manzana', 'rayo', 'pinzon', 'radio', 'orbe'];
  const EFECTOS = ['derribo', 'pared', 'suelo', 'electro'];

  const isHex = c => typeof c === 'string' && /^#[0-9a-fA-F]{6}$/.test(c);
  const num = (v, lo, hi) => typeof v === 'number' && Number.isInteger(v) && v >= lo && v <= hi;

  // Notación legible del input de un movimiento
  function notation(m) {
    const d = { adelante: '→', atras: '←', abajo: '↓' }[m.dir] || '';
    const btn = m.boton === 'PK' ? 'P+K' : m.boton;
    let s = (m.estado === 'agachado' ? '↓+' : '') + (d ? d + '+' : '') + btn;
    if (m.estado === 'aire') s = 'aire ' + s;
    if (m.super) s = '↓+S con barra llena';
    if (m.guardia) s = '→+S mientras bloqueas (½ barra)';
    if (m.motion) s += ` o ${m.motion === 'QCF' ? '↓↘→' : '→↓↘'}+P`;
    return s;
  }

  function moveCost(m) {
    if (m.super) return 0; // el súper se paga con la barra, no con el presupuesto
    if (m.guardia) return Math.round(moveCost(Object.assign({}, m, { guardia: false })) / 2); // cuesta media barra
    const hits = m.golpes || 1;
    const reach = m.proyectil ? 0 : Math.round((m.hitbox.x + m.hitbox.w) / 10);
    return Math.round(m.damage * hits * 30 / (m.startup + m.active + m.recovery + 6)) + reach
      + (m.proyectil ? 25 : 0) + ((m.cancel || []).length * 4) + (m.lanza ? 8 : 0) + (m.avance ? 6 : 0)
      + (m.efecto ? 8 : 0) + (m.invul ? m.invul * 2 : 0) + (m.agarre ? 10 : 0) + (m.picada || m.salto ? 5 : 0)
      + (m.atrae ? 12 : 0) + (m.radiacion ? Math.round(m.radiacion / 6) : 0) + (m.proyectil && m.proyectil.cielo ? 15 : 0);
  }
  function statsCost(s) {
    return Math.round(s.vida / 25) + Math.round(s.velocidad / 12) + Math.round(s.salto / 60) + Math.round((s.peso || 100) / 10);
  }

  // Devuelve { ok, errores[], avisos[], costo, presupuesto, desglose[] }
  function validate(def) {
    const E = [], W = [];
    const err = m => E.push(m), warn = m => W.push(m);
    if (!def || typeof def !== 'object') return { ok: false, errores: ['No es un objeto JSON'], avisos: [], costo: 0, presupuesto: PRESUPUESTO, desglose: [] };
    const meta = def.meta || {};
    if (typeof meta.id !== 'string' || !/^[a-z0-9-]{2,24}$/.test(meta.id)) err('meta.id: 2–24 letras minúsculas, números o guiones');
    if (typeof meta.nombre !== 'string' || meta.nombre.length < 2 || meta.nombre.length > 16) err('meta.nombre: entre 2 y 16 caracteres');
    const s = def.stats || {};
    if (!num(s.vida, 600, 1400)) err('stats.vida: entero entre 600 y 1400');
    if (!num(s.velocidad, 150, 600)) err('stats.velocidad: entero entre 150 y 600');
    if (!num(s.salto, 900, 2000)) err('stats.salto: entero entre 900 y 2000');
    if (s.peso !== undefined && !num(s.peso, 60, 140)) err('stats.peso: entero entre 60 y 140 (100 = normal)');
    const rig = def.rig || {}, p = rig.proporciones || {}, g = rig.grosor || {}, pal = rig.paleta || {};
    [['torso', 30, 80], ['cabeza', 10, 24], ['brazo', 20, 55], ['antebrazo', 20, 55], ['muslo', 25, 60], ['pierna', 25, 60]].forEach(([k, lo, hi]) => {
      if (!num(p[k], lo, hi)) err(`rig.proporciones.${k}: entero entre ${lo} y ${hi}`);
    });
    [['cuerpo', 10, 40], ['brazo', 6, 20], ['pierna', 6, 22]].forEach(([k, lo, hi]) => {
      if (!num(g[k], lo, hi)) err(`rig.grosor.${k}: entero entre ${lo} y ${hi}`);
    });
    ['piel', 'ropa', 'acento', 'ojos'].forEach(k => { if (!isHex(pal[k])) err(`rig.paleta.${k}: color #rrggbb`); });
    ['manos', 'mangas'].forEach(k => { if (pal[k] !== undefined && !isHex(pal[k])) err(`rig.paleta.${k}: color #rrggbb (opcional)`); });
    (rig.piezas || []).forEach((pz, i) => {
      if (!PIEZAS_VALIDAS.includes(pz.tipo)) warn(`rig.piezas[${i}]: tipo "${pz.tipo}" no existe, se ignora`);
      if (pz.color !== undefined && !isHex(pz.color)) err(`rig.piezas[${i}].color: color #rrggbb`);
    });
    if ((rig.piezas || []).length > 12) err('rig.piezas: máximo 12');
    const poses = Object.assign({}, BASE_POSES, def.poses || {});
    Object.entries(def.poses || {}).forEach(([k, v]) => {
      POSE_KEYS.forEach(pk => { if (typeof v[pk] !== 'number' || Math.abs(v[pk]) > 360) err(`poses.${k}.${pk}: número entre -360 y 360`); });
    });
    const moves = Array.isArray(def.moves) ? def.moves : [];
    if (moves.length < 1 || moves.length > 30) err('moves: entre 1 y 30 movimientos');
    const ids = moves.map(m => m.id);
    const desglose = [];
    let costo = statsCost(s);
    desglose.push(['stats', statsCost(s)]);
    let supers = 0, agarres = 0, guardias = 0;
    moves.forEach((m, i) => {
      const at = `moves[${i}]${m.id ? ' (' + m.id + ')' : ''}`;
      if (typeof m.id !== 'string') err(`${at}.id falta`);
      if (ids.indexOf(m.id) !== i) err(`${at}: id repetido`);
      if (!['P', 'K', 'S', 'PK'].includes(m.boton)) err(`${at}.boton: P, K, S o PK`);
      if (!['pie', 'agachado', 'aire'].includes(m.estado)) err(`${at}.estado: pie, agachado o aire`);
      if (m.dir !== undefined && !['adelante', 'atras', 'abajo'].includes(m.dir)) err(`${at}.dir: adelante, atras o abajo`);
      if (m.dir === 'abajo' && m.estado !== 'aire' && !m.super && !m.guardia) err(`${at}.dir "abajo": solo en el aire (en el suelo usa estado "agachado")`);
      if (m.motion !== undefined && !['QCF', 'DP'].includes(m.motion)) err(`${at}.motion: "QCF" (↓↘→) o "DP" (→↓↘)`);
      if (!num(m.startup, 1, 60)) err(`${at}.startup: entero 1–60`);
      if (!num(m.active, 1, 40)) err(`${at}.active: entero 1–40`);
      if (!num(m.recovery, 0, 60)) err(`${at}.recovery: entero 0–60`);
      if (!num(m.damage, 0, 250)) err(`${at}.damage: entero 0–250`);
      if (!num(m.hitstun, 1, 60)) err(`${at}.hitstun: entero 1–60`);
      if (!num(m.blockstun, 1, 60)) err(`${at}.blockstun: entero 1–60`);
      if (!['medio', 'bajo', 'alto'].includes(m.nivel)) err(`${at}.nivel: medio, bajo o alto`);
      const hb = m.hitbox || {};
      if (!num(hb.x, -40, 200) || !num(hb.y, 0, 260) || !num(hb.w, 4, 160) || !num(hb.h, 4, 140)) err(`${at}.hitbox: x, y, w, h enteros dentro de rango`);
      else if (hb.x + hb.w > 220) err(`${at}.hitbox: alcance máximo 220 px`);
      if (m.golpes !== undefined && !num(m.golpes, 1, 10)) err(`${at}.golpes: entero 1–10`);
      if (m.golpes > 1 && !m.proyectil && m.active < m.golpes * 2) err(`${at}: con ${m.golpes} golpes necesita al menos ${m.golpes * 2} cuadros activos`);
      if (m.avance !== undefined && !num(m.avance, 0, 1400)) err(`${at}.avance: entero 0–1400`);
      if (m.empuje !== undefined && !num(m.empuje, 0, 1800)) err(`${at}.empuje: entero 0–1800`);
      if (m.lanza !== undefined && !num(m.lanza, 0, 1600)) err(`${at}.lanza: entero 0–1600`);
      if (m.salto !== undefined && !num(m.salto, 0, 2000)) err(`${at}.salto: entero 0–2000`);
      if (m.invul !== undefined && !num(m.invul, 0, 20)) err(`${at}.invul: entero 0–20 cuadros`);
      if (m.efecto !== undefined && !EFECTOS.includes(m.efecto)) err(`${at}.efecto: ${EFECTOS.join(', ')}`);
      if (m.picada && (m.estado !== 'aire' || !num(m.picada.vx, 0, 1400) || !num(m.picada.vy, 0, 2000))) err(`${at}.picada: solo en el aire, vx 0–1400, vy 0–2000`);
      if (m.proyectil) {
        const pr = m.proyectil;
        if (!num(pr.vel, 200, 1200) || !num(pr.vida, 20, 200)) err(`${at}.proyectil: vel 200–1200, vida 20–200`);
        if (pr.vy !== undefined && !num(pr.vy, -1500, 1500)) err(`${at}.proyectil.vy: entero −1500 a 1500 (velocidad vertical inicial)`);
        if (pr.grav !== undefined && !num(pr.grav, 0, 120)) err(`${at}.proyectil.grav: entero 0–120`);
        if (pr.cielo !== undefined && typeof pr.cielo !== 'boolean') err(`${at}.proyectil.cielo: true o false (cae sobre el rival)`);
        if (pr.altura !== undefined && (!pr.cielo || !num(pr.altura, 200, 520))) err(`${at}.proyectil.altura: entero 200–520, solo con cielo`);
        if (pr.forma !== undefined && !FORMAS.includes(pr.forma)) warn(`${at}.proyectil.forma: ${FORMAS.join(', ')}; se dibuja como orbe`);
      }
      if (m.atrae !== undefined && !num(m.atrae, 0, 1800)) err(`${at}.atrae: entero 0–1800 (arrastra al rival hacia ti)`);
      if (m.radiacion !== undefined && !num(m.radiacion, 0, 240)) err(`${at}.radiacion: entero 0–240 cuadros de daño lento`);
      if (m.estira !== undefined && !num(m.estira, 100, 220)) err(`${at}.estira: entero 100–220 (% del largo del brazo, solo visual)`);
      if (m.estiraCuello !== undefined && !num(m.estiraCuello, 100, 400)) err(`${at}.estiraCuello: entero 100–400 (% del cuello, solo visual)`);
      if (m.fx !== undefined && !FX.includes(m.fx)) warn(`${at}.fx: ${FX.join(', ')}; se ignora`);
      if (m.ciencia !== undefined && (typeof m.ciencia !== 'string' || m.ciencia.length > 160)) err(`${at}.ciencia: texto de máximo 160 caracteres`);
      if (m.agarre) { agarres++; if (m.boton !== 'PK' || m.estado !== 'pie') err(`${at}: un agarre usa boton "PK" y estado "pie"`); if ((hb.x || 0) + (hb.w || 0) > 70) err(`${at}: un agarre alcanza máximo 70 px`); }
      if (m.guardia) { guardias++; if (m.boton !== 'S' || m.estado !== 'pie') err(`${at}: el contragolpe usa boton "S" y estado "pie"`); }
      if (m.super) {
        supers++;
        if (m.boton !== 'S' || m.dir !== 'abajo') err(`${at}: el súper usa boton "S" y dir "abajo"`);
        if (m.damage * (m.golpes || 1) > SUPER_MAX_DANO) err(`${at}: el súper puede quitar máximo ${SUPER_MAX_DANO} en total`);
      }
      const nPoses = Array.isArray(m.poses) ? m.poses.length : 0;
      if (nPoses < 2 || nPoses > 3 || !m.poses.every(n => poses[n])) err(`${at}.poses: 2 o 3 nombres de pose existentes`);
      (m.cancel || []).forEach(c => { if (!ids.includes(c)) err(`${at}.cancel: "${c}" no existe`); });
      if (m.damage > 0 && m.hitstun <= m.blockstun) warn(`${at}: hitstun menor o igual que blockstun`);
      try { const c = moveCost(m); if (Number.isFinite(c)) { costo += c; desglose.push([m.id, c]); } } catch (e) { /* ya reportado */ }
    });
    if (supers > 1) err('Solo se permite un súper por personaje');
    if (agarres > 1) err('Solo se permite un agarre por personaje');
    if (guardias > 1) err('Solo se permite un contragolpe de guardia por personaje');
    const combos = def.combos === undefined ? [] : def.combos;
    if (!Array.isArray(combos) || combos.length > 8) err('combos: lista de máximo 8');
    else combos.forEach((c, i) => {
      if (typeof c.nombre !== 'string' || c.nombre.length < 2 || c.nombre.length > 24) err(`combos[${i}].nombre: 2–24 caracteres`);
      if (!Array.isArray(c.secuencia) || c.secuencia.length < 1 || c.secuencia.length > 6) err(`combos[${i}].secuencia: 1–6 pasos`);
      else c.secuencia.forEach((t, j) => { if (t !== 'perfecto' && !ids.includes(t)) err(`combos[${i}].secuencia[${j}]: "${t}" no es un movimiento ni "perfecto"`); });
    });
    if (!moves.some(m => m.estado === 'pie' && m.boton === 'P' && !m.dir)) warn('Sin golpe de pie con P: el personaje no podrá golpear de pie');
    if (Number.isFinite(costo) && costo > PRESUPUESTO) err(`Balance: cuesta ${costo} puntos y el máximo es ${PRESUPUESTO}. Baja daño, alcance o stats.`);
    return { ok: E.length === 0, errores: E, avisos: W, costo, presupuesto: PRESUPUESTO, desglose };
  }

  function compile(def) {
    const p = def.rig.proporciones;
    return {
      def,
      poses: Object.assign({}, BASE_POSES, def.poses || {}),
      alto: p.muslo + p.pierna + p.torso + p.cabeza * 2,
      ancho: 22 + Math.round(def.rig.grosor.cuerpo / 2),
    };
  }

  return { BASE_POSES, POSE_KEYS, OFICIALES, PRESUPUESTO, PIEZAS_VALIDAS, FX, FORMAS, validate, compile, moveCost, notation };
})();

