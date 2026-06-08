-- Criar tabela de pacientes
CREATE TABLE patients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  avatar TEXT,
  status TEXT DEFAULT 'Normal',
  health_score INTEGER DEFAULT 0,
  rewards_level TEXT DEFAULT 'Iniciante',
  rewards_points INTEGER DEFAULT 0,
  rewards_badges JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Criar tabela de histórico de métricas da balança (Fitdays)
CREATE TABLE patient_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  weight NUMERIC,
  bmi NUMERIC,
  body_fat NUMERIC,
  muscle_mass NUMERIC,
  water NUMERIC,
  bone_mass NUMERIC,
  bmr INTEGER,
  metabolic_age INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Criar tabela de histórico de exames de sangue
CREATE TABLE patient_exams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  data JSONB NOT NULL, -- Vai armazenar o JSON com { b12: {value, unit, status}, cortisol: {...} }
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Criar tabela de nutrição e estilo de vida (Wearables)
CREATE TABLE patient_lifestyle (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  daily_calories INTEGER,
  nutrition_quality_score INTEGER,
  macros JSONB, -- { carbs: {value, percentage}, protein: {...}, fat: {...} }
  sleep_hours NUMERIC,
  sleep_quality TEXT,
  sleep_device TEXT,
  active_steps INTEGER,
  active_minutes INTEGER,
  activity_device TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Criar tabela de medicamentos contínuos
CREATE TABLE patient_medications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dose TEXT NOT NULL,
  frequency TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Criar tabela de protocolo de suplementação (vitaminas)
CREATE TABLE patient_vitamins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dose TEXT NOT NULL,
  reason TEXT,
  priority TEXT DEFAULT 'Medium', -- High, Medium, Low
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Inserir paciente de teste baseado na Ana Clara
INSERT INTO patients (id, name, age, avatar, status, health_score, rewards_level, rewards_points)
VALUES ('00000000-0000-0000-0000-000000000001', 'Ana Clara Silva', 28, 'AC', 'Normal', 85, 'Ouro', 1250);

INSERT INTO patient_metrics (patient_id, date, weight, bmi, body_fat, muscle_mass, water, bone_mass, bmr, metabolic_age)
VALUES ('00000000-0000-0000-0000-000000000001', '2026-05-24', 65.2, 22.5, 24.1, 45.3, 55.2, 2.8, 1450, 26);

INSERT INTO patient_vitamins (patient_id, name, dose, reason, priority)
VALUES ('00000000-0000-0000-0000-000000000001', 'Vitamina D3', '2000 UI', 'Baixa exposição solar', 'High');
