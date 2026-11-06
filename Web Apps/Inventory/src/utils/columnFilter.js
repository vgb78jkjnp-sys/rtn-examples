import { BLANK_COLUMN_LABEL, getColumnFilterKey, getColumnValue } from './columnValue';

export function isDateRangeFilter(filter) {
  return Boolean(
    filter
    && typeof filter === 'object'
    && !(filter instanceof Set)
    && ('from' in filter || 'to' in filter)
  );
}

function parseIsoDateStart(isoDate) {
  if (!isoDate) {
    return null;
  }

  const parsed = new Date(`${isoDate}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function parseIsoDateEnd(isoDate) {
  if (!isoDate) {
    return null;
  }

  const parsed = new Date(`${isoDate}T23:59:59.999`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function isColumnFilterValueActive(filter) {
  if (typeof filter === 'string') {
    return filter.trim().length > 0;
  }

  if (isDateRangeFilter(filter)) {
    return Boolean((filter.from ?? '').trim() || (filter.to ?? '').trim());
  }

  // An empty selection means every value was unchecked, which must hide all rows
  // rather than fall through to "no filter" and show them all.
  return filter instanceof Set;
}

function rowMatchesDateRangeFilter(row, columnKey, filter) {
  const parsedRowDate = Date.parse(getColumnValue(row, columnKey));
  if (Number.isNaN(parsedRowDate)) {
    return false;
  }

  const rowDate = new Date(parsedRowDate);
  const fromDate = parseIsoDateStart((filter.from ?? '').trim());
  const toDate = parseIsoDateEnd((filter.to ?? '').trim());

  if (fromDate && rowDate < fromDate) {
    return false;
  }

  if (toDate && rowDate > toDate) {
    return false;
  }

  return true;
}

function rowMatchesColumnFilter(row, columnKey, filter) {
  if (typeof filter === 'string') {
    const query = filter.trim().toLowerCase();
    if (!query) {
      return true;
    }

    return getColumnValue(row, columnKey).toLowerCase().includes(query);
  }

  if (isDateRangeFilter(filter)) {
    return rowMatchesDateRangeFilter(row, columnKey, filter);
  }

  return filter.has(getColumnFilterKey(row, columnKey));
}

export function getDistinctColumnValues(rows, columnKey, columnFilters = {}) {
  const filtersWithoutColumn = { ...columnFilters };
  delete filtersWithoutColumn[columnKey];

  const baseRows = applyColumnFilters(rows, filtersWithoutColumn);
  const values = new Set();
  let hasBlank = false;

  for (const row of baseRows) {
    const value = getColumnFilterKey(row, columnKey);
    if (value === BLANK_COLUMN_LABEL) {
      hasBlank = true;
    } else {
      values.add(value);
    }
  }

  const sorted = [...values].sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

  if (hasBlank) {
    sorted.push(BLANK_COLUMN_LABEL);
  }

  return sorted;
}

export function applyColumnFilters(rows, columnFilters = {}) {
  const activeFilters = Object.entries(columnFilters).filter(([, filter]) => isColumnFilterValueActive(filter));

  if (activeFilters.length === 0) {
    return rows;
  }

  return rows.filter((row) => activeFilters.every(([columnKey, filter]) => (
    rowMatchesColumnFilter(row, columnKey, filter)
  )));
}

export function isFullColumnSelection(distinctValues, selectedValues) {
  if (!distinctValues.length) {
    return true;
  }

  if (!selectedValues || selectedValues.size !== distinctValues.length) {
    return false;
  }

  return distinctValues.every((value) => selectedValues.has(value));
}

export function hasActiveColumnFilters(columnFilters = {}) {
  return Object.values(columnFilters).some((filter) => isColumnFilterValueActive(filter));
}

export function isColumnFilterActive(columnFilter, filterType = 'values') {
  if (filterType === 'text') {
    return typeof columnFilter === 'string' && columnFilter.trim().length > 0;
  }

  if (filterType === 'dateRange') {
    return isDateRangeFilter(columnFilter) && isColumnFilterValueActive(columnFilter);
  }

  return columnFilter instanceof Set;
}

export function isValidDateRange(from, to) {
  if (!from || !to) {
    return true;
  }

  return from <= to;
}
