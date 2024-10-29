import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Import Link and useNavigate
import DOMPurify from 'dompurify';
import './Login.css'; // Import the CSS for this component

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); // Use React Router's useNavigate for navigation

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Data to be sent to the backend
    const formData = {
      email: email,
      password: password,
    };

    // Sanitize email and password before sending to backend
    const sanitizedFormData = {
      email: DOMPurify.sanitize(formData.email),
      password: DOMPurify.sanitize(formData.password),
    }

    if (formData.email !== sanitizedFormData.email) {
      alert('Malicious email detected. Use a different email.');
      return;
    }
    if (formData.password !== sanitizedFormData.password) {
      alert('Malicious password detected. Use a different password.');
      return;
    }

    try {
      const response = await fetch("/CSE442/2024-Fall/yichuanp/api/login.php",{
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sanitizedFormData),
      });

      if (!response.ok){
        // If login failed (e.g., incorrect credentials)
        alert("Login failed, please check your credentials.");
      } else {
        // If login is successful
        alert("Login successful!");
        navigate("/dashboard"); // Navigate to the dashboard, landing page for now
      }
  } catch (error) {
    // Catch any other errors (e.g., network issues, fetch failures)
    console.error("Error during login:", error);
    alert("An error occurred during login. Please try again.");
  }
  };

  return (
    <div className="login-container">
      {/* Logo section with clickable link */}
      <div className="login-header">
        <Link to="/">
          <h1>PhreekyNoises</h1>
        </Link>
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
            <Link to="/signup">
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
