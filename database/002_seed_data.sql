-- ========================================
-- Seed Data for Fish Diet Recommendation Database
-- Run this after 001_schema.sql
-- ========================================

-- ========================================
-- HEALTH CONDITIONS (using valid UUIDs)
-- ========================================

INSERT INTO public.health_conditions (id, name, category, description, icon) VALUES
    ('00000000-0000-0000-0000-000000000001', 'Diabetes', 'metabolic', 'Blood sugar management requires attention to glycemic impact of foods', '🩸'),
    ('00000000-0000-0000-0000-000000000002', 'Hypertension', 'cardiovascular', 'High blood pressure requiring low-sodium diet management', '❤️'),
    ('00000000-0000-0000-0000-000000000003', 'Asthma', 'respiratory', 'Chronic airway condition that may benefit from anti-inflammatory omega-3 foods', '🌬️'),
    ('00000000-0000-0000-0000-000000000004', 'COPD', 'respiratory', 'Chronic obstructive pulmonary disease requiring protein for muscle maintenance', '🫁'),
    ('00000000-0000-0000-0000-000000000005', 'CKD', 'renal', 'Chronic Kidney Disease requiring careful protein and mineral management', '🫘'),
    -- ('00000000-0000-0000-0000-000000000006', 'Heart Disease', 'cardiovascular', 'Cardiovascular condition benefiting from omega-3 fatty acids', '🫀'),
    -- ('00000000-0000-0000-0000-000000000007', 'Gout', 'metabolic', 'Excess uric acid requiring purine restriction in diet', '🦴'),
    -- ('00000000-0000-0000-0000-000000000008', 'Rheumatoid Arthritis', 'autoimmune', 'Autoimmune inflammation may benefit from omega-3 fatty acids', '🤲'),
    -- ('00000000-0000-0000-0000-000000000009', 'Hypothyroidism', 'metabolic', 'Underactive thyroid benefiting from selenium-rich fish', '🦋'),
    -- ('00000000-0000-0000-0000-000000000010', 'IBS', 'gastrointestinal', 'Irritable bowel syndrome requiring careful food selection', '🫃')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon;

-- ========================================
-- FISH SPECIES (using valid UUIDs)
-- ========================================

INSERT INTO public.fish_species (id, common_name, scientific_name, local_name, description, mercury_level, habitat, season, preparation_methods) VALUES
    ('10000000-0000-0000-0000-000000000001', 'Milkfish', 'Chanos chanos', 'Bangus', 'High protein with moderate fat; acceptable for diabetes if cooked with minimal added fat. Popular in Southeast Asia.', 'very-low', 'Indo-Pacific, Freshwater/Brackish', ARRAY['year-round'], ARRAY['fried', 'grilled', 'sinigang', 'smoked']),
    ('10000000-0000-0000-0000-000000000002', 'Tilapia', 'Oreochromis niloticus', 'Tilapia', 'Lean, low-fat, high-protein fish; minimal impact on blood glucose when portion-controlled. Widely farmed and affordable.', 'very-low', 'Freshwater, Tropical', ARRAY['year-round'], ARRAY['pan-fried', 'baked', 'steamed', 'grilled']),
    ('10000000-0000-0000-0000-000000000003', 'Sardines', 'Sardina pilchardus', 'Sardinas', 'Rich in omega-3 and protein but higher in fat; keep portions smaller and prefer fresh, not canned in oil.', 'very-low', 'Mediterranean, Atlantic', ARRAY['spring', 'summer', 'fall'], ARRAY['canned', 'grilled', 'baked']),
    ('10000000-0000-0000-0000-000000000004', 'Mackerel', 'Scomber scombrus', 'Alumahan', 'Very high in omega-3 but also higher in fat; limited portions recommended for lipid control.', 'low', 'North Atlantic', ARRAY['fall', 'winter'], ARRAY['smoked', 'grilled', 'baked', 'canned']),
    ('10000000-0000-0000-0000-000000000005', 'Tulingan (Bullet Tuna)', 'Auxis rochei', 'Tulingan', 'High-quality protein with relatively low fat; suitable for glycemic control when grilled/steamed.', 'very-low', 'Indo-Pacific, Tropical', ARRAY['year-round'], ARRAY['grilled', 'fried', 'sinigang', 'kinilaw'])
