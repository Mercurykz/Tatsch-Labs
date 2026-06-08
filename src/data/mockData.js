export const mockPatients = [
  {
    id: "1",
    name: "Ana Clara Silva",
    age: 28,
    lastUpdate: "2026-05-24",
    avatar: "AC",
    status: "Normal",
    healthScore: 85,
    metrics: {
      weight: 65.2, // kg
      bmi: 22.5,
      bodyFat: 24.1, // %
      muscleMass: 45.3, // kg
      water: 55.2, // %
      boneMass: 2.8, // kg
      bmr: 1450, // kcal
      metabolicAge: 26,
    },
    history: [
      { date: '2026-01-10', weight: 68.5, bodyFat: 27.2, muscleMass: 44.1 },
      { date: '2026-02-15', weight: 67.1, bodyFat: 26.0, muscleMass: 44.5 },
      { date: '2026-03-20', weight: 66.0, bodyFat: 25.1, muscleMass: 44.8 },
      { date: '2026-04-22', weight: 65.5, bodyFat: 24.5, muscleMass: 45.0 },
      { date: '2026-05-24', weight: 65.2, bodyFat: 24.1, muscleMass: 45.3 },
    ],
    exams: [
      {
        date: '2026-05-20',
        b12: { value: 450, unit: 'pg/mL', status: 'Normal' },
        cortisol: { value: 12.5, unit: 'mcg/dL', status: 'Normal' },
        ferritin: { value: 45, unit: 'ng/mL', status: 'Atenção' },
        fastingGlucose: { value: 85, unit: 'mg/dL', status: 'Excelente' }
      },
      {
        date: '2025-11-15',
        b12: { value: 320, unit: 'pg/mL', status: 'Atenção' },
        cortisol: { value: 18.2, unit: 'mcg/dL', status: 'Elevado' },
        ferritin: { value: 30, unit: 'ng/mL', status: 'Baixo' },
        fastingGlucose: { value: 92, unit: 'mg/dL', status: 'Normal' }
      }
    ],
    nutrition: {
      dailyCalories: 1850,
      macros: {
        carbs: { value: 180, percentage: 40 }, // g
        protein: { value: 120, percentage: 25 }, // g
        fat: { value: 72, percentage: 35 } // g
      },
      qualityScore: 90
    },
    lifestyle: {
      sleep: { averageHours: 7.5, quality: 'Boa', device: 'Oura Ring' },
      activity: { averageSteps: 8500, activeMinutes: 45, device: 'Apple Watch' }
    },
    medications: [
      { name: "Anticoncepcional", dose: "1 comp/dia", frequency: "Diário" }
    ],
    vitamins: [
      { name: "Vitamina D3", dose: "2000 UI", reason: "Baixa exposição solar, otimização óssea", priority: "High" },
      { name: "Ômega 3", dose: "1000 mg", reason: "Redução de inflamação e saúde cardiovascular", priority: "Medium" }
    ],
    rewards: {
      points: 1250,
      level: "Ouro",
      badges: ["Mestre do Sono", "Hidratação Perfeita"]
    }
  },
  {
    id: "2",
    name: "Roberto Carlos Junior",
    age: 45,
    lastUpdate: "2026-05-20",
    avatar: "RC",
    status: "Atenção",
    healthScore: 62,
    metrics: {
      weight: 92.5,
      bmi: 29.1, // Sobrepeso
      bodyFat: 28.5,
      muscleMass: 62.1,
      water: 49.8,
      boneMass: 3.2,
      bmr: 1850,
      metabolicAge: 52,
    },
    history: [
      { date: '2026-03-10', weight: 95.5, bodyFat: 30.2, muscleMass: 61.1 },
      { date: '2026-04-15', weight: 94.0, bodyFat: 29.5, muscleMass: 61.5 },
      { date: '2026-05-20', weight: 92.5, bodyFat: 28.5, muscleMass: 62.1 },
    ],
    exams: [
      {
        date: '2026-05-18',
        b12: { value: 250, unit: 'pg/mL', status: 'Baixo' },
        cortisol: { value: 22.1, unit: 'mcg/dL', status: 'Elevado' },
        ferritin: { value: 180, unit: 'ng/mL', status: 'Normal' },
        fastingGlucose: { value: 110, unit: 'mg/dL', status: 'Atenção' }
      }
    ],
    nutrition: {
      dailyCalories: 2400,
      macros: {
        carbs: { value: 300, percentage: 50 },
        protein: { value: 100, percentage: 17 },
        fat: { value: 88, percentage: 33 }
      },
      qualityScore: 60
    },
    lifestyle: {
      sleep: { averageHours: 5.5, quality: 'Ruim', device: 'Garmin' },
      activity: { averageSteps: 4000, activeMinutes: 15, device: 'Garmin' }
    },
    medications: [
      { name: "Losartana", dose: "50mg", frequency: "Diário (Manhã)" },
      { name: "Metformina", dose: "500mg", frequency: "Diário (Após jantar)" }
    ],
    vitamins: [
      { name: "Complexo B", dose: "1 caps", reason: "Melhora do metabolismo energético", priority: "High" },
      { name: "Magnésio Quelato", dose: "300 mg", reason: "Recuperação muscular e qualidade do sono", priority: "Medium" },
      { name: "Coenzima Q10", dose: "100 mg", reason: "Suporte cardiovascular devido à idade metabólica", priority: "High" }
    ],
    rewards: {
      points: 450,
      level: "Bronze",
      badges: ["Iniciante"]
    }
  },
  {
    id: "3",
    name: "Mariana Souza",
    age: 32,
    lastUpdate: "2026-05-25",
    avatar: "MS",
    status: "Excelente",
    healthScore: 95,
    metrics: {
      weight: 58.0,
      bmi: 20.5,
      bodyFat: 18.2,
      muscleMass: 45.1,
      water: 60.5,
      boneMass: 2.5,
      bmr: 1380,
      metabolicAge: 28,
    },
    history: [
      { date: '2026-04-10', weight: 58.5, bodyFat: 18.5, muscleMass: 44.8 },
      { date: '2026-05-25', weight: 58.0, bodyFat: 18.2, muscleMass: 45.1 },
    ],
    exams: [
      {
        date: '2026-05-01',
        b12: { value: 600, unit: 'pg/mL', status: 'Excelente' },
        cortisol: { value: 10.0, unit: 'mcg/dL', status: 'Excelente' },
        ferritin: { value: 80, unit: 'ng/mL', status: 'Excelente' },
        fastingGlucose: { value: 80, unit: 'mg/dL', status: 'Excelente' }
      }
    ],
    nutrition: {
      dailyCalories: 2100,
      macros: {
        carbs: { value: 210, percentage: 40 },
        protein: { value: 157, percentage: 30 },
        fat: { value: 70, percentage: 30 }
      },
      qualityScore: 98
    },
    lifestyle: {
      sleep: { averageHours: 8.0, quality: 'Excelente', device: 'Oura Ring' },
      activity: { averageSteps: 12000, activeMinutes: 90, device: 'Apple Watch' }
    },
    medications: [],
    vitamins: [
      { name: "Whey Protein", dose: "30g/dia", reason: "Manutenção de massa magra pós-treino", priority: "Low" },
      { name: "Creatina", dose: "5g/dia", reason: "Aumento de força e hidratação intramuscular", priority: "Medium" }
    ],
    rewards: {
      points: 3200,
      level: "Diamante",
      badges: ["Atleta", "Foco Total", "Nutrição Impecável"]
    }
  }
];
