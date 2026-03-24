import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, User, Users, ClipboardList, LayoutDashboard, LogOut, Search } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem('userRole') || 'player'; 

  const links = [
    { label: 'OVERVIEW',      path: '/general',       icon: <LayoutDashboard size={14} /> },
    { label: 'MY PROFILE',    path: '/player',        icon: <User size={14} />, playerOnly: true },
    { label: 'TEAM SEARCH',   path: '/search',        icon: <Search size={14} /> },
    { label: 'COACH PANEL',   path: '/coach',         icon: <Users size={14} />, coachOnly: true },
    { label: 'REGISTRATIONS', path: '/registrations', icon: <ClipboardList size={14} />, coachOnly: true },
  ];

  const visibleLinks = links.filter(l => {
    if (l.coachOnly) return role === 'coach';
    if (l.playerOnly) return role === 'player';
    return true;
  });

  return (
    <div style={styles.nav}>
      {/* Logo */}
      <div style={styles.logo} onClick={() => navigate('/general')}>
        <div style={styles.logoIcon}><Shield size={16} color="#ff4655" /></div>
        <span style={styles.logoText}>TRACKER<span style={{ color: '#ff4655' }}>.DB</span></span>
      </div>

      {/* Nav links */}
      <div style={styles.links}>
        {visibleLinks.map(link => {
          const active = location.pathname === link.path;
          return (
            <button
              key={link.path}
              style={{ ...styles.link, ...(active ? styles.linkActive : {}) }}
              onClick={() => navigate(link.path)}
            >
              {link.icon}
              <span style={{ marginLeft: 6 }}>{link.label}</span>
              {active && <div style={styles.activeDot} />}
            </button>
          );
        })}
      </div>

      {/* Sign out */}
      <button style={styles.logoutBtn} onClick={() => navigate('/login')}>
        <LogOut size={14} style={{ marginRight: 6 }} />
        SIGN OUT
      </button>
    </div>
  );
};

const styles = {
  nav: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', height: 60, background: '#0f1117', borderBottom: '1px solid #1a1f2e', position: 'sticky', top: 0, zIndex: 50, fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif" },
  logo: { display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' },
  logoIcon: { background: 'rgba(255,70,85,0.12)', borderRadius: 6, padding: '3px 5px', display: 'flex' },
  logoText: { fontSize: 17, fontWeight: 900, color: '#fff', letterSpacing: 2 },
  links: { display: 'flex', alignItems: 'center', gap: 4 },
  link: { display: 'flex', alignItems: 'center', position: 'relative', background: 'transparent', border: 'none', color: '#555', fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: 2, padding: '8px 14px', borderRadius: 6, cursor: 'pointer', transition: 'color 0.2s' },
  linkActive: { color: '#fff', background: 'rgba(255,70,85,0.08)' },
  activeDot: { position: 'absolute', bottom: 2, left: '50%', transform: 'translateX(-50%)', width: 4, height: 4, borderRadius: '50%', background: '#ff4655' },
  logoutBtn: { display: 'flex', alignItems: 'center', background: 'transparent', border: '1px solid #1a1f2e', color: '#555', fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: 2, padding: '7px 14px', borderRadius: 6, cursor: 'pointer' },
};

export default Navbar;
