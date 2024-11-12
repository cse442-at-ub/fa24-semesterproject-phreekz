import React, { useState, useEffect } from 'react';
import DOMPurify from 'dompurify';
import './AccountPage.css';

// List of countries, languages, and timezones for dropdown
const countries = [
    "United States", "Canada", "United Kingdom", "Germany", "France", "Italy", "Spain", "Australia", "Japan", 
    "China", "India", "Brazil", "Mexico", "South Korea", "Russia", "South Africa", "Argentina", "Saudi Arabia", 
    "Netherlands", "Sweden", "Switzerland", "Belgium", "New Zealand", "Norway", "Turkey", "United Arab Emirates", 
    "Singapore", "Malaysia", "Thailand", "Vietnam", "Indonesia", "Philippines", "Egypt", "Israel", "Ireland", 
    "Poland", "Denmark", "Finland", "Portugal", "Greece", "Chile"
]; // Most common/popular countries
const languages = [
    "English", "Mandarin", "Spanish", "Hindi", "Arabic", "French", "Russian", "Portuguese", 
    "Bengali", "German", "Japanese", "Korean", "Italian", "Urdu", "Turkish", "Vietnamese", 
    "Tamil", "Polish", "Ukrainian", "Dutch", "Persian", "Thai", "Greek", "Hungarian", 
    "Romanian", "Czech", "Swedish", "Finnsish", "Norwegian", "Danish"
]; // Most common languages
const timeZones = ['PST', 'EST', 'CST', 'MST', 'GMT']; // Popular time zones

