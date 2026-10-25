const PART_MASTER_COLUMNS = [
  { key: 'PartId', label: 'Part Id', sortType: 'string' },
  { key: 'VendorId', label: 'Vendor Id', sortType: 'string' },
  { key: 'VendorLot', label: 'Vendor Lot', sortType: 'string' },
  { key: 'PartNumber', label: 'Part Number', sortType: 'string' },
  { key: 'PartNumberRev', label: 'Rev.', sortType: 'string' },
  { key: 'EntryDate', label: 'Entry Date', sortType: 'date', filterType: 'dateRange' },
  { key: 'EWO', label: 'EWO', sortType: 'string' },
  { key: 'PartStatus', label: 'Part Status', sortType: 'string' },
  { key: 'EmployeeId', label: 'Employee Id', sortType: 'string' },
  { key: 'LastUpdateDate', label: 'Last Update Date', sortType: 'date', filterType: 'dateRange' },
  { key: 'Quantity', label: 'Quantity', sortType: 'number' },
  { key: 'CustomerPartNumber', label: 'Customer Part Number', sortType: 'string' },
  { key: 'VendorShipLot', label: 'Vendor Ship Lot', sortType: 'string' },
  { key: 'VendorWaffleId', label: 'Vendor Waffle Id', sortType: 'string' },
  { key: 'VendorWaffleLocation', label: 'Vendor Waffle Location', sortType: 'string' }
];

function PartMasterSidebar({
  partId,
  vendorLot,
  vendorShipLot,
  partNumber,
  maxRows,
  statusText,
  loading,
  onPartIdChange,
  onVendorLotChange,
  onVendorShipLotChange,
  onPartNumberChange,
  onMaxRowsChange,
  onSearch,
  onReset,
  onHide
}) {
  return (
    <div className="search-panel col-2">
      <form
        className="search-panel-form"
        onSubmit={(event) => {
          event.preventDefault();
          onSearch();
        }}
      >
        <div className="search-panel-toolbar">
          <button
            type="button"
            className="btn btn-link results-sidebar-toggle"
            onClick={onHide}
            aria-label="Hide filters panel"
            title="Hide filters"
          >
            <i className="bi bi-layout-sidebar-inset" aria-hidden="true" />
          </button>
        </div>
        <div className="search-panel-scroll">
          <label className="form-label mb-1" style={{ fontSize: '0.75rem' }}>Part Id</label>
          <input
            type="text"
            className="form-control mb-2"
            placeholder="LIKE mask (e.g. 20260908%)"
            value={partId}
            onChange={onPartIdChange}
          />

          <label className="form-label mb-1" style={{ fontSize: '0.75rem' }}>Vendor Lot</label>
          <input
            type="text"
            className="form-control mb-2"
            placeholder="LIKE mask (e.g. %)"
            value={vendorLot}
            onChange={onVendorLotChange}
          />

          <label className="form-label mb-1" style={{ fontSize: '0.75rem' }}>Vendor Ship Lot/Waffle Pack</label>
          <input
            type="text"
            className="form-control mb-2"
            placeholder="LIKE mask (e.g. %)"
            value={vendorShipLot}
            onChange={onVendorShipLotChange}
          />

          <label className="form-label mb-1" style={{ fontSize: '0.75rem' }}>Part Number</label>
          <input
            type="text"
            className="form-control mb-2"
            placeholder="LIKE mask (e.g. %)"
            value={partNumber}
            onChange={onPartNumberChange}
          />

          <label className="form-label mb-1" style={{ fontSize: '0.75rem' }}>Max Rows</label>
          <input
            type="number"
            className="form-control mb-2"
            min="1"
            value={maxRows}
            onChange={onMaxRowsChange}
          />

          <p className="text-muted mt-2 mb-0" style={{ fontSize: '0.75rem' }}>
            {statusText}
          </p>
          <p className="text-muted mb-0" style={{ fontSize: '0.7rem' }}>
            Use SQL LIKE masks (% and _). Empty fields become %.
          </p>
        </div>

        <div className="search-panel-actions">
          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            Search
          </button>
          <button type="button" className="btn btn-primary mt-2 w-100" onClick={onReset} disabled={loading}>
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}

export { PART_MASTER_COLUMNS };
export default PartMasterSidebar;
