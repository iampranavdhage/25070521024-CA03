import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

export const AppLayout = () => {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content-area">
        <Navbar />
        <main style={{ flex: 1, paddingBottom: '60px' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
