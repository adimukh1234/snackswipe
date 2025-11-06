import React from 'react'
import { Link } from 'react-router-dom'
import '../../styles/auth.css'

export default function FoodPartnerRegister() {
  return (
    <div className="auth-shell">
      <section className="card">
        <header>
          <h1 className="title">Register as a partner</h1>
          <p className="subtitle">Grow with us by joining the platform.</p>
        </header>

        <form className="form" onSubmit={(e) => e.preventDefault()}>
          <div className="field">
            <label className="label" htmlFor="bizname">Business name</label>
            <input className="input" id="bizname" name="bizname" type="text" placeholder="Your Restaurant LLC" autoComplete="organization" required />
          </div>

          <div className="field">
            <label className="label" htmlFor="email">Business email</label>
            <input className="input" id="email" name="email" type="email" placeholder="contact@yourbiz.com" autoComplete="email" required />
          </div>

          <div className="field">
            <label className="label" htmlFor="phone">Phone</label>
            <input className="input" id="phone" name="phone" type="tel" placeholder="+1 555 000 1234" autoComplete="tel" />
          </div>

          <div className='field'>
            <label className='label' htmlFor='address'>Business address</label>
            <input className='input' id='address' name='address' type='text' placeholder='123 Main St, City, Country' autoComplete='street-address' required />
          </div>

          <div className="field">
            <label className="label" htmlFor="password">Password</label>
            <input className="input" id="password" name="password" type="password" placeholder="Create a strong password" autoComplete="new-password" required />
          </div>

          

        
          <div className="field">
            <label className="label" htmlFor="confirm">Confirm password</label>
            <input className="input" id="confirm" name="confirm" type="password" placeholder="Re-enter password" autoComplete="new-password" required />
          </div>

          <div className='field'>
            <label className='label' htmlFor='cuisine'>Cuisine</label>
            <input className='input' id='cuisine' name='cuisine' type='text' placeholder='e.g., Italian, Chinese, Fast Food' required />
            </div>

          <div className="actions">
            <button className="btn" type="submit">Create account</button>
            <p className="footer-note">Already a partner? <Link className="link" to="/foodpartner/login">Sign in</Link></p>
          </div>
        </form>

        <div className="divider" style={{marginTop: 16, marginBottom: 8}}>or</div>
        <p className="footer-note">Want a user account? <Link className="link" to="/user/register">Register as user</Link></p>
      </section>
    </div>
  )
}
