import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap, BookOpen, Smartphone, Zap, CheckCircle2,
  Calendar, MessageSquare, Brain, Lock, X
} from 'lucide-react';
import '../styles/auth.css';

// ─── Shared Input ──────────────────────────────────────────────────────────
function OInput({ label, type = 'text', placeholder, value, onChange, children, style }) {
  return (
    <div className="auth-input-group" style={style}>
      <label className="auth-input-label">{label}</label>
      {children ?? (
        <input
          className="auth-input"
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
      )}
    </div>
  );
}

// ─── Stepper ───────────────────────────────────────────────────────────────
const STEPS = [
  { label: 'Academic' },
  { label: 'Subjects' },
  { label: 'Contact' },
  { label: 'Setup' },
  { label: 'Done' },
];

function Stepper({ current }) {
  return (
    <div className="onboard-stepper">
      {STEPS.map((step, i) => {
        const isDone   = i < current;
        const isActive = i === current;
        const isPending = i > current;
        return (
          <div key={i} className="onboard-step-wrap">
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <motion.div
                className={`onboard-step-circle ${isDone ? 'done' : isActive ? 'active' : 'pending'}`}
                animate={{ scale: isActive ? 1.1 : 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                {isDone ? '✓' : i + 1}
              </motion.div>
              <div className="onboard-step-label" style={{ color: isActive ? '#a5b4fc' : isPending ? '#334155' : '#6366f1' }}>
                {step.label}
              </div>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`onboard-step-line ${isDone ? 'done' : 'pending'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Step 1 – Academic Info ────────────────────────────────────────────────
function Step1({ data, setData, onNext }) {
  const set = k => e => setData(d => ({ ...d, [k]: e.target.value }));
  const valid = data.fullName && data.university && data.branch && data.year && data.semester;

  return (
    <div>
      <div className="onboard-step-header">
        <div className="onboard-step-icon" style={{ background: 'rgba(79,124,255,0.12)', color: '#4F7CFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <GraduationCap size={20} />
        </div>
        <h2>Academic Information</h2>
        <p>Tell us about your college and programme so we can tailor CampusFlow for you.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
        <OInput label="Full Name" placeholder="Aryan Sharma" value={data.fullName} onChange={set('fullName')} style={{ gridColumn: '1 / -1' }} />
        <OInput label="University / College" placeholder="IIT Bombay" value={data.university} onChange={set('university')} style={{ gridColumn: '1 / -1' }} />
        <OInput label="Branch / Department" placeholder="Computer Science & Engg." value={data.branch} onChange={set('branch')} />
        <OInput label="Year">
          <select className="auth-input" value={data.year} onChange={set('year')}>
            <option value="">Select year</option>
            {['1st Year', '2nd Year', '3rd Year', '4th Year'].map(y => <option key={y}>{y}</option>)}
          </select>
        </OInput>
        <OInput label="Semester">
          <select className="auth-input" value={data.semester} onChange={set('semester')}>
            <option value="">Select semester</option>
            {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>{s}th Semester</option>)}
          </select>
        </OInput>
        <OInput label="Roll Number" placeholder="21CSE045" value={data.rollNo} onChange={set('rollNo')} />
      </div>

      <div className="onboard-nav">
        <button className="auth-btn-primary" style={{ flex: 1 }} disabled={!valid} onClick={onNext} type="button">
          Continue →
        </button>
      </div>
    </div>
  );
}

// ─── Step 2 – Subjects ─────────────────────────────────────────────────────
const ALL_SUBJECTS = [
  'Operating Systems', 'DBMS', 'Computer Networks', 'Artificial Intelligence',
  'Machine Learning', 'Mathematics', 'Software Engineering', 'Data Structures',
  'Algorithms', 'Computer Architecture', 'Compiler Design', 'Theory of Computation',
  'Web Development', 'Mobile App Dev', 'Cryptography', 'Cloud Computing',
];

function Step2({ data, setData, onNext, onBack }) {
  const selected = data.subjects || [];
  const toggle = (sub) => {
    setData(d => ({
      ...d,
      subjects: selected.includes(sub) ? selected.filter(s => s !== sub) : [...selected, sub],
    }));
  };

  return (
    <div>
      <div className="onboard-step-header">
        <div className="onboard-step-icon" style={{ background: 'rgba(139,92,246,0.12)', color: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <BookOpen size={20} />
        </div>
        <h2>Your Subjects</h2>
        <p>Select the subjects you're enrolled in this semester. AI will track deadlines and attendance for each.</p>
      </div>

      <div style={{
        fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase',
        letterSpacing: '0.6px', marginBottom: 12,
      }}>
        {selected.length} selected
      </div>

      <div className="subject-grid">
        {ALL_SUBJECTS.map(sub => (
          <motion.button
            key={sub}
            type="button"
            className={`subject-chip ${selected.includes(sub) ? 'selected' : ''}`}
            onClick={() => toggle(sub)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {selected.includes(sub) && <span style={{ marginRight: 4 }}>✓</span>}
            {sub}
          </motion.button>
        ))}
      </div>

      <div className="onboard-nav">
        <button className="onboard-btn-back" onClick={onBack} type="button">← Back</button>
        <button
          className="auth-btn-primary"
          style={{ flex: 1 }}
          disabled={selected.length === 0}
          onClick={onNext}
          type="button"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}

// ─── Step 3 – Contact ──────────────────────────────────────────────────────
function Step3({ data, setData, onNext, onBack }) {
  const set = k => e => setData(d => ({ ...d, [k]: e.target.value }));
  const valid = data.phone && data.whatsapp && data.contactEmail;

  return (
    <div>
      <div className="onboard-step-header">
        <div className="onboard-step-icon" style={{ background: 'rgba(192,132,252,0.12)', color: '#C084FC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Smartphone size={20} />
        </div>
        <h2>Contact Information</h2>
        <p>Used for WhatsApp reminders and important notifications about your deadlines and attendance.</p>
      </div>

      <OInput label="Country Code">
        <div className="phone-group">
          <select className="auth-input country-code-select" value={data.countryCode || '+91'} onChange={set('countryCode')}>
            {['+91 (IN)', '+1 (US)', '+44 (UK)', '+61 (AU)', '+65 (SG)', '+971 (AE)'].map(c => (
              <option key={c} value={c.split(' ')[0]}>{c}</option>
            ))}
          </select>
          <input className="auth-input" style={{ flex: 1 }} placeholder="98765 43210" value={data.phone} onChange={set('phone')} type="tel" />
        </div>
      </OInput>

      <OInput label="WhatsApp Number" placeholder="Same as phone or different" value={data.whatsapp} onChange={set('whatsapp')} type="tel" />
      <OInput label="Personal Email (for notifications)" type="email" placeholder="aryan@gmail.com" value={data.contactEmail} onChange={set('contactEmail')} />

      <div style={{
        padding: '14px 16px', borderRadius: 12,
        background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.18)',
        fontSize: 12, color: '#64748b', marginBottom: 8, lineHeight: 1.6,
        display: 'flex', alignItems: 'center', gap: 6
      }}>
        <Lock size={13} style={{ color: '#22c55e', flexShrink: 0 }} />
        <span>Your contact info is used only for academic reminders. We never share it.</span>
      </div>

      <div className="onboard-nav">
        <button className="onboard-btn-back" onClick={onBack} type="button">← Back</button>
        <button
          className="auth-btn-primary"
          style={{ flex: 1 }}
          disabled={!valid}
          onClick={onNext}
          type="button"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}

// ─── Step 4 – Automations ──────────────────────────────────────────────────
function Step4({ data, setData, onNext, onBack }) {
  const [calConnected, setCalConnected] = useState(false);
  const [waVerified, setWaVerified] = useState(false);
  const [calLoading, setCalLoading] = useState(false);
  const [waLoading, setWaLoading] = useState(false);

  const connectCal = async () => {
    setCalLoading(true);
    await new Promise(r => setTimeout(r, 1600));
    setCalConnected(true);
    setCalLoading(false);
  };

  const verifyWa = async () => {
    setWaLoading(true);
    await new Promise(r => setTimeout(r, 1400));
    setWaVerified(true);
    setWaLoading(false);
  };

  return (
    <div>
      <div className="onboard-step-header">
        <div className="onboard-step-icon" style={{ background: 'rgba(251,191,36,0.12)', color: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Zap size={20} />
        </div>
        <h2>Automation Setup</h2>
        <p>Connect your tools to enable smart reminders and automatic calendar events.</p>
      </div>

      {/* Google Calendar Card */}
      <div className="connect-card">
        <div className="connect-card-icon" style={{ background: 'rgba(59,130,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
          <Calendar size={20} />
        </div>
        <div className="connect-card-info">
          <div className="connect-card-title">Google Calendar</div>
          <div className="connect-card-desc">
            {calConnected ? '✓ Connected — events will sync automatically' : 'Auto-create events for deadlines & study sessions'}
          </div>
        </div>
        <button
          className={`connect-btn ${calConnected ? 'connected' : ''}`}
          onClick={connectCal}
          disabled={calConnected || calLoading}
          type="button"
        >
          {calLoading ? <span className="cf-spinner" style={{ width: 14, height: 14 }} /> : calConnected ? '✓ Connected' : 'Connect'}
        </button>
      </div>

      {/* WhatsApp Card */}
      <div className="connect-card">
        <div className="connect-card-icon" style={{ background: 'rgba(34,197,94,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22c55e' }}>
          <MessageSquare size={20} />
        </div>
        <div className="connect-card-info">
          <div className="connect-card-title">WhatsApp Automation</div>
          <div className="connect-card-desc">
            {waVerified ? '✓ Verified — reminders are active' : `Send reminders to ${data.whatsapp || 'your number'}`}
          </div>
        </div>
        <button
          className={`connect-btn ${waVerified ? 'connected' : ''}`}
          onClick={verifyWa}
          disabled={waVerified || waLoading}
          type="button"
        >
          {waLoading ? <span className="cf-spinner" style={{ width: 14, height: 14 }} /> : waVerified ? '✓ Verified' : 'Verify'}
        </button>
      </div>

      {/* AI Planner */}
      <div className="connect-card" style={{ borderColor: 'rgba(168,85,247,0.2)', background: 'rgba(168,85,247,0.04)' }}>
        <div className="connect-card-icon" style={{ background: 'rgba(168,85,247,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b5cf6' }}>
          <Brain size={20} />
        </div>
        <div className="connect-card-info">
          <div className="connect-card-title">AI Study Planner</div>
          <div className="connect-card-desc">✓ Active — will generate plans for all your deadlines</div>
        </div>
        <span className="connect-btn connected" style={{ cursor: 'default' }}>✓ Active</span>
      </div>

      <div style={{ fontSize: 12, color: '#334155', marginTop: 8, marginBottom: 4 }}>
        You can also connect these later from Settings.
      </div>

      <div className="onboard-nav">
        <button className="onboard-btn-back" onClick={onBack} type="button">← Back</button>
        <button className="auth-btn-primary" style={{ flex: 1 }} onClick={onNext} type="button">
          Finish Setup →
        </button>
      </div>
    </div>
  );
}

// ─── Step 5 – Success ──────────────────────────────────────────────────────
function Step5({ data, onFinish }) {
  return (
    <motion.div
      className="onboard-success"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="success-ring-wrap">
        <div className="success-ring" />
        <div className="success-icon-circle" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <GraduationCap size={36} color="white" />
        </div>
      </div>

      <h2>Your CampusFlow workspace is ready!</h2>
      <p>
        Welcome, <strong style={{ color: '#a5b4fc' }}>{data.fullName || 'Scholar'}</strong>!<br />
        AI is already analyzing your {data.subjects?.length || 0} subjects.
        Deadlines, attendance and reminders are all set up.
      </p>

      {/* Summary chips */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 32 }}>
        {[
          { icon: BookOpen, label: `${data.subjects?.length || 0} Subjects`, color: '#8b5cf6' },
          { icon: Brain, label: 'AI Planner Active', color: '#a855f7' },
          { icon: Calendar, label: 'Calendar Ready', color: '#3b82f6' },
          { icon: MessageSquare, label: 'WhatsApp Setup', color: '#22c55e' },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              style={{
                padding: '8px 16px', borderRadius: 99,
                background: 'rgba(99,102,241,0.1)',
                border: '1px solid rgba(99,102,241,0.25)',
                fontSize: 13, fontWeight: 600, color: '#a5b4fc',
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              <Icon size={14} style={{ color: item.color }} /> {item.label}
            </motion.div>
          );
        })}
      </div>

      <button className="auth-btn-primary" style={{ maxWidth: 280, margin: '0 auto' }} onClick={onFinish} type="button">
        Go to Dashboard
      </button>
    </motion.div>
  );
}

// ─── Onboarding Root ───────────────────────────────────────────────────────
const slideVariants = {
  enter: (dir) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
  center: { opacity: 1, x: 0 },
  exit:  (dir) => ({ opacity: 0, x: dir > 0 ? -40 : 40 }),
};

export default function Onboarding() {
  const { completeOnboarding } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [data, setData] = useState({
    fullName: '', university: '', branch: '', year: '', semester: '', rollNo: '',
    subjects: [],
    countryCode: '+91', phone: '', whatsapp: '', contactEmail: '',
  });

  const goNext = () => { setDir(1); setStep(s => s + 1); };
  const goBack = () => { setDir(-1); setStep(s => s - 1); };

  const finish = async () => {
    await completeOnboarding(data);
    navigate('/app');
  };

  const steps = [
    <Step1 data={data} setData={setData} onNext={goNext} />,
    <Step2 data={data} setData={setData} onNext={goNext} onBack={goBack} />,
    <Step3 data={data} setData={setData} onNext={goNext} onBack={goBack} />,
    <Step4 data={data} setData={setData} onNext={goNext} onBack={goBack} />,
    <Step5 data={data} onFinish={finish} />,
  ];

  return (
    <div className="onboard-root">
      <motion.div
        className="onboard-card"
        initial={{ opacity: 0, y: 32, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {/* Top logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div className="auth-logo-icon" style={{ width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GraduationCap size={16} color="white" />
          </div>
          <span className="auth-logo-text" style={{ fontSize: 14 }}>Campus<span>Flow</span></span>
          <span style={{
            marginLeft: 'auto', fontSize: 11, fontWeight: 700, color: '#475569',
            letterSpacing: '0.3px',
          }}>
            Step {step + 1} of {STEPS.length}
          </span>
        </div>

        <Stepper current={step} />

        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={step}
            custom={dir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {steps[step]}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
