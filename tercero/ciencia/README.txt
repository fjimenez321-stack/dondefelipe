Mercado de Villa Verde · v18
============================
Abrir index.html en un navegador (Chrome, Edge, Firefox o Safari recientes).
Si el navegador bloquea imágenes al abrir el archivo directamente, usar un servidor local
(por ejemplo: python -m http.server) o subirlo a un hosting estático.

Novedades respecto de v17
- Mundo 2400×1760 con cámara que sigue al personaje, minimapa y orden de profundidad (el personaje pasa detrás de árboles y casas).
- Texturas procedurales nuevas: adoquines, baldosas, tejas, madera, estuco, piedra, tierra y arena. Se mantiene el pasto original.
- Ciclo de día y noche con faroles, ventanas iluminadas, luciérnagas, humo de chimeneas, agua animada y pileta.
- Consecuencias visibles: la basura enviada al vertedero aparece flotando en el río y el agua se enturbia; una huella alta deja neblina.
- Controles: WASD/flechas, Shift para correr, E/Espacio/Enter para interactuar, clic para caminar, I mochila, M mapa, Esc pausa.
  Táctil: joystick + botón E + botón Correr. Gamepad: stick o cruceta, A interactúa, B cierra, Y mochila, Start pausa.
- Economía coherente de 7 días: comer 2 veces al día, alimentos que vencen, envases y separación de residuos,
  imprevistos (reparar / usado / nuevo), tentaciones con adaptación hedónica, trabajos con costo de energía y tiempo,
  huerto con compost. Informe final con puntaje, logros, gráfico de huella diaria y preguntas para conversar en clase.
- Guardado automático en el navegador (botón "Continuar partida").
- Se corrigieron: el día nunca avanzaba, el trabajo quedaba bloqueado, funciones de movimiento duplicadas,
  el hogar dibujaba una hoja de muestra con logo y texto de licencia, reciclar comida daba dinero.

Recursos
- assets/player_knight.png (personaje, reducido para rendimiento), assets/cat.png, assets/penguin.png, assets/grass.jpg.
- assets/music.mp3: "Glass Kingdom Rites" como música de fondo (128 kbps, en bucle). Se baja de volumen al abrir menús, se pausa al cambiar de pestaña. Tecla N o botón de nota para silenciar.
- Las texturas antiguas y los .fbx ya no se usan.
- Las cifras de CO2e son aproximaciones con fines educativos.

Ampliación (huerto activo, más productos y acciones)
- Huerto de 6 parcelas al costado del hogar: compra semillas (Almacén > Vivero y semillas) o retíralas gratis
  en la biblioteca de semillas (Centro de Reutilización > Comunidad). Planta, riega y vuelve a cosechar.
  1 minuto real = 2 horas del juego: lechuga ~2,5 min, zanahorias ~5 min, papas ~7,5 min, zapallo ~10 min.
  Sin riego crecen muy lento; con compost crecen 50% más rápido y dan 1 porción extra.
  Lo listo y no cosechado se marchita al día siguiente. Los miércoles y sábados llueve en la mañana.
- Mercado: 30 productos (antes 16). Nuevos: tomates, papas, paltas, jurel, queso, avena, atún, leche en caja
  y retornable, galletas, empanada, sopaipillas, café en vaso o en tu taza, bebida en lata.
- Almacén: semillas, saco de abono, taza, botella y barril de agua lluvia; 5 tentaciones en la vitrina.
- Centro de Reutilización: voluntariado para limpiar el río (el río se ve más limpio), taller para aprender
  a reparar (reparaciones a mitad de precio), biblioteca de semillas, trueque de objetos por semillas.
- Centro de Oficios: 8 trabajos (nuevos: ayudante del vivero, guía de la reserva).
- Hogar: conservas en frasco (alimentos +10 días), sala de estar (leer, siesta, llamar a una amiga, serie),
  ejercicio diario. Pueblo: tablón de anuncios en la plaza y observación de aves en la laguna.

Música
- Exterior: assets/music.mp3 ("Glass Kingdom Rites").
- Interiores: assets/music_indoor.mp3 ("Safe Harbor at Midday"). Suena dentro del hogar y al entrar al
  Mercado, Centro de Oficios, Centro de Reutilización y Almacén. Las pistas se cruzan con un fundido suave.

Corrección de huella de carbono
- Valores de alimentos ajustados a Poore y Nemecek (2018), vía Our World in Data (kg CO2e por kg):
  vacuno 500 g = 30 kg, pollo 500 g = 4,9, queso 250 g = 6, leche 1 L = 3,1 a 3,2, arroz 1 kg = 4,5,
  lentejas 1 kg = 1,8 a 2, avena 1 kg = 2,5, huevos (6) = 1,7, papas 1,5 kg = 0,7, empanada de pino = 3,5.
- Se quitó la "neblina" asociada a la huella: el CO2 es invisible y actúa a escala global.
- Las cosechas del huerto se muestran como "casi 0 kg CO2e" (no exactamente cero).

Terreno doble y árboles (talar y replantar)
- El mundo pasó de 2400×1760 a 3500×2500 (algo más del doble de superficie). El pueblo queda igual;
  se agregan el Bosque comunitario (noreste), un segundo puente (Puente del Bosque), bosques y praderas al sur.
  Las calles se prolongan hacia el este y nuevos senderos conectan el hogar, la reserva y el puente nuevo.
- Talar: con un hacha (se presta gratis en el Centro de Reutilización > Comunidad, o se compra en el Almacén)
  te acercas a un árbol y presionas E. Da 2 a 4 maderas y a veces 1 o 2 brotes. En la reserva natural no se tala.
- Plantar: con brotes en la mochila, párate en el pasto y presiona E (o sobre un tocón). Riega el brote:
  regado se hace árbol en ~12 minutos reales. Los árboles plantados y talados se guardan en la partida.
- La madera se vende en el Almacén o se usa para construir una compostera (taller del Centro de Reutilización).
- El informe final cuenta árboles talados y plantados; talar más de lo que plantas resta puntos de huella.

Banco Villa Verde (junto al Almacén, frente a la calle sur)
- Resumen: dinero en mano, ahorro, depósito a plazo, inversiones, deudas y patrimonio neto.
- Ahorrar: cuenta de ahorro (2% por noche, interés compuesto) y depósito a plazo (15% en 3 noches, bloqueado).
- Préstamos: crédito del banco (3% por noche, requiere haber trabajado) y avance rápido (10% por noche, sin requisitos).
  El domingo en la noche el banco cobra lo que se deba; lo impago queda en el informe.
- Invertir: bono municipal (riesgo bajo), cooperativa solar (medio, depende del clima), fondo de productores locales
  (medio, variable) y acciones de MegaBurger (alto, muy variable). También la bicicleta usada como inversión personal.
- Tasas exageradas a propósito para que el efecto se vea en una semana; el juego lo advierte.
- El puntaje de ahorro ahora usa el patrimonio neto y descuenta si quedan deudas. Logros nuevos: "Sin deudas" y "Ahorro".

Multijugador en línea (ver LEEME-MULTIJUGADOR.txt)
- Pantalla de inicio: nombre + código del curso + "Jugar en línea". Requiere configurar Firebase en firebase-config.js.
- Jugadores visibles con nombre y emotes; árboles, plantaciones y río compartidos por todo el curso.
