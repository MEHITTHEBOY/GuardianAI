
import { GoogleGenAI, Type } from "@google/genai";
import { ChatMessage } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getSafetyAdvice = async (userMessage: string, context?: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: userMessage,
      config: {
        systemInstruction: `You are GuardianAI, a specialized safety assistant for women. 
        Provide practical, de-escalating, and empathetic safety advice. 
        If the user is in immediate danger, prioritize telling them to use the SOS button or call local emergency services (e.g., 911). 
        Context provided: ${context || 'None'}. 
        Keep responses concise and actionable.`,
        temperature: 0.7,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Advice Error:", error);
    return "I'm having trouble connecting, but please stay in a well-lit area and contact authorities if you feel unsafe.";
  }
};

export const getRouteSafetyAnalysis = async (origin: string, destination: string, lat: number, lng: number) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze the safety of traveling from "${origin}" to "${destination}" near my current location at (${lat}, ${lng}). 
      Identify well-lit streets, busy commercial areas, and any safety considerations for a woman traveling this route. 
      Provide a concise safety analysis and 3 specific route tips.`,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: { latitude: lat, longitude: lng }
          }
        }
      },
    });
    
    return {
      text: response.text || "Unable to generate analysis.",
      groundingChunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
  } catch (error) {
    console.error("Gemini Route Error:", error);
    return {
      text: "Unable to analyze routes at the moment. Please stick to main roads and well-lit paths.",
      groundingChunks: []
    };
  }
};

export const summarizeIncident = async (description: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Summarize the following incident for a formal report: ${description}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            urgency: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] },
            suggestedActions: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["title", "summary", "urgency", "suggestedActions"]
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Incident Summary Error:", error);
    return null;
  }
};
