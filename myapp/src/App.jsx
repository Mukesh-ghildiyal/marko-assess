// Main App
import React, { useState, useEffect } from 'react';
import { AlertCircle, Search } from 'lucide-react';
import SignalInput from './components/SignalInput.jsx';
import SignalCard from './components/SignalCard.jsx';
import Analytics from './components/Analytics.jsx';
import api from './services/api.js';

export default function App() {
  const [signals, setSignals] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = async () => {
    try {
      const params = filter !== 'all' ? { category: filter } : {};
      const [signalsRes, summaryRes] = await Promise.all([
        api.getSignals({ ...params, limit: 20 }),
        api.getSummary(30)
      ]);

      setSignals(signalsRes.data);
      setSummary(summaryRes.summary);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const handleSubmit = async (rawText) => {
    setLoading(true);
    try {
      await api.createSignal(rawText);
      await loadData();
    } finally {
      setLoading(false);
    }
  };

  const categories = summary?.categories?.map(c => c.category) || [];
  const filteredSignals = searchTerm
    ? signals.filter(s => s.rawText.toLowerCase().includes(searchTerm.toLowerCase()))
    : signals;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            From Chaos to Clarity
          </h1>
          <p className="text-gray-600">
            A self-organizing system that learns from unstructured input
          </p>
        </header>

        <SignalInput onSubmit={handleSubmit} loading={loading} />

        <Analytics summary={summary} />

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Search className="w-5 h-5 text-gray-500 mr-2" />
              <h2 className="text-xl font-semibold">Recent Signals</h2>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Search signals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {filteredSignals.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No signals yet. Start by reporting something above!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSignals.map(signal => (
                <SignalCard key={signal._id} signal={signal} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
