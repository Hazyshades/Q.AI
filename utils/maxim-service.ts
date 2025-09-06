// Maxim AI Service - integration with Maxim SDK
// Documentation: https://www.getmaxim.ai/docs/offline-evals/via-sdk/prompts/quickstart

export interface MaximConfig {
  apiKey: string;
  workspaceId: string;
  baseUrl?: string;
}

export interface MaximTestRun {
  id: string;
  name: string;
  status: 'running' | 'completed' | 'failed';
  results: MaximEvaluatorResults;
  link: string;
  createdAt: Date;
  workspaceId: string;
}

export interface MaximEvaluatorResults {
  bias: number;
  accuracy: number;
  consistency: number;
  relevance: number;
  overall: number;
}

export interface MaximInsight {
  id: string;
  type: 'improvement' | 'warning' | 'success' | 'recommendation' | 'risk';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  category: string;
  timestamp: Date;
  actionable: boolean;
  confidence: number;
  maximScore: number;
  evaluatorResults: MaximEvaluatorResults;
  testRunId: string;
}

export interface MaximDataset {
  id: string;
  name: string;
  description: string;
  dataStructure: Record<string, string>;
  rowCount: number;
}

export interface MaximPrompt {
  id: string;
  name: string;
  version: string;
  content: string;
  description: string;
}

class MaximService {
  private static instance: MaximService;
  private config: MaximConfig | null = null;
  private baseUrl = 'https://api.getmaxim.ai';

  static getInstance(): MaximService {
    if (!MaximService.instance) {
      MaximService.instance = new MaximService();
    }
    return MaximService.instance;
  }

  initialize(config: MaximConfig): void {
    this.config = config;
    console.log('Maxim AI Service initialized');
  }

