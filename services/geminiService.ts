
import { GoogleGenAI, Type } from "@google/genai";
import { SystemModel, TechnicalArchitecture, ProjectData, InterviewState } from "../types";

// Always initialize GoogleGenAI with the API key from process.env.API_KEY directly
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateNextInterviewQuestion = async (currentData: Partial<ProjectData>): Promise<InterviewState> => {
  const ai = getAI();
  
  const prompt = `Du bist ein erfahrener Software-Architekt und Interviewer. Deine Aufgabe ist es, Informationen für ein neues Softwareprojekt zu sammeln.
  Wir benötigen vier Felder: "title" (Titel), "description" (Beschreibung), "targetAudience" (Zielgruppe) und "keyFeatures" (Hauptfunktionen).
  
  Bisher gesammelte Daten: ${JSON.stringify(currentData)}
  
  Regeln:
  1. Analysiere, welches Feld als nächstes sinnvoll ist.
  2. Formuliere eine präzise, professionelle und hilfreiche Frage auf Deutsch.
  3. Wenn das nächste Feld "description" ist, beziehe dich auf den "title".
  4. Wenn das nächste Feld "targetAudience" ist, beziehe dich auf Titel und Beschreibung.
  5. Wenn das nächste Feld "keyFeatures" ist, schlage basierend auf dem Kontext 3 konkrete Funktionen als "suggestions" vor.
  6. Wenn alle Felder ausgefüllt sind, setze "currentField" auf "COMPLETE".
  
  Antworte ausschließlich im JSON-Format gemäß dem Schema.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          currentField: { type: Type.STRING, enum: ['title', 'description', 'targetAudience', 'keyFeatures', 'COMPLETE'] },
          question: { type: Type.STRING },
          suggestions: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ['currentField', 'question']
      }
    }
  });

  // Accessing text as a property, not a method
  return JSON.parse(response.text.trim());
};

export const generateStage1Structure = async (project: ProjectData): Promise<SystemModel> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Transform this project idea into a logical system model JSON. Please provide descriptions and entity names in the same language as the input (${project.title}):
      Title: ${project.title}
      Description: ${project.description}
      Target Audience: ${project.targetAudience}
      Key Features: ${project.keyFeatures.join(', ')}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          entities: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                properties: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ['name', 'description', 'properties']
            }
          },
          relationships: { type: Type.ARRAY, items: { type: Type.STRING } },
          userFlows: { type: Type.ARRAY, items: { type: Type.STRING } },
          coreLogic: { type: Type.STRING }
        },
        required: ['entities', 'relationships', 'userFlows', 'coreLogic']
      }
    }
  });

  return JSON.parse(response.text.trim());
};

export const generateStage2Architecture = async (systemModel: SystemModel): Promise<TechnicalArchitecture> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Based on this system model JSON, generate a comprehensive technical architecture JSON. Maintain language consistency with the source:
      ${JSON.stringify(systemModel, null, 2)}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          techStack: {
            type: Type.OBJECT,
            properties: {
              frontend: { type: Type.STRING },
              backend: { type: Type.STRING },
              database: { type: Type.STRING },
              additional: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ['frontend', 'backend', 'database', 'additional']
          },
          folderStructure: { type: Type.STRING },
          apiEndpoints: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                method: { type: Type.STRING },
                path: { type: Type.STRING },
                description: { type: Type.STRING }
              },
              required: ['method', 'path', 'description']
            }
          },
          securityRequirements: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ['techStack', 'folderStructure', 'apiEndpoints', 'securityRequirements']
      }
    }
  });

  return JSON.parse(response.text.trim());
};

export const generateStage3MasterPrompt = async (
  project: ProjectData,
  systemModel: SystemModel,
  architecture: TechnicalArchitecture
): Promise<string> => {
  const ai = getAI();
  const prompt = `Compile the following project data, system model, and technical architecture into a single, highly detailed 'Master Prompt' for an autonomous AI programming agent. 
  The goal is for the agent to use this prompt to build the entire system from scratch.
  
  Format the output as a high-quality Markdown document. Output the prompt content in the language primarily used in the project description.
  
  PROJECT INFO:
  ${JSON.stringify(project, null, 2)}
  
  SYSTEM MODEL:
  ${JSON.stringify(systemModel, null, 2)}
  
  TECHNICAL ARCHITECTURE:
  ${JSON.stringify(architecture, null, 2)}
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      // thinkingBudget is set within appropriate limits for gemini-3-pro-preview
      thinkingConfig: { thinkingBudget: 2000 }
    }
  });

  return response.text;
};
