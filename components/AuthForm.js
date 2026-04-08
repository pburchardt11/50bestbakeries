'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';

export default function AuthForm({ mode = 'login', callbackUrl = '/' }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isRegister = mode === 'register';

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Registration failed');
          setLoading(false);
          return;
        }
        // Auto-login after registration
        await signIn('credentials', { email, password, callbackUrl });
      } else {
        const result = await signIn('credentials', {
          email,
          password,
          redirect: false,
        });
        if (result?.error) {
          setError('Invalid email or password');
          setLoading(false);
        } else {
          window.location.href = callbackUrl;
        }
      }
    } catch {
      setError('Something went wrong');
      setLoading(false);
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: 8,
    border: '1px solid rgba(212,148,76,0.2)',
    background: 'rgba(255,255,255,0.03)',
    color: '#e8e4de',
    fontFamily: "'Outfit', sans-serif",
    fontSize: 14,
    outline: 'none',
    boxSizing: 'border-box',
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: '0 auto' }}>
      <h1 style={{
        fontSize: 32, fontWeight: 400, color: '#f5f0e8', textAlign: 'center',
        marginBottom: 8,
      }}>
        {isRegister ? 'Create Account' : 'Sign In'}
      </h1>
      <p style={{
        fontFamily: "'Outfit', sans-serif", fontSize: 13, color: '#6a6560',
        textAlign: 'center', marginBottom: 32,
      }}>
        {isRegister ? 'Join 50 Best Bakeries to rate and review bakeries' : 'Welcome back to 50 Best Bakeries'}
      </p>

      {error && (
        <div style={{
          padding: '10px 14px', borderRadius: 8, marginBottom: 16,
          background: 'rgba(220,50,50,0.1)', border: '1px solid rgba(220,50,50,0.2)',
          fontFamily: "'Outfit', sans-serif", fontSize: 13, color: '#e06060',
        }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {isRegister && (
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            style={inputStyle}
          />
        )}
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          minLength={6}
          style={inputStyle}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '14px 24px', borderRadius: 8,
            background: loading ? '#8a6a40' : '#d4944c',
            color: '#080808', border: 'none', cursor: loading ? 'wait' : 'pointer',
            fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 600,
            transition: 'background 0.2s',
          }}
        >
          {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}
        </button>
      </div>

      <p style={{
        fontFamily: "'Outfit', sans-serif", fontSize: 13, color: '#6a6560',
        textAlign: 'center', marginTop: 24,
      }}>
        {isRegister ? (
          <>Already have an account? <a href="/login" style={{ color: '#d4944c', textDecoration: 'none' }}>Sign in</a></>
        ) : (
          <>Don{"'"}t have an account? <a href="/register" style={{ color: '#d4944c', textDecoration: 'none' }}>Create one</a></>
        )}
      </p>
    </form>
  );
}
