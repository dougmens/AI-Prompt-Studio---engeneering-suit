
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { SystemModel, TechnicalArchitecture, ProjectData, InterviewState, WorkspaceFile, RefinementSuggestion, MarketingStrategy, ProjectEstimation } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// Image Generation
export const generateImage = async (prompt: string, aspectRatio: string, size: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: { parts: [{ text: prompt }] },
    config: {
      imageConfig: {
        aspectRatio: aspectRatio as any,
        imageSize: size as any
      }
    }
  });
  
  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image generated");
};

// Video Generation
export const generateVideoFromImage = async (imageB64: string, prompt: string, aspectRatio: '16:9' | '9:16') => {
  const ai = getAI();
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt || 'Animate this scene naturally',
    image: {
      imageBytes: imageB64.split(',')[1],
      mimeType: 'image/png'
    },
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: aspectRatio
    }
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
  const blob = await response.blob();
  return URL.createObjectURL(blob);
};

// Chatbot with Thinking & Search
export const askArchitect = async (message: string, useThinking: boolean = true) => {
  const ai = getAI();
  const config: any = {
    tools: [{ googleSearch: {} }]
  };
  
  if (useThinking) {
    config.thinkingConfig = { thinkingBudget: 32768 };
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: message,
    config
  });

  return {
    text: response.text,
    sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks?.filter((c: any) => c.web).map((c: any) => ({
      title: c.web.title,
      uri: c.web.uri
    })) || []
  };
};

// TTS
export const speakText = async (text: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) throw new Error("TTS failed");
  return base64Audio;
};

// Standard Pipeline Functions
export const generateProjectEstimation = async (project: Partial<ProjectData>): Promise<ProjectEstimation> => {
  const ai = getAI();
  const prompt = `Senior IT-Controller analysis of: ${project.title}. JSON format required.`;
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          effortHours: { type: Type.NUMBER },
          durationWeeks: { type: Type.NUMBER },
          tokenEstimate: { type: Type.NUMBER },
          apiCostEstimateEur: { type: Type.NUMBER },
          hostingCostMonthlyEur: { type: Type.NUMBER },
          totalCostEstimateEur: { type: Type.NUMBER },
          justification: { type: Type.STRING },
          roiComparison: {
            type: Type.OBJECT,
            properties: {
              manualHours: { type: Type.NUMBER },
              manualCost: { type: Type.NUMBER },
              savingsEur: { type: Type.NUMBER }
            },
            required: ['manualHours', 'manualCost', 'savingsEur']
          }
        },
        required: ['effortHours', 'durationWeeks', 'tokenEstimate', 'apiCostEstimateEur', 'hostingCostMonthlyEur', 'totalCostEstimateEur', 'justification', 'roiComparison']
      }
    }
  });
  return JSON.parse(response.text.trim());
};

export const generateNextInterviewQuestion = async (currentData: Partial<ProjectData>): Promise<InterviewState> => {
  const ai = getAI();
  const prompt = `Senior Business Architect Interview. Identify next field from: title, description, targetAudience, etc. JSON required.`;
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          currentField: { type: Type.STRING },
          question: { type: Type.STRING },
          suggestions: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ['currentField', 'question']
      }
    }
  });
  return JSON.parse(response.text.trim());
};

export const generateMarketingStrategy = async (project: Partial<ProjectData>): Promise<MarketingStrategy> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Business analysis for ${project.title}. SWOT + ROI.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          swot: {
            type: Type.OBJECT,
            properties: {
              strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
              opportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
              threats: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ['strengths', 'weaknesses', 'opportunities', 'threats']
          },
          targetAudiencePainPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
          usp: { type: Type.STRING },
          addedValue: { type: Type.STRING },
          positioning: { type: Type.STRING },
          monetizationSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ['swot', 'targetAudiencePainPoints', 'usp', 'addedValue', 'positioning', 'monetizationSuggestions']
      }
    }
  });
  return JSON.parse(response.text.trim());
};

export const generateStage1Structure = async (project: ProjectData): Promise<SystemModel> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `System model structure for ${project.title}. JSON required.`,
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
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Architecture specs for ${project.title}. JSON required.`,
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
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Final Workspace bundle for ${project.title}. .cursorrules included. JSON required.`,
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

export const analyzeExistingProduct = async (source: string): Promise<ProjectData['rebuildAnalysis']> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Analyze existing product "${source}". Grounding required.`,
    config: { tools: [{ googleSearch: {} }] }
  });
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const sources = groundingChunks.filter((c: any) => c.web).map((c: any) => ({ title: c.web.title, uri: c.web.uri }));
  const structurer = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Structure analysis JSON: ${response.text}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          features: { type: Type.ARRAY, items: { type: Type.STRING } },
          weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
          optimizations: { type: Type.ARRAY, items: { type: Type.STRING } },
          monetization: { type: Type.STRING }
        },
        required: ['features', 'weaknesses', 'optimizations', 'monetization']
      }
    }
  });
  return { ...JSON.parse(structurer.text.trim()), sources };
};

export const brainstormFeatures = async (project: Partial<ProjectData>): Promise<string[]> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Brainstorm commercial features for ${project.title}. JSON required.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: { suggestions: { type: Type.ARRAY, items: { type: Type.STRING } } },
        required: ['suggestions']
      },
      thinkingConfig: { thinkingBudget: 12000 }
    }
  });
  return JSON.parse(response.text.trim()).suggestions || [];
};

export const analyzeComponent = async (target: string, project: ProjectData): Promise<RefinementSuggestion[]> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Refinement analysis for component ${target}. JSON required.`,
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
                type: { type: Type.STRING },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                codeSnippet: { type: Type.STRING }
              },
              required: ['type', 'title', 'description']
            }
          }
        },
        required: ['suggestions']
      },
      thinkingConfig: { thinkingBudget: 12000 }
    }
  });
  return JSON.parse(response.text.trim()).suggestions || [];
};
