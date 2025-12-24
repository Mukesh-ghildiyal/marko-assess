// backend/src/routes/signals.js
const express = require('express');
const router = express.Router();
const Signal = require('../models/Signal');
const classifier = require('../services/classifier');

/**
 * POST /api/signals
 * Accept raw text and create signal with interpretation
 */
router.post('/', async (req, res, next) => {
    try {
        const { rawText, source = 'manual_entry' } = req.body;

        // Validate raw text exists (but don't validate content)
        if (!rawText || typeof rawText !== 'string') {
            return res.status(400).json({
                error: 'rawText is required and must be a string',
                received: typeof rawText
            });
        }

        // Classify the input (never throws, always returns interpretation)
        const interpretation = classifier.classify(rawText);

        // Create signal
        const signal = new Signal({
            rawText: rawText.trim(),
            interpretation,
            metadata: {
                source,
                processedAt: new Date(),
                flags: interpretation.category.confidence < 0.3 ? ['low_confidence'] : []
            }
        });

        await signal.save();

        res.status(201).json({
            success: true,
            signal: {
                id: signal._id,
                rawText: signal.rawText,
                interpretation: signal.interpretation,
                metadata: signal.metadata,
                createdAt: signal.createdAt
            }
        });

    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/signals
 * Retrieve signals with optional filtering
 */
router.get('/', async (req, res, next) => {
    try {
        const {
            category,
            tag,
            search,
            minConfidence,
            limit = 50,
            skip = 0,
            sort = '-createdAt'
        } = req.query;

        // Build flexible query
        const query = {};

        if (category && category !== 'all') {
            query['interpretation.category.value'] = category;
        }

        if (tag) {
            query['interpretation.tags'] = tag;
        }

        if (search) {
            query.$text = { $search: search };
        }

        if (minConfidence) {
            query['interpretation.category.confidence'] = {
                $gte: parseFloat(minConfidence)
            };
        }

        // Execute query with pagination
        const signals = await Signal.find(query)
            .sort(sort)
            .limit(Math.min(parseInt(limit), 100))
            .skip(parseInt(skip))
            .lean();

        const total = await Signal.countDocuments(query);

        res.json({
            success: true,
            data: signals,
            pagination: {
                total,
                limit: parseInt(limit),
                skip: parseInt(skip),
                hasMore: total > parseInt(skip) + signals.length
            }
        });

    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/signals/:id
 * Retrieve single signal by ID
 */
router.get('/:id', async (req, res, next) => {
    try {
        const signal = await Signal.findById(req.params.id).lean();

        if (!signal) {
            return res.status(404).json({
                error: 'Signal not found',
                id: req.params.id
            });
        }

        res.json({
            success: true,
            signal
        });

    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({
                error: 'Invalid signal ID format',
                id: req.params.id
            });
        }
        next(error);
    }
});

/**
 * DELETE /api/signals/:id
 * Delete a signal (for testing/cleanup)
 */
router.delete('/:id', async (req, res, next) => {
    try {
        const result = await Signal.findByIdAndDelete(req.params.id);

        if (!result) {
            return res.status(404).json({
                error: 'Signal not found',
                id: req.params.id
            });
        }

        res.json({
            success: true,
            message: 'Signal deleted',
            id: req.params.id
        });

    } catch (error) {
        next(error);
    }
});

module.exports = router;