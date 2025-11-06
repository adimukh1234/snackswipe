import React from 'react'
import { Link } from 'react-router-dom'
import '../../styles/auth.css'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function UserLogin() {
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      const res = await axios.post('http://localhost:3000/api/auth/user/login', {
        email,
        password
      }, { withCredentials: true });

      console.log(res.data);
      navigate('/');
    } catch (err) {
      console.error(err);
      alert('Login failed. Please check your credentials and try again.');
    }
  }

  return (
    <div className="auth-shell">
      <section className="card">
        <header>
          <h1 className="title">Welcome back</h1>
          <p className="subtitle">Sign in to continue as a user.</p>
        </header>

        <form className="form" onSubmit={handleSubmit}>
          <div className="field">
            <label className="label" htmlFor="email">Email</label>
            <input className="input" id="email" name="email" type="email" placeholder="you@example.com" autoComplete="email" required />
          </div>

          <div className="field">
            <div className="row">
              <label className="label" htmlFor="password">Password</label>
              <Link className="link" to="#">Forgot?</Link>
            </div>
            <input className="input" id="password" name="password" type="password" placeholder="Enter your password" autoComplete="current-password" required />
          </div>

          <div className="row">
            <label className="checkbox">
              <input type="checkbox" name="remember" />
              Remember me
            </label>
          </div>

          <div className="actions">
            <button className="btn" type="submit">Sign in</button>
            <p className="footer-note">New here? <Link className="link" to="/user/register">Create an account</Link></p>
          </div>
        </form>

        <div className="divider" style={{marginTop: 16, marginBottom: 8}}>or</div>
        <p className="footer-note">Are you a food partner? <Link className="link" to="/foodpartner/login">Sign in here</Link></p>
      </section>
    </div>
  )
}
