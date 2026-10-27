import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  BarChart3,
  TrendingUp,
  Award,
  Clock,
  CheckSquare,
  Flame,
  BookOpen,
  FolderKanban,
  FileText,
  Calendar,
} from 'lucide-react';

export const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/analytics/metrics');
      if (res.success) {
        setAnalytics(res);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const metrics = analytics?.metrics || {
    totalCourses: 0,
    totalSubjects: 0,
    totalNotes: 0,
    totalTasks: 0,
    completedTasks: 0,
    totalStudyHours: 0,
    totalFocusSessions: 0,
    activeHabits: 0,
    totalHabitCheckins: 0,
    productivityScore: 0,
  };

  const chart = analytics?.weeklyStudyChart || [];
  const maxHours = Math.max(...chart.map((d) => d.hours || 0), 4);

  return (
    <div className="page-wrapper">
      {/* Editorial Kicker */}
      <div style={{ marginBottom: '8px' }}>
        <span className="editorial-kicker">
          [ CHAPTER 09 // PERFORMANCE TELEMETRY ]
        </span>
      </div>

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontFamily: 'Newsreader, Georgia, serif', fontSize: '2.3rem', fontWeight: 500, letterSpacing: '-0.025em', color: '#1c1917' }}>
          Academic Telemetry &amp; Analytics
        </h2>
        <p style={{ color: '#57534e', fontSize: '0.9rem', fontFamily: 'Plus Jakarta Sans' }}>
          Real-time aggregated metrics and productivity score computed directly from MongoDB collections
        </p>
      </div>

      {/* Hero Productivity Score Panel */}
      <div
        className="editorial-card"
        style={{
          padding: '32px',
          marginBottom: '28px',
          background: '#ffffff',
          border: '1px solid #e7e5e4',
          borderRadius: '8px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px',
          boxShadow: '0 4px 16px rgba(28,25,23,0.04)',
        }}
      >
        <div>
          <span className="editorial-tag" style={{ marginBottom: '10px' }}>
            ACADEMIC EFFICIENCY INDEX
          </span>
          <h3 style={{ fontFamily: 'Newsreader, Georgia, serif', fontSize: '1.9rem', fontWeight: 500, marginTop: '8px', color: '#1c1917' }}>
            Productivity Score: <span style={{ fontStyle: 'italic', color: '#c2410c' }}>{metrics.productivityScore} / 100</span>
          </h3>
          <p style={{ color: '#57534e', fontSize: '0.9rem', maxWidth: '540px', marginTop: '6px', fontFamily: 'Plus Jakarta Sans' }}>
            Calculated algorithmically from task completion rates ({metrics.completedTasks}/{metrics.totalTasks}), habit streak continuity ({metrics.totalHabitCheckins} check-ins), and deep study hours ({metrics.totalStudyHours}h).
          </p>
        </div>

        {/* Circular Progress Gauge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div
            style={{
              width: '110px',
              height: '110px',
              borderRadius: '50%',
              background: `conic-gradient(#1c1917 ${metrics.productivityScore * 3.6}deg, #e7e5e4 0deg)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}
          >
            <div
              style={{
                width: '84px',
                height: '84px',
                borderRadius: '50%',
                background: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'Newsreader, serif',
                fontStyle: 'italic',
                fontSize: '1.5rem',
                fontWeight: 600,
                color: '#1c1917',
              }}
            >
              {metrics.productivityScore}%
            </div>
          </div>
        </div>
      </div>

      {/* Grid: 7-Day Study Hours Chart & Priority Distribution */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px', marginBottom: '28px' }}>
        {/* Weekly Study Hours Bar Chart */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={18} color="#06b6d4" /> Study Hours Over Past 7 Days
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '24px' }}>
            Daily minutes recorded from completed Pomodoro and focus sessions
          </p>

          {/* SVG/CSS Bar Chart */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              height: '180px',
              padding: '0 10px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            {chart.map((item) => {
              const heightPct = Math.min(100, Math.round(((item.hours || 0) / maxHours) * 100));
              return (
                <div
                  key={item.date}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    flex: 1,
                  }}
                >
                  <span style={{ fontSize: '0.72rem', color: '#c084fc', fontWeight: 600 }}>
                    {item.hours > 0 ? `${item.hours}h` : ''}
                  </span>
                  <div
                    title={`${item.date}: ${item.hours} hours (${item.minutes} mins)`}
                    style={{
                      width: '28px',
                      height: `${Math.max(6, heightPct)}%`,
                      borderRadius: '6px 6px 0 0',
                      background: item.hours > 0 ? 'linear-gradient(180deg, #a855f7 0%, #06b6d4 100%)' : 'rgba(255, 255, 255, 0.05)',
                      boxShadow: item.hours > 0 ? '0 0 12px rgba(168, 85, 247, 0.4)' : 'none',
                      transition: 'height 0.4s ease',
                    }}
                  />
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '6px' }}>{item.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Subject-Wise Notes & Tasks Distribution */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FolderKanban size={18} color="#ec4899" /> Subject Knowledge Density
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '20px' }}>
            Total notes filed across each registered academic subject
          </p>

          {analytics?.subjectBreakdown?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {analytics.subjectBreakdown.map((subj) => {
                const totalNotes = metrics.totalNotes || 1;
                const pct = Math.round((subj.notesCount / totalNotes) * 100);
                return (
                  <div key={subj.code}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                      <span style={{ color: '#ffffff', fontWeight: 600 }}>{subj.code} — {subj.name}</span>
                      <span style={{ color: subj.color || '#22d3ee', fontWeight: 700 }}>{subj.notesCount} notes ({pct}%)</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${pct}%`,
                          height: '100%',
                          background: subj.color || '#06b6d4',
                          borderRadius: '3px',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ color: '#64748b', fontSize: '0.88rem', padding: '30px 0', textAlign: 'center' }}>
              Add subjects and write notes to see curriculum density charts!
            </p>
          )}
        </div>
      </div>

      {/* Aggregate Counts Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div className="glass-panel" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Courses Configured</span>
          <h4 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>
            {metrics.totalCourses}
          </h4>
        </div>
        <div className="glass-panel" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Subjects Enrolled</span>
          <h4 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>
            {metrics.totalSubjects}
          </h4>
        </div>
        <div className="glass-panel" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Total Notes Written</span>
          <h4 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>
            {metrics.totalNotes}
          </h4>
        </div>
        <div className="glass-panel" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Focus Sprints Completed</span>
          <h4 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>
            {metrics.totalFocusSessions}
          </h4>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
