import { useMemo, useState } from 'react';

import InventoryLayout from './components/InventoryLayout';
import DataGridTable from './components/DataGridTable';
import ExcelFilePicker from './components/ExcelFilePicker';
import MfgAlert from './components/MfgAlert';
import { exportRowsToCsv } from './utils/exportRowsToCsv';
import { sortRowsByColumns } from './utils/sortRowsByColumns';
import { parseXlsWorkbook } from './utils/parseXlsWorkbook';
import { readExcelSheetNames } from './utils/readExcelSheetNames';
import {
  applyColumnFilters,
  getDistinctColumnValues,
  isDateRangeFilter,
  isFullColumnSelection
} from './utils/columnFilter';
import './App.css';
import 'font-awesome/css/font-awesome.min.css';

const EXCEL_EXTENSIONS = /\.(xlsx|xls)$/i;

function formatDownloadTimestamp(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}-${hours}${minutes}${seconds}`;
}

function isExcelFile(file) {
  if (!file) {
    return false;
  }

  return EXCEL_EXTENSIONS.test(file.name);
}

/** Lets React paint `loading` before synchronous Excel work runs. */
function yieldToRender() {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(resolve);
    });
  });
}

function XlsPage() {
  const [workbookBuffer, setWorkbookBuffer] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [sheetNames, setSheetNames] = useState([]);
  const [selectedSheetName, setSelectedSheetName] = useState('');
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [columnFilters, setColumnFilters] = useState({});
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ message: '', variant: 'success' });
  const [isExpanded, setIsExpanded] = useState(false);

  const distinctColumnValues = useMemo(
    () => Object.fromEntries(
      columns.map((column) => [
        column.key,
        getDistinctColumnValues(rows, column.key, columnFilters)
      ])
    ),
    [columns, rows, columnFilters]
  );

  const filteredRows = useMemo(
    () => applyColumnFilters(rows, columnFilters),
    [rows, columnFilters]
  );

  const sortedRows = useMemo(
    () => (columns.length
      ? sortRowsByColumns(filteredRows, sortColumn, sortDirection, columns)
      : []),
    [filteredRows, sortColumn, sortDirection, columns]
  );

  const handleFileSelected = async (file) => {
    setAlert({ message: '', variant: 'success' });
    setHasLoaded(false);
    setRows([]);
    setColumns([]);
    setColumnFilters({});
    setSortColumn('');
    setWorkbookBuffer(null);
    setSheetNames([]);
    setSelectedSheetName('');
    setSelectedFile(null);

    if (!file) {
      return;
    }

    if (!isExcelFile(file)) {
      setAlert({ message: 'Choose an Excel file (.xlsx or .xls).', variant: 'danger' });
      return;
    }

    setLoading(true);
    try {
      await yieldToRender();
      const buffer = await file.arrayBuffer();
      const names = readExcelSheetNames(buffer);
      if (!names.length) {
        throw new Error('This workbook has no worksheets.');
      }

      setWorkbookBuffer(buffer);
      setSelectedFile(file);
      setSheetNames(names);
      setSelectedSheetName(names[0] ?? '');
    } catch (err) {
      setAlert({ message: err?.message || 'Unable to read the Excel file.', variant: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  const handleLoad = async () => {
    if (!workbookBuffer) {
      setAlert({ message: 'Choose an Excel file before loading.', variant: 'warning' });
      return;
    }

    if (!selectedSheetName) {
      setAlert({ message: 'Select a worksheet tab to load.', variant: 'warning' });
      return;
    }

    setLoading(true);
    setAlert({ message: '', variant: 'success' });

    try {
      await yieldToRender();
      const { rows: parsedRows, columns: parsedColumns, warnings } = parseXlsWorkbook(
        workbookBuffer,
        selectedSheetName
      );
      setColumns(parsedColumns);
      setRows(parsedRows);
      setHasLoaded(true);
      setColumnFilters({});
      setSortColumn(parsedColumns[0]?.key ?? '');
      setSortDirection('asc');

      if (warnings.length) {
        setAlert({ message: warnings.join(' '), variant: 'info' });
      }
    } catch (err) {
      setHasLoaded(false);
      setRows([]);
      setColumns([]);
      setAlert({ message: err?.message || 'Unable to load worksheet data.', variant: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  const handleColumnSort = (columnKey, direction) => {
    setSortColumn(columnKey);
    setSortDirection(direction);
  };

  const handleColumnFilterApply = (columnKey, filterValue) => {
    const nextFilters = { ...columnFilters };

    if (typeof filterValue === 'string') {
      if (!filterValue.trim()) {
        delete nextFilters[columnKey];
      } else {
        nextFilters[columnKey] = filterValue.trim();
      }
    } else if (isDateRangeFilter(filterValue)) {
      const from = (filterValue.from ?? '').trim();
      const to = (filterValue.to ?? '').trim();

      if (!from && !to) {
        delete nextFilters[columnKey];
      } else {
        nextFilters[columnKey] = { from, to };
      }
    } else {
      const distinctValues = distinctColumnValues[columnKey] ?? [];

      if (isFullColumnSelection(distinctValues, filterValue)) {
        delete nextFilters[columnKey];
      } else {
        nextFilters[columnKey] = new Set(filterValue);
      }
    }

    setColumnFilters(nextFilters);
  };

  const handleColumnFilterClear = (columnKey) => {
    setColumnFilters((current) => {
      const next = { ...current };
      delete next[columnKey];
      return next;
    });
  };

  const handleDownload = () => {
    exportRowsToCsv({
      rows: sortedRows,
      columns,
      fileName: `spreadsheet-${formatDownloadTimestamp()}.csv`
    });
  };

  const canLoad = Boolean(workbookBuffer && selectedSheetName);

  return (
    <InventoryLayout title="Spreadsheet" isExpanded={isExpanded} resultsLayout>
      {loading && (
        <div
          className="d-flex align-items-center justify-content-center"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(255, 255, 255, 0.55)',
            zIndex: 2500
          }}
          aria-live="polite"
          aria-busy="true"
        >
          <div className="text-center">
            <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
              <span className="visually-hidden">Loading...</span>
            </div>
            <div className="text-muted mt-2" style={{ fontSize: '0.9rem' }}>Loading…</div>
          </div>
        </div>
      )}

      <MfgAlert
        message={alert.message}
        variant={alert.variant}
        onClose={() => setAlert({ message: '', variant: 'success' })}
      />

      <div className={`container-fluid results-shell ${isExpanded ? 'results-expanded' : ''}`}>
        <div className="row results-row g-0">
          <div className="runs-list runs-list-full">
            <div
              className="mb-1 d-flex align-items-center justify-content-between flex-wrap gap-2"
              style={{ fontWeight: 500, fontSize: '1.0rem' }}
            >
              <div className="d-flex align-items-center">
                <i className="bi bi-list-columns me-2" aria-hidden="true" style={{ fontSize: '1.3em' }}></i>
                Spreadsheet
              </div>
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <ExcelFilePicker
                  disabled={loading}
                  selectedFile={selectedFile}
                  onFileSelected={handleFileSelected}
                />
                <label className="d-flex align-items-center gap-1 mb-0" style={{ fontSize: '0.8rem' }}>
                  <span className="text-muted">Worksheet</span>
                  <select
                    className="form-select form-select-sm"
                    style={{ width: 'auto', minWidth: '8rem' }}
                    value={selectedSheetName}
                    onChange={(event) => setSelectedSheetName(event.target.value)}
                    disabled={loading || !sheetNames.length}
                    aria-label="Worksheet tab"
                  >
                    {!sheetNames.length ? (
                      <option value="">—</option>
                    ) : (
                      sheetNames.map((name) => (
                        <option key={name} value={name}>{name}</option>
                      ))
                    )}
                  </select>
                </label>
                <button
                  type="button"
                  className="btn btn-sm btn-primary d-inline-flex align-items-center"
                  onClick={handleLoad}
                  disabled={loading || !canLoad}
                  aria-busy={loading}
                >
                  {loading ? (
                    <span
                      className="spinner-border spinner-border-sm me-1"
                      role="status"
                      aria-hidden="true"
                    />
                  ) : null}
                  Load
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary"
                  onClick={handleDownload}
                  disabled={loading || sortedRows.length === 0 || !columns.length}
                  title="Download current results to Excel"
                  aria-label="Download current results to Excel"
                >
                  <i className="fa fa-download me-1" aria-hidden="true" />
                  Download
                </button>
                <button
                  type="button"
                  className="btn btn-link results-expand-toggle"
                  onClick={() => setIsExpanded((prev) => !prev)}
                  aria-label={isExpanded ? 'Restore results area' : 'Expand results area'}
                  title={isExpanded ? 'Restore' : 'Expand'}
                >
                  <i className={`fa ${isExpanded ? 'fa-compress' : 'fa-expand'}`} aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="results-table-wrap">
              <DataGridTable
                columns={columns}
                rows={sortedRows}
                totalRowCount={rows.length}
                hasData={hasLoaded}
                emptyBeforeMessage="Choose an Excel file, select a worksheet tab, then click Load."
                emptyAfterMessage="No rows on this worksheet. Check the tab or column headers and try again."
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                onColumnSort={handleColumnSort}
                columnFilters={columnFilters}
                distinctColumnValues={distinctColumnValues}
                onColumnFilterApply={handleColumnFilterApply}
                onColumnFilterClear={handleColumnFilterClear}
              />
            </div>
          </div>
        </div>
      </div>
    </InventoryLayout>
  );
}

export default XlsPage;
