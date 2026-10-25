import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { isColumnFilterActive, isDateRangeFilter, isValidDateRange } from '../utils/columnFilter';

const DROPDOWN_WIDTH = 272;

function getSortLabels(sortType) {
  if (sortType === 'date') {
    return {
      asc: 'Sort Oldest to Newest',
      desc: 'Sort Newest to Oldest'
    };
  }

  if (sortType === 'number') {
    return {
      asc: 'Sort Smallest to Largest',
      desc: 'Sort Largest to Smallest'
    };
  }

  return {
    asc: 'Sort A to Z',
    desc: 'Sort Z to A'
  };
}

function DatePickerField({ id, label, value, onChange, autoFocus = false }) {
  const inputRef = useRef(null);

  const openPicker = () => {
    const input = inputRef.current;
    if (!input) {
      return;
    }

    input.focus();
    if (typeof input.showPicker === 'function') {
      input.showPicker();
    }
  };

  return (
    <div className="column-filter-date-field">
      <label className="column-filter-text-label" htmlFor={id}>
        {label}
      </label>
      <div className="column-filter-date-input-wrap">
        <input
          ref={inputRef}
          id={id}
          type="date"
          className="form-control form-control-sm column-filter-date-input"
          value={value}
          onChange={onChange}
          autoFocus={autoFocus}
        />
        <button
          type="button"
          className="column-filter-date-picker-btn"
          onClick={openPicker}
          aria-label={`Open calendar for ${label} date`}
          title={`Choose ${label} date`}
        >
          <i className="fa fa-calendar" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

function FilterCheckboxOption({ value, index, isSelected, onToggle }) {
  const shiftRef = useRef(false);

  return (
    <label className="column-filter-option">
      <input
        type="checkbox"
        className="form-check-input"
        checked={isSelected}
        onMouseDown={(event) => {
          shiftRef.current = event.shiftKey;
        }}
        onChange={() => {
          onToggle(value, index, { shiftKey: shiftRef.current });
        }}
      />
      <span>{value}</span>
    </label>
  );
}

function FilterColumnHeader({
  columnKey,
  label,
  sortType,
  filterType = 'values',
  sortColumn,
  sortDirection,
  onColumnSort,
  className,
  distinctValues,
  columnFilter,
  onApply,
  onClear
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [draftSelected, setDraftSelected] = useState(() => new Set());
  const [draftText, setDraftText] = useState('');
  const [draftFrom, setDraftFrom] = useState('');
  const [draftTo, setDraftTo] = useState('');
  const [dateRangeError, setDateRangeError] = useState('');
  const [dropdownStyle, setDropdownStyle] = useState(null);
  const headerRef = useRef(null);
  const dropdownRef = useRef(null);
  const selectionAnchorIndexRef = useRef(null);
  const preSearchSelectionRef = useRef(null);
  const sortLabels = getSortLabels(sortType);
  const isTextFilter = filterType === 'text';
  const isDateRangeFilterType = filterType === 'dateRange';

  const isFilterActive = isColumnFilterActive(columnFilter, filterType);
  const isColumnSortActive = sortColumn === columnKey;

  const visibleValues = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    if (!query) {
      return distinctValues;
    }

    return distinctValues.filter((value) => value.toLowerCase().includes(query));
  }, [distinctValues, searchText]);

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    setSearchText('');
    setDateRangeError('');
    setDropdownStyle(null);
    selectionAnchorIndexRef.current = null;
    preSearchSelectionRef.current = null;
  }, []);

  const updateDropdownPosition = useCallback(() => {
    if (!headerRef.current) {
      return;
    }

    const rect = headerRef.current.getBoundingClientRect();
    let left = rect.left;
    const maxLeft = window.innerWidth - DROPDOWN_WIDTH - 8;

    if (left > maxLeft) {
      left = Math.max(8, maxLeft);
    }

    setDropdownStyle({
      position: 'fixed',
      top: rect.bottom + 2,
      left,
      width: DROPDOWN_WIDTH,
      zIndex: 2000
    });
  }, []);

  const openDropdown = () => {
    if (isTextFilter) {
      setDraftText(typeof columnFilter === 'string' ? columnFilter : '');
    } else if (isDateRangeFilterType) {
      const currentFilter = isDateRangeFilter(columnFilter) ? columnFilter : { from: '', to: '' };
      setDraftFrom(currentFilter.from ?? '');
      setDraftTo(currentFilter.to ?? '');
      setDateRangeError('');
    } else {
      const initialSelection = columnFilter instanceof Set ? columnFilter : new Set(distinctValues);
      setDraftSelected(new Set(initialSelection));
    }
    setSearchText('');
    selectionAnchorIndexRef.current = null;
    preSearchSelectionRef.current = null;
    setIsOpen(true);
  };

  // Typing a search selects just the matches, so OK filters to them (like Excel).
  // Clearing the search restores the selection from before the search started.
  const handleSearchChange = (event) => {
    const nextText = event.target.value;
    const query = nextText.trim().toLowerCase();

    setSearchText(nextText);
    selectionAnchorIndexRef.current = null;

    if (!query) {
      if (preSearchSelectionRef.current) {
        setDraftSelected(new Set(preSearchSelectionRef.current));
        preSearchSelectionRef.current = null;
      }
      return;
    }

    if (!preSearchSelectionRef.current) {
      preSearchSelectionRef.current = new Set(draftSelected);
    }

    setDraftSelected(new Set(distinctValues.filter((value) => value.toLowerCase().includes(query))));
  };

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    updateDropdownPosition();

    const handlePointerDown = (event) => {
      const inHeader = headerRef.current?.contains(event.target);
      const inDropdown = dropdownRef.current?.contains(event.target);
      if (!inHeader && !inDropdown) {
        closeDropdown();
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeDropdown();
      }
    };

    const handleReposition = () => {
      updateDropdownPosition();
    };

    const handleScroll = (event) => {
      if (dropdownRef.current?.contains(event.target)) {
        return;
      }

      closeDropdown();
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleReposition);
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleReposition);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [closeDropdown, isOpen, updateDropdownPosition]);

  const toggleValue = (value, index, { shiftKey }) => {
    setDraftSelected((current) => {
      const next = new Set(current);
      const isCurrentlySelected = current.has(value);
      const willSelect = !isCurrentlySelected;

      if (shiftKey && selectionAnchorIndexRef.current !== null) {
        const start = Math.min(selectionAnchorIndexRef.current, index);
        const end = Math.max(selectionAnchorIndexRef.current, index);

        for (let i = start; i <= end; i += 1) {
          const rangeValue = visibleValues[i];
          if (willSelect) {
            next.add(rangeValue);
          } else {
            next.delete(rangeValue);
          }
        }
      } else if (isCurrentlySelected) {
        next.delete(value);
      } else {
        next.add(value);
      }

      return next;
    });

    if (!shiftKey || selectionAnchorIndexRef.current === null) {
      selectionAnchorIndexRef.current = index;
    }
  };

  const handleSelectAllVisible = () => {
    setDraftSelected((current) => {
      const next = new Set(current);
      visibleValues.forEach((value) => next.add(value));
      return next;
    });
    selectionAnchorIndexRef.current = null;
  };

  const handleDeselectAllVisible = () => {
    setDraftSelected((current) => {
      const next = new Set(current);
      visibleValues.forEach((value) => next.delete(value));
      return next;
    });
    selectionAnchorIndexRef.current = null;
  };

  const handleApply = () => {
    if (isTextFilter) {
      onApply(columnKey, draftText.trim());
      closeDropdown();
      return;
    }

    if (isDateRangeFilterType) {
      const from = draftFrom.trim();
      const to = draftTo.trim();

      if (!isValidDateRange(from, to)) {
        setDateRangeError('From date must be on or before To date.');
        return;
      }

      onApply(columnKey, { from, to });
      closeDropdown();
      return;
    }

    onApply(columnKey, new Set(draftSelected));
    closeDropdown();
  };

  const handleClear = () => {
    onClear(columnKey);
    closeDropdown();
  };

  const handleSort = (direction) => {
    onColumnSort(columnKey, direction);
    closeDropdown();
  };

  const dropdown = isOpen && dropdownStyle ? (
    <div
      ref={dropdownRef}
      className={`column-filter-dropdown ${isDateRangeFilterType ? 'column-filter-dropdown-date-range' : ''}`.trim()}
      style={dropdownStyle}
      onClick={(event) => event.stopPropagation()}
      onMouseDown={(event) => event.stopPropagation()}
    >
      <div className="column-filter-sort">
        <button
          type="button"
          className={`column-filter-sort-btn ${isColumnSortActive && sortDirection === 'asc' ? 'active' : ''}`.trim()}
          onClick={() => handleSort('asc')}
        >
          {sortLabels.asc}
        </button>
        <button
          type="button"
          className={`column-filter-sort-btn ${isColumnSortActive && sortDirection === 'desc' ? 'active' : ''}`.trim()}
          onClick={() => handleSort('desc')}
        >
          {sortLabels.desc}
        </button>
      </div>

      <div className="column-filter-divider" />

      {isTextFilter ? (
        <div className="column-filter-text">
          <label className="column-filter-text-label" htmlFor={`${columnKey}-text-filter`}>
            Text contains
          </label>
          <input
            id={`${columnKey}-text-filter`}
            type="text"
            className="form-control form-control-sm column-filter-search"
            placeholder="Enter text..."
            value={draftText}
            onChange={(event) => setDraftText(event.target.value)}
            autoFocus
          />
        </div>
      ) : isDateRangeFilterType ? (
        <div className="column-filter-date-range">
          <DatePickerField
            id={`${columnKey}-from-date`}
            label="From"
            value={draftFrom}
            onChange={(event) => {
              setDraftFrom(event.target.value);
              setDateRangeError('');
            }}
            autoFocus
          />
          <DatePickerField
            id={`${columnKey}-to-date`}
            label="To"
            value={draftTo}
            onChange={(event) => {
              setDraftTo(event.target.value);
              setDateRangeError('');
            }}
          />
          {dateRangeError ? (
            <div className="column-filter-date-error">{dateRangeError}</div>
          ) : null}
        </div>
      ) : (
        <>
          <input
            type="text"
            className="form-control form-control-sm column-filter-search"
            placeholder="Search..."
            value={searchText}
            onChange={handleSearchChange}
            autoFocus
          />

          <div className="column-filter-actions">
            <button type="button" className="btn btn-link btn-sm p-0" onClick={handleSelectAllVisible}>
              Select all
            </button>
            <span className="text-muted">|</span>
            <button type="button" className="btn btn-link btn-sm p-0" onClick={handleDeselectAllVisible}>
              Deselect all
            </button>
          </div>

          <div
            className="column-filter-list"
            role="listbox"
            aria-label={`${label} values`}
            onWheel={(event) => event.stopPropagation()}
          >
            {visibleValues.length === 0 ? (
              <div className="column-filter-empty text-muted">No matching values</div>
            ) : (
              visibleValues.map((value, index) => (
                <FilterCheckboxOption
                  key={value}
                  value={value}
                  index={index}
                  isSelected={draftSelected.has(value)}
                  onToggle={toggleValue}
                />
              ))
            )}
          </div>
        </>
      )}

      <div className="column-filter-footer">
        <button type="button" className="btn btn-sm btn-primary" onClick={handleApply}>
          OK
        </button>
        <button
          type="button"
          className="btn btn-sm btn-link"
          onClick={handleClear}
          disabled={!isFilterActive}
        >
          Clear Filter
        </button>
      </div>
    </div>
  ) : null;

  return (
    <th
      ref={headerRef}
      className={`column-filter-header ${className ?? ''}`.trim()}
    >
      <div className="column-filter-header-inner">
        <span className="column-filter-label">{label}</span>
        <button
          type="button"
          className={`column-filter-btn ${isFilterActive || isColumnSortActive ? 'column-filter-active' : ''}`.trim()}
          onClick={(event) => {
            event.stopPropagation();
            if (isOpen) {
              closeDropdown();
            } else {
              openDropdown();
            }
          }}
          aria-label={`Filter and sort ${label}`}
          aria-expanded={isOpen}
        >
          <i className="fa fa-filter" aria-hidden="true" />
        </button>
      </div>

      {dropdown ? createPortal(dropdown, document.body) : null}
    </th>
  );
}

export default FilterColumnHeader;
