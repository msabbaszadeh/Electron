
import { GoogleGenAI } from "@google/genai";
import { Settings } from "../types";

// Keep a single instance of the AI client.
let ai: GoogleGenAI | null = null;

const getAi = () => {
  if (!ai) {
    if (!process.env.API_KEY) {
      throw new Error("API_KEY environment variable not set for Gemini");
    }
    // Fix: Initialize GoogleGenAI with a named apiKey parameter.
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return ai;
};

export const runGemini = async (prompt: string, settings: Settings): Promise<string> => {
    try {
        const aiClient = getAi();

        // Fix: Use ai.models.generateContent and get response from response.text property.
        const response = await aiClient.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        
        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        if (error instanceof Error) {
            return `Error communicating with Gemini: ${error.message}`;
        }
        return "An unknown error occurred while communicating with Gemini.";
    }
};

export const runGeminiStream = async function* (prompt: string, settings: Settings): AsyncGenerator<string, void, unknown> {
    try {
        const aiClient = getAi();

        const response = await aiClient.models.generateContentStream({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        for await (const chunk of response) {
            if (chunk.text) {
                yield chunk.text;
            }
        }
    } catch (error) {
        console.error("Error calling Gemini streaming API:", error);
        if (error instanceof Error) {
            yield `Error communicating with Gemini: ${error.message}`;
        } else {
            yield "An unknown error occurred while communicating with Gemini.";
        }
    }
};
