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

// ── STYLES ────────────────────────────────────────────────────
const S = {
  root: { minHeight: "100vh", background: "#F8FAFC", fontFamily: "Rubik, Segoe UI, Tahoma, sans-serif", direction: "rtl", color: "#1E293B" },
  glass: { background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" },
  card: { background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 14, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" },
  btnPrimary: { background: "linear-gradient(135deg,#DC2626,#B91C1C)", color: "#fff", border: "none", borderRadius: 10, padding: "12px 24px", fontWeight: 700, cursor: "pointer", fontSize: 15, fontFamily: "inherit", boxShadow: "0 4px 14px rgba(220,38,38,0.25)" },
  btnGhost: { background: "#F1F5F9", border: "1px solid #CBD5E1", color: "#475569", borderRadius: 10, padding: "10px 18px", cursor: "pointer", fontSize: 14, fontFamily: "inherit" },
  input: { width: "100%", padding: "12px 16px", borderRadius: 10, border: "2px solid #CBD5E1", background: "#FFFFFF", color: "#1E293B", fontSize: 16, outline: "none", boxSizing: "border-box", fontFamily: "inherit" },
  badge: (bg, tx) => ({ display: "inline-block", padding: "3px 12px", borderRadius: 20, background: bg, color: tx, fontSize: 12, fontWeight: 600, letterSpacing: 0.3 }),
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
  const [employees] = useState(EMPLOYEES_INIT);
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
      <div style={{ ...S.root, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "fixed", inset: 0, background: "radial-gradient(ellipse at 30% 80%, rgba(220,38,38,0.06) 0%, transparent 55%), radial-gradient(ellipse at 70% 20%, rgba(245,158,11,0.15) 0%, transparent 50%)", pointerEvents: "none" }} />
        <div style={{ ...S.glass, padding: "44px 38px", width: 400, maxWidth: "92vw", textAlign: "center", position: "relative" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg,#DC2626,#F59E0B,#DC2626)", borderRadius: "16px 16px 0 0" }} />
          <div style={{ fontSize: 42, marginBottom: 8 }}>🔥</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 4px", letterSpacing: -0.5 }}>מערכת סידור עבודה</h1>
          <p style={{ color: "#64748B", fontSize: 13, margin: "0 0 28px" }}>משל"ט כבאות והצלה</p>
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
      <button onClick={prevMonth} style={S.btnGhost}>→</button>
      <h2 style={{ fontSize: 22, margin: 0, fontWeight: 800, minWidth: 160, textAlign: "center" }}>{HEB_MONTHS[month.m]} {month.y}</h2>
      <button onClick={nextMonth} style={S.btnGhost}>←</button>
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
              <div key={d} style={{ padding: "10px 4px", textAlign: "center", fontSize: 13, fontWeight: 700, color: i >= 5 ? "#F59E0B" : "#64748B", background: "#F1F5F9", borderBottom: "1px solid #E2E8F0" }}>{d}</div>
            ))}
            {Array(firstDow).fill(0).map((_, i) => <div key={`e${i}`} style={{ background: "#F8FAFC", minHeight: 110 }} />)}
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
                <div key={day.date} style={{ background: hasHoliday ? "rgba(139,92,246,0.08)" : day.isWE ? "rgba(245,158,11,0.06)" : "#FFFFFF", minHeight: 140, padding: "6px 6px", borderBottom: "1px solid rgba(0,0,0,0.06)", borderLeft: "1px solid rgba(0,0,0,0.06)", position: "relative", cursor: "pointer" }}
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
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(4px)" }} onClick={() => setModal(null)}>
        <div style={{ ...S.glass, width: 500, maxWidth: "95vw", maxHeight: "80vh", display: "flex", flexDirection: "column", overflow: "hidden" }} onClick={e => e.stopPropagation()}>
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
            })}
          </div>
        </div>
      </div>
    );
  };

  // ── EMPLOYEES VIEW ─────────────────────────────────────────
  const EmployeesView = () => {
    const [linkId, setLinkId] = useState(null);
    return (
      <>
        <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 20px" }}>ניהול עובדים</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(270px,1fr))", gap: 12 }}>
          {employees.map(emp => {
            const s = stats[emp.id] || { t: 0, m: 0, e: 0, n: 0, we: 0, h: 0 };
            const prog = Math.min((s.t / 27) * 100, 100);
            const blocks = Object.entries(constraints).filter(([k, v]) => k.startsWith(`${emp.id}_`) && v === "block").length;
            return (
              <div key={emp.id} style={{ ...S.card, transition: "transform 0.15s, border-color 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.borderColor = "#CBD5E1"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderColor = "#E2E8F0"; }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{emp.name}</div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <span style={S.badge(ROLE_CLR[emp.role].bg, ROLE_CLR[emp.role].tx)}>{emp.role}</span>
                      <span style={S.badge("#E2E8F0", "#94A3B8")}>{emp.type === "מלאה" ? "מלאה" : "סטודנט"}</span>
                    </div>
                  </div>
                  <button onClick={() => setLinkId(linkId === emp.id ? null : emp.id)} style={{ ...S.btnGhost, padding: "4px 10px", fontSize: 12 }}>🔗</button>
                </div>
                {/* progress */}
                <div style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#64748B", marginBottom: 4 }}>
                    <span>{s.t} / 21+ משמרות</span><span>{s.h} שעות</span>
                  </div>
                  <div style={{ height: 4, background: "#E2E8F0", borderRadius: 2 }}>
                    <div style={{ height: "100%", borderRadius: 2, width: `${prog}%`, background: prog >= 100 ? "#EF4444" : prog >= 75 ? "#F59E0B" : "#059669", transition: "width 0.3s" }} />
                  </div>
                </div>
                {/* shift dist */}
                <div style={{ display: "flex", gap: 6 }}>
                  {SHIFT_KEYS.map(st => (
                    <div key={st} style={{ flex: 1, textAlign: "center", padding: "3px 0", borderRadius: 6, background: `${SHIFTS[st].clr}10` }}>
                      <div style={{ fontSize: 12 }}>{SHIFTS[st].icon}</div>
                      <div style={{ color: SHIFTS[st].clr, fontSize: 14, fontWeight: 800 }}>{s[st[0]]}</div>
                    </div>
                  ))}
                  <div style={{ flex: 1, textAlign: "center", padding: "3px 0", borderRadius: 6, background: "rgba(245,158,11,0.15)" }}>
                    <div style={{ fontSize: 12 }}>🏠</div>
                    <div style={{ color: "#F59E0B", fontSize: 14, fontWeight: 800 }}>{s.we}</div>
                  </div>
                </div>
                {blocks > 0 && <div style={{ marginTop: 6, fontSize: 13, color: "#EF4444" }}>🚫 {blocks} חסימות</div>}
                {linkId === emp.id && (() => {
                  const empLink = `${window.location?.origin || "https://mashlat.vercel.app"}?emp=${emp.id}`;
                  return (
                  <div style={{ marginTop: 10, padding: 10, borderRadius: 8, background: "#F1F5F9", border: "1px solid #E2E8F0" }}>
                    <div style={{ color: "#64748B", fontSize: 13, marginBottom: 2 }}>קישור אישי:</div>
                    <div style={{ color: "#2563EB", fontSize: 13, wordBreak: "break-all", fontFamily: "monospace" }}>{empLink}</div>
                    <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                      <button onClick={() => { navigator.clipboard?.writeText(empLink); notify("הקישור הועתק!"); }} style={{ ...S.btnGhost, flex: 1, fontSize: 12, textAlign: "center" }}>
                        📋 העתק קישור
                      </button>
                      <button onClick={() => { setEmpPortal(emp); setView("employee_portal"); }} style={{ ...S.btnGhost, flex: 1, fontSize: 12, textAlign: "center" }}>
                        👁️ תצוגה מקדימה
                      </button>
                    </div>
                  </div>);
                })()}
              </div>
            );
          })}
        </div>
      </>
    );
  };

  // ── DASHBOARD VIEW ─────────────────────────────────────────
  const DashboardView = () => {
    const totalS = days.length * 3;
    const filled = Object.keys(assign).filter(k => k.startsWith(`${month.y}-${pad2(month.m + 1)}`)).length;
    const valid = totalS - alerts.length;
    const weVals = employees.map(e => stats[e.id]?.we || 0);
    const avgWE = employees.length ? (weVals.reduce((a, b) => a + b, 0) / employees.length).toFixed(1) : "0";
    const maxWE = Math.max(...weVals, 0);

    return (
      <>
        <MonthHeader />
        {/* summary cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 12, marginBottom: 20 }}>
          {[
            { label: 'סה"כ משמרות', val: totalS, clr: "#60A5FA", sub: `${filled} מאוישות` },
            { label: "תקינות", val: `${totalS ? Math.round((valid / totalS) * 100) : 0}%`, clr: alerts.length === 0 ? "#34D399" : "#F87171", sub: `${alerts.length} התראות` },
            { label: 'ממוצע סופ"ש', val: avgWE, clr: "#F59E0B", sub: `מקס: ${maxWE}` },
            { label: "עובדים", val: employees.length, clr: "#A78BFA", sub: Object.entries(ROLE_RANK).map(([r]) => `${employees.filter(e => e.role === r).length} ${r}`).filter(s => !s.startsWith("0")).join(", ") },
          ].map((c, i) => (
            <div key={i} style={S.card}>
              <div style={{ color: "#64748B", fontSize: 12, marginBottom: 6 }}>{c.label}</div>
              <div style={{ color: c.clr, fontSize: 30, fontWeight: 900, lineHeight: 1 }}>{c.val}</div>
              <div style={{ color: "#475569", fontSize: 13, marginTop: 4 }}>{c.sub}</div>
            </div>
          ))}
        </div>
        {/* table */}
        <div style={{ ...S.glass, overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid #E2E8F0" }}>
            <h3 style={{ margin: 0, fontSize: 16 }}>סטטיסטיקת עובדים</h3>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#F1F5F9" }}>
                  {["שם","תפקיד","סה\"כ","☀️","🌆","🌙","סופ\"ש","שעות","סטטוס"].map(h => (
                    <th key={h} style={{ padding: "10px 12px", textAlign: "right", color: "#64748B", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {employees.map(emp => {
                  const s = stats[emp.id] || { t: 0, m: 0, e: 0, n: 0, we: 0, h: 0 };
                  let status = "תקין", stClr = "#34D399";
                  if (s.t < 21) { status = "חסר"; stClr = "#F87171"; }
                  else if (s.h > 218) { status = "חריגה"; stClr = "#F59E0B"; }
                  return (
                    <tr key={emp.id} style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                      <td style={{ padding: "10px 12px", fontSize: 13, fontWeight: 500 }}>{emp.name}</td>
                      <td style={{ padding: "10px 12px" }}><span style={S.badge(ROLE_CLR[emp.role].bg, ROLE_CLR[emp.role].tx)}>{emp.role}</span></td>
                      <td style={{ padding: "10px 12px", fontSize: 14, fontWeight: 800 }}>{s.t}</td>
                      <td style={{ padding: "10px 12px", color: SHIFTS.morning.clr }}>{s.m}</td>
                      <td style={{ padding: "10px 12px", color: SHIFTS.evening.clr }}>{s.e}</td>
                      <td style={{ padding: "10px 12px", color: SHIFTS.night.clr }}>{s.n}</td>
                      <td style={{ padding: "10px 12px", color: "#F59E0B" }}>{s.we}</td>
                      <td style={{ padding: "10px 12px", color: "#64748B" }}>{s.h}</td>
                      <td style={{ padding: "10px 12px" }}><span style={{ ...S.badge(`${stClr}15`, stClr), fontSize: 13 }}>{status}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        {/* Holidays this month */}
        {(() => {
          const monthHolidays = days.filter(d => d.holidays.length > 0);
          if (monthHolidays.length === 0) return null;
          return (
            <div style={{ ...S.card, marginTop: 12 }}>
              <h3 style={{ margin: "0 0 14px", fontSize: 16 }}>🗓️ חגים ומועדים בחודש זה</h3>
              <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
                {Object.entries(RELIGION_CLR).map(([rel, rc]) => (
                  <span key={rel} style={{ fontSize: 13, color: rc.tx, background: rc.bg, border: `1px solid ${rc.border}`, borderRadius: 6, padding: "3px 10px" }}>
                    {rc.icon} {rel === "jewish" ? "יהדות" : rel === "christian" ? "נצרות" : "אסלאם"}
                  </span>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 6 }}>
                {monthHolidays.map(day => day.holidays.map((hol, hi) => {
                  const rc = RELIGION_CLR[hol.religion] || RELIGION_CLR.jewish;
                  return (
                    <div key={`${day.date}-${hi}`} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 8, background: rc.bg, border: `1px solid ${rc.border}` }}>
                      <div style={{ fontSize: 18 }}>{rc.icon}</div>
                      <div>
                        <div style={{ color: rc.tx, fontSize: 13, fontWeight: 600 }}>{hol.nameHe}</div>
                        <div style={{ color: "#64748B", fontSize: 13 }}>{HEB_DAYS[day.dow]} {day.date}/{month.m + 1} · {day.hebDate}</div>
                      </div>
                      {hol.major && <span style={{ fontSize: 12, color: rc.tx, background: `${rc.tx}15`, borderRadius: 4, padding: "1px 5px", marginRight: "auto" }}>מרכזי</span>}
                    </div>
                  );
                }))}
              </div>
            </div>
          );
        })()}
        {/* weekend fairness */}
        <div style={{ ...S.card, marginTop: 12 }}>
          <h3 style={{ margin: "0 0 14px", fontSize: 16 }}>חלוקת סופ"ש</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {employees.map(emp => {
              const w = stats[emp.id]?.we || 0;
              const diff = Math.abs(w - parseFloat(avgWE));
              const c = diff > 1.5 ? "#EF4444" : diff > 0.5 ? "#F59E0B" : "#34D399";
              return (
                <div key={emp.id} style={{ background: "rgba(15,23,42,0.5)", borderRadius: 8, padding: "6px 12px", minWidth: 90, textAlign: "center" }}>
                  <div style={{ fontSize: 13, color: "#64748B", whiteSpace: "nowrap" }}>{emp.name.split(" ")[0]}</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: c }}>{w}</div>
                  <div style={{ height: 3, borderRadius: 2, background: `${c}25`, marginTop: 4 }}>
                    <div style={{ height: "100%", borderRadius: 2, width: `${maxWE ? (w / maxWE) * 100 : 0}%`, background: c }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </>
    );
  };

  // ── ALERTS VIEW ────────────────────────────────────────────
  const AlertsView = () => (
    <>
      <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 20px" }}>התראות ופערים ({alerts.length})</h2>
      {alerts.length === 0 ? (
        <div style={{ ...S.card, textAlign: "center", padding: 40, background: "rgba(5,150,105,0.06)", borderColor: "rgba(52,211,153,0.15)" }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>✅</div>
          <div style={{ fontSize: 18, fontWeight: 600, color: "#34D399" }}>כל המשמרות תקינות!</div>
          <div style={{ color: "#64748B", fontSize: 13 }}>קו אדום מתקיים בכל המשמרות</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {alerts.map((al, i) => {
            const avail = employees.filter(emp => {
              if (constraints[`${emp.id}_${shiftKey(al.ds, al.st)}`] === "block") return false;
              if (vacations[`${emp.id}_${al.ds}`]) return false;
              if ((assign[shiftKey(al.ds, al.st)] || []).includes(emp.id)) return false;
              return true;
            });
            return (
              <div key={i} style={{ ...S.glass, overflow: "hidden", borderColor: "rgba(239,68,68,0.15)" }}>
                <div style={{ padding: "12px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 20 }}>{SHIFTS[al.st].icon}</span>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 14, fontWeight: 600 }}>{HEB_DAYS[al.dow]} {al.date}/{month.m + 1} – {SHIFTS[al.st].label}</span>
                        {(() => { const d = days.find(dd => dd.ds === al.ds); return d && d.hebDate ? <span style={{ fontSize: 13, color: "#818CF8" }}>{d.hebDate}</span> : null; })()}
                      </div>
                      <div style={{ color: "#F87171", fontSize: 12 }}>{al.issues.join(" · ")}</div>
                      {(() => { const d = days.find(dd => dd.ds === al.ds); return d && d.holidays.length > 0 ? (
                        <div style={{ display: "flex", gap: 4, marginTop: 3 }}>
                          {d.holidays.slice(0, 2).map((hol, hi) => {
                            const rc = RELIGION_CLR[hol.religion];
                            return <span key={hi} style={{ fontSize: 12, color: rc?.tx, background: rc?.bg, borderRadius: 4, padding: "1px 6px" }}>{rc?.icon} {hol.nameHe}</span>;
                          })}
                        </div>
                      ) : null; })()}
                    </div>
                  </div>
                  <button onClick={() => setModal({ day: days.find(d => d.ds === al.ds), st: al.st })} style={{ ...S.btnGhost, borderColor: "rgba(220,38,38,0.3)", color: "#F87171", fontSize: 12 }}>שבץ</button>
                </div>
                {avail.length > 0 && (
                  <div style={{ padding: "6px 18px 12px", borderTop: "1px solid rgba(239,68,68,0.08)" }}>
                    <div style={{ color: "#64748B", fontSize: 13, marginBottom: 4 }}>זמינים ({avail.length}):</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {avail.slice(0, 10).map(emp => (
                        <span key={emp.id} onClick={() => toggleAssign(al.ds, al.st, emp.id)} style={{ padding: "3px 10px", borderRadius: 14, fontSize: 13, cursor: "pointer", background: "#F1F5F9", border: "1px solid #E2E8F0", transition: "all 0.15s" }}
                          onMouseEnter={e => { e.target.style.background = "rgba(220,38,38,0.15)"; e.target.style.borderColor = "rgba(220,38,38,0.3)"; }}
                          onMouseLeave={e => { e.target.style.background = "#F1F5F9"; e.target.style.borderColor = "#E2E8F0"; }}
                        >{emp.name} ({emp.role})</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );

  // ── VACATIONS VIEW ─────────────────────────────────────────
  const VacationsView = () => {
    const pending = vacReqs.filter(r => r.status === "pending");
    const done = vacReqs.filter(r => r.status !== "pending");
    return (
      <>
        <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 20px" }}>ניהול חופשות</h2>
        {pending.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ color: "#F59E0B", fontSize: 14, margin: "0 0 10px" }}>ממתינות ({pending.length})</h3>
            {pending.map(r => {
              const emp = employees.find(e => e.id === r.empId);
              return (
                <div key={r.id} style={{ ...S.card, display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, borderColor: "rgba(245,158,11,0.2)" }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{emp?.name} – {r.ds}</div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => approveVacation(r.id, true)} style={{ ...S.btnGhost, borderColor: "rgba(52,211,153,0.3)", color: "#34D399" }}>✓ אשר</button>
                    <button onClick={() => approveVacation(r.id, false)} style={{ ...S.btnGhost, borderColor: "rgba(239,68,68,0.3)", color: "#F87171" }}>✗ דחה</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {done.length > 0 && (
          <div>
            <h3 style={{ color: "#64748B", fontSize: 14, margin: "0 0 10px" }}>היסטוריה ({done.length})</h3>
            {done.map(r => {
              const emp = employees.find(e => e.id === r.empId);
              return (
                <div key={r.id} style={{ ...S.card, padding: 12, display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ color: "#64748B", fontSize: 13 }}>{emp?.name} – {r.ds}</span>
                  <span style={S.badge(r.status === "approved" ? "rgba(52,211,153,0.12)" : "rgba(239,68,68,0.12)", r.status === "approved" ? "#34D399" : "#F87171")}>{r.status === "approved" ? "אושר" : "נדחה"}</span>
                </div>
              );
            })}
          </div>
        )}
        {vacReqs.length === 0 && (
          <div style={{ ...S.card, textAlign: "center", padding: 40 }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>🏖️</div>
            <div style={{ color: "#64748B", fontSize: 14 }}>אין בקשות חופשה</div>
          </div>
        )}
      </>
    );
  };

  // ── SETTINGS VIEW ──────────────────────────────────────────
  const SettingsView = () => (
    <>
      <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 20px" }}>הגדרות</h2>
      <div style={{ ...S.card, maxWidth: 480 }}>
        <div style={{ marginBottom: 20 }}>
          <label style={{ color: "#64748B", fontSize: 13, display: "block", marginBottom: 6 }}>מגבלת חסימות לעובד (לחודש)</label>
          <input type="number" min={1} max={30} value={maxConst} onChange={e => setMaxConst(parseInt(e.target.value) || 8)} style={S.input} />
        </div>
        <div style={{ padding: 16, borderRadius: 10, background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.15)" }}>
          <div style={{ color: "#F59E0B", fontSize: 13, fontWeight: 700, marginBottom: 8 }}>קו אדום – דרישות מינימום</div>
          <div style={{ color: "#64748B", fontSize: 12, lineHeight: 1.8 }}>
            ☀️ בוקר: 3 (2 סמב"צ + אחמ"ש/קצין)<br />
            🌆 ערב: 3 (2 סמב"צ + אחמ"ש/קצין)<br />
            🌙 לילה: 2 (חליף אחמ"ש + סמב"צ)
          </div>
        </div>
        <div style={{ marginTop: 16, padding: 16, borderRadius: 10, background: "#FAFAFA", border: "1px solid #E2E8F0" }}>
          <div style={{ color: "#64748B", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>סיסמת מנהל</div>
          <div style={{ color: "#64748B", fontSize: 12 }}>{ADMIN_PASS}</div>
        </div>

        {/* Admin management tools */}
        <div style={{ marginTop: 24, padding: 16, borderRadius: 10, background: "#FEF2F2", border: "1px solid #FECACA" }}>
          <div style={{ color: "#DC2626", fontSize: 15, fontWeight: 700, marginBottom: 14 }}>🔧 כלי ניהול</div>

          {/* Clear all assignments for month */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ color: "#1E293B", fontSize: 14, fontWeight: 600, marginBottom: 6 }}>🗑️ מחיקת כל שיבוצי החודש</div>
            <div style={{ color: "#64748B", fontSize: 12, marginBottom: 8 }}>מוחק את כל השיבוצים של {HEB_MONTHS[month.m]} {month.y}</div>
            <button onClick={() => {
              if (confirm(`למחוק את כל השיבוצים של ${HEB_MONTHS[month.m]} ${month.y}? פעולה זו לא ניתנת לביטול!`)) {
                setAssign(prev => {
                  const next = { ...prev };
                  Object.keys(next).forEach(k => { if (k.startsWith(`${month.y}-${pad2(month.m + 1)}`)) delete next[k]; });
                  return next;
                });
                notify("כל שיבוצי החודש נמחקו", "success");
              }
            }} style={{ ...S.btnPrimary, fontSize: 13, padding: "8px 16px" }}>
              מחק שיבוצי חודש
            </button>
          </div>

          <hr style={{ border: "none", borderTop: "1px solid #FECACA", margin: "14px 0" }} />

          {/* Remove employee from specific shift */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ color: "#1E293B", fontSize: 14, fontWeight: 600, marginBottom: 6 }}>👤 הסרת עובד ממשמרת</div>
            <div style={{ color: "#64748B", fontSize: 12, marginBottom: 8 }}>לחץ על משמרת בלוח השנה → לחץ על עובד משובץ כדי להסיר</div>
          </div>

          <hr style={{ border: "none", borderTop: "1px solid #FECACA", margin: "14px 0" }} />

          {/* Reset employee constraints */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ color: "#1E293B", fontSize: 14, fontWeight: 600, marginBottom: 6 }}>🚫 איפוס אילוצים של עובד</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {employees.map(emp => (
                <button key={emp.id} onClick={() => {
                  if (confirm(`לאפס את כל האילוצים של ${emp.name}?`)) {
                    setConstraints(prev => {
                      const next = { ...prev };
                      Object.keys(next).forEach(k => { if (k.startsWith(`${emp.id}_`)) delete next[k]; });
                      return next;
                    });
                    notify(`אילוצים של ${emp.name} אופסו`, "success");
                  }
                }} style={{ ...S.btnGhost, fontSize: 12, padding: "4px 10px" }}>
                  {emp.name}
                </button>
              ))}
            </div>
          </div>

          <hr style={{ border: "none", borderTop: "1px solid #FECACA", margin: "14px 0" }} />

          {/* Delete employee */}
          <div>
            <div style={{ color: "#1E293B", fontSize: 14, fontWeight: 600, marginBottom: 6 }}>❌ מחיקת עובד מהמערכת</div>
            <div style={{ color: "#64748B", fontSize: 12, marginBottom: 8 }}>העובד ייעלם מכל הרשימות והשיבוצים</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {employees.map(emp => (
                <button key={emp.id} onClick={() => {
                  if (confirm(`למחוק את ${emp.name} מהמערכת? כל השיבוצים והאילוצים שלו יימחקו!`)) {
                    setEmployees(prev => prev.filter(e => e.id !== emp.id));
                    setAssign(prev => {
                      const next = { ...prev };
                      Object.keys(next).forEach(k => { next[k] = next[k].filter(id => id !== emp.id); if (next[k].length === 0) delete next[k]; });
                      return next;
                    });
                    setConstraints(prev => {
                      const next = { ...prev };
                      Object.keys(next).forEach(k => { if (k.startsWith(`${emp.id}_`)) delete next[k]; });
                      return next;
                    });
                    notify(`${emp.name} נמחק מהמערכת`, "success");
                  }
                }} style={{ ...S.btnGhost, fontSize: 12, padding: "4px 10px", borderColor: "#FECACA", color: "#DC2626" }}>
                  {emp.name} ✕
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );

  // ── EXPORT VIEW ─────────────────────────────────────────────
  const ExportView = () => {
    const totalShifts = days.length * 3;
    const filled = Object.keys(assign).filter(k => k.startsWith(`${month.y}-${pad2(month.m + 1)}`)).length;
    const valid = totalShifts - alerts.length;
    const pct = totalShifts ? Math.round((valid / totalShifts) * 100) : 0;

    return (
      <>
        <MonthHeader />
        <div style={{ maxWidth: 600 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 20px" }}>📄 ייצוא סידור עבודה</h2>
          {/* Status summary */}
          <div style={{ ...S.card, marginBottom: 16 }}>
            <h3 style={{ margin: "0 0 12px", fontSize: 15, color: "#64748B" }}>סטטוס סידור – {HEB_MONTHS[month.m]} {month.y}</h3>
            <div style={{ display: "flex", gap: 16 }}>
              <div style={{ flex: 1, textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: pct === 100 ? "#34D399" : "#F87171" }}>{pct}%</div>
                <div style={{ color: "#64748B", fontSize: 12 }}>תקינות</div>
              </div>
              <div style={{ flex: 1, textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: "#60A5FA" }}>{filled}/{totalShifts}</div>
                <div style={{ color: "#64748B", fontSize: 12 }}>מאוישות</div>
              </div>
              <div style={{ flex: 1, textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: alerts.length === 0 ? "#34D399" : "#F87171" }}>{alerts.length}</div>
                <div style={{ color: "#64748B", fontSize: 12 }}>התראות</div>
              </div>
            </div>
            {alerts.length > 0 && (
              <div style={{ marginTop: 12, padding: "8px 12px", borderRadius: 8, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)", color: "#F87171", fontSize: 12 }}>
                ⚠️ יש {alerts.length} משמרות שלא עומדות בקו אדום. הייצוא יסמן אותן בכתום.
              </div>
            )}
          </div>

          {/* Word export */}
          <div style={{ ...S.card, marginBottom: 12, cursor: "pointer", transition: "all 0.15s" }}
            onClick={() => { exportToWord(month, days, employees, assign, SHIFTS, SHIFT_KEYS, stats); notify("קובץ Word מוכן להורדה!", "success"); }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(59,130,246,0.4)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 52, height: 52, borderRadius: 12, background: "rgba(59,130,246,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>📝</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 2 }}>ייצוא ל-Word (.doc)</div>
                <div style={{ color: "#64748B", fontSize: 12 }}>קובץ וורד מפורט עם טבלת סידור, סטטיסטיקות עובדים, ולוח חגים</div>
              </div>
              <div style={{ color: "#3B82F6", fontSize: 24 }}>⬇️</div>
            </div>
          </div>

          {/* PDF export */}
          <div style={{ ...S.card, marginBottom: 12, cursor: "pointer", transition: "all 0.15s" }}
            onClick={() => { exportToPDF(month, days, employees, assign, SHIFTS, SHIFT_KEYS, stats); notify("חלון הדפסה נפתח", "success"); }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(220,38,38,0.4)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 52, height: 52, borderRadius: 12, background: "rgba(220,38,38,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>📄</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 2 }}>ייצוא ל-PDF</div>
                <div style={{ color: "#64748B", fontSize: 12 }}>פותח חלון הדפסה – בחר "שמור כ-PDF" כדי לשמור קובץ</div>
              </div>
              <div style={{ color: "#DC2626", fontSize: 24 }}>🖨️</div>
            </div>
          </div>

          {/* What's included */}
          <div style={{ ...S.card, background: "#FAFAFA" }}>
            <h3 style={{ margin: "0 0 10px", fontSize: 14, color: "#64748B" }}>מה כלול בייצוא?</h3>
            <div style={{ color: "#64748B", fontSize: 13, lineHeight: 1.8 }}>
              📋 טבלת סידור עבודה מלאה עם כל המשמרות<br/>
              📅 תאריכים עבריים וחגים (יהודיים, נוצריים, מוסלמיים)<br/>
              👥 שמות ותפקידים של כל עובד משובץ<br/>
              ⚠️ סימון משמרות שלא עומדות בקו אדום<br/>
              📊 עמוד סטטיסטיקות – שעות, חלוקת משמרות, סופ"ש<br/>
              🕎 עמוד חגים ומועדים לחודש
            </div>
          </div>
        </div>
      </>
    );
  };

  // ── HOLIDAYS VIEW ────────────────────────────────────────────
  const HolidaysView = () => {
    const allHolidays = { ...getHolidays(month.y), ...getHolidays(month.y + 1) };
    const monthKey = `${month.y}-${pad2(month.m + 1)}`;
    const monthHolidays = Object.entries(allHolidays)
      .filter(([ds]) => ds.startsWith(monthKey))
      .sort(([a], [b]) => a.localeCompare(b))
      .flatMap(([ds, hols]) => hols.map(h => ({ ...h, ds, date: parseInt(ds.split("-")[2]), dow: new Date(ds).getDay() })));

    const byReligion = { jewish: [], christian: [], muslim: [] };
    monthHolidays.forEach(h => { if (byReligion[h.religion]) byReligion[h.religion].push(h); });

    return (
      <>
        <MonthHeader />
        <div style={{ ...S.card, marginBottom: 16 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 4px" }}>🕎 לוח חגים ומועדים</h2>
          <p style={{ color: "#64748B", fontSize: 13, margin: 0 }}>חגים יהודיים, נוצריים ומוסלמיים – {HEB_MONTHS[month.m]} {month.y}</p>
        </div>
        {monthHolidays.length === 0 ? (
          <div style={{ ...S.card, textAlign: "center", padding: 40 }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>📅</div>
            <div style={{ color: "#64748B", fontSize: 14 }}>אין חגים בחודש זה</div>
          </div>
        ) : (
          <>
            {/* Timeline */}
            <div style={{ ...S.glass, overflow: "hidden", marginBottom: 16 }}>
              <div style={{ padding: "14px 20px", borderBottom: "1px solid #E2E8F0" }}>
                <h3 style={{ margin: 0, fontSize: 15 }}>ציר זמן – כל החגים בחודש</h3>
              </div>
              <div style={{ padding: "16px 20px" }}>
                {monthHolidays.map((h, i) => {
                  const rc = RELIGION_CLR[h.religion];
                  const hebD = getHebrewDateStr(month.y, month.m, h.date);
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 12, position: "relative" }}>
                      {/* timeline dot + line */}
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 20, flexShrink: 0 }}>
                        <div style={{ width: 12, height: 12, borderRadius: "50%", background: rc.tx, border: `2px solid ${rc.border}`, zIndex: 1 }} />
                        {i < monthHolidays.length - 1 && <div style={{ width: 2, flex: 1, minHeight: 20, background: "#E2E8F0" }} />}
                      </div>
                      {/* content */}
                      <div style={{ flex: 1, padding: "8px 14px", borderRadius: 10, background: rc.bg, border: `1px solid ${rc.border}` }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                          <span style={{ fontSize: 16 }}>{rc.icon}</span>
                          <span style={{ color: rc.tx, fontSize: 15, fontWeight: 700 }}>{h.nameHe}</span>
                          {h.major && <span style={{ fontSize: 13, background: `${rc.tx}20`, color: rc.tx, borderRadius: 4, padding: "1px 6px", fontWeight: 700 }}>חג מרכזי</span>}
                        </div>
                        <div style={{ color: "#64748B", fontSize: 12 }}>
                          {HEB_DAYS[h.dow]} {h.date}/{month.m + 1} · {hebD} · {h.name}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            {/* By religion */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 12 }}>
              {Object.entries(byReligion).map(([rel, hols]) => {
                if (hols.length === 0) return null;
                const rc = RELIGION_CLR[rel];
                const relName = rel === "jewish" ? "יהדות" : rel === "christian" ? "נצרות" : "אסלאם";
                return (
                  <div key={rel} style={{ ...S.card, borderColor: rc.border }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                      <span style={{ fontSize: 22 }}>{rc.icon}</span>
                      <div>
                        <div style={{ color: rc.tx, fontSize: 16, fontWeight: 700 }}>{relName}</div>
                        <div style={{ color: "#64748B", fontSize: 12 }}>{hols.length} חגים בחודש</div>
                      </div>
                    </div>
                    {hols.map((h, i) => (
                      <div key={i} style={{ padding: "6px 10px", borderRadius: 6, background: rc.bg, marginBottom: 4 }}>
                        <div style={{ color: rc.tx, fontSize: 13, fontWeight: 600 }}>{h.nameHe}</div>
                        <div style={{ color: "#64748B", fontSize: 13 }}>{HEB_DAYS[h.dow]} {h.date}/{month.m + 1}</div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </>
    );
  };

  // ── CONTENT MAP ────────────────────────────────────────────
  const VIEWS = {
    calendar: CalendarView,
    employees: EmployeesView,
    dashboard: DashboardView,
    holidays: HolidaysView,
    export: ExportView,
    alerts: AlertsView,
    vacations: VacationsView,
    settings: SettingsView,
  };
  const Content = VIEWS[view] || CalendarView;

  return (
    <div style={S.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #CBD5E1; }
      `}</style>

      {/* Toast */}
      {toast && <Toast msg={toast.msg} type={toast.type} />}

      {/* Modal */}
      <AssignModal />

      {/* Sidebar */}
      <div style={{
        position: "fixed", right: 0, top: 0, bottom: 0, zIndex: 100,
        width: sidebar ? 230 : 58, background: "rgba(8,15,30,0.95)",
        borderLeft: "1px solid #E2E8F0",
        transition: "width 0.25s ease", display: "flex", flexDirection: "column", overflow: "hidden",
      }}>
        <div style={{ padding: sidebar ? "16px 18px" : "16px 10px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid #E2E8F0", cursor: "pointer" }} onClick={() => setSidebar(p => !p)}>
          <span style={{ fontSize: 24, flexShrink: 0 }}>🔥</span>
          {sidebar && <div><div style={{ fontSize: 15, fontWeight: 800 }}>משל"ט</div><div style={{ color: "#475569", fontSize: 12 }}>כבאות והצלה</div></div>}
        </div>
        <nav style={{ flex: 1, padding: "10px 6px" }}>
          {NAV.map(n => {
            const active = view === n.id;
            return (
              <button key={n.id} onClick={() => setView(n.id)} style={{
                display: "flex", alignItems: "center", gap: 10, width: "100%",
                padding: sidebar ? "10px 12px" : "10px 0", justifyContent: sidebar ? "flex-start" : "center",
                borderRadius: 9, border: "none", cursor: "pointer", marginBottom: 3,
                background: active ? "rgba(220,38,38,0.12)" : "transparent",
                color: active ? "#F87171" : "#64748B", fontSize: 13, fontWeight: active ? 600 : 400,
                fontFamily: "inherit", transition: "all 0.15s", position: "relative",
              }}>
                {active && <div style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)", width: 3, height: 18, borderRadius: 2, background: "#DC2626" }} />}
                <span style={{ fontSize: 16 }}>{n.icon}</span>
                {sidebar && <span>{n.label}</span>}
              </button>
            );
          })}
        </nav>
        <div style={{ padding: "10px 6px", borderTop: "1px solid #E2E8F0" }}>
          <button onClick={() => { setView("login"); setPw(""); }} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: sidebar ? "10px 12px" : "10px 0", justifyContent: sidebar ? "flex-start" : "center", borderRadius: 9, border: "none", cursor: "pointer", background: "transparent", color: "#475569", fontSize: 12, fontFamily: "inherit" }}>
            <span style={{ fontSize: 16 }}>🚪</span>
            {sidebar && <span>יציאה</span>}
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={{ marginRight: sidebar ? 230 : 58, padding: "24px 28px", transition: "margin-right 0.25s ease", minHeight: "100vh" }}>
        <Content />
      </div>
    </div>
  );
}

// ── TOAST COMPONENT ──────────────────────────────────────────
function Toast({ msg, type }) {
  const bg = type === "success" ? "rgba(5,150,105,0.92)" : type === "error" ? "rgba(220,38,38,0.92)" : "rgba(37,99,235,0.92)";
  return (
    <div style={{ position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)", background: bg, color: "#fff", padding: "10px 24px", borderRadius: 10, fontSize: 14, fontWeight: 600, zIndex: 9999, boxShadow: "0 8px 24px rgba(0,0,0,0.4)", fontFamily: "Rubik, sans-serif" }}>
      {msg}
    </div>
  );
}
