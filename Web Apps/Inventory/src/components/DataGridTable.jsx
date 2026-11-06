import FilterColumnHeader from './FilterColumnHeader';
import { getColumnValue } from '../utils/columnValue';
import { hasActiveColumnFilters } from '../utils/columnFilter';

function getRowCountLabel({ rows, totalRowCount, columnFilters }) {
  const hasFilters = hasActiveColumnFilters(columnFilters);

  if (rows.length === 0) {
    return hasFilters
      ? 'No rows match the current column filters.'
      : `${totalRowCount} row${totalRowCount === 1 ? '' : 's'}`;
  }

  if (hasFilters && totalRowCount !== rows.length) {
    return `${rows.length} of ${totalRowCount} row${totalRowCount === 1 ? '' : 's'}`;
  }

  return `${rows.length} row${rows.length === 1 ? '' : 's'}`;
}

function DataGridTable({
  columns,
  rows,
  totalRowCount,
  hasData,
  emptyBeforeMessage,
  emptyAfterMessage,
  sortColumn,
  sortDirection,
  onColumnSort,
  columnFilters,
  distinctColumnValues,
  onColumnFilterApply,
  onColumnFilterClear,
  tableClassName = 'inventory-table',
  footerCells = null
}) {
  const rowCountLabel = getRowCountLabel({ rows, totalRowCount, columnFilters });
  const hasFilters = hasActiveColumnFilters(columnFilters);

  if (!hasData) {
    return (
      <div className="d-flex align-items-center justify-content-center text-muted" style={{ minHeight: '320px' }}>
        {emptyBeforeMessage}
      </div>
    );
  }

  return (
    <>
      <div className="d-flex align-items-center justify-content-between mb-0" style={{ fontSize: '0.8rem' }}>
        <span className="text-muted">{rowCountLabel}</span>
      </div>

      {totalRowCount === 0 ? (
        <div className="d-flex align-items-center justify-content-center text-muted" style={{ minHeight: '280px' }}>
          {emptyAfterMessage}
        </div>
      ) : (
        <table className={`table table-sm table-hover ${tableClassName} mb-0 mt-1`}>
          <thead>
            <tr>
              {columns.map((column) => (
                <FilterColumnHeader
                  key={column.key}
                  columnKey={column.key}
                  label={column.label}
                  sortType={column.sortType ?? 'string'}
                  filterType={column.filterType ?? 'values'}
                  sortColumn={sortColumn}
                  sortDirection={sortDirection}
                  onColumnSort={onColumnSort}
                  distinctValues={distinctColumnValues[column.key] ?? []}
                  columnFilter={columnFilters[column.key] ?? null}
                  onApply={onColumnFilterApply}
                  onClear={onColumnFilterClear}
                />
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: 'center' }}>
                  {hasFilters ? rowCountLabel : emptyAfterMessage}
                </td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <tr key={row.rowId ?? `${index}`}>
                  {columns.map((column) => (
                    <td key={column.key}>
                      {getColumnValue(row, column.key)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
          {footerCells && rows.length > 0 ? (
            <tfoot>
              <tr className="table-light fw-semibold">
                {columns.map((column) => (
                  <td key={column.key}>
                    {footerCells[column.key] ?? ''}
                  </td>
                ))}
              </tr>
            </tfoot>
          ) : null}
        </table>
      )}
    </>
  );
}

export default DataGridTable;
