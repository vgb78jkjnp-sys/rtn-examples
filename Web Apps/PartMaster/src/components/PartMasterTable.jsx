import { PART_MASTER_COLUMNS } from './PartMasterSidebar';
import FilterColumnHeader from './FilterColumnHeader';
import { getColumnValue } from '../utils/columnValue';
import { hasActiveColumnFilters } from '../utils/columnFilter';

const NO_WRAP_COLUMNS = new Set(['PartId', 'VendorLot', 'VendorShipLot', 'EntryDate', 'LastUpdateDate']);

function getNoWrapClass(columnKey) {
  return NO_WRAP_COLUMNS.has(columnKey) ? 'table-cell-nowrap' : undefined;
}

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

function PartMasterTable({
  rows,
  totalRowCount,
  hasSearched,
  sortColumn,
  sortDirection,
  onColumnSort,
  columnFilters,
  distinctColumnValues,
  onColumnFilterApply,
  onColumnFilterClear
}) {
  const rowCountLabel = getRowCountLabel({ rows, totalRowCount, columnFilters });
  const hasFilters = hasActiveColumnFilters(columnFilters);

  if (!hasSearched) {
    return (
      <div className="d-flex align-items-center justify-content-center text-muted" style={{ minHeight: '320px' }}>
        Enter LIKE masks and click Search to load Part Master rows.
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
          No parts found. Refine your search and try again.
        </div>
      ) : (
        <table className="table table-sm table-hover partmaster-table mb-0 mt-1">
          <thead>
            <tr>
              {PART_MASTER_COLUMNS.map((column) => (
                <FilterColumnHeader
                  key={column.key}
                  columnKey={column.key}
                  label={column.label}
                  sortType={column.sortType ?? 'string'}
                  filterType={column.filterType ?? 'values'}
                  sortColumn={sortColumn}
                  sortDirection={sortDirection}
                  onColumnSort={onColumnSort}
                  className={getNoWrapClass(column.key)}
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
                <td colSpan={PART_MASTER_COLUMNS.length} style={{ textAlign: 'center' }}>
                  {hasFilters ? rowCountLabel : 'No parts found. Refine your search and try again.'}
                </td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <tr key={`${row.PartId ?? ''}-${row.VendorLot ?? ''}-${index}`}>
                  {PART_MASTER_COLUMNS.map((column) => (
                    <td key={column.key} className={getNoWrapClass(column.key)}>
                      {getColumnValue(row, column.key)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </>
  );
}

export default PartMasterTable;
