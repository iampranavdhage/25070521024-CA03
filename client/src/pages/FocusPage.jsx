import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  Volume2,
  VolumeX,
  Clock,
  Sparkles,
  BookOpen,
} from 'lucide-react';

export const FocusPage = () => {
  // Timer modes
  const MODES = {
    FOCUS: { label: 'Focus Sprint', minutes: 25, color: '#a855f7' },
    SHORT_BREAK: { label: 'Short Break', minutes: 5, color: '#06b6d4' },
    LONG_BREAK: { label: 'Long Break', minutes: 15, color: '#ec4899' },
  };

  const [mode, setMode] = useState('FOCUS');
  const [timeLeft, setTimeLeft] = useState(MODES.FOCUS.minutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Subject selector & stats
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [sessionNotes, setSessionNotes] = useState('');
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalMinutes: 0,
    totalHours: 0,
    todayMinutes: 0,
    recentHistory: [],
  });
  const [saving, setSaving] = useState(false);

  const timerRef = useRef(null);

  useEffect(() => {
    fetchMetadata();
    fetchStats();
    return () => clearInterval(timerRef.current);
  }, []);

  const fetchMetadata = async () => {
    try {
      const res = await api.get('/api/subjects');
      if (res.success && res.subjects.length > 0) {
        setSubjects(res.subjects);
        setSelectedSubjectId(res.subjects[0]._id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get('/api/focus/stats');
      if (res.success) {
        setStats(res);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Local Web Audio Chime (100% offline, zero external APIs)
  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.3); // A5

      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 1.2);
    } catch (e) {
      console.error('Audio chime error:', e);
    }
  };

  // Timer Tick
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning, mode]);

  // Session completion handler
  const handleSessionComplete = async () => {
    playChime();

    if (mode === 'FOCUS') {
      try {
        setSaving(true);
        await api.post('/api/focus/record', {
          subjectId: selectedSubjectId || null,
          durationMinutes: MODES.FOCUS.minutes,
          sessionType: 'pomodoro',
          notes: sessionNotes || 'Focused Pomodoro study session',
        });
        alert('🎉 Focus session completed! Saved directly into MongoDB.');
        fetchStats();
      } catch (err) {
        console.error(err);
      } finally {
        setSaving(false);
      }
    } else {
      alert('Break time over! Ready for your next focus session?');
    }
  };

  const switchMode = (newMode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(MODES[newMode].minutes * 60);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(MODES[mode].minutes * 60);
  };

  // Format MM:SS
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const currentSubject = subjects.find((s) => s._id === selectedSubjectId);

  return (
    <div className="page-wrapper">
      {/* Editorial Kicker */}
      <div style={{ marginBottom: '8px' }}>
        <span className="editorial-kicker">
          [ CHAPTER 06 // DEEP FOCUS PROTOCOL ]
        </span>
      </div>

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontFamily: 'Newsreader, Georgia, serif', fontSize: '2.3rem', fontWeight: 500, letterSpacing: '-0.025em', color: '#1c1917' }}>
          Deep Focus &amp; Sprint Console
        </h2>
        <p style={{ color: '#57534e', fontSize: '0.9rem', fontFamily: 'Plus Jakarta Sans' }}>
          Deep study sprints with harmonic chimes and automatic local MongoDB telemetry recording
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px' }}>
        {/* Left Timer Console */}
        <div
          className="glass-panel"
          style={{
            padding: '36px 30px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            border: `1px solid ${MODES[mode].color}44`,
            boxShadow: `0 0 40px ${MODES[mode].color}22`,
          }}
        >
          {/* Mode Switcher Tabs */}
          <div
            style={{
              display: 'flex',
              gap: '8px',
              background: 'rgba(10, 10, 20, 0.6)',
              padding: '6px',
              borderRadius: '9999px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              marginBottom: '32px',
            }}
          >
            {Object.entries(MODES).map(([key, config]) => (
              <button
                key={key}
                onClick={() => switchMode(key)}
                style={{
                  background: mode === key ? config.color : 'transparent',
                  color: mode === key ? '#ffffff' : '#94a3b8',
                  border: 'none',
                  borderRadius: '9999px',
                  padding: '8px 18px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {config.label} ({config.minutes}m)
              </button>
            ))}
          </div>

          {/* Glowing Timer Circle */}
          <div
            style={{
              width: '240px',
              height: '240px',
              borderRadius: '50%',
              border: `4px solid ${MODES[mode].color}`,
              boxShadow: `0 0 35px ${MODES[mode].color}44, inset 0 0 30px ${MODES[mode].color}22`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '32px',
              position: 'relative',
            }}
          >
            <span
              style={{
                fontFamily: 'Space Grotesk, monospace',
                fontSize: '3.8rem',
                fontWeight: 800,
                color: '#ffffff',
                letterSpacing: '-0.02em',
              }}
            >
              {timeFormatted}
            </span>
            <span style={{ fontSize: '0.85rem', color: MODES[mode].color, fontWeight: 600, textTransform: 'uppercase' }}>
              {MODES[mode].label}
            </span>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '28px' }}>
            <button
              onClick={() => setIsRunning(!isRunning)}
              className="btn-y2k-primary"
              style={{
                padding: '12px 28px',
                fontSize: '1.05rem',
                background: isRunning ? 'rgba(239, 68, 68, 0.2)' : undefined,
                borderColor: isRunning ? '#ef4444' : undefined,
              }}
            >
              {isRunning ? <Pause size={20} /> : <Play size={20} />}
              <span>{isRunning ? 'Pause' : 'Start Focus'}</span>
            </button>

            <button
              onClick={handleReset}
              className="btn-y2k-outline"
              style={{ padding: '12px 20px', borderRadius: '12px' }}
              title="Reset Timer"
            >
              <RotateCcw size={18} />
            </button>

            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="btn-y2k-outline"
              style={{ padding: '12px 16px', borderRadius: '12px', color: soundEnabled ? '#22d3ee' : '#64748b' }}
              title={soundEnabled ? 'Chime sound on' : 'Chime sound muted'}
            >
              {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
          </div>

          {/* Subject & Goal configuration */}
          <div style={{ width: '100%', maxWidth: '380px', textAlign: 'left' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', color: '#cbd5e1', marginBottom: '6px' }}>
              Select Studying Subject:
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="input-y2k"
              style={{ marginBottom: '12px' }}
            >
              <option value="">-- General Study Sprint --</option>
              {subjects.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.subjectCode} — {s.subjectName}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="What are you focusing on this sprint?"
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
              className="input-y2k"
            />
          </div>
        </div>

        {/* Right Stats & History Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Metrics summary */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '14px',
            }}
          >
            <div className="glass-panel" style={{ padding: '16px' }}>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Total Sprints</span>
              <h4 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#c084fc' }}>
                {stats.totalSessions}
              </h4>
            </div>

            <div className="glass-panel" style={{ padding: '16px' }}>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Total Study Hours</span>
              <h4 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#06b6d4' }}>
                {stats.totalHours}h
              </h4>
            </div>

            <div className="glass-panel" style={{ padding: '16px' }}>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Today's Focus</span>
              <h4 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10b981' }}>
                {stats.todayMinutes}m
              </h4>
            </div>
          </div>

          {/* History stream */}
          <div className="glass-panel" style={{ padding: '24px', flex: 1 }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={18} color="#06b6d4" />
              Completed Session History (MongoDB)
            </h3>

            {stats.recentHistory?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {stats.recentHistory.map((s) => (
                  <div
                    key={s._id}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '10px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <h5 style={{ fontSize: '0.9rem', color: '#ffffff', fontWeight: 600 }}>{s.title}</h5>
                      <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        {new Date(s.createdAt).toLocaleDateString()} at{' '}
                        {new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {s.notes && ` • ${s.notes}`}
                      </p>
                    </div>
                    <span className="badge-y2k badge-purple" style={{ fontSize: '0.72rem' }}>
                      {s.durationMinutes} mins
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#64748b', fontSize: '0.88rem', textAlign: 'center', padding: '30px 0' }}>
                Complete a 25-minute Pomodoro focus block to log your first session!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FocusPage;
