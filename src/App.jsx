import React, { useState, useEffect, useCallback, useMemo } from "react";
import { BookOpen, Users, ClipboardList, Plus, Trash2, CheckCircle2, Circle, Lock, ArrowRight, ExternalLink, Settings, UploadCloud, FileText, Video, X, User, Copy, Check } from "lucide-react";
import { subscribeToState, saveField, uploadLessonFile } from "./firebase";

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Aref+Ruqaa:wght@400;700&family=Cairo:wght@400;500;600;700;800&family=Playfair+Display:wght@600;700;800&display=swap');`;

const COLORS = {
  board: "#0B0F14",
  boardDark: "#04060a",
  frame: "#C9A227",
  frameDark: "#8a6f1a",
  chalk: "#F5F0E6",
  chalkDim: "#9AA0A6",
  chalkYellow: "#E8B44B",
  chalkPink: "#E5534B",
  chalkBlue: "#4FD1C5",
};

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
function fmtDate(iso, lang) {
  if (!iso) return "—";
  const d = new Date(iso);
  const locale = lang === "ar" ? "ar-EG" : lang === "fr" ? "fr-FR" : "en-US";
  return d.toLocaleDateString(locale, { day: "numeric", month: "short" }) + " - " + d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
}
function genPassword() {
  const chars = "abcdefghjkmnpqrstuvwxyz23456789";
  let out = "";
  for (let i = 0; i < 6; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

/* ---------- translations ---------- */

const BRAND = "Hamdi Baccar";

const T = {
  ar: {
    brand: BRAND,
    teacherLink: "المدرّس",
    studentSubtitle: "ادخل باسم المستخدم وكلمة السر اللي المدرّس ديهملك",
    username: "اسم المستخدم",
    password: "كلمة السر",
    wrongLogin: "اسم المستخدم أو كلمة السر غلط",
    login: "دخول",
    back: "رجوع",
    logout: "خروج",
    teacherLogin: "دخول المدرّس",
    defaultPasswordNote: (p) => `كلمة السر الافتراضية: ${p}`,
    wrongPassword: "كلمة السر مش صح",
    teacherDashboard: "لوحة المدرّس",
    tabStudents: "الطلاب",
    tabLessons: "الدروس",
    tabProgress: "متابعة المذاكرة",
    tabSettings: "الإعدادات",
    changePassword: "غيّر كلمة سر المدرّس",
    save: "حفظ",
    saved: "اتحفظت",
    studentName: "اسم الطالب",
    studentNamePh: "مثال: أحمد محمد",
    chooseUsername: "اسم المستخدم",
    usernamePh: "مثال: ahmed123",
    generatePass: "توليد كلمة سر",
    add: "إضافة",
    noStudents: "لسه مفيش طلاب. ضيف أول طالب من الفورم فوق.",
    copyCreds: "انسخ بيانات الدخول",
    copied: "اتنسخت!",
    lessonTitle: "عنوان الدرس",
    lessonTitlePh: "مثال: الوحدة الأولى - المعادلات",
    category: "القسم / الوحدة",
    categoryPh: "مثال: الفصل الأول",
    lessonUrl: "ملف الدرس",
    lessonDesc: "وصف مختصر (اختياري)",
    lessonDescPh: "ملخص بسيط عن الدرس",
    addLesson: "إضافة الدرس",
    noLessons: "لسه مفيش دروس مضافة.",
    noCategory: "بدون قسم",
    uploadFile: "ارفع فيديو أو PDF",
    uploading: (pct) => `بيترفع... ${pct}%`,
    uploadError: "حصل خطأ في الرفع، جرب تاني",
    orLink: "أو حط رابط بدل الرفع (يوتيوب، درايف، إلخ)",
    openPdf: "افتح الـ PDF",
    fileReady: (name) => `اترفع: ${name}`,
    visibleToAll: "متاح لكل الطلاب",
    visibleToSome: (n) => `متاح لـ ${n} طالب محدد`,
    whoCanSee: "مين يقدر يشوف الدرس ده؟",
    allStudentsOpt: "كل الطلاب",
    noStudentsToPick: "ضيف طلاب الأول عشان تقدر تحدد مين يشوف الدرس.",
    studyingWell: "بيذاكر كويس",
    needsFollowup: "محتاج متابعة",
    notStudied: "لسه ماذاكرش",
    ofLessons: (done, total, pct) => `${done} من ${total} درس (${pct}%)`,
    lastStudy: (date) => `آخر مذاكرة: ${date}`,
    addStudentsFirst: "ضيف طلاب الأول عشان تقدر تتابع مذاكرتهم.",
    welcome: (name) => `أهلاً يا ${name}`,
    completed: (done, total) => `${done} من ${total} خلّصتهم`,
    noLessonsYet: "لسه المدرّس ما ضافش دروس.",
    openLesson: "افتح الدرس",
    studiedOn: (date) => `ذاكرته يوم ${date}`,
    loading: "...بيتحمّل",
  },
  en: {
    brand: BRAND,
    teacherLink: "Teacher",
    studentSubtitle: "Enter the username and password your teacher gave you",
    username: "Username",
    password: "Password",
    wrongLogin: "Wrong username or password",
    login: "Log in",
    back: "Back",
    logout: "Log out",
    teacherLogin: "Teacher Login",
    defaultPasswordNote: (p) => `Default password: ${p}`,
    wrongPassword: "Wrong password",
    teacherDashboard: "Teacher Dashboard",
    tabStudents: "Students",
    tabLessons: "Lessons",
    tabProgress: "Progress",
    tabSettings: "Settings",
    changePassword: "Change teacher password",
    save: "Save",
    saved: "Saved",
    studentName: "Student name",
    studentNamePh: "e.g. Ahmed Mohamed",
    chooseUsername: "Username",
    usernamePh: "e.g. ahmed123",
    generatePass: "Generate password",
    add: "Add",
    noStudents: "No students yet. Add the first one using the form above.",
    copyCreds: "Copy login details",
    copied: "Copied!",
    lessonTitle: "Lesson title",
    lessonTitlePh: "e.g. Unit 1 - Equations",
    category: "Category / Unit",
    categoryPh: "e.g. Chapter 1",
    lessonUrl: "Lesson file",
    lessonDesc: "Short description (optional)",
    lessonDescPh: "A brief summary of the lesson",
    addLesson: "Add lesson",
    noLessons: "No lessons added yet.",
    noCategory: "Uncategorized",
    uploadFile: "Upload video or PDF",
    uploading: (pct) => `Uploading... ${pct}%`,
    uploadError: "Upload failed, try again",
    orLink: "Or paste a link instead (YouTube, Drive, etc.)",
    openPdf: "Open PDF",
    fileReady: (name) => `Uploaded: ${name}`,
    visibleToAll: "Visible to all students",
    visibleToSome: (n) => `Visible to ${n} selected student(s)`,
    whoCanSee: "Who can see this lesson?",
    allStudentsOpt: "All students",
    noStudentsToPick: "Add students first so you can choose who sees this lesson.",
    studyingWell: "Studying well",
    needsFollowup: "Needs follow-up",
    notStudied: "Hasn't started",
    ofLessons: (done, total, pct) => `${done} of ${total} lessons (${pct}%)`,
    lastStudy: (date) => `Last studied: ${date}`,
    addStudentsFirst: "Add students first so you can track their progress.",
    welcome: (name) => `Welcome, ${name}`,
    completed: (done, total) => `${done} of ${total} completed`,
    noLessonsYet: "Your teacher hasn't added lessons yet.",
    openLesson: "Open lesson",
    studiedOn: (date) => `Studied on ${date}`,
    loading: "Loading...",
  },
  fr: {
    brand: BRAND,
    teacherLink: "Professeur",
    studentSubtitle: "Entrez le nom d'utilisateur et le mot de passe donnés par votre professeur",
    username: "Nom d'utilisateur",
    password: "Mot de passe",
    wrongLogin: "Nom d'utilisateur ou mot de passe incorrect",
    login: "Connexion",
    back: "Retour",
    logout: "Déconnexion",
    teacherLogin: "Connexion Professeur",
    defaultPasswordNote: (p) => `Mot de passe par défaut : ${p}`,
    wrongPassword: "Mot de passe incorrect",
    teacherDashboard: "Tableau de bord",
    tabStudents: "Élèves",
    tabLessons: "Cours",
    tabProgress: "Suivi",
    tabSettings: "Paramètres",
    changePassword: "Changer le mot de passe",
    save: "Enregistrer",
    saved: "Enregistré",
    studentName: "Nom de l'élève",
    studentNamePh: "ex : Ahmed Mohamed",
    chooseUsername: "Nom d'utilisateur",
    usernamePh: "ex : ahmed123",
    generatePass: "Générer un mot de passe",
    add: "Ajouter",
    noStudents: "Aucun élève pour l'instant. Ajoutez-en un ci-dessus.",
    copyCreds: "Copier les identifiants",
    copied: "Copié !",
    lessonTitle: "Titre du cours",
    lessonTitlePh: "ex : Unité 1 - Équations",
    category: "Catégorie / Unité",
    categoryPh: "ex : Chapitre 1",
    lessonUrl: "Fichier du cours",
    lessonDesc: "Description courte (optionnel)",
    lessonDescPh: "Résumé bref du cours",
    addLesson: "Ajouter le cours",
    noLessons: "Aucun cours ajouté pour l'instant.",
    noCategory: "Sans catégorie",
    uploadFile: "Importer une vidéo ou un PDF",
    uploading: (pct) => `Envoi... ${pct}%`,
    uploadError: "Échec de l'envoi, réessayez",
    orLink: "Ou collez un lien à la place (YouTube, Drive, etc.)",
    openPdf: "Ouvrir le PDF",
    fileReady: (name) => `Importé : ${name}`,
    visibleToAll: "Visible par tous les élèves",
    visibleToSome: (n) => `Visible par ${n} élève(s) sélectionné(s)`,
    whoCanSee: "Qui peut voir ce cours ?",
    allStudentsOpt: "Tous les élèves",
    noStudentsToPick: "Ajoutez des élèves d'abord pour choisir qui voit ce cours.",
    studyingWell: "Étudie bien",
    needsFollowup: "À suivre",
    notStudied: "Pas encore commencé",
    ofLessons: (done, total, pct) => `${done} sur ${total} cours (${pct}%)`,
    lastStudy: (date) => `Dernière étude : ${date}`,
    addStudentsFirst: "Ajoutez des élèves d'abord pour suivre leur progression.",
    welcome: (name) => `Bienvenue, ${name}`,
    completed: (done, total) => `${done} sur ${total} terminés`,
    noLessonsYet: "Votre professeur n'a pas encore ajouté de cours.",
    openLesson: "Ouvrir le cours",
    studiedOn: (date) => `Étudié le ${date}`,
    loading: "Chargement...",
  },
};

/* ---------- shared visual primitives (cinematic theme) ---------- */

function ChalkButton({ children, onClick, variant = "solid", color = COLORS.chalk, style = {}, type = "button", disabled }) {
  const [hover, setHover] = useState(false);
  const base = {
    fontFamily: "Cairo, sans-serif",
    fontWeight: 700,
    fontSize: 15,
    padding: "12px 22px",
    borderRadius: 10,
    cursor: disabled ? "not-allowed" : "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    transition: "transform 0.15s ease, background 0.15s ease, box-shadow 0.15s ease",
    border: `1.5px solid ${color}`,
    background: variant === "solid" ? (hover ? color : "transparent") : hover ? `${color}22` : "transparent",
    color: variant === "solid" ? (hover ? "#0B0F14" : color) : color,
    opacity: disabled ? 0.5 : 1,
    transform: hover && !disabled ? "translateY(-2px)" : "translateY(0)",
    boxShadow: hover && !disabled ? `0 0 18px ${color}66` : "none",
    ...style,
  };
  return (
    <button type={type} disabled={disabled} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} onClick={onClick} style={base}>
      {children}
    </button>
  );
}

function ChalkInput({ label, icon, dir, ...props }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6, fontFamily: "Cairo, sans-serif" }}>
      {label && <span style={{ color: COLORS.chalkDim, fontSize: 13, fontWeight: 600 }}>{label}</span>}
      <div style={{ display: "flex", alignItems: "center", gap: 8, border: `1px solid rgba(201,162,39,0.35)`, borderRadius: 8, padding: "10px 12px", background: "rgba(255,255,255,0.03)" }}>
        {icon}
        <input {...props} dir={dir} style={{ background: "transparent", border: "none", outline: "none", color: COLORS.chalk, fontFamily: "Cairo, sans-serif", fontSize: 15, width: "100%" }} />
      </div>
    </label>
  );
}

