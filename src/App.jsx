import React, { useState, useEffect, useCallback, useMemo } from "react";
import { BookOpen, Users, ClipboardList, Plus, Trash2, CheckCircle2, Circle, Phone, User, Lock, ArrowRight, ExternalLink, Settings, Languages, UploadCloud, FileText, Video, X } from "lucide-react";
import { subscribeToState, saveField, uploadLessonFile, sendOtpEmail, verifyOtpCode } from "./firebase";

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Aref+Ruqaa:wght@400;700&family=Cairo:wght@400;500;600;700;800&display=swap');`;

const COLORS = {
  board: "#1E362F",
  boardDark: "#152720",
  frame: "#7A4B29",
  frameDark: "#5C3A20",
  chalk: "#F4F1E4",
  chalkDim: "#C9C4B2",
  chalkYellow: "#E8C36B",
  chalkPink: "#D98A82",
  chalkBlue: "#8FB8B0",
};

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
function genOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}
function normPhone(p) {
  return (p || "").replace(/[^0-9]/g, "");
}
function fmtDate(iso, lang) {
  if (!iso) return "—";
  const d = new Date(iso);
  const locale = lang === "ar" ? "ar-EG" : "en-US";
  return d.toLocaleDateString(locale, { day: "numeric", month: "short" }) + " - " + d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
}

/* ---------- translations ---------- */

