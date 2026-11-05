// CSP por <meta> (GitHub Pages no permite cabeceras). No se usa `security.csp` de Astro porque no
// soporta el ClientRouter: este no recarga el documento, así que la política de la primera página
// rige todas las siguientes. Por eso se calcula una sola política con los hashes de todo el sitio.
// .mjs y no .ts: lo importa astro.config.mjs.
import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_RE = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
const EXECUTABLE_TYPE = /^(text\/javascript|application\/javascript|module)$/i;
const CHARSET_META = '<meta charset="utf-8">';

/**
 * Hashes de los scripts inline ejecutables de un HTML. Los de datos (JSON-LD) no los bloquea la CSP.
 * @param {string} html
 * @returns {string[]}
 */
export function inlineScriptHashes(html) {
  const hashes = [];
  for (const [, attrs, body] of html.matchAll(SCRIPT_RE)) {
    if (/\ssrc\s*=/i.test(attrs)) continue;
    const type = attrs.match(/\stype\s*=\s*["']?([^"'\s>]+)/i)?.[1];
    if (type && !EXECUTABLE_TYPE.test(type)) continue;
    hashes.push(`'sha256-${createHash('sha256').update(body, 'utf8').digest('base64')}'`);
  }
  return hashes;
}

/**
 * `style-src` lleva 'unsafe-inline': el sitio usa `style="--d:1"` y tanto el ClientRouter como el
 * embed de Cal.com insertan estilos. `frame-ancestors` no se puede poner aquí: se ignora en <meta>.
 * @param {string[]} hashes
 * @returns {string}
 */
export function buildPolicy(hashes) {
  const scripts = [...new Set(hashes)].sort();
  return [
    "default-src 'self'",
    `script-src ${["'self'", ...scripts, 'https://app.cal.com'].join(' ')}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https://cal.com https://app.cal.com",
    "font-src 'self'",
    "connect-src 'self' https://api.web3forms.com https://cal.com https://app.cal.com",
    'frame-src https://cal.com https://app.cal.com',
    "manifest-src 'self'",
    "worker-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self' https://api.web3forms.com",
  ].join('; ');
}

/**
 * Inserta la política justo tras el charset: una CSP por <meta> solo cubre lo que viene después.
 * @param {string} html
 * @param {string} policy
 * @returns {string}
 */
export function injectPolicy(html, policy) {
  if (!html.includes(CHARSET_META)) throw new Error(`CSP: no se encontró ${CHARSET_META} en el HTML`);
  return html.replace(CHARSET_META, () => `${CHARSET_META}<meta http-equiv="content-security-policy" content="${policy}">`);
}

/** @returns {import('astro').AstroIntegration} */
export function cspIntegration() {
  return {
    name: 'alaria-csp',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const root = fileURLToPath(dir);
        const entries = await readdir(root, { recursive: true });
        const files = entries.filter((f) => f.endsWith('.html')).map((f) => join(root, f));
        const pages = await Promise.all(files.map(async (file) => ({ file, html: await readFile(file, 'utf8') })));
        const policy = buildPolicy(pages.flatMap(({ html }) => inlineScriptHashes(html)));
        await Promise.all(pages.map(({ file, html }) => writeFile(file, injectPolicy(html, policy))));
        logger.info(`política aplicada a ${pages.length} páginas`);
      },
    },
  };
}
