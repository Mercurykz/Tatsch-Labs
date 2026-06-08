import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import multer from 'multer';
import { Pool } from 'pg';
import { randomUUID } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 8080;
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

const dbUrl = process.env.DATABASE_URL;
const pool = dbUrl
  ? new Pool({
      connectionString: dbUrl,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    })
  : null;

const initDatabase = async () => {
  if (!pool) {
    console.warn('DATABASE_URL not set, skipping database initialization');
    return;
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS patients (
      id TEXT PRIMARY KEY,
      data JSONB NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS uploads (
      id TEXT PRIMARY KEY,
      filename TEXT NOT NULL,
      path TEXT NOT NULL,
      size BIGINT,
      mime_type TEXT,
      content BYTEA,
      patient_id TEXT,
      created_at TIMESTAMPTZ DEFAULT now()
    );
  `);

  await pool.query(`
    ALTER TABLE uploads
    ADD COLUMN IF NOT EXISTS patient_id TEXT,
    ADD COLUMN IF NOT EXISTS content BYTEA;
  `);

  const { rows } = await pool.query('SELECT count(*)::int AS count FROM patients');
  if (rows[0].count === 0) {
    const samplePatient = {
      id: randomUUID(),
      name: 'Gabriel Silva',
      age: 34,
      avatar: 'GS',
      status: 'Excelente',
      healthScore: 88,
      updated_at: new Date().toISOString(),
      rewards_level: 'Profissional',
      rewards_points: 1240,
      metrics: {
        weight: 78,
        bodyFat: 18,
        muscleMass: 35,
        metabolicAge: 28,
        bmi: 23.5,
        water: 58,
        boneMass: 3.2,
        bmr: 1750,
      },
      history: [
        { date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), weight: 80, bodyFat: 20, muscleMass: 34 },
        { date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), weight: 79, bodyFat: 19, muscleMass: 34.5 },
        { date: new Date().toISOString(), weight: 78, bodyFat: 18, muscleMass: 35 },
      ],
      exams: [
        {
          date: new Date().toISOString(),
          b12: { value: 560, unit: 'pg/mL', status: 'Normal' },
          cortisol: { value: 9.4, unit: 'µg/dL', status: 'Normal' },
          ferritin: { value: 72, unit: 'ng/mL', status: 'Normal' },
          fastingGlucose: { value: 92, unit: 'mg/dL', status: 'Normal' },
        },
      ],
      nutrition: {
        dailyCalories: 2350,
        qualityScore: 86,
        macros: {
          carbs: { value: 210, percentage: 45 },
          protein: { value: 140, percentage: 30 },
          fat: { value: 80, percentage: 25 },
        },
      },
      lifestyle: {
        sleep: { device: 'Apple Watch', quality: 'Boa', averageHours: 7.3 },
        activity: { device: 'Garmin', averageSteps: 11000, activeMinutes: 90 },
      },
      medications: [
        { name: 'Vitamina D', dose: '1000 UI', frequency: 'Diária' },
      ],
    };

    await pool.query('INSERT INTO patients(id, data) VALUES($1, $2)', [samplePatient.id, samplePatient]);
  }
};

app.use(express.json());
app.use(express.static(join(__dirname, 'dist')));

const isValidNumber = (v) => typeof v === 'number' && Number.isFinite(v);

const validateExamItem = (item) => {
  if (!item || typeof item !== 'object') return false;
  if (!item.date) return false;
  const keys = ['b12', 'cortisol', 'ferritin', 'fastingGlucose'];
  for (const k of keys) {
    const val = item[k];
    if (!val || typeof val !== 'object') return false;
    if (!isValidNumber(val.value)) return false;
  }
  return true;
};

const validateExamsArray = (arr) => {
  if (!Array.isArray(arr)) return false;
  return arr.every(validateExamItem);
};

app.get('/api/patients', async (req, res) => {
  if (!pool) {
    return res.status(500).json({ error: 'Database not configured' });
  }

  try {
    const result = await pool.query('SELECT data FROM patients ORDER BY created_at DESC');
    return res.json(result.rows.map(row => row.data));
  } catch (error) {
    console.error('Error fetching patients:', error);
    return res.status(500).json({ error: 'Unable to fetch patients' });
  }
});

app.post('/api/patients', async (req, res) => {
  if (!pool) {
    return res.status(500).json({ error: 'Database not configured' });
  }

  const { name, age, avatar, status, healthScore, exams } = req.body;

  if (!name || !age || !avatar) {
    return res.status(400).json({ error: 'Name, age, and avatar are required' });
  }

  if (exams !== undefined && !validateExamsArray(exams)) {
    return res.status(400).json({ error: 'Invalid exams format' });
  }

  const newPatient = {
    id: randomUUID(),
    name,
    age: parseInt(age, 10),
    avatar,
    status: status || 'Normal',
    healthScore: healthScore || 0,
    updated_at: new Date().toISOString(),
    rewards_level: 'Iniciante',
    rewards_points: 0,
    metrics: {
      weight: 0,
      bodyFat: 0,
      muscleMass: 0,
      metabolicAge: 0,
      bmi: 0,
      water: 0,
      boneMass: 0,
      bmr: 0,
    },
    history: [],
    exams: exams || [],
    nutrition: {
      dailyCalories: 0,
      qualityScore: 0,
      macros: {
        carbs: { value: 0, percentage: 0 },
        protein: { value: 0, percentage: 0 },
        fat: { value: 0, percentage: 0 },
      },
    },
    lifestyle: {
      sleep: { device: '', quality: '', averageHours: 0 },
      activity: { device: '', averageSteps: 0, activeMinutes: 0 },
    },
    medications: [],
  };

  try {
    await pool.query('INSERT INTO patients(id, data) VALUES($1, $2)', [newPatient.id, newPatient]);
    return res.status(201).json(newPatient);
  } catch (error) {
    console.error('Error creating patient:', error);
    return res.status(500).json({ error: 'Unable to create patient' });
  }
});

app.put('/api/patients/:id', async (req, res) => {
  if (!pool) {
    return res.status(500).json({ error: 'Database not configured' });
  }

  const { id } = req.params;
  const updates = req.body;

  try {
    const result = await pool.query('SELECT data FROM patients WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const existingPatient = result.rows[0].data;
    const updatedPatient = {
      ...existingPatient,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    
    if (updates.age !== undefined) {
      updatedPatient.age = parseInt(updates.age, 10);
    }

    await pool.query('UPDATE patients SET data = $1 WHERE id = $2', [updatedPatient, id]);

    return res.json(updatedPatient);
  } catch (error) {
    console.error('Error updating patient:', error);
    return res.status(500).json({ error: 'Unable to update patient' });
  }
});

app.post('/api/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  if (!pool) {
    return res.status(500).json({ error: 'Database not configured' });
  }

  const { originalname, mimetype, size, buffer } = req.file;
  const patientId = req.body.patientId || null;
  const id = randomUUID();
  const path = `${id}_${originalname}`;

  try {
    if (patientId) {
      const patientResult = await pool.query('SELECT id FROM patients WHERE id = $1', [patientId]);
      if (patientResult.rows.length === 0) {
        return res.status(400).json({ error: 'Paciente não encontrado para upload' });
      }
    }

    await pool.query(
      'INSERT INTO uploads(id, filename, path, size, mime_type, content, patient_id) VALUES($1, $2, $3, $4, $5, $6, $7)',
      [id, originalname, path, size, mimetype, buffer, patientId]
    );

    return res.json({ success: true, id, filename: originalname, path, patientId });
  } catch (error) {
    console.error('Error saving upload:', error);
    return res.status(500).json({ error: 'Upload failed' });
  }
});

app.get('/api/patients/:id/uploads', async (req, res) => {
  if (!pool) {
    return res.status(500).json({ error: 'Database not configured' });
  }

  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT id, filename, size, mime_type, created_at FROM uploads WHERE patient_id = $1 ORDER BY created_at DESC',
      [id]
    );
    return res.json(result.rows);
  } catch (error) {
    console.error('Error fetching patient uploads:', error);
    return res.status(500).json({ error: 'Unable to fetch patient uploads' });
  }
});

app.get('/api/uploads/:id', async (req, res) => {
  if (!pool) {
    return res.status(500).json({ error: 'Database not configured' });
  }

  try {
    const { id } = req.params;
    const result = await pool.query('SELECT filename, mime_type, content FROM uploads WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Upload not found' });
    }

    const upload = result.rows[0];
    res.setHeader('Content-Type', upload.mime_type || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${upload.filename}"`);
    return res.send(upload.content);
  } catch (error) {
    console.error('Error downloading upload:', error);
    return res.status(500).json({ error: 'Unable to download upload' });
  }
});

app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

app.use((req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

console.log('Starting server', { PORT: port, NODE_ENV: process.env.NODE_ENV });

process.on('uncaughtException', (err) => {
  console.error('uncaughtException', err);
  process.exit(1);
});
process.on('unhandledRejection', (reason) => {
  console.error('unhandledRejection', reason);
});

initDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`Express server running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Database initialization failed:', error);
    process.exit(1);
  });
