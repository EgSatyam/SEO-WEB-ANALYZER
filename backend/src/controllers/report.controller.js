import Report from '../models/Report.js';
import asyncHandler from '../utils/asyncHandler.js';
import { analyzeUrl, analyzePastedContent } from '../utils/seo/analyzer.js';
import { generateReportPdf } from '../utils/pdf/reportPdf.js';
import { validateAnalyzeBody } from '../utils/validateAnalyze.js';

export const createReport = asyncHandler(async (req, res) => {
  let body;
  try {
    body = validateAnalyzeBody(req.body);
  } catch (err) {
    err.statusCode = 400;
    throw err;
  }
  const userId = req.user.id;

  let data;
  try {
    if (body.mode === 'url') {
      const url = body.url.startsWith('http') ? body.url : `https://${body.url}`;
      data = await analyzeUrl(url, userId);
    } else {
      data = await analyzePastedContent(body.content, userId);
    }
  } catch (err) {
    const code = (err && err.code) || '';
    const msg = (err && err.message) ? String(err.message) : 'Analysis failed';
    const friendly =
      code === 'ENOTFOUND' ? 'Could not resolve URL. Check the address and try again.'
      : code === 'ECONNREFUSED' || code === 'ECONNRESET' ? 'Could not reach the URL. The site may be down or blocking requests.'
      : msg.includes('timeout') || (err && err.name === 'AbortError') ? 'Request timed out. The site may be slow or unavailable.'
      : msg.startsWith('HTTP ') ? msg
      : msg;
    const out = err instanceof Error ? err : new Error(msg);
    out.statusCode = 400;
    out.message = friendly;
    throw out;
  }

  const report = await Report.create({
    userId,
    type: data.type,
    input: data.input,
    url: data.url,
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
    suggestions: data.suggestions,
    score: data.score,
    breakdown: data.breakdown,
    rawData: { score: data.score, wordCount: data.wordCount },
  });

  res.status(201).json(report);
});

export const getReports = asyncHandler(async (req, res) => {
  const { type, minScore, dateFrom, dateTo, sort } = req.query;
  const filter = { userId: req.user.id };

  // Validate and apply type filter
  if (type && ['URL', 'TEXT'].includes(type)) {
    filter.type = type;
  }

  // Validate and apply minScore filter
  if (minScore != null && minScore !== '') {
    const score = Number(minScore);
    if (!isNaN(score) && score >= 0 && score <= 100) {
      filter.score = { $gte: score };
    }
  }

  // Validate and apply date filters
  if (dateFrom) {
    const fromDate = new Date(dateFrom);
    if (!isNaN(fromDate.getTime())) {
      filter.createdAt = { ...filter.createdAt, $gte: fromDate };
    }
  }

  if (dateTo) {
    const toDate = new Date(dateTo);
    if (!isNaN(toDate.getTime())) {
      // Set to end of day
      toDate.setHours(23, 59, 59, 999);
      filter.createdAt = { ...filter.createdAt, $lte: toDate };
    }
  }

  // Apply sorting
  let sortOption = { createdAt: -1 };
  if (sort === 'oldest') sortOption = { createdAt: 1 };
  else if (sort === 'scoreAsc') sortOption = { score: 1, createdAt: -1 };
  else if (sort === 'scoreDesc') sortOption = { score: -1, createdAt: -1 };

  const reports = await Report.find(filter).sort(sortOption).lean();
  res.json(reports);
});

export const getReportById = asyncHandler(async (req, res) => {
  const report = await Report.findOne({ _id: req.params.id, userId: req.user.id });
  if (!report) {
    const err = new Error('Report not found');
    err.statusCode = 404;
    throw err;
  }
  res.json(report);
});

export const deleteReport = asyncHandler(async (req, res) => {
  const report = await Report.findOne({ _id: req.params.id, userId: req.user.id });
  if (!report) {
    const err = new Error('Report not found');
    err.statusCode = 404;
    throw err;
  }
  await report.deleteOne();
  res.json({ message: 'Report deleted' });
});

export const downloadPdf = asyncHandler(async (req, res) => {
  const report = await Report.findOne({ _id: req.params.id, userId: req.user.id });
  if (!report) {
    const err = new Error('Report not found');
    err.statusCode = 404;
    throw err;
  }
  const pdfBuffer = await generateReportPdf(report);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=seo-report-${report._id}.pdf`);
  res.send(pdfBuffer);
});