  isInitialized(): boolean {
    return this.config !== null && this.config.apiKey !== '';
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    if (!this.isInitialized()) {
      throw new Error('Maxim AI Service not initialized. Call initialize() first.');
    }

    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.config!.apiKey}`,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        throw new Error(`Maxim API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Maxim API request failed:', error);
      throw error;
    }
  }

  // Create test run according to Maxim documentation
  async createTestRun(name: string, options: {
    dataStructure?: Record<string, string>;
    datasetId?: string;
    evaluators?: string[];
    promptVersionId?: string;
  } = {}): Promise<MaximTestRun> {
    const payload = {
      name,
      workspace_id: this.config!.workspaceId,
      data_structure: options.dataStructure || {
        input: "INPUT",
        expected_output: "EXPECTED_OUTPUT",
      },
      dataset_id: options.datasetId,
      evaluators: options.evaluators || ["Bias", "Accuracy", "Consistency", "Relevance"],
      prompt_version_id: options.promptVersionId,
    };

    try {
      const response = await this.makeRequest('/test-runs', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const testRun: MaximTestRun = {
        id: response.id,
        name: response.name,
        status: 'running',
        results: {
          bias: 0,
          accuracy: 0,
          consistency: 0,
          relevance: 0,
          overall: 0,
        },
        link: `https://app.getmaxim.ai/test-runs/${response.id}`,
        createdAt: new Date(),
        workspaceId: this.config!.workspaceId,
      };

      // Run test run
      await this.runTestRun(testRun.id);
      
      return testRun;
    } catch (error) {
      console.error('Failed to create Maxim test run:', error);
      throw error;
    }
  }

  // Run test run
  async runTestRun(testRunId: string): Promise<void> {
    try {
      await this.makeRequest(`/test-runs/${testRunId}/run`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Failed to run Maxim test run:', error);
      throw error;
    }
  }

  // Get test run results
  async getTestRunResults(testRunId: string): Promise<MaximEvaluatorResults> {
    try {
      const response = await this.makeRequest(`/test-runs/${testRunId}/results`);
      
      // Process evaluator results
      const results: MaximEvaluatorResults = {
        bias: response.evaluators?.bias?.score || 0,
        accuracy: response.evaluators?.accuracy?.score || 0,
        consistency: response.evaluators?.consistency?.score || 0,
        relevance: response.evaluators?.relevance?.score || 0,
        overall: 0,
      };

      // Calculate overall score
      const scores = [results.bias, results.accuracy, results.consistency, results.relevance];
      results.overall = scores.reduce((sum, score) => sum + score, 0) / scores.length;

      return results;
    } catch (error) {
      console.error('Failed to get Maxim test run results:', error);
      throw error;
    }
  }

  // Get list of available evaluators
  async getAvailableEvaluators(): Promise<string[]> {
    try {
      const response = await this.makeRequest('/evaluators');
      return response.evaluators?.map((e: any) => e.name) || [];
    } catch (error) {
      console.error('Failed to get Maxim evaluators:', error);
      return ['Bias', 'Accuracy', 'Consistency', 'Relevance']; // Fallback
    }
  }

  // Get list of datasets
  async getDatasets(): Promise<MaximDataset[]> {
    try {
      const response = await this.makeRequest('/datasets');
      return response.datasets?.map((d: any) => ({
        id: d.id,
        name: d.name,
        description: d.description,
        dataStructure: d.data_structure,
        rowCount: d.row_count,
      })) || [];
    } catch (error) {
      console.error('Failed to get Maxim datasets:', error);
      return [];
    }
  }

  // Get list of prompts
  async getPrompts(): Promise<MaximPrompt[]> {
    try {
      const response = await this.makeRequest('/prompts');
      return response.prompts?.map((p: any) => ({
        id: p.id,
        name: p.name,
        version: p.version,
        content: p.content,
        description: p.description,
      })) || [];
    } catch (error) {
      console.error('Failed to get Maxim prompts:', error);
      return [];
    }
  }

  // Test quality analysis using Maxim
  async analyzeTestQuality(testData: {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    coverage: number;
    executionTime: number;
  }): Promise<MaximInsight[]> {
    const insights: MaximInsight[] = [];

    try {
      // Create test run for quality analysis
      const testRun = await this.createTestRun('QA Test Quality Analysis', {
        dataStructure: {
          test_metrics: 'TEST_METRICS',
          quality_score: 'QUALITY_SCORE',
          recommendations: 'RECOMMENDATIONS',
        },
        evaluators: ['Bias', 'Accuracy', 'Consistency', 'Relevance'],
      });

      // Wait for analysis completion
      await this.waitForTestRunCompletion(testRun.id);

      // Get results
      const results = await this.getTestRunResults(testRun.id);

      // Generate insights based on Maxim results
      if (testData.coverage < 80) {
        insights.push({
          id: `coverage-${Date.now()}`,
          type: 'improvement',
          title: 'Test Coverage of Critical Modules',
          description: `Test coverage is ${testData.coverage.toFixed(1)}%. Maxim recommends adding test cases to achieve 80%+ coverage.`,
          impact: 'high',
          category: 'Coverage',
          timestamp: new Date(),
          actionable: true,
          confidence: results.accuracy,
          maximScore: results.overall,
          evaluatorResults: results,
          testRunId: testRun.id,
        });
      }

      if (testData.failedTests > testData.totalTests * 0.1) {
        insights.push({
          id: `reliability-${Date.now()}`,
          type: 'warning',
          title: 'Test Reliability',
          description: `Test success rate is ${((testData.passedTests / testData.totalTests) * 100).toFixed(1)}%. Maxim identified reliability issues.`,
          impact: 'medium',
          category: 'Reliability',
          timestamp: new Date(),
          actionable: true,
          confidence: results.consistency,
          maximScore: results.overall,
          evaluatorResults: results,
          testRunId: testRun.id,
        });
      }

      // Overall quality analysis
      insights.push({
        id: `quality-analysis-${Date.now()}`,
        type: 'recommendation',
        title: 'AI-powered Test Quality Analysis',
        description: `Maxim analyzed your test quality. Overall score: ${(results.overall * 100).toFixed(1)}/100.`,
        impact: 'medium',
        category: 'Quality',
        timestamp: new Date(),
        actionable: true,
        confidence: results.accuracy,
        maximScore: results.overall,
        evaluatorResults: results,
        testRunId: testRun.id,
      });

    } catch (error) {
      console.error('Failed to analyze test quality with Maxim:', error);
      
      // Fallback insights without Maxim
      insights.push({
        id: `fallback-${Date.now()}`,
        type: 'recommendation',
        title: 'Maxim AI unavailable',
        description: 'Failed to connect to Maxim AI. Check API configuration.',
        impact: 'low',
        category: 'System',
        timestamp: new Date(),
        actionable: false,
        confidence: 0.5,
        maximScore: 0.5,
        evaluatorResults: {
          bias: 0.5,
          accuracy: 0.5,
          consistency: 0.5,
          relevance: 0.5,
          overall: 0.5,
        },
        testRunId: 'fallback',
      });
    }

    return insights;
  }

  // Wait for test run completion
  private async waitForTestRunCompletion(testRunId: string, maxWaitTime: number = 30000): Promise<void> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitTime) {
      try {
        const response = await this.makeRequest(`/test-runs/${testRunId}`);
        
        if (response.status === 'completed' || response.status === 'failed') {
          return;
        }
        
        // Wait 2 seconds before next check
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.warn('Failed to check test run status:', error);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    throw new Error('Test run timeout exceeded');
  }

  // Export Maxim report
  async exportReport(testRunId: string): Promise<string> {
    try {
      const response = await this.makeRequest(`/test-runs/${testRunId}/export`);
      return JSON.stringify(response, null, 2);
    } catch (error) {
      console.error('Failed to export Maxim report:', error);
      throw error;
    }
  }

  // Check API health
  async healthCheck(): Promise<boolean> {
    try {
      await this.makeRequest('/health');
      return true;
    } catch (error) {
      console.error('Maxim API health check failed:', error);
      return false;
    }
  }
}

export const maximService = MaximService.getInstance();
