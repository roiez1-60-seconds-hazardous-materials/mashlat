-- ═══════════════════════════════════════════════════════════════
-- משל"ט - כללי אבטחה (RLS)
-- הרץ קובץ זה אחרי supabase-schema.sql
-- ═══════════════════════════════════════════════════════════════

-- הפעלת RLS על כל הטבלאות
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE constraints ENABLE ROW LEVEL SECURITY;
ALTER TABLE vacation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════
-- מדיניות: כולם יכולים לקרוא (האפליקציה משתמשת ב-anon key)
-- כולם יכולים לכתוב (האימות מנוהל ברמת האפליקציה)
-- ═══════════════════════════════════════════════════════════════

-- עובדים - קריאה לכולם, כתיבה לכולם
CREATE POLICY "Allow all read employees" ON employees FOR SELECT USING (true);
CREATE POLICY "Allow all insert employees" ON employees FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update employees" ON employees FOR UPDATE USING (true);
CREATE POLICY "Allow all delete employees" ON employees FOR DELETE USING (true);

-- שיבוצים
CREATE POLICY "Allow all read assignments" ON assignments FOR SELECT USING (true);
CREATE POLICY "Allow all insert assignments" ON assignments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update assignments" ON assignments FOR UPDATE USING (true);
CREATE POLICY "Allow all delete assignments" ON assignments FOR DELETE USING (true);

-- אילוצים
CREATE POLICY "Allow all read constraints" ON constraints FOR SELECT USING (true);
CREATE POLICY "Allow all insert constraints" ON constraints FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update constraints" ON constraints FOR UPDATE USING (true);
CREATE POLICY "Allow all delete constraints" ON constraints FOR DELETE USING (true);

-- בקשות חופשה
CREATE POLICY "Allow all read vacations" ON vacation_requests FOR SELECT USING (true);
CREATE POLICY "Allow all insert vacations" ON vacation_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update vacations" ON vacation_requests FOR UPDATE USING (true);
CREATE POLICY "Allow all delete vacations" ON vacation_requests FOR DELETE USING (true);

-- הגדרות
CREATE POLICY "Allow all read settings" ON settings FOR SELECT USING (true);
CREATE POLICY "Allow all update settings" ON settings FOR UPDATE USING (true);
