import React, { useState } from 'react';
import { Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import db from '../db/db';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';

const Login = () => {
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!loginData.email || !loginData.password) {
        setError('Please fill in all fields');
        setLoading(false);
        return;
      }

      // Find user by email and password
      const user = await db.users
        .where('email')
        .equals(loginData.email)
        .first();

      if (!user) {
        setError('User not found. Please register first.');
        setLoading(false);
        return;
      }

      if (user?.password !== loginData?.password) {
        setError('Invalid password. Please try again.');
        setLoading(false);
        return;
      }
      sessionStorage.setItem('currentUser', JSON.stringify(user));
    navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f5f5f5',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        padding: '32px',
        maxWidth: '420px',
        width: '100%',
        border: '1px solid #e0e0e0'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            display: 'inline-block',
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#FF9900',
            marginBottom: '16px',
            letterSpacing: '-1px'
          }}>
Welcome Again!          </div>
          <h2 style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#222',
            margin: '0 0 8px 0'
          }}>
            Sign In
          </h2>
          <p style={{
            fontSize: '14px',
            color: '#666',
            margin: 0
          }}>
            Access your account
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{
            backgroundColor: '#f8d7da',
            border: '1px solid #f5c6cb',
            borderRadius: '4px',
            padding: '12px 16px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}>
            <AlertCircle size={20} color="#721c24" style={{ marginTop: '2px', flexShrink: 0 }} />
            <p style={{
              fontSize: '14px',
              color: '#721c24',
              margin: 0
            }}>
              {error}
            </p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin}>
          {/* Email Field */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '700',
              color: '#222',
              marginBottom: '6px'
            }}>
              Email or mobile number
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#999'
              }} />
              <input
                type="email"
                name="email"
                value={loginData.email}
                onChange={handleInputChange}
                placeholder="you@example.com"
                style={{
                  width: '100%',
                  paddingLeft: '40px',
                  paddingRight: '12px',
                  paddingTop: '10px',
                  paddingBottom: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                  backgroundColor: '#fff'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#FF9900';
                  e.target.style.boxShadow = '0 0 0 3px rgba(255, 153, 0, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#ccc';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {/* Password Field */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '700',
              color: '#222',
              marginBottom: '6px'
            }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#999'
              }} />
              <input
                type="password"
                name="password"
                value={loginData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                style={{
                  width: '100%',
                  paddingLeft: '40px',
                  paddingRight: '12px',
                  paddingTop: '10px',
                  paddingBottom: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                  backgroundColor: '#fff'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#FF9900';
                  e.target.style.boxShadow = '0 0 0 3px rgba(255, 153, 0, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#ccc';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: loading ? '#ccc' : '#FF9900',
              color: '#ffffff',
              fontWeight: '600',
              padding: '10px 16px',
              borderRadius: '4px',
              border: 'none',
              fontSize: '14px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => !loading && (e.target.style.background = '#FF9900')}
            onMouseLeave={(e) => !loading && (e.target.style.background = '#FF9900')}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        {/* Footer */}
        <div style={{
          marginTop: '20px',
          paddingTop: '20px',
          borderTop: '1px solid #e0e0e0',
          textAlign: 'center'
        }}>
          <p style={{
            fontSize: '13px',
            color: '#666',
            margin: 0,
            lineHeight: '1.5'
          }}>
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/')}
              style={{
                color: '#0066c0',
                fontWeight: '600',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '13px',
                padding: 0,
                transition: 'color 0.2s',
                textDecoration: 'none'
              }}
              onMouseEnter={(e) => e.target.style.color = '#004B87'}
              onMouseLeave={(e) => e.target.style.color = '#0066c0'}
            >
              Create your account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
