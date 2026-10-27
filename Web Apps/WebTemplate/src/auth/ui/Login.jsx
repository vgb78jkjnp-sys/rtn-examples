import { useEffect, useState } from 'react';
import { useAuthServiceApi } from '../api/useAuthServiceApi';
import { isValidLoginResponse, normalizeLoginResponse } from '../core/normalize';
import { getAuthenticatedUserId } from '../core/userId';
import './Login.css';

function FloatingLabelField({
  id,
  label,
  type = 'text',
  value,
  onChange,
  disabled,
  autoComplete,
  showToggle = false,
  revealed = false,
  onToggleReveal
}) {
  return (
    <div className={`login-field${showToggle ? ' login-field--password' : ''}`}>
      <input
        id={id}
        type={type}
        className="login-field__input"
        placeholder=" "
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        disabled={disabled}
        required
      />
      <label htmlFor={id} className="login-field__label">{label}</label>
      {showToggle ? (
        <button
          type="button"
          className="login-field__toggle"
          onClick={onToggleReveal}
          disabled={disabled}
          aria-label={revealed ? 'Hide password' : 'Show password'}
        >
          <i className={`bi ${revealed ? 'bi-eye-slash' : 'bi-eye'}`} aria-hidden="true"></i>
        </button>
      ) : null}
    </div>
  );
}

function Login({
  config,
  storage,
  initialUserId = '',
  onLoginSuccess,
  permissionError = '',
  windowsAuthFailed = false
}) {
  const [userId, setUserId] = useState(initialUserId);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { invokeLogin } = useAuthServiceApi(config.api);
  const { login: loginUi } = config;

  useEffect(() => {
    if (initialUserId) {
      setUserId((currentUserId) => currentUserId || initialUserId);
    }
  }, [initialUserId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const trimmedUserId = userId.trim();
    if (!trimmedUserId || !password) {
      setError('User id and password are required.');
      return;
    }

    setSubmitting(true);

    try {
      const loginResponse = await invokeLogin({
        UserId: trimmedUserId,
        Password: password
      });

      const authInfo = normalizeLoginResponse(loginResponse);
      if (!isValidLoginResponse(loginResponse)) {
        setError('Invalid user id or password.');
        return;
      }

      const resolvedUserId = getAuthenticatedUserId(authInfo, storage.getStoredUserId) || trimmedUserId;
      await onLoginSuccess(resolvedUserId, authInfo);
    } catch (err) {
      setError(err?.message || 'Unable to sign in. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const displayError = permissionError || error;

  return (
    <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="card shadow-sm" style={{ maxWidth: '480px', width: '100%' }}>
        <div className="card-body p-4" style={{ margin: '0 8px 15px' }}>
          <div className="d-flex align-items-center">
            {loginUi.logo ? (
              <img
                src={loginUi.logo}
                alt={loginUi.logoAlt ?? 'Logo'}
                width="150"
                height="70"
                className="d-inline-block mb-2"
                style={{ objectFit: 'contain' }}
              />
            ) : null}
          </div>
          <p className="mb-4 fw-bold" style={{ fontSize: '1.0rem', opacity: 0.8 }}>
            {loginUi.appTitle}
          </p>
          {windowsAuthFailed ? (
            <p className="text-muted mb-3" style={{ fontSize: '0.85rem' }}>
              {config.messages.windowsAuthUnavailable}
            </p>
          ) : null}

          <form onSubmit={handleSubmit}>
            <FloatingLabelField
              id="login-user-id"
              label="User Id"
              value={userId}
              onChange={(event) => setUserId(event.target.value)}
              autoComplete="username"
              disabled={submitting}
            />

            <FloatingLabelField
              id="login-password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              disabled={submitting}
              revealed={showPassword}
              onToggleReveal={() => setShowPassword((current) => !current)}
            />

            {displayError ? (
              <div className="alert alert-warning py-1 mt-3" style={{ fontSize: '0.8rem' }} role="alert">
                {displayError}
              </div>
            ) : null}

            <button type="submit" className="btn btn-primary w-100" style={{ fontSize: '.9rem' }} disabled={submitting}>
              {submitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
