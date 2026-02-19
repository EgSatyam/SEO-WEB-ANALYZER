import fetch from 'node-fetch';
import logger from '../logger.js';

const FETCH_TIMEOUT_MS = Number(process.env.FETCH_TIMEOUT_MS) || 10000;
const HTML_SIZE_LIMIT = Number(process.env.HTML_SIZE_LIMIT) || 1024 * 1024;

export async function fetchHtml(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'SEO-Web-Analyzer/1.0' },
      redirect: 'follow',
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
    const text = await res.text();
    if (text.length > HTML_SIZE_LIMIT) {
      logger.warn(`HTML size ${text.length} exceeds limit, truncating`);
      return text.slice(0, HTML_SIZE_LIMIT);
    }
    logger.debug(`Fetched ${text.length} chars from ${url}`);
    return text;
  } catch (err) {
    clearTimeout(timeout);
    if (err.name === 'AbortError') throw new Error('Request timeout');
    throw err;
  }
}
