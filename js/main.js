(function () {
  var WHATSAPP = "584160702282"; // 0416 070 22 82 en formato internacional
  // URL de la aplicación web de Google Apps Script (ver google-sheets/README.md). Termina en /exec
  var SHEET_URL = "";
  var WEDDING = Date.UTC(2027, 0, 9, 21, 0, 0); // 9 ene 2027, 5 p.m. hora de Venezuela (UTC-4)

  // Sobre: tapa la invitación y bloquea el scroll hasta que se abre.
  // Sello (0–0,4 s) -> solapa (0,3–1,2 s) -> bolsillo baja e invitación sube (1–2,3 s)
  var root = document.documentElement;
  var envelope = document.getElementById("envelope");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  window.scrollTo(0, 0);
  document.getElementById("open").addEventListener("click", function () {
    envelope.classList.add("open");
    root.classList.remove("sealed");
    setTimeout(function () {
      envelope.hidden = true;
      root.classList.remove("locked");
    }, reduce ? 0 : 2400);
  });

  // Sonido: efecto al tocar el sello y música de fondo al terminar de abrirse el sobre.
  // Los navegadores solo dejan sonar audio tras un toque, por eso todo arranca en el toque del sello:
  // la música empieza en silencio y sube poco a poco cuando el sobre ya se ha abierto.
  // En iPhone el volumen de <audio> no se puede cambiar, así que el fundido va por Web Audio.
  var sfx = document.getElementById("sfx-open");
  var music = document.getElementById("music");
  var soundBtn = document.getElementById("sound");
  var MUSIC_VOLUME = 0.55;
  var musicAvailable = true;
  var musicWanted = true;
  var musicStarted = false;
  var audioCtx = null;
  var musicGain = null;
  music.addEventListener("error", function () { musicAvailable = false; soundBtn.hidden = true; });

  function connectMusic() {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC || audioCtx) return;
    try {
      audioCtx = new AC();
      musicGain = audioCtx.createGain();
      musicGain.gain.value = 0;
      audioCtx.createMediaElementSource(music).connect(musicGain);
      musicGain.connect(audioCtx.destination);
    } catch (e) { audioCtx = null; musicGain = null; }
  }

  function fadeMusic(to, seconds) {
    if (musicGain) {
      var now = audioCtx.currentTime;
      musicGain.gain.cancelScheduledValues(now);
      musicGain.gain.setValueAtTime(musicGain.gain.value, now);
      musicGain.gain.linearRampToValueAtTime(to, now + seconds);
      return;
    }
    // sin Web Audio: fundido con el volumen del elemento (ordenadores)
    var from = music.volume, steps = Math.max(1, Math.round(seconds * 20)), i = 0;
    var timer = setInterval(function () {
      i++;
      music.volume = Math.min(1, Math.max(0, from + (to - from) * i / steps));
      if (i >= steps) clearInterval(timer);
    }, 50);
  }

  function updateSoundBtn() {
    soundBtn.setAttribute("aria-pressed", String(musicWanted));
    soundBtn.setAttribute("aria-label", T(musicWanted ? "soundOff" : "soundOn"));
  }

  document.getElementById("open").addEventListener("click", function () {
    try { sfx.currentTime = 0; } catch (e) {}
    var p = sfx.play();
    if (p && p.catch) p.catch(function () {});
    if (!musicAvailable) return;
    connectMusic();
    if (audioCtx && audioCtx.resume) audioCtx.resume();
    if (!musicGain) music.volume = 0;
    var m = music.play();
    if (m && m.catch) m.catch(function () { musicAvailable = false; });
    setTimeout(function () {
      if (!musicAvailable) return;
      try { music.currentTime = 0; } catch (e) {}
      musicStarted = true;
      fadeMusic(MUSIC_VOLUME, 3);
      updateSoundBtn();
      soundBtn.hidden = false;
    }, reduce ? 300 : 2400);
  });

  soundBtn.addEventListener("click", function () {
    musicWanted = !musicWanted;
    updateSoundBtn();
    if (musicWanted) {
      if (audioCtx && audioCtx.resume) audioCtx.resume();
      var m = music.play();
      if (m && m.catch) m.catch(function () {});
      fadeMusic(MUSIC_VOLUME, 0.8);
    } else {
      fadeMusic(0, 0.5);
      setTimeout(function () { if (!musicWanted) music.pause(); }, 550);
    }
  });

  // Repetición: la pista empieza fuerte y acaba en silencio, así que al terminar
  // vuelve a empezar con el mismo fundido suave en vez de un salto brusco
  music.addEventListener("ended", function () {
    if (!musicStarted || !musicWanted) return;
    if (musicGain) musicGain.gain.setValueAtTime(0, audioCtx.currentTime); else music.volume = 0;
    try { music.currentTime = 0; } catch (e) {}
    var m = music.play();
    if (m && m.catch) m.catch(function () {});
    fadeMusic(MUSIC_VOLUME, 2.5);
  });

  // Pausa la música si cambian de app o de pestaña, y la retoma al volver
  document.addEventListener("visibilitychange", function () {
    if (!musicStarted || !musicWanted) return;
    if (document.hidden) {
      music.pause();
    } else {
      var m = music.play();
      if (m && m.catch) m.catch(function () {});
    }
  });

  // Cuenta regresiva
  var parts = ["d", "h", "m", "s"].map(function (k) { return document.getElementById("cd-" + k); });
  function pad(n) { return n < 10 ? "0" + n : String(n); }
  function tick() {
    var s = Math.floor(Math.max(0, WEDDING - Date.now()) / 1000);
    var vals = [Math.floor(s / 86400), Math.floor((s % 86400) / 3600), Math.floor((s % 3600) / 60), s % 60];
    parts.forEach(function (el, i) { el.textContent = i === 0 ? vals[0] : pad(vals[i]); });
  }
  tick();
  setInterval(tick, 1000);

  // Calendario de enero 2027, semana empieza en lunes
  var cal = document.getElementById("cal");
  for (var w = 0; w < 7; w++) {
    var dow = document.createElement("div");
    dow.className = "dow";
    cal.appendChild(dow);
  }
  var offset = (new Date(2027, 0, 1).getDay() + 6) % 7;
  for (var i = 0; i < offset; i++) cal.appendChild(document.createElement("div"));
  for (var d = 1; d <= 31; d++) {
    var day = document.createElement("div");
    day.className = "day" + (d === 9 ? " mark" : "");
    day.textContent = d;
    if (d === 9) {
      day.insertAdjacentHTML("beforeend", '<svg class="doodle" aria-hidden="true"><use href="#d-circle"/></svg>');
    }
    cal.appendChild(day);
  }

  // Idioma: español (texto original de index.html) o griego (js/i18n.js).
  // Se elige con ?lang=el en el enlace, con el selector (se recuerda) o por el idioma del móvil.
  var lang = "es";
  function T(key) { return window.I18N.DYNAMIC[lang][key]; }

  // En mayúsculas el griego no lleva tilde (ΙΑΝΟΥΑΡΙΟΣ, no ΙΑΝΟΥΆΡΙΟΣ); la diéresis se queda
  function stripTonos(text) { return text.normalize("NFD").replace(/\u0301/g, "").normalize("NFC"); }
  function fixGreekCaps(el) {
    if (lang !== "el") return;
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    var node;
    while ((node = walker.nextNode())) {
      if (getComputedStyle(node.parentNode).textTransform === "uppercase") node.nodeValue = stripTonos(node.nodeValue);
    }
  }

  function applyLang(code) {
    lang = code === "el" ? "el" : "es";
    root.lang = lang;
    var dict = window.I18N.STATIC[lang] || {};
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      if (el.dataset.es === undefined) el.dataset.es = el.textContent;
      var key = el.getAttribute("data-i18n");
      el.textContent = lang === "es" || !(key in dict) ? el.dataset.es : dict[key];
      fixGreekCaps(el);
    });
    document.querySelectorAll("[data-i18n-html]").forEach(function (el) {
      if (el.dataset.esHtml === undefined) el.dataset.esHtml = el.innerHTML;
      var key = el.getAttribute("data-i18n-html");
      el.innerHTML = lang === "es" || !(key in dict) ? el.dataset.esHtml : dict[key];
      fixGreekCaps(el);
    });
    document.querySelectorAll("[data-i18n-attr]").forEach(function (el) {
      el.getAttribute("data-i18n-attr").split(";").forEach(function (pair) {
        var attr = pair.split(":")[0], key = pair.split(":")[1];
        var store = "es" + attr.replace(/(^|-)(\w)/g, function (m, d, c) { return c.toUpperCase(); });
        if (el.dataset[store] === undefined) el.dataset[store] = el.getAttribute(attr);
        el.setAttribute(attr, lang === "es" || !(key in dict) ? el.dataset[store] : dict[key]);
      });
    });
    // Frases manuscritas entre las fotos: el texto se repite dos veces para que la deriva no tenga salto
    var unit = new Array(6).join(T("love") + " · ");
    document.querySelectorAll(".love-row").forEach(function (row) { row.textContent = unit + unit; });
    cal.querySelectorAll(".dow").forEach(function (el, i) {
      el.textContent = T("weekdays")[i];
      fixGreekCaps(el);
    });
    var calLink = document.getElementById("cal-link");
    var calUrl = new URL(calLink.href);
    calUrl.searchParams.set("text", T("calTitle"));
    calUrl.searchParams.set("details", T("calDetails"));
    calLink.href = calUrl.toString();
    document.querySelectorAll(".lang button").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-lang") === lang));
    });
    updateSoundBtn();
    try { localStorage.setItem("lang", lang); } catch (e) {}
  }

  var startLang = new URLSearchParams(location.search).get("lang");
  if (!startLang) { try { startLang = localStorage.getItem("lang"); } catch (e) {} }
  if (!startLang) {
    startLang = (navigator.languages || [navigator.language || ""]).some(function (l) { return /^el\b/i.test(l); }) ? "el" : "es";
  }
  applyLang(startLang);
  document.querySelectorAll(".lang button").forEach(function (b) {
    b.addEventListener("click", function () { applyLang(b.getAttribute("data-lang")); });
  });

  // Dibujos a mano: se trazan cuando aparecen en pantalla
  var doodles = document.querySelectorAll(".doodle");
  if ("IntersectionObserver" in window) {
    document.documentElement.classList.add("doodles");
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("drawn");
        io.unobserve(entry.target);
      });
    }, { threshold: 0.6 });
    doodles.forEach(function (el) { io.observe(el); });
  }

  // Animaciones al hacer scroll: cada bloque de las secciones sube y aparece al entrar en pantalla.
  // Los que entran a la vez salen uno tras otro.
  if ("IntersectionObserver" in window && !reduce) {
    var blocks = document.querySelectorAll(".band .wrap > *");
    blocks.forEach(function (el) { el.classList.add("rv"); });
    document.querySelectorAll(".stagger").forEach(function (group) {
      Array.prototype.forEach.call(group.children, function (child, i) { child.style.setProperty("--i", i); });
    });
    root.classList.add("reveal");
    var revealer = new IntersectionObserver(function (entries) {
      var shown = 0;
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.style.setProperty("--rv-delay", (shown++ * 120) + "ms");
        entry.target.classList.add("in");
        revealer.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
    blocks.forEach(function (el) { revealer.observe(el); });
  }

  // Confirmación por WhatsApp
  var countSel = document.getElementById("r-count");
  for (var n = 1; n <= 6; n++) {
    var opt = document.createElement("option");
    opt.value = n;
    opt.textContent = n;
    countSel.appendChild(opt);
  }

  var yes = document.getElementById("r-si");
  var no = document.getElementById("r-no");
  function syncAttend() { document.getElementById("r-count-field").hidden = no.checked; }
  yes.addEventListener("change", syncAttend);
  no.addEventListener("change", syncAttend);

  var form = document.getElementById("rsvp");
  var statusEl = document.getElementById("r-status");
  var sendBtn = document.getElementById("btn-send");
  // Sin hoja de Google conectada, "Confirmar" no puede guardar nada: solo se muestra WhatsApp
  if (!SHEET_URL) {
    sendBtn.hidden = true;
    document.getElementById("btn-whatsapp").classList.remove("ghost");
  }
  var mode = "sheet";
  // El botón pulsado decide qué hace el envío (e.submitter no existe en navegadores antiguos)
  form.querySelectorAll("button[data-mode]").forEach(function (btn) {
    btn.addEventListener("click", function () { mode = btn.getAttribute("data-mode"); });
  });

  function setStatus(text, isError) {
    statusEl.textContent = text;
    statusEl.classList.toggle("is-error", !!isError);
  }

  // Envía la respuesta a la hoja de Google (google-sheets/Code.gs)
  function saveToSheet(data) {
    if (!SHEET_URL) return Promise.reject(new Error("SHEET_URL vacío"));
    return fetch(SHEET_URL, { method: "POST", body: new URLSearchParams(data) })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (!res.ok) throw new Error(res.error || "Respuesta no válida");
        return res;
      });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = document.getElementById("r-name").value.trim();
    var err = document.getElementById("r-error");
    if (!name) {
      err.hidden = false;
      document.getElementById("r-name").focus();
      return;
    }
    err.hidden = true;

    var msg = document.getElementById("r-msg").value.trim();
    var data = {
      nombre: name,
      asiste: yes.checked ? "si" : "no",
      personas: yes.checked ? countSel.value : "0",
      mensaje: msg,
      website: document.getElementById("r-website").value
    };

    if (mode === "sheet") {
      sendBtn.disabled = true;
      setStatus(T("sending"));
      saveToSheet(data).then(function () {
        setStatus("");
        var first = name.split(" ")[0];
        document.getElementById("thanks-title").textContent = T("thanksTitle")(first);
        document.getElementById("thanks-text").textContent = yes.checked ? T("thanksYes") : T("thanksNo");
        form.hidden = true;
        var thanks = document.getElementById("thanks");
        thanks.hidden = false;
        thanks.focus();
        thanks.querySelectorAll(".doodle").forEach(function (el) { el.classList.add("drawn"); });
      }).catch(function () {
        setStatus(T("sendError"), true);
      }).then(function () {
        sendBtn.disabled = false;
      });
      return;
    }

    // WhatsApp: también se guarda en la hoja, sin esperar ni avisar si falla
    saveToSheet(data).catch(function () {});
    setStatus("");
    var lines = [T("waHello"), ""];
    if (yes.checked) {
      lines.push(T("waYes")(name));
      lines.push(T("waCount")(countSel.value));
    } else {
      lines.push(T("waNo")(name));
    }
    if (msg) lines.push("", msg);
    var text = lines.join("\n");

    var url = "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(text);
    document.getElementById("reply-text").textContent = text;
    document.getElementById("wa-link").href = url;
    document.getElementById("copy-status").textContent = "";
    document.getElementById("reply").hidden = false;
    window.open(url, "_blank", "noopener");
  });

  document.getElementById("btn-change").addEventListener("click", function () {
    document.getElementById("thanks").hidden = true;
    form.hidden = false;
    document.getElementById("r-name").focus();
  });

  document.getElementById("copy").addEventListener("click", function () {
    var pre = document.getElementById("reply-text");
    var status = document.getElementById("copy-status");
    function fallback() {
      var range = document.createRange();
      range.selectNodeContents(pre);
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      status.textContent = T("selected");
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(pre.textContent).then(function () { status.textContent = T("copied"); }, fallback);
    } else {
      fallback();
    }
  });
})();
