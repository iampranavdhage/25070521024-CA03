import React from 'react';
import { Link } from 'react-router-dom';
import StickyStackSection from '../components/StickyStackSection';
import {
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Database,
  Sparkles,
  BookMarked,
  Clock,
  Compass,
} from 'lucide-react';

export const LandingPage = () => {
  const stickyCards = [
    {
      id: 'curriculum',
      badge: 'ARCHIVES',
      category: 'ARTICLE 01 // HIERARCHY',
      title: 'Curriculum, Course & Knowledge Architecture',
      description:
        'Relate semester degree programs to individual subject units and note repositories. Organize lectures, syllabus modules, and examination materials with relational MongoDB document integrity.',
      accentColor: '#1c1917',
      stats: [
        { value: '100%', label: 'Student Data Isolation' },
        { value: 'RESTful', label: 'Local API Endpoints' },
        { value: 'Relational', label: 'Mongoose Integrity' },
      ],
      codeSnippetTitle: 'SCHEMA SPECIMEN // DEGREE.COURSE.NOTE',
      previewContent: (
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.78rem', color: '#57534e' }}>
          <p><span style={{ color: '#c2410c' }}>const</span> Course = &#123; code: <span style={{ color: '#166534' }}>"CS301"</span>, name: <span style={{ color: '#166534' }}>"Algorithms &amp; Data Structures"</span> &#125;;</p>
          <p><span style={{ color: '#c2410c' }}>const</span> Subject = &#123; courseId: Course._id, credits: <span style={{ color: '#b45309' }}>4</span> &#125;;</p>
          <p><span style={{ color: '#c2410c' }}>const</span> Note = &#123; subjectId: Subject._id, tags: [<span style={{ color: '#1d4ed8' }}>"asymptotics"</span>, <span style={{ color: '#1d4ed8' }}>"graphs"</span>] &#125;;</p>
          <div style={{ marginTop: '14px', padding: '8px 12px', background: '#f5f4ef', border: '1px solid #e7e5e4', borderRadius: '4px', color: '#44403c', fontSize: '0.74rem' }}>
            ✓ Verified with MongoDB Compass at mongodb://127.0.0.1:27017/unstop_db
          </div>
        </div>
      ),
    },
    {
      id: 'focus',
      badge: 'SPRINTS',
      category: 'ARTICLE 02 // FOCUS CONSOLE',
      title: 'Synthesized Pomodoro & Deep Study Sprints',
      description:
        'Configurable 25-minute deep focus sprints utilizing the HTML5 Web Audio API for harmonic chime alerts. All completed sessions automatically record study telemetry directly into your local database.',
      accentColor: '#c2410c',
      stats: [
        { value: '25m', label: 'Default Study Sprint' },
        { value: 'Offline', label: 'Harmonic Web Audio' },
        { value: 'Zero', label: 'External Cloud APIs' },
      ],
      codeSnippetTitle: 'TELEMETRY // STUDY_SESSION_RECORD',
      previewContent: (
        <div style={{ textAlign: 'center', padding: '8px 0' }}>
          <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100px', height: '100px', borderRadius: '50%', border: '2px solid #1c1917', background: '#ffffff', margin: '0 auto 8px', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
            <span style={{ fontFamily: 'Newsreader, Georgia, serif', fontSize: '1.9rem', fontWeight: 500, color: '#1c1917' }}>25:00</span>
            <span style={{ fontSize: '0.62rem', color: '#78716c', textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: 'JetBrains Mono' }}>SPRINT</span>
          </div>
          <p style={{ fontSize: '0.74rem', color: '#78716c', fontFamily: 'Plus Jakarta Sans' }}>Completed sessions automatically aggregate into weekly analytics</p>
        </div>
      ),
    },
    {
      id: 'habits',
      badge: 'STREAKS',
      category: 'ARTICLE 03 // DISCIPLINE',
      title: 'Mathematical Habit Engine & 30-Day Matrix',
      description:
        'Cultivate intellectual habits such as daily revision, problem sets, and reading. Continuity streaks are calculated mathematically from date-stamped completion records rather than volatile state.',
      accentColor: '#15803d',
      stats: [
        { value: '30-Day', label: 'Visual Check-in Grid' },
        { value: 'Computed', label: 'Mathematical Streaks' },
        { value: 'Persistent', label: 'Local Mongoose Records' },
      ],
      codeSnippetTitle: 'CONTINUITY // 30_DAY_CALENDAR',
      previewContent: (
        <div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center', padding: '8px 0' }}>
            {Array.from({ length: 30 }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: '14px',
                  height: '14px',
                  borderRadius: '2px',
                  background: i % 3 === 0 ? '#15803d' : i % 2 === 0 ? '#86efac' : '#e7e5e4',
                  border: '1px solid rgba(0,0,0,0.04)',
                }}
              />
            ))}
          </div>
          <p style={{ textAlign: 'center', fontSize: '0.72rem', color: '#78716c', marginTop: '6px' }}>
            Daily check-in matrix stored reliably in HabitCompletions
          </p>
        </div>
      ),
    },
    {
      id: 'analytics',
      badge: 'METRICS',
      category: 'ARTICLE 04 // EFFICIENCY',
      title: 'Academic Efficiency & Telemetry Index',
      description:
        'Aggregate weekly study hours, subject knowledge density, and compute an overall Productivity Score derived from task completion velocity and study discipline.',
      accentColor: '#1d4ed8',
      stats: [
        { value: '0 - 100', label: 'Productivity Index' },
        { value: '7-Day', label: 'Weekly Study Curve' },
        { value: 'Direct', label: 'Compass Inspectable' },
      ],
      codeSnippetTitle: 'ANALYTICS // EFFICIENCY_LEDGER',
      previewContent: (
        <div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '60px', padding: '0 8px', borderBottom: '1px solid #e7e5e4' }}>
            {[35, 60, 45, 80, 55, 95, 75].map((h, i) => (
              <div
                key={i}
                style={{
                  width: '18px',
                  height: `${h}%`,
                  background: '#1c1917',
                  borderRadius: '2px 2px 0 0',
                }}
              />
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', color: '#8c827a', marginTop: '4px', fontFamily: 'JetBrains Mono' }}>
            <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'transparent', color: '#1c1917', position: 'relative', zIndex: 10 }}>
      {/* Editorial Masthead Ribbon */}
      <div className="editorial-masthead-ribbon">
        <span>THE ACADEMIC MONOGRAPH</span>
        <span>·</span>
        <span>ISSUE NO. 24</span>
        <span>·</span>
        <span>UNSTOP EDITORIAL OS</span>
        <span>·</span>
        <span>LOCAL MONGODB COMPASS 27017</span>
        <span>·</span>
        <span>ZERO EXTERNAL APIS</span>
      </div>

      {/* Top Editorial Header */}
      <header
        style={{
          padding: '20px 48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #e7e5e4',
          background: 'rgba(250, 248, 245, 0.94)',
          backdropFilter: 'blur(16px)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '6px',
              background: '#1c1917',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <BookMarked size={18} />
          </div>
          <div>
            <span
              style={{
                fontFamily: 'Newsreader, Georgia, serif',
                fontSize: '1.45rem',
                fontWeight: 600,
                letterSpacing: '-0.02em',
                color: '#1c1917',
              }}
            >
              UNSTOP
            </span>
            <span
              style={{
                marginLeft: '8px',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '0.65rem',
                color: '#8c827a',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Vol. 2026
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <Link to="/login" className="editorial-btn-outline" style={{ padding: '8px 18px', fontSize: '0.85rem' }}>
            Sign In
          </Link>
          <Link to="/signup" className="editorial-btn-primary" style={{ padding: '8px 20px', fontSize: '0.85rem' }}>
            Register Student
            <ArrowRight size={14} />
          </Link>
        </div>
      </header>

      {/* Hero Section with Clear Editorial Text Hierarchy */}
      <section
        style={{
          padding: '80px 32px 50px',
          maxWidth: '1100px',
          margin: '0 auto',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        <div style={{ marginBottom: '24px' }}>
          <span className="editorial-kicker">
            <span>[ DISPATCH // 01 ]</span>
            <span>·</span>
            <span>THE STUDENT ACADEMIC &amp; PRODUCTIVITY MONOGRAPH</span>
          </span>
        </div>

        <h1 className="editorial-headline" style={{ marginBottom: '24px' }}>
          The Digital Almanac of Scholarship, <br />
          <span style={{ fontStyle: 'italic', fontWeight: 400 }}>Academic Rigor &amp; Discipline.</span>
        </h1>

        <p
          className="editorial-deck"
          style={{
            maxWidth: '740px',
            margin: '0 auto 40px',
          }}
        >
          A minimal, editorial-grade academic workspace. Designed with meticulous typographic hierarchy, structured lecture archives, Pomodoro focus telemetry, and mathematically verified habit continuity.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap', marginBottom: '80px' }}>
          <Link to="/signup" className="editorial-btn-primary" style={{ padding: '12px 28px', fontSize: '0.95rem' }}>
            Create Student Dossier
            <ArrowRight size={16} />
          </Link>
          <Link to="/login" className="editorial-btn-outline" style={{ padding: '12px 24px', fontSize: '0.95rem' }}>
            Access Campus Ledger
          </Link>
        </div>

        {/* Editorial Section Divider with Stacking Scroll Hint */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid #1c1917',
            borderBottom: '1px solid #e7e5e4',
            padding: '12px 0',
            marginBottom: '48px',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '0.72rem',
            color: '#78716c',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}
        >
          <span>EXHIBIT I · THE MODULAR FOLIO</span>
          <span style={{ color: '#1c1917', fontWeight: 600 }}>SCROLL DOWN TO FLIP STACKED PAGES ↓</span>
        </div>

        {/* STICKY DOSSIER SHEET SCROLL ANIMATION */}
        <StickyStackSection items={stickyCards} />
      </section>

      {/* Editorial Principles Matrix */}
      <section
        style={{
          maxWidth: '1100px',
          margin: '40px auto 80px',
          padding: '0 32px',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px',
          }}
        >
          <div className="editorial-card" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
              <span className="editorial-tag">RECORD 01 // COMPASS</span>
              <Database size={18} color="#78716c" />
            </div>
            <h4 style={{ fontFamily: 'Newsreader, Georgia, serif', fontSize: '1.35rem', fontWeight: 500, marginBottom: '8px' }}>
              MongoDB Compass Native
            </h4>
            <p style={{ fontSize: '0.88rem', color: '#57534e', lineHeight: 1.6 }}>
              All 10 collections persist on your local Community Server at <code>mongodb://127.0.0.1:27017/unstop_db</code>, inspectable natively via Compass.
            </p>
          </div>

          <div className="editorial-card" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
              <span className="editorial-tag">RECORD 02 // SOVEREIGN</span>
              <ShieldCheck size={18} color="#78716c" />
            </div>
            <h4 style={{ fontFamily: 'Newsreader, Georgia, serif', fontSize: '1.35rem', fontWeight: 500, marginBottom: '8px' }}>
              Zero Cloud Dependencies
            </h4>
            <p style={{ fontSize: '0.88rem', color: '#57534e', lineHeight: 1.6 }}>
              Free from third-party auth vendors, tracking scripts, or external APIs. Complete data sovereignty stored entirely within your environment.
            </p>
          </div>

          <div className="editorial-card" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
              <span className="editorial-tag">RECORD 03 // EDITORIAL</span>
              <Compass size={18} color="#78716c" />
            </div>
            <h4 style={{ fontFamily: 'Newsreader, Georgia, serif', fontSize: '1.35rem', fontWeight: 500, marginBottom: '8px' }}>
              Deliberate Text Hierarchy
            </h4>
            <p style={{ fontSize: '0.88rem', color: '#57534e', lineHeight: 1.6 }}>
              Minimal light palette, literary serif typography, hairline borders, and tactile sticky dossier scroll physics.
            </p>
          </div>
        </div>
      </section>

      {/* Editorial Colophon / Footer */}
      <footer
        style={{
          borderTop: '1px solid #e7e5e4',
          background: '#f7f5f0',
          padding: '36px 32px',
          textAlign: 'center',
          color: '#78716c',
          fontSize: '0.8rem',
          fontFamily: 'JetBrains Mono, monospace',
        }}
      >
        <p>UNSTOP · Student Academic &amp; Productivity System · Editorial Monograph Edition · Local Database 27017</p>
      </footer>
    </div>
  );
};

export default LandingPage;
