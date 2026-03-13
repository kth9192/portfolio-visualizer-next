import { GoogleGenAI } from "@google/genai";

export const GEMINI_MODEL = "gemini-3.1-flash-lite-preview";

let _client: GoogleGenAI | null = null;

export const getGeminiClient = () => {
  if (_client) return _client;

  const apiKey = process.env.GEMINI_API_KEY;
  console.log("apiKey", apiKey);

  if (!apiKey) throw new Error("GEMINI_API_KEY is not defined");

  _client = new GoogleGenAI({ apiKey });
  return _client;
};
