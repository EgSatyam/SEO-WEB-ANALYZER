import * as cheerio from 'cheerio';
import { fetchHtml } from './fetchHtml.js';
import { extractText, countWords } from './text.js';
import { calculateReadabilityScore } from './readability.js';
import { analyzeSentiment } from './sentiment.js';
import { getTopKeywords, getKeywordDensity, getPrimaryKeyword } from './stopwords.js';
import { analyzeImages } from './images.js';
import { extractLinks, checkBrokenLinks } from './links.js';
import { calculateScore } from './score.js';
import { sanitizeUrl } from '../sanitize.js';
import Report from '../../models/Report.js';

function suggestionTexts(list) {
  return (list || []).map((s) => (typeof s === 'string' ? s : s?.text || '')).filter(Boolean);
}

const TITLE_MIN = 30;
const TITLE_MAX = 60;
const META_MIN = 70;
const META_MAX = 160;
const THIN_CONTENT_WORDS = 300;

function buildSuggestions(data) {
  const s = [];
  if (!data.title) s.push({ key: 'title', text: 'Add a page title' });
  else {
    const len = data.title.length;
    if (len < TITLE_MIN) s.push({ key: 'titleLength', text: `Extend title to 30-60 characters (current: ${len})` });
    else if (len > TITLE_MAX) s.push({ key: 'titleLength', text: `Shorten title to 30-60 characters (current: ${len})` });
  }
  if (!data.metaDescription) s.push({ key: 'meta', text: 'Add a meta description' });
  else {
    const len = data.metaDescription.length;
    if (len < META_MIN) s.push({ key: 'metaLength', text: `Improve meta description length (70-160 chars, current: ${len})` });
    else if (len > META_MAX) s.push({ key: 'metaLength', text: `Shorten meta description to 70-160 characters (current: ${len})` });
  }
  const h1Count = data.headings?.h1?.length ?? 0;
  if (h1Count === 0) s.push({ key: 'h1', text: 'Add exactly one H1 heading' });
  else if (h1Count > 1) s.push({ key: 'h1', text: `Use exactly one H1 (found ${h1Count})` });
  if (data.thinContent) s.push({ key: 'wordCount', text: 'Add more content (aim for 300+ words)' });
  if (data.images?.suggestion) s.push({ key: 'imagesAlt', text: data.images.suggestion });
  if (data.brokenCount > 0) s.push({ key: 'links', text: `Fix ${data.brokenCount} broken link(s)` });
  if (data.primaryKeyword && !data.primaryKeywordInTitle) s.push({ key: 'keywordInTitle', text: 'Include primary keyword in title' });
  if (data.primaryKeyword && !data.primaryKeywordInMeta) s.push({ key: 'keywordInMeta', text: 'Include primary keyword in meta description' });
  return s;
}

async function duplicateChecks(userId, title, metaDescription) {
  if (!userId) return { duplicateTitle: false, duplicateMeta: false };
  const reports = await Report.find({ userId }).select('title metaDescription').lean();
  const duplicateTitle = !!title && reports.some((r) => r.title && r.title.toLowerCase() === title.toLowerCase());
  const duplicateMeta = !!metaDescription && reports.some((r) => r.metaDescription && r.metaDescription.toLowerCase() === metaDescription.toLowerCase());
  return { duplicateTitle, duplicateMeta };
}

function analyzeFromCheerio($, pageUrl, userId) {
  const title = $('title').text().trim() || null;
  const metaDesc = $('meta[name="description"]').attr('content')?.trim() || null;
  const headings = {
    h1: $('h1').map((_, el) => $(el).text().trim()).get().filter(Boolean),
    h2: $('h2').map((_, el) => $(el).text().trim()).get().filter(Boolean),
    h3: $('h3').map((_, el) => $(el).text().trim()).get().filter(Boolean),
  };
  const bodyText = extractText($);
  const wordCount = countWords(bodyText);
  const thinContent = wordCount < THIN_CONTENT_WORDS;
  const readabilityScore = calculateReadabilityScore(bodyText);
  const sentiment = analyzeSentiment(bodyText);
  const keywords = getTopKeywords(bodyText, 20);
  const keywordDensity = getKeywordDensity(bodyText, 3);
  const primaryKeyword = getPrimaryKeyword(bodyText);
  const primaryKeywordInTitle = primaryKeyword && title && title.toLowerCase().includes(primaryKeyword.toLowerCase());
  const primaryKeywordInMeta = primaryKeyword && metaDesc && metaDesc.toLowerCase().includes(primaryKeyword.toLowerCase());

  const titleLen = title?.length ?? 0;
  const titleLengthOk = titleLen >= TITLE_MIN && titleLen <= TITLE_MAX;
  const titleLengthPartial = titleLen > 0 && titleLen < TITLE_MAX * 1.2;
  const metaLen = metaDesc?.length ?? 0;
  const metaLengthOk = metaLen >= META_MIN && metaLen <= META_MAX;
  const metaLengthPartial = metaLen > 0 && metaLen < META_MAX * 1.2;

  const images = analyzeImages($);
  const links = pageUrl ? extractLinks($, pageUrl) : [];
  let brokenCount = 0;
  let linkStats = { total: links.length, internal: 0, external: 0 };
  if (links.length > 0) {
    linkStats.internal = links.filter((l) => l.internal).length;
    linkStats.external = links.filter((l) => !l.internal).length;
  }

  return {
    title,
    metaDescription: metaDesc,
    headings,
    wordCount,
    thinContent,
    readabilityScore,
    sentiment,
    keywords,
    keywordDensity,
    primaryKeyword,
    primaryKeywordInTitle: !!primaryKeywordInTitle,
    primaryKeywordInMeta: !!primaryKeywordInMeta,
    titleLengthOk,
    titleLengthPartial,
    metaLengthOk,
    metaLengthPartial,
    h1Count: headings.h1.length,
    h2Count: headings.h2.length,
    images,
    linkStats,
    links,
    brokenCount,
  };
}

