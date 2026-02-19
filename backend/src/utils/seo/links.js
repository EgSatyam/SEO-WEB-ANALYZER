import fetch from 'node-fetch';

const MAX_LINK_CHECKS = 25;
const HEAD_TIMEOUT_MS = 5000;

function resolveUrl(base, href) {
  if (!href || href.startsWith('#') || href.startsWith('javascript:')) return null;
  try {
    return new URL(href, base).href;
  } catch {
    return null;
  }
}

function getBaseUrl(url) {
  try {
    const u = new URL(url);
    return `${u.protocol}//${u.host}`;
  } catch {
    return '';
  }
}

export function extractLinks(cheerioDoc, pageUrl) {
  const base = getBaseUrl(pageUrl);
  const baseOrigin = base ? new URL(base).origin : '';
  const links = [];
  cheerioDoc('a[href]').each((_, el) => {
    const href = cheerioDoc(el).attr('href')?.trim();
    const resolved = resolveUrl(base, href);
    if (!resolved) return;
    try {
      const origin = new URL(resolved).origin;
      links.push({
        href: resolved,
        internal: origin === baseOrigin,
      });
    } catch {
      // skip invalid
    }
  });
  return links;
}

export async function checkBrokenLinks(links, maxChecks = MAX_LINK_CHECKS) {
  const toCheck = links.slice(0, maxChecks);
  const results = await Promise.all(
    toCheck.map(async (link) => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), HEAD_TIMEOUT_MS);
      try {
        const res = await fetch(link.href, {
          method: 'HEAD',
          redirect: 'follow',
          signal: controller.signal,
          headers: { 'User-Agent': 'SEO-Web-Analyzer/1.0' },
        });
        clearTimeout(timeout);
        return { href: link.href, ok: res.ok, status: res.status };
      } catch {
        clearTimeout(timeout);
        return { href: link.href, ok: false, status: 0 };
      }
    })
  );
  const broken = results.filter((r) => !r.ok);
  return { totalChecked: results.length, broken, brokenCount: broken.length };
}
