import { useState, useEffect } from 'react';
import { XAIExplanation, TabType, COAScenario } from '../types';
import { defaultScenario } from '../data/scenarios';

export const useXAI = (scenario: COAScenario = defaultScenario) => {
  const [currentExplanation, setCurrentExplanation] = useState<XAIExplanation>({} as XAIExplanation);
  const [activeTab, setActiveTab] = useState<TabType>('insight');
  const [confidence, setConfidence] = useState(0);
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([]);

  useEffect(() => {
    const recommendedCOA = scenario.coursesOfAction.find(coa => coa.id === 'coa2');
    if (!recommendedCOA) return;

    const initialExplanation: XAIExplanation = {
      response: `System online. Analyzing COAs for: "${scenario.situation}". Recommendation is ${recommendedCOA.name}.`,
      insight: {
        text: `• The primary insight is the AI's preference for COA 2 (Intercept) with a score of ${recommendedCOA.recommendationScore} out of 100.\n• COA 1 (Monitor) is seen as too passive, while COA 3 (Neutralize) is excessively risky.`,
        lime: ["risk", "reward"]
      },
      reasoning: {
        text: "• The recommendation balances the medium risk of interception against the high reward of gaining control.\n• The AI's logic prioritizes proactive measures over passive monitoring when a high-value asset is at stake.",
        dag: {
          nodes: [
            { id: 'risk', label: 'Risk/Reward Analysis' },
            { id: 'score', label: 'COA Scoring' },
            { id: 'rec', label: 'Recommend Intercept' }
          ],
          edges: [
            { from: 'risk', to: 'score' },
            { from: 'score', to: 'rec' }
          ]
        },
        shap: {
          "Reward: High": 0.5,
          "Risk: Low": 0.35,
          "Risk: High": -0.4
        }
      },
      projection: {
        text: "• Projecting forward, COA 2 offers the highest probability of a favorable outcome despite its risks.\n• Failure to act (COA 1) projects a potential catastrophic failure.",
        alternatives: [
          {
            title: "If COA 1 is chosen",
            details: "The asset remains at risk with an unknown outcome."
          },
          {
            title: "If COA 3 is chosen", 
            details: "The asset is protected, but with severe diplomatic and ethical consequences."
          }
        ]
      }
    };

    setCurrentExplanation(initialExplanation);
    setConfidence(85);
    setSuggestedPrompts([
      "Why is COA 2 recommended over COA 1?",
      "What are the risks of COA 3?",
      "Explain the SHAP values."
    ]);
  }, [scenario]);

  const updateExplanation = (explanation: XAIExplanation) => {
    setCurrentExplanation(explanation);
    setActiveTab(explanation.defaultTab || 'insight');
    setConfidence(explanation.confidence || 75);
    setSuggestedPrompts(explanation.suggestedPrompts || []);
  };

  return {
    currentExplanation,
    activeTab,
    confidence,
    suggestedPrompts,
    setActiveTab,
    updateExplanation
  };
};