// backend/src/services/classifier.js

/**
 * Heuristic-based classification system
 * 
 * Philosophy:
 * - Pattern matching over rigid rules
 * - Confidence scoring over binary decisions
 * - Graceful degradation to "unknown"
 * - Vocabulary emerges from patterns, not predefined
 */

class SignalClassifier {
    constructor() {
        // Pattern libraries - these grow with system usage
        this.patterns = {
            categories: [
                {
                    name: 'hardware_issue',
                    keywords: ['motor', 'sensor', 'board', 'pcb', 'voltage', 'current', 'hardware', 'circuit'],
                    patterns: [/\b(failed|failure|broken|damaged|overheating)\b/i]
                },
                {
                    name: 'quality_issue',
                    keywords: ['qa', 'quality', 'defect', 'inspection', 'test'],
                    patterns: [/\b(failed|passed|rejected)\s+(qa|test|inspection)\b/i]
                },
                {
                    name: 'supply_chain',
                    keywords: ['shipment', 'delivery', 'vendor', 'supplier', 'delay', 'order'],
                    patterns: [/\b(delay|late|shipped|received)\b/i]
                },
                {
                    name: 'performance',
                    keywords: ['slow', 'fast', 'performance', 'latency', 'throughput', 'speed'],
                    patterns: [/\b(after|within|took)\s+\d+\s+(hours?|minutes?|seconds?)\b/i]
                },
                {
                    name: 'observation',
                    keywords: ['observed', 'noticed', 'detected', 'found', 'discovered'],
                    patterns: [/\b(observed|noticed|detected)\b/i]
                }
            ],

            severity: [
                { level: 'critical', keywords: ['critical', 'urgent', 'emergency', 'down', 'failure'], weight: 0.9 },
                { level: 'high', keywords: ['issue', 'problem', 'error', 'failed', 'broken'], weight: 0.7 },
                { level: 'medium', keywords: ['warning', 'delay', 'slow', 'concern'], weight: 0.5 },
                { level: 'low', keywords: ['notice', 'info', 'observed', 'note'], weight: 0.3 }
            ],

            entities: [
                { type: 'component', patterns: [/\b(motor|sensor|board|pcb|circuit|module|unit)\b/gi] },
                { type: 'vendor', patterns: [/\b(vendor|supplier)\s+([A-Z]\w*)/gi] },
                { type: 'metric', patterns: [/\b(\d+\.?\d*)\s*(hours?|minutes?|seconds?|volts?|amps?)\b/gi] },
                { type: 'version', patterns: [/\bversion\s+(\d+\.?\d*)\b/gi] },
                { type: 'location', patterns: [/\bat\s+(node|point|location|site)\s+([A-Z]\w*)/gi] }
            ]
        };
    }

    /**
     * Main classification entry point
     * Returns interpretation object with confidence scores
     */
    classify(rawText) {
        if (!rawText || typeof rawText !== 'string') {
            return this.createUnknownInterpretation('Invalid input');
        }

        const text = rawText.toLowerCase().trim();

        if (text.length === 0) {
            return this.createUnknownInterpretation('Empty input');
        }

        return {
            category: this.classifyCategory(text),
            entities: this.extractEntities(rawText),
            tags: this.extractTags(text),
            severity: this.classifySeverity(text),
            insights: this.generateInsights(rawText, text)
        };
    }

