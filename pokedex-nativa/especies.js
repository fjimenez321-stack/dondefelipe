/* ═══════════════════════════════════════════════════════════════
   NATIVADEX · catálogo de especies (prototipo)
   Basado en el folleto «Restauración Ecológica Villa Alemana»
   (flora y fauna de la zona central de Chile).

   Cada fila: [categoría, nombre, nombre científico, origen,
               conservación, hábitat, rareza (opcional), pista, cuidado]
   origen: N nativa · E endémica · I introducida
   conservación: LC preocupación menor · NT casi amenazada ·
                 VU vulnerable · NE no evaluada · '' sin dato en el folleto
   hábitat: sol · som · que · amb · '' (ver HABITATS)
   rareza: '' = se calcula sola; o 'comun' | 'rara' | 'epica' | 'legendaria'
   ═══════════════════════════════════════════════════════════════ */
(function () {
  var CATEGORIAS = {
    flor:      { nombre: 'Flores silvestres',   ico: '🌸', reino: 'Flora' },
    arbol:     { nombre: 'Árboles nativos',     ico: '🌳', reino: 'Flora' },
    arbusto:   { nombre: 'Arbustos nativos',    ico: '🌿', reino: 'Flora' },
    trepadora: { nombre: 'Trepadoras',          ico: '🍃', reino: 'Flora' },
    ave:       { nombre: 'Aves',                ico: '🐦', reino: 'Fauna' },
    rapaz:     { nombre: 'Rapaces diurnas',     ico: '🦅', reino: 'Fauna' },
    nocturna:  { nombre: 'Rapaces nocturnas',   ico: '🦉', reino: 'Fauna' },
    mamifero:  { nombre: 'Mamíferos',           ico: '🦊', reino: 'Fauna' },
    reptil:    { nombre: 'Reptiles',            ico: '🦎', reino: 'Fauna' },
    aracnido:  { nombre: 'Arácnidos',           ico: '🕷️', reino: 'Fauna' },
    insecto:   { nombre: 'Insectos',            ico: '🪲', reino: 'Fauna' },
    hongo:     { nombre: 'Hongos',              ico: '🍄', reino: 'Fungi' }
  };

  var HABITATS = {
    sol: 'Ladera soleada',
    som: 'Ladera sombría',
    que: 'Ladera sombría y fondos de quebrada',
    amb: 'Ladera soleada y sombría',
    '':  'Zona central de Chile'
  };

  var NO_TOCAR = 'Solo fotografía: no lo toques ni lo recolectes.';
  var HONGO = 'Nunca lo toques con la boca ni lo comas. Solo fotografía.';
  var FAUNA = 'Mantén distancia: no lo persigas, no lo atrapes ni lo alimentes.';

  var F = [
    // ── Flores silvestres
    ['flor', 'Ajicillo', 'Alonsoa meridionalis', 'E', '', '', '', 'Flores pequeñas de color rojo intenso.', ''],
    ['flor', 'Azulillo', 'Pasithea caerulea', 'N', '', '', 'rara', 'Flores azules sobre tallos largos y delgados.', ''],
    ['flor', 'Huilli', 'Leucocoryne ixioides', 'N', '', '', '', 'Flores blancas o lila, crece de un bulbo.', ''],
    ['flor', 'Mariposa del campo', 'Alstroemeria pulchra', 'E', '', '', '', 'Alstroemeria de pétalos rosados con manchas.', ''],
    ['flor', 'Orquídea', 'Chloraea chrysantha', 'E', '', '', 'epica', 'Orquídea terrestre de flores amarillo‑anaranjadas en espiga.', NO_TOCAR],
    ['flor', 'Añañuca', 'Rhodophiala phycelloides', 'E', '', '', '', 'Flores rojas en forma de trompeta; crece de un bulbo.', ''],
    ['flor', 'Capachito', 'Calceolaria corymbosa', 'E', '', '', '', 'Flores amarillas con forma de bolsita.', ''],
    ['flor', 'Quilloy', 'Stellaria chilensis', 'E', '', '', '', 'Florecita blanca de pétalos partidos, como estrella.', ''],

    // ── Árboles
    ['arbol', 'Algarrobo', 'Neltuma chilensis', 'N', 'LC', 'sol', '', 'Hojas compuestas muy finas y espinas en las ramas.', ''],
    ['arbol', 'Espino', 'Vachellia caven', 'N', 'LC', 'sol', '', 'Espinas blancas y pompones amarillos muy aromáticos.', 'Cuidado con las espinas.'],
    ['arbol', 'Frangel', 'Kageneckia angustifolia', 'E', 'VU', 'sol', '', 'Hojas largas y angostas.', ''],
    ['arbol', 'Huingán', 'Schinus polygamus', 'N', 'LC', 'sol', '', 'Hojas pequeñas; a veces tiene agallas en las ramas.', ''],
    ['arbol', 'Lun', 'Escallonia revoluta', 'E', 'NE', 'sol', '', 'Hojas grisáceas de borde enrollado.', ''],
    ['arbol', 'Molle', 'Schinus latifolius', 'E', 'NE', 'sol', '', 'Pariente del pimiento; hojas anchas y aromáticas.', ''],
    ['arbol', 'Quebracho', 'Senna candolleana', 'E', 'LC', 'sol', '', 'Flores amarillas y vainas largas.', ''],
    ['arbol', 'Tara', 'Caesalpinia spinosa', 'N', 'NE', 'sol', 'rara', 'Vainas rojizas y aplanadas.', 'Tiene espinas.'],
    ['arbol', 'Belloto del norte', 'Beilschmiedia miersii', 'E', 'VU', 'que', 'legendaria', 'Fruto parecido a una bellota; vive en quebradas húmedas.', NO_TOCAR],
    ['arbol', 'Bollén', 'Kageneckia oblonga', 'E', 'LC', 'que', '', 'Hojas duras de borde aserrado.', ''],
    ['arbol', 'Canelo', 'Drimys winteri', 'N', 'VU', 'que', '', 'Árbol sagrado mapuche; hojas blanquecinas por debajo.', ''],
    ['arbol', 'Naranjillo', 'Citronella mucronata', 'E', 'VU', 'que', '', 'En ejemplares jóvenes, las hojas tienen borde espinoso.', ''],
    ['arbol', 'Litre', 'Lithraea caustica', 'E', 'LC', 'que', '', 'Hojas duras y brillantes.', '¡No lo toques! Puede producir alergia en la piel.'],
    ['arbol', 'Maqui', 'Aristotelia chilensis', 'N', 'LC', 'que', '', 'Frutos morado oscuro en racimos.', ''],
    ['arbol', 'Patagua', 'Crinodendron patagua', 'E', 'VU', 'que', '', 'Flores blancas acampanadas que cuelgan; busca cerca del agua.', ''],
    ['arbol', 'Peumo', 'Cryptocarya alba', 'E', 'LC', 'que', '', 'Hojas aromáticas y frutos rojos.', ''],
    ['arbol', 'Boldo', 'Peumus boldus', 'E', 'LC', 'amb', '', 'Hojas ásperas y muy aromáticas.', ''],
    ['arbol', 'Maitén', 'Maytenus boaria', 'N', 'LC', 'amb', '', 'Ramas colgantes y hojas pequeñas aserradas.', ''],
    ['arbol', 'Palma chilena', 'Jubaea chilensis', 'E', 'VU', 'amb', '', 'Tronco muy grueso; sus frutos son los coquitos.', ''],
    ['arbol', 'Quillay', 'Quillaja saponaria', 'E', 'LC', 'amb', '', 'Su corteza tiene saponinas: hace espuma con agua.', ''],

    // ── Trepadoras
    ['trepadora', 'Pasiflora', 'Passiflora pinnatistipula', 'N', 'LC', '', 'rara', 'Flor con una corona de filamentos.', ''],
    ['trepadora', 'Quilo', 'Muehlenbeckia hastulata', 'E', 'NE', '', '', 'Hojas con forma de punta de flecha.', ''],
    ['trepadora', 'Camisilla', 'Dioscorea bryoniifolia', 'E', 'NE', '', '', 'Enredadera de hojas lobuladas.', ''],
    ['trepadora', 'Voqui', 'Cissus striata', 'N', 'LC', '', '', 'Hojas divididas como una manito.', ''],

    // ── Arbustos
    ['arbusto', 'Guayacán', 'Porlieria chilensis', 'E', 'VU', 'sol', 'epica', 'Madera muy dura; hojas pequeñas compuestas.', ''],
    ['arbusto', 'Chagual azul', 'Puya alpestris', 'N', 'LC', 'sol', 'rara', 'Puya de flores turquesa en una vara alta.', 'Hojas con espinas en el borde.'],
    ['arbusto', 'Chagual', 'Puya chilensis', 'N', 'LC', 'sol', '', 'Vara floral alta con flores amarillo‑verdosas.', 'Hojas con espinas en el borde.'],
    ['arbusto', 'Colliguay', 'Colliguaja odorifera', 'E', 'NE', 'sol', '', 'Al romperse suelta látex; sus frutos estallan.', 'El látex irrita: no lo toques.'],
    ['arbusto', 'Corontillo', 'Escallonia pulverulenta', 'E', 'LC', 'sol', '', 'Hojas grandes algo pegajosas; flores blancas en espiga.', ''],
    ['arbusto', 'Mitique', 'Podanthus mitiqui', 'E', 'NE', 'sol', '', 'Flores amarillas pequeñas.', ''],
    ['arbusto', 'Tevo', 'Retanilla trinervia', 'E', 'LC', 'sol', '', 'Ramas espinosas y hojas con tres nervios.', 'Tiene espinas.'],
    ['arbusto', 'Romerillo', 'Baccharis linearis', 'N', 'LC', 'sol', '', 'Hojas muy angostas; muy común en el matorral.', ''],
    ['arbusto', 'Mayu', 'Sophora macrocarpa', 'E', 'LC', 'som', '', 'Flores amarillas grandes en racimos.', ''],
    ['arbusto', 'Salvia macho', 'Aristeguietia salvia', 'E', 'NE', 'som', '', 'Hojas rugosas y aromáticas.', ''],
    ['arbusto', 'Tupa roja', 'Lobelia excelsa', 'E', 'NE', 'som', '', 'Flores rojas tubulares que visitan los picaflores.', 'Su látex es tóxico: no la toques.'],
    ['arbusto', 'Tupa morada', 'Lobelia polyphylla', 'E', 'NE', 'som', 'rara', 'Flores tubulares de color púrpura.', 'Su látex es tóxico: no la toques.'],
    ['arbusto', 'Palqui', 'Cestrum parqui', 'N', 'LC', 'som', '', 'Olor fuerte; flores amarillo verdosas.', 'Es tóxico: no lo toques con la boca.'],
    ['arbusto', 'Arrayán', 'Luma apiculata', 'N', 'LC', 'som', 'rara', 'Corteza anaranjada y lisa; busca cerca del agua.', ''],
    ['arbusto', 'Atutemo', 'Chusquea cumingii', 'N', 'NE', 'som', '', 'Bambú nativo de tallos delgados.', ''],
    ['arbusto', 'Corcolén', 'Azara celastrina', 'E', 'LC', 'som', '', 'Flores amarillas muy aromáticas.', ''],

    // ── Aves
    ['ave', 'Chincol', 'Zonotrichia capensis', 'N', '', '', '', 'Pequeño copete y collar color óxido. Muy común.', FAUNA],
    ['ave', 'Codorniz', 'Callipepla californica', 'I', '', '', '', 'Especie introducida; penacho curvo sobre la cabeza.', FAUNA],
    ['ave', 'Diuca', 'Diuca diuca', 'N', '', '', '', 'Gris con garganta blanca; canta al amanecer.', FAUNA],
    ['ave', 'Diucón', 'Xolmis pyrope', 'N', '', '', '', 'Ave gris de ojos rojos; se posa en ramas altas.', FAUNA],
    ['ave', 'Jilguero', 'Carduelis barbata', 'N', '', '', '', 'Amarillo; el macho tiene la cabeza negra.', FAUNA],
    ['ave', 'Loica', 'Sturnella loyca', 'N', '', '', '', 'Pecho rojo intenso; anda en el suelo de los pastizales.', FAUNA],
    ['ave', 'Tordo', 'Curaeus curaeus', 'N', '', '', '', 'Completamente negro, anda en grupos ruidosos.', FAUNA],
    ['ave', 'Zorzal', 'Turdus falcklandii', 'N', '', '', '', 'Pico y patas amarillas; busca lombrices en el pasto.', FAUNA],
    ['ave', 'Cachudito', 'Anairetes parulus', 'N', '', '', 'rara', 'Diminuto, con un copete negro levantado.', FAUNA],
    ['ave', 'Carpinterito', 'Dryobates lignarius', 'N', '', '', 'epica', 'Pequeño carpintero: escucha el golpeteo en los troncos.', FAUNA],
    ['ave', 'Chercán', 'Troglodytes aedon chilensis', 'N', '', '', '', 'Pequeño y café, cola levantada, canto muy fuerte.', FAUNA],
    ['ave', 'Perdiz chilena', 'Nothoprocta perdicaria', 'E', '', '', 'epica', 'Camina oculta en el pastizal y vuela al último momento.', FAUNA],
    ['ave', 'Picaflor chico', 'Sephanoides sephaniodes', 'N', '', '', '', 'Colibrí pequeño; búscalo en flores tubulares.', FAUNA],
    ['ave', 'Picaflor gigante', 'Patagona gigas', 'N', '', '', 'legendaria', 'El colibrí más grande del mundo.', FAUNA],
    ['ave', 'Rayadito', 'Aphrastura spinicauda', 'N', '', '', 'rara', 'Cola con puntas como espinas; se mueve en grupos.', FAUNA],
    ['ave', 'Tenca', 'Mimus thenca', 'E', '', '', '', 'Canta desde lo alto de los arbustos e imita otros cantos.', FAUNA],
    ['rapaz', 'Aguilucho común', 'Geranoaetus polyosoma', 'N', '', '', 'epica', 'Planea en círculos sobre las laderas.', FAUNA],
    ['rapaz', 'Cernícalo', 'Falco sparverius', 'N', '', '', 'rara', 'Halcón pequeño que se queda suspendido en el aire.', FAUNA],
    ['rapaz', 'Peuco', 'Parabuteo unicinctus', 'N', '', '', 'rara', 'Rapaz de hombros rojizos; caza otras aves.', FAUNA],
    ['rapaz', 'Tiuque', 'Milvago chimango', 'N', '', '', '', 'La rapaz más común: campos, carreteras y ciudades.', FAUNA],
    ['nocturna', 'Chuncho', 'Glaucidium nanum', 'N', '', '', 'legendaria', 'Búho pequeño, también activo de día; tiene «ojos falsos» en la nuca.', FAUNA],
    ['nocturna', 'Lechuza', 'Tyto alba', 'N', '', '', 'epica', 'Cara blanca en forma de corazón.', FAUNA],
    ['nocturna', 'Tucúquere', 'Bubo magellanicus', 'N', '', '', 'legendaria', 'Búho grande con penachos como orejas.', FAUNA],

    // ── Mamíferos
    ['mamifero', 'Conejo', 'Oryctolagus cuniculus', 'I', 'LC', '', '', 'Especie introducida e invasora: compite con la fauna nativa.', FAUNA],
    ['mamifero', 'Cururo', 'Spalacopus cyanus', 'E', 'LC', '', 'epica', 'Roedor negro que vive bajo tierra: busca sus montículos.', FAUNA],
    ['mamifero', 'Degú costino', 'Octodon lunatus', 'E', 'LC', '', 'epica', 'Roedor de matorral; se refugia entre rocas.', FAUNA],
    ['mamifero', 'Ratón oliváceo', 'Abrothrix olivacea', 'N', 'LC', '', 'rara', 'Ratón nativo de pelaje café oliva.', FAUNA],
    ['mamifero', 'Yaca', 'Thylamys elegans', 'E', 'LC', '', 'legendaria', 'Pequeño marsupial nocturno.', FAUNA],
    ['mamifero', 'Zorro chilla', 'Lycalopex griseus', 'N', 'LC', '', 'epica', 'Zorro gris y pequeño.', FAUNA],
    ['mamifero', 'Zorro culpeo', 'Lycalopex culpaeus', 'N', 'LC', '', 'legendaria', 'Zorro grande y rojizo.', FAUNA],

    // ── Reptiles
    ['reptil', 'Culebra de cola corta', 'Galvarinus chilensis', 'N', 'NT', '', 'epica', 'Culebra de cuerpo grueso y cola corta.', FAUNA],
    ['reptil', 'Culebra de cola larga', 'Philodryas chamissonis', 'E', 'LC', '', 'rara', 'Larga, con franjas a lo largo del cuerpo.', 'No la manipules: su mordida es levemente venenosa.'],
    ['reptil', 'Lagartija esbelta', 'Liolaemus tenuis', 'N', 'LC', '', '', 'El macho tiene colores azules y verdes; trepa troncos.', FAUNA],
    ['reptil', 'Lagartija lemniscata', 'Liolaemus lemniscatus', 'N', 'LC', '', '', 'Líneas claras a lo largo del lomo; toma sol en rocas.', FAUNA],

    // ── Arácnidos e insectos
    ['aracnido', 'Araña pollito', 'Grammostola rosea', 'N', 'LC', '', 'rara', 'Tarántula peluda; sale más en verano y al atardecer.', 'No la manipules: sus pelos son urticantes.'],
    ['aracnido', 'Opilión', 'Pachylus chilensis', 'N', 'NE', '', 'rara', 'Parece araña, pero su cuerpo es de una sola pieza.', FAUNA],
    ['insecto', 'Pololo común', 'Astylus trifasciatus', 'N', 'LC', '', '', 'Escarabajo con franjas anaranjadas; abunda en flores.', ''],
    ['insecto', 'Escarabajo carroñero', 'Polynoncus bullatus', 'N', 'LC', '', 'rara', 'Escarabajo rugoso de colores tierra.', ''],

    // ── Hongos
    ['hongo', 'Pie azul', 'Lepista nuda', '', 'NE', '', 'rara', 'Sombrero y pie de tono violeta.', HONGO],
    ['hongo', 'Estrella de tierra', 'Geastrum sp.', '', 'NE', '', 'epica', 'Su capa externa se abre como una estrella.', HONGO],
    ['hongo', 'Hongo de la risa', 'Gymnopilus junonius', '', 'NE', '', 'rara', 'Grande y anaranjado; crece sobre madera.', 'Es tóxico. ' + HONGO],
    ['hongo', 'Mantequilla de bruja', 'Phaeotremella sp.', '', 'NE', '', 'rara', 'Gelatinoso y rojizo, sobre ramas.', HONGO],
    ['hongo', 'Changle falso', 'Phaeoclavulina flaccida', '', 'NE', '', 'rara', 'Ramificado como un coral.', HONGO],
    ['hongo', 'Panal de abeja', 'Favolaschia sp.', '', 'NE', '', 'epica', 'Poros grandes como un panal, sobre ramas caídas.', HONGO],
    ['hongo', 'Peo de lobo', 'Bovista sp.', '', 'NE', '', '', 'Bolita blanca que suelta un polvo de esporas.', HONGO],
    ['hongo', 'Nido de pájaro', 'Cyathus sp.', '', 'NE', '', 'epica', 'Copita con «huevitos» dentro.', HONGO]
  ];

  function slug(s) {
    return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }
  // Rareza automática si la fila no la fija: introducida → común; endémica o NT → rara; VU → épica.
  function rarezaAuto(origen, cons) {
    if (origen === 'I') return 'comun';
    if (cons === 'VU') return 'epica';
    if (origen === 'E' || cons === 'NT') return 'rara';
    return 'comun';
  }

  var ESPECIES = F.map(function (r, i) {
    return {
      num: i + 1,
      id: slug(r[1] + '-' + r[2].split(' ')[0]),
      cat: r[0], nombre: r[1], cientifico: r[2], origen: r[3], cons: r[4],
      habitat: HABITATS[r[5]] || HABITATS[''],
      rareza: r[6] || rarezaAuto(r[3], r[4]),
      pista: r[7], cuidado: r[8]
    };
  });

  window.NATIVADEX = {
    CATEGORIAS: CATEGORIAS,
    ESPECIES: ESPECIES,
    RAREZAS: {
      comun:      { nombre: 'Común',      pts: 10,  color: '#9b9aab' },
      rara:       { nombre: 'Rara',       pts: 25,  color: '#1fdd6c' },
      epica:      { nombre: 'Épica',      pts: 50,  color: '#b66dff' },
      legendaria: { nombre: 'Legendaria', pts: 100, color: '#ffd60a' }
    },
    ORIGEN: { N: 'Nativa', E: 'Endémica de Chile', I: 'Introducida', '': 'Sin dato' },
    CONS: { LC: 'Preocupación menor', NT: 'Casi amenazada', VU: 'Vulnerable', NE: 'No evaluada', '': 'Sin dato en el folleto' }
  };
})();
