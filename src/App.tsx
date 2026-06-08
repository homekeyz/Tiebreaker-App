import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Star, 
  Sparkles, 
  Scale, 
  Columns, 
  Grid, 
  Compass, 
  TrendingUp, 
  CheckCircle2, 
  HelpCircle, 
  Share2, 
  ChevronRight,
  AlertOctagon,
  Clock,
  History
} from 'lucide-react';
import { Decision, DecisionType, ProsConsAnalysis, ComparisonAnalysis, SWOTAnalysis } from './types';
import DecisionForm from './components/DecisionForm';
import ProsConsView from './components/ProsConsView';
import ComparisonView from './components/ComparisonView';
import SwotView from './components/SwotView';

// Pre-seeded high fidelity decision examples to give the user an amazing immediate impression
const SEED_DECISIONS: Decision[] = [
  {
    id: 'tokyo-relocation-swot',
    title: 'Relocate to Tokyo for the Senior Creative Lead position?',
    context: 'Extra ¥2,400,000 JPY salary delta. Commute drops by 15min. But I only know casual beginner Japanese and am far from immediate family.',
    type: 'swot',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(), // 1 day ago
    isFavorite: true,
    swot: {
      strengths: [
        { point: 'Massive career jump with international exposure', significance: 'Pivotal prestige multiplier for portfolio' },
        { point: 'World-class public transportation system', significance: 'Zero car costs and extreme daily reliability' },
        { point: 'Safety and high standard of healthcare', significance: 'Peace of mind and low personal medical overhead' }
      ],
      weaknesses: [
        { point: 'Significant distance from immediate family', significance: 'Potential emotional strain and travel expense' },
        { point: 'High initial administrative overhead for housing', significance: 'Tedious guarantor and deposit paperwork' },
        { point: 'Steep learning curve for corporate cultural etiquette', significance: 'High professional caution required initially' }
      ],
      opportunities: [
        { point: 'Chance to become fluent in a third language', strategy: 'Enroll in immersive pre-departure study language course' },
        { point: 'Proximity to major Asian design Hubs', strategy: 'Schedule regional design meetups in Tokyo and Seoul' }
      ],
      threats: [
        { point: 'Potential burnout due to rigid work-hours culture', mitigation: 'Establish clear personal weekend/evening downtime guidelines' },
        { point: 'Social isolation in the first 6-12 months', mitigation: 'Join international expat and local interest-based hobby groups' }
      ],
      conclusion: 'The relocation is a highly asymmetrical positive risk. While social friction and isolation are genuine factors, the career growth, structured JPY safety, and regional networking reach far exceed the transient adjustment difficulties. Establish clear personal downtime guardrails immediately upon landing.',
      strategicAction: 'Acquire JST-focused business vocabulary and mandate a 4-week pre-departure language course.',
      confidenceRating: 94
    }
  },
  {
    id: 'commute-car-comparison',
    title: 'Choose the best commuter car path',
    context: 'Commute is 45 mins. Budget ceiling is $48,000. Grid electricity pricing at home is rising, but office charging is completely free.',
    type: 'comparison-table',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(), // 4 hrs ago
    isFavorite: false,
    comparison: {
      options: ['EV Sedan', 'Hybrid Hatchback', 'Used Gas Coupe'],
      criteria: [
        {
          name: 'Upfront Acquisition Cost',
          scores: { 'EV Sedan': 4, 'Hybrid Hatchback': 8, 'Used Gas Coupe': 10 },
          details: { 'EV Sedan': 'Expensive premium MSRP', 'Hybrid Hatchback': 'Moderate MSRP', 'Used Gas Coupe': 'Low cash purchase' }
        },
        {
          name: 'Fuel / Energy Operating Cost',
          scores: { 'EV Sedan': 10, 'Hybrid Hatchback': 8, 'Used Gas Coupe': 3 },
          details: { 'EV Sedan': 'Free workplace charging!', 'Hybrid Hatchback': '52 MPG economy', 'Used Gas Coupe': 'Premium gas required' }
        },
        {
          name: 'Maintenance and Warranty',
          scores: { 'EV Sedan': 9, 'Hybrid Hatchback': 7, 'Used Gas Coupe': 4 },
          details: { 'EV Sedan': '8-yr full battery warranty', 'Hybrid Hatchback': 'Standard brand warranty', 'Used Gas Coupe': 'High upkeep risk' }
        },
        {
          name: 'Resale & Depreciation',
          scores: { 'EV Sedan': 5, 'Hybrid Hatchback': 9, 'Used Gas Coupe': 6 },
          details: { 'EV Sedan': 'High EV tech depreciation', 'Hybrid Hatchback': 'Extremely high demand', 'Used Gas Coupe': 'Flat depreciation curve' }
        }
      ],
      conclusion: 'While the Gas Coupe is cheap to buy, its operating liability is too high. The EV Sedan represents the ultimate long-term commuter choice because of free office charging, but the Hybrid Hatchbacks low depreciation and reliable pricing makes it the safest financial tiebreaker.',
      finalScores: { 'EV Sedan': 70, 'Hybrid Hatchback': 80, 'Used Gas Coupe': 57 },
      confidenceRating: 88
    }
  }
];

