export interface VideoIdea {
  title: string;
  hook: string;
  description: string;
  scriptOutline: string[];
  targetAudience: string;
  thumbnailSuggestion: string;
  // Optional fields for script/thumbnail generation
  generatedScript?: GeneratedScript;
  thumbnailImage?: string;
  isGenerating?: boolean;
  // New optional fields for video generation
  isGeneratingVideo?: boolean;
  videoGenerationProgress?: string;
  videoUrl?: string;
}

export interface GeminiResponse {
  videoIdeas: VideoIdea[];
}

export interface ScriptScene {
  scene: number;
  visualDescription: string;
  voiceover: string;
}

export interface GeneratedScript {
  title: string;
  script: ScriptScene[];
}
