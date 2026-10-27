import { useState } from 'react';
import MainLayout from '../components/MainLayout';
import UxcAlert from '../components/UxcAlert';
import { appConfig } from '../config/application.config';
import '../App.css';

function ExamplePage() {
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertVariant, setAlertVariant] = useState('warning');

  const handleOpenChatbot = () => {
    setAlertMessage('The AI chatbot will be available in a future release.');
    setAlertVariant('warning');
    setShowAlert(true);
  };

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

      <MainLayout pageTitle="Example Page">
        <div className="container-fluid">
          <div className="row">
            <div className="col">Example page</div>
          </div>
        </div>
      </MainLayout>

      <a
        href={`/apps/${appConfig.applicationId}/about/${appConfig.applicationName}UserManual.pdf`}
        target="_blank"
        rel="noopener noreferrer"
        title="Help Center"
        aria-label="Open the user manual"
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
          color: '#317ef1',
          textDecoration: 'none'
        }}
      >
        <i className="fa fa-info-circle" style={{ fontSize: '2rem' }} aria-hidden="true" />
      </a>

      <button
        type="button"
        onClick={handleOpenChatbot}
        title="AI Chatbot"
        aria-label="Open AI chatbot"
        style={{
          position: 'fixed',
          top: 'calc(50% + 64px)',
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
          cursor: 'pointer',
          border: 'none',
          color: '#317ef1'
        }}
      >
        <i className="fa fa-commenting" style={{ fontSize: '1.6rem' }} aria-hidden="true" />
      </button>
    </>
  );
}

export default ExamplePage;
