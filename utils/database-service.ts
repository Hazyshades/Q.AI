import { supabase } from './supabase-client';
import { AIAnalysisResult } from './ai-service';
import { toast } from 'sonner';

// Types for database operations
export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface GenerationSession {
  id: string;
  user_id: string;
  project_id: string | null;
  session_id: string;
  input_content: string;
  output_type: 'testcases' | 'checklist' | 'documentation-analysis' | 'developer-analysis' | 'manager-analysis' | 'structuredTesting';
  results: AIAnalysisResult;
  ai_model: string | null;
  processing_time_ms: number | null;
  created_at: string;
}

export interface UserSettings {
  user_id: string;
  ai_model: string;
  detail_level: 'low' | 'medium' | 'high';
  focus_areas: string[];
  excluded_modules: string[];
  preferred_output_format: string;
  created_at: string;
  updated_at: string;
}

export interface FavoriteResult {
  id: string;
  user_id: string;
  session_id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface UserStats {
  total_sessions: number;
  total_testcases: number;
  total_checklists: number;
  avg_processing_time: number;
  favorite_count: number;
}

// Service for database operations
export class DatabaseService {
  // === PROJECTS ===
  
  // Create new project
  static async createProject(name: string, description?: string): Promise<Project | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authorized');

      const { data, error } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          name,
          description
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Error creating project');
      return null;
    }
  }

  // Get user projects
  static async getProjects(): Promise<Project[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authorized');

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Error loading projects');
      return [];
    }
  }

  // Update project
  static async updateProject(id: string, updates: Partial<Project>): Promise<Project | null> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error('Error updating project');
      return null;
    }
  }

  // Delete project
  static async deleteProject(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Error deleting project');
      return false;
    }
  }

  // === GENERATION SESSIONS ===

  // Save generation session
  static async saveGenerationSession(
    sessionId: string,
    inputContent: string,
    outputType: 'testcases' | 'checklist' | 'documentation-analysis' | 'developer-analysis' | 'manager-analysis' | 'structuredTesting',
    results: AIAnalysisResult,
    projectId?: string,
    aiModel?: string,
    processingTimeMs?: number
  ): Promise<GenerationSession | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authorized');

      const { data, error } = await supabase
        .from('generation_sessions')
        .insert({
          user_id: user.id,
          project_id: projectId,
          session_id: sessionId,
          input_content: inputContent,
          output_type: outputType,
          results,
          ai_model: aiModel,
          processing_time_ms: processingTimeMs
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving generation session:', error);
      toast.error('Error saving session');
      return null;
    }
  }

  // Get session history
  static async getGenerationHistory(limit = 20): Promise<GenerationSession[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authorized');

      const { data, error } = await supabase
        .from('generation_sessions')
        .select(`
          *,
          projects(name)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching generation history:', error);
      toast.error('Error loading history');
      return [];
    }
  }

  // Get session by session_id
  static async getGenerationSession(sessionId: string): Promise<GenerationSession | null> {
    try {
      const { data, error } = await supabase
        .from('generation_sessions')
        .select('*')
        .eq('session_id', sessionId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching generation session:', error);
      return null;
    }
  }

  // Get session by UUID (for favorites)
  static async getGenerationSessionById(id: string): Promise<GenerationSession | null> {
    try {
      const { data, error } = await supabase
        .from('generation_sessions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching generation session by ID:', error);
      return null;
    }
  }

  // === USER SETTINGS ===

  // Get user settings
  static async getUserSettings(): Promise<UserSettings | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authorized');

      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
      return data;
    } catch (error) {
      console.error('Error fetching user settings:', error);
      return null;
    }
  }

  // Create/update user settings
  static async upsertUserSettings(settings: Partial<UserSettings>): Promise<UserSettings | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authorized');

      const { data, error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          ...settings
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error upserting user settings:', error);
      toast.error('Error saving settings');
      return null;
    }
  }

  // === FAVORITE RESULTS ===

  // Add to favorites
  static async addToFavorites(
    sessionId: string,
    name: string,
    description?: string
  ): Promise<FavoriteResult | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authorized');

      // First find the session by session_id to get its UUID
      const session = await this.getGenerationSession(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      const { data, error } = await supabase
        .from('favorite_results')
        .insert({
          user_id: user.id,
            session_id: session.id, // Use the found session's UUID
          name,
          description
        })
        .select()
        .single();

      if (error) throw error;
      toast.success('Added to favorites');
      return data;
    } catch (error) {
      console.error('Error adding to favorites:', error);
      toast.error('Error adding to favorites');
      return null;
    }
  }

  // Get favorite results
  static async getFavorites(): Promise<FavoriteResult[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authorized');

      const { data, error } = await supabase
        .from('favorite_results')
        .select(`
          *,
          generation_sessions!inner(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching favorites:', error);
      toast.error('Error loading favorites');
      return [];
    }
  }

  // Remove from favorites
  static async removeFromFavorites(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('favorite_results')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Removed from favorites');
      return true;
    } catch (error) {
      console.error('Error removing from favorites:', error);
      toast.error('Error removing from favorites');
      return false;
    }
  }

  // === STATISTICS ===

  // Get user statistics
  static async getUserStats(): Promise<UserStats | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authorized');

      const { data, error } = await supabase
        .rpc('get_user_stats', {
          user_uuid: user.id
        });

      if (error) throw error;
      return data?.[0] || {
        total_sessions: 0,
        total_testcases: 0,
        total_checklists: 0,
        avg_processing_time: 0,
        favorite_count: 0
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return null;
    }
  }
}
