import { PART_MASTER_COLUMNS } from '../components/PartMasterSidebar';
import { getColumnValue } from './columnValue';

const SORT_TYPES = Object.fromEntries(
  PART_MASTER_COLUMNS.map((column) => [column.key, column.sortType ?? 'string'])
);

function getSortValue(row, columnKey) {
  const type = SORT_TYPES[columnKey] ?? 'string';
  const value = getColumnValue(row, columnKey);

  if (type === 'number') {
    return Number(value) || 0;
  }

  if (type === 'date') {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  return value.toLowerCase();
}

export function sortPartMasterRows(rows, sortColumn, sortDirection) {
  if (!rows.length) {
    return [];
  }

  const type = SORT_TYPES[sortColumn] ?? 'string';

  return [...rows].sort((a, b) => {
    const aValue = getSortValue(a, sortColumn);
    const bValue = getSortValue(b, sortColumn);
    const comparison = type === 'number' || type === 'date'
      ? aValue - bValue
      : aValue.localeCompare(bValue, undefined, { numeric: true, sensitivity: 'base' });

    return sortDirection === 'asc' ? comparison : -comparison;
  });
}
