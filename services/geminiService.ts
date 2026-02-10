
import { GoogleGenAI, Type } from "@google/genai";
import { SystemModel, TechnicalArchitecture, ProjectData, InterviewState, WorkspaceFile, RefinementSuggestion } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateNextInterviewQuestion = async (currentData: Partial<ProjectData>): Promise<InterviewState> => {
  const ai = getAI();
  const prompt = `Du bist ein Senior Software-Architekt. Wir sammeln Daten für ein präzises Projekt-Setup.
  
  FELDER: 
  - title, description, targetAudience, keyFeatures
  - ecosystemPreference: (Frage, ob der User "alles aus einer Hand" möchte, z.B. Google Cloud/Firebase, Azure/OpenAI, AWS oder Vercel-Stack)
  - projectScope: (Prototyp, MVP, Full-Scale App, Enterprise)
  - complexity: (Einfach, Mittelschwer, Hoch)
  - ide, preferredModel, githubRepo, hostingDeployment, testStrategy, securityLevel.
  
  Bisher gesammelt: ${JSON.stringify(currentData)}
  
  REGELN:
  1. Identifiziere das nächste fehlende Feld.
  2. Frage gezielt nach 'ecosystemPreference'. Wenn der User "alles aus einer Hand" bevorzugt, schlage passende Ökosysteme vor.
  3. Frage nach Umfang (Scope) und Komplexität.
  4. Gib hilfreiche Vorschläge. Wenn nach "testStrategy" gefragt wird, integriere unbedingt eine kurze, professionelle Erklärung, warum Test-Driven Development (TDD) besonders vorteilhaft bei der Zusammenarbeit mit KI-Programmieragenten ist. Betone, dass TDD dem Agenten klare, verifizierbare Zielvorgaben bietet, was die Präzision der Code-Generierung massiv erhöht.
  5. Wenn nach "ide" oder "preferredModel" gefragt wird, empfehle Kombinationen basierend auf der Komplexität und dem gewählten Ökosystem.
  
  Antworte ausschließlich im JSON-Format.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          currentField: { type: Type.STRING, enum: ['title', 'description', 'targetAudience', 'keyFeatures', 'ecosystemPreference', 'projectScope', 'complexity', 'ide', 'preferredModel', 'githubRepo', 'hostingDeployment', 'testStrategy', 'securityLevel', 'COMPLETE'] },
          question: { type: Type.STRING },
          suggestions: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ['currentField', 'question']
      }
    }
  });

  return JSON.parse(response.text.trim());
};

export const brainstormFeatures = async (project: Partial<ProjectData>): Promise<string[]> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Brainstorme 6 innovative Features für ein ${project.projectScope} mit ${project.complexity} Komplexität. Thema: ${project.title}. Beschreibung: ${project.description}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: { suggestions: { type: Type.ARRAY, items: { type: Type.STRING } } },
        required: ['suggestions']
      },
      thinkingConfig: { thinkingBudget: 8000 }
    }
  });
  return JSON.parse(response.text.trim()).suggestions || [];
};

export const generateStage1Structure = async (project: ProjectData): Promise<SystemModel> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Erstelle ein logisches Systemmodell für ein ${project.projectScope} (${project.complexity}): ${JSON.stringify(project)}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          entities: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, description: { type: Type.STRING }, properties: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ['name', 'description', 'properties'] } },
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

export const generateStage2Architecture = async (systemModel: SystemModel, project: ProjectData): Promise<TechnicalArchitecture> => {
  const ai = getAI();
  const prompt = `Generiere technische Architektur & Guardrails. 
  PROJEKT-KONTEXT:
  - Ökosystem-Präferenz: ${project.ecosystemPreference || 'Keine (Best-of-Breed)'}
  - Umfang: ${project.projectScope}
  - Komplexität: ${project.complexity}
  - Modell: ${project.preferredModel}
  
  WICHTIG: Wenn eine Ökosystem-Präferenz angegeben ist (z.B. "Google Cloud / Firebase"), wähle primär Tools aus diesem Ökosystem (Hosting, DB, Auth, Functions), um eine "Alles aus einer Hand"-Integration zu gewährleisten.
  System: ${JSON.stringify(systemModel)}`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          techStack: { type: Type.OBJECT, properties: { frontend: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, justification: { type: Type.STRING } }, required: ['name', 'justification'] } }, backend: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, justification: { type: Type.STRING } }, required: ['name', 'justification'] } }, database: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, justification: { type: Type.STRING } }, required: ['name', 'justification'] } }, additional: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ['frontend', 'backend', 'database', 'additional'] },
          folderStructure: { type: Type.STRING },
          apiEndpoints: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { method: { type: Type.STRING }, path: { type: Type.STRING }, description: { type: Type.STRING }, parameters: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, type: { type: Type.STRING }, required: { type: Type.BOOLEAN }, description: { type: Type.STRING } }, required: ['name', 'type', 'required', 'description'] } }, response: { type: Type.STRING } }, required: ['method', 'path', 'description', 'parameters', 'response'] } },
          securityRequirements: { type: Type.ARRAY, items: { type: Type.STRING } },
          guardrails: { type: Type.OBJECT, properties: { security: { type: Type.ARRAY, items: { type: Type.STRING } }, performance: { type: Type.ARRAY, items: { type: Type.STRING } }, reliability: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ['security', 'performance', 'reliability'] }
        },
        required: ['techStack', 'folderStructure', 'apiEndpoints', 'securityRequirements', 'guardrails']
      }
    }
  });
  return JSON.parse(response.text.trim());
};

export const generateStage3Workspace = async (
  project: ProjectData,
  systemModel: SystemModel,
  architecture: TechnicalArchitecture
): Promise<{ masterPrompt: string; workspaceFiles: WorkspaceFile[] }> => {
  const ai = getAI();
  
  const prompt = `Du bist ein Senior Software Architect. Erstelle ein Workspace Bundle, das perfekt auf den Umfang (${project.projectScope}) und die Komplexität (${project.complexity}) abgestimmt ist.
  
  KONTEXT:
  - Ökosystem: ${project.ecosystemPreference || 'Divers'}
  - IDE: ${project.ide}
  - Ziel-LLM des Agenten: ${project.preferredModel}
  - Test-Strategie: ${project.testStrategy}
  
  DEINE AUFGABE:
  1. Generiere einen "Master-Prompt", der den Agenten passend zur Projektgröße instruiert. Berücksichtige die Ökosystem-Integration.
  2. Generiere Workspace-Dateien (SPECIFICATION.md, TODO.md, IDE-Rules).
  3. Falls es ein "Enterprise System" ist, erzwinge im Prompt Clean Architecture und umfassende Dokumentation.
  
  Antworte ausschließlich im JSON-Format.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      thinkingConfig: { thinkingBudget: 32768 },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          masterPrompt: { type: Type.STRING },
          workspaceFiles: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                content: { type: Type.STRING },
                description: { type: Type.STRING },
                language: { type: Type.STRING }
              },
              required: ['name', 'content', 'description', 'language']
            }
          }
        },
        required: ['masterPrompt', 'workspaceFiles']
      }
    }
  });

  return JSON.parse(response.text.trim());
};

export const analyzeComponent = async (
  target: string,
  context: ProjectData
): Promise<RefinementSuggestion[]> => {
  const ai = getAI();
  const prompt = `Analysiere die folgende Komponente oder das Tech-Element "${target}" im Kontext eines Projekts:
  - Titel: ${context.title}
  - Ökosystem: ${context.ecosystemPreference || 'N/A'}
  - Komplexität: ${context.complexity}
  - Tech-Stack: ${context.preferredModel}
  
  Generiere 3-4 spezifische Code-Modifikationsvorschläge, Refactoring-Ideen oder Performance-Optimierungen.
  Gib konkrete Code-Beispiele (Markdown Snippets) an, falls relevant.
  
  Antworte im JSON-Format.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          suggestions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING, enum: ['modification', 'refactor', 'performance', 'readability'] },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                codeSnippet: { type: Type.STRING }
              },
              required: ['type', 'title', 'description']
            }
          }
        },
        required: ['suggestions']
      }
    }
  });

  return JSON.parse(response.text.trim()).suggestions;
};
