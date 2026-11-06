import * as XLSX from 'xlsx';

function createRowId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `row-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function isNumericCell(rawValue) {
  if (rawValue === null || rawValue === undefined || rawValue === '') {
    return true;
  }

  if (typeof rawValue === 'number' && Number.isFinite(rawValue)) {
    return true;
  }

  const text = String(rawValue).trim().replace(/,/g, '');
  if (!text) {
    return true;
  }

  const parsed = Number(text);
  return Number.isFinite(parsed);
}

function coerceCellValue(rawValue, sortType) {
  if (rawValue === null || rawValue === undefined || rawValue === '') {
    return '';
  }

  if (sortType !== 'number') {
    return String(rawValue).trim();
  }

  if (typeof rawValue === 'number' && Number.isFinite(rawValue)) {
    return rawValue;
  }

  const text = String(rawValue).trim().replace(/,/g, '');
  if (!text) {
    return '';
  }

  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : String(rawValue).trim();
}

function inferSortType(dataRows, columnIndex) {
  let sawValue = false;

  for (const row of dataRows) {
    const raw = row[columnIndex];
    if (raw === null || raw === undefined || String(raw).trim() === '') {
      continue;
    }

    sawValue = true;
    if (!isNumericCell(raw)) {
      return 'string';
    }
  }

  return sawValue ? 'number' : 'string';
}

function buildColumns(headerRow, dataRows) {
  const width = Math.max(
    headerRow.length,
    dataRows.reduce((max, row) => Math.max(max, row?.length ?? 0), 0)
  );

  const columns = [];
  for (let index = 0; index < width; index += 1) {
    const label = String(headerRow[index] ?? '').trim();
    if (!label) {
      continue;
    }

    const sortType = inferSortType(dataRows, index);
    columns.push({
      key: `col_${index}`,
      label,
      sortType,
      filterType: 'values'
    });
  }

  return columns;
}

export function parseXlsWorkbook(arrayBuffer, sheetName) {
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const worksheet = workbook.Sheets[sheetName];

  if (!worksheet) {
    throw new Error(`Worksheet "${sheetName}" was not found in this workbook.`);
  }

  const table = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
  const warnings = [];

  if (!table.length) {
    return { columns: [], rows: [], warnings: ['The selected worksheet is empty.'], sheetName };
  }

  const headerRow = table[0];
  const dataRows = table.slice(1).filter((row) =>
    row.some((cell) => String(cell ?? '').trim() !== '')
  );

  const columns = buildColumns(headerRow, dataRows);

  if (!columns.length) {
    warnings.push('No column headers were found on this worksheet.');
    return { columns: [], rows: [], warnings, sheetName };
  }

  if (!dataRows.length) {
    warnings.push('No data rows found below the header row.');
  }

  const rows = dataRows.map((row) => {
    const record = { rowId: createRowId() };
    columns.forEach((column) => {
      const sheetIndex = Number(column.key.replace(/^col_/, ''));
      record[column.key] = coerceCellValue(row[sheetIndex], column.sortType);
    });
    return record;
  });

  return { columns, rows, warnings, sheetName };
}