ON CONFLICT (id) DO UPDATE SET
    common_name = EXCLUDED.common_name,
    scientific_name = EXCLUDED.scientific_name,
    local_name = EXCLUDED.local_name,
    description = EXCLUDED.description,
    mercury_level = EXCLUDED.mercury_level,
    habitat = EXCLUDED.habitat,
    season = EXCLUDED.season,
    preparation_methods = EXCLUDED.preparation_methods;

-- ========================================
-- FISH NUTRITION (from Fish Composition image)
-- ========================================

INSERT INTO public.fish_nutrition (fish_id, protein_percent, fatty_acids, key_amino_acids, minerals, vitamins, energy_kcal_100g, protein_g_100g, fat_g_100g, omega3_g_100g, sodium_mg_100g, potassium_mg_100g, phosphorus_mg_100g, calcium_mg_100g, vitamin_d_mcg_100g, vitamin_b12_mcg_100g) VALUES
    ('10000000-0000-0000-0000-000000000001', 24.18, 'Oleic acid', 'Glutamic acid', 'Ca, Mg, Na, K', 'A, B1, B12', 183, 26, 9, 1, 92, 374, 208, 65, 0, 3.4),
    ('10000000-0000-0000-0000-000000000002', 20.08, 'Low-fat', 'Glutamic acid', 'P, K, Mg', 'B3, B12', 96, 20, 1.5, 0.15, 52, 300, 170, 10, 3.5, 1.6),
    ('10000000-0000-0000-0000-000000000003', 25, 'Omega-3 (EPA/DHA)', 'Lysine', 'Ca, P, Na', 'D, B12', 185, 21, 10.5, 2, 400, 300, 250, 380, 7, 8),
    ('10000000-0000-0000-0000-000000000004', 24, 'High Omega-3', 'Glutamic acid', 'Na, P, Mg', 'D, B12', 205, 19, 13.9, 2, 90, 314, 200, 15, 13.8, 8.7),
    ('10000000-0000-0000-0000-000000000005', 18, 'Low-fat', 'Glutamic acid', 'K, P, Mg', 'B12', 130, 22, 2.5, 0.32, 70, 300, 200, 200, 2, 3)
ON CONFLICT (fish_id) DO UPDATE SET
    protein_percent = EXCLUDED.protein_percent,
    fatty_acids = EXCLUDED.fatty_acids,
    key_amino_acids = EXCLUDED.key_amino_acids,
    minerals = EXCLUDED.minerals,
    vitamins = EXCLUDED.vitamins,
    energy_kcal_100g = EXCLUDED.energy_kcal_100g,
    protein_g_100g = EXCLUDED.protein_g_100g,
    fat_g_100g = EXCLUDED.fat_g_100g,
    omega3_g_100g = EXCLUDED.omega3_g_100g,
    sodium_mg_100g = EXCLUDED.sodium_mg_100g,
    potassium_mg_100g = EXCLUDED.potassium_mg_100g,
    phosphorus_mg_100g = EXCLUDED.phosphorus_mg_100g,
    calcium_mg_100g = EXCLUDED.calcium_mg_100g,
    vitamin_d_mcg_100g = EXCLUDED.vitamin_d_mcg_100g,
    vitamin_b12_mcg_100g = EXCLUDED.vitamin_b12_mcg_100g;

-- ========================================
-- FISH DISEASE SUITABILITY - Diabetes
-- ========================================

