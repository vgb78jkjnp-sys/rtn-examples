import { useMemo, useState } from 'react';

import PartMasterLayout from './components/PartMasterLayout';
import PartMasterSidebar, { PART_MASTER_COLUMNS } from './components/PartMasterSidebar';
import PartMasterTable from './components/PartMasterTable';
import MfgAlert from './components/MfgAlert';
import { invokeApi } from './utils/invokeApi';
import { parsePartMasterRowsResponse } from './utils/parsePartMasterRows';
import { exportRowsToCsv } from './utils/exportRowsToCsv';
import { sortPartMasterRows } from './utils/sortPartMasterRows';
import {
  applyColumnFilters,
  getDistinctColumnValues,
  isDateRangeFilter,
  isFullColumnSelection
} from './utils/columnFilter';
import { formatLikeMask, getDefaultPartIdMask, parseMaxRows } from './utils/likeMask';
import './App.css';
import 'font-awesome/css/font-awesome.min.css';

function formatDownloadTimestamp(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}-${hours}${minutes}${seconds}`;
}

function PartMasterList() {
  const [partId, setPartId] = useState(() => getDefaultPartIdMask());
  const [vendorLot, setVendorLot] = useState('%');
  const [vendorShipLot, setVendorShipLot] = useState('%');
  const [partNumber, setPartNumber] = useState('%');
  const [maxRows, setMaxRows] = useState('1000');
  const [hasSearched, setHasSearched] = useState(false);
  const [rows, setRows] = useState([]);
  const [sortColumn, setSortColumn] = useState('PartId');
  const [sortDirection, setSortDirection] = useState('desc');
  const [columnFilters, setColumnFilters] = useState({});
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ message: '', variant: 'success' });
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const isSidebarOpen = !isExpanded && !isSidebarCollapsed;

  const { invoke: invokeGetPartMasterRows } = invokeApi('POST', '/api/partservice/GETPARTMASTERROWS');

  const distinctColumnValues = useMemo(
    () => Object.fromEntries(
      PART_MASTER_COLUMNS
        .filter((column) => column.filterType !== 'dateRange')
        .map((column) => [
          column.key,
          getDistinctColumnValues(rows, column.key, columnFilters)
        ])
    ),
    [rows, columnFilters]
  );

  const filteredRows = useMemo(
    () => applyColumnFilters(rows, columnFilters),
    [rows, columnFilters]
  );

  const sortedRows = useMemo(
    () => sortPartMasterRows(filteredRows, sortColumn, sortDirection),
    [filteredRows, sortColumn, sortDirection]
  );

  const statusText = useMemo(() => {
    if (!hasSearched) {
      return 'No search run yet';
    }

    return `${rows.length} row${rows.length === 1 ? '' : 's'}`;
  }, [hasSearched, rows.length]);

  const buildSearchPayload = () => ({
    PartId: formatLikeMask(partId),
    VendorLot: formatLikeMask(vendorLot),
    VendorShipLot: formatLikeMask(vendorShipLot),
    PartNumber: formatLikeMask(partNumber),
    MaxRows: parseMaxRows(maxRows, 1000)
  });

  const handleSearch = async () => {
    setLoading(true);
    setAlert({ message: '', variant: 'success' });
    setColumnFilters({});
    setSortColumn('PartId');
    setSortDirection('desc');

    try {
      const data = await invokeGetPartMasterRows(buildSearchPayload());
      setRows(parsePartMasterRowsResponse(data));
      setHasSearched(true);
    } catch (err) {
      setAlert({ message: err?.message || 'Unable to load Part Master rows.', variant: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setPartId(getDefaultPartIdMask());
    setVendorLot('%');
    setVendorShipLot('%');
    setPartNumber('%');
    setMaxRows('1000');
    setRows([]);
    setHasSearched(false);
    setColumnFilters({});
    setSortColumn('PartId');
    setSortDirection('desc');
    setAlert({ message: '', variant: 'success' });
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
      columns: PART_MASTER_COLUMNS,
      fileName: `part-master-${formatDownloadTimestamp()}.csv`
    });
  };

  return (
    <PartMasterLayout title="Part Master List" isExpanded={isExpanded} resultsLayout>
      {loading && (
        <div
          className="d-flex align-items-center justify-content-center"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(255, 255, 255, 0.55)',
            zIndex: 2000
          }}
        >
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
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
          {!isExpanded && isSidebarCollapsed && (
            <div className="results-sidebar-rail">
              <button
                type="button"
                className="btn btn-link results-sidebar-toggle"
                onClick={() => setIsSidebarCollapsed(false)}
                aria-label="Show filters panel"
                title="Show filters"
              >
                <i className="bi bi-layout-sidebar" aria-hidden="true" />
              </button>
            </div>
          )}

          {isSidebarOpen && (
            <PartMasterSidebar
              partId={partId}
              vendorLot={vendorLot}
              vendorShipLot={vendorShipLot}
              partNumber={partNumber}
              maxRows={maxRows}
              statusText={statusText}
              loading={loading}
              onPartIdChange={(event) => setPartId(event.target.value)}
              onVendorLotChange={(event) => setVendorLot(event.target.value)}
              onVendorShipLotChange={(event) => setVendorShipLot(event.target.value)}
              onPartNumberChange={(event) => setPartNumber(event.target.value)}
              onMaxRowsChange={(event) => setMaxRows(event.target.value)}
              onSearch={handleSearch}
              onReset={handleReset}
              onHide={() => setIsSidebarCollapsed(true)}
            />
          )}

          <div
            className={`runs-list ${isExpanded || isSidebarCollapsed ? 'runs-list-full' : 'col-10'}`}
          >
            <div
              className="mb-1 d-flex align-items-center justify-content-between"
              style={{ fontWeight: 500, fontSize: '1.0rem' }}
            >
              <div className="d-flex align-items-center">
                <i className="bi bi-list-columns me-2" aria-hidden="true" style={{ fontSize: '1.3em' }}></i>
                Part Master List
              </div>
              <div className="d-flex align-items-center gap-2">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary"
                  onClick={handleDownload}
                  disabled={loading || sortedRows.length === 0}
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
              <PartMasterTable
                rows={sortedRows}
                totalRowCount={rows.length}
                hasSearched={hasSearched}
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
    </PartMasterLayout>
  );
}

export default PartMasterList;
