export type DecisionType = 'pros-cons' | 'comparison-table' | 'swot';

export interface ProsConsAnalysis {
  pros: { text: string; impact: number; explanation: string }[];
  cons: { text: string; impact: number; explanation: string }[];
  conclusion: string;
  tiebreakerScore: number; // calculated scale e.g. -10 to 10 or 0-100 indicating tilt
  confidenceRating: number; // 0 to 100%
}

export interface ComparisonCriterion {
  name: string; // e.g. "Cost", "Flexibility", "Time Commitment"
  scores: Record<string, number>; // Maps option name -> score 1-10
  details: Record<string, string>; // Maps option name -> short detail text
}

export interface ComparisonAnalysis {
  options: string[];
  criteria: ComparisonCriterion[];
  conclusion: string;
  finalScores: Record<string, number>; // Maps option name -> final score (0-100)
  confidenceRating: number;
}

export interface SWOTAnalysis {
  strengths: { point: string; significance: string }[];
  weaknesses: { point: string; significance: string }[];
  opportunities: { point: string; strategy: string }[];
  threats: { point: string; mitigation: string }[];
  conclusion: string;
  strategicAction: string; // Actionable recommendation
  confidenceRating: number;
}

export interface Decision {
  id: string;
  title: string;
  context?: string;
  type: DecisionType;
  createdAt: string;
  isFavorite?: boolean;
  
  // Format-specific outputs
  prosCons?: ProsConsAnalysis;
  comparison?: ComparisonAnalysis;
  swot?: SWOTAnalysis;
}

export interface AnalysisRequest {
  title: string;
  context?: string;
  type: DecisionType;
  options?: string[]; // optionally supplied for comparison
}
