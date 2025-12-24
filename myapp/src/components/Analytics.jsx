// Analytics Dashboard
import React from 'react';
import { TrendingUp, Activity, Tag, BarChart3 } from 'lucide-react';

const Analytics = ({ summary }) => {
    if (!summary) return null;

    const { overview, categories, tags } = summary;

    return (
        <div className="bg-white rounded-lg border border-slate-200 p-8 mb-8 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-emerald-500 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">
                    System Intelligence
                </h2>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {/* Total Signals */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 hover:border-blue-300 transition-colors duration-200">
                    <div className="flex items-center gap-2 mb-2">
                        <BarChart3 className="w-4 h-4 text-blue-600" />
                        <p className="text-sm font-medium text-blue-900">Total Signals</p>
                    </div>
                    <p className="text-4xl font-bold text-blue-900">{overview.totalSignals}</p>
                </div>

                {/* Unknown */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 hover:border-amber-300 transition-colors duration-200">
                    <p className="text-sm font-medium text-amber-900 mb-2">Unknown</p>
                    <p className="text-4xl font-bold text-amber-900 mb-1">{overview.unknownPercentage}%</p>
                    <p className="text-xs text-amber-700">{overview.unknownSignals} signals</p>
                </div>

                {/* Low Confidence */}
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 hover:border-orange-300 transition-colors duration-200">
                    <p className="text-sm font-medium text-orange-900 mb-2">Low Confidence</p>
                    <p className="text-4xl font-bold text-orange-900 mb-1">{overview.lowConfidencePercentage}%</p>
                    <p className="text-xs text-orange-700">{overview.lowConfidenceSignals} signals</p>
                </div>

                {/* Categories Found */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 hover:border-emerald-300 transition-colors duration-200">
                    <p className="text-sm font-medium text-emerald-900 mb-2">Categories Found</p>
                    <p className="text-4xl font-bold text-emerald-900 mb-1">{categories.length}</p>
                    <p className="text-xs text-emerald-700">Unique types</p>
                </div>
            </div>

            {/* Category Distribution and Tags */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Category Distribution */}
                <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-900">
                        <Activity className="w-5 h-5 text-slate-700" />
                        Category Distribution
                    </h3>
                    <div className="space-y-3">
                        {categories.slice(0, 6).map((cat, i) => (
                            <div key={i}>
                                <div className="flex justify-between text-sm mb-1.5">
                                    <span className="text-slate-900 font-medium">{cat.category}</span>
                                    <span className="text-slate-600 font-semibold">{cat.count}</span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                                    <div
                                        className="h-full bg-blue-600 transition-all duration-500 ease-out"
                                        style={{ width: `${cat.percentage}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Emerging Tags */}
                <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-900">
                        <Tag className="w-5 h-5 text-slate-700" />
                        Emerging Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {tags.slice(0, 12).map((tag, i) => (
                            <span
                                key={i}
                                className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200 cursor-default"
                            >
                                #{tag.tag}
                                <span className="ml-1.5 text-xs opacity-60">
                                    {tag.count}
                                </span>
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;