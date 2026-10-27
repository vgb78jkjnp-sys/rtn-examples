import { useAuth } from '../auth';

function AuthStatus() {
  const { authInfo, loading, logout, forceLoginPrompt } = useAuth();

  const displayName = loading ? 'Loading...' : authInfo.name || 'Guest';
  const environment = authInfo.environment ? authInfo.environment.toUpperCase() : 'UNKNOWN ENV';
  const isAuthenticated = !loading && Boolean(authInfo.isAuthenticated) && !forceLoginPrompt;

  const handleLogout = async (event) => {
    event.preventDefault();
    await logout();
  };

  return (
    <div className="collapse navbar-collapse" id="navbarResponsive">
      <div style={{ color: 'red', marginLeft: '2.9em', marginTop: '.4em', fontSize: '0.55rem' }}>
        {environment.toUpperCase() !== 'PRODUCTION' ? environment : ''}
      </div>
      <ul className="navbar-nav ms-auto me-2 my-3 my-lg-0 align-items-lg-center">
        <li className="nav-item">
          <span className="nav-link me-lg-0" style={{ cursor: 'default' }}>
            <i
              className="bi bi-person-circle"
              style={{ color: 'rgba(255,255,255,0.8)', marginRight: '0.5em', fontSize: '1.1em' }}
              aria-hidden="true"
            />
            <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.65rem' }}>{displayName}</span>
          </span>
        </li>
        <li className="nav-item" style={{ marginTop: '.3em' }}>
          {isAuthenticated ? (
            <button
              type="button"
              className="btn btn-link nav-link me-lg-3 py-0"
              onClick={handleLogout}
              title="Logout"
              aria-label="Logout"
              style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}
            >
              <i className="fa fa-sign-out" style={{ fontSize: '1.3em' }} aria-hidden="true" />
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-link nav-link me-lg-3 py-0"
              onClick={handleLogout}
              title="Login"
              aria-label="Login"
              style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}
            >
              <i className="bi bi-box-arrow-in-right" style={{ fontSize: '1.1em' }} aria-hidden="true" />
            </button>
          )}
        </li>
      </ul>
    </div>
  );
}

export default AuthStatus;
