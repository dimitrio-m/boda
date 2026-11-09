# Hoja de confirmaciones (Google Sheets)

El botón **"Enviar confirmación"** de la web guarda cada respuesta en una hoja de Google.
La hoja tiene tres pestañas:

- **Invitados**: tu lista. Tú escribes el nombre y las personas previstas, y la web rellena el resto:
  respuesta (Sí/No), personas confirmadas, mensaje, fecha y alerta.
  - Fila **verde**: confirmó que sí.
  - Fila **gris**: confirmó que no.
  - Fila **roja**: confirmó **más personas de las previstas** (la columna *Alerta* dice cuántas).
  - Fila **amarilla**: alguien confirmó con un nombre que **no está en la lista**. Revisa si es un invitado escrito de otra forma.
- **Respuestas**: el historial de todos los envíos, en orden. Si alguien confirma dos veces, en *Invitados* queda la última respuesta y aquí se ven todas.
- **Resumen**: totales (invitaciones, personas previstas, respondieron, pendientes, confirmadas y alertas).

## Instalación (una sola vez, unos 10 minutos)

1. Crea una hoja nueva en [sheets.new](https://sheets.new) y ponle nombre, por ejemplo *Boda — Confirmaciones*.
2. Menú **Extensiones → Apps Script**.
3. Borra lo que aparece y pega todo el contenido de `Code.gs` (este mismo directorio). Pulsa **Guardar** (icono del disquete).
4. Arriba, en la lista de funciones, elige **setup** y pulsa **▶ Ejecutar**.
   - Google pedirá permisos: *Revisar permisos* → elige tu cuenta → *Configuración avanzada* → *Ir a … (no seguro)* → *Permitir*.
     Sale el aviso de "no seguro" porque el script es tuyo y no está verificado por Google; solo accede a esta hoja.
5. Vuelve a la hoja: ya están las pestañas *Invitados*, *Respuestas* y *Resumen*.
   En **Invitados** escribe cada invitación en una fila:
   - **Invitado**: el nombre tal como lo escribirán al confirmar (por ejemplo *María Pérez*).
     No importan mayúsculas ni tildes, pero sí que sea el mismo nombre.
   - **Personas previstas**: cuántas personas incluye esa invitación.
6. En Apps Script: **Implementar → Nueva implementación**.
   - Tipo (icono de engranaje): **Aplicación web**.
   - Ejecutar como: **Yo**.
   - Quién tiene acceso: **Cualquier usuario**.
   - Pulsa **Implementar** y copia la **URL de la aplicación web** (termina en `/exec`).
7. Abre `js/main.js` y pega la URL entre las comillas de `SHEET_URL`, al principio del archivo:
   ```js
   var SHEET_URL = "https://script.google.com/macros/s/AKfy.../exec";
   ```
8. Sube el cambio a GitHub y prueba una confirmación desde la web. Debe aparecer en la hoja en unos segundos.

## Si cambias el script

Cada cambio en `Code.gs` necesita una nueva versión: **Implementar → Gestionar implementaciones →
lápiz → Versión: Nueva versión → Implementar**. Si en cambio creas una *Nueva implementación*,
la URL cambia y hay que actualizar `SHEET_URL` en `js/main.js`.
