// Signal Input Component
import React, { useState } from 'react';
import { AlertCircle, Send } from 'lucide-react';

const SignalInput = ({ onSubmit, loading }) => {
    const [text, setText] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        if (!text.trim()) {
            setError('Please enter some text');
            return;
        }
        setError('');
        try {
            await onSubmit(text);
            setText('');
        } catch (err) {
            setError(err.message);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            handleSubmit();
        }
    };

    return (
        <div className="bg-white rounded-lg border border-slate-200 p-8 mb-8 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-500 rounded-lg">
                    <Send className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">
                    Report Anything
                </h2>
            </div>

            <div>
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter any observation, issue, or note... 

Examples:
• Motor overheating after 3 hours
• PCB board version 2 failed QA
• Delay in shipment from vendor X
• Voltage drop observed at node A"
                    className="w-full p-4 border border-slate-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-slate-50 text-slate-900 placeholder:text-slate-400"
                    rows="5"
                    disabled={loading}
                />

                {error && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center text-sm">
                        <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                        {error}
                    </div>
                )}

                <div className="flex items-center justify-between mt-5">
                    <p className="text-xs text-slate-500">
                        No forms, no dropdowns. Just describe what happened in your own words.
                        <span className="block mt-1">Press <kbd className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-600 font-mono text-xs">Ctrl+Enter</kbd> to submit</span>
                    </p>

                    <button
                        onClick={handleSubmit}
                        disabled={loading || !text.trim()}
                        className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-sm hover:shadow flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Processing...
                            </>
                        ) : (
                            <>
                                Submit Signal
                                <Send className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SignalInput;