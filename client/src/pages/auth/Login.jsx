import { useState } from 'react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login:', { email, password });
  };

  return (
    <div style={{minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6'}}>
      <div style={{maxWidth: '400px', width: '100%', background: 'white', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', padding: '32px'}}>
        <h2 style={{fontSize: '24px', fontWeight: 'bold', textAlign: 'center', marginBottom: '24px'}}>Login to LANE</h2>
        
        <form onSubmit={handleSubmit}>
          <div style={{marginBottom: '16px'}}>
            <label style={{display: 'block', marginBottom: '8px'}}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '4px'}}
              required
            />
          </div>

          <div style={{marginBottom: '16px'}}>
            <label style={{display: 'block', marginBottom: '8px'}}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '4px'}}
              required
            />
          </div>

          <button 
            type="submit"
            style={{width: '100%', background: '#2563eb', color: 'white', padding: '10px', borderRadius: '4px', border: 'none', cursor: 'pointer'}}
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

// Validation added
