export interface COAScenario {
  name: string;
  situation: string;
  coursesOfAction: CourseOfAction[];
}

export interface CourseOfAction {
  id: string;
  name: string;
  summary: string;
  risk: string;
  reward: string;
  recommendationScore: number;
}

export interface ChatMessage {
  timestamp: string;
  type: 'user_query' | 'ai_response';
  details: {
    query?: string;
    question?: string;
    response?: XAIExplanation;
  };
}

export interface XAIExplanation {
  defaultTab?: 'insight' | 'reasoning' | 'projection';
  response: string;
  insight: {
    text: string;
    lime?: string[];
  };
  reasoning: {
    text: string;
    dag?: DAGData;
    shap?: Record<string, number>;
  };
  projection: {
    text: string;
    alternatives?: AlternativeOutcome[];
  };
  confidence?: number;
  suggestedPrompts?: string[];
}

export interface DAGData {
  nodes: Array<{ id: string; label: string }>;
  edges: Array<{ from: string; to: string }>;
}

export interface AlternativeOutcome {
  title: string;
  details: string;
}

export type TabType = 'insight' | 'reasoning' | 'projection';