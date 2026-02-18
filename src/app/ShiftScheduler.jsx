import { useState, useEffect, useCallback, useMemo } from "react";

/* ═══════════════════════════════════════════════════════════════
   משל"ט - מערכת סידור עבודה | כבאות והצלה לישראל
   ═══════════════════════════════════════════════════════════════ */

// ── DATA ──────────────────────────────────────────────────────
const EMPLOYEES_INIT = [
  { id: 1, name: "תומר טוביאנה", role: "קצין", type: "מלאה" },
  { id: 2, name: "יעל שיין", role: "קצין", type: "מלאה" },
  { id: 3, name: "ג'וליה זכריה", role: "קצין", type: "מלאה" },
  { id: 4, name: "עידן פינצ'בסקי", role: "אחמש", type: "מלאה" },
  { id: 5, name: "שניר בראמי", role: "אחמש", type: "מלאה" },
  { id: 6, name: "אלמוג עמור", role: "אחמש", type: "מלאה" },
  { id: 7, name: "יובל אלבז", role: "חליף אחמש", type: "מלאה" },
  { id: 8, name: "יובל גוטמן", role: "חליף אחמש", type: "מלאה" },
  { id: 9, name: "ליאל כהן", role: "סמבצ", type: "מלאה" },
  { id: 10, name: "ליאל פולד", role: "סמבצ", type: "מלאה" },
  { id: 11, name: "מולו בלאי", role: "חליף אחמש", type: "מלאה" },
  { id: 12, name: "ניקול קבנוב", role: "סמבצ", type: "מלאה" },
  { id: 13, name: "נדב שועל", role: "סמבצ", type: "מלאה" },
  { id: 14, name: "מיכל בנימין", role: "סמבצ", type: "מלאה" },
  { id: 15, name: "זוהר חמו", role: "סמבצ", type: "מלאה" },
  { id: 16, name: "נדב שטרית", role: "סמבצ", type: "מלאה" },
];

const SHIFTS = {
  morning: { label: "בוקר", time: "07:00-15:00", icon: "☀️", clr: "#F59E0B" },
  evening: { label: "ערב", time: "15:00-23:00", icon: "🌆", clr: "#8B5CF6" },
  night:   { label: "לילה", time: "23:00-07:00", icon: "🌙", clr: "#3B82F6" },
};
const SHIFT_KEYS = ["morning", "evening", "night"];

const ROLE_RANK = { "קצין": 4, "אחמש": 3, "חליף אחמש": 2, "סמבצ": 1 };
const ROLE_CLR = {
  "קצין":        { bg: "#DC2626", tx: "#fff" },
  "אחמש":       { bg: "#2563EB", tx: "#fff" },
  "חליף אחמש":  { bg: "#7C3AED", tx: "#fff" },
  "סמבצ":        { bg: "#059669", tx: "#fff" },
};

const HEB_MONTHS = ["ינואר","פברואר","מרץ","אפריל","מאי","יוני","יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר"];
const HEB_DAYS_SHORT = ["א׳","ב׳","ג׳","ד׳","ה׳","ו׳","ש׳"];
const HEB_DAYS = ["ראשון","שני","שלישי","רביעי","חמישי","שישי","שבת"];

const ADMIN_PASS = "admin123";

// ══════════════════════════════════════════════════════════════
// HEBREW CALENDAR CONVERTER (Pure JS - Dershowitz & Reingold)
// ══════════════════════════════════════════════════════════════
const HEB_MONTH_NAMES = ["","תשרי","חשוון","כסלו","טבת","שבט","אדר","אדר א׳","אדר ב׳","ניסן","אייר","סיוון","תמוז","אב","אלול"];
const HEB_NUMS = ["","א׳","ב׳","ג׳","ד׳","ה׳","ו׳","ז׳","ח׳","ט׳","י׳","י״א","י״ב","י״ג","י״ד","ט״ו","ט״ז","י״ז","י״ח","י״ט","כ׳","כ״א","כ״ב","כ״ג","כ״ד","כ״ה","כ״ו","כ״ז","כ״ח","כ״ט","ל׳"];

function isHebrewLeapYear(y) { return ((7 * y + 1) % 19) < 7; }
function hebrewMonthsInYear(y) { return isHebrewLeapYear(y) ? 13 : 12; }
function hebrewDelay1(y) {
  const m = Math.floor((235 * y - 234) / 19);
  const p = 12084 + 13753 * m;
  let d = Math.floor(m * 29 + p / 25920);
  if (3 * (d + 1) % 7 < 3) d++;
  return d;
}
function hebrewDelay2(y) {
  const l = hebrewDelay1(y - 1);
  const c = hebrewDelay1(y);
  const n = hebrewDelay1(y + 1);
  if (n - c === 356) return 2;
  if (c - l === 382) return 1;
  return 0;
}
function hebrewYearDays(y) {
  return hebrewDelay1(y + 1) - hebrewDelay1(y) + hebrewDelay2(y + 1) - hebrewDelay2(y);
}
function hebrewMonthDays(y, m) {
  if (m === 2 || m === 4 || m === 6 || m === 10 || m === 13) return 29;
  if (m === 8 && hebrewYearDays(y) % 10 !== 5) return 29;
  if (m === 9 && hebrewYearDays(y) % 10 === 3) return 29;
  if (m === 12 && !isHebrewLeapYear(y)) return 29;
  return 30;
}
function hebrewElapsedDays(y) { return hebrewDelay1(y) + hebrewDelay2(y); }
const HEBREW_EPOCH = 347997; // Julian day offset

function gregorianToHebrew(gy, gm, gd) {
  // Convert gregorian to absolute day number
  const abs = gregorianToAbs(gy, gm, gd);
  // Approximate Hebrew year
  let y = gy + 3760;
  while (hebrewNewYear(y + 1) <= abs) y++;
  // Find month
  let m = (abs < hebrewToAbs(y, 1, 1)) ? 7 : 1;
  while (abs > hebrewToAbs(y, m, hebrewMonthDays(y, m))) m++;
  const d = 1 + abs - hebrewToAbs(y, m, 1);
  return { year: y, month: m, day: d };
}

function gregorianToAbs(y, m, d) {
  let abs = d;
  for (let i = m - 1; i > 0; i--) abs += new Date(y, i, 0).getDate();
  return abs + 365 * (y - 1) + Math.floor((y - 1) / 4) - Math.floor((y - 1) / 100) + Math.floor((y - 1) / 400);
}

function hebrewToAbs(y, m, d) {
  let abs = d;
  if (m < 7) {
    for (let i = 7; i <= hebrewMonthsInYear(y); i++) abs += hebrewMonthDays(y, i);
    for (let i = 1; i < m; i++) abs += hebrewMonthDays(y, i);
  } else {
    for (let i = 7; i < m; i++) abs += hebrewMonthDays(y, i);
  }
  return abs + hebrewElapsedDays(y) - 1373429;
}

function hebrewNewYear(y) { return hebrewToAbs(y, 7, 1); }