INSERT INTO public.fish_disease_suitability (fish_id, condition_id, suitability, portion_recommendation, clinical_rationale, alternatives) VALUES
    ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'suitable', '100-120 g, 2-3×/week', 'High protein with moderate fat; acceptable for diabetes if cooked with minimal added fat.', ARRAY[]::TEXT[]),
    ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'suitable', '100-120 g, 3×/week', 'Lean, low-fat, high-protein fish; minimal impact on blood glucose when portion-controlled.', ARRAY[]::TEXT[]),
    ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'moderate', '80-100 g, 1-2×/week', 'Rich in omega-3 and protein but higher in fat; keep portions smaller and prefer fresh, not canned in oil.', ARRAY['Tilapia', 'Milkfish', 'Mackerel']),
    ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'moderate', '80-100 g, 1×/week', 'Very high in omega-3 but also higher in fat; limited portions recommended for lipid control.', ARRAY['Tilapia', 'Milkfish', 'Catfish']),
    ('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'suitable', '100-120 g, 2-3×/week', 'High-quality protein with relatively low fat; suitable for glycemic control when grilled/steamed.', ARRAY[]::TEXT[])
ON CONFLICT (fish_id, condition_id) DO UPDATE SET
    suitability = EXCLUDED.suitability,
    portion_recommendation = EXCLUDED.portion_recommendation,
    clinical_rationale = EXCLUDED.clinical_rationale,
    alternatives = EXCLUDED.alternatives;

-- ========================================
-- FISH DISEASE SUITABILITY - Hypertension
-- ========================================

INSERT INTO public.fish_disease_suitability (fish_id, condition_id, suitability, portion_recommendation, clinical_rationale, alternatives) VALUES
    ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'moderate', '80-100 g, 1-2×/week', 'Fresh milkfish is acceptable, but salted or dried forms are high in sodium; therefore only moderate intake.', ARRAY['Tilapia', 'Catfish', 'Mackerel']),
    ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'suitable', '100-120 g, 3×/week', 'Naturally low in sodium and fat; suitable for low-salt, heart-healthy diets if prepared without added salt.', ARRAY[]::TEXT[]),
    ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', 'avoid', '0 g', 'Commonly eaten canned or salted with high sodium content; generally avoided in hypertension.', ARRAY['Tilapia', 'Fresh Milkfish', 'Catfish']),
    ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000002', 'moderate', '80-100 g, 1×/week', 'Fresh mackerel is heart-healthy, but salted/processed mackerel is very high in sodium; limit frequency.', ARRAY['Tilapia', 'Catfish', 'Milkfish']),
    ('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000002', 'suitable', '100-120 g, 3×/week', 'Fresh bullet tuna is relatively low in sodium; suitable if not preserved or salted.', ARRAY[]::TEXT[])
ON CONFLICT (fish_id, condition_id) DO UPDATE SET
    suitability = EXCLUDED.suitability,
    portion_recommendation = EXCLUDED.portion_recommendation,
    clinical_rationale = EXCLUDED.clinical_rationale,
    alternatives = EXCLUDED.alternatives;

-- ========================================
-- FISH DISEASE SUITABILITY - Asthma
-- ========================================

INSERT INTO public.fish_disease_suitability (fish_id, condition_id, suitability, portion_recommendation, clinical_rationale, alternatives) VALUES
    ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'suitable', '100-120 g, 3×/week', 'Oily fish rich in omega-3 may help modulate inflammation; suitable unless individual has fish allergy.', ARRAY[]::TEXT[]),
    ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', 'suitable', '100-120 g, 3×/week', 'Lean fish source of protein; generally safe in asthma, though allergy risk should still be considered.', ARRAY[]::TEXT[]),
    ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', 'suitable', '80-100 g, 2×/week', 'Oily fish rich in omega-3 may help modulate inflammation; suitable unless individual has fish allergy.', ARRAY[]::TEXT[]),
    ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000003', 'suitable', '80-100 g, 2×/week', 'Oily fish rich in omega-3 may help modulate inflammation; suitable unless individual has fish allergy.', ARRAY[]::TEXT[]),
    ('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000003', 'suitable', '100-120 g, 3×/week', 'Oily fish rich in omega-3 may help modulate inflammation; suitable unless individual has fish allergy.', ARRAY[]::TEXT[])
