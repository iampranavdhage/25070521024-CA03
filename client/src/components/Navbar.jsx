import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Calendar, GraduationCap, Clock } from 'lucide-react';

const routeTitles = {
  '/dashboard': 'Chapter 01 · Academic Ledger & Summary',
  '/courses': 'Chapter 02 · Curriculum & Degree Programs',
  '/subjects': 'Chapter 03 · Academic Subject Directory',
  '/notes': 'Chapter 04 · Knowledge Repository & Notes',
  '/tasks': 'Chapter 05 · Academic Tasks & Deliverables',
  '/planner': 'Chapter 06 · Timetable & Study Schedule',
  '/focus': 'Chapter 07 · Deep Focus & Sprint Console',
  '/habits': 'Chapter 08 · Habit Continuity & Streaks',
  '/analytics': 'Chapter 09 · Performance Telemetry',
  '/history': 'Chapter 10 · Audit Log & Activity History',
  '/profile': 'Chapter 11 · Student Dossier & Settings',
};

export const Navbar = () => {
  const location = useLocation();
  const { user } = useAuth();

  const title = routeTitles[location.pathname] || 'Academic Dossier';

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <header
      style={{
        height: '68px',
        background: 'rgba(255, 255, 255, 0.94)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid #e7e5e4',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 36px',
        position: 'sticky',
        top: 0,
        zIndex: 30,
      }}
    >
      <div>
        <h1
          style={{
            fontFamily: 'Newsreader, Georgia, serif',
            fontSize: '1.35rem',
            fontWeight: 500,
            margin: 0,
            letterSpacing: '-0.02em',
            color: '#1c1917',
          }}
        >
          {title}
        </h1>
        <p
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.68rem',
            color: '#8c827a',
            margin: '2px 0 0 0',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          {user?.collegeName ? `${user.collegeName} · ${user.courseDegree || ''} ${user.branchDept || ''}` : 'UNSTOP ACADEMIC PUBLICATION'}
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Date stamp in editorial pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: '#faf8f5',
            border: '1px solid #e7e5e4',
            padding: '5px 12px',
            borderRadius: '4px',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.72rem',
            color: '#78716c',
          }}
        >
          <Calendar size={13} color="#78716c" />
          <span>{todayStr}</span>
        </div>

        {/* Academic year badge */}
        {user?.academicYear && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#fff7ed',
              border: '1px solid #fed7aa',
              padding: '5px 12px',
              borderRadius: '4px',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.72rem',
              color: '#c2410c',
              fontWeight: 600,
            }}
          >
            <GraduationCap size={14} color="#c2410c" />
            <span>{user.academicYear}</span>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