const Profile = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    gender: '',
    language: '',
    country: '',
    timeZone: '',
    email: '',
  });

  const [emailList, setEmailList] = useState([]); // Email list should start empty
  const [emailError, setEmailError] = useState('');
  const [successMessage, setSuccessMessage] = useState(''); // For success message
  const [csrfToken, setCsrfToken] = useState('');

  const [errorMessage, setErrorMessage] = useState(''); // For error messages

  // Regex patterns for validation
  const usernamePattern = /^[a-zA-Z0-9._-]+$/; // Allows letters, numbers, underscores, hyphens, periods
  const namePattern = /^[a-zA-Z\s]+$/; // Allows letters and spaces for names
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; // Email validation

  useEffect(() => {
    // Fetch the CSRF token when the login page loads
    const fetchCsrfToken = async () => {
      const response = await fetch('/CSE442/2024-Fall/slogin/api/csrfToken.php');
      const data = await response.json();
      setCsrfToken(data.csrf_token);
    };

    fetchCsrfToken();
  }, []);
  const sqlInjectionPattern = /(\bDROP\b|\bSELECT\b|\bDELETE\b|\bINSERT\b)/i; // SQL keywords

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Check for HTML injection attempt
    if (value.includes("<script>")) {
      setErrorMessage(`Malicious content detected in ${name} field. Please use valid characters.`);
      return;
    }

    // Check for SQL injection attempt
    if (sqlInjectionPattern.test(value)) {
      setErrorMessage(`Invalid input detected in ${name} field.`);
      return;
    }

    // Validate name fields (only letters for fullName, valid username)
    if ((name === 'fullName' && value && !namePattern.test(value)) || 
        (name === 'username' && value && !usernamePattern.test(value))) {
      setErrorMessage(`Invalid ${name} format.`);
      return;
    }

    setFormData({
      ...formData,
      [name]: value,
    });
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Submitting data:", formData); // Log form data before sending

    // Sanitize each input field
    const sanitizedFormData = {
      fullName: DOMPurify.sanitize(formData.fullName),
      username: DOMPurify.sanitize(formData.username),
      gender: DOMPurify.sanitize(formData.gender),
      language: DOMPurify.sanitize(formData.language),
      country: DOMPurify.sanitize(formData.country),
      timeZone: DOMPurify.sanitize(formData.timeZone),
      email: DOMPurify.sanitize(formData.email),
    };

    // Check for discrepancies between original and sanitized inputs
    if (formData.fullName !== sanitizedFormData.fullName) {
      alert('Malicious full name detected. Use a different full name.');
      return;
    }
    if (formData.username !== sanitizedFormData.username) {
      alert('Malicious username detected. Use a different username.');
      return;
    }
    if (formData.gender !== sanitizedFormData.gender) {
      alert('Malicious gender selection detected. Use a different option.');
      return;
    }
    if (formData.language !== sanitizedFormData.language) {
      alert('Malicious language detected. Use a different language.');
      return;
    }
    if (formData.country !== sanitizedFormData.country) {
      alert('Malicious country detected. Use a different country.');
      return;
    }
    if (formData.timeZone !== sanitizedFormData.timeZone) {
      alert('Malicious time zone detected. Use a different time zone.');
      return;
    }
    if (formData.email !== sanitizedFormData.email) {
      alert('Malicious email detected. Use a different email.');
      return;
    }

    try {
      const response = await fetch("/CSE442/2024-Fall/slogin/api/accountinfo.php", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(sanitizedFormData),
        });

        const responseData = await response.json(); // Parse JSON response
        console.log("Response data:", responseData); // Log the response

        if (response.ok) {
            setSuccessMessage('Changes were saved successfully!');
        } else if (response.status == 406) {
          alert('Error validating CSRF Token. Please log in again.')
        } else {
            setErrorMessage(`Failed to save changes: ${responseData.message}`);
        }
    } catch (error) {
        setErrorMessage('Error while saving changes.');
        console.error('Error:', error); // Log the error
    }

    setTimeout(() => {
        setSuccessMessage(''); // Clear success message after a few seconds
        setErrorMessage(''); // Clear error message after a few seconds
    }, 3000);
  };

  const handleAddEmail = () => {
    const emailExists = emailList.some((entry) => entry.email === formData.email);

    if (!formData.email.match(emailPattern)) {
      setEmailError('Please enter a valid email.');
    } else if (emailExists) {
      setEmailError('Email already exists.');
    } else {
      setEmailList([...emailList, { email: formData.email, added: 'Just now' }]);
      // Don't reset the email field here to keep the display consistent
      setEmailError('');
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="avatar">
          <img src="path/to/avatar.png" alt="Profile" />
        </div>
        <div className="user-info">
          <h2
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(formData.fullName || "First Last"),
            }}
          ></h2>
          <p
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(formData.email || 'youremail@example.com'),
            }}
          ></p>
        </div>
      </div>

      <form className="profile-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <label>Full Name</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Your Full Name"
            pattern="[A-Za-z\s]+" // HTML5 Validation for only letters
          />
        </div>

        <div className="form-row">
          <label>Gender</label>
          <select name="gender" value={formData.gender} onChange={handleChange}>
            <option value="">Select</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="form-row">
          <label>Language</label>
          <select name="language" value={formData.language} onChange={handleChange}>
            <option value="">Select</option>
            {languages.map((language, index) => (
              <option key={index} value={language}>
                {language}
              </option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <label>Country</label>
          <select name="country" value={formData.country} onChange={handleChange}>
            <option value="">Select</option>
            {countries.map((country, index) => (
              <option key={index} value={country}>
                {country}
              </option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <label>Time Zone</label>
          <select name="timeZone" value={formData.timeZone} onChange={handleChange}>
            <option value="">Select</option>
            {timeZones.map((zone, index) => (
              <option key={index} value={zone}>
                {zone}
              </option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <label>Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Your Username"
            pattern="[a-zA-Z0-9._-]+" // HTML5 Validation for letters, numbers, underscores, hyphens, periods
          />
        </div>

        <button type="submit" className="profile-submit-btn">Save Changes</button>
      </form>

      {/* Success message */}
      {successMessage && <p className="success-message">{successMessage}</p>}
      {/* Error message */}
      {errorMessage && <p className="error-message">{errorMessage}</p>}

      <div className="email-section">
        <h3>My Email Addresses</h3>
        <ul>
          {emailList.map((entry, index) => (
            <li key={index}>
              {entry.email} <small>({entry.added})</small>
            </li>
          ))}
        </ul>

        <div className="add-email-row">
          <input
            type="email"
            name="email"
            value={formData.email} // Keep this for the form field
            onChange={handleChange}
            placeholder="Enter email address"
          />
          <button type="button" onClick={handleAddEmail}>
            +Add Email Address
          </button>
        </div>
        {emailError && <p className="email-error">{emailError}</p>}
      </div>
    </div>
  );
};

export default Profile;
