import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

export interface NeuralTrace {
  agent: string;
  reasoning: string;
  recommendation: string;
  riskScore: number;
}

export const getNeuralAudit = async (nodeId: string, score: number): Promise<NeuralTrace> => {
  if (!genAI) {
    // Fallback if no API Key provided
    return {
      agent: "AGENT_ALPHA_SIMULATED",
      reasoning: `Node ${nodeId} has crossed the safety threshold with a Ripple Score of ${score}. Autonomous rerouting was triggered to bypass the Shanghai-Hong Kong cluster.`,
      recommendation: "Maintain MUM-Fallback corridor for 48 hours until SHA weather risk drops below 60.",
      riskScore: score
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `You are NeuralFreight's AI Core. 
    SCENARIO: Global logistics disruption at ${nodeId}. Ripple Score is ${score}/100.
    TASK: Provide a technical 'Neural Trace' for the rerouting decision.
    FORMAT: Return JSON only: { "agent": "AGENT_NAME", "reasoning": "...", "recommendation": "...", "riskScore": ${score} }`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return JSON.parse(text.replace(/```json|```/g, ""));
  } catch (error) {
    console.error("Gemini Audit Error:", error);
    return {
      agent: "AGENT_RECOVERY_MODE",
      reasoning: "API error during neural audit. Reverting to pre-calculated heuristic rerouting patterns.",
      recommendation: "Switch to secondary carrier corridors via Mumbai immediately.",
      riskScore: score
    };
  }
};
