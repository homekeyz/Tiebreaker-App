import React, { useState, useEffect } from 'react';
import { Plus, Trash2, RotateCcw, AlertTriangle, Sparkles, HelpCircle, Check, Copy, CheckCircle2 } from 'lucide-react';
import { ProsConsAnalysis } from '../types';

interface ProsConsViewProps {
  initialAnalysis: ProsConsAnalysis;
  onSaveModified: (modified: ProsConsAnalysis) => void;
  decisionTitle: string;
}

export default function ProsConsView({ initialAnalysis, onSaveModified, decisionTitle }: ProsConsViewProps) {
  // Local state for interactive editing
  const [pros, setPros] = useState(initialAnalysis.pros);
  const [cons, setCons] = useState(initialAnalysis.cons);
  const [copied, setCopied] = useState(false);

  // New item draft states
  const [newProDraft, setNewProDraft] = useState('');
  const [newProImpact, setNewProImpact] = useState(3);
  const [newProExpl, setNewProExpl] = useState('');

  const [newConDraft, setNewConDraft] = useState('');
  const [newConImpact, setNewConImpact] = useState(3);
  const [newConExpl, setNewConExpl] = useState('');

  // Sync state if initial analysis changes
  useEffect(() => {
    setPros(initialAnalysis.pros);
    setCons(initialAnalysis.cons);
  }, [initialAnalysis]);

  // Recalculate score dynamically using the impact factors of columns
  const getRecalculatedMetrics = () => {
    const totalProImpact = pros.reduce((acc, p) => acc + p.impact, 0);
    const totalConImpact = cons.reduce((acc, c) => acc + c.impact, 0);
    const totalWeight = totalProImpact + totalConImpact;

    let score = 0;
    if (totalWeight > 0) {
      // Scale from -100 to 100
      score = Math.round(((totalProImpact - totalConImpact) / totalWeight) * 100);
    }

    return {
      score,
      proSum: totalProImpact,
      conSum: totalConImpact
    };
  };

  const { score, proSum, conSum } = getRecalculatedMetrics();

  // Trigger state propagation upwards
  const notifyChanges = (updatedPros = pros, updatedCons = cons) => {
    const freshMetrics = {
      pros: updatedPros,
      cons: updatedCons,
      conclusion: initialAnalysis.conclusion,
      tiebreakerScore: Math.round(((updatedPros.reduce((acc, p) => acc + p.impact, 0) - updatedCons.reduce((acc, c) => acc + c.impact, 0)) / (updatedPros.reduce((acc, p) => acc + p.impact, 0) + updatedCons.reduce((acc, c) => acc + c.impact, 0) || 1)) * 100),
      confidenceRating: initialAnalysis.confidenceRating
    };
    onSaveModified(freshMetrics);
  };

  // Mutate items list
  const handleAddPro = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProDraft.trim()) return;
    const item = {
      text: newProDraft.trim(),
      impact: newProImpact,
      explanation: newProExpl.trim() || 'Custom factor added by user.'
    };
    const next = [...pros, item];
    setPros(next);
    setNewProDraft('');
    setNewProExpl('');
    setNewProImpact(3);
    notifyChanges(next, cons);
  };

  const handleAddCon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newConDraft.trim()) return;
    const item = {
      text: newConDraft.trim(),
      impact: newConImpact,
      explanation: newConExpl.trim() || 'Custom factor added by user.'
    };
    const next = [...cons, item];
    setCons(next);
    setNewConDraft('');
    setNewConExpl('');
    setNewConImpact(3);
    notifyChanges(pros, next);
  };

  const handleDeletePro = (index: number) => {
    const next = pros.filter((_, idx) => idx !== index);
    setPros(next);
    notifyChanges(next, cons);
  };

  const handleDeleteCon = (index: number) => {
    const next = cons.filter((_, idx) => idx !== index);
    setCons(next);
    notifyChanges(pros, next);
  };

  const updateProImpact = (index: number, nextImpact: number) => {
    const updated = [...pros];
    updated[index].impact = Math.max(1, Math.min(5, nextImpact));
    setPros(updated);
    notifyChanges(updated, cons);
  };

  const updateConImpact = (index: number, nextImpact: number) => {
    const updated = [...cons];
    updated[index].impact = Math.max(1, Math.min(5, nextImpact));
    setCons(updated);
    notifyChanges(pros, updated);
  };

  const handleReset = () => {
    if (window.confirm("Restore back to original AI generated analysis? This overwrites manual changes.")) {
      setPros(initialAnalysis.pros);
      setCons(initialAnalysis.cons);
      onSaveModified(initialAnalysis);
    }
  };

  // Beautiful verdict based on current calculated dynamic score
  const getDecisionVerdict = () => {
    if (score > 15) return { text: "LEANING YES", style: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10" };
    if (score < -15) return { text: "LEANING NO", style: "border-rose-500/30 text-rose-400 bg-rose-500/10" };
    return { text: "BALANCED / TIE", style: "border-amber-500/30 text-amber-400 bg-amber-500/10" };
  };

  const verdict = getDecisionVerdict();

  const handleCopyReport = () => {
    const reportText = `THE TIEBREAKER REPORT: ${decisionTitle}

[TIEBREAKER SCORE]: ${score} / 100 (${verdict.text})
[PROS (Score Weight: ${proSum})]:
${pros.map((p, i) => `${i + 1}. ${p.text} (Weight: ${p.impact}/5) - ${p.explanation}`).join('\n')}

[CONS (Score Weight: ${conSum})]:
${cons.map((c, i) => `${i + 1}. ${c.text} (Weight: ${c.impact}/5) - ${c.explanation}`).join('\n')}

[STRATEGIC VERDICT CONCLUSION]:
${initialAnalysis.conclusion}`;

    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8" id="pros-cons-analyzer-view">
      {/* Dynamic Scale Balance Widget */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden" id="scale-balance-widget">
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-rose-500 via-slate-700 to-emerald-500" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h3 className="text-lg font-display font-medium text-slate-100 flex items-center gap-2">
              ⚖️ Decision Scale Tilt
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Based on the sum weight of reasons. Adjust the sliders below to tip the scale.
            </p>
          </div>

          <div className="flex gap-2 items-center">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide border ${verdict.style}`} id="decision-verdict-tag">
              {verdict.text}
            </span>
            <button
              onClick={handleCopyReport}
              className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-slate-100 transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer"
              title="Copy Summary Report"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button
              onClick={handleReset}
              className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-1.5 text-xs cursor-pointer"
              title="Reset to AI Original"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>
        </div>

        {/* The Graphic Slider Scale Gauge */}
        <div className="py-8 px-4 bg-slate-950/60 rounded-xl relative" id="analog-dial-stage">
          <div className="relative h-4 bg-slate-800 rounded-full overflow-hidden flex" id="balance-rail">
            <div className="absolute left-[50%] top-0 bottom-0 w-[2px] bg-white z-10" />
            
            {/* Split bar coloring indicator representing weights */}
            <div 
              style={{ width: `${Math.min(50, Math.max(0, 50 + score/2))}%` }}
              className="h-full bg-gradient-to-r from-rose-600 to-amber-500 transition-all duration-300"
            />
            <div 
              style={{ width: `${Math.min(50, Math.max(0, 50 - score/2))}%` }}
              className="h-full bg-gradient-to-l from-emerald-600 to-emerald-400 transition-all duration-300"
            />
          </div>

          {/* Dial Needle */}
          <div 
            style={{ left: `${50 + score/2}%` }}
            className="absolute top-5 h-8 w-2 bg-indigo-400 rounded-md -translate-x-[50%] transition-all duration-300 shadow-[0_0_12px_rgba(129,140,248,0.6)] flex flex-col items-center"
            id="dial-needle"
          >
            <div className="w-4 h-4 bg-indigo-300 rounded-full border-2 border-indigo-600 -mt-2" />
          </div>

          {/* Scale extreme text notations */}
          <div className="flex justify-between items-center mt-6 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5 text-rose-400">
              ◄ CONS DOMINANT ({conSum} Weight)
            </span>
            <div className="text-center font-display font-bold text-base text-indigo-300">
              Score: {score > 0 ? `+${score}` : score}
            </div>
            <span className="flex items-center gap-1.5 text-emerald-400">
              PROS DOMINANT ({proSum} Weight) ►
            </span>
          </div>
        </div>
      </div>

      {/* Grid containing double list columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="pros-cons-grid">
        {/* PROS COLUMN */}
        <div className="space-y-4" id="pros-column">
          <div className="flex justify-between items-center border-b border-emerald-950 pb-2">
            <h4 className="font-display font-semibold text-emerald-400 flex items-center gap-2 text-md">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Reasons To Proceed (Pros)
            </h4>
            <span className="text-xs font-mono text-emerald-500 bg-emerald-950/40 px-2 py-0.5 rounded-md">
              {pros.length} factors
            </span>
          </div>

          {/* Pros List Container */}
          <div className="space-y-3">
            {pros.map((p, index) => (
              <div 
                key={index} 
                className="bg-slate-900 border border-emerald-950/30 hover:border-emerald-900 rounded-xl p-4 transition-all hover:scale-[1.01] group relative"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <p className="font-medium text-slate-100 text-sm">{p.text}</p>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{p.explanation}</p>
                  </div>
                  <button
                    onClick={() => handleDeletePro(index)}
                    className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors lg:opacity-0 group-hover:opacity-100 cursor-pointer"
                    title="Remove Factor"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Weight slider custom widget */}
                <div className="flex items-center gap-3 mt-4 pt-3 border-t border-slate-800/60">
                  <span className="text-[10px] font-mono text-slate-400">IMPACT WEIGHT:</span>
                  <div className="flex gap-1.5 items-center flex-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => updateProImpact(index, level)}
                        className={`h-2.5 flex-1 rounded-sm transition-all cursor-pointer ${
                          level <= p.impact 
                            ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]' 
                            : 'bg-slate-800 hover:bg-slate-750'
                        }`}
                        title={`Weight: ${level}`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-semibold text-emerald-400 font-mono w-4 text-right">
                    {p.impact}
                  </span>
                </div>
              </div>
            ))}

            {pros.length === 0 && (
              <p className="text-xs text-slate-500 text-center py-6 border border-dashed border-slate-800 rounded-xl">
                No Pros remain. Add some below to tip the criteria!
              </p>
            )}

            {/* inline input form for adding a custom pro */}
            <form onSubmit={handleAddPro} className="bg-slate-900/40 border border-dashed border-slate-800 rounded-xl p-4 space-y-3">
              <div className="text-xs font-semibold text-slate-300">Add Custom Pro Reason</div>
              <input
                type="text"
                required
                value={newProDraft}
                onChange={(e) => setNewProDraft(e.target.value)}
                placeholder="Core benefit statement..."
                className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none"
              />
              <input
                type="text"
                value={newProExpl}
                onChange={(e) => setNewProExpl(e.target.value)}
                placeholder="Supporting description/explanation (optional)..."
                className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none"
              />
              <div className="flex justify-between items-center pt-1">
                <div className="flex gap-3 items-center">
                  <span className="text-[10px] font-mono text-slate-500">SET WEIGHT:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setNewProImpact(lvl)}
                        className={`w-5 h-5 rounded flex items-center justify-center text-xs font-mono border cursor-pointer transition-colors ${
                          newProImpact === lvl
                            ? 'bg-emerald-950 border-emerald-500 text-emerald-400'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-slate-100 text-xs font-semibold py-1.5 px-3 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* CONS COLUMN */}
        <div className="space-y-4" id="cons-column">
          <div className="flex justify-between items-center border-b border-rose-950 pb-2">
            <h4 className="font-display font-semibold text-rose-400 flex items-center gap-2 text-md">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              Pitfalls & Roadblocks (Cons)
            </h4>
            <span className="text-xs font-mono text-rose-500 bg-rose-950/40 px-2 py-0.5 rounded-md">
              {cons.length} factors
            </span>
          </div>

          {/* Cons List Container */}
          <div className="space-y-3">
            {cons.map((c, index) => (
              <div 
                key={index} 
                className="bg-slate-900 border border-rose-950/30 hover:border-rose-900 rounded-xl p-4 transition-all hover:scale-[1.01] group relative"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <p className="font-medium text-slate-100 text-sm">{c.text}</p>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{c.explanation}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteCon(index)}
                    className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors lg:opacity-0 group-hover:opacity-100 cursor-pointer"
                    title="Remove Factor"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Weight slider custom widget */}
                <div className="flex items-center gap-3 mt-4 pt-3 border-t border-slate-800/60">
                  <span className="text-[10px] font-mono text-slate-400">HAZARD SEVERITY:</span>
                  <div className="flex gap-1.5 items-center flex-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => updateConImpact(index, level)}
                        className={`h-2.5 flex-1 rounded-sm transition-all cursor-pointer ${
                          level <= c.impact 
                            ? 'bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.3)]' 
                            : 'bg-slate-800 hover:bg-slate-750'
                        }`}
                        title={`Severity: ${level}`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-semibold text-rose-400 font-mono w-4 text-right">
                    {c.impact}
                  </span>
                </div>
              </div>
            ))}

            {cons.length === 0 && (
              <p className="text-xs text-slate-500 text-center py-6 border border-dashed border-slate-800 rounded-xl">
                No Cons remain! All skies appear clear.
              </p>
            )}

            {/* inline input form for adding a custom con */}
            <form onSubmit={handleAddCon} className="bg-slate-900/40 border border-dashed border-slate-800 rounded-xl p-4 space-y-3">
              <div className="text-xs font-semibold text-slate-300">Add Custom Con Reason</div>
              <input
                type="text"
                required
                value={newConDraft}
                onChange={(e) => setNewConDraft(e.target.value)}
                placeholder="Core hazard or drawback statement..."
                className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none"
              />
              <input
                type="text"
                value={newConExpl}
                onChange={(e) => setNewConExpl(e.target.value)}
                placeholder="Supporting description/explanation (optional)..."
                className="w-full bg-slate-950 border border-slate-850 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none"
              />
              <div className="flex justify-between items-center pt-1">
                <div className="flex gap-3 items-center">
                  <span className="text-[10px] font-mono text-slate-500">SET SEVERITY:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setNewConImpact(lvl)}
                        className={`w-5 h-5 rounded flex items-center justify-center text-xs font-mono border cursor-pointer transition-colors ${
                          newConImpact === lvl
                            ? 'bg-rose-950 border-rose-500 text-rose-400'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  type="submit"
                  className="bg-rose-600 hover:bg-rose-500 text-slate-100 text-xs font-semibold py-1.5 px-3 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Narrative block */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl" id="pros-cons-ai-verdict-box">
        <h4 className="font-display font-semibold text-slate-100 flex items-center gap-2 mb-3 text-sm">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          AI Strategic Verdict Summary
        </h4>
        <div className="text-sm text-slate-350 leading-relaxed space-y-4" id="verdict-narrative">
          <p>{initialAnalysis.conclusion}</p>
        </div>
        <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
          <span>Analysis Confidence:</span>
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
