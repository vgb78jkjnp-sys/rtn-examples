import { useAuth } from '../context/useAuth';

function AuthStatus() {
  const { authInfo, loading } = useAuth();

  //const displayName = loading ? 'Loading...' : authInfo.name || 'Guest';
  const displayName = loading ? 'Loading...' : authInfo.name || 'Guest';
  const environment = authInfo.environment ? authInfo.environment.toUpperCase() : 'UNKNOWN ENV';

  return (
    <div className="collapse navbar-collapse" id="navbarResponsive">
      <div style={{color: 'red', marginLeft: '2.9em', marginTop: '.4em', fontSize: '0.55rem' }}>{environment.toUpperCase() !== 'PRODUCTION' ? environment : ''}</div>
      <ul className ="navbar-nav ms-auto me-4 my-3 my-lg-0">
          <li className="nav-item"><a className="nav-link me-lg-3" href="#features"></a></li>
          <li className="nav-item">
            <a className="nav-link me-lg-3" href="#download">
              <i className="bi bi-person-circle" style={{color: 'rgba(255,255,255,0.8)', marginRight: '0.5em', fontSize: '1.1em'}}></i>
              <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.65rem' }}>{displayName}</span>                
            </a>              
          </li>
      </ul>
    </div>
  );
}

export default AuthStatus;