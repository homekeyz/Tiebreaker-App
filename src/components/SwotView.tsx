import React, { useState, useEffect } from 'react';
import { Plus, Trash2, RotateCcw, Copy, Check, Sparkles, AlertCircle, HelpCircle } from 'lucide-react';
import { SWOTAnalysis } from '../types';

interface SwotViewProps {
  initialAnalysis: SWOTAnalysis;
  onSaveModified: (modified: SWOTAnalysis) => void;
  decisionTitle: string;
}

export default function SwotView({ initialAnalysis, onSaveModified, decisionTitle }: SwotViewProps) {
  // Local state for each SWOT quadrant
  const [strengths, setStrengths] = useState(initialAnalysis.strengths || []);
  const [weaknesses, setWeaknesses] = useState(initialAnalysis.weaknesses || []);
  const [opportunities, setOpportunities] = useState(initialAnalysis.opportunities || []);
  const [threats, setThreats] = useState(initialAnalysis.threats || []);
  const [copied, setCopied] = useState(false);

  // Draft fields for adding custom points
  const [newStrPoint, setNewStrPoint] = useState('');
  const [newStrSig, setNewStrSig] = useState('');

  const [newWeakPoint, setNewWeakPoint] = useState('');
  const [newWeakSig, setNewWeakSig] = useState('');

  const [newOppPoint, setNewOppPoint] = useState('');
  const [newOppStrat, setNewOppStrat] = useState('');

  const [newThrPoint, setNewThrPoint] = useState('');
  const [newThrMit, setNewThrMit] = useState('');

  // Sync state if initial changes
  useEffect(() => {
    setStrengths(initialAnalysis.strengths || []);
    setWeaknesses(initialAnalysis.weaknesses || []);
    setOpportunities(initialAnalysis.opportunities || []);
    setThreats(initialAnalysis.threats || []);
  }, [initialAnalysis]);

  const notifyChanges = (
    s = strengths,
    w = weaknesses,
    o = opportunities,
    t = threats
  ) => {
    onSaveModified({
      strengths: s,
      weaknesses: w,
      opportunities: o,
      threats: t,
      conclusion: initialAnalysis.conclusion,
      strategicAction: initialAnalysis.strategicAction,
      confidenceRating: initialAnalysis.confidenceRating,
    });
  };

  // Add handlers
  const handleAddStrength = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStrPoint.trim()) return;
    const next = [...strengths, { point: newStrPoint.trim(), significance: newStrSig.trim() || 'Internal leverage advantage.' }];
    setStrengths(next);
    setNewStrPoint('');
    setNewStrSig('');
    notifyChanges(next, weaknesses, opportunities, threats);
  };

  const handleAddWeakness = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWeakPoint.trim()) return;
    const next = [...weaknesses, { point: newWeakPoint.trim(), significance: newWeakSig.trim() || 'Internal vulnerability to monitor.' }];
    setWeaknesses(next);
    setNewWeakPoint('');
    setNewWeakSig('');
    notifyChanges(strengths, next, opportunities, threats);
  };

  const handleAddOpportunity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOppPoint.trim()) return;
    const next = [...opportunities, { point: newOppPoint.trim(), strategy: newOppStrat.trim() || 'Active capture strategy.' }];
    setOpportunities(next);
    setNewOppPoint('');
    setNewOppStrat('');
    notifyChanges(strengths, weaknesses, next, threats);
  };

  const handleAddThreat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newThrPoint.trim()) return;
    const next = [...threats, { point: newThrPoint.trim(), mitigation: newThrMit.trim() || 'Mitigation and warning plan.' }];
    setThreats(next);
    setNewThrPoint('');
    setNewThrMit('');
    notifyChanges(strengths, weaknesses, opportunities, next);
  };

  // Remove handlers
  const handleRemove = (quadrant: 's' | 'w' | 'o' | 't', idx: number) => {
    if (quadrant === 's') {
      const next = strengths.filter((_, i) => i !== idx);
      setStrengths(next);
      notifyChanges(next, weaknesses, opportunities, threats);
    } else if (quadrant === 'w') {
      const next = weaknesses.filter((_, i) => i !== idx);
      setWeaknesses(next);
      notifyChanges(strengths, next, opportunities, threats);
    } else if (quadrant === 'o') {
      const next = opportunities.filter((_, i) => i !== idx);
      setOpportunities(next);
      notifyChanges(strengths, weaknesses, next, threats);
    } else if (quadrant === 't') {
      const next = threats.filter((_, i) => i !== idx);
      setThreats(next);
      notifyChanges(strengths, weaknesses, opportunities, next);
    }
  };

  const handleReset = () => {
    if (window.confirm("Restore original AI-generated SWOT fields? This overwrites current additions.")) {
      setStrengths(initialAnalysis.strengths || []);
      setWeaknesses(initialAnalysis.weaknesses || []);
      setOpportunities(initialAnalysis.opportunities || []);
      setThreats(initialAnalysis.threats || []);
      onSaveModified(initialAnalysis);
    }
  };

  const handleCopyReport = () => {
    const reportText = `THE TIEBREAKER SWOT REPORT: ${decisionTitle}

[STRENGTHS]:
${strengths.map((x, i) => `${i + 1}. ${x.point} (Impact: ${x.significance})`).join('\n')}

[WEAKNESSES]:
${weaknesses.map((x, i) => `${i + 1}. ${x.point} (Impact: ${x.significance})`).join('\n')}

[OPPORTUNITIES]:
${opportunities.map((x, i) => `${i + 1}. ${x.point} (Strategy: ${x.strategy})`).join('\n')}

[THREATS]:
${threats.map((x, i) => `${i + 1}. ${x.point} (Defense: ${x.mitigation})`).join('\n')}

[RECOMMENDED ACTION INITIATIVE]:
${initialAnalysis.strategicAction}

[SUMMARY]:
${initialAnalysis.conclusion}`;

    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6" id="swot-view-stage">
      {/* Prime Strategic Focus Accent */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden" id="swot-action-banner">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400">KEY PRIORITY ACTION INITIATIVE:</div>
              <h3 className="text-md md:text-lg font-display font-medium text-slate-100 mt-1 leading-relaxed">
                {initialAnalysis.strategicAction}
              </h3>
            </div>
          </div>

          <div className="flex gap-2 items-center w-full md:w-auto">
            <button
              onClick={handleCopyReport}
              className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-slate-100 transition-colors flex items-center gap-2 text-xs font-semibold cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy SWOT Report'}
            </button>
            <button
              onClick={handleReset}
              className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-2 text-xs cursor-pointer"
              title="Reset"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 2x2 SWOT Quadrant grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="swot-quadrant-layout">
        
        {/* STRENGTHS (Internal, Positive - Green) */}
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-emerald-500/10 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">STRENGTHS (Internal Edge)</h3>
            </div>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-mono">Positive</span>
          </div>

          <div className="space-y-3 min-h-[140px]">
            {strengths.map((str, idx) => (
              <div key={idx} className="bg-slate-950/40 border border-emerald-950/20 p-3.5 rounded-xl flex items-start gap-3 relative group transition-colors hover:border-emerald-900/40">
                <span className="text-emerald-500 mt-0.5 font-bold">•</span>
                <div className="flex-1 text-sm text-slate-200">
                  <span className="font-semibold text-slate-100">{str.point}</span>
                  <p className="text-xs text-slate-400 mt-1 leading-normal italic">Significance: {str.significance}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove('s', idx)}
                  className="p-1 text-slate-600 hover:text-rose-400 rounded transition-colors lg:opacity-0 group-hover:opacity-100 cursor-pointer"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {strengths.length === 0 && (
              <p className="text-xs text-slate-500 italic py-6 text-center">No Strengths listed.</p>
            )}
          </div>

          {/* Quick Input */}
          <form onSubmit={handleAddStrength} className="bg-slate-950/30 p-3 rounded-xl border border-dashed border-slate-800 space-y-2">
            <input
              type="text"
              required
              placeholder="Add Strength point..."
              value={newStrPoint}
              onChange={(e) => setNewStrPoint(e.target.value)}
              className="w-full bg-slate-900 border border-slate-850 px-2.5 py-1.5 rounded text-xs text-slate-200"
            />
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Why is it an edge?..."
                value={newStrSig}
                onChange={(e) => setNewStrSig(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-850 px-2.5 py-1.5 rounded text-xs text-slate-300"
              />
              <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-3 rounded flex items-center gap-1 cursor-pointer">
                <Plus className="w-3 h-3" /> Add
              </button>
            </div>
          </form>
        </div>

        {/* WEAKNESSES (Internal, Negative - Amber) */}
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-amber-500/10 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">WEAKNESSES (Internal Risks)</h3>
            </div>
            <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded font-mono">Negative</span>
          </div>

          <div className="space-y-3 min-h-[140px]">
            {weaknesses.map((weak, idx) => (
              <div key={idx} className="bg-slate-950/40 border border-amber-950/20 p-3.5 rounded-xl flex items-start gap-3 relative group transition-colors hover:border-amber-900/40">
                <span className="text-amber-500 mt-0.5 font-bold">•</span>
                <div className="flex-1 text-sm text-slate-200">
                  <span className="font-semibold text-slate-100">{weak.point}</span>
                  <p className="text-xs text-slate-400 mt-1 leading-normal italic">Vulnerability: {weak.significance}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove('w', idx)}
                  className="p-1 text-slate-600 hover:text-rose-400 rounded transition-colors lg:opacity-0 group-hover:opacity-100 cursor-pointer"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {weaknesses.length === 0 && (
              <p className="text-xs text-slate-500 italic py-6 text-center">No Weaknesses listed.</p>
            )}
          </div>

          {/* Quick Input */}
          <form onSubmit={handleAddWeakness} className="bg-slate-950/30 p-3 rounded-xl border border-dashed border-slate-800 space-y-2">
            <input
              type="text"
              required
              placeholder="Add Weakness point..."
              value={newWeakPoint}
              onChange={(e) => setNewWeakPoint(e.target.value)}
              className="w-full bg-slate-900 border border-slate-850 px-2.5 py-1.5 rounded text-xs text-slate-200"
            />
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="What is the drawback?..."
                value={newWeakSig}
                onChange={(e) => setNewWeakSig(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-850 px-2.5 py-1.5 rounded text-xs text-slate-300"
              />
              <button type="submit" className="bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs px-3 rounded flex items-center gap-1 cursor-pointer">
                <Plus className="w-3 h-3" /> Add
              </button>
            </div>
          </form>
        </div>

        {/* OPPORTUNITIES (External, Positive - Indigo) */}
        <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-indigo-500/10 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400">OPPORTUNITIES (External Winds)</h3>
            </div>
            <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded font-mono">Growth</span>
          </div>

          <div className="space-y-3 min-h-[140px]">
            {opportunities.map((opp, idx) => (
              <div key={idx} className="bg-slate-950/40 border border-indigo-950/20 p-3.5 rounded-xl flex items-start gap-3 relative group transition-colors hover:border-indigo-900/40">
                <span className="text-indigo-500 mt-0.5 font-bold">•</span>
                <div className="flex-1 text-sm text-slate-200">
                  <span className="font-semibold text-slate-100">{opp.point}</span>
                  <p className="text-xs text-slate-400 mt-1 leading-normal italic">Tactics: {opp.strategy}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove('o', idx)}
                  className="p-1 text-slate-600 hover:text-rose-400 rounded transition-colors lg:opacity-0 group-hover:opacity-100 cursor-pointer"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {opportunities.length === 0 && (
              <p className="text-xs text-slate-500 italic py-6 text-center">No Opportunities listed.</p>
            )}
          </div>

          {/* Quick Input */}
          <form onSubmit={handleAddOpportunity} className="bg-slate-950/30 p-3 rounded-xl border border-dashed border-slate-800 space-y-2">
            <input
              type="text"
              required
              placeholder="Add Opportunity point..."
              value={newOppPoint}
              onChange={(e) => setNewOppPoint(e.target.value)}
              className="w-full bg-slate-900 border border-slate-850 px-2.5 py-1.5 rounded text-xs text-slate-200"
            />
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Tactical move to seize...? "
                value={newOppStrat}
                onChange={(e) => setNewOppStrat(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-850 px-2.5 py-1.5 rounded text-xs text-slate-300"
              />
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-3 rounded flex items-center gap-1 cursor-pointer">
                <Plus className="w-3 h-3" /> Add
              </button>
            </div>
          </form>
        </div>

        {/* THREATS (External, Negative - Rose) */}
        <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-rose-500/10 pb-2">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400">THREATS (External Safeguards)</h3>
            </div>
            <span className="text-[10px] bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded font-mono">Defense</span>
          </div>

          <div className="space-y-3 min-h-[140px]">
            {threats.map((thr, idx) => (
              <div key={idx} className="bg-slate-950/40 border border-rose-950/20 p-3.5 rounded-xl flex items-start gap-3 relative group transition-colors hover:border-rose-900/40">
                <span className="text-rose-500 mt-0.5 font-bold">•</span>
                <div className="flex-1 text-sm text-slate-200">
                  <span className="font-semibold text-slate-100">{thr.point}</span>
                  <p className="text-xs text-slate-400 mt-1 leading-normal italic">Defense: {thr.mitigation}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove('t', idx)}
                  className="p-1 text-slate-600 hover:text-rose-400 rounded transition-colors lg:opacity-0 group-hover:opacity-100 cursor-pointer"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {threats.length === 0 && (
              <p className="text-xs text-slate-500 italic py-6 text-center">No Threats listed.</p>
            )}
          </div>

          {/* Quick Input */}
          <form onSubmit={handleAddThreat} className="bg-slate-950/30 p-3 rounded-xl border border-dashed border-slate-800 space-y-2">
            <input
              type="text"
              required
              placeholder="Add Threat point..."
              value={newThrPoint}
              onChange={(e) => setNewThrPoint(e.target.value)}
              className="w-full bg-slate-900 border border-slate-850 px-2.5 py-1.5 rounded text-xs text-slate-200"
            />
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Mitigation or backup plan...?"
                value={newThrMit}
                onChange={(e) => setNewThrMit(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-850 px-2.5 py-1.5 rounded text-xs text-slate-300"
              />
              <button type="submit" className="bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs px-3 rounded flex items-center gap-1 cursor-pointer">
                <Plus className="w-3 h-3" /> Add
              </button>
            </div>
          </form>
        </div>

      </div>

      {/* SWOT Strategic Summary text */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl" id="swot-synthesis-box">
        <h4 className="font-display font-semibold text-slate-100 flex items-center gap-1.5 mb-3 text-sm">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          AI SWOT Strategic Synthesis
        </h4>
        <p className="text-sm text-slate-350 leading-relaxed">
          {initialAnalysis.conclusion}
        </p>
        <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
          <span>Analysis Confidence Rating:</span>
          <span className="font-mono text-indigo-300 font-bold">{initialAnalysis.confidenceRating}%</span>
          <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div 
              style={{ width: `${initialAnalysis.confidenceRating}%` }}
              className="h-full bg-indigo-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
