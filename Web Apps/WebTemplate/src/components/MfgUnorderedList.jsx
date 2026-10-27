import React from 'react';

/**
 * Reusable list component for displaying a list of items.
 * @param {Object} props
 * @param {string} props.className - CSS class for the <ul>
 * @param {string} [props.classNameItem] - Optional CSS class for each <li>
 * @param {Object} props.style - Inline style for the <ul>
 * @param {Array} props.items - Array of objects to display
 * @param {string} props.keyField - Field name to use as key (e.g., 'id')
 * @param {string|Array} props.valueField - Field name(s) to display as value (e.g., 'name' or {['name', 'desc']})
 */
function MfgUnorderedList({ className, classNameItem, style, items, keyField = 'id', valueField = 'name' }) {
  if (!items || items.length === 0) return null;
  return (
    <ul className={className} style={style}>
      {items.map(item => (
        <li key={item[keyField]} className={classNameItem}>
          {Array.isArray(valueField)
            ? valueField.map((field, idx) => (
                <span key={field} style={{ marginRight: 8 }}>
                  {item[field]}
                </span>
              ))
            : item[valueField]}
        </li>
      ))}
    </ul>
  );
}

export default MfgUnorderedList;