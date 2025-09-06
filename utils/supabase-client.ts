import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config';

// Create Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  }
});

// Database types
export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      generation_sessions: {
        Row: {
          id: string;
          user_id: string;
          project_id: string | null;
          session_id: string;
          input_content: string;
          output_type: 'testcases' | 'checklist';
          results: any;
          ai_model: string | null;
          processing_time_ms: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          project_id?: string | null;
          session_id: string;
          input_content: string;
          output_type: 'testcases' | 'checklist';
          results: any;
          ai_model?: string | null;
          processing_time_ms?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          project_id?: string | null;
          session_id?: string;
          input_content?: string;
          output_type?: 'testcases' | 'checklist';
          results?: any;
          ai_model?: string | null;
          processing_time_ms?: number | null;
          created_at?: string;
        };
      };
      user_settings: {
        Row: {
          user_id: string;
          ai_model: string;
          detail_level: 'low' | 'medium' | 'high';
          focus_areas: string[];
          excluded_modules: string[];
          preferred_output_format: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          ai_model?: string;
          detail_level?: 'low' | 'medium' | 'high';
          focus_areas?: string[];
          excluded_modules?: string[];
          preferred_output_format?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          ai_model?: string;
          detail_level?: 'low' | 'medium' | 'high';
          focus_areas?: string[];
          excluded_modules?: string[];
          preferred_output_format?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      favorite_results: {
        Row: {
          id: string;
          user_id: string;
          session_id: string;
          name: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          session_id: string;
          name: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          session_id?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
        };
      };
    };
    Functions: {
      get_user_stats: {
        Args: {
          user_uuid: string;
        };
        Returns: {
          total_sessions: number;
          total_testcases: number;
          total_checklists: number;
          avg_processing_time: number;
          favorite_count: number;
        }[];
      };
    };
  };
}

// Typed client
export const typedSupabase = supabase as any;
