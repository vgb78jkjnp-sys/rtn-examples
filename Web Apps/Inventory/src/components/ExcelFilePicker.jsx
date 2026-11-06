import { useRef } from 'react';

const ACCEPT = '.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel';

function formatFileSize(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return '';
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function ExcelFilePicker({ disabled, selectedFile, onFileSelected }) {
  const inputRef = useRef(null);

  const handleChange = (event) => {
    const file = event.target.files?.[0] ?? null;
    onFileSelected(file);
    event.target.value = '';
  };

  return (
    <div className="d-flex align-items-center gap-2 flex-wrap">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="d-none"
        onChange={handleChange}
        disabled={disabled}
        aria-hidden="true"
        tabIndex={-1}
      />
      <button
        type="button"
        className="btn btn-sm btn-outline-primary"
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
        aria-label="Choose Excel file"
      >
        <i className="fa fa-folder-open me-1" aria-hidden="true" />
        Choose file
      </button>
      {selectedFile ? (
        <span className="text-muted" style={{ fontSize: '0.8rem' }}>
          {selectedFile.name}
          {selectedFile.size ? ` (${formatFileSize(selectedFile.size)})` : ''}
        </span>
      ) : null}
    </div>
  );
}

export default ExcelFilePicker;
