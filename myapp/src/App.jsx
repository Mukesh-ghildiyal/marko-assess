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
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Header */}
        <header className="mb-16">
          <h1 className="text-5xl font-bold text-slate-900 mb-3 tracking-tight">
            From Chaos to Clarity
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl">
            A self-organizing system that learns from unstructured input
          </p>
        </header>

        <SignalInput onSubmit={handleSubmit} loading={loading} />

        <Analytics summary={summary} />

        {/* Recent Signals Section */}
        <div className="bg-white rounded-lg border border-slate-200 p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-900 rounded-lg">
                <Search className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Recent Signals</h2>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <input
                type="text"
                placeholder="Search signals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white text-slate-900 placeholder:text-slate-400"
              />

              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white text-slate-900 cursor-pointer"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {filteredSignals.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex p-4 bg-slate-100 rounded-full mb-4">
                <AlertCircle className="w-12 h-12 text-slate-400" />
              </div>
              <p className="text-slate-600 text-lg">No signals yet. Start by reporting something above!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSignals.map((signal, index) => (
                <div
                  key={signal._id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <SignalCard signal={signal} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
