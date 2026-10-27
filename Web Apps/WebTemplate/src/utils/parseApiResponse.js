function parseJsonIfString(value) {
  if (typeof value !== 'string') {
    return value;
  }

  const trimmed = value.trim();

  if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
    return value;
  }

  try {
    return JSON.parse(trimmed);
  } catch {
    return value;
  }
}

function isRowObject(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function normalizeDatasetValue(dataset, flattenSingleRowDatasets) {
  if (dataset === undefined || dataset === null) {
    return undefined;
  }

  const parsed = parseJsonIfString(dataset);

  if (Array.isArray(parsed)) {
    if (flattenSingleRowDatasets && parsed.length === 1 && isRowObject(parsed[0])) {
      return parsed[0];
    }

    return parsed;
  }

  if (isRowObject(parsed)) {
    if (Array.isArray(parsed.Rows)) {
      return normalizeDatasetValue(parsed.Rows, flattenSingleRowDatasets);
    }

    if (Array.isArray(parsed.rows)) {
      return normalizeDatasetValue(parsed.rows, flattenSingleRowDatasets);
    }

    if (Array.isArray(parsed.Table)) {
      return normalizeDatasetValue(parsed.Table, flattenSingleRowDatasets);
    }
  }

  return parsed;
}

export function mergeDataArrayEntries(dataArray) {
  const merged = {};

  if (!Array.isArray(dataArray)) {
    return merged;
  }

  for (const entry of dataArray) {
    const parsed = parseJsonIfString(entry);

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      continue;
    }

    Object.assign(merged, parsed);
  }

  return merged;
}

export function getTransactionRows(response, transactionName) {
  // Accept a bare array or a wrapped { Data/data: [...] } response object
  const dataArray = Array.isArray(response) ? response
    : Array.isArray(response?.Data) ? response.Data
    : Array.isArray(response?.data) ? response.data
    : [];

  const merged = mergeDataArrayEntries(dataArray);
  const rows = merged[transactionName];

  if (rows === undefined || rows === null) {
    return [];
  }

  return Array.isArray(rows) ? rows : [rows];
}

function resolveRawDatasets(response) {
  const root = parseJsonIfString(response);

  if (!root || typeof root !== 'object') {
    return {
      status: '',
      message: '',
      datasets: {}
    };
  }

  const status = root.Status ?? root.status ?? '';
  const message = root.Message ?? root.message ?? '';

  if (!Array.isArray(root.Data) && !Array.isArray(root.data)) {
    const directDatasets = { ...root };
    delete directDatasets.Status;
    delete directDatasets.status;
    delete directDatasets.Message;
    delete directDatasets.message;
    delete directDatasets.Data;
    delete directDatasets.data;

    return { status, message, datasets: directDatasets };
  }

  const dataArray = root.Data ?? root.data;
  return {
    status,
    message,
    datasets: mergeDataArrayEntries(dataArray)
  };
}

export class CommandApiResponse {
  constructor({ status = '', message = '', data = {}, flattenSingleRowDatasets = true } = {}) {
    this.status = status;
    this.message = message;
    this.flattenSingleRowDatasets = flattenSingleRowDatasets;
    this.data = data;
  }

  getDataset(datasetName) {
    if (!datasetName) {
      return undefined;
    }

    if (this.data[datasetName] !== undefined) {
      return this.data[datasetName];
    }

    const normalizedName = String(datasetName).toUpperCase();
    const matchedKey = Object.keys(this.data).find((key) => key.toUpperCase() === normalizedName);

    return matchedKey ? this.data[matchedKey] : undefined;
  }

  getRows(datasetName) {
    const dataset = this.getDataset(datasetName);

    if (dataset === undefined || dataset === null) {
      return [];
    }

    return Array.isArray(dataset) ? dataset : [dataset];
  }

  getValue(datasetName, fieldName, rowIndex = 0) {
    const rows = this.getRows(datasetName);
    const row = rows[rowIndex];

    if (!isRowObject(row) || !fieldName) {
      return undefined;
    }

    if (row[fieldName] !== undefined) {
      return row[fieldName];
    }

    const normalizedField = String(fieldName).toLowerCase();
    const matchedKey = Object.keys(row).find((key) => key.toLowerCase() === normalizedField);

    return matchedKey ? row[matchedKey] : undefined;
  }
}

export function parseApiResponse(response, options = {}) {
  const { flattenSingleRowDatasets = true } = options;
  const { status, message, datasets } = resolveRawDatasets(response);
  const data = {};

  for (const [datasetName, datasetValue] of Object.entries(datasets)) {
    const normalizedValue = normalizeDatasetValue(datasetValue, flattenSingleRowDatasets);

    if (normalizedValue !== undefined) {
      data[datasetName] = normalizedValue;
    }
  }

  return new CommandApiResponse({
    status,
    message,
    data,
    flattenSingleRowDatasets
  });
}

export default parseApiResponse;
