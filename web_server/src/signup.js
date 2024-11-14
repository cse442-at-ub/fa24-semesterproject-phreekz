import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';
import './signup.css'; // Signup CSS file

const SignupPage = () => {

  // CSRF Security
  const [csrfToken, setCsrfToken] = useState('');

  useEffect(() => {
    // Fetch the CSRF token when the login page loads
    const fetchCsrfToken = async () => {
      const response = await fetch('/CSE442/2024-Fall/slogin/api/csrfToken.php');
      const data = await response.json();
      setCsrfToken(data.csrf_token);
    };

    fetchCsrfToken();
  }, []);

  // Form state to handle input validation, etc.
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    confirmEmail: '',
    password: '',
    gender: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Regular expressions for validation
    const namePattern = /^[A-Za-z]+$/; // For first and last name
    const usernamePattern = /^[A-Za-z0-9_.-]+$/; // For username
    const emailPattern = /^[A-Za-z0-9._-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$/; // For email

    // Validate first and last name
    if (!namePattern.test(formData.firstName)) {
      alert('First name can only contain letters.');
      return;
    }
    if (!namePattern.test(formData.lastName)) {
      alert('Last name can only contain letters.');
      return;
    }

    // Validate username
    if (!usernamePattern.test(formData.username)) {
      alert('Username can only contain letters, numbers, underscores, hyphens, and periods.');
      return;
    }

    // Validate email
    if (!emailPattern.test(formData.email)) {
      alert('Invalid email format. Please use a valid email address.');
      return;
    }

    // Sanitize all fields at once upon form submission
    const sanitizedFormData = {
      firstName: DOMPurify.sanitize(formData.firstName),
      lastName: DOMPurify.sanitize(formData.lastName),
      username: DOMPurify.sanitize(formData.username),
      email: DOMPurify.sanitize(formData.email),
      confirmEmail: DOMPurify.sanitize(formData.confirmEmail),
      password: DOMPurify.sanitize(formData.password),
      gender: DOMPurify.sanitize(formData.gender)
    };

    // Compare original input with sanitized version
    if (formData.firstName !== sanitizedFormData.firstName) {
      alert('Malicious first name detected. Use a different first name.');
      return;
    }
    if (formData.lastName !== sanitizedFormData.lastName) {
      alert('Malicious last name detected. Use a different last name.');
      return;
    }
    if (formData.username !== sanitizedFormData.username) {
      alert('Malicious username detected. Use a different username.');
      return;
    }
    if (formData.email !== sanitizedFormData.email) {
      alert('Malicious email detected. Use a different email.');
      return;
    }
    if (formData.password !== sanitizedFormData.password) {
      alert('Malicious password detected. Use a different password.');
      return;
    }
    if (formData.gender !== sanitizedFormData.gender) {
      alert('Malicious gender selection detected. Use a different option.');
      return;
    }

    try {
      const response = await fetch("/CSE442/2024-Fall/slogin/api/signup.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sanitizedFormData),
      });

      if (response.ok) {
        navigate('/dashboard'); // Redirect after successful signup
      } else if (response.status == 406) {
        alert('Error validating CSRF Token. Please refresh the page and try again.')
      } else {
        console.error("Error Submitting Form:", response.statusText);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="signup-container">
      <form onSubmit={handleSubmit} className="signup-form">
        <div className="form-group">
          <label>First Name </label>
          <input 
            type="text" 
            name="firstName" 
            placeholder="First Name" 
            value={formData.firstName} 
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Last Name</label>
          <input 
            type="text" 
            name="lastName" 
            placeholder="Last Name" 
            value={formData.lastName} 
            onChange={handleChange}
            required 
          />
        </div>

        <div className="form-group">
          <label>Username </label>
          <input 
            type="text" 
            name="username" 
            placeholder="Username" 
            value={formData.username} 
            onChange={handleChange}
            required 
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input 
            type="email" 
            name="email" 
            placeholder="Enter a valid email" 
            value={formData.email} 
            onChange={handleChange} 
            required 
          />
        </div>

        <div className="form-group">
          <label>Confirm Email </label>
          <input 
            type="email" 
            name="confirmEmail" 
            placeholder="Confirm your email" 
            value={formData.confirmEmail} 
            onChange={handleChange} 
            required 
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input 
            type="password" 
            name="password" 
            placeholder="Password" 
            value={formData.password} 
            onChange={handleChange} 
            required 
          />
        </div>

        <div className="form-group">
          <label>Gender</label>
          <select name="gender" value={formData.gender} onChange={handleChange}>
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="nonbinary">Non-binary</option>
          </select>
        </div>

        <button type="submit" className="signup-submit-btn">Sign Up</button>
      </form>
    </div>
  );
};

export default SignupPage;