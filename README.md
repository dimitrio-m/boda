# Boda de Kaliana y Dimitrios

Invitación web para la boda del **sábado 9 de enero de 2027**, Hotel Belensate, Urb. La Hacienda, Mérida, 5 p.m.

Es una página estática (HTML, CSS y JavaScript) sin dependencias ni paso de compilación.

## Estructura

```
index.html        Página
css/styles.css    Estilos, colores y fuentes
js/main.js        Sobre, cuenta regresiva, calendario, dibujos, idioma y confirmaciones
js/i18n.js        Textos en griego
img/              Arco, ramas de olivo, acuarela del hotel y textura del sobre
fonts/            Archivos de fuentes (ver fonts/README.md)
audio/            Efecto al abrir y música de fondo (ver audio/README.md)
google-sheets/    Script de la hoja de confirmaciones (ver google-sheets/README.md)
```

## Ver en local

Abre `index.html` en el navegador, o sirve la carpeta:

```sh
python3 -m http.server 8000
# luego abre http://localhost:8000
```

## Publicar en GitHub Pages

1. Crea un repositorio nuevo en GitHub (por ejemplo `boda`).
2. Sube el contenido de esta carpeta:
   ```sh
   git init
   git add .
   git commit -m "Invitación de boda"
   git branch -M main
   git remote add origin https://github.com/elenimandamadioti/boda.git
   git push -u origin main
   ```
3. En GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch**, rama `main`, carpeta `/ (root)`.
4. La invitación quedará en `https://elenimandamadioti.github.io/boda/`.

## Sonido

Al tocar el sello suena un efecto, y al abrirse el sobre empieza la música de fondo (con un fundido suave y en bucle).
Abajo a la derecha aparece un botón de altavoz para silenciarla. Añade los archivos en `audio/` (ver [audio/README.md](audio/README.md)).

## Idiomas

La invitación está en **español** y **griego**, con el selector **ES / ΕΛ** arriba a la derecha.

- Enlace en griego para los invitados griegos: `https://elenimandamadioti.github.io/boda/?lang=el`
- Sin `?lang=`, la página usa el último idioma elegido en ese móvil o, la primera vez, el idioma del teléfono.
- Los textos en griego están en `js/i18n.js`. El español es el texto de `index.html`.
- Sloop Script y Brown Sugar no tienen letras griegas: en griego se usan Noto Serif Display y Literata (Google Fonts).

## Confirmaciones

El formulario tiene dos botones:

- **Confirmar**: guarda la respuesta en una hoja de Google con la lista de invitados.
  La hoja marca en rojo a quien confirma más personas de las previstas.
  Hay que configurarla una vez: ver [google-sheets/README.md](google-sheets/README.md).
- **Por WhatsApp**: abre WhatsApp con un mensaje ya escrito para el **0416 070 22 82**
  y además guarda la respuesta en la hoja.

Para cambiar el número de WhatsApp, edita `WHATSAPP` al principio de `js/main.js` (formato internacional, sin `+`).
