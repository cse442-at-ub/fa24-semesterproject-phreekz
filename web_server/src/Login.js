import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Import Link and useNavigate
import DOMPurify from 'dompurify';
import './Login.css'; // Import the CSS for this component

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
  const [csrfToken, setCsrfToken] = useState('');
  const navigate = useNavigate(); // Use React Router's useNavigate for navigation

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  useEffect(() => {
    // Fetch CSRF token on page load
    const fetchCsrfToken = async () => {
      try {
        const response = await fetch('/CSE442/2024-Fall/slogin/api/csrfToken.php');
        const data = await response.json();
        setCsrfToken(data.csrf_token);
      } catch (error) {
        console.error('Error fetching CSRF token:', error);
      }
    };
    fetchCsrfToken();
  }, []);

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
      const response = await fetch("/CSE442/2024-Fall/slogin/api/login.php",{
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sanitizedFormData),
      });

      if (!response.ok) {
        // If login failed (e.g., incorrect credentials)
        alert("Login failed, please check your credentials.");
      } else if (response.status == 406) {
        alert('Error validating CSRF Token. Please refresh the page and try again.')
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
            <div className='password-container'>
              <input
                type={showPassword ? "text" : "password"} // Toggle between "text" and "password"
                id="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="show-password-btn"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? "Hide" : "Show"} Password
              </button>
            </div>
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
