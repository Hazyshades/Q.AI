// API Keys
export const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || '';
export const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY || '';
export const NEBIUS_API_KEY = import.meta.env.VITE_NEBIUS_API_KEY || '';
export const GOOGLE_SHEETS_API_KEY = import.meta.env.VITE_GOOGLE_SHEETS_API_KEY || '';

// Supabase Configuration
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://wphfxiaucdvizydhsdsc.supabase.co';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwaGZ4aWF1Y2R2aXp5ZGhzZHNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4NTk1ODAsImV4cCI6MjA3MTQzNTU4MH0.xYdqvxhWdJ8wn_D8rlU_obbPz0vhv-Tkzfd4MGA9OY8';

// AI Models Configuration
export const AI_MODELS = {
  'grok-3': {
    name: 'Grok-3',
    provider: 'xAI (via OpenRouter)',
    modelId: 'xai/grok-beta',
    maxTokens: 8192,
    temperature: 0.7
  },
  'gpt-4': {
    name: 'GPT-OSS-20B',
    provider: 'OpenAI (via Nebius)',
    modelId: 'openai/gpt-oss-20b',
    maxTokens: 4096,
    temperature: 0.7
  },
  'qwen': {
    name: 'Qwen3-30B-A3B',
    provider: 'Alibaba (via Nebius)',
    modelId: 'Qwen/Qwen3-30B-A3B',
    maxTokens: 262144,
    temperature: 0.7
  },
  'deepseek': {
    name: 'DeepSeek',
    provider: 'DeepSeek',
    modelId: 'deepseek-chat',
    maxTokens: 4096,
    temperature: 0.7
  },
  'deepseek-reasoner': {
    name: 'DeepSeek Reasoner',
    provider: 'DeepSeek',
    modelId: 'deepseek-reasoner',
    maxTokens: 32768,
    temperature: 0.0
  }
} as const;

export type AIModel = keyof typeof AI_MODELS;

// Default Configuration
const envAiModel = import.meta.env.VITE_AI_MODEL;
let defaultAiModel: AIModel = 'deepseek';

// Mapping for handling various model name variants
  if (envAiModel) {
    if (envAiModel === 'deepseek-chat' || envAiModel === 'deepseek') {
      defaultAiModel = 'deepseek';
    } else if (envAiModel === 'deepseek-reasoner' || envAiModel === 'reasoner') {
      defaultAiModel = 'deepseek-reasoner';
    } else if (envAiModel === 'grok-3' || envAiModel === 'grok') {
      defaultAiModel = 'grok-3';
    } else if (envAiModel === 'gpt-4' || envAiModel === 'gpt4') {
      defaultAiModel = 'gpt-4';
    } else if (envAiModel === 'qwen' || envAiModel === 'qwen2.5' || envAiModel === 'qwen2.5-72b') {
      defaultAiModel = 'qwen';
    } else if (Object.keys(AI_MODELS).includes(envAiModel)) {
      defaultAiModel = envAiModel as AIModel;
    }
  }

export const DEFAULT_AI_MODEL: AIModel = defaultAiModel;

export const DEFAULT_DETAIL_LEVEL = 'medium';
export const DEFAULT_OUTPUT_FORMAT = 'markdown';

// Global variable for current model (can be changed by user)
let currentAiModel: AIModel = DEFAULT_AI_MODEL;

// Function to get current model
export const getCurrentAiModel = (): AIModel => {
  return currentAiModel;
};

// Function to set current model
export const setCurrentAiModel = (model: AIModel): void => {
  currentAiModel = model;
};

// Function to initialize model from user settings
export const initializeAiModelFromSettings = async (): Promise<void> => {
  try {
    const { DatabaseService } = await import('./database-service');
    const userSettings = await DatabaseService.getUserSettings();

    if (userSettings?.ai_model && Object.keys(AI_MODELS).includes(userSettings.ai_model)) {
      currentAiModel = userSettings.ai_model as AIModel;
    }
  } catch (error) {
    // Use default model if user settings unavailable
  }
};

// Validation
export const validateApiKeys = () => {
  const missingKeys = [];
  
  if (!OPENROUTER_API_KEY) missingKeys.push('VITE_OPENROUTER_API_KEY');
  if (!DEEPSEEK_API_KEY) missingKeys.push('VITE_DEEPSEEK_API_KEY');
  if (!NEBIUS_API_KEY) missingKeys.push('VITE_NEBIUS_API_KEY');
  
  return {
    isValid: missingKeys.length === 0,
    missingKeys
  };
};

export const validateAIModel = () => {
  const aiModel = import.meta.env.VITE_AI_MODEL;
  if (aiModel && !Object.keys(AI_MODELS).includes(aiModel)) {
    return {
      isValid: false,
      error: `Unknown AI model: ${aiModel}. Available models: ${Object.keys(AI_MODELS).join(', ')}`
    };
  }
  return { isValid: true };
};

export const validateSupabaseConfig = () => {
  const missingKeys = [];
  
  if (!SUPABASE_URL) missingKeys.push('VITE_SUPABASE_URL');
  if (!SUPABASE_ANON_KEY) missingKeys.push('VITE_SUPABASE_ANON_KEY');
  
  return {
    isValid: missingKeys.length === 0,
    missingKeys
  };
};

// Supabase Database Schema
export const SUPABASE_SCHEMA = {
  PUBLIC: 'public',
  TABLES: {
    PROJECTS: 'projects',
    GENERATION_SESSIONS: 'generation_sessions',
    USER_SETTINGS: 'user_settings',
    FAVORITE_RESULTS: 'favorite_results'
  }
} as const;

// Config object for backward compatibility
export const config = {
  // API Keys
  OPENROUTER_API_KEY,
  DEEPSEEK_API_KEY,
  NEBIUS_API_KEY,
  GOOGLE_SHEETS_API_KEY,
  
  // API URLs
  OPENROUTER_API_URL: 'https://openrouter.ai/api/v1/chat/completions',
  DEEPSEEK_API_URL: 'https://api.deepseek.com/v1/chat/completions',
  NEBIUS_API_URL: 'https://api.studio.nebius.com/v1/chat/completions',
  
  // Supabase Configuration
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  
  // AI Models Configuration
  AI_MODELS,
  
  // Default Configuration
  DEFAULT_AI_MODEL,
  DEFAULT_DETAIL_LEVEL,
  DEFAULT_OUTPUT_FORMAT,
  
  // App settings
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  SUPPORTED_FORMATS: ['pdf', 'docx', 'txt', 'json'],
  
  // Getter for current model
  get AI_MODEL() {
    return getCurrentAiModel();
  },
  
  // Test mode settings removed
};