function Board({ lang, children }) {
  const dir = lang === "ar" ? "rtl" : "ltr";
  return (
    <div
      dir={dir}
      style={{
        minHeight: "100vh",
        width: "100%",
        background: `
          radial-gradient(ellipse 900px 500px at 50% -10%, rgba(232,180,75,0.16), transparent 60%),
          radial-gradient(ellipse 1200px 800px at 50% 110%, rgba(79,209,197,0.08), transparent 60%),
          linear-gradient(180deg, ${COLORS.board} 0%, ${COLORS.boardDark} 100%)
        `,
        boxSizing: "border-box",
        padding: "clamp(14px,4vw,28px) clamp(8px,3vw,16px) 50px",
        fontFamily: "Cairo, sans-serif",
        position: "relative",
      }}
    >
      <style>{`${FONT_IMPORT}
        * { box-sizing: border-box; }
        input:focus { outline: none; }
        body { margin: 0; }
      `}</style>
      <div
        style={{
          maxWidth: 880,
          margin: "0 auto",
          border: `1px solid ${COLORS.frame}`,
          borderRadius: 16,
          boxShadow: `0 0 0 1px rgba(0,0,0,0.6), 0 0 40px rgba(201,162,39,0.12), 0 30px 60px rgba(0,0,0,0.6)`,
          padding: "clamp(20px,5vw,32px) clamp(16px,4vw,26px) clamp(26px,5vw,38px)",
          background: `linear-gradient(180deg, rgba(255,255,255,0.03), rgba(0,0,0,0.2))`,
          backdropFilter: "blur(2px)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function LangToggle({ lang, setLang }) {
  const langs = ["en", "ar", "fr"];
  return (
    <div style={{ display: "flex", border: `1px solid rgba(201,162,39,0.4)`, borderRadius: 20, overflow: "hidden" }}>
      {langs.map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          style={{
            background: lang === l ? COLORS.frame : "transparent",
            color: lang === l ? "#0B0F14" : COLORS.chalkDim,
            border: "none",
            padding: "5px 10px",
            fontFamily: "Cairo, sans-serif",
            fontSize: 11.5,
            fontWeight: 800,
            cursor: "pointer",
            letterSpacing: 0.5,
          }}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

function Title({ lang, children, sub }) {
  return (
    <div style={{ textAlign: "center", marginBottom: 26 }}>
      <h1
        style={{
          fontFamily: lang === "ar" ? "'Aref Ruqaa', serif" : "'Playfair Display', serif",
          color: COLORS.chalk,
          fontSize: "clamp(28px, 8vw, 44px)",
          margin: 0,
          fontWeight: 800,
          letterSpacing: lang === "ar" ? 0 : 1,
          textShadow: `0 0 24px rgba(232,180,75,0.35), 0 0 60px rgba(232,180,75,0.15)`,
        }}
      >
        {children}
      </h1>
      {sub && <p style={{ color: COLORS.chalkDim, marginTop: 10, fontSize: 15 }}>{sub}</p>}
    </div>
  );
}

function TopBar({ back, label, lang, setLang }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
      {back ? (
        <button onClick={back} style={{ background: "none", border: "none", color: COLORS.chalkDim, display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontFamily: "Cairo, sans-serif", fontSize: 14 }}>
          <ArrowRight size={16} style={{ transform: lang === "en" || lang === "fr" ? "scaleX(-1)" : "none" }} /> {label}
        </button>
      ) : (
        <span />
      )}
      <LangToggle lang={lang} setLang={setLang} />
    </div>
  );
}

const rowStyle = { display: "flex", justifyContent: "space-between", alignItems: "center", border: `1px solid rgba(201,162,39,0.25)`, borderRadius: 10, padding: "12px 14px", background: "rgba(255,255,255,0.02)" };
const iconBtnStyle = { background: "none", border: "none", cursor: "pointer", padding: 6 };

function EmptyNote({ text }) {
  return <div style={{ textAlign: "center", color: COLORS.chalkDim, padding: "30px 10px", border: `1px dashed rgba(201,162,39,0.3)`, borderRadius: 10, fontSize: 14 }}>{text}</div>;
}

/* ---------- admin ---------- */

function AdminLogin({ back, onSuccess, adminPass, lang, setLang }) {
  const t = T[lang];
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const submit = (e) => {
    e.preventDefault();
    if (pass === adminPass) onSuccess();
    else setErr(t.wrongPassword);
  };
  return (
    <Board lang={lang}>
      <TopBar back={back} label={t.back} lang={lang} setLang={setLang} />
      <Title lang={lang} sub={t.defaultPasswordNote(adminPass)}>
        {t.teacherLogin}
      </Title>
      <form onSubmit={submit} style={{ maxWidth: 320, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>
        <ChalkInput label={t.password} icon={<Lock size={16} color={COLORS.chalkDim} />} type="password" value={pass} onChange={(e) => setPass(e.target.value)} autoFocus />
        {err && <div style={{ color: COLORS.chalkPink, fontSize: 13 }}>{err}</div>}
        <ChalkButton type="submit" color={COLORS.chalkYellow} style={{ justifyContent: "center" }}>
          {t.login}
        </ChalkButton>
      </form>
    </Board>
  );
}

function AdminDashboard({ back, students, setStudents, lessons, setLessons, progress, adminPass, setAdminPass, lang, setLang }) {
  const t = T[lang];
  const [tab, setTab] = useState("students");
  const tabs = [
    { id: "students", label: t.tabStudents, icon: <Users size={16} /> },
    { id: "lessons", label: t.tabLessons, icon: <BookOpen size={16} /> },
    { id: "progress", label: t.tabProgress, icon: <ClipboardList size={16} /> },
    { id: "settings", label: t.tabSettings, icon: <Settings size={16} /> },
  ];
  return (
    <Board lang={lang}>
      <TopBar back={back} label={t.logout} lang={lang} setLang={setLang} />
      <Title lang={lang}>{t.teacherDashboard}</Title>
      <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap", marginBottom: 24 }}>
        {tabs.map((tb) => (
          <button
            key={tb.id}
            onClick={() => setTab(tb.id)}
            style={{ background: "none", border: "none", cursor: "pointer", color: tab === tb.id ? COLORS.chalkYellow : COLORS.chalkDim, fontFamily: "Cairo, sans-serif", fontWeight: 700, fontSize: 14.5, padding: "8px 14px", borderBottom: tab === tb.id ? `2px solid ${COLORS.chalkYellow}` : "2px solid transparent", display: "flex", alignItems: "center", gap: 6 }}
          >
            {tb.icon} {tb.label}
          </button>
        ))}
      </div>

      {tab === "students" && <StudentsTab t={t} students={students} setStudents={setStudents} />}
      {tab === "lessons" && <LessonsTab t={t} lessons={lessons} setLessons={setLessons} students={students} />}
      {tab === "progress" && <ProgressTab t={t} lang={lang} students={students} lessons={lessons} progress={progress} />}
      {tab === "settings" && <SettingsTab t={t} adminPass={adminPass} setAdminPass={setAdminPass} />}
    </Board>
  );
}

function SettingsTab({ t, adminPass, setAdminPass }) {
  const [val, setVal] = useState(adminPass);
  const [saved, setSaved] = useState(false);
  return (
    <div style={{ maxWidth: 320, margin: "0 auto" }}>
      <ChalkInput label={t.changePassword} icon={<Lock size={16} color={COLORS.chalkDim} />} value={val} onChange={(e) => { setVal(e.target.value); setSaved(false); }} />
      <div style={{ marginTop: 14 }}>
        <ChalkButton color={COLORS.chalkYellow} onClick={() => { if (val.trim()) { setAdminPass(val.trim()); setSaved(true); } }}>
          {t.save}
        </ChalkButton>
        {saved && <span style={{ color: COLORS.chalkBlue, marginRight: 12, marginLeft: 12, fontSize: 13 }}>{t.saved}</span>}
      </div>
    </div>
  );
}

function StudentsTab({ t, students, setStudents }) {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [copiedId, setCopiedId] = useState(null);

  const add = (e) => {
    e.preventDefault();
    if (!name.trim() || !username.trim() || !password.trim()) return;
    setStudents([...students, { id: uid(), name: name.trim(), username: username.trim().toLowerCase(), password: password.trim(), createdAt: new Date().toISOString() }]);
    setName("");
    setUsername("");
    setPassword("");
  };
  const remove = (id) => setStudents(students.filter((s) => s.id !== id));

  const copyCreds = (s) => {
    const text = `${t.chooseUsername}: ${s.username}\n${t.password}: ${s.password}`;
    navigator.clipboard?.writeText(text).then(() => {
      setCopiedId(s.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  return (
    <div>
      <form onSubmit={add} style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 22, alignItems: "flex-end" }}>
        <div style={{ flex: 1, minWidth: 160 }}>
          <ChalkInput label={t.studentName} icon={<User size={16} color={COLORS.chalkDim} />} value={name} onChange={(e) => setName(e.target.value)} placeholder={t.studentNamePh} />
        </div>
        <div style={{ flex: 1, minWidth: 160 }}>
          <ChalkInput label={t.chooseUsername} value={username} onChange={(e) => setUsername(e.target.value)} placeholder={t.usernamePh} dir="ltr" />
        </div>
        <div style={{ flex: 1, minWidth: 160 }}>
          <ChalkInput label={t.password} icon={<Lock size={16} color={COLORS.chalkDim} />} value={password} onChange={(e) => setPassword(e.target.value)} dir="ltr" />
        </div>
        <ChalkButton type="button" variant="outline" color={COLORS.chalkBlue} onClick={() => setPassword(genPassword())}>
          {t.generatePass}
        </ChalkButton>
        <ChalkButton type="submit" color={COLORS.chalkYellow}>
          <Plus size={16} /> {t.add}
        </ChalkButton>
      </form>

      {students.length === 0 ? (
        <EmptyNote text={t.noStudents} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {students.map((s) => (
            <div key={s.id} style={rowStyle}>
              <div>
                <div style={{ color: COLORS.chalk, fontWeight: 700, fontSize: 15 }}>{s.name}</div>
                <div style={{ color: COLORS.chalkDim, fontSize: 13, direction: "ltr", textAlign: "right" }}>
                  {s.username} · {s.password}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <button onClick={() => copyCreds(s)} style={iconBtnStyle} title={t.copyCreds}>
                  {copiedId === s.id ? <Check size={16} color={COLORS.chalkBlue} /> : <Copy size={16} color={COLORS.chalkDim} />}
                </button>
                <button onClick={() => remove(s.id)} style={iconBtnStyle}>
                  <Trash2 size={16} color={COLORS.chalkPink} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function LessonVisibilityPicker({ t, students, value, onChange }) {
  const [open, setOpen] = useState(false);
  const isAll = !value || value.length === 0;
  const toggleStudent = (id) => {
    const current = value || [];
    const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
    onChange(next.length === 0 ? null : next);
  };
  return (
    <div style={{ border: `1px dashed rgba(201,162,39,0.35)`, borderRadius: 8, padding: 10 }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{ background: "none", border: "none", cursor: "pointer", color: isAll ? COLORS.chalkBlue : COLORS.chalkYellow, fontFamily: "Cairo, sans-serif", fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", gap: 6, width: "100%", justifyContent: "space-between" }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Users size={14} /> {isAll ? t.visibleToAll : t.visibleToSome(value.length)}
        </span>
        <span style={{ fontSize: 11, color: COLORS.chalkDim }}>{t.whoCanSee}</span>
      </button>
      {open && (
        <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: COLORS.chalk, cursor: "pointer" }}>
            <input type="checkbox" checked={isAll} onChange={() => onChange(null)} />
            {t.allStudentsOpt}
          </label>
          {students.length === 0 ? (
            <div style={{ color: COLORS.chalkDim, fontSize: 12.5 }}>{t.noStudentsToPick}</div>
          ) : (
            students.map((s) => (
              <label key={s.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: COLORS.chalk, cursor: "pointer" }}>
                <input type="checkbox" checked={!isAll && (value || []).includes(s.id)} onChange={() => toggleStudent(s.id)} />
                {s.name}
              </label>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function LessonsTab({ t, lessons, setLessons, students }) {
  const [form, setForm] = useState({ title: "", category: "", desc: "", url: "", fileType: "", fileName: "", visibleTo: null });
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadErr, setUploadErr] = useState("");

  const handleFile = async (e) => {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    setUploadErr("");
    setUploading(true);
    setProgress(0);
    try {
      const { url, fileName } = await uploadLessonFile(file, setProgress);
      const fileType = file.type.startsWith("video/") ? "video" : file.type === "application/pdf" ? "pdf" : "file";
      setForm((f) => ({ ...f, url, fileName, fileType }));
    } catch (err) {
      console.error(err);
      setUploadErr(t.uploadError);
    } finally {
      setUploading(false);
    }
  };

  const clearFile = () => setForm((f) => ({ ...f, url: "", fileName: "", fileType: "" }));

  const add = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setLessons([...lessons, { id: uid(), ...form, category: form.category.trim() || t.noCategory, createdAt: new Date().toISOString() }]);
    setForm({ title: "", category: "", desc: "", url: "", fileType: "", fileName: "", visibleTo: null });
    setProgress(0);
  };
  const remove = (id) => setLessons(lessons.filter((l) => l.id !== id));

  const grouped = useMemo(() => {
    const g = {};
    lessons.forEach((l) => { g[l.category] = g[l.category] || []; g[l.category].push(l); });
    return g;
  }, [lessons]);

  return (
    <div>
      <form onSubmit={add} style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24, border: `1px solid rgba(201,162,39,0.3)`, borderRadius: 10, padding: 16 }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <div style={{ flex: 2, minWidth: 180 }}>
            <ChalkInput label={t.lessonTitle} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder={t.lessonTitlePh} />
          </div>
          <div style={{ flex: 1, minWidth: 140 }}>
            <ChalkInput label={t.category} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder={t.categoryPh} />
          </div>
        </div>
        <div>
          <span style={{ color: COLORS.chalkDim, fontSize: 13, fontWeight: 600, fontFamily: "Cairo, sans-serif" }}>{t.lessonUrl}</span>
          <div style={{ marginTop: 6, border: `1px dashed rgba(201,162,39,0.35)`, borderRadius: 8, padding: 12 }}>
            {!form.fileName ? (
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: uploading ? "not-allowed" : "pointer", color: COLORS.chalkYellow, fontFamily: "Cairo, sans-serif", fontWeight: 700, fontSize: 14 }}>
                <UploadCloud size={18} />
                {uploading ? t.uploading(progress) : t.uploadFile}
                <input type="file" accept="video/*,application/pdf" onChange={handleFile} disabled={uploading} style={{ display: "none" }} />
              </label>
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 8, color: COLORS.chalk, fontSize: 13.5 }}>
                  {form.fileType === "video" ? <Video size={16} color={COLORS.chalkBlue} /> : <FileText size={16} color={COLORS.chalkBlue} />}
                  {t.fileReady(form.fileName)}
                </span>
                <button type="button" onClick={clearFile} style={iconBtnStyle}>
                  <X size={16} color={COLORS.chalkPink} />
                </button>
              </div>
            )}
            {uploading && (
              <div style={{ width: "100%", height: 6, borderRadius: 4, background: "rgba(255,255,255,0.08)", overflow: "hidden", marginTop: 10 }}>
                <div style={{ width: `${progress}%`, height: "100%", background: COLORS.chalkYellow, transition: "width 0.2s ease" }} />
              </div>
            )}
            {uploadErr && <div style={{ color: COLORS.chalkPink, fontSize: 12.5, marginTop: 8 }}>{uploadErr}</div>}
            {!form.fileName && (
              <div style={{ marginTop: 10 }}>
                <ChalkInput
                  label={t.orLink}
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value, fileType: "link", fileName: "" })}
                  placeholder="https://..."
                  dir="ltr"
                />
              </div>
            )}
          </div>
        </div>
        <ChalkInput label={t.lessonDesc} value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} placeholder={t.lessonDescPh} />
        <LessonVisibilityPicker t={t} students={students} value={form.visibleTo} onChange={(v) => setForm({ ...form, visibleTo: v })} />
        <div>
          <ChalkButton type="submit" color={COLORS.chalkYellow}>
            <Plus size={16} /> {t.addLesson}
          </ChalkButton>
        </div>
      </form>

      {lessons.length === 0 ? (
        <EmptyNote text={t.noLessons} />
      ) : (
        Object.entries(grouped).map(([cat, items]) => (
          <div key={cat} style={{ marginBottom: 20 }}>
            <div style={{ color: COLORS.chalkBlue, fontWeight: 800, fontSize: 15, marginBottom: 8 }}>{cat}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {items.map((l) => (
                <div key={l.id} style={{ ...rowStyle, flexDirection: "column", alignItems: "stretch", gap: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {l.fileType === "video" && <Video size={16} color={COLORS.chalkBlue} />}
                      {l.fileType === "pdf" && <FileText size={16} color={COLORS.chalkBlue} />}
                      <div>
                        <div style={{ color: COLORS.chalk, fontWeight: 700 }}>{l.title}</div>
                        {l.desc && <div style={{ color: COLORS.chalkDim, fontSize: 13 }}>{l.desc}</div>}
                      </div>
                    </div>
                    <button onClick={() => remove(l.id)} style={iconBtnStyle}>
                      <Trash2 size={16} color={COLORS.chalkPink} />
                    </button>
                  </div>
                  <LessonVisibilityPicker
                    t={t}
                    students={students}
                    value={l.visibleTo}
                    onChange={(v) => setLessons(lessons.map((x) => (x.id === l.id ? { ...x, visibleTo: v } : x)))}
                  />
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function studentStats(studentId, lessons, progress) {
  const total = lessons.length;
  const done = lessons.filter((l) => progress[studentId] && progress[studentId][l.id] && progress[studentId][l.id].watched).length;
  let lastAt = null;
  if (progress[studentId]) {
    Object.values(progress[studentId]).forEach((p) => {
      if (p.watchedAt && (!lastAt || p.watchedAt > lastAt)) lastAt = p.watchedAt;
    });
  }
  return { total, done, pct: total ? Math.round((done / total) * 100) : 0, lastAt };
}

function ProgressTab({ t, lang, students, lessons, progress }) {
  if (students.length === 0) return <EmptyNote text={t.addStudentsFirst} />;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {students.map((s) => {
        const visibleForStudent = lessons.filter((l) => !l.visibleTo || l.visibleTo.length === 0 || l.visibleTo.includes(s.id));
        const stats = studentStats(s.id, visibleForStudent, progress);
        let badgeColor = COLORS.chalkPink;
        let badgeText = t.notStudied;
        if (stats.total > 0) {
          if (stats.pct >= 70) { badgeColor = COLORS.chalkBlue; badgeText = t.studyingWell; }
          else if (stats.pct > 0) { badgeColor = COLORS.chalkYellow; badgeText = t.needsFollowup; }
        }
        return (
          <div key={s.id} style={{ ...rowStyle, flexDirection: "column", alignItems: "stretch", gap: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ color: COLORS.chalk, fontWeight: 800, fontSize: 15 }}>{s.name}</div>
                <div style={{ color: COLORS.chalkDim, fontSize: 12.5, direction: "ltr", textAlign: "right" }}>{s.username}</div>
              </div>
              <span style={{ border: `1px solid ${badgeColor}`, color: badgeColor, borderRadius: 20, padding: "4px 12px", fontSize: 12.5, fontWeight: 700, whiteSpace: "nowrap" }}>{badgeText}</span>
            </div>
            <div style={{ width: "100%", height: 8, borderRadius: 6, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
              <div style={{ width: `${stats.pct}%`, height: "100%", background: badgeColor, transition: "width 0.3s ease" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: COLORS.chalkDim }}>
              <span>{t.ofLessons(stats.done, stats.total, stats.pct)}</span>
              <span>{t.lastStudy(fmtDate(stats.lastAt, lang))}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- student ---------- */

function StudentLogin({ students, onFound, onTeacher, lang, setLang }) {
  const t = T[lang];
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  const submit = (e) => {
    e.preventDefault();
    const match = students.find((s) => s.username.toLowerCase() === username.trim().toLowerCase() && s.password === password);
    if (!match) { setErr(t.wrongLogin); return; }
    setErr("");
    onFound(match);
  };

  return (
    <Board lang={lang}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <button onClick={onTeacher} style={{ background: "none", border: "none", color: COLORS.chalkDim, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: "Cairo, sans-serif", fontSize: 13 }}>
          <Settings size={14} /> {t.teacherLink}
        </button>
        <LangToggle lang={lang} setLang={setLang} />
      </div>
      <Title lang={lang} sub={t.studentSubtitle}>{t.brand}</Title>
      <form onSubmit={submit} style={{ maxWidth: 340, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>
        <ChalkInput label={t.username} icon={<User size={16} color={COLORS.chalkDim} />} value={username} onChange={(e) => setUsername(e.target.value)} dir="ltr" autoFocus />
        <ChalkInput label={t.password} icon={<Lock size={16} color={COLORS.chalkDim} />} type="password" value={password} onChange={(e) => setPassword(e.target.value)} dir="ltr" />
        {err && <div style={{ color: COLORS.chalkPink, fontSize: 13 }}>{err}</div>}
        <ChalkButton type="submit" color={COLORS.chalkYellow} style={{ justifyContent: "center" }}>
          {t.login}
        </ChalkButton>
      </form>
    </Board>
  );
}

function StudentDashboard({ back, student, lessons, progress, setProgress, lang, setLang }) {
  const t = T[lang];
  const visibleLessons = useMemo(
    () => lessons.filter((l) => !l.visibleTo || l.visibleTo.length === 0 || l.visibleTo.includes(student.id)),
    [lessons, student.id]
  );
  const stats = studentStats(student.id, visibleLessons, progress);
  const grouped = useMemo(() => {
    const g = {};
    visibleLessons.forEach((l) => { g[l.category] = g[l.category] || []; g[l.category].push(l); });
    return g;
  }, [visibleLessons]);

  const toggleWatched = (lessonId) => {
    const mine = { ...(progress[student.id] || {}) };
    const isWatched = mine[lessonId] && mine[lessonId].watched;
    mine[lessonId] = isWatched ? { watched: false } : { watched: true, watchedAt: new Date().toISOString() };
    setProgress({ ...progress, [student.id]: mine });
  };

  return (
    <Board lang={lang}>
      <TopBar back={back} label={t.logout} lang={lang} setLang={setLang} />
      <Title lang={lang} sub={t.welcome(student.name)}>{t.brand}</Title>

      <div style={{ maxWidth: 500, margin: "0 auto 26px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: COLORS.chalkDim, marginBottom: 6 }}>
          <span>{t.completed(stats.done, stats.total)}</span>
          <span>{stats.pct}%</span>
        </div>
        <div style={{ width: "100%", height: 8, borderRadius: 6, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
          <div style={{ width: `${stats.pct}%`, height: "100%", background: COLORS.chalkYellow, transition: "width 0.3s ease" }} />
        </div>
      </div>

      {visibleLessons.length === 0 ? (
        <EmptyNote text={t.noLessonsYet} />
      ) : (
        Object.entries(grouped).map(([cat, items]) => (
          <div key={cat} style={{ marginBottom: 22 }}>
            <div style={{ color: COLORS.chalkBlue, fontWeight: 800, fontSize: 15, marginBottom: 8 }}>{cat}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {items.map((l) => {
                const watched = progress[student.id] && progress[student.id][l.id] && progress[student.id][l.id].watched;
                return (
                  <div key={l.id} style={{ ...rowStyle, flexWrap: "wrap", gap: 10, flexDirection: "column", alignItems: "stretch" }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, flex: 1, minWidth: 200 }}>
                        <button onClick={() => toggleWatched(l.id)} style={iconBtnStyle}>
                          {watched ? <CheckCircle2 size={20} color={COLORS.chalkBlue} /> : <Circle size={20} color={COLORS.chalkDim} />}
                        </button>
                        <div>
                          <div style={{ color: COLORS.chalk, fontWeight: 700, textDecoration: watched ? "line-through" : "none", opacity: watched ? 0.7 : 1 }}>{l.title}</div>
                          {l.desc && <div style={{ color: COLORS.chalkDim, fontSize: 13 }}>{l.desc}</div>}
                          {watched && progress[student.id][l.id].watchedAt && (
                            <div style={{ color: COLORS.chalkDim, fontSize: 11.5, marginTop: 2 }}>{t.studiedOn(fmtDate(progress[student.id][l.id].watchedAt, lang))}</div>
                          )}
                        </div>
                      </div>
                      {l.url && l.fileType === "pdf" && (
                        <a href={l.url} target="_blank" rel="noreferrer" style={{ color: COLORS.chalkYellow, display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
                          {t.openPdf} <ExternalLink size={14} />
                        </a>
                      )}
                      {l.url && (!l.fileType || l.fileType === "link") && (
                        <a href={l.url} target="_blank" rel="noreferrer" style={{ color: COLORS.chalkYellow, display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
                          {t.openLesson} <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                    {l.url && l.fileType === "video" && (
                      <video controls preload="metadata" style={{ width: "100%", maxWidth: 480, borderRadius: 8, marginRight: 34 }}>
                        <source src={l.url} />
                      </video>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </Board>
  );
}

/* ---------- root ---------- */

export default function App() {
  const [screen, setScreen] = useState("studentLogin");
  const [loaded, setLoaded] = useState(false);
  const [connError, setConnError] = useState(false);
  const [lang, setLang] = useState("en");
  const [students, setStudentsState] = useState([]);
  const [lessons, setLessonsState] = useState([]);
  const [progress, setProgressState] = useState({});
  const [adminPass, setAdminPassState] = useState("2580");
  const [currentStudent, setCurrentStudent] = useState(null);

  useEffect(() => {
    const unsub = subscribeToState((data) => {
      setStudentsState(data.students || []);
      setLessonsState(data.lessons || []);
      setProgressState(data.progress || {});
      setAdminPassState(data.adminPass || "2580");
      setLoaded(true);
      setConnError(false);
    });
    const timeout = setTimeout(() => {
      if (!loaded) setConnError(true);
    }, 8000);
    return () => {
      unsub();
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setStudents = useCallback((v) => { setStudentsState(v); saveField("students", v); }, []);
  const setLessons = useCallback((v) => { setLessonsState(v); saveField("lessons", v); }, []);
  const setProgress = useCallback((v) => { setProgressState(v); saveField("progress", v); }, []);
  const setAdminPass = useCallback((v) => { setAdminPassState(v); saveField("adminPass", v); }, []);

  if (!loaded) {
    return (
      <Board lang={lang}>
        <Title lang={lang}>{T[lang].brand}</Title>
        <div style={{ textAlign: "center", color: connError ? COLORS.chalkPink : COLORS.chalkDim, fontSize: 14, lineHeight: 1.8 }}>
          {connError ? "Connection problem — check firebaseConfig.js" : T[lang].loading}
        </div>
      </Board>
    );
  }

  if (screen === "studentLogin")
    return (
      <StudentLogin
        students={students}
        lang={lang}
        setLang={setLang}
        onTeacher={() => setScreen("adminLogin")}
        onFound={(s) => { setCurrentStudent(s); setScreen("studentDashboard"); }}
      />
    );

  if (screen === "adminLogin")
    return <AdminLogin back={() => setScreen("studentLogin")} onSuccess={() => setScreen("adminDashboard")} adminPass={adminPass} lang={lang} setLang={setLang} />;

  if (screen === "adminDashboard")
    return (
      <AdminDashboard
        back={() => setScreen("studentLogin")}
        students={students}
        setStudents={setStudents}
        lessons={lessons}
        setLessons={setLessons}
        progress={progress}
        adminPass={adminPass}
        setAdminPass={setAdminPass}
        lang={lang}
        setLang={setLang}
      />
    );

  if (screen === "studentDashboard")
    return (
      <StudentDashboard
        back={() => { setCurrentStudent(null); setScreen("studentLogin"); }}
        student={currentStudent}
        lessons={lessons}
        progress={progress}
        setProgress={setProgress}
        lang={lang}
        setLang={setLang}
      />
    );

  return null;
}
