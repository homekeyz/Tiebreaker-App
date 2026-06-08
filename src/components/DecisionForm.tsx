import React, { useState } from 'react';
import { Sparkles, Scale, Columns, Grid, Plus, Trash2, HelpCircle } from 'lucide-react';
import { DecisionType } from '../types';

interface DecisionFormProps {
  onSubmit: (title: string, context: string, type: DecisionType, options: string[]) => void;
  isLoading: boolean;
}

export default function DecisionForm({ onSubmit, isLoading }: DecisionFormProps) {
  const [title, setTitle] = useState('');
  const [context, setContext] = useState('');
  const [type, setType] = useState<DecisionType>('pros-cons');
  
  // High fidelity comparison options
  const [options, setOptions] = useState<string[]>(['Option A', 'Option B']);
  const [newOptionName, setNewOptionName] = useState('');

  const handleAddOption = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newOptionName.trim();
    if (clean && !options.includes(clean)) {
      setOptions([...options, clean]);
      setNewOptionName('');
    }
  };

  const handleRemoveOption = (indexToRemove: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, idx) => idx !== indexToRemove));
    }
  };

  const handleOptionChange = (index: number, val: string) => {
    const updated = [...options];
    updated[index] = val;
    setOptions(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit(
      title.trim(),
      context.trim(),
      type,
      type === 'comparison-table' ? options.filter(o => o.trim()) : []
    );
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden" id="decision-form-container">
      {/* Absolute design accents */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <h2 className="text-xl font-display font-semibold text-slate-100 flex items-center gap-2 mb-6" id="form-heading">
        <Sparkles className="w-5 h-5 text-indigo-400" />
        Analyze a New Decision
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6" id="dilemma-form">
        {/* Title/Dilemma Question */}
        <div>
          <label htmlFor="title-input" className="block text-sm font-medium text-slate-300 mb-2">
            What is your decision dilemma? <span className="text-rose-400">*</span>
          </label>
          <input
            id="title-input"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Should I buy a hybrid hatchback or commit to a full electric sedan?"
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Framework Selector cards */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-3">
            Choose Analysis Framework
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3" id="framework-selector">
            {/* Pros & Cons Weighting */}
            <button
              type="button"
              id="framework-btn-pros-cons"
              onClick={() => setType('pros-cons')}
              className={`flex flex-col items-start p-4 rounded-xl border text-left transition-all ${
                type === 'pros-cons'
                  ? 'bg-slate-800/80 border-indigo-500 text-slate-100 ring-2 ring-indigo-500/20'
                  : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:bg-slate-950/80'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Scale className={`w-4 h-4 ${type === 'pros-cons' ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span className="font-medium text-sm">Pros & Cons Scale</span>
              </div>
              <p className="text-xs text-slate-400 leading-snug mt-1">
                Deep inventory of positive and negative drivers, weighted by priority. Great for single pathway go/no-go choices.
              </p>
            </button>

            {/* Comparison Table */}
            <button
              type="button"
              id="framework-btn-comparison"
              onClick={() => setType('comparison-table')}
              className={`flex flex-col items-start p-4 rounded-xl border text-left transition-all ${
                type === 'comparison-table'
                  ? 'bg-slate-800/80 border-indigo-500 text-slate-100 ring-2 ring-indigo-500/20'
                  : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:bg-slate-950/80'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Columns className={`w-4 h-4 ${type === 'comparison-table' ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span className="font-medium text-sm">Side-by-Side Table</span>
              </div>
              <p className="text-xs text-slate-400 leading-snug mt-1">
                Comparison matrix of criteria graded side-by-side. Designed to declare a single champion among 2 or 3 routes.
              </p>
            </button>

            {/* SWOT */}
            <button
              type="button"
              id="framework-btn-swot"
              onClick={() => setType('swot')}
              className={`flex flex-col items-start p-4 rounded-xl border text-left transition-all ${
                type === 'swot'
                  ? 'bg-slate-800/80 border-indigo-500 text-slate-100 ring-2 ring-indigo-500/20'
                  : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:bg-slate-950/80'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Grid className={`w-4 h-4 ${type === 'swot' ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span className="font-medium text-sm">Strategic SWOT Matrix</span>
              </div>
              <p className="text-xs text-slate-400 leading-snug mt-1">
                Structured Strengths, Weaknesses, Opportunities, Threats. Highly suited for big projects or career strategy routes.
              </p>
            </button>
          </div>
        </div>

        {/* Dynamic Comparison Options input (Only if comparing multiple options) */}
        {type === 'comparison-table' && (
          <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800 space-y-4" id="options-manager-panel">
            <h3 className="text-sm font-medium text-slate-200 flex items-center gap-1">
              Add paths/options to compare (At least 2 required)
            </h3>
            <div className="space-y-2">
              {options.map((opt, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-indigo-400"
                    placeholder={`Option ${index + 1}`}
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(index)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-all"
                      title="Remove Option"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {options.length < 4 ? (
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={newOptionName}
                  onChange={(e) => setNewOptionName(e.target.value)}
                  placeholder="Add another option path..."
                  className="flex-1 bg-slate-900 border border-dashed border-slate-800 px-3 py-1.5 rounded-lg text-sm text-slate-100 focus:outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddOption(e);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="bg-slate-800 hover:bg-indigo-600 text-slate-100 text-sm font-medium px-3 rounded-lg flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </button>
              </div>
            ) : (
              <p className="text-xs text-amber-400">
                Max 4 options is recommended for proper side-by-side comparison layouts.
              </p>
            )}
          </div>
        )}

        {/* Supplementary Content Context Textarea */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="context-input" className="block text-sm font-medium text-slate-300">
              Provide Context & Parameters <span className="text-slate-500 text-xs font-normal">(Optional)</span>
            </label>
            <div className="group relative flex items-center text-slate-500 cursor-pointer">
              <HelpCircle className="w-4 h-4 hover:text-slate-400" />
              <div className="absolute right-0 bottom-6 hidden group-hover:block w-72 bg-slate-950 border border-slate-800 p-3 rounded-lg text-xs text-slate-400 leading-relaxed shadow-xl z-30">
                Adding context (e.g. your budget limits, long-term aspirations, personal bottlenecks, feelings or fears) will produce vastly superior, sharp decision metrics customized to you!
              </div>
            </div>
          </div>
          <textarea
            id="context-input"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="e.g. Budget ceiling is $48,000. I commute 45 minutes daily. Charging infrastructure at work is plentiful, but standard grid costs are rising near home. I feel eager to try EVs but worry about extreme cold range drop."
            rows={3}
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors resize-y text-sm"
          />
        </div>

        {/* Submission Button */}
        <button
          type="submit"
          id="submit-decision-btn"
          disabled={isLoading || !title.trim()}
          className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 active:ring-2 active:ring-indigo-400/50 disabled:opacity-50 text-slate-100 font-medium text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-slate-300 border-t-indigo-200 rounded-full animate-spin" />
              Sifting and Weighting Factors...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Run Tiebreaker Analysis
            </>
          )}
        </button>
      </form>
    </div>
  );
}
