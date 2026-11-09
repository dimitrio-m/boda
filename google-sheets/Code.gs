/**
 * @OnlyCurrentDoc
 * Confirmaciones de la boda de Kaliana y Dimitrios.
 *
 * Recibe el formulario de la web (botón "Enviar confirmación") y:
 *   - anota cada envío en la pestaña "Respuestas",
 *   - actualiza la fila del invitado en la pestaña "Invitados",
 *   - marca en rojo a quien confirma más personas de las previstas,
 *   - marca a quien no aparece en la lista para que lo revisen.
 *
 * Instalación: ver google-sheets/README.md
 */

var GUESTS = "Invitados";
var LOG = "Respuestas";
var SUMMARY = "Resumen";

// Columnas de "Invitados" (1 = A)
var COL = { name: 1, planned: 2, answer: 3, confirmed: 4, message: 5, date: 6, alert: 7 };
var GUEST_HEADERS = ["Invitado", "Personas previstas", "Respuesta", "Personas confirmadas", "Mensaje", "Fecha de respuesta", "Alerta"];
var LOG_HEADERS = ["Fecha", "Nombre", "Asiste", "Personas", "Mensaje"];

/** Ejecuta esta función una vez (menú ▶ Ejecutar) para crear las pestañas y el formato. */
function setup() {
  var ss = SpreadsheetApp.getActive();

  var guests = ss.getSheetByName(GUESTS) || ss.insertSheet(GUESTS, 0);
  guests.getRange(1, 1, 1, GUEST_HEADERS.length).setValues([GUEST_HEADERS]).setFontWeight("bold").setBackground("#e8ece4");
  guests.setFrozenRows(1);
  guests.setColumnWidths(1, 1, 220);
  guests.setColumnWidths(2, 3, 130);
  guests.setColumnWidth(COL.message, 260);
  guests.setColumnWidth(COL.date, 150);
  guests.setColumnWidth(COL.alert, 220);
  guests.getRange("B2:B").setDataValidation(
    SpreadsheetApp.newDataValidation().requireNumberBetween(1, 50).setAllowInvalid(false).build());

  var rows = guests.getRange("A2:G1000");
  guests.setConditionalFormatRules([
    // Más personas de las previstas: fila en rojo
    SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=AND(ISNUMBER($B2), ISNUMBER($D2), $D2>$B2)')
      .setBackground("#f4c7c3").setFontColor("#8a1c12").setRanges([rows]).build(),
    // No está en la lista: fila en amarillo
    SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=$G2="No está en la lista"')
      .setBackground("#fce8b2").setRanges([rows]).build(),
    // Confirmó que sí: verde suave
    SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=$C2="Sí"')
      .setBackground("#e3efd9").setRanges([rows]).build(),
    // Confirmó que no: gris
    SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied('=$C2="No"')
      .setFontColor("#888888").setRanges([rows]).build()
  ]);

  var log = ss.getSheetByName(LOG) || ss.insertSheet(LOG);
  log.getRange(1, 1, 1, LOG_HEADERS.length).setValues([LOG_HEADERS]).setFontWeight("bold").setBackground("#e8ece4");
  log.setFrozenRows(1);
  log.setColumnWidth(1, 150);
  log.setColumnWidth(2, 220);
  log.setColumnWidth(5, 320);

  var summary = ss.getSheetByName(SUMMARY) || ss.insertSheet(SUMMARY);
  summary.getRange("A1:B7").setValues([
    ["Resumen", ""],
    ["Invitaciones", '=COUNTA(Invitados!A2:A)'],
    ["Personas previstas", '=SUM(Invitados!B2:B)'],
    ["Respondieron", '=COUNTA(Invitados!C2:C)'],
    ["Pendientes de responder", '=B2-B4'],
    ["Personas confirmadas", '=SUM(Invitados!D2:D)'],
    ["Alertas (más personas o fuera de lista)", '=COUNTA(Invitados!G2:G)']
  ]);
  summary.getRange("A1").setFontWeight("bold").setFontSize(14);
  summary.setColumnWidth(1, 280);

  SpreadsheetApp.getUi().alert("Listo. Escribe tus invitados en la pestaña \"Invitados\" (nombre y personas previstas).");
}

/** Recibe cada confirmación enviada desde la web. */
function doPost(e) {
  var p = (e && e.parameter) || {};

  // Campo trampa: los humanos lo dejan vacío, algunos robots lo rellenan.
  if (p.website) return json({ ok: true });

  var name = String(p.nombre || "").trim().slice(0, 120);
  if (!name) return json({ ok: false, error: "Falta el nombre" });

  var attends = p.asiste === "si";
  var people = attends ? Math.max(1, Math.min(50, parseInt(p.personas, 10) || 1)) : 0;
  var message = String(p.mensaje || "").trim().slice(0, 1000);
  var now = new Date();

  var lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    var ss = SpreadsheetApp.getActive();
    ss.getSheetByName(LOG).appendRow([now, safe(name), attends ? "Sí" : "No", people, safe(message)]);

    var guests = ss.getSheetByName(GUESTS);
    var row = findGuest(guests, name);
    var alert = "";
    var planned = "";

    if (row === -1) {
      row = guests.getLastRow() + 1;
      guests.getRange(row, COL.name).setValue(safe(name));
      alert = "No está en la lista";
    } else {
      planned = guests.getRange(row, COL.planned).getValue();
      if (typeof planned === "number" && people > planned) {
        alert = "Confirmó " + people + " de " + planned + " previstas";
      }
    }

    guests.getRange(row, COL.answer, 1, 5).setValues([[
      attends ? "Sí" : "No", people, safe(message), now, alert
    ]]);
  } finally {
    lock.releaseLock();
  }

  return json({ ok: true });
}

/** Para comprobar que la URL funciona al abrirla en el navegador. */
function doGet() {
  return json({ ok: true, info: "Confirmaciones activas" });
}

function findGuest(sheet, name) {
  var last = sheet.getLastRow();
  if (last < 2) return -1;
  var target = normalize(name);
  var names = sheet.getRange(2, COL.name, last - 1, 1).getValues();
  for (var i = 0; i < names.length; i++) {
    if (normalize(names[i][0]) === target) return i + 2;
  }
  return -1;
}

// Ignora mayúsculas, tildes y espacios de más: "José  Pérez" = "jose perez"
function normalize(s) {
  return String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
}

// Evita que un texto que empieza por = + - @ se interprete como fórmula
function safe(s) {
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
