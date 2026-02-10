
export enum PipelineStage {
  IDLE = 'IDLE',
  ONBOARDING = 'ONBOARDING',
  STRUCTURE = 'STRUCTURE',
  ARCHITECTURE = 'ARCHITECTURE',
  MASTER_PROMPT = 'MASTER_PROMPT',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export interface ProjectData {
  title: string;
  description: string;
  targetAudience: string;
  keyFeatures: string[];
  projectScope: 'Prototyp' | 'MVP' | 'Full-Scale App' | 'Enterprise System';
  complexity: 'Einfach (CRUD)' | 'Mittelschwer (Interaktiv)' | 'Hoch (Komplex/KI/Echtzeit)';
  ide: 'Cursor' | 'Windsurf' | 'VS Code + Copilot' | 'VS Code + Cline/Pear' | 'Andere';
  preferredModel: 'Claude 3.5 Sonnet' | 'GPT-4o' | 'Gemini 3 Pro' | 'Andere';
  githubRepo: 'Bestehend' | 'Neu erstellen' | 'Nicht benötigt';
  hostingDeployment: 'Vercel' | 'Render' | 'Google Cloud' | 'AWS' | 'Hetzner' | 'Andere';
  testStrategy: 'TDD' | 'Integration-Focus' | 'Minimal' | 'Keine';
  securityLevel: 'Standard' | 'High (Fintech/Medical)' | 'Prototyp';
  ecosystemPreference?: 'Google Cloud / Firebase' | 'Microsoft / Azure / OpenAI' | 'AWS / Anthropic' | 'Vercel / Next.js Stack' | 'Offen (Best-of-Breed)';
}

export interface Guardrails {
  security: string[];
  performance: string[];
  reliability: string[];
}

export interface SystemModel {
  entities: { name: string; description: string; properties: string[] }[];
  relationships: string[];
  userFlows: string[];
  coreLogic: string;
}

export interface ApiEndpoint {
  method: string;
  path: string;
  description: string;
  parameters: { name: string; type: string; required: boolean; description: string }[];
  response: string;
}

export interface TechOption {
  name: string;
  justification: string;
}

export interface TechnicalArchitecture {
  techStack: { 
    frontend: TechOption[]; 
    backend: TechOption[]; 
    database: TechOption[]; 
    additional: string[] 
  };
  folderStructure: string;
  apiEndpoints: ApiEndpoint[];
  securityRequirements: string[];
  guardrails: Guardrails;
}

export interface WorkspaceFile {
  name: string;
  content: string;
  description: string;
  language: string;
}

export interface PipelineResult {
  stage1?: SystemModel;
  stage2?: TechnicalArchitecture;
  stage3?: {
    masterPrompt: string;
    workspaceFiles: WorkspaceFile[];
  };
}

export interface RefinementSuggestion {
  type: 'modification' | 'refactor' | 'performance' | 'readability';
  title: string;
  description: string;
  codeSnippet?: string;
}

export interface SavedProject {
  id: string;
  timestamp: number;
  data: ProjectData;
  result: PipelineResult;
}

export interface InterviewState {
  currentField: keyof ProjectData | 'COMPLETE';
  question: string;
  suggestions?: string[];
}
