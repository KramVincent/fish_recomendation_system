-- ========================================
-- Fish Diet Recommendation Database Schema
-- Run this in Supabase SQL Editor
-- RLS DISABLED for development
-- ========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- ENUMS
-- ========================================

DO $$ BEGIN
    CREATE TYPE suitability_level AS ENUM ('suitable', 'moderate', 'avoid');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE mercury_level AS ENUM ('very-low', 'low', 'moderate', 'high', 'very-high');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE safety_category AS ENUM ('safe', 'moderate', 'avoid');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE upload_status AS ENUM ('pending', 'uploading', 'processing', 'complete', 'error');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE note_type AS ENUM ('general', 'recommendation', 'follow-up', 'warning');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE pregnancy_status AS ENUM ('none', 'pregnant', 'breastfeeding');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('user', 'dietitian', 'admin');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE health_condition_category AS ENUM (
        'cardiovascular', 'metabolic', 'autoimmune', 'neurological', 
        'renal', 'gastrointestinal', 'respiratory', 'other'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ========================================
-- USERS TABLE (local app auth)
-- ========================================

CREATE TABLE IF NOT EXISTS public.app_users (
    id UUID PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    avatar_url TEXT,
    role user_role DEFAULT 'user',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- HEALTH CONDITIONS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.health_conditions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    category health_condition_category NOT NULL DEFAULT 'other',
    description TEXT NOT NULL,
    icon TEXT DEFAULT '🏥',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- HEALTH PROFILES TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.health_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.app_users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    avatar_url TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    allergies TEXT[] DEFAULT '{}',
    medications TEXT[] DEFAULT '{}',
    dietary_preferences TEXT[] DEFAULT '{}',
    age INTEGER,
    weight DECIMAL(5,2),
    height DECIMAL(5,2),
    pregnancy_status pregnancy_status DEFAULT 'none',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- PROFILE CONDITIONS (Junction Table)
-- ========================================

CREATE TABLE IF NOT EXISTS public.profile_conditions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES public.health_profiles(id) ON DELETE CASCADE,
    condition_id UUID NOT NULL REFERENCES public.health_conditions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(profile_id, condition_id)
);

-- ========================================
-- FISH SPECIES TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.fish_species (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    common_name TEXT NOT NULL,
    scientific_name TEXT NOT NULL,
    local_name TEXT,
    image_url TEXT,
    description TEXT NOT NULL,
    mercury_level mercury_level DEFAULT 'moderate',
    habitat TEXT DEFAULT '',
    season TEXT[] DEFAULT '{}',
    preparation_methods TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- FISH NUTRITION TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.fish_nutrition (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fish_id UUID NOT NULL REFERENCES public.fish_species(id) ON DELETE CASCADE,
    protein_percent DECIMAL(5,2) DEFAULT 0,
    fatty_acids TEXT DEFAULT '',
    key_amino_acids TEXT DEFAULT '',
    minerals TEXT DEFAULT '',
    vitamins TEXT DEFAULT '',
    energy_kcal_100g DECIMAL(8,2) DEFAULT 0,
    protein_g_100g DECIMAL(6,2) DEFAULT 0,
    fat_g_100g DECIMAL(6,2) DEFAULT 0,
    omega3_g_100g DECIMAL(6,2) DEFAULT 0,
    sodium_mg_100g DECIMAL(8,2) DEFAULT 0,
    potassium_mg_100g DECIMAL(8,2) DEFAULT 0,
    phosphorus_mg_100g DECIMAL(8,2) DEFAULT 0,
    calcium_mg_100g DECIMAL(8,2) DEFAULT 0,
    vitamin_d_mcg_100g DECIMAL(8,2) DEFAULT 0,
    vitamin_b12_mcg_100g DECIMAL(8,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(fish_id)
);

-- ========================================
-- FISH DISEASE SUITABILITY TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.fish_disease_suitability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fish_id UUID NOT NULL REFERENCES public.fish_species(id) ON DELETE CASCADE,
    condition_id UUID NOT NULL REFERENCES public.health_conditions(id) ON DELETE CASCADE,
    suitability suitability_level DEFAULT 'moderate',
    portion_recommendation TEXT DEFAULT '',
    clinical_rationale TEXT DEFAULT '',
    alternatives TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(fish_id, condition_id)
);

-- ========================================
-- FISH MULTIMORBIDITY TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.fish_multimorbidity (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fish_id UUID NOT NULL REFERENCES public.fish_species(id) ON DELETE CASCADE,
    disease_combination TEXT NOT NULL,
    suitability suitability_level DEFAULT 'moderate',
    portion_recommendation TEXT DEFAULT '',
    clinical_rationale TEXT DEFAULT '',
    alternatives TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(fish_id, disease_combination)
);

-- ========================================
-- FISH RECOMMENDATIONS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.fish_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.app_users(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.health_profiles(id) ON DELETE CASCADE,
    fish_id UUID NOT NULL REFERENCES public.fish_species(id) ON DELETE CASCADE,
    safety_category safety_category DEFAULT 'moderate',
    serving_size TEXT DEFAULT '',
    frequency_per_week INTEGER DEFAULT 0,
    frequency_per_month INTEGER DEFAULT 0,
    preparation_tips TEXT[] DEFAULT '{}',
    warnings TEXT[] DEFAULT '{}',
    alternatives TEXT[] DEFAULT '{}',
    reasoning TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- IMAGE UPLOADS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.image_uploads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.app_users(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    status upload_status DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- IDENTIFICATION RESULTS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.identification_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    image_id UUID NOT NULL REFERENCES public.image_uploads(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.app_users(id) ON DELETE CASCADE,
    processing_time_ms INTEGER DEFAULT 0,
    model_version TEXT DEFAULT 'yolov8s-seg-v1',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- FISH PREDICTIONS TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.fish_predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    result_id UUID NOT NULL REFERENCES public.identification_results(id) ON DELETE CASCADE,
    fish_id UUID REFERENCES public.fish_species(id) ON DELETE SET NULL,
    species_name TEXT NOT NULL,
    confidence DECIMAL(5,4) NOT NULL DEFAULT 0,
    bounding_box JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- DIETITIAN NOTES TABLE
-- ========================================

CREATE TABLE IF NOT EXISTS public.dietitian_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES public.health_profiles(id) ON DELETE CASCADE,
    dietitian_id UUID NOT NULL REFERENCES public.app_users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    note_type note_type DEFAULT 'general',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- INDEXES
-- ========================================

CREATE INDEX IF NOT EXISTS idx_health_profiles_user_id ON public.health_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_conditions_profile_id ON public.profile_conditions(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_conditions_condition_id ON public.profile_conditions(condition_id);
CREATE INDEX IF NOT EXISTS idx_fish_nutrition_fish_id ON public.fish_nutrition(fish_id);
CREATE INDEX IF NOT EXISTS idx_fish_disease_suitability_fish_id ON public.fish_disease_suitability(fish_id);
CREATE INDEX IF NOT EXISTS idx_fish_disease_suitability_condition_id ON public.fish_disease_suitability(condition_id);
CREATE INDEX IF NOT EXISTS idx_fish_multimorbidity_combination ON public.fish_multimorbidity(disease_combination);
CREATE INDEX IF NOT EXISTS idx_fish_recommendations_user_id ON public.fish_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_fish_recommendations_profile_id ON public.fish_recommendations(profile_id);
CREATE INDEX IF NOT EXISTS idx_image_uploads_user_id ON public.image_uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_identification_results_image_id ON public.identification_results(image_id);
CREATE INDEX IF NOT EXISTS idx_fish_predictions_result_id ON public.fish_predictions(result_id);

-- ========================================
-- TRIGGERS FOR updated_at
-- ========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_users_updated_at ON public.app_users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.app_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_health_profiles_updated_at ON public.health_profiles;
CREATE TRIGGER update_health_profiles_updated_at BEFORE UPDATE ON public.health_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_fish_species_updated_at ON public.fish_species;
CREATE TRIGGER update_fish_species_updated_at BEFORE UPDATE ON public.fish_species
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_fish_nutrition_updated_at ON public.fish_nutrition;
CREATE TRIGGER update_fish_nutrition_updated_at BEFORE UPDATE ON public.fish_nutrition
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_fish_disease_suitability_updated_at ON public.fish_disease_suitability;
CREATE TRIGGER update_fish_disease_suitability_updated_at BEFORE UPDATE ON public.fish_disease_suitability
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_fish_multimorbidity_updated_at ON public.fish_multimorbidity;
CREATE TRIGGER update_fish_multimorbidity_updated_at BEFORE UPDATE ON public.fish_multimorbidity
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_fish_recommendations_updated_at ON public.fish_recommendations;
CREATE TRIGGER update_fish_recommendations_updated_at BEFORE UPDATE ON public.fish_recommendations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- STORAGE BUCKET
-- ========================================
-- This block is only for Supabase projects that have storage.buckets.
-- Neon does not provide Supabase Storage tables, so this safely no-ops there.
DO $$
BEGIN
    IF to_regclass('storage.buckets') IS NOT NULL THEN
        INSERT INTO storage.buckets (id, name, public)
        VALUES ('fish-images', 'fish-images', true)
        ON CONFLICT (id) DO NOTHING;
    END IF;
END $$;
