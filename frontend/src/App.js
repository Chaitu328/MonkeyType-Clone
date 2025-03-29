import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import Header from './components/Header';
import HomePage from './components/HomePage';
import AuthPage from './components/AuthPage';
import DashboardPage from './components/DashboardPage';
import './App.css';

// Axios configuration with Bearer token interceptor.
// axios.defaults.baseURL = 'http://localhost:5000/api';
axios.defaults.baseURL = 'https://monkeytype-c21i.onrender.com/api';
const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check auth on mount.
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await axios.get('/auth/user');
        setUser(data);
      } catch (err) {
        setUser(null);
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <Router>
      <div className="app">
        <Header user={user} setUser={setUser} />
        <main className="main">
          <Routes>
            <Route path="/" element={<HomePage user={user} />} />
            <Route path="/login" element={<AuthPage type="login" setUser={setUser} />} />
            <Route path="/signup" element={<AuthPage type="signup" setUser={setUser} />} />
            <Route path="/dashboard" element={<DashboardPage user={user} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
