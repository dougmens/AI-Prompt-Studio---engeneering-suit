
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
}

export interface SystemModel {
  entities: { name: string; description: string; properties: string[] }[];
  relationships: string[];
  userFlows: string[];
  coreLogic: string;
}

export interface TechnicalArchitecture {
  techStack: { frontend: string; backend: string; database: string; additional: string[] };
  folderStructure: string;
  apiEndpoints: { method: string; path: string; description: string }[];
  securityRequirements: string[];
}

export interface PipelineResult {
  stage1?: SystemModel;
  stage2?: TechnicalArchitecture;
  stage3?: string;
}

export interface InterviewState {
  currentField: keyof ProjectData | 'COMPLETE';
  question: string;
  suggestions?: string[];
}