export async function analyzeUrl(inputUrl, userId = null) {
  const url = sanitizeUrl(inputUrl);
  if (!url) throw new Error('Invalid URL');
  const fullUrl = url.startsWith('http') ? url : `https://${url}`;
  const html = await fetchHtml(fullUrl);
  const $ = cheerio.load(html);
  const data = await analyzeFromCheerio($, fullUrl, userId);

  const linkResult = data.links.length > 0 ? await checkBrokenLinks(data.links) : { totalChecked: 0, broken: [], brokenCount: 0 };
  data.brokenCount = linkResult.brokenCount;
  data.brokenLinks = linkResult.broken;

  const dup = await duplicateChecks(userId, data.title, data.metaDescription);
  data.duplicateTitle = dup.duplicateTitle;
  data.duplicateMeta = dup.duplicateMeta;
  data.suggestions = buildSuggestions(data);

  const scored = calculateScore(data);
  return {
    type: 'URL',
    input: fullUrl,
    url: fullUrl,
    title: data.title,
    metaDescription: data.metaDescription,
    headings: data.headings,
    wordCount: data.wordCount,
    thinContent: data.thinContent,
    readabilityScore: data.readabilityScore,
    sentiment: data.sentiment,
    keywords: data.keywords,
    keywordDensity: data.keywordDensity,
    primaryKeyword: data.primaryKeyword,
    images: data.images,
    linkStats: data.linkStats,
    brokenLinks: data.brokenLinks,
    brokenCount: data.brokenCount,
    duplicateTitle: data.duplicateTitle,
    duplicateMeta: data.duplicateMeta,
    suggestions: suggestionTexts(scored.suggestions.length ? scored.suggestions : data.suggestions),
    score: scored.score,
    breakdown: scored.breakdown,
  };
}

export async function analyzePastedContent(htmlOrText, userId = null) {
  const content = typeof htmlOrText === 'string' ? htmlOrText.trim() : '';
  const HTML_SIZE_LIMIT = 500 * 1024;
  if (content.length > HTML_SIZE_LIMIT) throw new Error('Content too large');
  if (!content.length) throw new Error('Content is empty');

  const looksLikeHtml = /<[a-z][\s\S]*>/i.test(content);
  const $ = cheerio.load(looksLikeHtml ? content : `<body>${content.replace(/</g, '&lt;')}</body>`);
  const data = await analyzeFromCheerio($, null, userId);

  data.brokenLinks = [];
  const dup = await duplicateChecks(userId, data.title, data.metaDescription);
  data.duplicateTitle = dup.duplicateTitle;
  data.duplicateMeta = dup.duplicateMeta;
  data.suggestions = buildSuggestions(data);

  const scored = calculateScore(data);
  return {
    type: 'TEXT',
    input: 'Pasted content',
    url: null,
    title: data.title,
    metaDescription: data.metaDescription,
    headings: data.headings,
    wordCount: data.wordCount,
    thinContent: data.thinContent,
    readabilityScore: data.readabilityScore,
    sentiment: data.sentiment,
    keywords: data.keywords,
    keywordDensity: data.keywordDensity,
    primaryKeyword: data.primaryKeyword,
    images: data.images,
    linkStats: data.linkStats,
    brokenLinks: [],
    brokenCount: 0,
    duplicateTitle: data.duplicateTitle,
    duplicateMeta: data.duplicateMeta,
    suggestions: suggestionTexts(scored.suggestions.length ? scored.suggestions : data.suggestions),
    score: scored.score,
    breakdown: scored.breakdown,
  };
}
