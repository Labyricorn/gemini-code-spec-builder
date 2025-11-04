
import { GoogleGenAI, Type } from "@google/genai";
import { ChatMessage } from '../types';

const MODEL_NAME = 'gemini-2.5-pro';

// Ensure API_KEY is available
if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface GeminiResponse {
    chatResponse: string;
    documentContent: string;
}

const generateContent = async (prompt: string): Promise<GeminiResponse> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                chatResponse: { type: Type.STRING },
                documentContent: { type: Type.STRING },
            },
            required: ["chatResponse", "documentContent"],
        },
      },
    });
    
    let jsonStr = response.text.trim();
    // Defensive cleanup for cases where the model might still wrap output in markdown
    if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.substring(7, jsonStr.length - 3).trim();
    }

    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Error generating content:", error);
    throw new Error("Failed to generate and parse content from Gemini API.");
  }
};

export const generateRequirements = async (appIdea: string): Promise<GeminiResponse> => {
  const prompt = `
    You are an expert product manager. A user wants to build an application with the following idea: "${appIdea}".
    Your task is to write a comprehensive requirements document from the perspective of the application's users, focusing on user stories, key features, functional requirements, and non-functional requirements.
    The document itself should be formatted in Markdown.

    Your final output must be a single JSON object with the following structure:
    {
      "chatResponse": "A brief, friendly message to the user, like 'Here are the initial requirements for your app idea. Take a look and let me know what you think!'.",
      "documentContent": "The full Markdown content of the requirements document."
    }
  `;
  return generateContent(prompt);
};

export const refineDocument = async (currentDocument: string, chatHistory: ChatMessage[]): Promise<GeminiResponse> => {
  const historyText = chatHistory.map(msg => `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.text}`).join('\n');
  const latestUserMessage = chatHistory[chatHistory.length - 1]?.text || '';
  
  const prompt = `
    You are an expert technical writer. A user wants to revise a document based on their latest request.
    Your task is to integrate the user's feedback and provide a complete, updated version of the document in Markdown.

    [CONVERSATION HISTORY]
    ${historyText}

    [CURRENT DOCUMENT]
    ${currentDocument}

    Based on the user's latest request ("${latestUserMessage}"), produce the new version of the document.
    
    Your final output must be a single JSON object with the following structure:
    {
      "chatResponse": "A brief, conversational message confirming the update, like 'I've updated the document with your changes. Here is the new version.'.",
      "documentContent": "The full, revised Markdown document. Do not include any conversational text, meta-commentary, or apologies within this field."
    }
  `;
  return generateContent(prompt);
};

export const generateDesign = async (requirements: string): Promise<GeminiResponse> => {
  const prompt = `
    You are a world-class solutions architect. Based on the following approved requirements document, create a detailed technical design document.
    Recommend a modern, scalable technology stack, outline the high-level architecture, data models, and key API endpoints, with justifications for your choices.
    The document itself should be formatted in Markdown.

    [REQUIREMENTS DOCUMENT]
    ${requirements}
    
    Your final output must be a single JSON object with the following structure:
    {
      "chatResponse": "A brief, confident message introducing the design document, like 'Based on the requirements, I've drafted a technical design. This should provide a solid foundation for development.'.",
      "documentContent": "The full Markdown content of the technical design document."
    }
  `;
  return generateContent(prompt);
};

export const generateTasks = async (requirements: string, design: string): Promise<GeminiResponse> => {
  const prompt = `
    You are a seasoned engineering manager. Based on the approved requirements and design documents below, create a comprehensive list of development tasks.
    Break down the work into logical epics, user stories, and specific sub-tasks, including effort estimates (e.g., S, M, L, XL).
    The document itself should be formatted in Markdown.

    [REQUIREMENTS DOCUMENT]
    ${requirements}

    [DESIGN DOCUMENT]
    ${design}

    Your final output must be a single JSON object with the following structure:
    {
      "chatResponse": "A brief message to the user, like 'Alright, here's a full breakdown of the development tasks based on the approved documents. Let's get building!'.",
      "documentContent": "The full Markdown content of the development task list."
    }
  `;
  return generateContent(prompt);
};
