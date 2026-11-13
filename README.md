# Boda de Kaliana y Dimitrios

Invitación web para la boda del **sábado 9 de enero de 2027**, Hotel Belensate, Urb. La Hacienda, Mérida, 5 p.m.

Es una página estática (HTML, CSS y JavaScript) sin dependencias ni paso de compilación.

## Estructura

```
index.html        Página principal
css/styles.css    Estilos, colores y fuentes
js/main.js        Sobre, cuenta regresiva, calendario, dibujos, idioma y confirmaciones
js/i18n.js        Textos en griego
img/              Imágenes optimizadas en WebP + tarjetas Open Graph (og-image*.jpg)
fonts/            Fuentes WOFF2 (y respaldo TTF; ver fonts/README.md)
audio/            Efecto al abrir y música de fondo (ver audio/README.md)
worker.js         Cloudflare Worker (Open Graph dinámico en ES / ΕΛ)
wrangler.jsonc    Configuración de Cloudflare Workers + Static Assets
_headers          Cabeceras de caché y seguridad para Cloudflare
google-sheets/    Script de la hoja de confirmaciones (ver google-sheets/README.md)
```

## Ver en local

Abre `index.html` en el navegador, o sirve la carpeta:

```sh
python3 -m http.server 8000
# luego abre http://localhost:8000
```

## Publicar en Cloudflare (Workers + Static Assets)

1. Sube tus cambios a GitHub (`git push`).
2. En el panel de Cloudflare ve a **Workers & Pages → Create** y conecta tu repositorio `dimitrio-m/boda` (rama `main`):
   - **Project name**: `boda` *(si usaste otro nombre en Cloudflare, pon ese mismo nombre en `"name"` dentro de `wrangler.jsonc`)*.
   - **Build command**: *(vacío)*
   - **Deploy command**: `npx wrangler deploy`
3. Para conectar el subdominio: entra al Worker desplegado → **Settings → Domains & Routes → Add → Custom domain** → escribe `wedding.dimitriosmandamadiotis.com` y confirma.

> También puedes desplegar directamente desde la terminal con:
> ```sh
> npx wrangler deploy
> ```

## Publicar en GitHub Pages

1. Sube el contenido del repositorio a GitHub en la rama `main`.
2. En GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch**, rama `main`, carpeta `/ (root)`.

## Sonido

Al tocar el sello suena un efecto, y al abrirse el sobre empieza la música de fondo (con un fundido suave y en bucle).
Abajo a la derecha aparece un botón de altavoz para silenciarla. Añade los archivos en `audio/` (ver [audio/README.md](audio/README.md)).

## Idiomas

La invitación está en **español** y **griego**, con el selector **ES / ΕΛ** arriba a la derecha.

- Enlace en español: `https://wedding.dimitriosmandamadiotis.com/`
- Enlace en griego para los invitados griegos: `https://wedding.dimitriosmandamadiotis.com/?lang=el` (en Cloudflare Pages genera automáticamente también la vista previa de WhatsApp/redes en griego).
- Sin `?lang=`, la página usa el último idioma elegido en ese móvil o, la primera vez, el idioma del teléfono.
- Los textos en griego están en `js/i18n.js`. El español es el texto de `index.html`.
- Sloop Script y Brown Sugar no tienen letras griegas: en griego se usan Noto Serif Display y Literata (Google Fonts).

## Confirmaciones

El formulario tiene dos botones:

- **Confirmar**: guarda la respuesta en una hoja de Google con la lista de invitados.
  La hoja marca en rojo a quien confirma más personas de las previstas.
  Hay que configurarla una vez: ver [google-sheets/README.md](google-sheets/README.md).
- **Por WhatsApp**: abre WhatsApp con un mensaje ya escrito para el **0412 076 79 40**
  y además guarda la respuesta en la hoja.

Para cambiar el número de WhatsApp, edita `WHATSAPP` al principio de `js/main.js` (formato internacional, sin `+`).
