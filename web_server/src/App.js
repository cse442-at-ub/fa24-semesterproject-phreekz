import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './LandingPage';
import Login from './Login';
import DashboardPage from './DashboardPage';
import SignupPage from './signup';
import AccountPage from './AccountPage';
import PlaylistsPage from './PlaylistsPage';
import ExplorePage from './ExplorePage';

function App() {
  return (
    <Router basename="/CSE442/2024-Fall/gffajard/">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<DashboardPage/>} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/playlists" element={<PlaylistsPage />} />
        <Route path ="/explore" element={<ExplorePage />} />
      </Routes>
    </Router>
  );
}

export default App;