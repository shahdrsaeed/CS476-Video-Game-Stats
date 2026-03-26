import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, ChevronRight, User, Users } from 'lucide-react';
import { loginUser } from '../services/UserApi';

const LoginView = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('player');
  const [form, setForm] = useState({ email: '', password: '' });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await loginUser(form); // Call the API to log in

      const user = res.data.user;

      localStorage.setItem('user', JSON.stringify(user));

      if (user.role === 'Coach') {
        navigate('/coach');
      } else {
        navigate('/player');
      }

    } catch (err) {
      alert(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.leftPanel}>
        <div style={styles.logoRow}>
          <div style={styles.logoIcon}><Shield size={18} color="#ff4655" /></div>
          <span style={styles.logoText}>TRACKER<span style={{ color: '#ff4655' }}>.DB</span></span>
        </div>

        <h1 style={styles.title}>WELCOME BACK</h1>
        <p style={styles.subtitle}>Sign in to your account</p>

        <div style={styles.toggleWrapper}>
          <button style={{ ...styles.toggleBtn, ...(role === 'player' ? styles.toggleActive : {}) }} onClick={() => setRole('player')} type="button">
            <User size={13} style={{ marginRight: 5 }} /> PLAYER
          </button>
          <button style={{ ...styles.toggleBtn, ...(role === 'coach' ? styles.toggleActive : {}) }} onClick={() => setRole('coach')} type="button">
            <Users size={13} style={{ marginRight: 5 }} /> COACH
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <Field label="EMAIL" name="email" type="email" value={form.email} onChange={handleChange} placeholder="your@email.com" icon={<Mail size={14} color="#555" />} />
          <Field label="PASSWORD" name="password" type="password" value={form.password} onChange={handleChange} placeholder="Your password" icon={<Lock size={14} color="#555" />} />
          <div style={styles.forgotRow}><span style={styles.forgotLink}>Forgot password?</span></div>
          <div style={styles.roleTag}>
            <Shield size={13} color="#ff4655" />
            <span style={{ marginLeft: 8, color: '#555', fontSize: 11, letterSpacing: 1 }}>SIGNING IN AS</span>
            <span style={{ marginLeft: 6, color: '#ff4655', fontWeight: 900, fontSize: 11, letterSpacing: 2 }}>{role.toUpperCase()}</span>
          </div>
          <button type="submit" style={styles.submitBtn}>
            SIGN IN <ChevronRight size={16} style={{ marginLeft: 6 }} />
          </button>
        </form>

        <div style={styles.divider}>
          <div style={styles.dividerLine} /><span style={styles.dividerText}>OR</span><div style={styles.dividerLine} />
        </div>
        <p style={styles.signupPrompt}>
          Don't have an account?{' '}
          <span style={styles.signupLink} onClick={() => navigate('/signup')}>Create one</span>
        </p>
      </div>

      <div style={styles.rightPanel}>
        <div style={styles.imageOverlay} />
        <img src="/src/assets/valorant-1.jpg" alt="Valorant" style={styles.bgImage} />
        <div style={styles.imageLabel}>
          <span style={styles.imageLabelGame}>VALORANT</span>
          <span style={styles.imageLabelSub}>COMPETITIVE TRACKER</span>
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, name, type = 'text', value, onChange, placeholder, icon }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
    <label style={{ fontSize: 10, fontWeight: 700, color: '#555', letterSpacing: 2 }}>{label}</label>
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <span style={{ position: 'absolute', left: 11, pointerEvents: 'none' }}>{icon}</span>
      <input name={name} type={type} value={value} onChange={onChange} placeholder={placeholder}
        style={{ width: '100%', background: '#0a0d14', border: '1px solid #1e2535', borderRadius: 6, padding: '10px 10px 10px 34px', color: '#fff', fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif", fontSize: 13, letterSpacing: 1, outline: 'none', boxSizing: 'border-box' }} />
    </div>
  </div>
);

const styles = {
  page: { display: 'flex', height: '100vh', backgroundColor: '#0a0d14', fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif", overflow: 'hidden' },
  leftPanel: { width: '33.333%', minWidth: 280, background: '#0f1117', borderRight: '1px solid #1a1f2e', padding: '36px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', overflowY: 'auto', zIndex: 2 },
  rightPanel: { flex: 1, position: 'relative', overflow: 'hidden' },
  bgImage: { width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' },
  imageOverlay: { position: 'absolute', inset: 0, background: 'linear-gradient(to right, #0f1117 0%, rgba(15,17,23,0.5) 25%, transparent 55%)', zIndex: 1, pointerEvents: 'none' },
  imageLabel: { position: 'absolute', bottom: 32, right: 36, zIndex: 2, textAlign: 'right' },
  imageLabelGame: { display: 'block', fontSize: 52, fontWeight: 900, color: 'rgba(255,255,255,0.06)', letterSpacing: 10 },
  imageLabelSub: { display: 'block', fontSize: 11, color: 'rgba(255,70,85,0.45)', letterSpacing: 4 },
  logoRow: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32 },
  logoIcon: { background: 'rgba(255,70,85,0.12)', borderRadius: 6, padding: '4px 6px', display: 'flex' },
  logoText: { fontSize: 18, fontWeight: 900, color: '#fff', letterSpacing: 2 },
  title: { fontSize: 24, fontWeight: 900, color: '#fff', letterSpacing: 3, margin: '0 0 4px 0' },
  subtitle: { fontSize: 11, color: '#444', margin: '0 0 20px 0', letterSpacing: 1 },
  toggleWrapper: { display: 'flex', background: '#0a0d14', borderRadius: 7, padding: 3, marginBottom: 20, border: '1px solid #1e2535' },
  toggleBtn: { flex: 1, padding: '9px 0', border: 'none', borderRadius: 5, background: 'transparent', color: '#444', fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: 2, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' },
  toggleActive: { background: 'rgba(255,70,85,0.12)', color: '#ff4655', border: '1px solid rgba(255,70,85,0.25)' },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  forgotRow: { display: 'flex', justifyContent: 'flex-end', marginTop: -6 },
  forgotLink: { fontSize: 11, color: '#ff4655', cursor: 'pointer', letterSpacing: 1 },
  roleTag: { display: 'flex', alignItems: 'center', background: 'rgba(255,70,85,0.05)', border: '1px solid rgba(255,70,85,0.12)', borderRadius: 6, padding: '9px 12px' },
  submitBtn: { background: '#ff4655', border: 'none', borderRadius: 6, padding: '13px 0', color: '#fff', fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif", fontWeight: 900, fontSize: 14, letterSpacing: 3, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  divider: { display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' },
  dividerLine: { flex: 1, height: 1, background: '#1e2535' },
  dividerText: { fontSize: 11, color: '#333', letterSpacing: 2 },
  signupPrompt: { textAlign: 'center', fontSize: 11, color: '#444', letterSpacing: 1 },
  signupLink: { color: '#ff4655', cursor: 'pointer', fontWeight: 700 },
};

export default LoginView;
