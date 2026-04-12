import { useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';

/* ── shared field validation ── */
function validateLogin({ email, password }) {
  const e = {};
  if (!email.trim())    e.email    = 'Email is required';
  else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email';
  if (!password)        e.password = 'Password is required';
  return e;
}

function validateRegister({ name, email, password, confirm }) {
  const e = {};
  if (!name.trim())     e.name     = 'Name is required';
  if (!email.trim())    e.email    = 'Email is required';
  else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email';
  if (!password)        e.password = 'Password is required';
  else if (password.length < 8) e.password = 'At least 8 characters';
  if (password !== confirm) e.confirm = 'Passwords do not match';
  return e;
}

/* ── icons ── */
const EyeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

/* ── Password input with show/hide toggle ── */
function PasswordInput({ id, name, value, onChange, placeholder, disabled, invalid }) {
  const [show, setShow] = useState(false);
  return (
    <div className="auth-password-wrap">
      <input
        id={id} name={name} type={show ? 'text' : 'password'}
        value={value} onChange={onChange} placeholder={placeholder}
        disabled={disabled} aria-invalid={invalid}
        autoComplete={name === 'password' ? 'current-password' : 'new-password'}
      />
      <button
        type="button" className="auth-eye-btn"
        onClick={() => setShow((v) => !v)}
        tabIndex={-1} aria-label={show ? 'Hide password' : 'Show password'}
      >
        {show ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  );
}

/* ── Login form ── */
function LoginForm({ onSuccess }) {
  const { login } = useAuth();
  const [form,   setForm]   = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = useCallback((e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: undefined }));
  }, []);

  async function submit(e) {
    e.preventDefault();
    const errs = validateLogin(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true); setServerError('');
    try {
      await login(form);
      onSuccess?.();
    } catch (err) {
      setServerError(err.message || 'Login failed. Please try again.');
    } finally { setLoading(false); }
  }

  return (
    <form onSubmit={submit} noValidate className="auth-form">
      <div className="auth-field">
        <label htmlFor="login-email">Email address</label>
        <input
          id="login-email" name="email" type="email" autoComplete="email"
          placeholder="you@example.com" value={form.email}
          onChange={handle} disabled={loading} aria-invalid={!!errors.email}
        />
        {errors.email && <span className="auth-field-error">{errors.email}</span>}
      </div>

      <div className="auth-field">
        <label htmlFor="login-password">Password</label>
        <PasswordInput
          id="login-password" name="password" value={form.password}
          onChange={handle} placeholder="••••••••"
          disabled={loading} invalid={!!errors.password}
        />
        {errors.password && <span className="auth-field-error">{errors.password}</span>}
      </div>

      {serverError && <p className="auth-server-error">{serverError}</p>}

      <button type="submit" className="auth-submit-btn" disabled={loading}>
        {loading ? 'Signing in…' : 'Sign In'}
      </button>
    </form>
  );
}

/* ── Register form ── */
function RegisterForm({ onSuccess }) {
  const { register } = useAuth();
  const [form,   setForm]   = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = useCallback((e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: undefined }));
  }, []);

  async function submit(e) {
    e.preventDefault();
    const errs = validateRegister(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true); setServerError('');
    try {
      await register({ name: form.name, email: form.email, password: form.password });
      onSuccess?.();
    } catch (err) {
      setServerError(err.message || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  }

  return (
    <form onSubmit={submit} noValidate className="auth-form">
      <div className="auth-field">
        <label htmlFor="reg-name">Full name</label>
        <input
          id="reg-name" name="name" type="text" autoComplete="name"
          placeholder="Jane Doe" value={form.name}
          onChange={handle} disabled={loading} aria-invalid={!!errors.name}
        />
        {errors.name && <span className="auth-field-error">{errors.name}</span>}
      </div>

      <div className="auth-field">
        <label htmlFor="reg-email">Email address</label>
        <input
          id="reg-email" name="email" type="email" autoComplete="email"
          placeholder="you@example.com" value={form.email}
          onChange={handle} disabled={loading} aria-invalid={!!errors.email}
        />
        {errors.email && <span className="auth-field-error">{errors.email}</span>}
      </div>

      <div className="auth-field">
        <label htmlFor="reg-password">Password</label>
        <PasswordInput
          id="reg-password" name="password" value={form.password}
          onChange={handle} placeholder="Min. 8 characters"
          disabled={loading} invalid={!!errors.password}
        />
        {errors.password && <span className="auth-field-error">{errors.password}</span>}
      </div>

      <div className="auth-field">
        <label htmlFor="reg-confirm">Confirm password</label>
        <PasswordInput
          id="reg-confirm" name="confirm" value={form.confirm}
          onChange={handle} placeholder="Repeat password"
          disabled={loading} invalid={!!errors.confirm}
        />
        {errors.confirm && <span className="auth-field-error">{errors.confirm}</span>}
      </div>

      {serverError && <p className="auth-server-error">{serverError}</p>}

      <button type="submit" className="auth-submit-btn" disabled={loading}>
        {loading ? 'Creating account…' : 'Create Account'}
      </button>
    </form>
  );
}

/* ── Main AuthPage ── */
export default function AuthPage() {
  const [mode, setMode] = useState('login'); // 'login' | 'register'

  return (
    <div className="auth-bg">
      <div className="auth-card">
        {/* Brand */}
        <div className="auth-brand">
          <div className="auth-brand-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <span className="auth-brand-name">ExpenseTracker</span>
        </div>

        {/* Tabs */}
        <div className="auth-tabs">
          <button
            className={`auth-tab${mode === 'login' ? ' auth-tab--active' : ''}`}
            onClick={() => setMode('login')}
          >
            Sign In
          </button>
          <button
            className={`auth-tab${mode === 'register' ? ' auth-tab--active' : ''}`}
            onClick={() => setMode('register')}
          >
            Create Account
          </button>
        </div>

        {/* Heading */}
        <div className="auth-heading">
          <h1>{mode === 'login' ? 'Welcome back' : 'Get started today'}</h1>
          <p>{mode === 'login'
            ? 'Sign in to your account to continue'
            : 'Create a free account and start tracking'
          }</p>
        </div>

        {/* Form */}
        {mode === 'login'
          ? <LoginForm />
          : <RegisterForm />
        }

        {/* Footer switch */}
        <p className="auth-switch">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button className="auth-switch-btn" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
            {mode === 'login' ? 'Create one' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}
