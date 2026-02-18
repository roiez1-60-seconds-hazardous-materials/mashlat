# 🔥 מערכת סידור עבודה – משל"ט כבאות והצלה

## מדריך הקמה מלא (10 דקות)

---

## שלב 1: פתיחת חשבון Supabase (2 דקות)

1. היכנס ל-**https://supabase.com** ולחץ **Start your project**
2. הירשם עם חשבון GitHub (אם אין לך GitHub – פתח קודם ב-https://github.com)
3. לחץ **New Project**
4. מלא:
   - **Name**: `mshlat`
   - **Database Password**: בחר סיסמה חזקה (שמור אותה!)
   - **Region**: `West EU (Ireland)` (הכי קרוב לישראל)
5. לחץ **Create new project** → חכה כדקה עד שהפרויקט מוכן

## שלב 2: יצירת טבלאות במסד (3 דקות)

1. ב-Supabase, לחץ על **SQL Editor** בתפריט השמאלי
2. העתק את **כל** הקוד מהקובץ `supabase-schema.sql` שנמצא בפרויקט
3. הדבק בעורך ולחץ **Run**
4. צפה להודעת Success

## שלב 3: קבלת מפתחות API

1. לחץ על **Settings** (גלגל שיניים) → **API**
2. העתק:
   - **Project URL** → זה ה-`NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → זה ה-`NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. שמור את שניהם — תצטרך אותם בשלב 5

## שלב 4: העלאה ל-GitHub

1. אם אין לך Git מותקן: https://git-scm.com/downloads
2. פתח טרמינל בתיקיית הפרויקט והרץ:

```bash
git init
git add .
git commit -m "Initial commit - MSHLAT shift scheduler"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/mshlat.git
git push -u origin main
```

(החלף `YOUR_USERNAME` בשם המשתמש שלך ב-GitHub)

## שלב 5: Deployment ב-Vercel (2 דקות)

1. היכנס ל-**https://vercel.com** עם חשבון GitHub
2. לחץ **Add New → Project**
3. בחר את ה-repo `mshlat`
4. ב-**Environment Variables** הוסף:
   - `NEXT_PUBLIC_SUPABASE_URL` = (מה שהעתקת בשלב 3)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (מה שהעתקת בשלב 3)
5. לחץ **Deploy**
6. תוך דקה-שתיים תקבל כתובת כמו `mshlat.vercel.app` 🎉

## שלב 6: הגדרת Supabase RLS (אבטחה)

1. חזור ל-Supabase → **SQL Editor**
2. העתק את הקוד מ-`supabase-rls.sql` והרץ אותו

---

## שימוש באפליקציה

### כניסת מנהל
- היכנס לכתובת Vercel שלך
- סיסמת ברירת מחדל: `admin123`
- שנה את הסיסמה בהגדרות!

### קישור לעובדים
- בעמוד "עובדים" לחץ 🔗 ליד כל עובד
- שלח לעובד את הקישור האישי
- העובד ייכנס, יוכל לחסום/להעדיף משמרות ולבקש חופשות

---

## קבצי הפרויקט

```
mshlat/
├── src/
│   ├── app/
│   │   ├── layout.js          # Layout ראשי
│   │   └── page.js            # דף ראשי (טוען את האפליקציה)
│   └── lib/
│       ├── supabase.js         # חיבור Supabase
│       └── database.js         # פונקציות מסד נתונים
├── public/
├── package.json
├── next.config.js
├── supabase-schema.sql         # סכמת מסד נתונים
├── supabase-rls.sql            # כללי אבטחה
└── README.md                   # הקובץ הזה
```

