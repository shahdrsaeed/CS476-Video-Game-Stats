import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Clock, X, CheckCircle, XCircle, Users } from 'lucide-react';

const loggedInUser = JSON.parse(localStorage.getItem('user'));

const rankColor = (rank) => {
  if (!rank) return '#888';
  if (rank.includes('Radiant'))  return '#ffffa0';
  if (rank.includes('Immortal')) return '#ff4655';
  if (rank.includes('Diamond'))  return '#a78bfa';
  if (rank.includes('Platinum')) return '#38bdf8';
  return '#888';
};

// ─────────────────────────────────────────────
// Individual Request Card
// ─────────────────────────────────────────────
const RequestCard = ({ req, onCancel, cancelling }) => {
  const player     = req.player;
  const team       = req.team;
  const isPending  = req.status === 'Pending';
  const isApproved = req.status === 'Approved';
  const isRejected = req.status === 'Rejected';

  const statusConfig = {
    Pending:  { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.3)',  icon: <Clock size={11} style={{ marginRight: 4 }} />,        label: 'PENDING'  },
    Approved: { color: '#22c55e', bg: 'rgba(34,197,94,0.1)',   border: 'rgba(34,197,94,0.3)',   icon: <CheckCircle size={11} style={{ marginRight: 4 }} />,  label: 'APPROVED' },
    Rejected: { color: '#ff4655', bg: 'rgba(255,70,85,0.1)',   border: 'rgba(255,70,85,0.3)',   icon: <XCircle size={11} style={{ marginRight: 4 }} />,      label: 'DECLINED' },
  }[req.status] ?? {};

  return (
    <div style={{
      ...card.wrapper,
      borderColor: isRejected ? 'rgba(255,70,85,0.18)' : '#1a1f2e',
      opacity:     isRejected ? 0.85 : 1,
    }}>

      {/* Player identity */}
      <div style={card.top}>
        <img
          src={player?.imageURL || '/default-avatar.png'}
          alt={player?.username}
          style={{
            ...card.avatar,
            borderColor: isRejected ? 'rgba(255,70,85,0.3)' : '#1a1f2e',
            filter: isRejected ? 'grayscale(40%)' : 'none',
          }}
          onError={e => { e.target.onerror = null; e.target.src = '/default-avatar.png'; }}
        />
        <div style={{ flex: 1 }}>
          <div style={card.name}>{player?.username ?? '—'}</div>
          <div style={{ fontSize: 12, color: rankColor(player?.rank), fontWeight: 700 }}>
            {player?.rank ?? 'Unranked'} · {player?.rr ?? 0} RR
          </div>
        </div>

        {/* Status badge */}
        <div style={{
          ...card.statusBadge,
          background: statusConfig.bg,
          border:     `1px solid ${statusConfig.border}`,
          color:      statusConfig.color,
        }}>
          {statusConfig.icon}{statusConfig.label}
        </div>
      </div>

      {/* Stats row */}
      <div style={card.stats}>
        {[
          { label: 'K/D',  value: player?.kdRatio            ?? '—' },
          { label: 'WIN%', value: player?.winRate             ?? '—' },
          { label: 'ACS',  value: player?.stats?.acs          ?? '—' },
          { label: 'HS%',  value: player?.headshotPercentage  ?? '—' },
        ].map(s => (
          <div key={s.label} style={card.statItem}>
            <div style={card.statLabel}>{s.label}</div>
            <div style={{ ...card.statValue, color: isRejected ? '#555' : '#fff' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Team target */}
      <div style={card.teamRow}>
        <span style={{ color: '#444', fontSize: 11, letterSpacing: 1 }}>TARGET TEAM</span>
        <span style={{ color: '#888', fontSize: 12, fontWeight: 700 }}>{team?.teamName ?? '—'}</span>
      </div>

      {/* ── Status-specific footer ── */}

      {/* Pending — cancel button */}
      {isPending && onCancel && (
        <button
          style={{
            ...card.cancelBtn,
            opacity: cancelling ? 0.5 : 1,
            cursor: cancelling ? 'not-allowed' : 'pointer',
          }}
          onClick={() => onCancel(req._id)}
          disabled={cancelling}
        >
          <X size={12} style={{ marginRight: 5 }} />
          {cancelling ? 'CANCELLING...' : 'CANCEL REQUEST'}
        </button>
      )}

      {/* Approved */}
      {isApproved && (
        <div style={card.approvedMsg}>
          <CheckCircle size={12} style={{ marginRight: 5 }} />
          Player accepted — check your Coach Panel roster
        </div>
      )}

      {/* Rejected */}
      {isRejected && (
        <div style={card.rejectedMsg}>
          <XCircle size={12} style={{ marginRight: 5 }} />
          Player declined your request
          {req.rejectedAt && (
            <span style={{ marginLeft: 8, opacity: 0.5, fontSize: 10 }}>
              · {new Date(req.rejectedAt).toLocaleDateString()}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// Main View
// ─────────────────────────────────────────────
const PendingRequestsView = () => {
  const [requests,   setRequests]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [cancelling, setCancelling] = useState(null);

useEffect(() => {
  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/requests?coachId=${loggedInUser._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();

      // ── ADD THIS BLOCK ──
      const deduped = data.reduce((acc, req) => {
        const key = req.player?._id;
        if (!key) return [...acc, req];
        const existing = acc.find(r => r.player?._id === key);
        if (!existing) return [...acc, req];
        return new Date(req.updatedAt) > new Date(existing.updatedAt)
          ? acc.map(r => r.player?._id === key ? req : r)
          : acc;
      }, []);
      // ── END BLOCK ──

      setRequests(deduped); // <-- changed from setRequests(data)
    } catch (err) {
      console.error('Failed to fetch requests:', err);
    } finally {
      setLoading(false);
    }
  };
  fetchRequests();
}, []);

  // Cancel a pending request
const handleCancel = async (requestId) => {
  try {
    setCancelling(requestId);
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/requests/${requestId}/cancel`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    // Log the actual error response
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      console.error('Cancel failed:', res.status, errBody);
      alert(`Cancel failed: ${errBody.message || res.status}`);
      return;
    }
    
    setRequests(prev => prev.filter(r => r._id !== requestId));
  } catch (err) {
    console.error('Failed to cancel request:', err);
    alert('Network error — could not cancel request');
  } finally {
    setCancelling(null);
  }
};

  const pending  = requests.filter(r => r.status === 'Pending');
  const approved = requests.filter(r => r.status === 'Approved');
  const rejected = requests.filter(r => r.status === 'Rejected');

  if (loading) return (
    <div style={styles.page}>
      <Navbar />
      <div style={{ color: '#555', padding: 60, textAlign: 'center', letterSpacing: 2, fontSize: 13 }}>
        LOADING REQUESTS...
      </div>
    </div>
  );

  const hasAny = requests.length > 0;

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.body}>

        {/* ── Page header ── */}
        <div style={styles.pageHeader}>
          <div>
            <h1 style={styles.title}>RECRUITMENT REQUESTS</h1>
            <p style={styles.subtitle}>Track all recruitment requests you've sent to players</p>
          </div>
          {/* Summary badges */}
          <div style={{ display: 'flex', gap: 10 }}>
            <SummaryBadge icon={<Clock size={13} color="#f59e0b" />}     count={pending.length}  label="PENDING"  color="#f59e0b" />
            <SummaryBadge icon={<CheckCircle size={13} color="#22c55e" />} count={approved.length} label="APPROVED" color="#22c55e" />
            <SummaryBadge icon={<XCircle size={13} color="#ff4655" />}   count={rejected.length} label="DECLINED" color="#ff4655" />
          </div>
        </div>

        {/* ── Empty state ── */}
        {!hasAny && (
          <div style={styles.emptyState}>
            <Users size={48} color="#1a1f2e" />
            <p style={{ color: '#333', marginTop: 16, letterSpacing: 2, fontSize: 13 }}>NO REQUESTS SENT YET</p>
            <p style={{ color: '#222', fontSize: 11, letterSpacing: 1, marginTop: 4 }}>
              Go to Team Search to find and recruit players
            </p>
          </div>
        )}

        {/* ── PENDING section ── */}
        {pending.length > 0 && (
          <Section
            icon={<Clock size={12} color="#f59e0b" />}
            label="AWAITING RESPONSE"
            color="#f59e0b"
            count={pending.length}
          >
            {pending.map(req => (
              <RequestCard
                key={req._id}
                req={req}
                onCancel={handleCancel}
                cancelling={cancelling === req._id}
              />
            ))}
          </Section>
        )}

        {/* ── APPROVED section ── */}
        {approved.length > 0 && (
          <Section
            icon={<CheckCircle size={12} color="#22c55e" />}
            label="APPROVED — ON YOUR ROSTER"
            color="#22c55e"
            count={approved.length}
          >
            {approved.map(req => (
              <RequestCard key={req._id} req={req} onCancel={null} cancelling={false} />
            ))}
          </Section>
        )}

        {/* ── REJECTED section ── */}
        {rejected.length > 0 && (
          <Section
            icon={<XCircle size={12} color="#ff4655" />}
            label="DECLINED BY PLAYER"
            color="#ff4655"
            count={rejected.length}
            note="These players declined your request. Consider reaching out again later or finding alternatives."
          >
            {rejected.map(req => (
              <RequestCard key={req._id} req={req} onCancel={null} cancelling={false} />
            ))}
          </Section>
        )}

      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Small reusable sub-components
// ─────────────────────────────────────────────
const SummaryBadge = ({ icon, count, label, color }) => (
  <div style={styles.summaryBadge}>
    {icon}
    <span style={{ color, fontWeight: 900, marginLeft: 6 }}>{count}</span>
    <span style={{ color: '#555', marginLeft: 5 }}>{label}</span>
  </div>
);

const Section = ({ icon, label, color, count, note, children }) => (
  <div style={{ marginBottom: 36 }}>
    <div style={styles.sectionLabel}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 7, color }}>
        {icon} {label}
      </span>
      <span style={{ marginLeft: 10, background: `${color}22`, color, border: `1px solid ${color}44`, borderRadius: 10, fontSize: 10, fontWeight: 900, padding: '2px 8px' }}>
        {count}
      </span>
      {note && <span style={{ marginLeft: 14, fontSize: 11, color: '#333', fontWeight: 400, letterSpacing: 0 }}>{note}</span>}
    </div>
    <div style={styles.cardGrid}>{children}</div>
  </div>
);

// ─────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────
const card = {
  wrapper: {
    background: '#0f1117', border: '1px solid #1a1f2e', borderRadius: 10,
    padding: 20, display: 'flex', flexDirection: 'column', gap: 12,
    transition: 'border-color 0.2s',
  },
  top:     { display: 'flex', alignItems: 'center', gap: 12 },
  avatar:  { width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '2px solid #1a1f2e', flexShrink: 0, transition: 'filter 0.2s' },
  name:    { fontSize: 16, fontWeight: 900, color: '#fff', letterSpacing: 1 },
  statusBadge: { display: 'inline-flex', alignItems: 'center', borderRadius: 4, padding: '3px 8px', fontSize: 10, fontWeight: 700, letterSpacing: 1, flexShrink: 0 },
  stats:   { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, borderTop: '1px solid #1a1f2e', paddingTop: 12 },
  statItem:  { background: '#0a0d14', borderRadius: 6, padding: '7px', textAlign: 'center' },
  statLabel: { fontSize: 9, color: '#555', letterSpacing: 1, marginBottom: 2, fontWeight: 700 },
  statValue: { fontSize: 13, fontWeight: 900, color: '#fff' },
  teamRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', borderRadius: 6, padding: '8px 10px' },
  cancelBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%',
    background: 'transparent', border: '1px solid rgba(255,70,85,0.25)', color: '#ff4655',
    borderRadius: 5, padding: '8px 0', fontSize: 11, fontWeight: 700, letterSpacing: 2,
    fontFamily: "'Barlow Condensed', sans-serif", transition: 'background 0.15s',
  },
  approvedMsg: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 11, color: '#22c55e', letterSpacing: 1, fontWeight: 700,
    background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)',
    borderRadius: 5, padding: '8px 0',
  },
  rejectedMsg: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 11, color: '#ff4655', letterSpacing: 1, fontWeight: 700,
    background: 'rgba(255,70,85,0.06)', border: '1px solid rgba(255,70,85,0.15)',
    borderRadius: 5, padding: '8px 0',
  },
};

const styles = {
  page:       { minHeight: '100vh', backgroundColor: '#0a0d14', fontFamily: "'Barlow Condensed','Arial Narrow',sans-serif", color: '#ccc' },
  body:       { padding: '32px 40px' },
  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 },
  title:      { fontSize: 30, fontWeight: 900, color: '#fff', letterSpacing: 4, margin: '0 0 4px' },
  subtitle:   { fontSize: 12, color: '#444', letterSpacing: 1, margin: 0 },
  summaryBadge: { display: 'flex', alignItems: 'center', background: '#0f1117', border: '1px solid #1a1f2e', borderRadius: 8, padding: '10px 16px', fontSize: 12, fontWeight: 700, letterSpacing: 1 },
  sectionLabel: { display: 'flex', alignItems: 'center', fontSize: 11, fontWeight: 700, letterSpacing: 2, marginBottom: 12 },
  cardGrid:   { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 },
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 0', textAlign: 'center' },
};

export default PendingRequestsView;
