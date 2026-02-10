
export enum PipelineStage {
  IDLE = 'IDLE',
  ONBOARDING = 'ONBOARDING',
  STRUCTURE = 'STRUCTURE',
  ARCHITECTURE = 'ARCHITECTURE',
  MASTER_PROMPT = 'MASTER_PROMPT',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export interface ProjectEstimation {
  effortHours: number;
  durationWeeks: number;
  tokenEstimate: number;
  apiCostEstimateEur: number;
  hostingCostMonthlyEur: number;
  totalCostEstimateEur: number;
  justification: string;
  roiComparison?: {
    manualHours: number;
    manualCost: number;
    savingsEur: number;
  };
}

export interface MarketingStrategy {
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  targetAudiencePainPoints: string[];
  usp: string;
  addedValue: string;
  positioning: string;
  monetizationSuggestions?: string[];
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
  rebuildSource?: string;
  rebuildAnalysis?: {
    features: string[];
    weaknesses: string[];
    optimizations: string[];
    monetization?: string;
    sources: { title: string; uri: string }[];
  };
  marketingStrategy?: MarketingStrategy;
  authMethods?: string[];
  monetizationModel?: string;
  adminPanelRequired?: boolean;
  i18nRequired?: boolean;
  analyticsTool?: 'PostHog' | 'Mixpanel' | 'Google Analytics' | 'Keine';
  complianceLevel?: 'Standard (DSGVO)' | 'Strict (Fintech/Health)' | 'Global (HIPAA/GDPR/CCPA)';
  ciCdPreference?: 'GitHub Actions' | 'GitLab CI' | 'Vercel Auto-Deploy' | 'Keine';
  estimation?: ProjectEstimation;
}

export interface PipelineResult {
  stage1?: SystemModel;
  stage2?: TechnicalArchitecture;
  stage3?: {
    masterPrompt: string;
    workspaceFiles: WorkspaceFile[];
  };
}

export interface SystemModel {
  entities: { name: string; description: string; properties: string[] }[];
  relationships: string[];
  userFlows: string[];
  coreLogic: string;
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

export interface TechOption {
  name: string;
  justification: string;
}

export interface ApiEndpoint {
  method: string;
  path: string;
  description: string;
  parameters: { name: string; type: string; required: boolean; description: string }[];
  response: string;
}

export interface Guardrails {
  security: string[];
  performance: string[];
  reliability: string[];
}

export interface WorkspaceFile {
  name: string;
  content: string;
  description: string;
  language: string;
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

export interface RefinementSuggestion {
  type: string;
  title: string;
  description: string;
  codeSnippet?: string;
}
