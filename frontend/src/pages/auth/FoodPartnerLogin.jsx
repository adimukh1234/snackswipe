import React from 'react'
import { Link } from 'react-router-dom'
import '../../styles/auth.css'

export default function FoodPartnerLogin() {
  return (
    <div className="auth-shell">
      <section className="card">
        <header>
          <h1 className="title">Partner sign in</h1>
          <p className="subtitle">Access your partner dashboard.</p>
        </header>

        <form className="form" onSubmit={(e) => e.preventDefault()}>
          <div className="field">
            <label className="label" htmlFor="email">Business email</label>
            <input className="input" id="email" name="email" type="email" placeholder="you@yourbiz.com" autoComplete="email" required />
          </div>

          <div className="field">
            <div className="row">
              <label className="label" htmlFor="password">Password</label>
              <Link className="link" to="#">Forgot?</Link>
            </div>
            <input className="input" id="password" name="password" type="password" placeholder="Enter your password" autoComplete="current-password" required />
          </div>

          <div className="actions">
            <button className="btn" type="submit">Sign in</button>
            <p className="footer-note">New partner? <Link className="link" to="/foodpartner/register">Create an account</Link></p>
          </div>
        </form>

        <div className="divider" style={{marginTop: 16, marginBottom: 8}}>or</div>
        <p className="footer-note">Are you a user? <Link className="link" to="/user/login">Sign in as user</Link></p>
      </section>
    </div>
  )
}
