import { config } from './config';
import { testCasesPrompt, checklistPrompt, enhancementPrompt, documentationPreprocessingPrompt, testerPrompt, analystPrompt, developerPrompt, managerPrompt } from '../prompts';
import { toast } from 'sonner';

export interface TestCase {
  id: string;
  title: string;
  description: string;
  preconditions: string;
  steps: string[];
  expected: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  category?: string;
  module?: string;
}

export interface ChecklistItem {
  id: number;
  item: string;
  checked: boolean;
  category?: string;
  module?: string;
}

export interface DocumentationAnalysis {
  structuredRequirements: {
    functionalRequirements: Array<{
      id: string;
      title: string;
      description: string;
      acceptanceCriteria: string[];
      priority: 'Critical' | 'High' | 'Medium' | 'Low';
    }>;
    nonFunctionalRequirements: Array<{
      id: string;
      category: 'Performance' | 'Security' | 'Usability' | 'Reliability';
      description: string;
      criteria: string;
    }>;
    businessRules: Array<{
      id: string;
      rule: string;
      conditions: string;
    }>;
    userScenarios: Array<{
      id: string;
      actor: string;
      scenario: string;
      steps: string[];
    }>;
  };
  metadata: {
    originalDocumentQuality: 'Good' | 'Average' | 'Poor';
    assumptions: string[];
    contradictions: string[];
    missingInformation: string[];
  };
}

export interface DeveloperAnalysis {
  technicalRequirements: {
    functionalRequirements: Array<{
      id: string;
      title: string;
      description: string;
      implementation: string;
      components: string[];
      complexity: string;
      estimatedEffort: string;
    }>;
    nonFunctionalRequirements: Array<{
      id: string;
      category: string;
      description: string;
      implementation: string;
      constraints: string[];
    }>;
    technicalConstraints: Array<{
      id: string;
      constraint: string;
      impact: string;
      mitigation: string;
    }>;
    integrationPoints: Array<{
      id: string;
      name: string;
      type: string;
      description: string;
      requirements: string[];
    }>;
  };
  architectureRecommendations: {
    components: string[];
    patterns: string[];
    technologies: string[];
    risks: string[];
  };
  summary: string;
  metadata: {
    aiModel: string;
    totalRequirements: number;
    estimatedDevelopmentTime: string;
    complexityLevel: string;
    technicalRisks: string[];
    assumptions: string[];
  };
}

export interface ManagerAnalysis {
  projectOverview: {
    goals: string[];
    objectives: string[];
    keyStakeholders: string[];
    successCriteria: string[];
  };
  projectPlanning: {
    phases: Array<{
      phase: string;
      duration: string;
      deliverables: string[];
      dependencies: string[];
    }>;
    timeline: {
      estimatedDuration: string;
      criticalPath: string[];
      milestones: string[];
    };
    resourceRequirements: {
      teamSize: number;
      roles: string[];
      skills: string[];
      budget: string;
    };
  };
  resourceRequirements: {
    humanResources: Array<{
      role: string;
      count: number;
      skills: string[];
      responsibilities: string[];
    }>;
    technicalResources: Array<{
      type: string;
      description: string;
      cost: string;
    }>;
    timeline: {
      totalDuration: string;
      phases: Array<{
        name: string;
        duration: string;
        resources: string[];
      }>;
    };
  };
  summary: string;
  metadata: {
    aiModel: string;
    projectComplexity: string;
    estimatedBudget: string;
    riskLevel: string;
    assumptions: string[];
  };
}

export interface StructuredTesting {
  functionalRequirements: Array<{
    id: string;
    title: string;
    description: string;
    acceptanceCriteria: string[];
    priority: string;
    complexity: string;
  }>;
  nonFunctionalRequirements: Array<{
    id: string;
    category: string;
    description: string;
    testCriteria: string[];
  }>;
  testScenarios: Array<{
    id: string;
    title: string;
    description: string;
    preconditions: string[];
    steps: string[];
    expectedResults: string[];
    testData: string[];
  }>;
  testTypes: Array<{
    type: string;
    description: string;
    coverage: string;
    tools: string[];
  }>;
  summary: string;
  metadata: {
    aiModel: string;
    totalTestScenarios: number;
    estimatedTestTime: string;
    testabilityScore: number;
    assumptions: string[];
  };
}

