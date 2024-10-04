import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom
import './Login.css'; // Import the CSS for this component

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle login logic here
    console.log('Email:', email);
    console.log('Password:', password);
  };

  return (
    <div className="login-container">
      {/* Logo section with clickable link */}
      <div className="login-header">
        <Link to="/">
          <h1>PhreekyNoises</h1>
        </Link>
        {/* You can add buttons here for "Log in" and "Sign up" similar to the landing page if needed */}
      </div>

      {/* Login form section */}
      <div className="login-card">
        <h2 className="login-title">Log in</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Form options (Remember me and Sign-up link) */}
          <div className="login-options">
            <label className="remember-me">
              <input type="checkbox" />
              Remember me
            </label>
            <Link to="/signup" className="signup-link">
              Don't have an account?
            </Link>
          </div>

          {/* Button section */}
          <div className="login-buttons">
            <button type="submit" className="login-btn get-phreeky-btn">
              🎵 Get Phreeky
            </button>
            <button type="button" className="login-btn signup-btn">
              🎵 Sign up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