function formatHebrewDate(hd) {
  let mName;
  if (hd.month <= 6) mName = HEB_MONTH_NAMES[hd.month + 7] || HEB_MONTH_NAMES[hd.month];
  else if (hd.month === 7) mName = "תשרי";
  else if (hd.month === 8) mName = "חשוון";
  else if (hd.month === 9) mName = "כסלו";
  else if (hd.month === 10) mName = "טבת";
  else if (hd.month === 11) mName = "שבט";
  else if (hd.month === 12) mName = isHebrewLeapYear(hd.year) ? "אדר א׳" : "אדר";
  else if (hd.month === 13) mName = "אדר ב׳";
  else mName = "";
  // map months 1-6 to nisan-elul
  const monthMap = { 1: "ניסן", 2: "אייר", 3: "סיוון", 4: "תמוז", 5: "אב", 6: "אלול" };
  if (monthMap[hd.month]) mName = monthMap[hd.month];
  return `${HEB_NUMS[hd.day] || hd.day} ${mName}`;
}

function getHebrewDateStr(y, m, d) {
  try {
    const hd = gregorianToHebrew(y, m + 1, d);
    return formatHebrewDate(hd);
  } catch { return ""; }
}

// ══════════════════════════════════════════════════════════════
// HOLIDAYS DATABASE (Jewish, Christian, Muslim) for 2026-2027
// ══════════════════════════════════════════════════════════════
// Format: "YYYY-MM-DD": [{name, nameHe, religion, major}]
// Jewish holidays from hebcal data, Christian & Muslim from research

function getHolidays(year) {
  const h = {};
  const add = (ds, name, nameHe, religion, major = false) => {
    if (!h[ds]) h[ds] = [];
    h[ds].push({ name, nameHe, religion, major });
  };

  if (year === 2026) {
    // ── JEWISH HOLIDAYS 2026 ──────────────────────────────
    add("2026-03-03","Ta'anit Esther","תענית אסתר","jewish");
    add("2026-03-05","Purim","פורים","jewish",true);
    add("2026-03-06","Shushan Purim","שושן פורים","jewish");
    add("2026-04-02","Erev Pesach","ערב פסח","jewish",true);
    add("2026-04-02","Pesach I","פסח א׳","jewish",true);
    add("2026-04-03","Pesach II","פסח ב׳","jewish",true);
    add("2026-04-04","Chol HaMoed Pesach","חוה״מ פסח","jewish");
    add("2026-04-05","Chol HaMoed Pesach","חוה״מ פסח","jewish");
    add("2026-04-06","Chol HaMoed Pesach","חוה״מ פסח","jewish");
    add("2026-04-07","Chol HaMoed Pesach","חוה״מ פסח","jewish");
    add("2026-04-08","Pesach VII","שביעי של פסח","jewish",true);
    add("2026-04-09","Pesach VIII","אחרון של פסח","jewish",true);
    add("2026-04-14","Yom HaShoah","יום השואה","jewish",true);
    add("2026-04-21","Yom HaZikaron","יום הזיכרון","jewish",true);
    add("2026-04-22","Yom HaAtzmaut","יום העצמאות","jewish",true);
    add("2026-05-05","Lag BaOmer","ל״ג בעומר","jewish");
    add("2026-05-21","Erev Shavuot","ערב שבועות","jewish",true);
    add("2026-05-22","Shavuot I","שבועות א׳","jewish",true);
    add("2026-05-23","Shavuot II","שבועות ב׳","jewish",true);
    add("2026-07-12","Tzom Tammuz","צום תמוז","jewish");
    add("2026-07-23","Tisha BAv","תשעה באב","jewish",true);
    add("2026-09-11","Erev Rosh Hashana","ערב ראש השנה","jewish",true);
    add("2026-09-12","Rosh Hashana I","ראש השנה א׳","jewish",true);
    add("2026-09-13","Rosh Hashana II","ראש השנה ב׳","jewish",true);
    add("2026-09-14","Tzom Gedaliah","צום גדליה","jewish");
    add("2026-09-20","Erev Yom Kippur","ערב יום כיפור","jewish",true);
    add("2026-09-21","Yom Kippur","יום כיפור","jewish",true);
    add("2026-09-25","Erev Sukkot","ערב סוכות","jewish",true);
    add("2026-09-26","Sukkot I","סוכות א׳","jewish",true);
    add("2026-09-27","Sukkot II","סוכות ב׳","jewish",true);
    add("2026-09-28","Chol HaMoed Sukkot","חוה״מ סוכות","jewish");
    add("2026-09-29","Chol HaMoed Sukkot","חוה״מ סוכות","jewish");
    add("2026-09-30","Chol HaMoed Sukkot","חוה״מ סוכות","jewish");
    add("2026-10-01","Chol HaMoed Sukkot","חוה״מ סוכות","jewish");
    add("2026-10-02","Hoshana Raba","הושענא רבה","jewish");
    add("2026-10-03","Shmini Atzeret","שמיני עצרת","jewish",true);
    add("2026-10-04","Simchat Torah","שמחת תורה","jewish",true);
    add("2026-12-04","Erev Chanukah","ערב חנוכה","jewish",true);
    add("2026-12-05","Chanukah I","חנוכה א׳","jewish",true);
    add("2026-12-06","Chanukah II","חנוכה ב׳","jewish",true);
    add("2026-12-07","Chanukah III","חנוכה ג׳","jewish",true);
    add("2026-12-08","Chanukah IV","חנוכה ד׳","jewish",true);
    add("2026-12-09","Chanukah V","חנוכה ה׳","jewish",true);
    add("2026-12-10","Chanukah VI","חנוכה ו׳","jewish",true);
    add("2026-12-11","Chanukah VII","חנוכה ז׳","jewish",true);
    add("2026-12-12","Chanukah VIII","חנוכה ח׳","jewish",true);

    // ── CHRISTIAN HOLIDAYS 2026 ───────────────────────────
    add("2026-01-01","Feast of Mary","חג מרים אם ה׳","christian");
    add("2026-01-06","Epiphany","אפיפניה","christian");
    add("2026-01-07","Orthodox Christmas","חג המולד הארתודוקסי","christian",true);
    add("2026-02-18","Ash Wednesday","יום רביעי של האפר","christian");
    add("2026-03-25","Annunciation","הבשורה","christian");
    add("2026-03-29","Palm Sunday","יום ראשון של הדקלים","christian",true);
    add("2026-04-02","Holy Thursday","יום חמישי הקדוש","christian");
    add("2026-04-03","Good Friday","יום שישי הטוב","christian",true);
    add("2026-04-05","Easter","חג הפסחא","christian",true);
    add("2026-04-12","Orthodox Palm Sunday","ראשון הדקלים הארתודוקסי","christian");
    add("2026-04-17","Orthodox Good Friday","שישי הטוב הארתודוקסי","christian",true);
    add("2026-04-19","Orthodox Easter","פסחא ארתודוקסי","christian",true);
    add("2026-05-14","Ascension Day","עליית ישו","christian");
    add("2026-05-24","Pentecost","שבועות הנוצרי","christian");
    add("2026-08-15","Assumption of Mary","עליית מרים","christian");
    add("2026-11-01","All Saints Day","יום כל הקדושים","christian");
    add("2026-12-25","Christmas","חג המולד","christian",true);
    add("2026-12-26","St. Stephen's Day","יום סנט סטפן","christian");

    // ── MUSLIM HOLIDAYS 2026 ──────────────────────────────
    add("2026-02-18","Ramadan begins","תחילת רמדאן","muslim",true);
    add("2026-03-16","Laylat al-Qadr","ליילת אל-קדר","muslim",true);
    add("2026-03-20","Eid al-Fitr","עיד אל-פיטר","muslim",true);
    add("2026-03-21","Eid al-Fitr II","עיד אל-פיטר ב׳","muslim",true);
    add("2026-05-25","Arafat Day","יום ערפה","muslim",true);
    add("2026-05-27","Eid al-Adha","עיד אל-אדחא","muslim",true);
    add("2026-05-28","Eid al-Adha II","עיד אל-אדחא ב׳","muslim",true);
    add("2026-05-29","Eid al-Adha III","עיד אל-אדחא ג׳","muslim",true);
    add("2026-06-17","Islamic New Year","ראש השנה המוסלמי","muslim",true);
    add("2026-06-26","Ashura","יום עשוראא","muslim",true);
    add("2026-08-25","Mawlid al-Nabi","מולד הנביא","muslim",true);
  }

  if (year === 2027) {
    // ── JEWISH HOLIDAYS 2027 ──────────────────────────────
    add("2027-03-22","Purim","פורים","jewish",true);
    add("2027-04-22","Pesach I","פסח א׳","jewish",true);
    add("2027-04-23","Pesach II","פסח ב׳","jewish",true);
    add("2027-04-28","Pesach VII","שביעי של פסח","jewish",true);
    add("2027-04-29","Pesach VIII","אחרון של פסח","jewish",true);
    add("2027-05-04","Yom HaShoah","יום השואה","jewish",true);
    add("2027-05-11","Yom HaZikaron","יום הזיכרון","jewish",true);
    add("2027-05-12","Yom HaAtzmaut","יום העצמאות","jewish",true);
    add("2027-06-11","Shavuot I","שבועות א׳","jewish",true);
    add("2027-06-12","Shavuot II","שבועות ב׳","jewish",true);
    add("2027-10-02","Rosh Hashana I","ראש השנה א׳","jewish",true);
    add("2027-10-03","Rosh Hashana II","ראש השנה ב׳","jewish",true);
    add("2027-10-11","Yom Kippur","יום כיפור","jewish",true);
    add("2027-10-16","Sukkot I","סוכות א׳","jewish",true);
    add("2027-10-23","Shmini Atzeret","שמיני עצרת","jewish",true);
    add("2027-10-24","Simchat Torah","שמחת תורה","jewish",true);
    add("2027-12-25","Chanukah I","חנוכה א׳","jewish",true);

    // ── CHRISTIAN HOLIDAYS 2027 ───────────────────────────
    add("2027-01-06","Epiphany","אפיפניה","christian");
    add("2027-01-07","Orthodox Christmas","חג המולד הארתודוקסי","christian",true);
    add("2027-02-10","Ash Wednesday","יום רביעי של האפר","christian");
    add("2027-03-28","Easter","חג הפסחא","christian",true);
    add("2027-03-26","Good Friday","יום שישי הטוב","christian",true);
    add("2027-05-02","Orthodox Easter","פסחא ארתודוקסי","christian",true);
    add("2027-12-25","Christmas","חג המולד","christian",true);

    // ── MUSLIM HOLIDAYS 2027 ──────────────────────────────
    add("2027-02-08","Ramadan begins","תחילת רמדאן","muslim",true);
    add("2027-03-09","Eid al-Fitr","עיד אל-פיטר","muslim",true);
    add("2027-05-16","Eid al-Adha","עיד אל-אדחא","muslim",true);
    add("2027-06-07","Islamic New Year","ראש השנה המוסלמי","muslim",true);
    add("2027-08-15","Mawlid al-Nabi","מולד הנביא","muslim",true);
  }

  return h;
}

