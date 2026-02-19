import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['URL', 'TEXT'], required: true },
    input: { type: String, required: true },
    url: { type: String },
    title: String,
    metaDescription: String,
    headings: { h1: [String], h2: [String], h3: [String] },
    wordCount: Number,
    thinContent: Boolean,
    readabilityScore: Number,
    sentiment: { score: Number, label: String },
    keywords: [String],
    keywordDensity: [{ keyword: String, density: Number }],
    primaryKeyword: String,
    images: { total: Number, withAlt: Number, altCoverage: Number },
    linkStats: { total: Number, internal: Number, external: Number },
    brokenLinks: [mongoose.Schema.Types.Mixed],
    brokenCount: Number,
    duplicateTitle: Boolean,
    duplicateMeta: Boolean,
    suggestions: [String],
    score: { type: Number, min: 0, max: 100 },
    breakdown: mongoose.Schema.Types.Mixed,
    rawData: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

reportSchema.index({ userId: 1, createdAt: -1 });
reportSchema.index({ userId: 1, score: 1 });
reportSchema.index({ userId: 1, type: 1 });

export default mongoose.model('Report', reportSchema);
