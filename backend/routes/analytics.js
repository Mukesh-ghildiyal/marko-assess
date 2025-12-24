// backend/src/routes/analytics.js
const express = require('express');
const router = express.Router();
const Signal = require('../models/Signal');

/**
 * GET /api/analytics/summary
 * Generate analytics summary from signals
 */
router.get('/summary', async (req, res, next) => {
    try {
        const { days = 30 } = req.query;

        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));

        // Total signals
        const total = await Signal.countDocuments({
            createdAt: { $gte: cutoffDate }
        });

        // Category distribution
        const categoryDistribution = await Signal.aggregate([
            { $match: { createdAt: { $gte: cutoffDate } } },
            {
                $group: {
                    _id: '$interpretation.category.value',
                    count: { $sum: 1 },
                    avgConfidence: { $avg: '$interpretation.category.confidence' }
                }
            },
            { $sort: { count: -1 } }
        ]);

        // Unknown signals
        const unknownCount = await Signal.countDocuments({
            'interpretation.category.value': 'unknown',
            createdAt: { $gte: cutoffDate }
        });

        // Low confidence signals
        const lowConfidenceCount = await Signal.countDocuments({
            'interpretation.category.confidence': { $lt: 0.5 },
            createdAt: { $gte: cutoffDate }
        });

        // Severity distribution
        const severityDistribution = await Signal.aggregate([
            { $match: { createdAt: { $gte: cutoffDate } } },
            {
                $group: {
                    _id: '$interpretation.severity.value',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

        // Tag cloud (top tags)
        const tagCloud = await Signal.aggregate([
            { $match: { createdAt: { $gte: cutoffDate } } },
            { $unwind: '$interpretation.tags' },
            {
                $group: {
                    _id: '$interpretation.tags',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 20 }
        ]);

        // Recent signals trend (by day)
        const trendData = await Signal.aggregate([
            { $match: { createdAt: { $gte: cutoffDate } } },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Most common entities
        const topEntities = await Signal.aggregate([
            { $match: { createdAt: { $gte: cutoffDate } } },
            { $unwind: '$interpretation.entities' },
            {
                $group: {
                    _id: {
                        type: '$interpretation.entities.type',
                        value: '$interpretation.entities.value'
                    },
                    count: { $sum: 1 },
                    avgConfidence: { $avg: '$interpretation.entities.confidence' }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 15 }
        ]);

        res.json({
            success: true,
            summary: {
                period: { days: parseInt(days), from: cutoffDate, to: new Date() },
                overview: {
                    totalSignals: total,
                    unknownSignals: unknownCount,
                    unknownPercentage: total > 0 ? Math.round((unknownCount / total) * 100) : 0,
                    lowConfidenceSignals: lowConfidenceCount,
                    lowConfidencePercentage: total > 0 ? Math.round((lowConfidenceCount / total) * 100) : 0
                },
                categories: categoryDistribution.map(c => ({
                    category: c._id,
                    count: c.count,
                    percentage: total > 0 ? Math.round((c.count / total) * 100) : 0,
                    avgConfidence: Math.round(c.avgConfidence * 100) / 100
                })),
                severity: severityDistribution.map(s => ({
                    level: s._id,
                    count: s.count,
                    percentage: total > 0 ? Math.round((s.count / total) * 100) : 0
                })),
                tags: tagCloud.map(t => ({
                    tag: t._id,
                    count: t.count
                })),
                trend: trendData.map(d => ({
                    date: d._id,
                    count: d.count
                })),
                entities: topEntities.map(e => ({
                    type: e._id.type,
                    value: e._id.value,
                    count: e.count,
                    avgConfidence: Math.round(e.avgConfidence * 100) / 100
                }))
            }
        });

    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/analytics/vocabulary
 * Get emergent vocabulary (categories, tags, entity types)
 */
router.get('/vocabulary', async (req, res, next) => {
    try {
        // Get all unique categories
        const categories = await Signal.distinct('interpretation.category.value');

        // Get all unique tags
        const tags = await Signal.distinct('interpretation.tags');

        // Get all unique entity types
        const entityTypes = await Signal.distinct('interpretation.entities.type');

        // Get all unique severity levels
        const severityLevels = await Signal.distinct('interpretation.severity.value');

        res.json({
            success: true,
            vocabulary: {
                categories: categories.sort(),
                tags: tags.sort(),
                entityTypes: entityTypes.sort(),
                severityLevels: severityLevels.sort()
            },
            meta: {
                note: 'This vocabulary emerged from the data, not from predefined schemas'
            }
        });

    } catch (error) {
        next(error);
    }
});

module.exports = router;