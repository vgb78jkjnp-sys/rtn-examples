//ChangelogBadge.jsx - A React component for displaying a changelog badge and modal for new feature enhancements.
import { useMemo, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { appConfig } from '../config/application.config';
import { RELEASE_CHANGES } from '../config/changelog.config';
import './ChangelogBadge.css';

const STORAGE_KEY = `${appConfig.applicationName}.Changelog.dismissed`;

const formatReleaseDate = (releaseDate) => {
  const parsedDate = new Date(releaseDate);
  if (Number.isNaN(parsedDate.getTime())) {
    return releaseDate;
  }

  return parsedDate.toLocaleString();
};

const getEnhancements = () => (
  RELEASE_CHANGES
    .filter((change) => change.type === 'enhancement')
    .sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate))
);

function ChangelogBadge() {
  const enhancements = useMemo(() => getEnhancements(), []);
  const latestEnhancementDate = enhancements[0]?.releaseDate ?? '';

  const [showBadge, setShowBadge] = useState(() => {
    if (enhancements.length === 0) {
      return false;
    }

    const dismissedReleaseDate = localStorage.getItem(STORAGE_KEY);
    if (!dismissedReleaseDate) {
      return true;
    }

    return new Date(latestEnhancementDate) > new Date(dismissedReleaseDate);
  });
  const [showModal, setShowModal] = useState(false);

  if (enhancements.length === 0) {
    return null;
  }

  const handleBadgeClick = () => {
    localStorage.setItem(STORAGE_KEY, latestEnhancementDate);
    setShowBadge(false);
    setShowModal(true);
  };

  return (
    <>
      {showBadge && (
        <div className="changelog-badge-wrap">
          <button
            type="button"
            className="changelog-badge"
            onClick={handleBadgeClick}
            title="View latest enhancements"
          >
            <i className="bi bi-lightbulb" aria-hidden="true"></i>
            <span>New feature enhancements, click for more information</span>
          </button>
        </div>
      )}

      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        dialogClassName="changelog-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title style={{fontSize: '1rem', fontWeight: 'bold'}}>
            <i className="bi bi-lightbulb me-2" aria-hidden="true"></i>
            New Feature Enhancements
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ul className="changelog-list">
            {enhancements.map((enhancement) => (
              <li key={enhancement.id} className="changelog-item">
                <div className="changelog-title">{enhancement.title}</div>
                <div className="changelog-date">
                  {formatReleaseDate(enhancement.releaseDate)}
                </div>
              </li>
            ))}
          </ul>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default ChangelogBadge;
