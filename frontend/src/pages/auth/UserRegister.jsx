import React from 'react'
import { Link } from 'react-router-dom'
import '../../styles/auth.css'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function UserRegister() {

  const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        const fullname = e.target.fullname.value;
        const email = e.target.email.value;
        const password = e.target.password.value;

        const response = await axios.post("http://localhost:3000/api/auth/user/register", {
            fullname,
            email,
            password
        }, {
            withCredentials: true
        })

        console.log(response.data);

        navigate('/');

        

    }
  return (
    <div className="auth-shell">
      <section className="card">
        <header>
          <h1 className="title">Create your account</h1>
          <p className="subtitle">Join as a user to start exploring.</p>
        </header>

        <form className="form" onSubmit={handleSubmit}>
          <div className="field">
            <label className="label" htmlFor="fullname">Full name</label>
            <input className="input" id="fullname" name="fullname" type="text" placeholder="Your full name" autoComplete="name" required />
          </div>

          <div className="field">
            <label className="label" htmlFor="email">Email</label>
            <input className="input" id="email" name="email" type="email" placeholder="you@example.com" autoComplete="email" required />
          </div>

          <div className="field">
            <label className="label" htmlFor="password">Password</label>
            <input className="input" id="password" name="password" type="password" placeholder="Create a strong password" autoComplete="new-password" required />
          </div>

          <div className="field">
            <label className="label" htmlFor="confirm">Confirm password</label>
            <input className="input" id="confirm" name="confirm" type="password" placeholder="Re-enter password" autoComplete="new-password" required />
          </div>

          <div className="actions">
            <button className="btn" type="submit">Create account</button>
            <p className="footer-note">Already have an account? <Link className="link" to="/user/login">Sign in</Link></p>
          </div>
        </form>

        <div className="divider" style={{marginTop: 16, marginBottom: 8}}>or</div>
        <p className="footer-note">Looking to partner? <Link className="link" to="/foodpartner/register">Register as a food partner</Link></p>
      </section>
    </div>
  )
}
