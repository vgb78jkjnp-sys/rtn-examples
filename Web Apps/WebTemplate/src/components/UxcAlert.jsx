import { useEffect, useRef } from 'react';
import { Alert, Modal } from 'react-bootstrap';
import './UxcAlert.css';

function UxcAlert({ message, variant = 'success', duration = 500 , onClose }) {
  const onCloseRef = useRef(onClose);
  const alertTitleMap = {
    success: 'Success',
    danger: 'Error',
    warning: 'Warning',
    info: 'Information'
  };
  const alertTitle = alertTitleMap[variant] || 'Alert';

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!message) {
      return;
    }

    if (duration <= 0 || variant === 'danger') {
      return;
    }

    const timerId = setTimeout(() => {
      onCloseRef.current?.();
    }, duration);

    return () => clearTimeout(timerId);
  }, [message, duration, variant]);

  if (!message) {
    return null;
  }

  return (
    <Modal
      show={Boolean(message)}
      onHide={onClose}
      centered
      backdrop="static"
      dialogClassName="uxc-alert-modal"
      contentClassName="uxc-alert-content"
    >
      <Modal.Header closeButton className="uxc-alert-header">
        <Modal.Title className="uxc-alert-title">{alertTitle}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="uxc-alert-body">
        <Alert variant={variant} className="mb-0 uxc-alert-box">
          {message}
        </Alert>
      </Modal.Body>
      <Modal.Footer className="uxc-alert-footer">
        <button type="button" className="uxc-alert-ok-button" onClick={onClose}>
          OK
        </button>
      </Modal.Footer>
    </Modal>
  );
}

export default UxcAlert;