
import { ChatMessage, LlmResponse, LlmService } from '../types';

export class LemonadeService implements LlmService {
    constructor(private model: string) {
        if (!model || !model.trim()) {
            throw new Error("Lemonade model name cannot be empty.");
        }
    }

    private async generateContent(prompt: string): Promise<LlmResponse> {
        try {
            const response = await fetch('http://localhost:8000/v1/chat/completions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: this.model,
                    messages: [{ role: 'user', content: prompt }],
                    response_format: { type: 'json_object' },
                }),
            });

            if (!response.ok) {
                const errorBody = await response.text();
                throw new Error(`Lemonade API request failed with status ${response.status}: ${errorBody}`);
            }

            const data = await response.json();

            if (data.error) {
                 throw new Error(`Lemonade API Error: ${data.error.message}`);
            }

            if (!data.choices || data.choices.length === 0 || !data.choices[0].message.content) {
                throw new Error('Invalid response structure from Lemonade API.');
            }

            return JSON.parse(data.choices[0].message.content);
        } catch (error: any) {
            console.error("Error generating content with Lemonade:", error);
            if (error.message.includes('Failed to fetch')) {
                 throw new Error("Failed to connect to Lemonade server at http://localhost:8000. Please ensure Lemonade is running locally.");
            }
            throw new Error(`Failed to generate and parse content from Lemonade: ${error.message}`);
        }
    }

    async generateRequirements(appIdea: string): Promise<LlmResponse> {
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
        return this.generateContent(prompt);
    }

    async refineDocument(currentDocument: string, chatHistory: ChatMessage[]): Promise<LlmResponse> {
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
        return this.generateContent(prompt);
    }

    async generateDesign(requirements: string): Promise<LlmResponse> {
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
        return this.generateContent(prompt);
    }

    async generateTasks(requirements: string, design: string): Promise<LlmResponse> {
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
        return this.generateContent(prompt);
    }
}
