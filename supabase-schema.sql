-- ═══════════════════════════════════════════════════════════════
-- משל"ט - מערכת סידור עבודה | סכמת מסד נתונים
-- הרץ קובץ זה ב-Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- ── טבלת עובדים ──────────────────────────────────────────────
CREATE TABLE employees (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('קצין', 'אחמש', 'חליף אחמש', 'סמבצ')),
  employment_type TEXT NOT NULL DEFAULT 'מלאה' CHECK (employment_type IN ('מלאה', 'סטודנט')),
  is_active BOOLEAN DEFAULT true,
  link_token UUID DEFAULT gen_random_uuid() UNIQUE,  -- קישור אישי לעובד
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── טבלת שיבוצים ─────────────────────────────────────────────
CREATE TABLE assignments (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  shift_type TEXT NOT NULL CHECK (shift_type IN ('morning', 'evening', 'night')),
  employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(date, shift_type, employee_id)
);

-- ── טבלת אילוצים ─────────────────────────────────────────────
CREATE TABLE constraints (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  shift_type TEXT NOT NULL CHECK (shift_type IN ('morning', 'evening', 'night')),
  constraint_type TEXT NOT NULL CHECK (constraint_type IN ('block', 'prefer')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(employee_id, date, shift_type)
);

-- ── טבלת בקשות חופשה ──────────────────────────────────────────
CREATE TABLE vacation_requests (
  id SERIAL PRIMARY KEY,
  employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_note TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(employee_id, date)
);

-- ── טבלת הגדרות ──────────────────────────────────────────────
CREATE TABLE settings (
  id SERIAL PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════
-- הכנסת נתונים התחלתיים
-- ═══════════════════════════════════════════════════════════════

-- ── עובדים ────────────────────────────────────────────────────
INSERT INTO employees (name, role, employment_type) VALUES
  ('תומר טוביאנה', 'קצין', 'מלאה'),
  ('יעל שיין', 'קצין', 'מלאה'),
  ('ג''וליה זכריה', 'קצין', 'מלאה'),
  ('עידן פינצ''בסקי', 'אחמש', 'מלאה'),
  ('שניר בראמי', 'אחמש', 'מלאה'),
  ('אלמוג עמור', 'אחמש', 'מלאה'),
  ('יובל אלבז', 'חליף אחמש', 'מלאה'),
  ('יובל גוטמן', 'חליף אחמש', 'מלאה'),
  ('ליאל כהן', 'סמבצ', 'מלאה'),
  ('ליאל פולד', 'סמבצ', 'מלאה'),
  ('מולו בלאי', 'חליף אחמש', 'מלאה'),
  ('ניקול קבנוב', 'סמבצ', 'מלאה'),
  ('נדב שועל', 'סמבצ', 'מלאה'),
  ('מיכל בנימין', 'סמבצ', 'מלאה'),
  ('זוהר חמו', 'סמבצ', 'מלאה'),
  ('נדב שטרית', 'סמבצ', 'מלאה');

-- ── הגדרות ────────────────────────────────────────────────────
INSERT INTO settings (key, value) VALUES
  ('admin_password', 'admin123'),
  ('max_constraints', '8'),
  ('mshlat_name', 'משל"ט כבאות והצלה');

-- ═══════════════════════════════════════════════════════════════
-- אינדקסים לביצועים
-- ═══════════════════════════════════════════════════════════════
CREATE INDEX idx_assignments_date ON assignments(date);
CREATE INDEX idx_assignments_employee ON assignments(employee_id);
CREATE INDEX idx_assignments_date_shift ON assignments(date, shift_type);
CREATE INDEX idx_constraints_employee ON constraints(employee_id);
CREATE INDEX idx_constraints_date ON constraints(date);
CREATE INDEX idx_vacation_employee ON vacation_requests(employee_id);
CREATE INDEX idx_vacation_status ON vacation_requests(status);

-- ═══════════════════════════════════════════════════════════════
-- Views שימושיים
-- ═══════════════════════════════════════════════════════════════

-- תצוגת שיבוצים עם פרטי עובד
CREATE OR REPLACE VIEW assignments_view AS
SELECT
  a.id,
  a.date,
  a.shift_type,
  a.employee_id,
  e.name AS employee_name,
  e.role AS employee_role,
  e.employment_type,
  EXTRACT(DOW FROM a.date) AS day_of_week,
  CASE WHEN EXTRACT(DOW FROM a.date) IN (5, 6) THEN true ELSE false END AS is_weekend
FROM assignments a
JOIN employees e ON a.employee_id = e.id
WHERE e.is_active = true;

-- סטטיסטיקת עובד לחודש
CREATE OR REPLACE VIEW employee_monthly_stats AS
SELECT
  e.id AS employee_id,
  e.name,
  e.role,
  DATE_TRUNC('month', a.date) AS month,
  COUNT(*) AS total_shifts,
  COUNT(*) FILTER (WHERE a.shift_type = 'morning') AS morning_shifts,
  COUNT(*) FILTER (WHERE a.shift_type = 'evening') AS evening_shifts,
  COUNT(*) FILTER (WHERE a.shift_type = 'night') AS night_shifts,
  COUNT(*) FILTER (WHERE EXTRACT(DOW FROM a.date) IN (5, 6)) AS weekend_shifts,
  COUNT(*) * 8 AS total_hours
FROM employees e
LEFT JOIN assignments a ON e.id = a.employee_id
WHERE e.is_active = true
GROUP BY e.id, e.name, e.role, DATE_TRUNC('month', a.date);
