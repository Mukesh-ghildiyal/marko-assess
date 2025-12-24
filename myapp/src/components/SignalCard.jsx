// Signal Card Component
import React from 'react';
import { AlertCircle } from 'lucide-react';

const SignalCard = ({ signal }) => {
    const { rawText, interpretation, createdAt } = signal;
    const confidence = interpretation?.category?.confidence || 0;

    const getConfidenceColor = (conf) => {
        if (conf >= 0.7) return 'text-green-600 bg-green-50';
        if (conf >= 0.4) return 'text-yellow-600 bg-yellow-50';
        return 'text-gray-600 bg-gray-50';
    };

    const getSeverityColor = (severity) => {
        if (!severity || severity === 'unknown') return 'bg-gray-100 text-gray-700';
        if (severity === 'critical') return 'bg-red-100 text-red-700';
        if (severity === 'high') return 'bg-orange-100 text-orange-700';
        if (severity === 'medium') return 'bg-yellow-100 text-yellow-700';
        return 'bg-blue-100 text-blue-700';
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition">
            <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                    <p className="text-gray-900 text-base leading-relaxed mb-3">"{rawText}"</p>

                    <div className="flex flex-wrap gap-2 text-xs">
                        <span className={`px-2 py-1 rounded-full font-medium ${getConfidenceColor(confidence)}`}>
                            {interpretation?.category?.value || 'unknown'}
                            <span className="ml-1 opacity-75">
                                ({Math.round(confidence * 100)}%)
                            </span>
                        </span>

                        {interpretation?.severity?.value && interpretation.severity.value !== 'unknown' && (
                            <span className={`px-2 py-1 rounded-full font-medium ${getSeverityColor(interpretation.severity.value)}`}>
                                {interpretation.severity.value}
                            </span>
                        )}

                        {interpretation?.tags?.map((tag, i) => (
                            <span key={i} className="px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                                #{tag}
                            </span>
                        ))}
                    </div>
                </div>

                <span className="text-xs text-gray-500 ml-4 whitespace-nowrap">
                    {new Date(createdAt).toLocaleString()}
                </span>
            </div>

            {interpretation?.entities?.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-600 mb-1">Detected entities:</p>
                    <div className="flex flex-wrap gap-1">
                        {interpretation.entities.map((entity, i) => (
                            <span key={i} className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">
                                {entity.type}: {entity.value}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {confidence < 0.3 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-amber-600 flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Low confidence classification - this signal may need manual review
                    </p>
                </div>
            )}
        </div>
    );
};
export default SignalCard;