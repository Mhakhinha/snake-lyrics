/* ===== Snake Lyrics — lógica del juego ===== */
const $ = (id) => document.getElementById(id);
const el = {
  titulo: $("titulo"), progreso: $("progreso"),
  inicio: $("inicio"), caja: $("caja-letra"), final: $("final"),
  antes: $("antes"), hueco: $("hueco"), despues: $("despues"),
  opciones: $("opciones"), mensaje: $("mensaje"),
  aciertos: $("aciertos"), fallos: $("fallos"),
  carril: $("carril"), resultado: $("resultado"),
  btnEmpezar: $("btnEmpezar"), btnRepetir: $("btnRepetir"),
  nombre: $("nombre"), ranking: $("ranking"), btnBorrar: $("btnBorrar"),
};

/* ---------- Música: reproductor de YouTube (API oficial IFrame) ---------- */
let yt = null, ytListo = false, ytAcabado = false;
let audioOk = true;   // false → se usa un reloj interno sin música

function idYoutube(u) {
  const m = (u || "").match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/);
  return m ? m[1] : /^[\w-]{11}$/.test(u || "") ? u : null;
}

function cargarYT() {
  if (usaArchivo) return;
  const id = idYoutube(CANCION.youtube);
  if (!id) { audioOk = false; return; }
  const tag = document.createElement("script");
  tag.src = "https://www.youtube.com/iframe_api";
  tag.onerror = () => { audioOk = false; };
  document.head.appendChild(tag);
  window.onYouTubeIframeAPIReady = () => {
    yt = new YT.Player("reproductor", {
      videoId: id, width: "100%", height: "100%",
      playerVars: { playsinline: 1, rel: 0, controls: 0, modestbranding: 1, disablekb: 1 },
      events: {
        onReady: () => { ytListo = true; },
        onError: () => { audioOk = false; },
        onStateChange: (e) => { ytAcabado = e.data === YT.PlayerState.ENDED; },
      },
    });
  };
}

// Si en letra.js se indica "audio" (archivo mp3/mp4), se usa ese archivo en vez de YouTube
const usaArchivo = !!CANCION.audio;
const audioArchivo = usaArchivo ? new Audio(CANCION.audio) : null;
if (audioArchivo) audioArchivo.addEventListener("error", () => { audioOk = false; });

// Interfaz mínima que usa el resto del juego
const audio = usaArchivo ? audioArchivo : {
  get currentTime() { return ytListo ? yt.getCurrentTime() : 0; },
  set currentTime(v) { if (ytListo) yt.seekTo(v, true); },
  get ended() { return ytAcabado; },
  pause() { if (ytListo) yt.pauseVideo(); },
  play() { ytAcabado = false; if (ytListo) yt.playVideo(); return Promise.resolve(); },
};

// Clasificación de todos los jugadores (se guarda en este navegador)
let jugador = "";
const CLAVE_RANKING = "snakeLyrics_ranking_" + CANCION.titulo;
function leerRanking() {
  try { return JSON.parse(localStorage.getItem(CLAVE_RANKING)) || []; } catch (e) { return []; }
}
function guardarRanking(lista) {
  try { localStorage.setItem(CLAVE_RANKING, JSON.stringify(lista)); } catch (e) {}
}
function pintarRanking(actual) {
  const lista = leerRanking();
  lista.sort((a, b) => b.aciertos - a.aciertos || a.fecha - b.fecha);
  el.ranking.innerHTML = "";
  lista.slice(0, 10).forEach((r) => {
    const li = document.createElement("li");
    if (actual && r.fecha === actual.fecha) li.className = "yo";
    const n = document.createElement("span"); n.className = "n"; n.textContent = r.nombre;
    const p = document.createElement("span"); p.className = "p"; p.textContent = `${r.aciertos} / ${r.total}`;
    li.append(n, p);
    el.ranking.appendChild(li);
  });
}

// Estado
let idx = 0, aciertos = 0, fallos = 0;
let jugando = false, esperando = false, relojFalso = 0, ultimoTs = 0;

const preguntas = CANCION.preguntas.slice().sort((a, b) => a.time - b.time);

/* ---------- Serpiente ---------- */
const SEG_PX = 16;
let numSeg = 6;
let cabezaX = 40, destinoX = 40;
const segs = [];
let cabeza;

