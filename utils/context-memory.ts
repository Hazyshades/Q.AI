import { supabase } from './supabase-client';
import { config } from './config';

export interface ContextMemory {
  id: string;
  projectId: string;
  sessionId: string;
  timestamp: number;
  type: 'testcases' | 'checklist' | 'enhancement' | 'feedback';
  content: string;
  result: any;
  metadata: {
    requirements: string[];
    modules: string[];
    categories: string[];
    priorities: string[];
    quality: 'excellent' | 'good' | 'average' | 'poor';
    feedback?: string;
    improvements?: string[];
    userPreferences?: {
      detailLevel: 'basic' | 'detailed' | 'comprehensive';
      focusAreas: string[];
      excludedModules?: string[];
    };
  };
  context: {
    previousResults: string[];
    commonPatterns: string[];
    recurringIssues: string[];
    successfulApproaches: string[];
  };
}

export interface ProjectContext {
  projectId: string;
  name: string;
  description: string;
  createdAt: number;
  lastUpdated: number;
  totalSessions: number;
  totalTestCases: number;
  totalChecklists: number;
  averageQuality: number;
  commonModules: string[];
  commonCategories: string[];
  userPreferences: {
    detailLevel: 'basic' | 'detailed' | 'comprehensive';
    focusAreas: string[];
    excludedModules: string[];
    preferredFormat: 'table' | 'cards' | 'detailed';
  };
  learningData: {
    successfulPatterns: string[];
    commonIssues: string[];
    improvementSuggestions: string[];
    qualityTrends: {
      date: string;
      quality: number;
      count: number;
    }[];
  };
}

class ContextMemoryService {
  private supabase: any;
  private currentProjectId: string | null = null;
  private currentSessionId: string | null = null;

  constructor() {
    this.supabase = supabase;
    
    // Restore currentProjectId from localStorage
    const savedProjectId = localStorage.getItem('currentProjectId');
    if (savedProjectId) {
      this.currentProjectId = savedProjectId;
    }
  }

  // Project initialization
  async initializeProject(projectName: string, description: string = ''): Promise<string> {
    const projectId = `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.currentProjectId = projectId;
    this.currentSessionId = sessionId;
    
    // Save currentProjectId to localStorage for restoration between sessions
    localStorage.setItem('currentProjectId', projectId);

    const projectContext: ProjectContext = {
      projectId,
      name: projectName,
      description,
      createdAt: Date.now(),
      lastUpdated: Date.now(),
      totalSessions: 1,
      totalTestCases: 0,
      totalChecklists: 0,
      averageQuality: 0,
      commonModules: [],
      commonCategories: [],
      userPreferences: {
        detailLevel: 'detailed',
        focusAreas: [],
        excludedModules: [],
        preferredFormat: 'table'
      },
      learningData: {
        successfulPatterns: [],
        commonIssues: [],
        improvementSuggestions: [],
        qualityTrends: []
      }
    };

    await this.saveProjectContext(projectContext);
    return projectId;
  }

  // Save context memory
  async saveContextMemory(memory: Omit<ContextMemory, 'id' | 'projectId' | 'sessionId' | 'timestamp'>): Promise<void> {
    if (!this.currentProjectId || !this.currentSessionId) {
      throw new Error('Project not initialized');
    }

    const contextMemory: ContextMemory = {
      ...memory,
      id: `memory_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      projectId: this.currentProjectId,
      sessionId: this.currentSessionId,
      timestamp: Date.now()
    };

    if (this.supabase) {
      const { error } = await this.supabase
        .from('context_memories')
        .insert(contextMemory);
      
      if (error) {
        console.error('Error saving context memory:', error);
        // Fallback to localStorage
        this.saveToLocalStorage(contextMemory);
      }
    } else {
      this.saveToLocalStorage(contextMemory);
    }