export default function App() {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [activeDecisionId, setActiveDecisionId] = useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<DecisionType>('swot');

  // Load from local storage or pre-seed
  useEffect(() => {
    const cached = localStorage.getItem('THE_TIEBREAKER_DECIS');
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as Decision[];
        setDecisions(parsed);
        if (parsed.length > 0) {
          setActiveDecisionId(parsed[0].id);
          setActiveTab(parsed[0].type);
        } else {
          setIsCreatingNew(true);
        }
      } catch (e) {
        setDecisions(SEED_DECISIONS);
        setActiveDecisionId(SEED_DECISIONS[0].id);
        setActiveTab(SEED_DECISIONS[0].type);
      }
    } else {
      setDecisions(SEED_DECISIONS);
      setActiveDecisionId(SEED_DECISIONS[0].id);
      setActiveTab(SEED_DECISIONS[0].type);
      localStorage.setItem('THE_TIEBREAKER_DECIS', JSON.stringify(SEED_DECISIONS));
    }
  }, []);

  // Save changes to localStorage helper
  const updateCachedDecisions = (updatedList: Decision[]) => {
    setDecisions(updatedList);
    localStorage.setItem('THE_TIEBREAKER_DECIS', JSON.stringify(updatedList));
  };

  const getActiveDecision = (): Decision | undefined => {
    return decisions.find(d => d.id === activeDecisionId);
  };

  const activeDecision = getActiveDecision();

  // Handle running a new Tiebreaker analysis from the form
  const handleRunAnalysis = async (title: string, context: string, type: DecisionType, optionsList: string[]) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          context,
          type,
          options: optionsList
        })
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Server error sifting factors.');
      }

      const resultPayload = data.result;

      // Construct a new Decision model
      const newDecision: Decision = {
        id: `decision-${Date.now()}`,
        title,
        context,
        type,
        createdAt: new Date().toISOString(),
        isFavorite: false,
        // Insert formatting data
        prosCons: type === 'pros-cons' ? resultPayload : undefined,
        comparison: type === 'comparison-table' ? resultPayload : undefined,
        swot: type === 'swot' ? resultPayload : undefined,
      };

      const updatedList = [newDecision, ...decisions];
      updateCachedDecisions(updatedList);
      setActiveDecisionId(newDecision.id);
      setActiveTab(type);
      setIsCreatingNew(false);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'An unexpected issue occurred while analyzing with AI. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Run another analysis framework for the currently selected dilemma
  const handlePivotedAnalysis = async (targetType: DecisionType) => {
    if (!activeDecision) return;
    setIsLoading(true);
    setErrorMessage(null);

    // If comparing options, try to carry them over
    const optionsToCompare = activeDecision.comparison?.options || ['Option A', 'Option B'];

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: activeDecision.title,
          context: activeDecision.context,
          type: targetType,
          options: optionsToCompare
        })
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Failed sifting alternative framework.');
      }

      const resultPayload = data.result;

      // Modify the currently active decision with the newly generated analysis
      const updatedList = decisions.map(d => {
        if (d.id === activeDecision.id) {
          return {
            ...d,
            [targetType === 'pros-cons' ? 'prosCons' : targetType === 'comparison-table' ? 'comparison' : 'swot']: resultPayload
          };
        }
        return d;
      });

      updateCachedDecisions(updatedList);
      setActiveTab(targetType);
    } catch (err: any) {
      setErrorMessage(err.message || 'Alternative analysis could not be retrieved.');
    } finally {
      setIsLoading(false);
    }
  };

  // Update a modified analysis (slider changes, deletes, etc)
  const handleSaveModifiedAnalysis = (updatedAnalysisData: any) => {
    if (!activeDecision) return;
    const updatedList = decisions.map(d => {
      if (d.id === activeDecision.id) {
        if (activeTab === 'pros-cons') {
          return { ...d, prosCons: updatedAnalysisData };
        } else if (activeTab === 'comparison-table') {
          return { ...d, comparison: updatedAnalysisData };
        } else if (activeTab === 'swot') {
          return { ...d, swot: updatedAnalysisData };
        }
      }
      return d;
    });
    updateCachedDecisions(updatedList);
  };

  // Delete decision
  const handleDeleteDecision = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Permanently delete this decision review?")) {
      const updated = decisions.filter(d => d.id !== id);
      updateCachedDecisions(updated);
      
      if (activeDecisionId === id) {
        if (updated.length > 0) {
          setActiveDecisionId(updated[0].id);
          setActiveTab(updated[0].type);
        } else {
          setActiveDecisionId(null);
          setIsCreatingNew(true);
        }
      }
    }
  };

  // Toggle favorite status
  const handleToggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = decisions.map(d => {
      if (d.id === id) {
        return { ...d, isFavorite: !d.isFavorite };
      }
      return d;
    });
    updateCachedDecisions(updated);
  };

  return (
    <div className="w-full h-screen bg-[#0d0d0f] text-slate-205 flex flex-col overflow-hidden font-sans select-none" id="the-tiebreaker-app">
      {/* 1. HEADER (Direct matching layout from Elegant Dark prompt) */}
      <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-[#0d0d0f] shrink-0" id="app-header">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center font-bold text-white italic text-lg shadow-lg shadow-indigo-900/30">
            T
          </div>
          <h1 className="text-xl font-display font-semibold tracking-tight text-white flex items-center gap-2">
            The Tiebreaker
            <span className="text-[10px] bg-indigo-950 text-indigo-400 border border-indigo-900 px-2 py-0.5 rounded-full font-mono">
              AI Decision Coach
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-6 text-sm font-medium text-gray-400" id="header-nav-actions">
          <button 
            onClick={() => {
              setIsCreatingNew(false);
              if (decisions.length > 0) {
                setActiveDecisionId(decisions[0].id);
                setActiveTab(decisions[0].type);
              }
            }}
            className={`cursor-pointer transition-colors ${!isCreatingNew ? 'text-indigo-400' : 'hover:text-white'}`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => {
              setIsCreatingNew(true);
            }} 
            className={`flex items-center gap-1 cursor-pointer transition-colors ${isCreatingNew ? 'text-indigo-400 animate-pulse' : 'hover:text-white'}`}
          >
            <Plus className="w-4 h-4 text-indigo-500" /> New Decision
          </button>
          
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-xs font-semibold text-indigo-200" title="User Profile">
            {localStorage.getItem('THE_TIEBREAKER_USER_INITIAL') || 'AI'}
          </div>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* Left Aside Panel: Decision List Directory (Elegant Dark Styling) */}
        <aside className="w-80 border-r border-white/5 p-6 flex flex-col gap-6 bg-[#0f0f12] shrink-0 overflow-y-auto" id="left-sidebar">
          
          {/* Quick Create Button */}
          <button 
            onClick={() => setIsCreatingNew(true)}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-950/40 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Analyse New Dilemma
          </button>

          {/* Current Selection / Mini parameters */}
          {activeDecision && !isCreatingNew && (
            <section className="space-y-3">
              <label className="text-[10px] uppercase tracking-[0.15em] text-gray-500 font-bold block">
                Current Dilemma
              </label>
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl relative overflow-hidden">
                <p className="text-sm font-display leading-snug text-white font-medium">
                  "{activeDecision.title}"
                </p>
                {activeDecision.context && (
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed line-clamp-3">
                    {activeDecision.context}
                  </p>
                )}
              </div>
            </section>
          )}

          {/* Decision Navigation History */}
          <section className="flex-1 flex flex-col min-h-0">
            <div className="flex justify-between items-center mb-3">
              <label className="text-[10px] uppercase tracking-[0.15em] text-gray-500 font-bold block">
                Decision Library
              </label>
              <span className="text-[10px] text-indigo-400 font-mono font-bold bg-indigo-950/40 px-1.5 rounded">
                {decisions.length} saved
              </span>
            </div>

            <div className="space-y-2 overflow-y-auto flex-1 pr-1" id="history-box">
              {decisions.map((dec) => {
                const isActive = dec.id === activeDecisionId && !isCreatingNew;
                return (
                  <div
                    key={dec.id}
                    onClick={() => {
                      setActiveDecisionId(dec.id);
                      setIsCreatingNew(false);
                      // Set default visual tab to whichever is available
                      if (dec.swot) setActiveTab('swot');
                      else if (dec.comparison) setActiveTab('comparison-table');
                      else if (dec.prosCons) setActiveTab('pros-cons');
                    }}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex justify-between items-start gap-2 ${
                      isActive
                        ? 'bg-indigo-650/10 border-indigo-500/30 hover:border-indigo-500/50'
                        : 'bg-white/2 border-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className={`text-xs font-medium font-sans truncate ${isActive ? 'text-indigo-350 font-semibold' : 'text-slate-300'}`}>
                        {dec.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500 font-mono">
                        <span>{dec.type === 'swot' ? 'SWOT' : dec.type === 'comparison-table' ? 'Matrix' : 'Pros & Cons'}</span>
                        <span>•</span>
                        <span>{new Date(dec.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => handleToggleFavorite(dec.id, e)}
                        className="p-1 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                        title={dec.isFavorite ? 'Unfavorite' : 'Favorite'}
                      >
                        <Star className={`w-3.5 h-3.5 ${dec.isFavorite ? 'text-amber-400 fill-amber-400' : 'text-slate-600 hover:text-slate-400'}`} />
                      </button>
                      <button
                        onClick={(e) => handleDeleteDecision(dec.id, e)}
                        className="p-1 hover:bg-slate-800 rounded text-slate-600 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Delete decision record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {decisions.length === 0 && (
                <div className="text-center py-8 text-xs text-slate-500 font-sans border border-dashed border-white/5 rounded-xl">
                  Your Decision Library is empty. Click "+ Analyse New Dilemma" to build your first tiebreaker assessment.
                </div>
              )}
            </div>
          </section>
        </aside>

        {/* Right Section Panel: Variable Framework Port / Loading & Display (Elegant Grid) */}
        <section className="flex-1 flex flex-col overflow-y-auto bg-[#0d0d0f] relative" id="right-workspace">
          
          {/* AI Busy Overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-16 h-16 border-4 border-slate-700 border-t-indigo-500 rounded-full animate-spin mb-4 shadow-[0_0_15px_rgba(99,102,241,0.2)]" />
              <h3 className="text-lg font-display font-semibold text-slate-100">Consulting Logical Frameworks...</h3>
              <p className="text-xs text-slate-400 max-w-sm mt-1.5 leading-relaxed">
                Our AI coach is weighting the trade-offs, calculating critical thresholds, and looking for optimal pivot points.
              </p>
              <div className="w-48 bg-slate-800 h-1.5 rounded-full mt-4 overflow-hidden">
                <div className="h-full bg-indigo-500 animate-[pulse_1.5s_infinite]" style={{ width: '100%' }} />
              </div>
            </div>
          )}

          {/* Error Message banner */}
          {errorMessage && (
            <div className="p-4 m-6 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3 text-sm text-slate-300">
              <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold text-rose-300 block mb-1">Analysis Error</span>
                <p className="leading-relaxed text-xs">{errorMessage}</p>
                <p className="mt-2 text-xs text-slate-400">
                  Tip: Ensure your <span className="text-slate-200 font-semibold font-mono">GEMINI_API_KEY</span> is active and correctly added to your environment variables in <span className="text-slate-100 font-semibold">Settings &gt; Secrets</span>.
                </p>
              </div>
            </div>
          )}

          {/* ACTIVE DISCOVERY / INPUT CONTAINER */}
          {isCreatingNew ? (
            <div className="p-8 max-w-4xl mx-auto w-full">
              <div className="mb-6 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-display font-bold text-white">The Tiebreaker Formulation</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Describe your deadlock pathway to evaluate it under mathematical weighing rules.
                  </p>
                </div>
                {decisions.length > 0 && (
                  <button 
                    onClick={() => setIsCreatingNew(false)}
                    className="text-xs text-slate-400 hover:text-slate-200 py-1.5 px-3 bg-slate-900 border border-slate-800 rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>
              <DecisionForm onSubmit={handleRunAnalysis} isLoading={isLoading} />
            </div>
          ) : activeDecision ? (
            <div className="flex flex-col h-full">
              {/* View Switcher Tabs (Directly matching exact style parameters of Elegant Dark prompt) */}
              <div className="px-8 pt-6 border-b border-white/5 flex gap-8 select-none bg-[#0d0d0f]" id="tab-switcher">
                <button 
                  onClick={() => setActiveTab('swot')}
                  className={`pb-4 text-sm font-medium border-b-2 tracking-tight transition-all cursor-pointer ${
                    activeTab === 'swot' 
                      ? 'border-indigo-500 text-white' 
                      : 'border-transparent text-gray-500 hover:text-gray-300'
                  }`}
                >
                  SWOT Analysis
                </button>
                <button 
                  onClick={() => setActiveTab('comparison-table')}
                  className={`pb-4 text-sm font-medium border-b-2 tracking-tight transition-all cursor-pointer ${
                    activeTab === 'comparison-table' 
                      ? 'border-indigo-500 text-white' 
                      : 'border-transparent text-gray-500 hover:text-gray-300'
                  }`}
                >
                  Comparison Table
                </button>
                <button 
                  onClick={() => setActiveTab('pros-cons')}
                  className={`pb-4 text-sm font-medium border-b-2 tracking-tight transition-all cursor-pointer ${
                    activeTab === 'pros-cons' 
                      ? 'border-indigo-500 text-white' 
                      : 'border-transparent text-gray-500 hover:text-gray-300'
                  }`}
                >
                  Pros & Cons List
                </button>
              </div>

              {/* Analysis Viewport Area (Elegant Grid viewport mapping) */}
              <div className="p-8 flex-1 max-w-6xl w-full mx-auto" id="viewport-workspace">
                
                {/* DYNAMIC RENDERING based on active layout tab availability */}
                {activeTab === 'swot' && (
                  activeDecision.swot ? (
                    <SwotView 
                      initialAnalysis={activeDecision.swot} 
                      onSaveModified={handleSaveModifiedAnalysis} 
                      decisionTitle={activeDecision.title}
                    />
                  ) : (
                    <div className="py-12 px-6 text-center border border-dashed border-white/10 rounded-2xl max-w-md mx-auto mt-10">
                      <Grid className="w-10 h-10 text-indigo-400 mx-auto mb-3" />
                      <h3 className="text-md font-semibold text-slate-100 font-display">SWOT Not Yet Run</h3>
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                        Do you want to run a complete Strategic Strengths, Weaknesses, Opportunities, and Threats sweep for this decision?
                      </p>
                      <button
                        onClick={() => handlePivotedAnalysis('swot')}
                        className="mt-5 px-4 py-2 bg-indigo-650 hover:bg-indigo-600 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                      >
                        Generate SWOT Analysis
                      </button>
                    </div>
                  )
                )}

                {activeTab === 'comparison-table' && (
                  activeDecision.comparison ? (
                    <ComparisonView 
                      initialAnalysis={activeDecision.comparison} 
                      onSaveModified={handleSaveModifiedAnalysis} 
                      decisionTitle={activeDecision.title}
                    />
                  ) : (
                    <div className="py-12 px-6 text-center border border-dashed border-white/10 rounded-2xl max-w-md mx-auto mt-10">
                      <Columns className="w-10 h-10 text-indigo-400 mx-auto mb-3" />
                      <h3 className="text-md font-semibold text-slate-100 font-display">Comparison Table Not Yet Run</h3>
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed text-balance">
                        Evaluate alternative paths side-by-side. Excellent for deciding between multiple routes.
                      </p>
                      <button
                        onClick={() => handlePivotedAnalysis('comparison-table')}
                        className="mt-5 px-4 py-2 bg-indigo-650 hover:bg-indigo-600 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                      >
                        Generate Comparison Table
                      </button>
                    </div>
                  )
                )}

                {activeTab === 'pros-cons' && (
                  activeDecision.prosCons ? (
                    <ProsConsView 
                      initialAnalysis={activeDecision.prosCons} 
                      onSaveModified={handleSaveModifiedAnalysis} 
                      decisionTitle={activeDecision.title}
                    />
                  ) : (
                    <div className="py-12 px-6 text-center border border-dashed border-white/10 rounded-2xl max-w-md mx-auto mt-10">
                      <Scale className="w-10 h-10 text-indigo-400 mx-auto mb-3" />
                      <h3 className="text-md font-semibold text-slate-100 font-display">Pros & Cons Scale Not Yet Run</h3>
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                        Explore the weighted reasons for and against committing to this specific decision.
                      </p>
                      <button
                        onClick={() => handlePivotedAnalysis('pros-cons')}
                        className="mt-5 px-4 py-2 bg-indigo-650 hover:bg-indigo-600 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                      >
                        Generate Pros & Cons Scale
                      </button>
                    </div>
                  )
                )}

              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-md mx-auto text-center">
              <Compass className="w-12 h-12 text-indigo-400 animate-pulse mb-4" />
              <h3 className="text-xl font-display font-semibold text-white">Formulate Your Dilemma</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Break deadlock ties by loading one of our seeded templates or formulating a brand new personal dilemma query.
              </p>
              <button 
                onClick={() => setIsCreatingNew(true)}
                className="mt-6 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Assemble New Dilemma
              </button>
            </div>
          )}
        </section>
      </main>

      {/* 3. FOOTER INFO BAR (Direct matching layout from Elegant Dark prompt) */}
      <footer className="h-12 border-t border-white/5 px-8 flex items-center justify-between text-[11px] text-gray-500 bg-[#0d0d0f] shrink-0" id="app-footer">
        <div className="flex gap-6">
          <span>AI Confidence Score: <span className="text-indigo-400 font-bold">{activeDecision ? (activeDecision.swot?.confidenceRating || activeDecision.comparison?.confidenceRating || activeDecision.prosCons?.confidenceRating || 90) : 100}%</span></span>
          <span>Analysis Depth: <span className="text-gray-300 font-mono">Deep Logical Sift</span></span>
        </div>
        <div className="flex gap-4">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]"></span> 
            Decision logic engines online
          </span>
          <span className="hover:text-white cursor-pointer transition-colors">Framework Rules</span>
          <span className="hover:text-white cursor-pointer transition-colors">Privacy Shield</span>
        </div>
      </footer>
    </div>
  );
}
