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
    
    // Check availability of each model
    if (config.DEEPSEEK_API_KEY && config.DEEPSEEK_API_KEY.trim() !== '') {
      availableModels.push('deepseek', 'deepseek-reasoner');
      console.log('✅ DeepSeek API key found - models available: deepseek, deepseek-reasoner');
    } else {
      console.log('❌ DeepSeek API key missing or empty');
    }
    
    if (config.OPENROUTER_API_KEY && config.OPENROUTER_API_KEY.trim() !== '') {
      availableModels.push('grok-3');
      console.log('✅ OpenRouter API key found - models available: grok-3');
    } else {
      console.log('❌ OpenRouter API key missing or empty');
    }
    
    if (config.NEBIUS_API_KEY && config.NEBIUS_API_KEY.trim() !== '') {
      availableModels.push('gpt-4', 'qwen');
      console.log('✅ Nebius API key found - models available: gpt-4, qwen');
    } else {
      console.log('❌ Nebius API key missing or empty');
    }
    
    // If no models available, return DeepSeek as fallback
    if (availableModels.length === 0) {
      availableModels.push('deepseek');
      console.log('⚠️ No available API keys, using DeepSeek as fallback');
    }
    
    console.log('📋 Available models:', availableModels);
    return availableModels;
  }

  private async callGrokAPI(prompt: string): Promise<string> {
    try {
      // Call Grok API
      
      if (!config.OPENROUTER_API_KEY || config.OPENROUTER_API_KEY.trim() === '') {
        throw new Error('OpenRouter API key not configured or empty');
      }
      
      const response = await fetch(config.OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.OPENROUTER_API_KEY}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Q-AI Test Case Generator'
        },
        body: JSON.stringify({
          model: 'xai/grok-beta',
          messages: [
            {
              role: 'system',
              content: 'You are a software testing expert. Your task is to analyze technical requirements and create quality test cases and checklists.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 4000
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenRouter API response:', errorText);
        throw new Error(`OpenRouter Grok API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('OpenRouter Grok API error:', error);
      throw error;
    }
  }

  private async callOpenAIAPI(prompt: string): Promise<string> {
    try {
      const response = await fetch(config.OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.OPENROUTER_API_KEY}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Q-AI Test Case Generator'
        },
        body: JSON.stringify({
          model: 'openai/gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are a software testing expert. Your task is to analyze technical requirements and create quality test cases and checklists.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 4000
        })
      });

      if (!response.ok) {
        throw new Error(`OpenRouter GPT-4 API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('OpenRouter GPT-4 API error:', error);
      throw error;
    }
  }

  private async callNebiusGPT4API(prompt: string, role: 'manager' | 'developer' | 'tester' | 'analyst' = 'tester'): Promise<string> {
    // Determine system prompt based on role
    const systemPrompts = {
      manager: 'You are a software development project management expert. Your tasks include analyzing technical requirements and making them transparent by extracting project goals, priorities, key implementation components, and overall overview.',
      developer: 'You are a software development expert. Your tasks include analyzing technical requirements and extracting structured functional and non-functional requirements, constraints, and implementation scenarios to simplify development.',
      tester: 'You are a software testing expert. Your tasks include analyzing technical requirements and creating formalized acceptance criteria, test scenarios, and recommendations for test types to build quality test cases.',
      analyst: 'You are a software requirements analysis expert. Your tasks include analyzing technical requirements, structuring and normalizing them, identifying contradictions and missing information to improve requirements.'
    };

    try {
      const response = await fetch(config.NEBIUS_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.NEBIUS_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'openai/gpt-oss-20b',
          messages: [
            {
              role: 'system',
              content: systemPrompts[role]
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 4000
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Nebius GPT-4 API response:', errorText);
        throw new Error(`Nebius GPT-4 API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Nebius GPT-4 API error:', error);
      throw error;
    }
  }

  private async callNebiusQwenAPI(prompt: string, role: 'manager' | 'developer' | 'tester' | 'analyst' = 'tester'): Promise<string> {
    // Determine system prompt based on role
    const systemPrompts = {
      manager: 'You are a software development project management expert. Your tasks include analyzing technical requirements and making them transparent by extracting project goals, priorities, key implementation components, and overall overview.',
      developer: 'You are a software development expert. Your tasks include analyzing technical requirements and extracting structured functional and non-functional requirements, constraints, and implementation scenarios to simplify development.',
      tester: 'You are a software testing expert. Your tasks include analyzing technical requirements and creating formalized acceptance criteria, test scenarios, and recommendations for test types to build quality test cases.',
      analyst: 'You are a software requirements analysis expert. Your tasks include analyzing technical requirements, structuring and normalizing them, identifying contradictions and missing information to improve requirements.'
    };

    try {
      const response = await fetch(config.NEBIUS_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.NEBIUS_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'Qwen/Qwen3-30B-A3B',
          messages: [
            {
              role: 'system',
              content: systemPrompts[role]
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: prompt
                }
              ]
            }
          ],
          temperature: 0.3,
          max_tokens: 4000
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Nebius Qwen API response:', errorText);
        throw new Error(`Nebius Qwen API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Nebius Qwen API error:', error);
      throw error;
    }
  }

  private async callDeepSeekAPI(prompt: string, role: 'manager' | 'developer' | 'tester' | 'analyst' = 'tester'): Promise<string> {
    // Determine system prompt based on role
    const systemPrompts = {
      manager: 'You are a software development project management expert. Your tasks include analyzing technical requirements and making them transparent by extracting project goals, priorities, key implementation components, and overall overview.',
      developer: 'You are a software development expert. Your tasks include analyzing technical requirements and extracting structured functional and non-functional requirements, constraints, and implementation scenarios to simplify development.',
      tester: 'You are a software testing expert. Your tasks include analyzing technical requirements and creating formalized acceptance criteria, test scenarios, and recommendations for test types to build quality test cases.',
      analyst: 'You are a software requirements analysis expert. Your tasks include analyzing technical requirements, structuring and normalizing them, identifying contradictions and missing information to improve requirements.'
    };

    try {
      const response = await fetch(config.DEEPSEEK_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: systemPrompts[role]
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 4000
        })
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('DeepSeek API error:', error);
      throw error;
    }
  }

  private async callDeepSeekReasonerAPI(prompt: string, role: 'manager' | 'developer' | 'tester' | 'analyst' = 'tester'): Promise<{ content: string; reasoning: string }> {
    // Determine system prompt based on role
    const systemPrompts = {
      manager: 'You are a software development project management expert. Your tasks include analyzing technical requirements and making them transparent by extracting project goals, priorities, key implementation components, and overall overview. Use logical reasoning for analysis.',
      developer: 'You are a software development expert. Your tasks include analyzing technical requirements and extracting structured functional and non-functional requirements, constraints, and implementation scenarios to simplify development. Use logical reasoning for analysis.',
      tester: 'You are a software testing expert. Your tasks include analyzing technical requirements and creating formalized acceptance criteria, test scenarios, and recommendations for test types to build quality test cases. Use logical reasoning for analysis.',
      analyst: 'You are a software requirements analysis expert. Your tasks include analyzing technical requirements, structuring and normalizing them, identifying contradictions and missing information to improve requirements. Use logical reasoning for analysis.'
    };

    try {
      const response = await fetch(config.DEEPSEEK_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'deepseek-reasoner',
          messages: [
            {
              role: 'system',
              content: systemPrompts[role]
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 32768
          // temperature not supported for deepseek-reasoner
        })
      });

      if (!response.ok) {
        throw new Error(`DeepSeek Reasoner API error: ${response.status}`);
      }

      const data = await response.json();
      const message = data.choices[0].message;
      
      return {
        content: message.content,
        reasoning: message.reasoning_content || ''
      };
    } catch (error) {
      console.error('DeepSeek Reasoner API error:', error);
      throw error;
    }
  }

  private async callAIAPI(prompt: string, forceModel?: string | null, role: 'manager' | 'developer' | 'tester' | 'analyst' = 'tester'): Promise<{ response: string; model: string; reasoning?: string }> {
    // Call AI API
    // AI API call
    
    try {
      // Use forced model or selected model from configuration
      let modelToUse = forceModel || config.AI_MODEL;
      
      // Check model availability and switch to available one if needed
      if (!forceModel) {
        const availableModels = this.getAvailableModels();
        console.log(`🔍 Checking model availability: ${modelToUse}`);
        console.log(`📋 Available models: ${availableModels.join(', ')}`);
        
        if (!availableModels.includes(modelToUse)) {
          const originalModel = modelToUse;
          console.warn(`⚠️ Model ${modelToUse} unavailable. Switching to available model.`);
          modelToUse = availableModels[0] || 'deepseek';
          console.log(`🔄 Switched to model: ${modelToUse}`);
          
          // Show notification to user
          try {
            toast.warning(`Model ${originalModel} unavailable. Using ${config.AI_MODELS[modelToUse as keyof typeof config.AI_MODELS].name}`);
          } catch (e) {
            // Ignore toast errors if unavailable
          }
        } else {
          console.log(`✅ Model ${modelToUse} available`);
        }
      }
      
      switch (modelToUse) {
         case 'grok-3':
           if (config.OPENROUTER_API_KEY) {
             // Call Grok-3 API via OpenRouter
             const response = await this.callGrokAPI(prompt);
             return { response, model: 'grok-3' };
           } else {
             console.error('❌ OpenRouter API key not configured for Grok-3 model!');
             throw new Error('OpenRouter API key required for Grok-3 model. Add VITE_OPENROUTER_API_KEY to .env.local file');
           }
           
         case 'gpt-4':
           if (config.NEBIUS_API_KEY) {
             // Call GPT-4 API via Nebius
             const response = await this.callNebiusGPT4API(prompt, role);
             return { response, model: 'gpt-4' };
           } else {
             console.error('❌ Nebius API key not configured for GPT-4 model!');
             throw new Error('Nebius API key required for GPT-4 model. Add VITE_NEBIUS_API_KEY to .env.local file');
           }
           
         case 'qwen':
           if (config.NEBIUS_API_KEY) {
             // Call Qwen API via Nebius
             const response = await this.callNebiusQwenAPI(prompt, role);
             return { response, model: 'Qwen3-30B-A3B' };
           } else {
             console.error('❌ Nebius API key not configured for Qwen model!');
             throw new Error('Nebius API key required for Qwen model. Add VITE_NEBIUS_API_KEY to .env.local file');
           }
           
                   case 'deepseek':
            if (config.DEEPSEEK_API_KEY) {
              // Call DeepSeek API with specified role
              const response = await this.callDeepSeekAPI(prompt, role);
              return { response, model: 'deepseek-chat' };
            } else {
              console.error('❌ DeepSeek API key not configured!');
              throw new Error('DeepSeek API key required for DeepSeek model. Add VITE_DEEPSEEK_API_KEY to .env.local file');
            }
            
          case 'deepseek-reasoner':
            if (config.DEEPSEEK_API_KEY) {
              // Call DeepSeek Reasoner API with specified role
              const result = await this.callDeepSeekReasonerAPI(prompt, role);
              return { response: result.content, model: 'deepseek-reasoner', reasoning: result.reasoning };
            } else {
              console.error('❌ DeepSeek API key not configured!');
              throw new Error('DeepSeek API key required for DeepSeek Reasoner model. Add VITE_DEEPSEEK_API_KEY to .env.local file');
            }
           
         default:
           console.error(`❌ Unknown model: ${config.AI_MODEL}`);
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