    /**
     * Category classification with confidence
     */
    classifyCategory(text) {
        const scores = this.patterns.categories.map(cat => {
            let score = 0;
            let matches = 0;

            // Keyword matching
            cat.keywords.forEach(keyword => {
                if (text.includes(keyword)) {
                    score += 0.3;
                    matches++;
                }
            });

            // Pattern matching
            cat.patterns.forEach(pattern => {
                if (pattern.test(text)) {
                    score += 0.5;
                    matches++;
                }
            });

            // Normalize by potential matches
            const maxScore = cat.keywords.length * 0.3 + cat.patterns.length * 0.5;
            const confidence = maxScore > 0 ? Math.min(score / maxScore, 1) : 0;

            return { name: cat.name, confidence, matches };
        });

        // Sort by confidence
        scores.sort((a, b) => b.confidence - a.confidence);

        // Return top match if confidence is reasonable
        if (scores[0].confidence > 0.3) {
            return {
                value: scores[0].name,
                confidence: Math.round(scores[0].confidence * 100) / 100,
                alternatives: scores.slice(1, 3).filter(s => s.confidence > 0.2).map(s => ({
                    value: s.name,
                    confidence: Math.round(s.confidence * 100) / 100
                }))
            };
        }

        return { value: 'unknown', confidence: 0 };
    }

    /**
     * Entity extraction with confidence
     */
    extractEntities(rawText) {
        const entities = [];

        this.patterns.entities.forEach(entityType => {
            entityType.patterns.forEach(pattern => {
                const matches = [...rawText.matchAll(pattern)];
                matches.forEach(match => {
                    entities.push({
                        type: entityType.type,
                        value: match[0].trim(),
                        confidence: 0.8 // Pattern-based extraction has decent confidence
                    });
                });
            });
        });

        return entities;
    }

    /**
     * Tag generation - emergent vocabulary
     */
    extractTags(text) {
        const tags = new Set();

        // Extract meaningful words (filter common stopwords)
        const stopwords = new Set(['the', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'from', 'by', 'after', 'before']);
        const words = text.split(/\W+/).filter(w => w.length > 3 && !stopwords.has(w));

        // Add words that appear in pattern vocabularies
        words.forEach(word => {
            this.patterns.categories.forEach(cat => {
                if (cat.keywords.includes(word)) {
                    tags.add(word);
                }
            });
        });

        // Add detected issues
        if (/\b(fail|error|issue|problem)\w*\b/i.test(text)) tags.add('issue');
        if (/\b(delay|late)\w*\b/i.test(text)) tags.add('delay');
        if (/\b\d+\b/.test(text)) tags.add('quantified');

        return Array.from(tags).slice(0, 5); // Limit to 5 most relevant
    }

    /**
     * Severity classification
     */
    classifySeverity(text) {
        let maxScore = 0;
        let detectedLevel = 'unknown';

        this.patterns.severity.forEach(sev => {
            const matches = sev.keywords.filter(kw => text.includes(kw)).length;
            const score = matches > 0 ? sev.weight : 0;

            if (score > maxScore) {
                maxScore = score;
                detectedLevel = sev.level;
            }
        });

        if (maxScore > 0) {
            return {
                value: detectedLevel,
                confidence: Math.min(maxScore, 1)
            };
        }

        return { value: 'unknown', confidence: 0 };
    }

    /**
     * Generate additional insights
     */
    generateInsights(rawText, text) {
        const insights = {};

        // Detect time references
        const timeMatch = text.match(/\b(\d+)\s+(hours?|minutes?|seconds?|days?)\b/i);
        if (timeMatch) {
            insights.timeReference = timeMatch[0];
        }

        // Detect versions
        const versionMatch = text.match(/\bversion\s+(\d+\.?\d*)\b/i);
        if (versionMatch) {
            insights.version = versionMatch[1];
        }

        // Detect uncertainty markers
        if (/\b(maybe|possibly|perhaps|might|could)\b/i.test(text)) {
            insights.containsUncertainty = true;
        }

        // Word count and complexity
        insights.wordCount = rawText.split(/\s+/).length;
        insights.complexity = rawText.length > 100 ? 'high' : rawText.length > 30 ? 'medium' : 'low';

        return insights;
    }

    /**
     * Create default unknown interpretation
     */
    createUnknownInterpretation(reason) {
        return {
            category: { value: 'unknown', confidence: 0, reason },
            entities: [],
            tags: [],
            severity: { value: 'unknown', confidence: 0 },
            insights: { reason }
        };
    }
}

module.exports = new SignalClassifier();