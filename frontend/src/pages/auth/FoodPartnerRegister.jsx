import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../../styles/auth.css'
import axios from 'axios'

export default function FoodPartnerRegister() {
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const bizname = e.target.bizname.value;
    const email = e.target.email.value;
    const phone = e.target.phone.value;
    const address = e.target.address.value;
    const password = e.target.password.value;
    const confirm = e.target.confirm.value;
    const cuisine = e.target.cuisine.value;

    if (password !== confirm) {
      alert('Passwords do not match');
      return;
    }

    try {
      const res = await axios.post('http://localhost:3000/api/auth/foodpartner/register', {
        name: bizname,
        address, // send address explicitly
        email,
        contactNumber: phone,
        password,
        cuisineType: cuisine
      }, { withCredentials: true });

      console.log('SUCCESS', res.data);
      navigate('/foodpartner/create'); // adjust destination if needed
    } catch (err) {
      // improved error reporting
      console.error('Axios error', err);
      console.error('Response data:', err?.response?.data);
      console.error('Response status:', err?.response?.status);

      const serverMessage = err?.response?.data?.message || err?.response?.data || err.message;
      alert('Registration failed: ' + serverMessage);
    }
  }

  return (
    <div className="auth-shell">
      <section className="card">
        <header>
          <h1 className="title">Register as a partner</h1>
          <p className="subtitle">Grow with us by joining the platform.</p>
        </header>

        <form className="form" onSubmit={handleSubmit}>
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