const T = {
  ar: {
    brand: "دروسي",
    teacherLink: "المدرّس",
    studentSubtitle: "ادخل باسمك ورقم تليفونك اللي المدرّس سجّلهم ليك",
    yourName: "اسمك",
    yourPhone: "رقم تليفونك",
    yourEmail: "بريدك الإلكتروني",
    yourEmailPh: "example@gmail.com",
    emailRequired: "اكتب إيميلك عشان نبعتلك عليه الكود",
    notRegistered: "الاسم أو الرقم مش متسجل. كلم المدرّس يضيفك الأول.",
    sendCode: "إرسال كود التأكيد",
    back: "رجوع",
    logout: "خروج",
    confirmLogin: "تأكيد الدخول",
    codeSentTo: (name) => `اتبعت كود تأكيد لـ ${name}`,
    demoNote: "وضع تجريبي: الكود ده كان المفروض يتبعت SMS أو إيميل. عشان دلوقتي بيتعرض هنا مباشرة:",
    enterCode: "اكتب الكود",
    wrongCode: "الكود مش صح، جرب تاني",
    login: "دخول",
    teacherLogin: "دخول المدرّس",
    defaultPasswordNote: (p) => `كلمة السر الافتراضية: ${p}`,
    password: "كلمة السر",
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
    phoneNumber: "رقم التليفون",
    add: "إضافة",
    noStudents: "لسه مفيش طلاب. ضيف أول طالب من الفورم فوق.",
    lessonTitle: "عنوان الدرس",
    lessonTitlePh: "مثال: الوحدة الأولى - المعادلات",
    category: "القسم / الوحدة",
    categoryPh: "مثال: الفصل الأول",
    lessonUrl: "رابط الدرس (فيديو أو ملف)",
    lessonDesc: "وصف مختصر (اختياري)",
    lessonDescPh: "ملخص بسيط عن الدرس",
    addLesson: "إضافة الدرس",
    noLessons: "لسه مفيش دروس مضافة.",
    noCategory: "بدون قسم",
    uploadFile: "ارفع فيديو أو PDF",
    uploading: (pct) => `بيترفع... ${pct}%`,
    uploadError: "حصل خطأ في الرفع، جرب تاني",
    removeFile: "إلغاء الملف",
    orLink: "أو حط رابط بدل الرفع (يوتيوب، درايف، إلخ)",
    openPdf: "افتح الـ PDF",
    fileReady: (name) => `اترفع: ${name}`,
    visibleToAll: "متاح لكل الطلاب",
    visibleToSome: (n) => `متاح لـ ${n} طالب محدد`,
    whoCanSee: "مين يقدر يشوف الدرس ده؟",
    allStudentsOpt: "كل الطلاب",
    specificStudentsOpt: "طلاب محددين",
    noStudentsToPick: "ضيف طلاب الأول عشان تقدر تحدد مين يشوف الدرس.",
    studentEmail: "إيميل الطالب",
    studentEmailPh: "example@gmail.com",
    noEmailOnFile: "الطالب ده لسه معندوش إيميل مسجّل. كلم المدرّس يضيفه.",
    sendingCode: "بيتبعت الكود...",
    otpSendError: "حصلت مشكلة في إرسال الكود، جرب تاني.",
    codeSentEmail: (email) => `اتبعت كود على ${email}`,
    resendCode: "ابعت الكود تاني",
    verifying: "بيتأكد...",
    wrongOrExpired: "الكود غلط أو خلصت صلاحيته، جرب تاني",
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
    connectionError: "في مشكلة في الاتصال بقاعدة البيانات. تأكد إنك حطيت بيانات Firebase صح في firebaseConfig.js",
  },
  en: {
    brand: "My Lessons",
    teacherLink: "Teacher",
    studentSubtitle: "Enter the name and phone number your teacher registered for you",
    yourName: "Your name",
    yourPhone: "Your phone number",
    yourEmail: "Your email",
    yourEmailPh: "example@gmail.com",
    emailRequired: "Enter your email so we can send you the code",
    notRegistered: "Name or phone not registered. Ask your teacher to add you first.",
    sendCode: "Send verification code",
    back: "Back",
    logout: "Log out",
    confirmLogin: "Confirm Login",
    codeSentTo: (name) => `A verification code was sent for ${name}`,
    demoNote: "Demo mode: this code would normally be sent by SMS or email. For now it's shown here directly:",
    enterCode: "Enter the code",
    wrongCode: "Wrong code, try again",
    login: "Log in",
    teacherLogin: "Teacher Login",
    defaultPasswordNote: (p) => `Default password: ${p}`,
    password: "Password",
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
    phoneNumber: "Phone number",
    add: "Add",
    noStudents: "No students yet. Add the first one using the form above.",
    lessonTitle: "Lesson title",
    lessonTitlePh: "e.g. Unit 1 - Equations",
    category: "Category / Unit",
    categoryPh: "e.g. Chapter 1",
    lessonUrl: "Lesson link (video or file)",
    lessonDesc: "Short description (optional)",
    lessonDescPh: "A brief summary of the lesson",
    addLesson: "Add lesson",
    noLessons: "No lessons added yet.",
    noCategory: "Uncategorized",
    uploadFile: "Upload video or PDF",
    uploading: (pct) => `Uploading... ${pct}%`,
    uploadError: "Upload failed, try again",
    removeFile: "Remove file",
    orLink: "Or paste a link instead (YouTube, Drive, etc.)",
    openPdf: "Open PDF",
    fileReady: (name) => `Uploaded: ${name}`,
    visibleToAll: "Visible to all students",
    visibleToSome: (n) => `Visible to ${n} selected student(s)`,
    whoCanSee: "Who can see this lesson?",
    allStudentsOpt: "All students",
    specificStudentsOpt: "Specific students",
    noStudentsToPick: "Add students first so you can choose who sees this lesson.",
    studentEmail: "Student email",
    studentEmailPh: "example@gmail.com",
    noEmailOnFile: "This student doesn't have an email on file yet. Ask the teacher to add one.",
    sendingCode: "Sending code...",
    otpSendError: "There was a problem sending the code, please try again.",
    codeSentEmail: (email) => `A code was sent to ${email}`,
    resendCode: "Resend code",
    verifying: "Verifying...",
    wrongOrExpired: "Wrong or expired code, please try again",
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
    connectionError: "There's a problem connecting to the database. Make sure firebaseConfig.js has your correct Firebase project keys.",
  },
};

