import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Header = ({ user, setUser }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/');
  };

  return (
    <header className="header">
      <Link to="/" className="logo">MonkeyType Tester</Link>
      <nav>
        {user ? (
          <>
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
            <button className="button" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/signup" className="nav-link">Sign Up</Link>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;
