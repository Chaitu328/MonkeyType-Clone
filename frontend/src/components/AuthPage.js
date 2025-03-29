import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthPage = ({ type, setUser }) => {
  const [form, setForm] = useState({ email: '', password: '', username: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(`/api/auth/${type}`, form);
      console.log("Received token:", data.token);
      localStorage.setItem('token', data.token);
      console.log("Token in localStorage:", localStorage.getItem("token"));
      setUser(data.user);
      navigate('/');
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || 'Something went wrong'));
    }
  };

  return (
    <div className="authContainer">
      <h2>{type === 'login' ? 'Login' : 'Sign Up'}</h2>
      <form onSubmit={handleSubmit} className="authForm">
        {type === 'signup' && (
          <input
            className="input"
            placeholder="Username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />
        )}
        <input
          className="input"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          className="input"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button className="button" type="submit">{type === 'login' ? 'Login' : 'Sign Up'}</button>
      </form>
    </div>
  );
};

export default AuthPage;