/* ---------- shared visual primitives ---------- */

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
    transition: "transform 0.15s ease, background 0.15s ease",
    border: `2px dashed ${color}`,
    background: variant === "solid" ? (hover ? color : "transparent") : hover ? `${color}22` : "transparent",
    color: variant === "solid" ? (hover ? COLORS.boardDark : color) : color,
    opacity: disabled ? 0.5 : 1,
    transform: hover && !disabled ? "translateY(-2px)" : "translateY(0)",
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
      <div style={{ display: "flex", alignItems: "center", gap: 8, border: `1.5px dashed ${COLORS.chalkDim}`, borderRadius: 8, padding: "10px 12px", background: "rgba(244,241,228,0.04)" }}>
        {icon}
        <input {...props} dir={dir} style={{ background: "transparent", border: "none", outline: "none", color: COLORS.chalk, fontFamily: "Cairo, sans-serif", fontSize: 15, width: "100%" }} />
      </div>
    </label>
  );
}

function Board({ lang, children }) {
  const dir = lang === "ar" ? "rtl" : "ltr";
  return (
    <div dir={dir} style={{ minHeight: "100vh", width: "100%", background: `radial-gradient(circle at 30% 0%, ${COLORS.board} 0%, ${COLORS.boardDark} 70%)`, boxSizing: "border-box", padding: "clamp(14px,4vw,28px) clamp(8px,3vw,16px) 50px", fontFamily: "Cairo, sans-serif" }}>
      <style>{`${FONT_IMPORT}
        * { box-sizing: border-box; }
        input:focus { outline: none; }
      `}</style>
      <div style={{ maxWidth: 880, margin: "0 auto", border: `6px solid ${COLORS.frame}`, borderRadius: 14, boxShadow: `0 0 0 3px ${COLORS.frameDark}, 0 20px 50px rgba(0,0,0,0.4)`, padding: "clamp(18px,5vw,28px) clamp(14px,4vw,24px) clamp(24px,5vw,36px)", background: `linear-gradient(180deg, rgba(255,255,255,0.02), transparent)` }}>
        {children}
      </div>
    </div>
  );
}

