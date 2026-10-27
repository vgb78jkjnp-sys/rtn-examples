function PageLoadingOverlay({
  visible = false,
  message = 'Loading data...'
}) {
  if (!visible) {
    return null;
  }

  return (
    <div
      className="page-loading-overlay"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="page-loading-overlay__content text-center">
        <div className="spinner-border text-primary" aria-hidden="true" />
        <div className="mt-2 text-primary page-loading-overlay__message">
          {message}
        </div>
      </div>
    </div>
  );
}

export default PageLoadingOverlay;
