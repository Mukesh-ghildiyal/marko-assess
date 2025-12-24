// Analytics Dashboard
import React from 'react';
import { TrendingUp, Activity, Tag } from 'lucide-react';

const Analytics = ({ summary }) => {
    if (!summary) return null;

    const { overview, categories, tags } = summary;

    return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center mb-6">
                <TrendingUp className="w-5 h-5 text-green-500 mr-2" />
                <h2 className="text-xl font-semibold">System Intelligence</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-blue-600 font-medium">Total Signals</p>
                    <p className="text-3xl font-bold text-blue-900">{overview.totalSignals}</p>
                </div>

                <div className="bg-amber-50 rounded-lg p-4">
                    <p className="text-sm text-amber-600 font-medium">Unknown</p>
                    <p className="text-3xl font-bold text-amber-900">{overview.unknownPercentage}%</p>
                    <p className="text-xs text-amber-600 mt-1">{overview.unknownSignals} signals</p>
                </div>

                <div className="bg-orange-50 rounded-lg p-4">
                    <p className="text-sm text-orange-600 font-medium">Low Confidence</p>
                    <p className="text-3xl font-bold text-orange-900">{overview.lowConfidencePercentage}%</p>
                    <p className="text-xs text-orange-600 mt-1">{overview.lowConfidenceSignals} signals</p>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-green-600 font-medium">Categories Found</p>
                    <p className="text-3xl font-bold text-green-900">{categories.length}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h3 className="font-semibold mb-3 flex items-center">
                        <Activity className="w-4 h-4 mr-2" />
                        Category Distribution
                    </h3>
                    <div className="space-y-2">
                        {categories.slice(0, 6).map((cat, i) => (
                            <div key={i} className="flex items-center">
                                <div className="flex-1">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-700">{cat.category}</span>
                                        <span className="text-gray-500">{cat.count}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-500 h-2 rounded-full transition-all"
                                            style={{ width: `${cat.percentage}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="font-semibold mb-3 flex items-center">
                        <Tag className="w-4 h-4 mr-2" />
                        Emerging Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {tags.slice(0, 12).map((tag, i) => (
                            <span
                                key={i}
                                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                            >
                                {tag.tag} ({tag.count})
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
export default Analytics;