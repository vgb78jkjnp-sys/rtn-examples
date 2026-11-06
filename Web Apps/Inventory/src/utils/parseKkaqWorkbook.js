import * as XLSX from 'xlsx';
import { KKAQ_COLUMNS } from '../config/kkaqColumns';

const NUMBER_KEYS = new Set(
  KKAQ_COLUMNS.filter((column) => column.sortType === 'number').map((column) => column.key)
);

function normalizeHeaderLabel(value) {
  return String(value ?? '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

function buildHeaderMap(headerRow) {
  const labelToKey = Object.fromEntries(
    KKAQ_COLUMNS.map((column) => [normalizeHeaderLabel(column.label), column.key])
  );
  const columnIndexByKey = {};

  headerRow.forEach((cell, index) => {
    const key = labelToKey[normalizeHeaderLabel(cell)];
    if (key) {
      columnIndexByKey[key] = index;
    }
  });

  return columnIndexByKey;
}

function coerceCellValue(key, rawValue) {
  if (rawValue === null || rawValue === undefined || rawValue === '') {
    return '';
  }

  if (!NUMBER_KEYS.has(key)) {
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
  return Number.isFinite(parsed) ? parsed : text;
}

function createRowId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `row-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const TOTAL_LABEL_PATTERN = /^(grand\s+)?total(s)?$/i;

function isTrailingTotalRow(record) {
  const order = String(record.order ?? '').trim();
  const materialNumber = String(record.materialNumber ?? '').trim();

  if (TOTAL_LABEL_PATTERN.test(order) || TOTAL_LABEL_PATTERN.test(materialNumber)) {
    return true;
  }

  if (/total/i.test(order) && !/^\d/.test(order)) {
    return true;
  }

  const materialDescription = String(record.materialDescription ?? '').trim();
  if (TOTAL_LABEL_PATTERN.test(materialDescription)) {
    return true;
  }

  // SAP-style footer rows: no order/material id but aggregate values in other columns.
  if (!order && !materialNumber) {
    return KKAQ_COLUMNS.some((column) => {
      if (column.key === 'order' || column.key === 'materialNumber') {
        return false;
      }

      const value = record[column.key];
      return value !== '' && value !== null && value !== undefined;
    });
  }

  return false;
}

function trimTrailingTotalRows(rows) {
  let end = rows.length;
  while (end > 0 && isTrailingTotalRow(rows[end - 1])) {
    end -= 1;
  }

  return rows.slice(0, end);
}

function isKkaqReportRow(record) {
  return String(record.report ?? '').toUpperCase().includes('KKAQ');
}

export function parseKkaqWorkbook(arrayBuffer, sheetName) {
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const worksheet = workbook.Sheets[sheetName];

  if (!worksheet) {
    throw new Error(`Worksheet "${sheetName}" was not found in this workbook.`);
  }

  const table = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
  if (!table.length) {
    return { rows: [], warnings: ['The selected worksheet is empty.'], sheetName };
  }

  const headerRow = table[0];
  const columnIndexByKey = buildHeaderMap(headerRow);
  const warnings = [];

  const missingHeaders = KKAQ_COLUMNS
    .filter((column) => columnIndexByKey[column.key] === undefined)
    .map((column) => column.label);

  if (missingHeaders.length) {
    warnings.push(`Missing expected column(s): ${missingHeaders.join(', ')}`);
  }

  const parsedRows = table.slice(1)
    .filter((row) => row.some((cell) => String(cell ?? '').trim() !== ''))
    .map((row) => {
      const record = { rowId: createRowId() };
      KKAQ_COLUMNS.forEach((column) => {
        const index = columnIndexByKey[column.key];
        record[column.key] = index === undefined ? '' : coerceCellValue(column.key, row[index]);
      });
      return record;
    });

  const rows = trimTrailingTotalRows(parsedRows).filter(isKkaqReportRow);

  return { rows, warnings, sheetName };
}