function LangToggle({ lang, setLang }) {
  return (
    <button
      onClick={() => setLang(lang === "ar" ? "en" : "ar")}
      style={{ background: "none", border: `1.5px dashed ${COLORS.chalkDim}`, borderRadius: 20, color: COLORS.chalkDim, fontFamily: "Cairo, sans-serif", fontSize: 12.5, fontWeight: 700, padding: "6px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
    >
      <Languages size={14} /> {lang === "ar" ? "EN" : "AR"}
    </button>
  );
}

function Title({ lang, children, sub }) {
  return (
    <div style={{ textAlign: "center", marginBottom: 26 }}>
      <h1 style={{ fontFamily: lang === "ar" ? "'Aref Ruqaa', serif" : "Cairo, sans-serif", color: COLORS.chalk, fontSize: "clamp(28px, 8vw, 42px)", margin: 0, fontWeight: 700, textShadow: "0 0 12px rgba(244,241,228,0.15)" }}>
        {children}
      </h1>
      {sub && <p style={{ color: COLORS.chalkDim, marginTop: 8, fontSize: 15 }}>{sub}</p>}
    </div>
  );
}

function TopBar({ back, label, lang, setLang }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
      {back ? (
        <button onClick={back} style={{ background: "none", border: "none", color: COLORS.chalkDim, display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontFamily: "Cairo, sans-serif", fontSize: 14 }}>
          <ArrowRight size={16} style={{ transform: lang === "en" ? "scaleX(-1)" : "none" }} /> {label}
        </button>
      ) : (
        <span />
      )}
      <LangToggle lang={lang} setLang={setLang} />
    </div>
  );
}

const rowStyle = { display: "flex", justifyContent: "space-between", alignItems: "center", border: `1.5px dashed rgba(244,241,228,0.25)`, borderRadius: 10, padding: "12px 14px" };
const iconBtnStyle = { background: "none", border: "none", cursor: "pointer", padding: 6 };

function EmptyNote({ text }) {
  return <div style={{ textAlign: "center", color: COLORS.chalkDim, padding: "30px 10px", border: `1.5px dashed ${COLORS.chalkDim}`, borderRadius: 10, fontSize: 14 }}>{text}</div>;
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
            style={{ background: "none", border: "none", cursor: "pointer", color: tab === tb.id ? COLORS.chalkYellow : COLORS.chalkDim, fontFamily: "Cairo, sans-serif", fontWeight: 700, fontSize: 14.5, padding: "8px 14px", borderBottom: tab === tb.id ? `2px dashed ${COLORS.chalkYellow}` : "2px dashed transparent", display: "flex", alignItems: "center", gap: 6 }}
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
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const add = (e) => {
    e.preventDefault();
    if (!name.trim() || !normPhone(phone)) return;
    setStudents([...students, { id: uid(), name: name.trim(), phone: normPhone(phone), email: email.trim(), createdAt: new Date().toISOString() }]);
    setName("");
    setPhone("");
    setEmail("");
  };
  const remove = (id) => setStudents(students.filter((s) => s.id !== id));
  return (
    <div>
      <form onSubmit={add} style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 22, alignItems: "flex-end" }}>
        <div style={{ flex: 1, minWidth: 160 }}>
          <ChalkInput label={t.studentName} icon={<User size={16} color={COLORS.chalkDim} />} value={name} onChange={(e) => setName(e.target.value)} placeholder={t.studentNamePh} />
        </div>
        <div style={{ flex: 1, minWidth: 160 }}>
          <ChalkInput label={t.phoneNumber} icon={<Phone size={16} color={COLORS.chalkDim} />} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01xxxxxxxxx" dir="ltr" />
        </div>
        <div style={{ flex: 1, minWidth: 180 }}>
          <ChalkInput label={t.studentEmail} icon={<User size={16} color={COLORS.chalkDim} />} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t.studentEmailPh} dir="ltr" />
        </div>
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
                <div style={{ color: COLORS.chalkDim, fontSize: 13, direction: "ltr", textAlign: "right" }}>{s.phone}</div>
                {s.email && <div style={{ color: COLORS.chalkDim, fontSize: 12.5, direction: "ltr", textAlign: "right" }}>{s.email}</div>}
              </div>
              <button onClick={() => remove(s.id)} style={iconBtnStyle}>
                <Trash2 size={16} color={COLORS.chalkPink} />
              </button>
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
    <div style={{ border: `1.5px dashed ${COLORS.chalkDim}`, borderRadius: 8, padding: 10 }}>
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
      <form onSubmit={add} style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24, border: `1.5px dashed ${COLORS.chalkDim}`, borderRadius: 10, padding: 16 }}>
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
          <div style={{ marginTop: 6, border: `1.5px dashed ${COLORS.chalkDim}`, borderRadius: 8, padding: 12 }}>
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
              <div style={{ width: "100%", height: 6, borderRadius: 4, background: "rgba(244,241,228,0.1)", overflow: "hidden", marginTop: 10 }}>
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
                <div style={{ color: COLORS.chalkDim, fontSize: 12.5, direction: "ltr", textAlign: "right" }}>{s.phone}</div>
              </div>
              <span style={{ border: `1.5px dashed ${badgeColor}`, color: badgeColor, borderRadius: 20, padding: "4px 12px", fontSize: 12.5, fontWeight: 700, whiteSpace: "nowrap" }}>{badgeText}</span>
            </div>
            <div style={{ width: "100%", height: 8, borderRadius: 6, background: "rgba(244,241,228,0.08)", overflow: "hidden" }}>
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