export interface AIAnalysisResult {
  type: 'testcases' | 'checklist' | 'documentation-analysis' | 'developer-analysis' | 'manager-analysis' | 'structuredTesting';
  data: TestCase[] | ChecklistItem[] | DocumentationAnalysis | DeveloperAnalysis | ManagerAnalysis | StructuredTesting;
  summary?: string;
  reasoning?: string; // Chain of Thought reasoning for deepseek-reasoner
  metadata?: {
    totalRequirements?: number;
    functionalRequirements?: number;
    nonFunctionalRequirements?: number;
    estimatedTestTime?: string;
    documentationQuality?: 'Good' | 'Average' | 'Poor';
    originalDocumentQuality?: 'Good' | 'Average' | 'Poor';
    assumptions?: string[];
    contradictions?: string[];
    missingInformation?: string[];
    checklistType?: 'Smoke' | 'Regression' | 'Acceptance' | 'Exploratory';
    modules?: string[];
    categories?: string[];
    aiModel?: string;
  };
}

class AIService {
  // Method to get list of available models
  private getAvailableModels(): string[] {
    const availableModels: string[] = [];

    if (config.DEEPSEEK_API_KEY && config.DEEPSEEK_API_KEY.trim() !== '') {
      availableModels.push('deepseek', 'deepseek-reasoner');
    }

    if (config.OPENROUTER_API_KEY && config.OPENROUTER_API_KEY.trim() !== '') {
      availableModels.push('grok-3');
    }

    if (config.NEBIUS_API_KEY && config.NEBIUS_API_KEY.trim() !== '') {
      availableModels.push('gpt-4', 'qwen');
    }

    if (availableModels.length === 0) {
      availableModels.push('deepseek');
    }

    return availableModels;
  }

  private async callGrokAPI(prompt: string): Promise<string> {
    const result = await this.callProviderAPI({
      url: config.OPENROUTER_API_URL,
      apiKey: config.OPENROUTER_API_KEY,
      model: 'xai/grok-beta',
      systemPrompt: 'You are a software testing expert. Your task is to analyze technical requirements and create quality test cases and checklists.',
      userPrompt: prompt,
      headers: {
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Q-AI Test Case Generator',
      },
    });
    return result.content;
  }

  // callOpenAIAPI removed - unused

  private async callNebiusGPT4API(prompt: string, role: 'manager' | 'developer' | 'tester' | 'analyst' = 'tester'): Promise<string> {
    const systemPrompts = this.getRoleSystemPrompts(role);
    const result = await this.callProviderAPI({
      url: config.NEBIUS_API_URL,
      apiKey: config.NEBIUS_API_KEY,
      model: 'openai/gpt-oss-20b',
      systemPrompt: systemPrompts,
      userPrompt: prompt,
    });
    return result.content;
  }

  private async callNebiusQwenAPI(prompt: string, role: 'manager' | 'developer' | 'tester' | 'analyst' = 'tester'): Promise<string> {
    const systemPrompts = this.getRoleSystemPrompts(role);
    const result = await this.callProviderAPI({
      url: config.NEBIUS_API_URL,
      apiKey: config.NEBIUS_API_KEY,
      model: 'Qwen/Qwen3-30B-A3B',
      systemPrompt: systemPrompts,
      userPrompt: prompt,
      useContentArray: true, // Qwen-specific
    });
    return result.content;
  }

  private async callDeepSeekAPI(prompt: string, role: 'manager' | 'developer' | 'tester' | 'analyst' = 'tester'): Promise<string> {
    const systemPrompts = this.getRoleSystemPrompts(role);
    const result = await this.callProviderAPI({
      url: config.DEEPSEEK_API_URL,
      apiKey: config.DEEPSEEK_API_KEY,
      model: 'deepseek-chat',
      systemPrompt: systemPrompts,
      userPrompt: prompt,
    });
    return result.content;
  }

  private async callDeepSeekReasonerAPI(prompt: string, role: 'manager' | 'developer' | 'tester' | 'analyst' = 'tester'): Promise<{ content: string; reasoning: string }> {
    const systemPrompts = this.getRoleSystemPrompts(role);
    const result = await this.callProviderAPI({
      url: config.DEEPSEEK_API_URL,
      apiKey: config.DEEPSEEK_API_KEY,
      model: 'deepseek-reasoner',
      systemPrompt: systemPrompts + ' Use logical reasoning for analysis.',
      userPrompt: prompt,
      isReasoner: true, // DeepSeek reasoner-specific
    });
    return { content: result.content, reasoning: result.reasoning || '' };
  }

  /**
   * Get system prompts for different roles
   */
  private getRoleSystemPrompts(role: string): string {
    const prompts: Record<string, string> = {
      manager: 'You are a software development project management expert. Your tasks include analyzing technical requirements and making them transparent by extracting project goals, priorities, key implementation components, and overall overview.',
      developer: 'You are a software development expert. Your tasks include analyzing technical requirements and extracting structured functional and non-functional requirements, constraints, and implementation scenarios to simplify development.',
      tester: 'You are a software testing expert. Your tasks include analyzing technical requirements and creating formalized acceptance criteria, test scenarios, and recommendations for test types to build quality test cases.',
      analyst: 'You are a software requirements analysis expert. Your tasks include analyzing technical requirements, structuring and normalizing them, identifying contradictions and missing information to improve requirements.',
    };
    return prompts[role] || prompts.tester;
  }

