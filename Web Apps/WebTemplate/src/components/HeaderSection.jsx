// components/SectionHeader.jsx
import React from 'react';
import { appConfig } from '../config/application.config';

// Central helper to process the library prefix
const getIconClassName = (iconConfig) => {
  if (!iconConfig) return '';
  const { provider, name } = iconConfig;

  switch (provider) {
    case 'font-awesome':
      return `fa fa-${name}`;
    case 'bootstrap-icons':
      return `bi bi-${name}`;
    default:
      return name;
  }
};

export function SectionHeader({ title, sectionKey }) {
  // Fetch the specific section data from the config using the passed prop key
  const sectionData = appConfig.sections[sectionKey];

  if (!sectionData) {
    console.warn(`Section key "${sectionKey}" not found in configuration.`);
    return null;
  }

  const { icon } = sectionData;
  const finalIconClass = `${getIconClassName(icon)} sub-header-icon`;

  return (
    <section id={sectionKey} className="dynamic-section">
      <i className={finalIconClass} aria-hidden="true" />
      <div className="container-fluid">
        <h4 style={{ color: 'white' }}>{title}</h4>
      </div>
    </section>
  );
}