export const BLANK_COLUMN_LABEL = '(Blanks)';

export function getColumnValue(row, columnKey) {
  const value = row[columnKey];
  if (value === null || value === undefined) {
    return '';
  }

  return value.toString().trim();
}

export function getColumnFilterKey(row, columnKey) {
  const value = getColumnValue(row, columnKey);
  return value || BLANK_COLUMN_LABEL;
}
