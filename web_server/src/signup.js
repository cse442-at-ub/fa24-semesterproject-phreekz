import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import './signup.css'; // Signup CSS file
import LandingPage from './LandingPage';

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

  const handleSubmit = async(e) => {
    e.preventDefault();
    try{
      const response = await fetch("https://LocalHost:/api/signup.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        }, body: JSON.stringify(formData),
      });
      if(response.ok){
        //await response.json();
        Navigate(LandingPage);
      }else {
        console.error("Error Submitting Form:", response.statusText);
      }
    }catch(error){
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