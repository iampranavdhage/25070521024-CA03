import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  FolderKanban,
  FileText,
  CheckSquare,
  Calendar,
  Timer,
  Flame,
  BarChart3,
  History,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  BookMarked,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', num: '01', icon: LayoutDashboard },
  { path: '/courses', label: 'Courses & Degree', num: '02', icon: BookOpen },
  { path: '/subjects', label: 'Subject Units', num: '03', icon: FolderKanban },
  { path: '/notes', label: 'Knowledge Notes', num: '04', icon: FileText },
  { path: '/tasks', label: 'Tasks & Deadlines', num: '05', icon: CheckSquare },
  { path: '/planner', label: 'Timetable Planner', num: '06', icon: Calendar },
  { path: '/focus', label: 'Focus Sprints', num: '07', icon: Timer },
  { path: '/habits', label: 'Daily Habits', num: '08', icon: Flame },
  { path: '/analytics', label: 'Analytics Index', num: '09', icon: BarChart3 },
  { path: '/history', label: 'Audit History', num: '10', icon: History },
  { path: '/profile', label: 'Profile & Settings', num: '11', icon: User },
];

export const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside
      style={{
        width: collapsed ? '74px' : '264px',
        minWidth: collapsed ? '74px' : '264px',
        transition: 'width 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        background: '#ffffff',
        borderRight: '1px solid #e7e5e4',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}
    >
      {/* Editorial Masthead Header */}
      <div
        style={{
          padding: '20px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          borderBottom: '1px solid #e7e5e4',
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
              flexShrink: 0,
            }}
          >
            <BookMarked size={18} />
          </div>
          {!collapsed && (
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <span
                  style={{
                    fontFamily: 'Newsreader, Georgia, serif',
                    fontSize: '1.35rem',
                    fontWeight: 600,
                    letterSpacing: '-0.02em',
                    color: '#1c1917',
                  }}
                >
                  UNSTOP
                </span>
                <span
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '0.62rem',
                    color: '#78716c',
                    textTransform: 'uppercase',
                  }}
                >
                  EDITION 24
                </span>
              </div>
              <p
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.65rem',
                  color: '#a8a29e',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  marginTop: '1px',
                }}
              >
                ACADEMIC DOSSIER
              </p>
            </div>
          )}
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            background: '#faf8f5',
            border: '1px solid #e7e5e4',
            borderRadius: '4px',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#78716c',
            cursor: 'pointer',
            padding: 0,
            transition: 'all 0.15s ease',
          }}
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
        </button>
      </div>

      {/* Nav List with Editorial Hierarchy */}
      <nav
        style={{
          flex: 1,
          padding: '16px 12px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '3px',
        }}
      >
        {!collapsed && (
          <div
            style={{
              padding: '6px 10px',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.65rem',
              color: '#a8a29e',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              fontWeight: 600,
            }}
          >
            TABLE OF CONTENTS
          </div>
        )}

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '9px 12px',
                borderRadius: '6px',
                textDecoration: 'none',
                fontSize: '0.88rem',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? '#1c1917' : '#57534e',
                background: isActive ? '#f5f3ee' : 'transparent',
                borderLeft: isActive ? '3px solid #1c1917' : '3px solid transparent',
                transition: 'all 0.15s ease',
                justifyContent: collapsed ? 'center' : 'flex-start',
              })}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={17} style={{ flexShrink: 0 }} />
              {!collapsed && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <span>{item.label}</span>
                  <span style={{ fontFamily: 'Newsreader, serif', fontStyle: 'italic', fontSize: '0.8rem', color: '#a8a29e' }}>
                    {item.num}
                  </span>
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User profile footer */}
      <div
        style={{
          padding: '16px',
          borderTop: '1px solid #e7e5e4',
          background: '#faf8f5',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '10px',
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '4px',
              background: '#e7e5e4',
              color: '#1c1917',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.85rem',
              flexShrink: 0,
              fontFamily: 'Newsreader, serif',
            }}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>

          {!collapsed && (
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <h5
                style={{
                  fontSize: '0.86rem',
                  fontWeight: 600,
                  color: '#1c1917',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  margin: 0,
                }}
              >
                {user?.name || 'Student Account'}
              </h5>
              <p
                style={{
                  fontSize: '0.72rem',
                  color: '#78716c',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  margin: 0,
                }}
              >
                {user?.email || 'student@campus.edu'}
              </p>
            </div>
          )}
        </div>

        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap: '8px',
            background: '#ffffff',
            border: '1px solid #e7e5e4',
            color: '#78716c',
            borderRadius: '4px',
            padding: '7px 10px',
            fontSize: '0.8rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <LogOut size={14} />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
