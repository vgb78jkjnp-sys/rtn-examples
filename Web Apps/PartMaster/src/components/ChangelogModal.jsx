import { Modal } from 'react-bootstrap';
import { formatReleaseDate } from '../utils/changelogUtils';
import './ChangelogBadge.css';

function ChangelogModal({ show, onHide, title, iconClass, changes }) {
  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      dialogClassName="changelog-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title style={{ fontSize: '1rem', fontWeight: 'bold' }}>
          {iconClass ? (
            <i className={`bi ${iconClass} me-2`} aria-hidden="true"></i>
          ) : null}
          {title}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ul className="changelog-list">
          {changes.map((change) => (
            <li key={change.id} className="changelog-item">
              <div className="changelog-title">{change.title}</div>
              <div className="changelog-date">
                Version {change.version ? `${change.version} · ` : ''}{formatReleaseDate(change.releaseDate)}
              </div>
            </li>
          ))}
        </ul>
      </Modal.Body>
    </Modal>
  );
}

export default ChangelogModal;
