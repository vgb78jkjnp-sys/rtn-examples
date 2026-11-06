import { getColumnValue } from './columnValue';

function buildSortTypes(columns) {
  return Object.fromEntries(columns.map((column) => [column.key, column.sortType ?? 'string']));
}

function getSortValue(row, columnKey, sortTypes) {
  const type = sortTypes[columnKey] ?? 'string';
  const value = getColumnValue(row, columnKey);

  if (type === 'number') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  if (type === 'date') {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  return value.toLowerCase();
}

export function sortRowsByColumns(rows, sortColumn, sortDirection, columns) {
  if (!rows.length) {
    return [];
  }

  const sortTypes = buildSortTypes(columns);
  const type = sortTypes[sortColumn] ?? 'string';

  return [...rows].sort((a, b) => {
    const aValue = getSortValue(a, sortColumn, sortTypes);
    const bValue = getSortValue(b, sortColumn, sortTypes);
    const comparison = type === 'number' || type === 'date'
      ? aValue - bValue
      : String(aValue).localeCompare(String(bValue), undefined, { numeric: true, sensitivity: 'base' });

    return sortDirection === 'asc' ? comparison : -comparison;
  });
}
