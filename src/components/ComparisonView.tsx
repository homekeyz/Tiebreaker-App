import React, { useState, useEffect } from 'react';
import { RotateCcw, Copy, Check, Sparkles, Trophy, Star } from 'lucide-react';
import { ComparisonAnalysis } from '../types';

interface ComparisonViewProps {
  initialAnalysis: ComparisonAnalysis;
  onSaveModified: (modified: ComparisonAnalysis) => void;
  decisionTitle: string;
}

export default function ComparisonView({ initialAnalysis, onSaveModified, decisionTitle }: ComparisonViewProps) {
  const [options, setOptions] = useState(initialAnalysis.options || []);
  const [criteria, setCriteria] = useState(initialAnalysis.criteria || []);
  const [copied, setCopied] = useState(false);

  // Sync states if the backend response changes
  useEffect(() => {
    setOptions(initialAnalysis.options || []);
    setCriteria(initialAnalysis.criteria || []);
  }, [initialAnalysis]);

  // Recalculating combined final scores dynamically (0-100 scale)
  const getDynamicScores = () => {
    const scoresMap: Record<string, number> = {};
    
    // Default to 0
    options.forEach(opt => {
      scoresMap[opt] = 0;
    });

    if (criteria.length === 0) return scoresMap;

    // Sum scores for each option
    criteria.forEach(crit => {
      options.forEach(opt => {
        scoresMap[opt] += (crit.scores[opt] ?? 5);
      });
    });

    // Translate to 0-100 percentage based on maximum possible score (criteria.length * 10)
    const maxPossible = criteria.length * 10;
    options.forEach(opt => {
      scoresMap[opt] = maxPossible > 0 ? Math.round((scoresMap[opt] / maxPossible) * 100) : 0;
    });

    return scoresMap;
  };

  const currentScores = getDynamicScores();

  // Find Winner
  const getWinner = () => {
    let topOption = options[0] || 'None';
    let topScore = -1;
    
    options.forEach(opt => {
      if ((currentScores[opt] ?? 0) > topScore) {
        topScore = currentScores[opt];
        topOption = opt;
      }
    });

    const isTie = options.filter(opt => currentScores[opt] === topScore).length > 1;

    return {
      option: topOption,
      score: topScore,
      isTie
    };
  };

  const winner = getWinner();

  // Handles slider modifications dynamically! Highly interactive
  const handleScoreChange = (critIdx: number, optionName: string, nextScore: number) => {
    const updatedCriteria = [...criteria];
    if (updatedCriteria[critIdx]) {
      updatedCriteria[critIdx] = {
        ...updatedCriteria[critIdx],
        scores: {
          ...updatedCriteria[critIdx].scores,
          [optionName]: nextScore
        }
      };
      setCriteria(updatedCriteria);
      
      // Compute raw updated scores matching types.ts schema format
      const scoresMap: Record<string, number> = {};
      options.forEach(opt => {
        scoresMap[opt] = 0;
      });
      updatedCriteria.forEach(crit => {
        options.forEach(opt => {
          scoresMap[opt] += (crit.scores[opt] ?? 5);
        });
      });
      const maxPossible = updatedCriteria.length * 10;
      options.forEach(opt => {
        scoresMap[opt] = maxPossible > 0 ? Math.round((scoresMap[opt] / maxPossible) * 100) : 0;
      });

      onSaveModified({
        options,
        criteria: updatedCriteria,
        conclusion: initialAnalysis.conclusion,
        finalScores: scoresMap,
        confidenceRating: initialAnalysis.confidenceRating
      });
    }
  };

  const handleReset = () => {
    if (window.confirm("Undo manual adjustments and restore AI defaults?")) {
      setOptions(initialAnalysis.options || []);
      setCriteria(initialAnalysis.criteria || []);
      onSaveModified(initialAnalysis);
    }
  };

  const handleCopyReport = () => {
    const reportText = `THE TIEBREAKER SIDE-BY-SIDE MATRIX REPORT: ${decisionTitle}

[WINNER DETECTED]: ${winner.isTie ? 'Tie Decided' : `${winner.option} (Rating Score: ${winner.score}/100)`}

[OPTION LEADERBOARD]:
${options.map(opt => `- ${opt}: ${currentScores[opt]}/100`).join('\n')}

[CRITERIA GRADING SCOREBOARD]:
${criteria.map(crit => {
  return `\n* Category: ${crit.name}\n` + options.map(opt => `  - ${opt}: ${crit.scores[opt]}/10  (${crit.details[opt] || 'N/A'})`).join('\n');
}).join('\n')}

[STRATEGIC SUMMARY]:
${initialAnalysis.conclusion}`;

    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6" id="comparison-view-stage">
      {/* Decisively Declaring the Champ */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden" id="matrix-winner-banner">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400">RECOMMENDED PATHWAY:</div>
              <h3 className="text-xl font-display font-bold text-slate-100 flex items-center gap-2 mt-0.5">
                {winner.isTie ? (
                  <span className="text-amber-400">Deadlock Matrix!</span>
                ) : (
                  <span>Go with <span className="text-indigo-400">{winner.option}</span></span>
                )}
                <span className="text-xs bg-slate-800 px-2 py-0.5 rounded text-indigo-300 font-mono">
                  {winner.isTie ? 'Tie' : `Weighted ${winner.score}%`}
                </span>
              </h3>
            </div>
          </div>

          <div className="flex gap-2 items-center w-full md:w-auto">
            <button
              onClick={handleCopyReport}
              className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-slate-100 transition-colors flex items-center gap-2 text-xs font-semibold cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied Report' : 'Copy Breakdown'}
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

        {/* Dynamic score summary meter */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-800/80">
          {options.map((opt, idx) => {
            const isWinner = opt === winner.option && !winner.isTie;
            const scorePercent = currentScores[opt] ?? 0;
            return (
              <div 
                key={idx} 
                className={`p-4 rounded-xl border transition-all ${
                  isWinner 
                    ? 'bg-indigo-500/5 border-indigo-500/20' 
                    : 'bg-slate-950/40 border-slate-850'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-sm text-slate-200 flex items-center gap-1.5">
                    {isWinner && <Star className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400" />}
                    {opt}
                  </span>
                  <span className="text-xs font-mono font-semibold text-slate-300">
                    {scorePercent}% Avg
                  </span>
                </div>
                <div className="w-full bg-slate-800/60 h-2 rounded-full overflow-hidden">
                  <div 
                    style={{ width: `${scorePercent}%` }}
                    className={`h-full transition-all duration-300 ${isWinner ? 'bg-indigo-500' : 'bg-slate-550'}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Side-by-Side Factor Comparison Matrix Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl" id="comparison-matrix-table">
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900 flex justify-between items-center">
          <h4 className="font-display font-semibold text-sm text-slate-100">
            Side-By-Side Criteria Scoreboard
          </h4>
          <span className="text-xs text-slate-400">Click & Drag sliders to adjust grades</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/40">
                <th className="py-4 px-6 text-xs font-mono uppercase tracking-wider text-slate-400 w-1/4">Criteria Category</th>
                {options.map((opt, idx) => (
                  <th key={idx} className="py-4 px-6 text-xs font-mono uppercase tracking-wider text-slate-100 min-w-[200px]">
                    <span className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                      {opt}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850/80">
              {criteria.map((crit, critIdx) => (
                <tr key={critIdx} className="hover:bg-slate-950/20 transition-all">
                  {/* Category Details */}
                  <td className="py-5 px-6">
                    <span className="font-medium text-slate-200 text-sm">{crit.name}</span>
                  </td>

                  {/* Options Scoring Column cells */}
                  {options.map((opt, optIdx) => {
                    const optionScore = crit.scores[opt] ?? 5;
                    const explanationText = crit.details[opt] || '';
                    return (
                      <td key={optIdx} className="py-5 px-6 space-y-2">
                        {/* Interactive Slider */}
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min="1"
                            max="10"
                            value={optionScore}
                            onChange={(e) => handleScoreChange(critIdx, opt, parseInt(e.target.value))}
                            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                          />
                          <span className="text-xs font-mono font-bold text-slate-300 w-5 text-right">
                            {optionScore}
                          </span>
                        </div>
                        
                        {/* Inline Supporting custom text or detail */}
                        {explanationText && (
                          <p className="text-xs text-slate-400 italic bg-slate-950/50 p-2 rounded border border-slate-850 leading-relaxed font-sans">
                            {explanationText}
                          </p>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Synthesis Verdict conclusion text */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl" id="matrix-conclusion-box">
        <h4 className="font-display font-semibold text-slate-100 flex items-center gap-1.5 mb-3 text-sm">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          AI Synthesis & Recommendation
        </h4>
        <p className="text-sm text-slate-350 leading-relaxed">
          {initialAnalysis.conclusion}
        </p>
        <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
          <span>Decision Confidence Level:</span>
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