const RELIGION_CLR = {
  jewish:    { bg: "rgba(59,130,246,0.15)", tx: "#60A5FA", border: "rgba(59,130,246,0.3)", icon: "✡️" },
  christian: { bg: "rgba(239,68,68,0.12)", tx: "#F87171", border: "rgba(239,68,68,0.25)", icon: "✝️" },
  muslim:    { bg: "rgba(16,185,129,0.12)", tx: "#34D399", border: "rgba(16,185,129,0.25)", icon: "☪️" },
};

// ══════════════════════════════════════════════════════════════
// EXPORT FUNCTIONS (Word & PDF)
// ══════════════════════════════════════════════════════════════
function generateScheduleHTML(month, days, employees, assign, SHIFTS, SHIFT_KEYS, stats, getHebrewDateStr, HEB_DAYS, holidays) {
  const monthLabel = HEB_MONTHS[month.m];
  const allHolidays = { ...getHolidays(month.y), ...getHolidays(month.y + 1) };

  let html = `
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8">
<style>
  @page { size: landscape; margin: 1cm; }
  body { font-family: Arial, sans-serif; direction: rtl; font-size: 11px; color: #1e293b; }
  h1 { text-align: center; color: #DC2626; font-size: 22px; margin-bottom: 2px; }
  h2 { text-align: center; color: #64748B; font-size: 14px; margin-top: 0; font-weight: normal; }
  .logo { text-align: center; font-size: 28px; margin-bottom: 4px; }
  table { border-collapse: collapse; width: 100%; margin-top: 10px; }
  th, td { border: 1px solid #CBD5E1; padding: 4px 6px; text-align: center; vertical-align: top; }
  th { background: #1E293B; color: white; font-weight: bold; font-size: 11px; }
  .day-header { background: #F1F5F9; font-weight: bold; text-align: right; }
  .weekend { background: #FEF3C7; }
  .holiday { background: #EDE9FE; }
  .shift-morning { color: #B45309; font-weight: bold; }
  .shift-evening { color: #6D28D9; font-weight: bold; }
  .shift-night { color: #1E40AF; font-weight: bold; }
  .heb-date { color: #6366F1; font-size: 9px; }
  .hol-name { color: #7C3AED; font-size: 9px; font-style: italic; }
  .alert { color: #DC2626; font-weight: bold; }
  .ok { color: #059669; }
  .role-badge { display: inline-block; padding: 1px 5px; border-radius: 8px; font-size: 9px; color: white; margin-left: 2px; }
  .stats-table { margin-top: 20px; }
  .stats-table th { background: #334155; }
  .page-break { page-break-before: always; }
  .footer { text-align: center; color: #94A3B8; font-size: 10px; margin-top: 20px; border-top: 1px solid #E2E8F0; padding-top: 8px; }
</style></head><body>
<div class="logo">🔥</div>
<h1>סידור עבודה – משל"ט כבאות והצלה</h1>
<h2>${monthLabel} ${month.y}</h2>

<table>
<tr>
  <th style="width:12%">תאריך</th>
  <th style="width:29%">☀️ בוקר (07:00-15:00)</th>
  <th style="width:29%">🌆 ערב (15:00-23:00)</th>
  <th style="width:29%">🌙 לילה (23:00-07:00)</th>
</tr>`;

  days.forEach(day => {
    const hebD = day.hebDate || "";
    const dayHols = allHolidays[day.ds] || [];
    const rowClass = dayHols.length > 0 ? "holiday" : day.isWE ? "weekend" : "";

    html += `<tr class="${rowClass}">`;
    html += `<td class="day-header" style="text-align:right">
      <div><b>${HEB_DAYS[day.dow]} ${day.date}/${month.m + 1}</b></div>
      <div class="heb-date">${hebD}</div>`;
    dayHols.forEach(h => {
      html += `<div class="hol-name">${h.nameHe}</div>`;
    });
    html += `</td>`;

    SHIFT_KEYS.forEach(st => {
      const k = `${day.ds}_${st}`;
      const empIds = assign[k] || [];
      const assigned = empIds.map(id => employees.find(e => e.id === id)).filter(Boolean);
      const v = validateShift(assigned, st);
      const shiftClass = `shift-${st}`;

      html += `<td>`;
      if (assigned.length === 0) {
        html += `<span class="alert">❌ לא מאויש</span>`;
      } else {
        assigned.forEach(emp => {
          const rc = ROLE_CLR[emp.role] || { bg: "#666", tx: "#fff" };
          html += `<div>${emp.name} <span class="role-badge" style="background:${rc.bg}">${emp.role}</span></div>`;
        });
        if (!v.ok) {
          html += `<div class="alert" style="margin-top:3px;font-size:9px">⚠️ ${v.issues.join(", ")}</div>`;
        } else {
          html += `<div class="ok" style="font-size:9px">✓ תקין</div>`;
        }
      }
      html += `</td>`;
    });
    html += `</tr>`;
  });

  html += `</table>`;

  // Stats page
  html += `<div class="page-break"></div>`;
  html += `<h1>סטטיסטיקת עובדים – ${monthLabel} ${month.y}</h1>`;
  html += `<table class="stats-table">
  <tr>
    <th>שם</th><th>תפקיד</th><th>סה"כ משמרות</th>
    <th>בוקר</th><th>ערב</th><th>לילה</th><th>סופ"ש</th><th>שעות</th><th>סטטוס</th>
  </tr>`;

  employees.forEach(emp => {
    const s = stats[emp.id] || { t: 0, m: 0, e: 0, n: 0, we: 0, h: 0 };
    let status = "תקין", stClr = "#059669";
    if (s.t < 21) { status = "חסר"; stClr = "#DC2626"; }
    else if (s.h > 218) { status = "חריגה"; stClr = "#F59E0B"; }
    const rc = ROLE_CLR[emp.role] || { bg: "#666", tx: "#fff" };

    html += `<tr>
      <td style="text-align:right;font-weight:bold">${emp.name}</td>
      <td><span class="role-badge" style="background:${rc.bg}">${emp.role}</span></td>
      <td style="font-weight:bold;font-size:14px">${s.t}</td>
      <td style="color:#B45309">${s.m}</td>
      <td style="color:#6D28D9">${s.e}</td>
      <td style="color:#1E40AF">${s.n}</td>
      <td style="color:#B45309">${s.we}</td>
      <td>${s.h}</td>
      <td style="color:${stClr};font-weight:bold">${status}</td>
    </tr>`;
  });

  html += `</table>`;

  // Holidays page
  const monthKey = `${month.y}-${pad2(month.m + 1)}`;
  const monthHols = Object.entries(allHolidays)
    .filter(([ds]) => ds.startsWith(monthKey))
    .sort(([a], [b]) => a.localeCompare(b));

  if (monthHols.length > 0) {
    html += `<div class="page-break"></div>`;
    html += `<h1>חגים ומועדים – ${monthLabel} ${month.y}</h1>`;
    html += `<table><tr><th>תאריך</th><th>חג/מועד</th><th>דת</th></tr>`;
    monthHols.forEach(([ds, hols]) => {
      const d = parseInt(ds.split("-")[2]);
      const dow = new Date(ds).getDay();
      hols.forEach(h => {
        const relName = h.religion === "jewish" ? "✡️ יהדות" : h.religion === "christian" ? "✝️ נצרות" : "☪️ אסלאם";
        html += `<tr><td>${HEB_DAYS[dow]} ${d}/${month.m + 1}</td><td style="font-weight:bold">${h.nameHe}</td><td>${relName}</td></tr>`;
      });
    });
    html += `</table>`;
  }

  html += `<div class="footer">
    הופק ממערכת סידור עבודה – משל"ט כבאות והצלה | ${new Date().toLocaleDateString("he-IL")}
  </div>`;

  html += `</body></html>`;
  return html;
}

