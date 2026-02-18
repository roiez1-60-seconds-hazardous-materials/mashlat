import { supabase, isOnline } from './supabase';

// ═══════════════════════════════════════════════════════════════
// DATABASE OPERATIONS - משל"ט
// כל הפונקציות עובדות גם offline (מחזירות null) וגם online
// ═══════════════════════════════════════════════════════════════

// ── EMPLOYEES ─────────────────────────────────────────────────

export async function getEmployees() {
  if (!isOnline()) return null;
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('is_active', true)
    .order('id');
  if (error) { console.error('getEmployees error:', error); return null; }
  return data;
}

export async function addEmployee(name, role, employmentType = 'מלאה') {
  if (!isOnline()) return null;
  const { data, error } = await supabase
    .from('employees')
    .insert({ name, role, employment_type: employmentType })
    .select()
    .single();
  if (error) { console.error('addEmployee error:', error); return null; }
  return data;
}

export async function updateEmployee(id, updates) {
  if (!isOnline()) return null;
  const { data, error } = await supabase
    .from('employees')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) { console.error('updateEmployee error:', error); return null; }
  return data;
}

export async function getEmployeeByToken(token) {
  if (!isOnline()) return null;
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('link_token', token)
    .eq('is_active', true)
    .single();
  if (error) { console.error('getEmployeeByToken error:', error); return null; }
  return data;
}

// ── ASSIGNMENTS ───────────────────────────────────────────────

export async function getAssignments(year, month) {
  if (!isOnline()) return null;
  const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
  const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${new Date(year, month + 1, 0).getDate()}`;

  const { data, error } = await supabase
    .from('assignments')
    .select('*')
    .gte('date', startDate)
    .lte('date', endDate);
  if (error) { console.error('getAssignments error:', error); return null; }

  // Convert to app format: { "2026-03-01_morning": [1, 4, 9], ... }
  const result = {};
  data.forEach(row => {
    const key = `${row.date}_${row.shift_type}`;
    if (!result[key]) result[key] = [];
    result[key].push(row.employee_id);
  });
  return result;
}

export async function setAssignment(date, shiftType, employeeId) {
  if (!isOnline()) return null;
  const { data, error } = await supabase
    .from('assignments')
    .upsert({ date, shift_type: shiftType, employee_id: employeeId },
      { onConflict: 'date,shift_type,employee_id' })
    .select();
  if (error) { console.error('setAssignment error:', error); return null; }
  return data;
}

export async function removeAssignment(date, shiftType, employeeId) {
  if (!isOnline()) return null;
  const { error } = await supabase
    .from('assignments')
    .delete()
    .eq('date', date)
    .eq('shift_type', shiftType)
    .eq('employee_id', employeeId);
  if (error) { console.error('removeAssignment error:', error); return null; }
  return true;
}

export async function clearAssignments(date, shiftType) {
  if (!isOnline()) return null;
  const { error } = await supabase
    .from('assignments')
    .delete()
    .eq('date', date)
    .eq('shift_type', shiftType);
  if (error) { console.error('clearAssignments error:', error); return null; }
  return true;
}

export async function bulkSetAssignments(assignments) {
  // assignments: [{ date, shift_type, employee_id }, ...]
  if (!isOnline()) return null;
  const { data, error } = await supabase
    .from('assignments')
    .upsert(assignments, { onConflict: 'date,shift_type,employee_id' })
    .select();
  if (error) { console.error('bulkSetAssignments error:', error); return null; }
  return data;
}

// ── CONSTRAINTS ───────────────────────────────────────────────

export async function getConstraints(year, month) {
  if (!isOnline()) return null;
  const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
  const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${new Date(year, month + 1, 0).getDate()}`;

  const { data, error } = await supabase
    .from('constraints')
    .select('*')
    .gte('date', startDate)
    .lte('date', endDate);
  if (error) { console.error('getConstraints error:', error); return null; }

  // Convert to app format: { "1_2026-03-01_morning": "block", ... }
  const result = {};
  data.forEach(row => {
    result[`${row.employee_id}_${row.date}_${row.shift_type}`] = row.constraint_type;
  });
  return result;
}

