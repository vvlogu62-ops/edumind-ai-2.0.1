import React, { useState, useEffect, useRef } from 'react';
import { API } from './api';
import {
  Brain,
  Sparkles,
  Send,
  User,
  BookOpen,
  AlertCircle,
  Activity,
  HeartPulse,
  Search,
  Plus,
  Trash2,
  CheckCircle,
  GraduationCap,
  Calendar,
  Lightbulb,
  X,
  ArrowRight,
  Mail,
  LockKeyhole,
  LogIn,
  ShieldCheck
} from 'lucide-react';

export default function App() {
  const originalEmail = 'vvlogu62@gmail.com';
  const [isAuthenticated, setIsAuthenticated] = useState(() => sessionStorage.getItem('edumind-authenticated') === 'true');
  const [email, setEmail] = useState(originalEmail);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [recoveryMessage, setRecoveryMessage] = useState('');
  const [studentsList, setStudentsList] = useState([]);
  const [currentRollNo, setCurrentRollNo] = useState('25ECA001');
  const [student, setStudent] = useState(null);
  const [recommendation, setRecommendation] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('25ECA001');
  
  // Chat state
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Hello! I am your EduMind AI Academic Advisor. Ask me anything about your subjects, weak topics, or study stress!',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [language, setLanguage] = useState('en');
  const chatBottomRef = useRef(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalForm, setModalForm] = useState({
    roll_no: '',
    name: '',
    department: 'ECE',
    overall_mastery: 75,
    stress_level: 'Moderate',
    subjects: 'DSD: 80, Maths: 70',
    weak_topics: 'Sequential Circuits'
  });

  // Toast State
  const [toast, setToast] = useState(null);

  const showNotification = (msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleLogin = (event) => {
    event.preventDefault();
    if (!email.trim() || !password.trim()) {
      setLoginError('Enter your email and password to continue.');
      return;
    }
    if (email.trim().toLowerCase() !== originalEmail) {
      setLoginError(`Use the original account email: ${originalEmail}`);
      return;
    }

    sessionStorage.setItem('edumind-authenticated', 'true');
    setLoginError('');
    setIsAuthenticated(true);
  };

  const handleForgotPassword = (event) => {
    event.preventDefault();
    if (!email.trim()) {
      setRecoveryMessage('Enter your email address to receive recovery instructions.');
      return;
    }

    setRecoveryMessage(`Recovery instructions sent to ${email.trim()}.`);
  };

  // Auto scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Load students list
  const fetchStudents = async () => {
    try {
      const res = await fetch(`${API}/api/students`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.students) {
          setStudentsList(data.students);
        }
      }
    } catch (err) {
      console.error('Failed to load students list:', err);
    }
  };

  // Load single student
  const loadStudent = async (rollNo) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/student/${rollNo}`);
      const data = await res.json();
      if (data.success && data.student) {
        setStudent(data.student);
        setCurrentRollNo(rollNo);
        setSearchInput(rollNo);
        fetchRecommendation(data.student.overall_mastery, language);
        showNotification(`Loaded profile for ${data.student.name}`, 'success');
      } else {
        showNotification(data.message || `Student ${rollNo} not found`, 'error');
      }
    } catch (err) {
      console.error('Failed to load student:', err);
      showNotification('Error connecting to EduMind API', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch AI Recommendation
  const fetchRecommendation = async (mastery, selectedLanguage = language) => {
    try {
      const res = await fetch(`${API}/api/ai/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mastery: mastery || 0, language: selectedLanguage })
      });
      const data = await res.json();
      setRecommendation(data.recommendation || 'Revise key concepts.');
    } catch (err) {
      console.error('Error fetching recommendation:', err);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchStudents();
    loadStudent(currentRollNo);
  }, [isAuthenticated]);

  useEffect(() => {
    if (student) fetchRecommendation(student.overall_mastery, language);
  }, [language]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 flex items-center justify-center shadow-xl shadow-indigo-500/25">
              <Brain className="text-white w-8 h-8" />
            </div>
            <h1 className="brand-font text-3xl font-bold text-slate-900 mt-5">Welcome to EduMind AI</h1>
            <p className="text-slate-500 mt-2">Your intelligent academic advisory workspace</p>
          </div>

          <form onSubmit={showForgotPassword ? handleForgotPassword : handleLogin} className="bg-slate-900 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-slate-900/20 border border-slate-700">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-white font-semibold text-lg">{showForgotPassword ? 'Reset your password' : 'Sign in to continue'}</h2>
                <p className="text-slate-400 text-xs">{showForgotPassword ? 'We will help you get back into your account' : 'Access your student dashboard'}</p>
              </div>
            </div>

            <label className="block text-sm font-medium text-slate-300 mb-2" htmlFor="login-email">Email address</label>
            <div className="relative mb-4">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {!showForgotPassword && <>
              <label className="block text-sm font-medium text-slate-300 mb-2" htmlFor="login-password">Password</label>
              <div className="relative mb-5">
                <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-3 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </>}

            {loginError && <p className="text-rose-300 text-xs mb-4" role="alert">{loginError}</p>}
            {recoveryMessage && <p className="text-emerald-300 text-xs mb-4" role="status">{recoveryMessage}</p>}

            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-3 font-semibold text-sm flex items-center justify-center gap-2 transition">
              {showForgotPassword ? <Mail className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
              {showForgotPassword ? 'Send recovery email' : 'Sign in with email'}
            </button>
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => {
                  setShowForgotPassword((current) => !current);
                  setLoginError('');
                  setRecoveryMessage('');
                }}
                className="text-indigo-300 hover:text-indigo-200 text-xs font-medium transition"
              >
                {showForgotPassword ? 'Back to sign in' : 'Forgot password?'}
              </button>
              {!showForgotPassword && <p className="text-slate-500 text-[11px] mt-3">Sign in with {originalEmail} and your password.</p>}
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Handle Chat Submit
  const handleSendChat = async (queryText) => {
    const query = queryText || chatInput;
    if (!query.trim()) return;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = { id: Date.now(), sender: 'user', text: query, time };
    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setChatInput('');
    setIsTyping(true);

    try {
      const res = await fetch(`${API}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: query, language })
      });
      const data = await res.json();
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: data.answer || 'I am ready to help you learn.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: 'Unable to connect to AI server. Please ensure the backend is running.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  // Handle Add Student
  const handleAddStudent = async (e) => {
    e.preventDefault();
    const subs = modalForm.subjects.split(',').map((p) => {
      const [name, sc] = p.split(':');
      return {
        name: name ? name.trim() : 'Subject',
        mastery: sc ? parseInt(sc.trim(), 10) || 70 : 70
      };
    });
    const weak = modalForm.weak_topics.split(',').map((t) => t.trim()).filter(Boolean);

    const payload = {
      roll_no: modalForm.roll_no.trim().toUpperCase(),
      name: modalForm.name.trim(),
      department: modalForm.department.trim().toUpperCase(),
      overall_mastery: parseInt(modalForm.overall_mastery, 10) || 60,
      stress_level: modalForm.stress_level,
      subjects: subs,
      weak_topics: weak
    };

    try {
      const res = await fetch(`${API}/api/student`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        showNotification(`Student ${payload.name} created!`, 'success');
        fetchStudents();
        loadStudent(payload.roll_no);
      }
    } catch (err) {
      showNotification('Failed to create student', 'error');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-30 glass-panel border-b border-white/10 px-4 lg:px-8 py-3.5 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Logo / Brand */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Brain className="text-white w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="brand-font font-bold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
                    EduMind AI
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
                    React + Vite
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Intelligent Student Academic Advisory</p>
              </div>
            </div>

            <div className="flex md:hidden items-center gap-2 text-xs bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full text-emerald-400">
              <span className="pulse-dot w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>API Live</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
            {/* Student Switcher Pills */}
            <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-white/5 text-xs">
              {studentsList.map((st) => (
                <button
                  key={st.roll_no}
                  onClick={() => loadStudent(st.roll_no)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                    st.roll_no === currentRollNo
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/60'
                  }`}
                >
                  {st.name} ({st.roll_no})
                </button>
              ))}
            </div>

            {/* Roll search */}
            <div className="flex items-center relative">
              <input
                type="text"
                placeholder="Roll No (e.g. 25ECA001)"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && loadStudent(searchInput)}
                className="bg-slate-900/90 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-36 uppercase"
              />
              <button
                onClick={() => loadStudent(searchInput)}
                className="ml-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Load</span>
              </button>
            </div>

            {/* Add Student */}
            <button
              onClick={() => setShowModal(true)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-white/10 text-slate-200 rounded-lg text-xs font-medium transition flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-indigo-400" />
              <span>New</span>
            </button>

            {/* Status indicator */}
            <div className="hidden md:flex items-center gap-2 text-xs bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full text-emerald-400">
              <span className="pulse-dot w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>FastAPI Connected</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-6 w-full flex-1 space-y-6">
        
        {student && (
          <>
            {/* Student Profile Card */}
            <section className="glass-panel rounded-2xl p-5 lg:p-6 relative overflow-hidden">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-indigo-500/25 border border-white/15">
                    {student.name[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="brand-font text-2xl lg:text-3xl font-extrabold text-white">
                        {student.name}
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-semibold text-xs uppercase">
                        {student.department}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-white/10 text-xs font-mono">
                        {currentRollNo}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                      <span className="flex items-center gap-1">
                        <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                        Department of {student.department} Engineering
                      </span>
                      <span className="text-slate-600">•</span>
                      <span className="flex items-center gap-1 text-slate-300">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Current Semester
                      </span>
                    </p>
                  </div>
                </div>

                {/* Score Indicators */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 items-center">
                  {/* Mastery */}
                  <div className="flex items-center gap-3 bg-slate-900/60 p-3 rounded-xl border border-white/5">
                    <div className="relative w-12 h-12 flex items-center justify-center">
                      <svg className="w-12 h-12 transform -rotate-90">
                        <circle className="text-slate-800" strokeWidth="4" stroke="currentColor" fill="transparent" r="20" cx="24" cy="24" />
                        <circle
                          className={student.overall_mastery >= 75 ? 'text-emerald-500' : student.overall_mastery >= 50 ? 'text-indigo-500' : 'text-rose-500'}
                          strokeWidth="4"
                          strokeDasharray="125.6"
                          strokeDashoffset={125.6 - (student.overall_mastery / 100) * 125.6}
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="transparent"
                          r="20"
                          cx="24"
                          cy="24"
                        />
                      </svg>
                      <span className="absolute text-xs font-bold text-white">
                        {student.overall_mastery}%
                      </span>
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Mastery</div>
                      <div className={`text-xs font-bold ${student.overall_mastery >= 75 ? 'text-emerald-400' : student.overall_mastery >= 50 ? 'text-indigo-400' : 'text-rose-400'}`}>
                        {student.overall_mastery >= 75 ? 'Exemplary' : student.overall_mastery >= 50 ? 'Proficient' : 'Developing'}
                      </div>
                    </div>
                  </div>

                  {/* Stress Level */}
                  <div className="flex items-center gap-3 bg-slate-900/60 p-3 rounded-xl border border-white/5">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg border ${
                      student.stress_level === 'Low' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                      student.stress_level === 'High' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                      'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    }`}>
                      <HeartPulse className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Stress</div>
                      <div className={`text-xs font-bold ${
                        student.stress_level === 'Low' ? 'text-emerald-300' :
                        student.stress_level === 'High' ? 'text-rose-400' :
                        'text-amber-300'
                      }`}>
                        {student.stress_level}
                      </div>
                    </div>
                  </div>

                  {/* AI Track */}
                  <div className="col-span-2 sm:col-span-1 flex items-center gap-3 bg-slate-900/60 p-3 rounded-xl border border-white/5">
                    <div className="w-12 h-12 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
                      <Lightbulb className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Strategy</div>
                      <div className="text-xs font-bold text-sky-300">
                        {student.overall_mastery >= 75 ? 'Advanced' : student.overall_mastery >= 50 ? 'Targeted' : 'Foundation'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* AI Recommendation Banner */}
            <section className="rounded-2xl p-5 bg-gradient-to-r from-indigo-950/80 via-slate-900/90 to-purple-950/80 border border-indigo-500/30 shadow-lg relative overflow-hidden">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-5 h-5 text-indigo-300" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold tracking-wide uppercase text-indigo-300">
                        EduMind AI Recommendation
                      </h3>
                      <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30 font-medium">
                        Live /api/ai/recommend
                      </span>
                    </div>
                    <p className="text-slate-100 text-sm md:text-base font-medium mt-1 leading-snug">
                      "{recommendation}"
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleSendChat(`The recommendation for me is "${recommendation}". How should I plan my study schedule?`)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition shrink-0 flex items-center gap-2 shadow-md shadow-indigo-600/30"
                >
                  <Brain className="w-4 h-4" />
                  <span>Discuss With AI</span>
                </button>
              </div>
            </section>

            {/* Grid: Subjects & Weak Areas (Left) vs Chat (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Subject Mastery Cards */}
                <div className="glass-panel rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-indigo-400" />
                      <h3 className="brand-font font-bold text-lg text-white">Subject Mastery</h3>
                    </div>
                    <span className="text-xs text-slate-400">Click a subject to ask AI tutor</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {student.subjects?.map((sub) => (
                      <div
                        key={sub.name}
                        className="bg-slate-900/60 p-4 rounded-xl border border-white/5 hover:border-indigo-500/30 transition group"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-slate-200 text-sm">{sub.name}</span>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                            sub.mastery >= 75 ? 'text-emerald-400 bg-emerald-500/10' :
                            sub.mastery < 50 ? 'text-rose-400 bg-rose-500/10' :
                            'text-indigo-400 bg-indigo-500/10'
                          }`}>
                            {sub.mastery}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2 mb-3 overflow-hidden">
                          <div
                            className={`h-2 rounded-full transition-all duration-700 bg-gradient-to-r ${
                              sub.mastery >= 75 ? 'from-emerald-500 to-teal-400' :
                              sub.mastery < 50 ? 'from-rose-500 to-orange-400' :
                              'from-indigo-500 to-sky-400'
                            }`}
                            style={{ width: `${sub.mastery}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[11px] text-slate-400">Status</span>
                          <button
                            onClick={() => handleSendChat(`How can I improve my understanding of ${sub.name}? Current score is ${sub.mastery}%.`)}
                            className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                          >
                            <span>Ask AI</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Weak Topics */}
                <div className="glass-panel rounded-2xl p-5 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-rose-400" />
                      <h3 className="brand-font font-bold text-base text-white">Identified Weak Areas</h3>
                    </div>
                    <span className="text-xs text-rose-400/90 font-medium bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
                      Needs Attention
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Click any topic tag to immediately get a tailored concept explanation and practice tips:
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {student.weak_topics?.map((topic) => (
                      <button
                        key={topic}
                        onClick={() => handleSendChat(`Can you explain the concept of "${topic}" and how to master it step-by-step?`)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/25 text-xs font-medium transition group"
                      >
                        <Lightbulb className="w-3 h-3 text-rose-400" />
                        <span>{topic}</span>
                        <span className="text-[10px] opacity-60 ml-1">Ask AI</span>
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* Right Column: AI Chatbot (5 cols) */}
              <div className="lg:col-span-5">
                <div className="glass-panel rounded-2xl flex flex-col h-[650px] sticky top-20 border border-white/10 overflow-hidden shadow-2xl">
                  
                  {/* Chat Header */}
                  <div className="p-4 bg-slate-900/90 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center text-white text-sm shadow-md shadow-indigo-500/30">
                        <Brain className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="brand-font font-bold text-sm text-white">EduMind AI Tutor</h4>
                        <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          <span>Connected to /api/ai/chat</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 bg-slate-950/70 border border-white/10 rounded-lg p-1" aria-label="AI response language">
                        <button
                          onClick={() => setLanguage('en')}
                          className={`px-2 py-1 rounded-md text-[10px] font-semibold transition ${language === 'en' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                        >
                          English
                        </button>
                        <button
                          onClick={() => setLanguage('ta')}
                          className={`px-2 py-1 rounded-md text-[10px] font-semibold transition ${language === 'ta' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                        >
                          தமிழ்
                        </button>
                      </div>
                      <button
                        onClick={() => setMessages([{
                          id: Date.now(),
                          sender: 'bot',
                          text: language === 'ta' ? `உங்கள் படிப்பைப் பற்றி நான் எவ்வாறு உதவலாம், ${student.name}?` : `Chat reset! How can I assist you with your studies, ${student.name}?`,
                          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        }])}
                        title="Clear chat"
                        className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition text-xs"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Suggestion Chips */}
                  <div className="px-4 py-2.5 bg-slate-950/40 border-b border-white/5 flex gap-2 overflow-x-auto whitespace-nowrap">
                    <button
                      onClick={() => handleSendChat('How can I manage study and exam stress?')}
                      className="text-[11px] bg-slate-800/80 hover:bg-indigo-600/40 border border-white/10 px-2.5 py-1 rounded-full text-slate-300 transition shrink-0"
                    >
                      🧘 Stress tips
                    </button>
                    <button
                      onClick={() => handleSendChat('Help me solve math formulas and concepts')}
                      className="text-[11px] bg-slate-800/80 hover:bg-indigo-600/40 border border-white/10 px-2.5 py-1 rounded-full text-slate-300 transition shrink-0"
                    >
                      📐 Maths formulas
                    </button>
                    <button
                      onClick={() => handleSendChat('Explain Asynchronous Sequential Circuits')}
                      className="text-[11px] bg-slate-800/80 hover:bg-indigo-600/40 border border-white/10 px-2.5 py-1 rounded-full text-slate-300 transition shrink-0"
                    >
                      ⚡ Circuit analysis
                    </button>
                    <button
                      onClick={() => handleSendChat('Create a personalized weekly study schedule')}
                      className="text-[11px] bg-slate-800/80 hover:bg-indigo-600/40 border border-white/10 px-2.5 py-1 rounded-full text-slate-300 transition shrink-0"
                    >
                      📅 Study schedule
                    </button>
                  </div>

                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs leading-relaxed">
                    {messages.map((m) => (
                      <div
                        key={m.id}
                        className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        {m.sender === 'bot' && (
                          <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 flex items-center justify-center shrink-0 mt-0.5">
                            <Brain className="w-3.5 h-3.5" />
                          </div>
                        )}
                        <div
                          className={`p-3 rounded-2xl max-w-[85%] shadow-sm ${
                            m.sender === 'user'
                              ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-br-sm'
                              : 'bg-slate-800/80 border border-white/10 text-slate-200 rounded-bl-sm'
                          }`}
                        >
                          <p className="whitespace-pre-line">{m.text}</p>
                          <div className={`text-[9px] mt-1 ${m.sender === 'user' ? 'text-indigo-200 text-right' : 'text-slate-500'}`}>
                            {m.time}
                          </div>
                        </div>
                        {m.sender === 'user' && (
                          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shrink-0 mt-0.5 text-xs">
                            {student.name[0]}
                          </div>
                        )}
                      </div>
                    ))}

                    {isTyping && (
                      <div className="flex items-start gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 flex items-center justify-center shrink-0 mt-0.5">
                          <Brain className="w-3.5 h-3.5" />
                        </div>
                        <div className="bg-slate-800/80 border border-white/10 p-3 rounded-2xl flex items-center gap-1">
                          <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                          <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                          <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                        </div>
                      </div>
                    )}
                    <div ref={chatBottomRef} />
                  </div>

                  {/* Input form */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendChat();
                    }}
                    className="p-3 bg-slate-900/90 border-t border-white/10 flex items-center gap-2"
                  >
                    <input
                      type="text"
                      placeholder="Ask about stress, maths, circuits, Python..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="submit"
                      className="w-10 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center transition shadow-md shadow-indigo-600/30 shrink-0"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </div>

            </div>
          </>
        )}

      </main>

      {/* Add Student Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel bg-slate-900 border border-white/10 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-600/30 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="brand-font font-bold text-lg text-white">Create Student Profile</h3>
                <p className="text-xs text-slate-400">Save new student records to EduMind</p>
              </div>
            </div>

            <form onSubmit={handleAddStudent} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Roll Number *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. 25ECA099"
                    value={modalForm.roll_no}
                    onChange={(e) => setModalForm({ ...modalForm, roll_no: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white uppercase focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Full Name *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Anita"
                    value={modalForm.name}
                    onChange={(e) => setModalForm({ ...modalForm, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Department</label>
                  <input
                    type="text"
                    value={modalForm.department}
                    onChange={(e) => setModalForm({ ...modalForm, department: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white uppercase focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Mastery (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={modalForm.overall_mastery}
                    onChange={(e) => setModalForm({ ...modalForm, overall_mastery: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Stress Level</label>
                  <select
                    value={modalForm.stress_level}
                    onChange={(e) => setModalForm({ ...modalForm, stress_level: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:border-indigo-500 outline-none"
                  >
                    <option value="Low">Low</option>
                    <option value="Moderate">Moderate</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Subjects (Name: Score, comma separated)</label>
                <input
                  type="text"
                  placeholder="DSD: 85, Python: 80"
                  value={modalForm.subjects}
                  onChange={(e) => setModalForm({ ...modalForm, subjects: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Weak Topics (Comma separated)</label>
                <input
                  type="text"
                  placeholder="Topic A, Topic B"
                  value={modalForm.weak_topics}
                  onChange={(e) => setModalForm({ ...modalForm, weak_topics: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:border-indigo-500 outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition font-semibold"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
          <div className={`px-4 py-2.5 rounded-xl text-xs font-semibold shadow-lg text-white pointer-events-auto flex items-center gap-2 ${
            toast.type === 'success' ? 'bg-emerald-600' :
            toast.type === 'error' ? 'bg-rose-600' : 'bg-indigo-600'
          }`}>
            <CheckCircle className="w-4 h-4" />
            <span>{toast.msg}</span>
          </div>
        </div>
      )}
    </div>
  );
}