function crearSerpiente() {
  el.carril.innerHTML = "";
  segs.length = 0;
  for (let i = 0; i < 18; i++) {
    const s = document.createElement("div");
    s.className = "segmento";
    const r = Math.max(7, 12 - i * 0.3);
    s.style.width = s.style.height = r * 2 + "px";
    s.style.borderRadius = "50%";
    s.style.background = i % 2 ? "#3f9d4a" : "#58bd5f";
    s.style.border = "2px solid #1f5a28";
    s.dataset.r = r;
    el.carril.appendChild(s);
    segs.push(s);
  }
  cabeza = document.createElement("div");
  cabeza.className = "cabeza";
  cabeza.innerHTML = `
    <svg width="44" height="36" viewBox="0 0 44 36">
      <path class="lengua" d="M38 18 H46 M46 18 l4 -3 M46 18 l4 3" stroke="#e23a4e" stroke-width="2" fill="none" stroke-linecap="round"/>
      <ellipse cx="20" cy="18" rx="19" ry="15" fill="#58bd5f" stroke="#1f5a28" stroke-width="2"/>
      <circle cx="26" cy="11" r="5" fill="#fff"/><circle cx="26" cy="25" r="5" fill="#fff"/>
      <circle cx="28" cy="11" r="2.4" fill="#111"/><circle cx="28" cy="25" r="2.4" fill="#111"/>
      <circle cx="35" cy="14" r="1.3" fill="#1f5a28"/><circle cx="35" cy="22" r="1.3" fill="#1f5a28"/>
    </svg>`;
  el.carril.appendChild(cabeza);
  cabezaX = 40; destinoX = 40; numSeg = 6;
}

function animarSerpiente(t) {
  cabezaX += (destinoX - cabezaX) * 0.08;
  const moviendo = Math.abs(destinoX - cabezaX) > 2;
  const amp = moviendo ? 9 : 5;
  const vel = moviendo ? 7 : 3;
  const h = el.carril.clientHeight;
  const cy = h / 2;
  const yCabeza = cy + Math.sin(t / 1000 * vel) * amp;
  cabeza.style.transform = `translate(${cabezaX}px, ${yCabeza - 18}px)`;
  segs.forEach((s, i) => {
    const r = +s.dataset.r;
    if (i >= numSeg) { s.style.display = "none"; return; }
    s.style.display = "block";
    const x = cabezaX - (i + 1) * SEG_PX + 14;
    const y = cy + Math.sin(t / 1000 * vel - (i + 1) * 0.7) * amp;
    s.style.transform = `translate(${x - r}px, ${y - r}px)`;
  });
}

function soltarComida(tipo) {
  const it = document.createElement("div");
  it.className = "item-comida";
  it.innerHTML = `<svg viewBox="0 0 40 40" width="38" height="38"><use href="#${tipo}"/></svg>`;
  const x = Math.min(el.carril.clientWidth - 50, cabezaX + 130);
  it.style.left = x + "px";
  el.carril.appendChild(it);
  destinoX = x - 30;
  setTimeout(() => { it.classList.add("comida"); }, 650);
  setTimeout(() => it.remove(), 1050);
}

function avanzarPosicion() {
  const meta = el.carril.clientWidth - 210;
  destinoX = Math.max(40, Math.min(meta, 40 + (idx / preguntas.length) * meta));
}

/* ---------- Reloj de la canción ---------- */
function bucle(ts) {
  const dt = (ts - ultimoTs) / 1000;
  ultimoTs = ts;
  animarSerpiente(ts);

  if (jugando && !esperando) {
    if (!audioOk) relojFalso += dt;
    const t = audioOk ? audio.currentTime : relojFalso;
    const cancionAcabada = audioOk && audio.ended;
    if (idx < preguntas.length && (t >= preguntas[idx].time || cancionAcabada)) {
      mostrarPregunta(preguntas[idx]);
    }
  }
  requestAnimationFrame(bucle);
}