ON CONFLICT (fish_id, condition_id) DO UPDATE SET
    suitability = EXCLUDED.suitability,
    portion_recommendation = EXCLUDED.portion_recommendation,
    clinical_rationale = EXCLUDED.clinical_rationale,
    alternatives = EXCLUDED.alternatives;

-- ========================================
-- FISH DISEASE SUITABILITY - COPD
-- ========================================
-- /////////////
INSERT INTO public.fish_disease_suitability (fish_id, condition_id, suitability, portion_recommendation, clinical_rationale, alternatives) VALUES
    ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004', 'moderate', '100 g, 1-2×/week', 'Good source of protein and omega-3, supporting muscle mass and anti-inflammatory needs in COPD.', ARRAY['Sardines', 'Tilapia', 'Mackerel']),
    ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000004', 'suitable', '100-120 g, 3×/week', 'Lean protein source that supports respiratory muscle maintenance with relatively low fat.', ARRAY[]::TEXT[]),
    ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000004', 'suitable', '80-100 g, 2×/week', 'Good source of protein and omega-3, supporting muscle mass and anti-inflammatory needs in COPD.', ARRAY[]::TEXT[]),
    ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000004', 'suitable', '80-100 g, 2×/week', 'Good source of protein and omega-3, supporting muscle mass and anti-inflammatory needs in COPD.', ARRAY[]::TEXT[]),
    ('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000004', 'suitable', '100-120 g, 2-3×/week', 'Good source of protein and omega-3, supporting muscle mass and anti-inflammatory needs in COPD.', ARRAY[]::TEXT[])
ON CONFLICT (fish_id, condition_id) DO UPDATE SET
    suitability = EXCLUDED.suitability,
    portion_recommendation = EXCLUDED.portion_recommendation,
    clinical_rationale = EXCLUDED.clinical_rationale,
    alternatives = EXCLUDED.alternatives;

-- ========================================
-- FISH DISEASE SUITABILITY - CKD (Chronic Kidney Disease)
-- ========================================
-- dwadaw
INSERT INTO public.fish_disease_suitability (fish_id, condition_id, suitability, portion_recommendation, clinical_rationale, alternatives) VALUES
    ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000005', 'moderate', '50-75 g, 1×/week', 'High protein and phosphorus; needs portion restriction (≤75 g) and monitoring of serum phosphorus.', ARRAY['Tilapia', 'Catfish', 'Carp']),
    ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000005', 'moderate', '50-100 g, 1-2×/week', 'Moderate protein and minerals; smaller portions help control phosphorus and potassium load.', ARRAY[]::TEXT[]),
    ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000005', 'avoid', '0 g', 'Very high in phosphorus and often sodium; generally avoided in moderate-to-advanced CKD.', ARRAY['Tilapia', 'Catfish', 'Milkfish (small portion)']),
    ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000005', 'avoid', '0 g', 'High in protein, phosphorus, and sometimes sodium; avoided to reduce renal solute load.', ARRAY['Tilapia', 'Catfish', 'Milkfish (small portion)']),
    ('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000005', 'moderate', '50-100 g, 1-2×/week', 'High-quality protein but notable phosphorus; use smaller portions and monitor labs in CKD.', ARRAY[]::TEXT[])
ON CONFLICT (fish_id, condition_id) DO UPDATE SET
    suitability = EXCLUDED.suitability,
    portion_recommendation = EXCLUDED.portion_recommendation,
    clinical_rationale = EXCLUDED.clinical_rationale,
    alternatives = EXCLUDED.alternatives;

-- ========================================
-- MULTIMORBIDITY DATA
-- ========================================

-- Diabetes + Hypertension
INSERT INTO public.fish_multimorbidity (fish_id, disease_combination, suitability, portion_recommendation, clinical_rationale, alternatives) VALUES
    ('10000000-0000-0000-0000-000000000002', 'Diabetes + Hypertension', 'suitable', '100-120 g, 2×/week', 'Tilapia chosen as it is lean, low in sodium, and high in protein, fitting both blood pressure and glucose control.', ARRAY['Catfish', 'Milkfish', 'Mackerel'])
