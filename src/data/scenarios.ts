import { COAScenario } from '../types';

export const defaultScenario: COAScenario = {
  name: "COA Analysis: Unresponsive Aircraft",
  situation: "An unidentified aircraft is unresponsive and on a potential collision course with a high-value asset.",
  coursesOfAction: [
    {
      id: 'coa1',
      name: "COA 1: Monitor",
      summary: "Continue to monitor the aircraft's path, attempting to establish communication without direct intervention.",
      risk: "Low (avoids escalation)",
      reward: "Low (no guarantee of changing outcome)",
      recommendationScore: 40,
    },
    {
      id: 'coa2',
      name: "COA 2: Intercept",
      summary: "Scramble fighters to intercept, visually identify, and establish communication or divert the aircraft.",
      risk: "Medium (potential for miscalculation)",
      reward: "High (direct control of the situation)",
      recommendationScore: 85,
    },
    {
      id: 'coa3',
      name: "COA 3: Neutralize",
      summary: "Engage and neutralize the aircraft before it reaches the asset.",
      risk: "High (loss of life, political fallout)",
      reward: "Very High (guarantees asset protection)",
      recommendationScore: 15,
    }
  ]
};