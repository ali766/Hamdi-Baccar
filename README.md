# دروسي (Student LMS)

منصة بسيطة: صفحة دخول للطالب (اسم + رقم + كود تأكيد تجريبي)، ولوحة تحكم للمدرّس (طلاب، دروس، متابعة مذاكرة). البيانات متزامنة لحظيًا بين كل الأجهزة عن طريق Firebase Firestore.

## الخطوة ١: اعمل مشروع Firebase (مجاني)

1. روح على https://console.firebase.google.com وسجّل دخول بحساب جوجل.
2. دوس "Add project" وسمّي المشروع أي اسم (مثلاً `dorosy`).
3. من القايمة الجانبية: **Build -> Firestore Database -> Create database**.
   - اختار **Start in production mode** (هنظبط الصلاحيات بعدين تحت).
   - اختار أقرب منطقة ليك.
4. من **Project settings** (أيقونة الترس فوق) -> نزّل تحت لحد **"Your apps"** -> دوس أيقونة الويب `</>`.
5. سمّي التطبيق أي اسم، وهيديك object فيه `apiKey`, `authDomain`, `projectId`... الخ.
6. انسخ القيم دي وحطها في `src/firebaseConfig.js` بدل القيم الوهمية.

## الخطوة ٢: ظبّط صلاحيات Firestore

في Firestore -> تبويب **Rules**، حط القاعدة دي (بسيطة ومناسبة لمشروع صغير زي ده):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /lms/data {
      allow read, write: if true;
    }
  }
}
```

> ملحوظة: القاعدة دي مفتوحة (أي حد معاه رابط مشروعك يقدر يقرا/يكتب البيانات). ده كويس لمشروع تعليمي بسيط، لكن لو حبيت حماية أقوى بعدين قولّي وهنضيف تسجيل دخول حقيقي (Firebase Authentication).

## الخطوة ٣: ارفع المشروع على GitHub

```bash
cd student-lms
git init
git add .
git commit -m "أول نسخة من منصة الدروس"
git branch -M main
git remote add origin https://github.com/USERNAME/REPO.git
git push -u origin main
```

## الخطوة ٤: فعّل GitHub Pages

1. في صفحة الـ repo على GitHub: **Settings -> Pages**.
2. تحت "Build and deployment" اختار **Source: GitHub Actions**.
3. ارجع لتبويب **Actions** هتلاقي الـ workflow شغّال لوحده (بسبب ملف `.github/workflows/deploy.yml`).
4. لما يخلص هيديك رابط الموقع تحت في نفس صفحة Pages، شكله هيكون:
   `https://USERNAME.github.io/REPO/`

كل مرة تعمل `git push` على `main`، الموقع هيتحدّث لوحده تلقائي.

## التجربة محليًا قبل الرفع (اختياري)

```bash
npm install
npm run dev
```

هيديك رابط محلي (`http://localhost:5173`) تقدر تجرب عليه.

## كلمة سر المدرّس الافتراضية

`2580` — تقدر تغيّرها من تبويب "الإعدادات" جوه لوحة المدرّس.