ON CONFLICT (fish_id, disease_combination) DO UPDATE SET
    suitability = EXCLUDED.suitability,
    portion_recommendation = EXCLUDED.portion_recommendation,
    clinical_rationale = EXCLUDED.clinical_rationale,
    alternatives = EXCLUDED.alternatives;

-- Diabetes + Asthma
INSERT INTO public.fish_multimorbidity (fish_id, disease_combination, suitability, portion_recommendation, clinical_rationale, alternatives) VALUES
    ('10000000-0000-0000-0000-000000000002', 'Diabetes + Asthma', 'suitable', '100-120 g, 2-3×/week', 'Tilapia provides lean protein without excessive fat, while alternatives add omega-3 for inflammation control.', ARRAY['Milkfish', 'Fresh Sardines', 'Mackerel'])
ON CONFLICT (fish_id, disease_combination) DO UPDATE SET
    suitability = EXCLUDED.suitability,
    portion_recommendation = EXCLUDED.portion_recommendation,
    clinical_rationale = EXCLUDED.clinical_rationale,
    alternatives = EXCLUDED.alternatives;

-- Diabetes + COPD
INSERT INTO public.fish_multimorbidity (fish_id, disease_combination, suitability, portion_recommendation, clinical_rationale, alternatives) VALUES
    ('10000000-0000-0000-0000-000000000003', 'Diabetes + COPD', 'suitable', '80-100 g, 1-2×/week', 'Fresh sardines provide omega-3 and protein for inflammation and muscle support; portions limited for lipid control.', ARRAY['Tilapia', 'Milkfish', 'Mackerel'])
ON CONFLICT (fish_id, disease_combination) DO UPDATE SET
    suitability = EXCLUDED.suitability,
    portion_recommendation = EXCLUDED.portion_recommendation,
    clinical_rationale = EXCLUDED.clinical_rationale,
    alternatives = EXCLUDED.alternatives;

-- Diabetes + CKD
INSERT INTO public.fish_multimorbidity (fish_id, disease_combination, suitability, portion_recommendation, clinical_rationale, alternatives) VALUES
    ('10000000-0000-0000-0000-000000000002', 'Diabetes + CKD', 'suitable', '50-100 g, 1-2×/week', 'Tilapia used in reduced portions to balance protein needs with phosphorus and potassium restrictions.', ARRAY['Catfish', 'Carp', 'Milkfish'])
ON CONFLICT (fish_id, disease_combination) DO UPDATE SET
    suitability = EXCLUDED.suitability,
    portion_recommendation = EXCLUDED.portion_recommendation,
    clinical_rationale = EXCLUDED.clinical_rationale,
    alternatives = EXCLUDED.alternatives;

-- Hypertension + Asthma
INSERT INTO public.fish_multimorbidity (fish_id, disease_combination, suitability, portion_recommendation, clinical_rationale, alternatives) VALUES
    ('10000000-0000-0000-0000-000000000002', 'Asthma + Hypertension', 'suitable', '100-120 g, 2×/week', 'Tilapia is low in sodium while alternatives include oily fish that may help with airway inflammation.', ARRAY['Milkfish', 'Catfish', 'Fresh Sardines'])
ON CONFLICT (fish_id, disease_combination) DO UPDATE SET
    suitability = EXCLUDED.suitability,
    portion_recommendation = EXCLUDED.portion_recommendation,
    clinical_rationale = EXCLUDED.clinical_rationale,
    alternatives = EXCLUDED.alternatives;

-- Hypertension + COPD
INSERT INTO public.fish_multimorbidity (fish_id, disease_combination, suitability, portion_recommendation, clinical_rationale, alternatives) VALUES
    ('10000000-0000-0000-0000-000000000002', 'COPD + Hypertension', 'suitable', '100-120 g, 2×/week', 'Tilapia is low sodium and supports respiratory muscle strength without excessive fat.', ARRAY['Milkfish', 'Catfish', 'Mackerel'])
