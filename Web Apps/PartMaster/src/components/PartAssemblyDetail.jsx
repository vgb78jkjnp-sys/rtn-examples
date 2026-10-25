const EMPTY_DETAIL = {
  PartId: '',
  PartNumber: '',
  PartNumberRev: '',
  Description: '',
  QuantityAttached: '',
  Comments: ''
};

function formatField(value) {
  if (value == null || value === '') {
    return '';
  }
  return String(value);
}

function PartAssemblyDetail({ detail, loading, selectedLabel }) {
  const fields = detail ?? EMPTY_DETAIL;

  return (
    <div className="part-assembly-detail">
      <div className="part-assembly-detail-header mb-2">
        <i className="bi bi-card-text me-2" aria-hidden="true" />
        Part detail
        {selectedLabel ? (
          <span className="text-muted ms-2" style={{ fontSize: '0.75rem', fontWeight: 400 }}>
            {selectedLabel}
          </span>
        ) : null}
      </div>
      {loading && (
        <div className="text-muted mb-2" style={{ fontSize: '0.75rem' }}>
          Loading…
        </div>
      )}
      <div className="part-assembly-detail-fields">
        <label className="form-label mb-1">Part Id</label>
        <input type="text" className="form-control mb-2" readOnly value={formatField(fields.PartId)} />
        <label className="form-label mb-1">Part Number</label>
        <input type="text" className="form-control mb-2" readOnly value={formatField(fields.PartNumber)} />
        <label className="form-label mb-1">Rev</label>
        <input type="text" className="form-control mb-2" readOnly value={formatField(fields.PartNumberRev)} />
        <label className="form-label mb-1">Description</label>
        <textarea
          className="form-control mb-2"
          readOnly
          rows={3}
          value={formatField(fields.Description)}
        />
        <label className="form-label mb-1">Quantity Attached</label>
        <input
          type="text"
          className="form-control mb-2"
          readOnly
          value={formatField(fields.QuantityAttached)}
        />
        <label className="form-label mb-1">Comments</label>
        <textarea
          className="form-control mb-2"
          readOnly
          rows={3}
          value={formatField(fields.Comments)}
        />
      </div>
    </div>
  );
}

export default PartAssemblyDetail;
