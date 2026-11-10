/* Perfil público de El Mundo de Felipe (lo usan cuenta.html y perfil.html).
   - spotifyDe(link): convierte el enlace de «Compartir → Copiar enlace» de Spotify en { tipo, id }.
   - iframeSpotify(tipo, id): el reproductor incrustado (solo se arma con un id validado).
   - revisar(texto): avisa si el texto trae enlaces, correos, teléfonos o groserías.
   - tarjeta(perfil, coleccion): el HTML del perfil público. */
(function () {
  'use strict';
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };

  // Acepta: https://open.spotify.com/playlist/ID?si=…, /intl-es/playlist/ID, /embed/playlist/ID, spotify:playlist:ID (y álbumes).
  function spotifyDe(link) {
    var t = String(link || '').trim();
    var m = t.match(/^(?:https?:\/\/)?open\.spotify\.com\/(?:intl-[a-z]{2}(?:-[a-z]{2})?\/)?(?:embed\/)?(playlist|album)\/([A-Za-z0-9]{22})(?:[/?#].*)?$/i)
      || t.match(/^spotify:(playlist|album):([A-Za-z0-9]{22})$/i);
    return m ? { tipo: m[1].toLowerCase(), id: m[2] } : null;
  }
  function esEnlaceCorto(link) { return /(^|\/\/)(spotify\.link|spoti\.fi)\//i.test(String(link || '')); }
  function iframeSpotify(tipo, id, alto) {
    if (!/^(playlist|album)$/.test(tipo) || !/^[A-Za-z0-9]{22}$/.test(id)) return '';
    return '<iframe class="spotify" title="Playlist de Spotify" src="https://open.spotify.com/embed/' + tipo + '/' + id + '?utm_source=generator&theme=0"'
      + ' width="100%" height="' + (alto || 352) + '" frameborder="0" loading="lazy" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe>';
  }

  var MALAS = ['weon', 'won', 'wn', 'hueon', 'huevon', 'aweonao', 'ctm', 'csm', 'conchetumare', 'culiao', 'qlo', 'ql', 'puta', 'puto', 'mierda', 'pico', 'raja', 'maricon', 'maraco', 'zorra', 'perra', 'pendejo', 'imbecil', 'idiota', 'estupido', 'estupida', 'gil'];
  function normal(w) { return w.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/0/g, 'o').replace(/[4@]/g, 'a').replace(/[1!]/g, 'i').replace(/3/g, 'e').replace(/[^a-zñ]/g, '').replace(/(.)\1+/g, '$1'); }
  // Devuelve '' si está bien, o el motivo por el que no se puede publicar.
  function revisar(t) {
    t = String(t || '');
    if (/https?:|www\.|@/i.test(t)) return 'No pongas enlaces, correos ni usuarios de redes sociales.';
    if (/[0-9]{7,}/.test(t.replace(/[\s.\-]/g, ''))) return 'No pongas números de teléfono ni otros datos personales.';
    if (/\b(insta(gram)?|ig|tik ?tok|whats ?app|wsp|wasap|snap(chat)?|discord|facebook|fb|twitter|telegram)\b/i.test(t)) return 'No pongas tus redes sociales: el perfil es solo para gustos breves.';
    if (/\b(rut|run|contrase[ñn]a|clave|mi direcci[oó]n|vivo en|mi casa queda|calle|pasaje|depto|departamento n)\b/i.test(t)) return 'No pongas datos personales (dirección, RUT, claves).';
    if (t.split(/\s+/).some(function (w) { return MALAS.indexOf(normal(w)) >= 0; })) return 'Hay una palabra que no se puede publicar.';
    return '';
  }

  // perfil: documento de perfiles_publicos · col: documento de gatitos (puede ser null)
  function tarjeta(p, col) {
    var G = window.GATITOS || [], R = window.RAREZAS || {};
    var ids = (col && col.ids) || [], mios = G.filter(function (g) { return ids.indexOf(g.id) >= 0; });
    var fav = G.find(function (g) { return col && g.id === col.favorito && ids.indexOf(g.id) >= 0; }) || mios[mios.length - 1];
    var pelis = (p.peliculas || []).filter(Boolean);
    return '<article class="pp">'
      + '<header class="pp-cab"' + (fav ? ' style="--rc:' + ((R[fav.rareza] || {}).color || '#ffd60a') + '"' : '') + '>'
      + (fav ? '<img class="pp-fav" src="' + raiz() + 'gatitos/img/' + esc(fav.id) + '.webp" alt="' + esc(fav.nombre) + '">' : '<div class="pp-ini">' + esc((p.nombre || '?').charAt(0)) + '</div>')
      + '<div><h2>' + esc(p.nombre) + '</h2>' + (fav ? '<small>Gatito favorito: ' + esc(fav.nombre) + '</small>' : '') + '</div></header>'
      + (p.descripcion ? '<p class="pp-desc">' + esc(p.descripcion) + '</p>' : '')
      + '<h3>🐱 Gatitos <span>' + mios.length + ' de ' + G.length + '</span></h3>'
      + (mios.length ? '<div class="pp-gatos">' + mios.map(function (g) { var r = R[g.rareza] || {};
          return '<div class="pp-g" style="--rc:' + (r.color || '#888') + '" title="' + esc(g.nombre + ' · ' + (r.nombre || '')) + '"><img src="' + raiz() + 'gatitos/img/' + esc(g.id) + '.webp" alt="" loading="lazy"><span>' + esc(g.nombre) + '</span></div>'; }).join('') + '</div>'
        : '<p class="pp-vacio">Todavía no tiene gatitos.</p>')
      + (pelis.length ? '<h3>🎬 Películas favoritas</h3><ul class="pp-pelis">' + pelis.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' : '')
      + (p.spotifyId ? '<h3>🎧 Su playlist</h3>' + iframeSpotify(p.spotifyTipo, p.spotifyId) : '')
      + '</article>';
  }
  function raiz() { var s = document.querySelector('script[src*="perfil-publico.js"]'); return s ? s.getAttribute('src').replace(/firebase\/perfil-publico\.js.*$/, '') : ''; }

  // Estilos del perfil (se agregan una vez a la página).
  var st = document.createElement('style');
  st.textContent = '.pp{display:grid;gap:12px}'
    + '.pp-cab{display:flex;gap:16px;align-items:center;padding:14px 16px;border-radius:16px;border:1px solid rgba(255,255,255,.14);background:radial-gradient(320px 150px at 15% 50%,color-mix(in srgb,var(--rc,#1fdd6c) 26%,transparent),transparent 75%)}'
    + '.pp-cab h2{margin:0;font:900 clamp(28px,7vw,40px)/1 "Big Shoulders Display",Impact,sans-serif;text-transform:uppercase}'
    + '.pp-cab small{color:#9b9aab;font-size:13px}'
    + '.pp-fav{height:110px;filter:drop-shadow(0 10px 14px rgba(0,0,0,.5))}'
    + '.pp-ini{width:72px;height:72px;border-radius:50%;display:grid;place-items:center;background:#1fdd6c;color:#041014;font:900 34px "Big Shoulders Display",Impact,sans-serif}'
    + '.pp-desc{margin:0;font-size:16px;line-height:1.55;white-space:pre-wrap;overflow-wrap:anywhere}'
    + '.pp h3{margin:6px 0 0;font:800 20px "Big Shoulders Display",Impact,sans-serif;text-transform:uppercase;letter-spacing:.5px}'
    + '.pp h3 span{font:700 12px system-ui,sans-serif;color:#9b9aab;margin-left:6px}'
    + '.pp-gatos{display:grid;grid-template-columns:repeat(auto-fill,minmax(88px,1fr));gap:8px}'
    + '.pp-g{background:#181822;border:1px solid color-mix(in srgb,var(--rc) 45%,transparent);border-radius:12px;padding:6px;text-align:center}'
    + '.pp-g img{height:62px;max-width:100%;object-fit:contain}'
    + '.pp-g span{display:block;font-size:11px;color:#9b9aab;line-height:1.2;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'
    + '.pp-pelis{margin:0;padding-left:20px;display:grid;gap:2px}'
    + '.pp-vacio{color:#9b9aab;margin:0}'
    + '.pp iframe.spotify{border:0;border-radius:12px;display:block}'
    + '@media (max-width:560px){.pp-fav{height:84px}.pp-cab{padding:12px}}';
  document.head.appendChild(st);

  window.PerfilPublico = { spotifyDe: spotifyDe, esEnlaceCorto: esEnlaceCorto, iframeSpotify: iframeSpotify, revisar: revisar, tarjeta: tarjeta, esc: esc };
})();
