// Signal Card Component
import React from 'react';
import { AlertCircle } from 'lucide-react';

const SignalCard = ({ signal }) => {
    const { rawText, interpretation, createdAt } = signal;
    const confidence = interpretation?.category?.confidence || 0;

    const getConfidenceColor = (conf) => {
        if (conf >= 0.7) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
        if (conf >= 0.4) return 'bg-amber-100 text-amber-800 border-amber-200';
        return 'bg-slate-100 text-slate-700 border-slate-200';
    };

    const getSeverityColor = (severity) => {
        if (!severity || severity === 'unknown') return 'bg-slate-100 text-slate-700 border-slate-200';
        if (severity === 'critical') return 'bg-red-100 text-red-800 border-red-200';
        if (severity === 'high') return 'bg-orange-100 text-orange-800 border-orange-200';
        if (severity === 'medium') return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        return 'bg-blue-100 text-blue-800 border-blue-200';
    };

    return (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 hover:border-slate-300 hover:shadow-sm transition-all duration-200">
            <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                    {/* Quote text */}
                    <p className="text-slate-900 text-base leading-relaxed mb-4 font-medium">
                        "{rawText}"
                    </p>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 text-xs">
                        {/* Category badge */}
                        <span className={`px-3 py-1.5 rounded-lg font-semibold border ${getConfidenceColor(confidence)}`}>
                            {interpretation?.category?.value || 'unknown'}
                            <span className="ml-2 opacity-75">
                                ({Math.round(confidence * 100)}%)
                            </span>
                        </span>

                        {/* Severity badge */}
                        {interpretation?.severity?.value && interpretation.severity.value !== 'unknown' && (
                            <span className={`px-3 py-1.5 rounded-lg font-semibold border ${getSeverityColor(interpretation.severity.value)}`}>
                                {interpretation.severity.value}
                            </span>
                        )}

                        {/* Tags */}
                        {interpretation?.tags?.map((tag, i) => (
                            <span key={i} className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 font-medium">
                                #{tag}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Timestamp */}
                <span className="text-xs text-slate-500 ml-4 whitespace-nowrap bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                    {new Date(createdAt).toLocaleString()}
                </span>
            </div>

            {/* Entities section */}
            {interpretation?.entities?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                    <p className="text-xs text-slate-600 mb-2 font-semibold">
                        Detected entities:
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {interpretation.entities.map((entity, i) => (
                            <span key={i} className="text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700">
                                <span className="font-semibold text-slate-900">{entity.type}:</span> {entity.value}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Low confidence warning */}
            {confidence < 0.3 && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                    <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-800">
                            Low confidence classification - this signal may need manual review
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SignalCard;