/* ---------- Preguntas ---------- */
function mezclar(a) {
  a = a.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function mostrarPregunta(p) {
  esperando = true;
  if (audioOk) audio.pause();   // pausa hasta que se responda
  el.antes.textContent = p.antes;
  el.despues.textContent = p.despues;
  el.hueco.textContent = "_____";
  el.hueco.className = "";
  el.mensaje.textContent = ""; el.mensaje.className = "";
  el.progreso.textContent = `Pregunta ${idx + 1} / ${preguntas.length}`;
  el.opciones.innerHTML = "";
  el.caja.classList.remove("oculto");

  mezclar(p.opciones).forEach((txt) => {
    const b = document.createElement("button");
    b.className = "opcion";
    b.textContent = txt;
    b.addEventListener("click", () => responder(b, p));
    el.opciones.appendChild(b);
  });
}

function responder(boton, p) {
  // Bloquea los 4 botones: solo una respuesta por pregunta
  const botones = [...el.opciones.children];
  botones.forEach((b) => (b.disabled = true));

  const acierto = boton.textContent === p.correcta;
  el.hueco.textContent = p.correcta;

  if (acierto) {
    aciertos++;
    boton.classList.add("correcta");
    el.hueco.classList.add("ok");
    el.mensaje.textContent = "¡Correcto! +1 punto 🎵";
    el.mensaje.className = "ok";
    el.aciertos.textContent = aciertos;
    soltarComida("nota");
  } else {
    fallos++;
    boton.classList.add("incorrecta");
    botones.find((b) => b.textContent === p.correcta)?.classList.add("correcta");
    el.hueco.classList.add("mal");
    el.mensaje.textContent = "Incorrecto… la serpiente se come una manzana podrida 🍎";
    el.mensaje.className = "mal";
    el.fallos.textContent = fallos;
    soltarComida("manzana");
  }
  numSeg = Math.min(segs.length, numSeg + 1);
  idx++;

  setTimeout(() => {
    avanzarPosicion();
    if (idx >= preguntas.length) { terminar(); return; }
    el.caja.classList.add("oculto");
    esperando = false;
    if (audioOk) audio.play().catch(() => { audioOk = false; });
  }, 1600);
}

/* ---------- Flujo ---------- */
function empezar() {
  jugador = el.nombre.value.trim();
  if (!jugador) {
    el.nombre.classList.remove("error"); void el.nombre.offsetWidth;
    el.nombre.classList.add("error"); el.nombre.focus();
    return;
  }
  idx = aciertos = fallos = 0;
  relojFalso = 0; esperando = false;
  el.aciertos.textContent = el.fallos.textContent = 0;
  el.titulo.textContent = "♪ " + CANCION.titulo;
  el.progreso.textContent = "";
  el.inicio.classList.add("oculto");
  el.final.classList.add("oculto");
  el.caja.classList.add("oculto");
  crearSerpiente();
  audio.currentTime = 0;
  audio.play().catch(() => { audioOk = false; });   // sin audio, usa reloj interno
  jugando = true;
}

function terminar() {
  jugando = false;
  if (audioOk) audio.pause();
  el.caja.classList.add("oculto");
  const total = preguntas.length;
  const pct = Math.round((aciertos / total) * 100);
  const nota = pct === 100 ? "¡Perfecto, te sabes la letra de memoria!" : pct >= 60 ? "¡Muy bien!" : "Sigue practicando, ¡inténtalo otra vez!";
  el.resultado.textContent = "";
  const linea = document.createElement("span");
  linea.textContent = `${jugador}: `;
  const num = document.createElement("b");
  num.textContent = `${aciertos} / ${total}`;
  linea.append(num, ` (${pct}%)`);
  el.resultado.append(linea, document.createElement("br"), nota);

  const registro = { nombre: jugador, aciertos, total, fecha: Date.now() };
  const lista = leerRanking(); lista.push(registro); guardarRanking(lista);
  pintarRanking(registro);
  el.final.classList.remove("oculto");
}

el.btnEmpezar.addEventListener("click", empezar);
el.btnRepetir.addEventListener("click", () => {   // siguiente jugador: vuelve al inicio
  el.final.classList.add("oculto");
  el.nombre.value = "";
  el.inicio.classList.remove("oculto");
  el.nombre.focus();
});
el.btnBorrar.addEventListener("click", () => {
  if (confirm("¿Borrar la clasificación de todos los jugadores?")) { guardarRanking([]); pintarRanking(null); }
});
el.nombre.addEventListener("keydown", (e) => { if (e.key === "Enter" && !el.btnEmpezar.disabled) empezar(); });

crearSerpiente();
requestAnimationFrame((t) => { ultimoTs = t; bucle(t); });

// El botón de empezar espera a que cargue YouTube (máx. 6 s)
el.btnEmpezar.disabled = true;
el.btnEmpezar.textContent = "Cargando música…";
cargarYT();
const espera = setInterval(() => {
  if (ytListo || usaArchivo || !audioOk) {
    clearInterval(espera);
    if (!audioOk || usaArchivo) document.getElementById("reproductor-caja").classList.add("oculto");
    el.btnEmpezar.disabled = false;
    el.btnEmpezar.textContent = "▶ Empezar";
  }
}, 200);
setTimeout(() => { if (!ytListo && !usaArchivo) audioOk = false; }, 6000);