ON CONFLICT (fish_id, disease_combination) DO UPDATE SET
    suitability = EXCLUDED.suitability,
    portion_recommendation = EXCLUDED.portion_recommendation,
    clinical_rationale = EXCLUDED.clinical_rationale,
    alternatives = EXCLUDED.alternatives;

-- Hypertension + CKD
INSERT INTO public.fish_multimorbidity (fish_id, disease_combination, suitability, portion_recommendation, clinical_rationale, alternatives) VALUES
    ('10000000-0000-0000-0000-000000000002', 'CKD + Hypertension', 'suitable', '50-100 g, 1×/week', 'Tilapia in small portions offers protein with manageable mineral load for both BP and kidney health.', ARRAY['Catfish', 'Carp', 'Milkfish'])
ON CONFLICT (fish_id, disease_combination) DO UPDATE SET
    suitability = EXCLUDED.suitability,
    portion_recommendation = EXCLUDED.portion_recommendation,
    clinical_rationale = EXCLUDED.clinical_rationale,
    alternatives = EXCLUDED.alternatives;

-- Asthma + COPD
INSERT INTO public.fish_multimorbidity (fish_id, disease_combination, suitability, portion_recommendation, clinical_rationale, alternatives) VALUES
    ('10000000-0000-0000-0000-000000000003', 'Asthma + COPD', 'suitable', '80-100 g, 2×/week', 'Fresh sardines or tilapia provide protein; sardines add omega-3 for inflammation, with attention to sodium source.', ARRAY['Mackerel', 'Milkfish', 'Fresh Anchovies'])
ON CONFLICT (fish_id, disease_combination) DO UPDATE SET
    suitability = EXCLUDED.suitability,
    portion_recommendation = EXCLUDED.portion_recommendation,
    clinical_rationale = EXCLUDED.clinical_rationale,
    alternatives = EXCLUDED.alternatives;

-- Asthma + CKD
INSERT INTO public.fish_multimorbidity (fish_id, disease_combination, suitability, portion_recommendation, clinical_rationale, alternatives) VALUES
    ('10000000-0000-0000-0000-000000000002', 'Asthma + CKD', 'suitable', '50-100 g, 1×/week', 'Tilapia chosen for moderate protein and mineral content, with portions adjusted for kidney protection.', ARRAY['Catfish', 'Carp', 'Small Milkfish'])
ON CONFLICT (fish_id, disease_combination) DO UPDATE SET
    suitability = EXCLUDED.suitability,
    portion_recommendation = EXCLUDED.portion_recommendation,
    clinical_rationale = EXCLUDED.clinical_rationale,
    alternatives = EXCLUDED.alternatives;

-- COPD + CKD
INSERT INTO public.fish_multimorbidity (fish_id, disease_combination, suitability, portion_recommendation, clinical_rationale, alternatives) VALUES
    ('10000000-0000-0000-0000-000000000002', 'CKD + COPD', 'suitable', '50-100 g, 1×/week', 'Tilapia supports muscle mass with moderate protein while limiting phosphorus load via small portions.', ARRAY['Catfish', 'Carp', 'Small Milkfish'])
ON CONFLICT (fish_id, disease_combination) DO UPDATE SET
    suitability = EXCLUDED.suitability,
    portion_recommendation = EXCLUDED.portion_recommendation,
    clinical_rationale = EXCLUDED.clinical_rationale,
    alternatives = EXCLUDED.alternatives;

-- Verify data
SELECT 'Health Conditions' as table_name, COUNT(*) as count FROM public.health_conditions
UNION ALL
SELECT 'Fish Species', COUNT(*) FROM public.fish_species
UNION ALL
SELECT 'Fish Nutrition', COUNT(*) FROM public.fish_nutrition
UNION ALL
SELECT 'Fish Disease Suitability', COUNT(*) FROM public.fish_disease_suitability
UNION ALL
SELECT 'Fish Multimorbidity', COUNT(*) FROM public.fish_multimorbidity;
