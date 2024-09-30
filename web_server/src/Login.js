import React from 'react';
import { Link } from 'react-router-dom';

const Login = () => {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h2>Login Page</h2>
      <form>
        <div>
          <label>Email:</label>
          <input type="email" name="email" required />
        </div>
        <div>
          <label>Password:</label>
          <input type="password" name="password" required />
        </div>
          <Link to="/dashboard">
            <button type="submit">Log In</button>
          </Link>
      </form>
    </div>
  );
};

export default Login;