function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function exportToWord(month, days, employees, assign, SHIFTS, SHIFT_KEYS, stats) {
  const html = generateScheduleHTML(month, days, employees, assign, SHIFTS, SHIFT_KEYS, stats, getHebrewDateStr, HEB_DAYS);
  const preHtml = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">`;
  const content = html.startsWith("<html") ? html : preHtml + html;
  downloadFile('\ufeff' + content, `סידור_עבודה_${HEB_MONTHS[month.m]}_${month.y}.doc`, "application/msword;charset=utf-8");
}

function exportToPDF(month, days, employees, assign, SHIFTS, SHIFT_KEYS, stats) {
  const html = generateScheduleHTML(month, days, employees, assign, SHIFTS, SHIFT_KEYS, stats, getHebrewDateStr, HEB_DAYS);
  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => { printWindow.print(); }, 500);
  }
}

// ── HELPERS ───────────────────────────────────────────────────
const daysIn = (y, m) => new Date(y, m + 1, 0).getDate();
const pad2 = n => String(n).padStart(2, "0");
const dateStr = (y, m, d) => `${y}-${pad2(m + 1)}-${pad2(d)}`;
const shiftKey = (ds, st) => `${ds}_${st}`;
const canFill = (empRole, needed) => ROLE_RANK[empRole] >= ROLE_RANK[needed];

function getMonthDays(y, m) {
  const arr = [];
  const holidays = { ...getHolidays(y), ...getHolidays(y + 1) };
  for (let d = 1; d <= daysIn(y, m); d++) {
    const dt = new Date(y, m, d);
    const ds = dateStr(y, m, d);
    arr.push({
      date: d, dow: dt.getDay(), isWE: dt.getDay() === 5 || dt.getDay() === 6, ds,
      hebDate: getHebrewDateStr(y, m, d),
      holidays: holidays[ds] || [],
      isHoliday: (holidays[ds] || []).some(h => h.major),
    });
  }
  return arr;
}