  /**
   * Unified API caller for all AI providers
   */
  private async callProviderAPI(options: {
    url: string;
    apiKey: string;
    model: string;
    systemPrompt: string;
    userPrompt: string;
    headers?: Record<string, string>;
    useContentArray?: boolean;
    isReasoner?: boolean;
  }): Promise<{ content: string; reasoning?: string }> {
    const { url, apiKey, model, systemPrompt, userPrompt, headers, useContentArray, isReasoner } = options;

    if (!apiKey || apiKey.trim() === '') {
      throw new Error(`API key not configured for model ${model}`);
    }

    const messageContent = useContentArray 
      ? [{ type: 'text', text: userPrompt }]
      : userPrompt;

    const body: any = {
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: messageContent },
      ],
    };

    // Add parameters based on model type
    if (isReasoner) {
      body.max_tokens = 32768;
    } else {
      body.temperature = 0.3;
      body.max_tokens = 4000;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        ...headers,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`${model} API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const message = data.choices[0].message;

    return {
      content: message.content,
      reasoning: message.reasoning_content,
    };
  }

  private async callAIAPI(prompt: string, forceModel?: string | null, role: 'manager' | 'developer' | 'tester' | 'analyst' = 'tester'): Promise<{ response: string; model: string; reasoning?: string }> {

    try {
      let modelToUse = forceModel || config.AI_MODEL;

      if (!forceModel) {
        const availableModels = this.getAvailableModels();

        if (!availableModels.includes(modelToUse)) {
          const originalModel = modelToUse;
          modelToUse = availableModels[0] || 'deepseek';

          try {
            toast.warning(`Model ${originalModel} unavailable. Using ${config.AI_MODELS[modelToUse as keyof typeof config.AI_MODELS].name}`);
          } catch (e) {
            // Ignore toast errors
          }
        }
      }

      switch (modelToUse) {
         case 'grok-3':
           if (config.OPENROUTER_API_KEY) {
             const response = await this.callGrokAPI(prompt);
             return { response, model: 'grok-3' };
           } else {
             throw new Error('OpenRouter API key required for Grok-3 model. Add VITE_OPENROUTER_API_KEY to .env.local file');
           }

         case 'gpt-4':
           if (config.NEBIUS_API_KEY) {
             const response = await this.callNebiusGPT4API(prompt, role);
             return { response, model: 'gpt-4' };
           } else {
             throw new Error('Nebius API key required for GPT-4 model. Add VITE_NEBIUS_API_KEY to .env.local file');
           }

         case 'qwen':
           if (config.NEBIUS_API_KEY) {
             const response = await this.callNebiusQwenAPI(prompt, role);
             return { response, model: 'Qwen3-30B-A3B' };
           } else {
             throw new Error('Nebius API key required for Qwen model. Add VITE_NEBIUS_API_KEY to .env.local file');
           }

         case 'deepseek':
            if (config.DEEPSEEK_API_KEY) {
              const response = await this.callDeepSeekAPI(prompt, role);
              return { response, model: 'deepseek-chat' };
            } else {
              throw new Error('DeepSeek API key required for DeepSeek model. Add VITE_DEEPSEEK_API_KEY to .env.local file');
            }

          case 'deepseek-reasoner':
            if (config.DEEPSEEK_API_KEY) {
              const result = await this.callDeepSeekReasonerAPI(prompt, role);
              return { response: result.content, model: 'deepseek-reasoner', reasoning: result.reasoning };
            } else {
              throw new Error('DeepSeek API key required for DeepSeek Reasoner model. Add VITE_DEEPSEEK_API_KEY to .env.local file');
            }

         default:
           throw new Error(`Unknown AI model: ${config.AI_MODEL}`);
       }
    } catch (error) {
      console.error('AI API call failed:', error);
      throw error;
    }
  }
//Mode 3. Requirements Analysis 
  async analyzeRequirements(content: string, outputType: 'testcases' | 'checklist' | 'documentation-analysis' = 'testcases'): Promise<AIAnalysisResult> {
        let prompt: string;
    let forceModel: string | null = null;
    let role: 'manager' | 'developer' | 'tester' | 'analyst' = 'tester';
    
    if (outputType === 'documentation-analysis') {
      prompt = documentationPreprocessingPrompt(content);
      forceModel = 'deepseek'; // Force DeepSeek for documentation analysis
      role = 'analyst'; // Use analyst role for documentation analysis
    } else {
      prompt = outputType === 'testcases' 
        ? testCasesPrompt(content)
        : checklistPrompt(content);
      role = 'tester'; // Use tester role for test cases and checklists
    }

    try {
      const { response, model, reasoning } = await this.callAIAPI(prompt, forceModel, role);
      
      // Try to extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid JSON response from AI');
      }

      const result = JSON.parse(jsonMatch[0]);
      
      // Result validation
      if (!result.type || !result.data) {
        throw new Error('Invalid response structure from AI');
      }

      // For documentation-analysis data is not an array
      if (outputType !== 'documentation-analysis' && !Array.isArray(result.data)) {
        throw new Error('Invalid response structure from AI');
      }

      // Add model information to result
      const analysisResult = result as AIAnalysisResult;
      if (analysisResult.metadata) {
        analysisResult.metadata.aiModel = model;
      } else {
        analysisResult.metadata = { aiModel: model } as any;
      }

      // Add reasoning if available
      if (reasoning) {
        analysisResult.reasoning = reasoning;
      }

      return analysisResult;
    } catch (error) {
      console.error('AI analysis failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`AI analysis error: ${errorMessage}`);
    }
  }

  async generateTestCases(content: string): Promise<TestCase[]> {
    const result = await this.analyzeRequirements(content, 'testcases');
    if (result.type !== 'testcases') {
      throw new Error('Expected testcases but got checklist');
    }
    return result.data as TestCase[];
  }

  async generateChecklist(content: string): Promise<ChecklistItem[]> {
    const result = await this.analyzeRequirements(content, 'checklist');
    if (result.type !== 'checklist') {
      throw new Error('Expected checklist but got testcases');
    }
    return result.data as ChecklistItem[];
  }

  async analyzeDocumentation(content: string): Promise<DocumentationAnalysis> {
    const result = await this.analyzeRequirements(content, 'documentation-analysis');
    if (result.type !== 'documentation-analysis') {
      throw new Error('Expected documentation analysis but got different type');
    }
    return result.data as DocumentationAnalysis;
  }

  async enhanceTestCases(testCases: TestCase[], feedback: string): Promise<TestCase[]> {

    const prompt = enhancementPrompt(testCases, feedback);

    try {
      const { response } = await this.callAIAPI(prompt);
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid JSON response from AI');
      }

      const result = JSON.parse(jsonMatch[0]);
      return result.data as TestCase[];
    } catch (error) {
      console.error('Test case enhancement failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Test case enhancement error: ${errorMessage}`);
    }
  }

  async analyzeWithRole(content: string, role: 'analyst' | 'developer' | 'manager' | 'tester'): Promise<AIAnalysisResult> {
    // Choose prompt based on role
    let prompt: string;
    let forceModel: string | null = null; // Don't force specific model

    switch (role) {
      case 'analyst':
        prompt = analystPrompt(content);
        break;
      case 'developer':
        prompt = developerPrompt(content);
        break;
      case 'manager':
        prompt = managerPrompt(content);
        break;
      case 'tester':
        prompt = testerPrompt(content);
        break;
      default:
        prompt = analystPrompt(content); // Default use analyst
    }

    try {
      // Use available model from configuration
      const { response, model, reasoning } = await this.callAIAPI(prompt, forceModel, role);
      
      // Try to extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid JSON response from AI');
      }

      const result = JSON.parse(jsonMatch[0]);
      
      // Result validation - check for new structure with structuredTesting
      if (!result.structuredTesting && (!result.type || !result.data)) {
        throw new Error('Invalid response structure from AI');
      }

      // Transform new structure to expected format if needed
      let analysisResult: AIAnalysisResult;
      if (result.structuredTesting) {
        // New structure from Nebius models
        analysisResult = {
          type: 'structuredTesting',
          data: result.structuredTesting,
          summary: result.summary || '',
          metadata: result.metadata || {}
        } as AIAnalysisResult;
      } else {
        // Legacy structure
        analysisResult = result as AIAnalysisResult;
      }

      // Add model information to result
      if (analysisResult.metadata) {
        analysisResult.metadata.aiModel = model;
      } else {
        analysisResult.metadata = { aiModel: model } as any;
      }

      // Add reasoning if available
      if (reasoning) {
        analysisResult.reasoning = reasoning;
      }

      return analysisResult;
    } catch (error) {
      console.error('AI analysis with role failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`AI analysis error with role ${role} (model: ${config.AI_MODEL}): ${errorMessage}`);
    }
  }
}

export const aiService = new AIService();
