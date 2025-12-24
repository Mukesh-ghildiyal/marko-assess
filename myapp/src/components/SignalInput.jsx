// Signal Input Component
import React, { useState } from 'react';
import { AlertCircle, Sparkles } from 'lucide-react';

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
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center mb-4">
                <Sparkles className="w-5 h-5 text-blue-500 mr-2" />
                <h2 className="text-xl font-semibold">Report Anything</h2>
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
                    className="w-full p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    rows="4"
                    disabled={loading}
                />

                {error && (
                    <div className="mt-2 text-red-600 text-sm flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {error}
                    </div>
                )}

                <button
                    onClick={handleSubmit}
                    disabled={loading || !text.trim()}
                    className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition font-medium"
                >
                    {loading ? 'Processing...' : 'Submit Signal'}
                </button>
            </div>

            <p className="text-xs text-gray-500 mt-3">
                No forms, no dropdowns. Just describe what happened in your own words.
                The system will interpret it automatically. (Ctrl+Enter to submit)
            </p>
        </div>
    );
};
export default SignalInput;