/**
 * Cloudflare Worker (con Static Assets):
 * Solo intercepta "/" e "/index.html" (el resto de archivos estáticos los sirve
 * directamente el CDN de Cloudflare sin ejecutar el Worker).
 *
 * 1. Ajusta automáticamente og:url, canonical y og:image al dominio actual
 *    (tanto en *.workers.dev como en wedding.dimitriosmandamadiotis.com).
 * 2. Si el enlace lleva ?lang=el, traduce las etiquetas Open Graph / Twitter / <title>
 *    y sirve img/og-image-el.jpg para que WhatsApp, Viber, Messenger o iMessage
 *    muestren la tarjeta de vista previa en griego.
 */
export default {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request);
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) {
      return response;
    }

    const url = new URL(request.url);
    const origin = url.origin;
    const isGreek = url.searchParams.get("lang") === "el";

    const canonicalUrl = isGreek ? `${origin}/?lang=el` : `${origin}/`;
    const ogImage = isGreek
      ? `${origin}/img/og-image-el.jpg`
      : `${origin}/img/og-image.jpg`;

    const metaByProp = isGreek
      ? {
          "og:url": canonicalUrl,
          "og:site_name": "Kaliana & Dimitrios",
          "og:locale": "el_GR",
          "og:locale:alternate": "es_VE",
          "og:title": "Kaliana & Dimitrios · Ο γάμος μας",
          "og:description":
            "Με την ευλογία των γονιών μας, έχουμε τη χαρά να σας προσκαλέσουμε στον γάμο μας. Σάββατο 9 Ιανουαρίου 2027 · Hotel Belensate, Μέριδα.",
          "og:image": ogImage,
          "og:image:secure_url": ogImage,
          "og:image:alt":
            "Πρόσκληση γάμου της Kaliana και του Dimitrios · 09.01.2027 · Μέριδα",
        }
      : {
          "og:url": canonicalUrl,
          "og:image": ogImage,
          "og:image:secure_url": ogImage,
        };

    const metaByName = isGreek
      ? {
          description:
            "Με την ευλογία των γονιών μας, έχουμε τη χαρά να σας προσκαλέσουμε στον γάμο μας. Σάββατο 9 Ιανουαρίου 2027, Hotel Belensate, Μέριδα.",
          "twitter:title": "Kaliana & Dimitrios · Ο γάμος μας",
          "twitter:description":
            "Σάββατο 9 Ιανουαρίου 2027 · Hotel Belensate, Μέριδα",
          "twitter:image": ogImage,
        }
      : {
          "twitter:image": ogImage,
        };

    let rewriter = new HTMLRewriter()
      .on('link[rel="canonical"]', {
        element(el) {
          el.setAttribute("href", canonicalUrl);
        },
      })
      .on("meta[property]", {
        element(el) {
          const prop = el.getAttribute("property");
          if (prop && Object.prototype.hasOwnProperty.call(metaByProp, prop)) {
            el.setAttribute("content", metaByProp[prop]);
          }
        },
      })
      .on("meta[name]", {
        element(el) {
          const name = el.getAttribute("name");
          if (name && Object.prototype.hasOwnProperty.call(metaByName, name)) {
            el.setAttribute("content", metaByName[name]);
          }
        },
      });

    if (isGreek) {
      rewriter = rewriter
        .on("html", {
          element(el) {
            el.setAttribute("lang", "el");
          },
        })
        .on("title", {
          element(el) {
            el.setInnerContent("Kaliana & Dimitrios · 09.01.2027");
          },
        })
        .on("link#greek-fonts", {
          element(el) {
            el.setAttribute("media", "all");
            el.removeAttribute("onload");
          },
        });
    }

    const transformed = rewriter.transform(response);
    const headers = new Headers(transformed.headers);
    headers.set("X-Content-Type-Options", "nosniff");
    headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    if (isGreek) {
      headers.set("Vary", "Accept-Encoding");
    }

    return new Response(transformed.body, {
      status: transformed.status,
      statusText: transformed.statusText,
      headers,
    });
  },
};
