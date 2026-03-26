import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, User, Mail, Lock, Users, Upload, ChevronRight } from 'lucide-react';
import { createUser } from '../services/UserApi';

const SignUpView = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('Player');
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [form, setForm] = useState({ username: '', email: '', password: '', teamName: '' });
  const fileInputRef = useRef();

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) setAvatarPreview(URL.createObjectURL(file));
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const data = {
      username: form.username,
      email: form.email,
      password: form.password,
      role: role, 
      teamName: form.teamName,
      imageURL: " " // TODO: placeholder since image upload isn't implemented yet
    };

    await createUser(data);

    navigate('/login');

  } catch (err) {
    console.error('FULL ERROR:', err);
    console.error('RESPONSE DATA:', err.response?.data);
    console.error('STATUS:', err.response?.status);

    alert(err.response?.data?.message || 'An error occurred during sign up.');
  }
};

  return (
    <div style={styles.page}>
      {/* LEFT PANEL */}
      <div style={styles.leftPanel}>
        <div style={styles.logoRow}>
          <div style={styles.logoIcon}><Shield size={18} color="#ff4655" /></div>
          <span style={styles.logoText}>TRACKER<span style={{ color: '#ff4655' }}>.DB</span></span>
        </div>

        <h1 style={styles.title}>CREATE ACCOUNT</h1>
        <p style={styles.subtitle}>Join the competitive network</p>

        {/* Role Toggle */}
        <div style={styles.toggleWrapper}>
          <button style={{ ...styles.toggleBtn, ...(role === 'Player' ? styles.toggleActive : {}) }} onClick={() => setRole('Player')} type="button">
            <User size={13} style={{ marginRight: 5 }} /> PLAYER
          </button>
          <button style={{ ...styles.toggleBtn, ...(role === 'Coach' ? styles.toggleActive : {}) }} onClick={() => setRole('Coach')} type="button">
            <Shield size={13} style={{ marginRight: 5 }} /> COACH
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Avatar */}
          <div style={styles.avatarRow}>
            <div style={styles.avatarCircle} onClick={() => fileInputRef.current.click()}>
              {avatarPreview ? <img src={avatarPreview} alt="avatar" style={styles.avatarImg} /> : <Upload size={20} color="#ff4655" />}
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#fff', fontWeight: 700, letterSpacing: 1 }}>PROFILE PICTURE</div>
              <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>Click to upload</div>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
          </div>

          <Field label={role === 'Player' ? 'VALORANT ID' : 'USERNAME'} name="username" value={form.username} onChange={handleChange} placeholder={role === 'Player' ? 'e.g. Aspas#NA1' : 'Coach username'} icon={<User size={14} color="#555" />} />
          <Field label="EMAIL" name="email" type="email" value={form.email} onChange={handleChange} placeholder="your@email.com" icon={<Mail size={14} color="#555" />} />
          <Field label="PASSWORD" name="password" type="password" value={form.password} onChange={handleChange} placeholder="Min. 8 characters" icon={<Lock size={14} color="#555" />} />
          <Field label="TEAM NAME" name="teamName" value={form.teamName} onChange={handleChange} placeholder={role === 'Player' ? 'Team to join' : 'Team you coach'} icon={<Users size={14} color="#555" />} />

          <div style={styles.roleTag}>
            <Shield size={13} color="#ff4655" />
            <span style={{ marginLeft: 8, color: '#555', fontSize: 11, letterSpacing: 1 }}>REGISTERING AS</span>
            <span style={{ marginLeft: 6, color: '#ff4655', fontWeight: 900, fontSize: 11, letterSpacing: 2 }}>{role.toUpperCase()}</span>
          </div>

          <button type="submit" style={styles.submitBtn}>
            CREATE ACCOUNT <ChevronRight size={16} style={{ marginLeft: 6 }} />
          </button>
        </form>

        <p style={styles.loginPrompt}>
          Already have an account?{' '}
          <span style={styles.loginLink} onClick={() => navigate('/login')}>Sign in</span>
        </p>
      </div>

      {/* RIGHT PANEL */}
      <div style={styles.rightPanel}>
        <div style={styles.imageOverlay} />
        <img src="/src/assets/valorant.jpg" alt="Valorant" style={styles.bgImage} />
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
        style={{ width: '100%', background: '#0a0d14', border: '1px solid #1e2535', borderRadius: 6, padding: '10px 10px 10px 34px', color: '#fff', fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif", fontSize: 13, letterSpacing: 1, outline: 'none', boxSizing: 'border-box' }}
      />
    </div>
  </div>
);

const styles = {
  page: { display: 'flex', height: '100vh', backgroundColor: '#0a0d14', fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif", overflow: 'hidden' },
  leftPanel: { width: '33.333%', minWidth: 280, background: '#0f1117', borderRight: '1px solid #1a1f2e', padding: '36px 28px', display: 'flex', flexDirection: 'column', overflowY: 'auto', position: 'relative', zIndex: 2 },
  rightPanel: { flex: 1, position: 'relative', overflow: 'hidden' },
  bgImage: { width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' },
  imageOverlay: { position: 'absolute', inset: 0, background: 'linear-gradient(to right, #0f1117 0%, rgba(15,17,23,0.5) 25%, transparent 55%)', zIndex: 1, pointerEvents: 'none' },
  imageLabel: { position: 'absolute', bottom: 32, right: 36, zIndex: 2, textAlign: 'right' },
  imageLabelGame: { display: 'block', fontSize: 52, fontWeight: 900, color: 'rgba(255,255,255,0.06)', letterSpacing: 10 },
  imageLabelSub: { display: 'block', fontSize: 11, color: 'rgba(255,70,85,0.45)', letterSpacing: 4 },
  logoRow: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 },
  logoIcon: { background: 'rgba(255,70,85,0.12)', borderRadius: 6, padding: '4px 6px', display: 'flex' },
  logoText: { fontSize: 18, fontWeight: 900, color: '#fff', letterSpacing: 2 },
  title: { fontSize: 24, fontWeight: 900, color: '#fff', letterSpacing: 3, margin: '0 0 4px 0' },
  subtitle: { fontSize: 11, color: '#444', margin: '0 0 18px 0', letterSpacing: 1 },
  toggleWrapper: { display: 'flex', background: '#0a0d14', borderRadius: 7, padding: 3, marginBottom: 18, border: '1px solid #1e2535' },
  toggleBtn: { flex: 1, padding: '9px 0', border: 'none', borderRadius: 5, background: 'transparent', color: '#444', fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: 2, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' },
  toggleActive: { background: 'rgba(255,70,85,0.12)', color: '#ff4655', border: '1px solid rgba(255,70,85,0.25)' },
  form: { display: 'flex', flexDirection: 'column', gap: 13 },
  avatarRow: { display: 'flex', alignItems: 'center', gap: 14, background: '#0a0d14', border: '1px solid #1e2535', borderRadius: 8, padding: '12px 14px', marginBottom: 2 },
  avatarCircle: { width: 46, height: 46, borderRadius: '50%', border: '2px dashed rgba(255,70,85,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', background: 'rgba(255,70,85,0.05)', flexShrink: 0 },
  avatarImg: { width: '100%', height: '100%', objectFit: 'cover' },
  roleTag: { display: 'flex', alignItems: 'center', background: 'rgba(255,70,85,0.05)', border: '1px solid rgba(255,70,85,0.12)', borderRadius: 6, padding: '9px 12px' },
  submitBtn: { background: '#ff4655', border: 'none', borderRadius: 6, padding: '13px 0', color: '#fff', fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif", fontWeight: 900, fontSize: 14, letterSpacing: 3, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  loginPrompt: { textAlign: 'center', fontSize: 11, color: '#444', marginTop: 16, letterSpacing: 1 },
  loginLink: { color: '#ff4655', cursor: 'pointer', fontWeight: 700 },
};

export default SignUpView;