function validateShift(assigned, type) {
  const issues = [];
  if (type === "morning" || type === "evening") {
    if (assigned.filter(a => canFill(a.role, "אחמש")).length < 1) issues.push('חסר אחמ"ש / קצין');
    if (assigned.filter(a => canFill(a.role, "סמבצ")).length < 2) issues.push('חסר סמב"צ');
    if (assigned.length < 3) issues.push(`${3 - assigned.length} אנשים חסרים`);
  } else {
    if (assigned.filter(a => canFill(a.role, "חליף אחמש")).length < 1) issues.push('חסר חליף אחמ"ש+');
    if (assigned.filter(a => canFill(a.role, "סמבצ")).length < 1) issues.push('חסר סמב"צ');
    if (assigned.length < 2) issues.push(`${2 - assigned.length} אנשים חסרים`);
  }
  return { ok: issues.length === 0, issues };
}

const minReq = { morning: 3, evening: 3, night: 2 };

// ── STYLES (iOS Blue-Red Theme) ──────────────────────────────
const S = {
  root: { minHeight: "100vh", background: "#EFF6FF", fontFamily: "-apple-system, BlinkMacSystemFont, 'Rubik', 'Segoe UI', sans-serif", direction: "rtl", color: "#1E293B", paddingBottom: 90 },
  glass: { background: "rgba(255,255,255,0.85)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "none", borderRadius: 16, boxShadow: "0 1px 3px rgba(37,99,235,0.06)" },
  card: { background: "#FFFFFF", border: "none", borderRadius: 16, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
  btnPrimary: { background: "linear-gradient(135deg,#EF4444,#B91C1C)", color: "#fff", border: "none", borderRadius: 12, padding: "14px 28px", fontWeight: 700, cursor: "pointer", fontSize: 16, fontFamily: "inherit", boxShadow: "0 4px 14px rgba(220,38,38,0.25)", transition: "all 0.2s" },
  btnGhost: { background: "#F1F5F9", border: "1px solid #E2E8F0", color: "#475569", borderRadius: 12, padding: "12px 20px", cursor: "pointer", fontSize: 15, fontFamily: "inherit", transition: "all 0.2s" },
  input: { width: "100%", padding: "14px 18px", borderRadius: 12, border: "2px solid #E2E8F0", background: "#FFFFFF", color: "#1E293B", fontSize: 17, outline: "none", boxSizing: "border-box", fontFamily: "inherit", transition: "border-color 0.2s" },
  badge: (bg, tx) => ({ display: "inline-block", padding: "4px 12px", borderRadius: 20, background: bg, color: tx, fontSize: 13, fontWeight: 600, letterSpacing: 0.3 }),
  tagOk: { background: "#ECFDF5", color: "#059669", padding: "4px 12px", borderRadius: 20, fontSize: 13, fontWeight: 600, display: "inline-block" },
  tagErr: { background: "#FEF2F2", color: "#DC2626", padding: "4px 12px", borderRadius: 20, fontSize: 13, fontWeight: 600, display: "inline-block" },
  tagWarn: { background: "#FFFBEB", color: "#D97706", padding: "4px 12px", borderRadius: 20, fontSize: 13, fontWeight: 600, display: "inline-block" },
};

// ══════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ══════════════════════════════════════════════════════════════
export default function App() {
  const now = new Date();
  const nextM = now.getMonth() + 1 > 11 ? 0 : now.getMonth() + 1;
  const nextY = now.getMonth() + 1 > 11 ? now.getFullYear() + 1 : now.getFullYear();

  const [view, setView] = useState("login");

  // ── Auto-detect employee link ──────────────────────────────
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const empId = params.get("emp");
      if (empId) {
        const found = employees.find(e => String(e.id) === empId);
        if (found) {
          setEmpPortal(found);
          setView("employee_portal");
        }
      }
    } catch(e) {}
  }, []);
  const [month, setMonth] = useState({ y: nextY, m: nextM });
  const [employees, setEmployees] = useState(EMPLOYEES_INIT);
  const [assign, setAssign] = useState({});       // { "2026-03-01_morning": [1,4,9], ... }
  const [constraints, setConstraints] = useState({}); // { "1_2026-03-01_morning": "block"|"prefer" }
  const [vacations, setVacations] = useState({});  // { "1_2026-03-01": true }
  const [vacReqs, setVacReqs] = useState([]);
  const [maxConst, setMaxConst] = useState(8);
  const [pw, setPw] = useState("");
  const [pwErr, setPwErr] = useState("");
  const [modal, setModal] = useState(null);        // { day, shift }
  const [toast, setToast] = useState(null);
  const [empPortal, setEmpPortal] = useState(null);
  const [sidebar, setSidebar] = useState(true);

  const days = useMemo(() => getMonthDays(month.y, month.m), [month]);

  const notify = useCallback((msg, type = "info") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  }, []);

  // ── stats ──────────────────────────────────────────────────
  const stats = useMemo(() => {
    const s = {};
    employees.forEach(e => { s[e.id] = { t: 0, m: 0, e: 0, n: 0, we: 0, h: 0 }; });
    Object.entries(assign).forEach(([k, ids]) => {
      const [ds, st] = [k.substring(0, 10), k.substring(11)];
      const isWE = [5, 6].includes(new Date(ds).getDay());
      ids.forEach(id => {
        if (!s[id]) return;
        s[id].t++; s[id].h += 8;
        if (st === "morning") s[id].m++;
        else if (st === "evening") s[id].e++;
        else s[id].n++;
        if (isWE) s[id].we++;
      });
    });
    return s;
  }, [assign, employees]);

  const alerts = useMemo(() => {
    const list = [];
    days.forEach(day => {
      SHIFT_KEYS.forEach(st => {
        const k = shiftKey(day.ds, st);
        const a = (assign[k] || []).map(id => employees.find(e => e.id === id)).filter(Boolean);
        const v = validateShift(a, st);
        if (!v.ok) list.push({ ds: day.ds, date: day.date, dow: day.dow, st, issues: v.issues, count: a.length });
      });
    });
    return list;
  }, [assign, days, employees]);

  // ── actions ────────────────────────────────────────────────
  const toggleAssign = (ds, st, empId) => {
    const ck = `${empId}_${shiftKey(ds, st)}`;
    if (constraints[ck] === "block") { notify("העובד חסם משמרת זו!", "error"); return; }
    if (vacations[`${empId}_${ds}`]) { notify("העובד בחופשה!", "error"); return; }
    setAssign(prev => {
      const k = shiftKey(ds, st);
      const cur = prev[k] || [];
      return { ...prev, [k]: cur.includes(empId) ? cur.filter(i => i !== empId) : [...cur, empId] };
    });
  };

  const autoAssign = () => {
    const na = { ...assign };
    days.forEach(day => {
      SHIFT_KEYS.forEach(st => {
        const k = shiftKey(day.ds, st);
        if ((na[k] || []).length >= minReq[st]) return;

        const avail = employees.filter(emp => {
          if (constraints[`${emp.id}_${k}`] === "block") return false;
          if (vacations[`${emp.id}_${day.ds}`]) return false;
          for (const os of SHIFT_KEYS) {
            if (os !== st && (na[shiftKey(day.ds, os)] || []).includes(emp.id)) return false;
          }
          if ((na[k] || []).includes(emp.id)) return false;
          return true;
        }).sort((a, b) => {
          if (day.isWE) return (stats[a.id]?.we || 0) - (stats[b.id]?.we || 0);
          return (stats[a.id]?.t || 0) - (stats[b.id]?.t || 0);
        });

        const picked = [...(na[k] || [])];
        if (st === "night") {
          if (!picked.some(id => canFill(employees.find(e => e.id === id)?.role, "חליף אחמש"))) {
            const h = avail.find(e => canFill(e.role, "חליף אחמש") && !picked.includes(e.id));
            if (h) picked.push(h.id);
          }
          if (!picked.some(id => canFill(employees.find(e => e.id === id)?.role, "סמבצ")) || picked.length < 2) {
            const s = avail.find(e => canFill(e.role, "סמבצ") && !picked.includes(e.id));
            if (s) picked.push(s.id);
          }
        } else {
          if (!picked.some(id => canFill(employees.find(e => e.id === id)?.role, "אחמש"))) {
            const c = avail.find(e => canFill(e.role, "אחמש") && !picked.includes(e.id));
            if (c) picked.push(c.id);
          }
          while (picked.length < 3) {
            const s = avail.find(e => canFill(e.role, "סמבצ") && !picked.includes(e.id));
            if (!s) break;
            picked.push(s.id);
          }
        }
        na[k] = picked;
      });
    });
    setAssign(na);
    notify("שיבוץ אוטומטי הושלם!", "success");
  };

  const setConstraint = (empId, ds, st, type) => {
    const k = `${empId}_${shiftKey(ds, st)}`;
    setConstraints(prev => {
      if (prev[k] === type) { const n = { ...prev }; delete n[k]; return n; }
      return { ...prev, [k]: type };
    });
  };

  const requestVacation = (empId, ds) => {
    setVacReqs(prev => [...prev, { id: Date.now(), empId, ds, status: "pending" }]);
    notify("בקשת חופשה נשלחה", "success");
  };

  const approveVacation = (reqId, ok) => {
    setVacReqs(prev => prev.map(r => {
      if (r.id !== reqId) return r;
      if (ok) {
        setVacations(v => ({ ...v, [`${r.empId}_${r.ds}`]: true }));
        setAssign(a => {
          const n = { ...a };
          SHIFT_KEYS.forEach(st => {
            const k = shiftKey(r.ds, st);
            if (n[k]) n[k] = n[k].filter(id => id !== r.empId);
          });
          return n;
        });
      }
      return { ...r, status: ok ? "approved" : "rejected" };
    }));
    notify(ok ? "חופשה אושרה" : "חופשה נדחתה", ok ? "success" : "error");
  };

  // ── navigate month ─────────────────────────────────────────
  const prevMonth = () => setMonth(p => p.m === 0 ? { y: p.y - 1, m: 11 } : { ...p, m: p.m - 1 });
  const nextMonth = () => setMonth(p => p.m === 11 ? { y: p.y + 1, m: 0 } : { ...p, m: p.m + 1 });

  // ══════════════════════════════════════════════════════════
  //  LOGIN SCREEN
  // ══════════════════════════════════════════════════════════
  if (view === "login") {
    return (
      <div style={{ ...S.root, display: "flex", alignItems: "center", justifyContent: "center", paddingBottom: 0, background: "linear-gradient(180deg, #EFF6FF 0%, #DBEAFE 50%, #EFF6FF 100%)" }}>
        <div style={{ ...S.glass, padding: "48px 38px", width: 400, maxWidth: "92vw", textAlign: "center", position: "relative", borderRadius: 24, boxShadow: "0 8px 40px rgba(37,99,235,0.08)" }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>🔥</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 4px", letterSpacing: -0.5, color: "#1E293B" }}>מערכת סידור עבודה</h1>
          <p style={{ color: "#64748B", fontSize: 15, margin: "0 0 32px" }}>משל"ט כבאות והצלה</p>
          <input
            type="password" placeholder="סיסמת מנהל" value={pw}
            onChange={e => { setPw(e.target.value); setPwErr(""); }}
            onKeyDown={e => { if (e.key === "Enter") { if (pw === ADMIN_PASS) { setView("calendar"); } else { setPwErr("סיסמה שגויה"); } } }}
            style={{ ...S.input, marginBottom: 12, borderColor: pwErr ? "#DC2626" : undefined, textAlign: "center" }}
          />
          {pwErr && <p style={{ color: "#EF4444", fontSize: 13, margin: "0 0 8px" }}>{pwErr}</p>}
          <button onClick={() => { if (pw === ADMIN_PASS) setView("calendar"); else setPwErr("סיסמה שגויה"); }} style={{ ...S.btnPrimary, width: "100%" }}>
            כניסת מנהל
          </button>
          <p style={{ color: "#475569", fontSize: 13, marginTop: 20 }}>עובדים נכנסים דרך הקישור האישי</p>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════
  //  EMPLOYEE PORTAL
  // ══════════════════════════════════════════════════════════
  if (view === "employee_portal" && empPortal) {
    const emp = empPortal;
    const es = stats[emp.id] || { t: 0, m: 0, e: 0, n: 0, we: 0, h: 0 };
    const blockCount = Object.entries(constraints).filter(([k, v]) => k.startsWith(`${emp.id}_`) && v === "block").length;

    return (
      <div style={{ ...S.root, padding: 20 }}>
        {toast && <Toast msg={toast.msg} type={toast.type} />}
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          {/* header */}
          <div style={{ ...S.card, display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
            <span style={{ fontSize: 32 }}>🔥</span>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: 22, margin: 0, fontWeight: 700 }}>שלום, {emp.name}</h1>
              <div style={{ display: "flex", gap: 8, marginTop: 4, alignItems: "center" }}>
                <span style={S.badge(ROLE_CLR[emp.role].bg, ROLE_CLR[emp.role].tx)}>{emp.role}</span>
                <span style={{ color: "#64748B", fontSize: 12 }}>{es.t} משמרות · {es.h} שעות · סופ"ש {es.we}</span>
              </div>
            </div>
            <button onClick={() => { setView("login"); setEmpPortal(null); }} style={S.btnGhost}>יציאה</button>
          </div>
          {/* month nav */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
            <button onClick={prevMonth} style={S.btnGhost}>→</button>
            <h2 style={{ fontSize: 20, margin: 0, fontWeight: 700, minWidth: 150, textAlign: "center" }}>{HEB_MONTHS[month.m]} {month.y}</h2>
            <button onClick={nextMonth} style={S.btnGhost}>←</button>
          </div>
          {/* constraint count */}
          <div style={{ ...S.card, padding: 14, marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#64748B", marginBottom: 6 }}>
              <span>חסימות: {blockCount} / {maxConst}</span>
              <span>{blockCount >= maxConst ? "🔴 מגבלה מלאה" : "🟢 ניתן לחסום"}</span>
            </div>
            <div style={{ height: 5, background: "#E2E8F0", borderRadius: 3 }}>
              <div style={{ height: "100%", borderRadius: 3, width: `${Math.min((blockCount / maxConst) * 100, 100)}%`, background: blockCount >= maxConst ? "#EF4444" : "#F59E0B", transition: "width 0.3s" }} />
            </div>
          </div>
          {/* table */}
          <div style={{ ...S.glass, overflow: "hidden" }}>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid #E2E8F0" }}>
              <h3 style={{ margin: 0, fontSize: 16 }}>אילוצים והעדפות</h3>
              <p style={{ color: "#64748B", fontSize: 12, margin: "4px 0 0" }}>🚫 חסימה · ⭐ העדפה · 🏖️ חופשה</p>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#F1F5F9" }}>
                    <th style={{ padding: "10px 14px", textAlign: "right", color: "#64748B", fontSize: 12 }}>תאריך</th>
                    {SHIFT_KEYS.map(st => <th key={st} style={{ padding: "10px 8px", color: SHIFTS[st].clr, fontSize: 12 }}>{SHIFTS[st].icon} {SHIFTS[st].label}</th>)}
                    <th style={{ padding: "10px 8px", color: "#64748B", fontSize: 12 }}>חופשה</th>
                  </tr>
                </thead>
                <tbody>
                  {days.map(day => {
                    const isVac = vacations[`${emp.id}_${day.ds}`];
                    const pendingVac = vacReqs.find(r => r.empId === emp.id && r.ds === day.ds && r.status === "pending");
                    return (
                      <tr key={day.date} style={{ borderBottom: "1px solid rgba(0,0,0,0.06)", background: day.isHoliday ? "rgba(139,92,246,0.08)" : day.isWE ? "rgba(245,158,11,0.06)" : undefined }}>
                        <td style={{ padding: "8px 14px", fontSize: 13, fontWeight: 600, color: day.isWE ? "#F59E0B" : "#E2E8F0" }}>
                          <div>{HEB_DAYS[day.dow]} {day.date}/{month.m + 1}</div>
                          {day.hebDate && <div style={{ fontSize: 12, color: "#818CF8", fontWeight: 400 }}>{day.hebDate}</div>}
                          {day.holidays.length > 0 && <div style={{ fontSize: 12, color: RELIGION_CLR[day.holidays[0].religion]?.tx || "#94A3B8", fontWeight: 400 }}>{day.holidays[0].nameHe}</div>}
                        </td>
                        {SHIFT_KEYS.map(st => {
                          const ck = constraints[`${emp.id}_${shiftKey(day.ds, st)}`];
                          const assigned = (assign[shiftKey(day.ds, st)] || []).includes(emp.id);
                          return (
                            <td key={st} style={{ padding: "4px 8px", textAlign: "center" }}>
                              {assigned ? (
                                <span style={{ ...S.badge("rgba(220,38,38,0.2)", "#F87171"), fontSize: 13 }}>משובץ ✓</span>
                              ) : (
                                <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
                                  <button onClick={() => { if (blockCount >= maxConst && ck !== "block") { notify("הגעת למגבלת חסימות!", "error"); return; } setConstraint(emp.id, day.ds, st, "block"); }} style={{ width: 30, height: 30, borderRadius: 7, border: "none", background: ck === "block" ? "rgba(239,68,68,0.25)" : "#F1F5F9", color: ck === "block" ? "#EF4444" : "#475569", cursor: "pointer", fontSize: 13 }} title="חסימה">🚫</button>
                                  <button onClick={() => setConstraint(emp.id, day.ds, st, "prefer")} style={{ width: 30, height: 30, borderRadius: 7, border: "none", background: ck === "prefer" ? "rgba(52,211,153,0.25)" : "#F1F5F9", color: ck === "prefer" ? "#34D399" : "#475569", cursor: "pointer", fontSize: 13 }} title="העדפה">⭐</button>
                                </div>
                              )}
                            </td>
                          );
                        })}
                        <td style={{ padding: "4px 8px", textAlign: "center" }}>
                          {isVac ? <span style={{ fontSize: 13, color: "#34D399" }}>✅</span> : pendingVac ? <span style={{ fontSize: 13, color: "#F59E0B" }}>⏳</span> : (
                            <button onClick={() => requestVacation(emp.id, day.ds)} style={{ background: "#F1F5F9", border: "none", borderRadius: 6, padding: "5px 10px", color: "#64748B", cursor: "pointer", fontSize: 12 }}>🏖️</button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════
  //  ADMIN LAYOUT
  // ══════════════════════════════════════════════════════════
  const NAV = [
    { id: "calendar", label: "לוח משמרות", icon: "📅" },
    { id: "employees", label: "עובדים", icon: "👥" },
    { id: "dashboard", label: "דשבורד", icon: "📊" },
    { id: "holidays", label: "לוח חגים", icon: "🕎" },
    { id: "alerts", label: `התראות (${alerts.length})`, icon: "⚠️" },
    { id: "export", label: "ייצוא", icon: "📄" },
    { id: "vacations", label: "חופשות", icon: "🏖️" },
    { id: "settings", label: "הגדרות", icon: "⚙️" },
  ];

  // ── Month Header ───────────────────────────────────────────
  const MonthHeader = ({ showAuto }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
      <button onClick={prevMonth} style={{ ...S.btnGhost, padding: "10px 16px", borderRadius: 12, fontSize: 18 }}>→</button>
      <h2 style={{ fontSize: 26, margin: 0, fontWeight: 800, minWidth: 180, textAlign: "center", letterSpacing: -0.5 }}>{HEB_MONTHS[month.m]} {month.y}</h2>
      <button onClick={nextMonth} style={{ ...S.btnGhost, padding: "10px 16px", borderRadius: 12, fontSize: 18 }}>←</button>
      <div style={{ flex: 1 }} />
      {showAuto && <button onClick={autoAssign} style={S.btnPrimary}>⚡ שיבוץ אוטומטי</button>}
    </div>
  );

  // ── CALENDAR VIEW ──────────────────────────────────────────
  const CalendarView = () => {
    const firstDow = new Date(month.y, month.m, 1).getDay();
    return (
      <>
        <MonthHeader showAuto />
        <div style={{ ...S.glass, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)" }}>
            {HEB_DAYS_SHORT.map((d, i) => (
              <div key={d} style={{ padding: "10px 4px", textAlign: "center", fontSize: 14, fontWeight: 700, color: i >= 5 ? "#F59E0B" : "#64748B", background: "#F1F5F9", borderBottom: "1px solid #E2E8F0" }}>{d}</div>
            ))}
            {Array(firstDow).fill(0).map((_, i) => <div key={`e${i}`} style={{ background: "#F1F5F9", minHeight: 120 }} />)}
            {days.map(day => {
              let hasAlert = false;
              const cells = SHIFT_KEYS.map(st => {
                const k = shiftKey(day.ds, st);
                const a = (assign[k] || []).map(id => employees.find(e => e.id === id)).filter(Boolean);
                const v = validateShift(a, st);
                if (!v.ok) hasAlert = true;
                return { st, a, v, k };
              });
              const hasHoliday = day.holidays.length > 0;
              return (
                <div key={day.date} style={{ background: hasHoliday ? "rgba(139,92,246,0.08)" : day.isWE ? "rgba(245,158,11,0.06)" : "#FFFFFF", minHeight: 150, padding: "6px 6px", borderBottom: "1px solid rgba(0,0,0,0.06)", borderLeft: "1px solid rgba(0,0,0,0.06)", position: "relative", cursor: "pointer" }}
                  onMouseEnter={e => { e.currentTarget.style.background = hasHoliday ? "rgba(139,92,246,0.12)" : day.isWE ? "rgba(245,158,11,0.15)" : "#F1F5F9"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = hasHoliday ? "rgba(139,92,246,0.08)" : day.isWE ? "rgba(245,158,11,0.06)" : "#F8FAFC"; }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 1 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: day.isWE ? "#F59E0B" : "#E2E8F0", background: day.isWE ? "rgba(245,158,11,0.15)" : undefined, borderRadius: 5, padding: "0 4px" }}>{day.date}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                      {hasAlert && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#EF4444", boxShadow: "0 0 5px rgba(239,68,68,0.5)" }} />}
                    </div>
                  </div>
                  {/* Hebrew date */}
                  {day.hebDate && <div style={{ fontSize: 13, color: "#818CF8", marginBottom: 1, lineHeight: 1.1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{day.hebDate}</div>}
                  {/* Holidays */}
                  {day.holidays.length > 0 && (
                    <div style={{ marginBottom: 1 }}>
                      {day.holidays.slice(0, 2).map((hol, hi) => {
                        const rc = RELIGION_CLR[hol.religion] || RELIGION_CLR.jewish;
                        return <div key={hi} style={{ fontSize: 12, color: rc.tx, background: rc.bg, borderRadius: 3, padding: "0 3px", marginBottom: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", lineHeight: "14px" }}>{rc.icon} {hol.nameHe}</div>;
                      })}
                      {day.holidays.length > 2 && <div style={{ fontSize: 12, color: "#64748B" }}>+{day.holidays.length - 2}</div>}
                    </div>
                  )}
                  {cells.map(({ st, a, v }) => (
                    <div key={st} onClick={() => setModal({ day, st })} style={{ display: "flex", alignItems: "center", gap: 3, padding: "2px 4px", borderRadius: 5, marginBottom: 1, background: v.ok ? `${SHIFTS[st].clr}12` : "rgba(239,68,68,0.08)", border: `1px solid ${v.ok ? SHIFTS[st].clr + "25" : "rgba(239,68,68,0.25)"}` }}>
                      <span style={{ fontSize: 13 }}>{SHIFTS[st].icon}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: v.ok ? SHIFTS[st].clr : "#EF4444" }}>{a.length}/{minReq[st]}</span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </>
    );
  };

  // ── ASSIGN MODAL ───────────────────────────────────────────
  const AssignModal = () => {
    if (!modal) return null;
    const { day, st } = modal;
    const k = shiftKey(day.ds, st);
    const assigned = assign[k] || [];
    const si = SHIFTS[st];
    const v = validateShift(assigned.map(id => employees.find(e => e.id === id)).filter(Boolean), st);

    return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(6px)" }} onClick={() => setModal(null)}>
        <div style={{ ...S.glass, width: 520, maxWidth: "100vw", maxHeight: "85vh", display: "flex", flexDirection: "column", overflow: "hidden", borderRadius: "24px 24px 0 0", animation: "slideUp 0.3s ease", boxShadow: "0 -4px 30px rgba(0,0,0,0.1)" }} onClick={e => e.stopPropagation()}>
          {/* header */}
          <div style={{ padding: "18px 22px", borderBottom: `2px solid ${si.clr}30`, background: `${si.clr}08` }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 22 }}>{si.icon}</span>
                  <h3 style={{ margin: 0, fontSize: 18 }}>{HEB_DAYS[day.dow]} {day.date}/{month.m + 1} – {si.label}</h3>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                  <span style={{ color: "#64748B", fontSize: 12 }}>{si.time}</span>
                  {day.hebDate && <span style={{ color: "#818CF8", fontSize: 12 }}>📅 {day.hebDate}</span>}
                </div>
                {day.holidays && day.holidays.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 6 }}>
                    {day.holidays.map((hol, hi) => {
                      const rc = RELIGION_CLR[hol.religion] || RELIGION_CLR.jewish;
                      return <span key={hi} style={{ fontSize: 13, color: rc.tx, background: rc.bg, border: `1px solid ${rc.border}`, borderRadius: 6, padding: "2px 8px" }}>{rc.icon} {hol.nameHe}</span>;
                    })}
                  </div>
                )}
              </div>
              <button onClick={() => setModal(null)} style={{ background: "#E2E8F0", border: "none", borderRadius: 8, width: 32, height: 32, color: "#64748B", cursor: "pointer", fontSize: 16 }}>✕</button>
            </div>
          </div>
          {/* status */}
          <div style={{ padding: "8px 22px", background: v.ok ? "rgba(5,150,105,0.08)" : "rgba(239,68,68,0.08)", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 14 }}>{v.ok ? "✅" : "⚠️"}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: v.ok ? "#34D399" : "#F87171" }}>{v.ok ? "קו אדום תקין" : v.issues.join(" · ")}</span>
          </div>
          {/* employees */}
          <div style={{ padding: "14px 22px", overflowY: "auto", flex: 1 }}>
            {employees.map(emp => {
              const isIn = assigned.includes(emp.id);
              const ck = constraints[`${emp.id}_${k}`];
              const isBlocked = ck === "block";
              const isVac = vacations[`${emp.id}_${day.ds}`];
              const otherSt = SHIFT_KEYS.filter(s => s !== st).find(s => (assign[shiftKey(day.ds, s)] || []).includes(emp.id));

              return (
                <div key={emp.id} onClick={() => { if (!isBlocked && !isVac) toggleAssign(day.ds, st, emp.id); }} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "10px 12px", borderRadius: 10, marginBottom: 5, cursor: isBlocked || isVac ? "not-allowed" : "pointer",
                  background: isIn ? "rgba(220,38,38,0.12)" : "#FAFAFA",
                  border: `1px solid ${isIn ? "rgba(220,38,38,0.2)" : ck === "prefer" ? "rgba(52,211,153,0.3)" : "#E2E8F0"}`,
                  opacity: isBlocked || isVac ? 0.35 : 1, transition: "all 0.15s",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: isIn ? "#DC2626" : "#F1F5F9", color: "#fff", fontSize: 12, fontWeight: 700 }}>
                      {isIn ? "✓" : emp.name[0]}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>{emp.name}</div>
                      <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 2 }}>
                        <span style={S.badge(ROLE_CLR[emp.role].bg, ROLE_CLR[emp.role].tx)}>{emp.role}</span>
                        <span style={{ color: "#475569", fontSize: 13 }}>{stats[emp.id]?.t || 0} משמרות</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 13 }}>
                    {isBlocked && <span style={{ color: "#EF4444" }}>🚫 חסום</span>}
                    {isVac && <span style={{ color: "#F59E0B" }}>🏖️ חופשה</span>}
                    {ck === "prefer" && <span style={{ color: "#34D399" }}>⭐</span>}
                    {otherSt && <span style={{ color: "#64748B" }}>📋 {SHIFTS[otherSt].label}</span>}
                  </div>
                </div>
              );






