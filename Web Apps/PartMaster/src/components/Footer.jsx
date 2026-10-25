import { useMemo, useState } from 'react';
import { version } from '../../package.json';
import ChangelogModal from './ChangelogModal';
import { getAllChanges } from '../utils/changelogUtils';
import './ChangelogBadge.css';

const Footer = () => {
  const [showChangelog, setShowChangelog] = useState(false);
  const allChanges = useMemo(() => getAllChanges(), []);

  return (
    <>
      <footer className="app-page-footer">
        <p>
          &copy; {new Date().getFullYear()} RTN Inc. All rights reserved. Version:{' '}
          <button
            type="button"
            className="footer-version-link"
            onClick={() => setShowChangelog(true)}
            title="View release notes"
          >
            {version}
          </button>
        </p>
      </footer>

      <ChangelogModal
        show={showChangelog}
        onHide={() => setShowChangelog(false)}
        title="Release Notes"
        iconClass="bi-journal-text"
        changes={allChanges}
      />
    </>
  );
};

export default Footer;
