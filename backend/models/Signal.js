// backend/src/models/Signal.js
const mongoose = require('mongoose');

/**
 * Signal Schema - Designed for maximum flexibility
 * 
 * Key Design Decisions:
 * 1. rawText: Source of truth, never modified
 * 2. interpretation: Flexible object, no predefined structure
 * 3. metadata: Open-ended for future extensions
 * 4. No enums or rigid constraints
 */
const signalSchema = new mongoose.Schema({
    // Source of truth - always preserved exactly as received
    rawText: {
        type: String,
        required: true,
        index: 'text' // Enable text search
    },

    // Derived interpretation - flexible structure
    interpretation: {
        // Inferred category with confidence
        category: {
            value: { type: String, default: 'unknown' },
            confidence: { type: Number, min: 0, max: 1, default: 0 }
        },

        // Extracted entities (flexible array)
        entities: [{
            type: { type: String }, // e.g., "component", "vendor", "metric"
            value: { type: String },
            confidence: { type: Number, min: 0, max: 1 }
        }],

        // Inferred tags (emergent vocabulary)
        tags: [String],

        // Severity/priority if detectable
        severity: {
            value: { type: String, default: 'unknown' },
            confidence: { type: Number, min: 0, max: 1, default: 0 }
        },

        // Any additional derived insights
        insights: mongoose.Schema.Types.Mixed
    },

    // System metadata
    metadata: {
        source: { type: String, default: 'manual_entry' },
        processedAt: Date,
        version: { type: String, default: '1.0' }, // Schema version for evolution
        flags: [String] // e.g., "needs_review", "high_uncertainty"
    },

    // Timestamps
    createdAt: { type: Date, default: Date.now, index: true },
    updatedAt: { type: Date, default: Date.now }
}, {
    // Enable strict: false to allow dynamic fields in the future
    strict: false,
    timestamps: true
});

// Indexes for common queries
signalSchema.index({ 'interpretation.category.value': 1, createdAt: -1 });
signalSchema.index({ 'interpretation.tags': 1 });
signalSchema.index({ 'metadata.flags': 1 });

// Pre-save hook to ensure interpretation structure exists
signalSchema.pre('save', function () {
    if (!this.interpretation) {
        this.interpretation = {
            category: { value: 'unknown', confidence: 0 },
            entities: [],
            tags: [],
            severity: { value: 'unknown', confidence: 0 }
        };
    }
});

module.exports = mongoose.model('Signal', signalSchema);