    // Update project
    await this.updateProjectStats(memory);
  }

  // Get context for generation improvement
  async getRelevantContext(content: string, type: 'testcases' | 'checklist'): Promise<{
    projectContext: ProjectContext | null;
    recentMemories: ContextMemory[];
    patterns: string[];
    suggestions: string[];
  }> {
    if (!this.currentProjectId) {
      return {
        projectContext: null,
        recentMemories: [],
        patterns: [],
        suggestions: []
      };
    }

    let projectContext: ProjectContext | null = null;
    let recentMemories: ContextMemory[] = [];

    if (this.supabase) {
      // Get project context
      const { data: projectData } = await this.supabase
        .from('project_contexts')
        .select('*')
        .eq('projectId', this.currentProjectId)
        .maybeSingle();

      if (projectData) {
        projectContext = projectData;
      }

      // Get recent memories
      const { data: memoriesData } = await this.supabase
        .from('context_memories')
        .select('*')
        .eq('projectId', this.currentProjectId)
        .eq('type', type)
        .order('timestamp', { ascending: false })
        .limit(10);

      if (memoriesData) {
        recentMemories = memoriesData;
      }
    } else {
      // Fallback to localStorage
      projectContext = this.getProjectContextFromStorage();
      recentMemories = this.getMemoriesFromStorage(type);
    }

    // Analyze patterns and generate suggestions
    const patterns = this.analyzePatterns(recentMemories, content);
    const suggestions = this.generateSuggestions(recentMemories, projectContext, content);

    return {
      projectContext,
      recentMemories,
      patterns,
      suggestions
    };
  }

  // Analyze patterns in historical data
  private analyzePatterns(memories: ContextMemory[], currentContent: string): string[] {
    const patterns: string[] = [];
    
    // Analyze successful approaches
    const successfulApproaches = memories
      .filter(m => m.metadata.quality === 'excellent' || m.metadata.quality === 'good')
      .flatMap(m => m.context.successfulApproaches);

    // Find recurring patterns
    const approachCounts = successfulApproaches.reduce((acc, approach) => {
      acc[approach] = (acc[approach] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Add most frequent patterns
    Object.entries(approachCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .forEach(([pattern]) => patterns.push(pattern));

    // Analyze modules and categories
    const commonModules = memories
      .flatMap(m => m.metadata.modules)
      .filter((module, index, arr) => arr.indexOf(module) === index);

    const commonCategories = memories
      .flatMap(m => m.metadata.categories)
      .filter((category, index, arr) => arr.indexOf(category) === index);

    patterns.push(`Frequently used modules: ${commonModules.join(', ')}`);
    patterns.push(`Popular categories: ${commonCategories.join(', ')}`);

    return patterns;
  }

  // Generate suggestions based on context
  private generateSuggestions(
    memories: ContextMemory[], 
    projectContext: ProjectContext | null, 
    currentContent: string
  ): string[] {
    const suggestions: string[] = [];

    // Analyze improvements from previous sessions
    const improvements = memories
      .filter(m => m.metadata.improvements)
      .flatMap(m => m.metadata.improvements || []);

    // Add unique improvements
    improvements
      .filter((improvement, index, arr) => arr.indexOf(improvement) === index)
      .slice(0, 3)
      .forEach(improvement => suggestions.push(improvement));

    // Analyze user preferences
    if (projectContext?.userPreferences) {
      const prefs = projectContext.userPreferences;
      
      if (prefs.focusAreas.length > 0) {
        suggestions.push(`Focus on: ${prefs.focusAreas.join(', ')}`);
      }
      
      if (prefs.excludedModules.length > 0) {
        suggestions.push(`Exclude modules: ${prefs.excludedModules.join(', ')}`);
      }

      if (prefs.detailLevel === 'comprehensive') {
        suggestions.push('Create detailed test cases with full coverage');
      } else if (prefs.detailLevel === 'basic') {
        suggestions.push('Create basic test cases with main coverage');
      }
    }

    // Analyze quality of previous results
    const qualityStats = memories.reduce((acc, memory) => {
      const quality = memory.metadata.quality;
      acc[quality] = (acc[quality] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    if (qualityStats.poor > qualityStats.excellent) {
      suggestions.push('Improve test case quality based on previous errors');
    }

    return suggestions;
  }

  // Update project statistics
  private async updateProjectStats(memory: Omit<ContextMemory, 'id' | 'projectId' | 'sessionId' | 'timestamp'>): Promise<void> {
    if (!this.currentProjectId) return;

    let projectContext = await this.getProjectContext(this.currentProjectId);
    if (!projectContext) return;

    // Update counters
    if (memory.type === 'testcases') {
      projectContext.totalTestCases += Array.isArray(memory.result) ? memory.result.length : 1;
    } else if (memory.type === 'checklist') {
      projectContext.totalChecklists += Array.isArray(memory.result) ? memory.result.length : 1;
    }

    // Update average quality
    const qualityScores = { excellent: 4, good: 3, average: 2, poor: 1 };
    const currentScore = qualityScores[memory.metadata.quality];
    
    const totalMemories = projectContext.totalTestCases + projectContext.totalChecklists;
    projectContext.averageQuality = 
      ((projectContext.averageQuality * (totalMemories - 1)) + currentScore) / totalMemories;

    // Update modules and categories
    projectContext.commonModules = [
      ...new Set([...projectContext.commonModules, ...memory.metadata.modules])
    ];
    projectContext.commonCategories = [
      ...new Set([...projectContext.commonCategories, ...memory.metadata.categories])
    ];

    projectContext.lastUpdated = Date.now();

    await this.saveProjectContext(projectContext);
  }

  // Get project context
  private async getProjectContext(projectId: string): Promise<ProjectContext | null> {
    if (this.supabase) {
      const { data, error } = await this.supabase
        .from('project_contexts')
        .select('*')
        .eq('projectId', projectId)
        .maybeSingle();
      
      if (error) {
        console.error('Supabase error:', error);
        return this.getProjectContextFromStorage();
      }
      
      return data;
    } else {
      return this.getProjectContextFromStorage();
    }
  }

  // Get current project context
  async getCurrentProjectContext(): Promise<ProjectContext | null> {
    if (!this.currentProjectId) {
      return null;
    }
    return await this.getProjectContext(this.currentProjectId);
  }

  // Set current project
  setCurrentProject(projectId: string): void {
    this.currentProjectId = projectId;
    localStorage.setItem('currentProjectId', projectId);
  }

  // Clear current project
  clearCurrentProject(): void {
    this.currentProjectId = null;
    localStorage.removeItem('currentProjectId');
  }

  // Save project context
  private async saveProjectContext(projectContext: ProjectContext): Promise<void> {
    if (this.supabase) {
      const { error } = await this.supabase
        .from('project_contexts')
        .upsert(projectContext);
      
      if (error) {
        console.error('Error saving project context to Supabase:', error);
        this.saveProjectContextToStorage(projectContext);
      }
    } else {
      this.saveProjectContextToStorage(projectContext);
    }
  }

  // Fallback methods for localStorage
  private saveToLocalStorage(memory: ContextMemory): void {
    const key = `context_memory_${memory.id}`;
    localStorage.setItem(key, JSON.stringify(memory));
  }

  private getMemoriesFromStorage(type: string): ContextMemory[] {
    const memories: ContextMemory[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('context_memory_')) {
        try {
          const memory = JSON.parse(localStorage.getItem(key) || '');
          if (memory.type === type) {
            memories.push(memory);
          }
        } catch (e) {
          console.error('Error parsing memory from localStorage:', e);
        }
      }
    }
    return memories.sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);
  }

  private getProjectContextFromStorage(): ProjectContext | null {
    const key = `project_context_${this.currentProjectId}`;
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Error parsing project context from localStorage:', e);
      return null;
    }
  }

  private saveProjectContextToStorage(projectContext: ProjectContext): void {
    const key = `project_context_${projectContext.projectId}`;
    localStorage.setItem(key, JSON.stringify(projectContext));
  }

  // Methods for managing user preferences
  async updateUserPreferences(preferences: Partial<ProjectContext['userPreferences']>): Promise<void> {
    if (!this.currentProjectId) return;

    const projectContext = await this.getProjectContext(this.currentProjectId);
    if (!projectContext) return;

    projectContext.userPreferences = {
      ...projectContext.userPreferences,
      ...preferences
    };

    await this.saveProjectContext(projectContext);
  }

  // Methods for getting analytics
  async getProjectAnalytics(): Promise<{
    totalSessions: number;
    totalTestCases: number;
    totalChecklists: number;
    averageQuality: number;
    qualityTrend: { date: string; quality: number }[];
    commonModules: string[];
    commonCategories: string[];
  } | null> {
    if (!this.currentProjectId) return null;

    const projectContext = await this.getProjectContext(this.currentProjectId);
    if (!projectContext) return null;

    return {
      totalSessions: projectContext.totalSessions,
      totalTestCases: projectContext.totalTestCases,
      totalChecklists: projectContext.totalChecklists,
      averageQuality: projectContext.averageQuality,
      qualityTrend: projectContext.learningData.qualityTrends,
      commonModules: projectContext.commonModules,
      commonCategories: projectContext.commonCategories
    };
  }

  // Get recent memories
  async getRecentMemories(limit: number = 10): Promise<ContextMemory[]> {
    if (!this.currentProjectId) return [];

    if (this.supabase) {
      const { data, error } = await this.supabase
        .from('context_memories')
        .select('*')
        .eq('projectId', this.currentProjectId)
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching recent memories:', error);
        return [];
      }

      return data || [];
    } else {
      // Get from localStorage
      const memories: ContextMemory[] = [];
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key?.startsWith('context_memory_')) {
          try {
            const memory = JSON.parse(localStorage.getItem(key) || '');
            if (memory.projectId === this.currentProjectId) {
              memories.push(memory);
            }
          } catch (e) {
            console.error('Error parsing memory from localStorage:', e);
          }
        }
      }
      return memories.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
    }
  }

  // Clear old data
  async cleanupOldData(daysToKeep: number = 30): Promise<void> {
    const cutoffDate = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);

    if (this.supabase) {
      await this.supabase
        .from('context_memories')
        .delete()
        .lt('timestamp', cutoffDate);
    } else {
      // Clear localStorage
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key?.startsWith('context_memory_')) {
          try {
            const memory = JSON.parse(localStorage.getItem(key) || '');
            if (memory.timestamp < cutoffDate) {
              localStorage.removeItem(key);
            }
          } catch (e) {
            // Remove corrupted data
            localStorage.removeItem(key);
          }
        }
      }
    }
  }
}

export const contextMemoryService = new ContextMemoryService();