function StudentLogin({ students, setStudents, onFound, onTeacher, lang, setLang }) {
  const t = T[lang];
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const p = normPhone(phone);
    const match = students.find((s) => normPhone(s.phone) === p && s.name.trim() === name.trim());
    if (!match) { setErr(t.notRegistered); return; }
    if (!email.trim()) { setErr(t.emailRequired); return; }
    setErr("");
    setBusy(true);
    const updated = { ...match, email: email.trim() };
    try {
      await sendOtpEmail(updated.id, updated.email, updated.name);
      if (updated.email !== match.email) {
        setStudents(students.map((s) => (s.id === match.id ? updated : s)));
      }
      onFound(updated);
    } catch (error) {
      console.error(error);
      setErr(t.otpSendError);
    } finally {
      setBusy(false);
    }
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
        <ChalkInput label={t.yourName} icon={<User size={16} color={COLORS.chalkDim} />} value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        <ChalkInput label={t.yourPhone} icon={<Phone size={16} color={COLORS.chalkDim} />} value={phone} onChange={(e) => setPhone(e.target.value)} dir="ltr" />
        <ChalkInput label={t.yourEmail} icon={<User size={16} color={COLORS.chalkDim} />} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t.yourEmailPh} dir="ltr" />
        {err && <div style={{ color: COLORS.chalkPink, fontSize: 13 }}>{err}</div>}
        <ChalkButton type="submit" color={COLORS.chalkYellow} style={{ justifyContent: "center" }} disabled={busy}>
          {busy ? t.sendingCode : t.sendCode}
        </ChalkButton>
      </form>
    </Board>
  );
}

function StudentOtp({ back, student, onVerified, lang, setLang }) {
  const t = T[lang];
  const [entered, setEntered] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      const { valid } = await verifyOtpCode(student.id, entered.trim());
      if (valid) onVerified();
      else setErr(t.wrongOrExpired);
    } catch (error) {
      console.error(error);
      setErr(t.otpSendError);
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    setResending(true);
    setErr("");
    try {
      await sendOtpEmail(student.id, student.email, student.name);
      setResent(true);
      setTimeout(() => setResent(false), 4000);
    } catch (error) {
      console.error(error);
      setErr(t.otpSendError);
    } finally {
      setResending(false);
    }
  };

  return (
    <Board lang={lang}>
      <TopBar back={back} label={t.back} lang={lang} setLang={setLang} />
      <Title lang={lang} sub={t.codeSentEmail(student.email)}>{t.confirmLogin}</Title>
      <form onSubmit={submit} style={{ maxWidth: 340, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>
        <ChalkInput label={t.enterCode} value={entered} onChange={(e) => setEntered(e.target.value)} dir="ltr" autoFocus maxLength={6} />
        {err && <div style={{ color: COLORS.chalkPink, fontSize: 13 }}>{err}</div>}
        <ChalkButton type="submit" color={COLORS.chalkYellow} style={{ justifyContent: "center" }} disabled={busy}>
          {busy ? t.verifying : t.login}
        </ChalkButton>
        <button type="button" onClick={resend} disabled={resending} style={{ background: "none", border: "none", color: COLORS.chalkDim, fontFamily: "Cairo, sans-serif", fontSize: 13, cursor: resending ? "not-allowed" : "pointer" }}>
          {resent ? t.codeSentEmail(student.email) : resending ? t.sendingCode : t.resendCode}
        </button>
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
        <div style={{ width: "100%", height: 8, borderRadius: 6, background: "rgba(244,241,228,0.08)", overflow: "hidden" }}>
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
  const [lang, setLang] = useState("ar");
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
          {connError ? T[lang].connectionError : T[lang].loading}
        </div>
      </Board>
    );
  }

  if (screen === "studentLogin")
    return (
      <StudentLogin
        students={students}
        setStudents={setStudents}
        lang={lang}
        setLang={setLang}
        onTeacher={() => setScreen("adminLogin")}
        onFound={(s) => { setCurrentStudent(s); setScreen("studentOtp"); }}
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

  if (screen === "studentOtp")
    return <StudentOtp back={() => setScreen("studentLogin")} student={currentStudent} onVerified={() => setScreen("studentDashboard")} lang={lang} setLang={setLang} />;

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
