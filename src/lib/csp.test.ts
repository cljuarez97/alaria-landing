import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { analyticsOrigin, buildPolicy, injectPolicy, inlineScriptHashes } from './csp.mjs';

const hashOf = (body: string) => `'sha256-${createHash('sha256').update(body, 'utf8').digest('base64')}'`;

describe('inlineScriptHashes', () => {
  it('calcula el hash de los scripts inline ejecutables, clásicos y de módulo', () => {
    const html = `<script>a()</script><script type="module">b()</script>`;
    expect(inlineScriptHashes(html)).toEqual([hashOf('a()'), hashOf('b()')]);
  });
  it('ignora los scripts externos y los bloques de datos', () => {
    const html = `<script type="module" src="/x.js"></script><script type="application/ld+json">{}</script>`;
    expect(inlineScriptHashes(html)).toEqual([]);
  });
  it('respeta los caracteres no ASCII al calcular el hash', () => {
    expect(inlineScriptHashes('<script>t("Clínica")</script>')).toEqual([hashOf('t("Clínica")')]);
  });
});

describe('buildPolicy', () => {
  const directive = (policy: string, name: string) => policy.split('; ').find((d) => d.startsWith(`${name} `));

  it('no permite scripts inline sin hash ni eval', () => {
    const script = directive(buildPolicy(["'sha256-a'"]), 'script-src')!;
    expect(script).toContain("'sha256-a'");
    expect(script).not.toContain('unsafe-inline');
    expect(script).not.toContain('unsafe-eval');
  });
  it('elimina hashes repetidos y da el mismo resultado sin importar el orden', () => {
    expect(buildPolicy(["'b'", "'a'", "'b'"])).toBe(buildPolicy(["'a'", "'b'"]));
  });
  it('bloquea plugins y el cambio de <base>', () => {
    const policy = buildPolicy([]);
    expect(directive(policy, 'object-src')).toBe("object-src 'none'");
    expect(directive(policy, 'base-uri')).toBe("base-uri 'self'");
  });
});

describe('injectPolicy', () => {
  it('va antes que el primer script para que lo cubra', () => {
    const html = injectPolicy('<head><meta charset="utf-8"><script>a()</script></head>', "default-src 'self'");
    expect(html.indexOf('content-security-policy')).toBeLessThan(html.indexOf('<script>'));
  });
  it('no interpreta patrones de reemplazo dentro de la política', () => {
    expect(injectPolicy('<meta charset="utf-8">', "'sha256-a$&b'")).toContain("'sha256-a$&b'");
  });
  it('falla el build en vez de publicar una página sin política', () => {
    expect(() => injectPolicy('<head></head>', 'x')).toThrow('CSP');
  });
});

describe('analítica en la CSP', () => {
  it('sin analítica no abre orígenes de más', () => {
    expect(buildPolicy([])).not.toContain('umami');
    expect(analyticsOrigin('<script src="/x.js"></script>')).toBeNull();
  });
  it('con analítica permite su origen para el script y las peticiones', () => {
    const origin = analyticsOrigin('<script defer src="https://cloud.umami.is/script.js" data-website-id="abc"></script>');
    expect(origin).toBe('https://cloud.umami.is');
    const policy = buildPolicy([], origin);
    expect(policy).toMatch(/script-src [^;]*https:\/\/cloud\.umami\.is/);
    expect(policy).toMatch(/connect-src [^;]*https:\/\/cloud\.umami\.is/);
  });
});

describe('API de reservas en la CSP', () => {
  it('permite llamar al origen de la API configurada y a nada más', () => {
    const policy = buildPolicy([], null, ['https://app.bichitech.test']);
    expect(policy).toMatch(/connect-src [^;]*https:\/\/app\.bichitech\.test/);
    expect(buildPolicy([])).not.toContain('bichitech');
  });
});
