function PartAssemblySidebar({
  serialMask,
  statusText,
  loading,
  onSerialMaskChange,
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
          <label className="form-label mb-1" style={{ fontSize: '0.75rem' }}>
            Serial number
          </label>
          <input
            type="text"
            className="form-control mb-2"
            value={serialMask}
            onChange={onSerialMaskChange}
            placeholder="XXM-00174960%"
            disabled={loading}
            spellCheck={false}
          />
          <div className="text-muted mb-2" style={{ fontSize: '0.65rem' }}>
            SQL LIKE mask (e.g. use % as wildcard).
          </div>
          <div className="text-muted mb-2" style={{ fontSize: '0.7rem' }}>
            {statusText}
          </div>
        </div>
        <div className="search-panel-actions">
          <button type="submit" className="btn btn-primary btn-sm w-100 mb-2" disabled={loading}>
            Search
          </button>
          <button type="button" className="btn btn-outline-secondary btn-sm w-100" onClick={onReset} disabled={loading}>
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}

export default PartAssemblySidebar;
