// Database types for Supabase
// This file defines the TypeScript types for all database tables

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          avatar_url: string | null
          role: 'user' | 'dietitian' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name: string
          avatar_url?: string | null
          role?: 'user' | 'dietitian' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          avatar_url?: string | null
          role?: 'user' | 'dietitian' | 'admin'
          created_at?: string
          updated_at?: string
        }
      }
      health_conditions: {
        Row: {
          id: string
          name: string
          category: string
          description: string
          icon: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          category: string
          description: string
          icon?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: string
          description?: string
          icon?: string
          created_at?: string
        }
      }
      health_profiles: {
        Row: {
          id: string
          user_id: string
          name: string
          avatar_url: string | null
          is_default: boolean
          allergies: string[]
          medications: string[]
          dietary_preferences: string[]
          age: number | null
          weight: number | null
          height: number | null
          pregnancy_status: 'none' | 'pregnant' | 'breastfeeding'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          avatar_url?: string | null
          is_default?: boolean
          allergies?: string[]
          medications?: string[]
          dietary_preferences?: string[]
          age?: number | null
          weight?: number | null
          height?: number | null
          pregnancy_status?: 'none' | 'pregnant' | 'breastfeeding'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          avatar_url?: string | null
          is_default?: boolean
          allergies?: string[]
          medications?: string[]
          dietary_preferences?: string[]
          age?: number | null
          weight?: number | null
          height?: number | null
          pregnancy_status?: 'none' | 'pregnant' | 'breastfeeding'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      profile_conditions: {
        Row: {
          id: string
          profile_id: string
          condition_id: string
          created_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          condition_id: string
          created_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          condition_id?: string
          created_at?: string
        }
      }
      fish_species: {
        Row: {
          id: string
          common_name: string
          scientific_name: string
          local_name: string | null
          image_url: string | null
          description: string
          mercury_level: 'very-low' | 'low' | 'moderate' | 'high' | 'very-high'
          habitat: string
          season: string[]
          preparation_methods: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          common_name: string
          scientific_name: string
          local_name?: string | null
          image_url?: string | null
          description: string
          mercury_level?: 'very-low' | 'low' | 'moderate' | 'high' | 'very-high'
          habitat?: string
          season?: string[]
          preparation_methods?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          common_name?: string
          scientific_name?: string
          local_name?: string | null
          image_url?: string | null
          description?: string
          mercury_level?: 'very-low' | 'low' | 'moderate' | 'high' | 'very-high'
          habitat?: string
          season?: string[]
          preparation_methods?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      fish_nutrition: {
        Row: {
          id: string
          fish_id: string
          protein_percent: number
          fatty_acids: string
          key_amino_acids: string
          minerals: string
          vitamins: string
          energy_kcal_100g: number
          protein_g_100g: number
          fat_g_100g: number
          omega3_g_100g: number
          sodium_mg_100g: number
          potassium_mg_100g: number
          phosphorus_mg_100g: number
          calcium_mg_100g: number
          vitamin_d_mcg_100g: number
          vitamin_b12_mcg_100g: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          fish_id: string
          protein_percent?: number
          fatty_acids?: string
          key_amino_acids?: string
          minerals?: string
          vitamins?: string
          energy_kcal_100g?: number
          protein_g_100g?: number
          fat_g_100g?: number
          omega3_g_100g?: number
          sodium_mg_100g?: number
          potassium_mg_100g?: number
          phosphorus_mg_100g?: number
          calcium_mg_100g?: number
          vitamin_d_mcg_100g?: number
          vitamin_b12_mcg_100g?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          fish_id?: string
          protein_percent?: number
          fatty_acids?: string
          key_amino_acids?: string
          minerals?: string
          vitamins?: string
          energy_kcal_100g?: number
          protein_g_100g?: number
          fat_g_100g?: number
          omega3_g_100g?: number
          sodium_mg_100g?: number
          potassium_mg_100g?: number
          phosphorus_mg_100g?: number
          calcium_mg_100g?: number
          vitamin_d_mcg_100g?: number
          vitamin_b12_mcg_100g?: number
          created_at?: string
          updated_at?: string
        }
      }
      fish_disease_suitability: {
        Row: {
          id: string
          fish_id: string
          condition_id: string
          suitability: 'suitable' | 'moderate' | 'avoid'
          portion_recommendation: string
          clinical_rationale: string
          alternatives: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          fish_id: string
          condition_id: string
          suitability?: 'suitable' | 'moderate' | 'avoid'
          portion_recommendation?: string
          clinical_rationale?: string
          alternatives?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          fish_id?: string
          condition_id?: string
          suitability?: 'suitable' | 'moderate' | 'avoid'
          portion_recommendation?: string
          clinical_rationale?: string
          alternatives?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      fish_multimorbidity: {
        Row: {
          id: string
          fish_id: string
          disease_combination: string
          suitability: 'suitable' | 'moderate' | 'avoid'
          portion_recommendation: string
          clinical_rationale: string
          alternatives: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          fish_id: string
          disease_combination: string
          suitability?: 'suitable' | 'moderate' | 'avoid'
          portion_recommendation?: string
          clinical_rationale?: string
          alternatives?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          fish_id?: string
          disease_combination?: string
          suitability?: 'suitable' | 'moderate' | 'avoid'
          portion_recommendation?: string
          clinical_rationale?: string
          alternatives?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      fish_recommendations: {
        Row: {
          id: string
          user_id: string
          profile_id: string
          fish_id: string
          safety_category: 'safe' | 'moderate' | 'avoid'
          serving_size: string
          frequency_per_week: number
          frequency_per_month: number
          preparation_tips: string[]
          warnings: string[]
          alternatives: string[]
          reasoning: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          profile_id: string
          fish_id: string
          safety_category?: 'safe' | 'moderate' | 'avoid'
          serving_size?: string
          frequency_per_week?: number
          frequency_per_month?: number
          preparation_tips?: string[]
          warnings?: string[]
          alternatives?: string[]
          reasoning?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          profile_id?: string
          fish_id?: string
          safety_category?: 'safe' | 'moderate' | 'avoid'
          serving_size?: string
          frequency_per_week?: number
          frequency_per_month?: number
          preparation_tips?: string[]
          warnings?: string[]
          alternatives?: string[]
          reasoning?: string
          created_at?: string
          updated_at?: string
        }
      }
      image_uploads: {
        Row: {
          id: string
          user_id: string
          image_url: string
          storage_path: string
          status: 'pending' | 'uploading' | 'processing' | 'complete' | 'error'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          image_url: string
          storage_path: string
          status?: 'pending' | 'uploading' | 'processing' | 'complete' | 'error'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          image_url?: string
          storage_path?: string
          status?: 'pending' | 'uploading' | 'processing' | 'complete' | 'error'
          created_at?: string
        }
      }
      identification_results: {
        Row: {
          id: string
          image_id: string
          user_id: string
          processing_time_ms: number
          model_version: string
          created_at: string
        }
        Insert: {
          id?: string
          image_id: string
          user_id: string
          processing_time_ms?: number
          model_version?: string
          created_at?: string
        }
        Update: {
          id?: string
          image_id?: string
          user_id?: string
          processing_time_ms?: number
          model_version?: string
          created_at?: string
        }
      }
      fish_predictions: {
        Row: {
          id: string
          result_id: string
          fish_id: string | null
          species_name: string
          confidence: number
          bounding_box: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          result_id: string
          fish_id?: string | null
          species_name: string
          confidence: number
          bounding_box?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          result_id?: string
          fish_id?: string | null
          species_name?: string
          confidence?: number
          bounding_box?: Json | null
          created_at?: string
        }
      }
      dietitian_notes: {
        Row: {
          id: string
          profile_id: string
          dietitian_id: string
          content: string
          note_type: 'general' | 'recommendation' | 'follow-up' | 'warning'
          created_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          dietitian_id: string
          content: string
          note_type?: 'general' | 'recommendation' | 'follow-up' | 'warning'
          created_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          dietitian_id?: string
          content?: string
          note_type?: 'general' | 'recommendation' | 'follow-up' | 'warning'
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_recommendations_for_profile: {
        Args: { p_profile_id: string }
        Returns: Database['public']['Tables']['fish_recommendations']['Row'][]
      }
      calculate_fish_suitability: {
        Args: { p_profile_id: string; p_fish_id: string }
        Returns: { suitability: string; reasons: string[] }
      }
    }
    Enums: {
      suitability_level: 'suitable' | 'moderate' | 'avoid'
      mercury_level: 'very-low' | 'low' | 'moderate' | 'high' | 'very-high'
      safety_category: 'safe' | 'moderate' | 'avoid'
      upload_status: 'pending' | 'uploading' | 'processing' | 'complete' | 'error'
      note_type: 'general' | 'recommendation' | 'follow-up' | 'warning'
      pregnancy_status: 'none' | 'pregnant' | 'breastfeeding'
      user_role: 'user' | 'dietitian' | 'admin'
      health_condition_category: 'cardiovascular' | 'metabolic' | 'autoimmune' | 'neurological' | 'renal' | 'gastrointestinal' | 'respiratory' | 'other'
    }
  }
}

// Convenience types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Specific table types
export type DbUser = Tables<'users'>
export type DbHealthCondition = Tables<'health_conditions'>
export type DbHealthProfile = Tables<'health_profiles'>
export type DbProfileCondition = Tables<'profile_conditions'>
export type DbFishSpecies = Tables<'fish_species'>
export type DbFishNutrition = Tables<'fish_nutrition'>
export type DbFishDiseaseSuitability = Tables<'fish_disease_suitability'>
export type DbFishMultimorbidity = Tables<'fish_multimorbidity'>
export type DbFishRecommendation = Tables<'fish_recommendations'>
export type DbImageUpload = Tables<'image_uploads'>
export type DbIdentificationResult = Tables<'identification_results'>
export type DbFishPrediction = Tables<'fish_predictions'>
export type DbDietitianNote = Tables<'dietitian_notes'>
