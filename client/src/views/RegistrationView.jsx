import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Check, X, Clock, CheckCircle, XCircle, ClipboardList, Shield, Users, TrendingUp } from 'lucide-react';

// const loggedInUser = JSON.parse(localStorage.getItem('user'));

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const rankColor = (rank) => {
  if (!rank) return '#888';
  if (rank.includes('RADIANT'))  return '#ffffa0';
  if (rank.includes('IMMORTAL')) return '#ff4655';
  if (rank.includes('DIAMOND'))  return '#a78bfa';
  if (rank.includes('PLATINUM')) return '#38bdf8';
  return '#888';
};

// BUG 3: fetch team roster to show preview on the invitation card
const useTeamPreview = (teamId) => {
  const [teamPlayers, setTeamPlayers] = useState([]);
  useEffect(() => {
    if (!teamId) return;
    fetch(`/api/teams/${teamId}/players`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
    })
      .then(r => r.json())
      .then(data => setTeamPlayers(Array.isArray(data) ? data : []))
      .catch(() => setTeamPlayers([]));
  }, [teamId]);
  return teamPlayers;
};

const RegistrationView = () => {
  const [requests, setRequests]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [feedback, setFeedback]     = useState(null);
  const [processing, setProcessing] = useState(null);
  const token = localStorage.getItem('token');

useEffect(() => {
    const fetchRequests = async () => {
      try {
        const loggedInUser = JSON.parse(localStorage.getItem('user'));
        if (!loggedInUser) return;
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/requests?playerId=${loggedInUser._id}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const data = await res.json();
        setRequests(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const showFeedback = (message, type = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleAccept = async (id, teamName) => {
    try {
      setProcessing(id);
      const res = await fetch(`/api/requests/${id}/approve`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed');
      setRequests(prev => prev.map(r => r._id === id ? { ...r, status: 'Approved' } : r));
      showFeedback(`You joined ${teamName ?? 'the team'}! Welcome aboard.`, 'success');
    } catch (err) {
      showFeedback('Something went wrong. Please try again.', 'error');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (id) => {
    try {
      setProcessing(id);
      const res = await fetch(`/api/requests/${id}/reject`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed');
      setRequests(prev => prev.map(r => r._id === id ? { ...r, status: 'Rejected' } : r));
      showFeedback('Request declined.', 'error');
    } catch (err) {
      showFeedback('Something went wrong. Please try again.', 'error');
    } finally {
      setProcessing(null);
    }
  };

  const pending  = requests.filter(r => r.status === 'Pending');
  const resolved = requests.filter(r => r.status !== 'Pending');

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.body}>

        <div style={styles.pageHeader}>
          <div>
            <h1 style={styles.title}>REGISTRATIONS</h1>
            <p style={styles.subtitle}>Team invitations sent to you by coaches</p>
          </div>
          <div style={styles.countBadge}>
            <Clock size={12} color="#f59e0b" style={{ marginRight: 5 }} />
            <span style={{ color: '#f59e0b', fontWeight: 900 }}>{pending.length}</span>
            <span style={{ color: '#555', marginLeft: 5 }}>PENDING</span>
          </div>
        </div>

        {/* Feedback toast */}
        {feedback && (
          <div style={{
            ...styles.toast,
            background: feedback.type === 'success' ? 'rgba(34,197,94,0.1)'  : 'rgba(255,70,85,0.1)',
            border:     `1px solid ${feedback.type === 'success' ? 'rgba(34,197,94,0.3)' : 'rgba(255,70,85,0.3)'}`,
            color:      feedback.type === 'success' ? '#22c55e' : '#ff4655',
          }}>
            {feedback.type === 'success'
              ? <CheckCircle size={14} style={{ marginRight: 8, flexShrink: 0 }} />
              : <XCircle    size={14} style={{ marginRight: 8, flexShrink: 0 }} />
            }
            {feedback.message}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={styles.emptyState}>
            <p style={{ color: '#444', letterSpacing: 2, fontSize: 13 }}>LOADING...</p>
          </div>
        )}

        {/* BUG 3 FIX: empty state with helpful message */}
        {!loading && requests.length === 0 && (
          <div style={styles.emptyState}>
            <ClipboardList size={52} color="#1a1f2e" />
            <p style={{ color: '#333', marginTop: 16, letterSpacing: 2, fontSize: 13, fontWeight: 700 }}>
              NO INVITATIONS YET
            </p>
            <p style={{ color: '#222', fontSize: 11, letterSpacing: 1, marginTop: 6 }}>
              When a coach sends you a team invitation, it will appear here
            </p>
          </div>
        )}

        {/* Pending invitations */}
        {!loading && pending.length > 0 && (
          <>
            <div style={styles.sectionLabel}>
              <Clock size={12} color="#f59e0b" style={{ marginRight: 7 }} />
              AWAITING YOUR RESPONSE
            </div>
            <div style={styles.cardList}>
              {pending.map(req => (
                <RequestCard
                  key={req._id}
                  req={req}
                  onAccept={() => handleAccept(req._id, req.team?.teamName)}
                  onReject={() => handleReject(req._id)}
                  processing={processing === req._id}
                />
              ))}
            </div>
          </>
        )}

        {/* History */}
        {!loading && resolved.length > 0 && (
          <>
            <div style={{ ...styles.sectionLabel, marginTop: pending.length > 0 ? 36 : 0 }}>
              HISTORY
            </div>
            <div style={styles.cardList}>
              {resolved.map(req => (
                <RequestCard
                  key={req._id}
                  req={req}
                  onAccept={null}
                  onReject={null}
                  processing={false}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// BUG 3: Team preview panel shown inside each invitation card
const TeamPreview = ({ teamId, teamName }) => {
  const players = useTeamPreview(teamId);

  const avgKd = players.length
    ? (players.reduce((s, p) => s + parseFloat(p.kdRatio ?? 0), 0) / players.length).toFixed(2)
    : '—';
  const avgWin = players.length
    ? (players.reduce((s, p) => s + parseFloat(p.winRate ?? 0), 0) / players.length).toFixed(1) + '%'
    : '—';
  const topRank = players.length
    ? players.sort((a, b) => (b.rr ?? 0) - (a.rr ?? 0))[0]?.rank ?? '—'
    : '—';

  return (
    <div style={teamPreview.wrapper}>
      <div style={teamPreview.header}>
        <Shield size={12} color="#ff4655" style={{ marginRight: 6 }} />
        <span style={{ fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 2 }}>TEAM PREVIEW</span>
      </div>

      <div style={teamPreview.stats}>
        <div style={teamPreview.statItem}>
          <div style={teamPreview.statVal}>{players.length}</div>
          <div style={teamPreview.statLbl}>PLAYERS</div>
        </div>
        <div style={teamPreview.statItem}>
          <div style={teamPreview.statVal}>{avgKd}</div>
          <div style={teamPreview.statLbl}>AVG K/D</div>
        </div>
        <div style={teamPreview.statItem}>
          <div style={teamPreview.statVal}>{avgWin}</div>
          <div style={teamPreview.statLbl}>AVG WIN%</div>
        </div>
        <div style={teamPreview.statItem}>
          <div style={{ ...teamPreview.statVal, fontSize: 11, color: rankColor(topRank) }}>{topRank}</div>
          <div style={teamPreview.statLbl}>TOP RANK</div>
        </div>
      </div>

      {players.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
          {players.slice(0, 5).map(p => (
            <div key={p._id} style={teamPreview.playerPill}>
              <img
                src={p.imageURL || '/default-avatar.png'}
                style={{ width: 16, height: 16, borderRadius: '50%', objectFit: 'cover', marginRight: 5 }}
                onError={e => { e.target.onerror = null; e.target.src = '/default-avatar.png'; }}
              />
              <span style={{ fontSize: 11, color: '#aaa' }}>{p.username}</span>
            </div>
          ))}
          {players.length > 5 && (
            <div style={{ ...teamPreview.playerPill, color: '#555' }}>+{players.length - 5} more</div>
          )}
        </div>
      )}

      {players.length === 0 && (
        <p style={{ fontSize: 11, color: '#333', marginTop: 8, letterSpacing: 1 }}>
          No players on roster yet — be the first to join!
        </p>
      )}
    </div>
  );
};

const teamPreview = {
  wrapper: { background: 'rgba(255,70,85,0.04)', border: '1px solid rgba(255,70,85,0.12)', borderRadius: 8, padding: '14px 16px', marginTop: 12 },
  header: { display: 'flex', alignItems: 'center', marginBottom: 10 },
  stats: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 },
  statItem: { textAlign: 'center', background: '#0a0d14', borderRadius: 6, padding: '8px 4px' },
  statVal: { fontSize: 14, fontWeight: 900, color: '#fff' },
  statLbl: { fontSize: 9, color: '#555', letterSpacing: 1, marginTop: 2, fontWeight: 700 },
  playerPill: { display: 'inline-flex', alignItems: 'center', background: '#0f1117', border: '1px solid #1a1f2e', borderRadius: 4, padding: '3px 8px', fontSize: 11 },
};

// Individual request card
const RequestCard = ({ req, onAccept, onReject, processing }) => {
  const isPending  = req.status === 'Pending';
  const isApproved = req.status === 'Approved';
  const isRejected = req.status === 'Rejected';

  const statusCfg = isApproved
    ? { bg: 'rgba(34,197,94,0.1)',   border: 'rgba(34,197,94,0.3)',   color: '#22c55e', icon: <CheckCircle size={11} style={{ marginRight: 4 }} /> }
    : isRejected
    ? { bg: 'rgba(255,70,85,0.1)',   border: 'rgba(255,70,85,0.3)',   color: '#ff4655', icon: <XCircle    size={11} style={{ marginRight: 4 }} /> }
    : { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', color: '#f59e0b', icon: <Clock       size={11} style={{ marginRight: 4 }} /> };

  return (
    <div style={{
      ...card.wrapper,
      borderColor: isPending ? 'rgba(245,158,11,0.25)' : '#1a1f2e',
    }}>
      {/* Top row: coach / team / date / status + actions */}
      <div style={card.inner}>
        <div style={card.col}>
          <div style={card.colValue}>{req.coach?.username ?? '—'}</div>
          <div style={card.colLabel}>COACH</div>
        </div>
        <div style={card.divider} />
        <div style={card.col}>
          <div style={{ ...card.colValue, color: '#ff4655' }}>{req.team?.teamName ?? '—'}</div>
          <div style={card.colLabel}>TEAM</div>
        </div>
        <div style={card.divider} />
        <div style={card.col}>
          <div style={card.colValue}>{formatDate(req.date)}</div>
          <div style={card.colLabel}>DATE SENT</div>
        </div>

        <div style={card.right}>
          <div style={{
            ...card.statusBadge,
            background: statusCfg.bg,
            border:     `1px solid ${statusCfg.border}`,
            color:      statusCfg.color,
          }}>
            {statusCfg.icon}
            {req.status.toUpperCase()}
          </div>

          {isPending && onAccept && (
            <div style={card.actions}>
              <button
                style={{ ...card.btn, ...card.acceptBtn, opacity: processing ? 0.5 : 1 }}
                onClick={onAccept}
                disabled={processing}
              >
                <Check size={13} style={{ marginRight: 5 }} />
                {processing ? 'PROCESSING...' : 'ACCEPT'}
              </button>
              <button
                style={{ ...card.btn, ...card.declineBtn, opacity: processing ? 0.5 : 1 }}
                onClick={onReject}
                disabled={processing}
              >
                <X size={13} style={{ marginRight: 5 }} />
                DECLINE
              </button>
            </div>
          )}

          {isApproved && (
            <span style={{ fontSize: 11, color: '#22c55e', letterSpacing: 1, fontWeight: 700 }}>
              ✓ You joined this team
            </span>
          )}

          {isRejected && (
            <span style={{ fontSize: 11, color: '#555', letterSpacing: 1 }}>
              You declined this invitation
            </span>
          )}
        </div>
      </div>

      {/* BUG 3 FIX: team preview shown for pending and approved invitations */}
      {(isPending || isApproved) && req.team?._id && (
        <TeamPreview teamId={req.team._id} teamName={req.team.teamName} />
      )}
    </div>
  );
};

const card = {
  wrapper: { background: '#0f1117', border: '1px solid', borderRadius: 10, padding: '18px 24px', transition: 'border-color 0.2s' },
  inner: { display: 'flex', alignItems: 'center', gap: 0, flexWrap: 'wrap', rowGap: 12 },
  col: { flex: 1, minWidth: 100, padding: '0 20px' },
  colValue: { fontSize: 15, fontWeight: 900, color: '#fff', letterSpacing: 1 },
  colLabel: { fontSize: 9, color: '#444', letterSpacing: 2, marginTop: 4, fontWeight: 700 },
  divider: { width: 1, height: 32, background: '#1a1f2e', flexShrink: 0 },
  right: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, marginLeft: 'auto', paddingLeft: 24, flexShrink: 0 },
  statusBadge: { display: 'inline-flex', alignItems: 'center', borderRadius: 4, padding: '4px 10px', fontSize: 10, fontWeight: 700, letterSpacing: 1 },
  actions: { display: 'flex', gap: 8 },
  btn: { display: 'inline-flex', alignItems: 'center', borderRadius: 5, padding: '7px 14px', fontSize: 11, fontWeight: 700, letterSpacing: 1, cursor: 'pointer', fontFamily: "'Barlow Condensed', sans-serif", transition: 'opacity 0.15s' },
  acceptBtn:  { background: 'rgba(34,197,94,0.12)',  border: '1px solid rgba(34,197,94,0.35)',  color: '#22c55e' },
  declineBtn: { background: 'rgba(255,70,85,0.08)',  border: '1px solid rgba(255,70,85,0.25)',  color: '#ff4655' },
};

const styles = {
  page: { minHeight: '100vh', backgroundColor: '#0a0d14', fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif", color: '#ccc' },
  body: { padding: '32px 40px' },
  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 },
  title: { fontSize: 30, fontWeight: 900, color: '#fff', letterSpacing: 4, margin: '0 0 4px' },
  subtitle: { fontSize: 12, color: '#444', letterSpacing: 1, margin: 0 },
  countBadge: { display: 'flex', alignItems: 'center', background: '#0f1117', border: '1px solid #1a1f2e', borderRadius: 8, padding: '10px 16px', fontSize: 12, fontWeight: 700, letterSpacing: 1 },
  toast: { display: 'flex', alignItems: 'center', borderRadius: 8, padding: '12px 18px', fontSize: 13, fontWeight: 700, letterSpacing: 1, marginBottom: 20 },
  sectionLabel: { display: 'flex', alignItems: 'center', fontSize: 11, fontWeight: 700, color: '#555', letterSpacing: 2, marginBottom: 10 },
  cardList: { display: 'flex', flexDirection: 'column', gap: 8 },
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 0', textAlign: 'center' },
};

export default RegistrationView;
