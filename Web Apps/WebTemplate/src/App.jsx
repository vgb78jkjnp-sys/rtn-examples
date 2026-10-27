import { useCallback, useEffect, useRef, useState } from 'react';
import React from 'react';
import ChangelogBadge from './components/ChangelogBadge';
import { Link, useNavigate } from 'react-router-dom';
import './App.css';
import 'font-awesome/css/font-awesome.min.css';
import MainLayout from './components/MainLayout';
import UxcAlert from './components/UxcAlert';
import parseApiResponse from './utils/parseApiResponse';
import { usePageLoading } from './context/PageLoadingContext';
import { appConfig } from './config/application.config';

function App() {
  const navigate = useNavigate();
  const pageLoading = usePageLoading();

  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertVariant, setAlertVariant] = useState('info');

  return (
    <>
      {showAlert && (
        <UxcAlert
          message={alertMessage}
          variant={alertVariant}
          duration={6000}
          onClose={() => setShowAlert(false)}
        />
      )}

      <MainLayout pageTitle="Dashboard">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <ChangelogBadge />
            </div>
          </div>
          <div className="row">
            <div className="col-12">
              <div>
                <i className="fa fa-tachometer" style={{ fontSize: '2rem', color: '#317ef1', marginRight: '10px' }} aria-hidden="true"></i>
                <span style={{ fontSize: '1.5rem', fontWeight: '500', color: '#317ef1' }}>Dashboard</span>
              </div>

              <p className="text-muted mb-3">Description of the dashboard and its features.</p>
              
            </div>
          </div>

        </div>
      </MainLayout>

      <div
        style={{
          position: 'fixed',
          top: '50%',
          right: '24px',
          transform: 'translateY(-50%)',
          zIndex: 2000,
          background: 'white',
          borderRadius: '50%',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          width: '48px',
          height: '48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer'
        }}
        title="Help Center"
      >
        <a href={`/apps/${appConfig.applicationId}/about/${appConfig.applicationName}UserManual.pdf`} target="_blank" rel="noopener noreferrer" style={{ color: '#317ef1' }}>
          <i className="bi bi-info-circle" style={{ fontSize: '2rem', color: '#317ef1' }} aria-hidden="true"></i>
        </a>		
      </div>

      <div className="ticks"></div>
      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  );
}

export default App;
