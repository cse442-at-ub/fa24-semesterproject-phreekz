import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './signup.css'; // Signup CSS file

const SignupPage = () => {
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

    try {
      const response = await fetch("http://localhost:3000/api/signup.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        navigate('/LandingPage'); // Redirect after successful signup
      } else {
        console.error("Error Submitting Form:", response.statusText);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-header">
        <h1>Create Account</h1>
      </div>

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