export async function setConstraint(employeeId, date, shiftType, constraintType) {
  if (!isOnline()) return null;
  const { data, error } = await supabase
    .from('constraints')
    .upsert({
      employee_id: employeeId,
      date,
      shift_type: shiftType,
      constraint_type: constraintType
    }, { onConflict: 'employee_id,date,shift_type' })
    .select();
  if (error) { console.error('setConstraint error:', error); return null; }
  return data;
}

export async function removeConstraint(employeeId, date, shiftType) {
  if (!isOnline()) return null;
  const { error } = await supabase
    .from('constraints')
    .delete()
    .eq('employee_id', employeeId)
    .eq('date', date)
    .eq('shift_type', shiftType);
  if (error) { console.error('removeConstraint error:', error); return null; }
  return true;
}

// ── VACATION REQUESTS ─────────────────────────────────────────

export async function getVacationRequests(year, month) {
  if (!isOnline()) return null;
  const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
  const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${new Date(year, month + 1, 0).getDate()}`;

  const { data, error } = await supabase
    .from('vacation_requests')
    .select('*, employees(name, role)')
    .gte('date', startDate)
    .lte('date', endDate)
    .order('created_at', { ascending: false });
  if (error) { console.error('getVacationRequests error:', error); return null; }
  return data;
}

export async function requestVacation(employeeId, date) {
  if (!isOnline()) return null;
  const { data, error } = await supabase
    .from('vacation_requests')
    .upsert({
      employee_id: employeeId,
      date,
      status: 'pending'
    }, { onConflict: 'employee_id,date' })
    .select();
  if (error) { console.error('requestVacation error:', error); return null; }
  return data;
}

export async function updateVacationStatus(id, status, adminNote = null) {
  if (!isOnline()) return null;
  const updates = { status, updated_at: new Date().toISOString() };
  if (adminNote) updates.admin_note = adminNote;

  const { data, error } = await supabase
    .from('vacation_requests')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) { console.error('updateVacationStatus error:', error); return null; }
  return data;
}

// ── SETTINGS ──────────────────────────────────────────────────

export async function getSettings() {
  if (!isOnline()) return null;
  const { data, error } = await supabase
    .from('settings')
    .select('*');
  if (error) { console.error('getSettings error:', error); return null; }

  const result = {};
  data.forEach(row => { result[row.key] = row.value; });
  return result;
}

export async function updateSetting(key, value) {
  if (!isOnline()) return null;
  const { error } = await supabase
    .from('settings')
    .update({ value, updated_at: new Date().toISOString() })
    .eq('key', key);
  if (error) { console.error('updateSetting error:', error); return null; }
  return true;
}

// ── STATS VIEW ────────────────────────────────────────────────

export async function getMonthlyStats(year, month) {
  if (!isOnline()) return null;
  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}-01`;

  const { data, error } = await supabase
    .from('employee_monthly_stats')
    .select('*')
    .eq('month', monthStr);
  if (error) { console.error('getMonthlyStats error:', error); return null; }
  return data;
}

// ── REAL-TIME SUBSCRIPTIONS ───────────────────────────────────

export function subscribeToAssignments(callback) {
  if (!isOnline()) return null;
  return supabase
    .channel('assignments-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'assignments' }, callback)
    .subscribe();
}

export function subscribeToConstraints(callback) {
  if (!isOnline()) return null;
  return supabase
    .channel('constraints-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'constraints' }, callback)
    .subscribe();
}

export function subscribeToVacations(callback) {
  if (!isOnline()) return null;
  return supabase
    .channel('vacations-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'vacation_requests' }, callback)
    .subscribe();
}

export function unsubscribeAll() {
  if (!isOnline()) return;
  supabase.removeAllChannels();
}
