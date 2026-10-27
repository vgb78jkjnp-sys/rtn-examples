import { useCallback, useEffect, useMemo, useState } from 'react';
import OperationCommentDisplay from './OperationCommentDisplay';
import './UxcTable.css';

/**
 * Reusable table with sortable columns and checkbox selection support.
 *
 * @param {Object[]} data
 * @param {Object[]} columns
 * @param {Object[]} buttonParameters
 * column: {
 *   index: number,
 *   headerName: string,
 *   columnName: string,
 *   columnType?: 'text' | 'number' | 'date' | 'checkbox' | 'html' | 'dropdown',
 *   align?: 'left' | 'center' | 'right',
 *   size?: string | number,
 *   sortable?: boolean,
 *   selection?: boolean,
 *   disabled?: boolean,
 *   readOnly?: boolean,
 *   options?: Object[] | Object,
 *   optionValueField?: string,
 *   optionLabelField?: string,
 *   optionsDataset?: string,
 *   placeholder?: string,
 *   disabled?: boolean,
 *   readOnly?: boolean,
 *   renderCell?: (row: Object, column: Object) => React.ReactNode,
 *   onChange?: (change: { rowKey: string | number, columnName: string, value: boolean | string, row: Object }) => void
 * }
 * @param {Object} tableConfig
 * tableConfig: {
 *   sortableColumns?: boolean,
 *   checkboxSelectionMode?: 'single' | 'multiple',
 *   rowKey?: string,
 *   defaultSelectedRowKeys?: Array<string | number>,
 *   selectedRowKeys?: Array<string | number>,
 *   onCellChange?: (change: { rowKey: string | number, columnName: string, value: boolean | string, row: Object }) => void,
 *   dropdownOptions?: Record<string, Object[] | Object>,
 *   getRowClassName?: (row: Object, rowIndex: number) => string | undefined,
 *   getRowStyle?: (row: Object, rowIndex: number) => React.CSSProperties | undefined,
 *   className?: string,
 *   style?: React.CSSProperties,
 *   tableClassName?: string,
 *   tableStyle?: React.CSSProperties,
 *   wrapperStyle?: React.CSSProperties,
 *   columnsConfig?: Record<string, { width?: string | number, size?: string | number }>,
 *   mainHeader?: string,
 *   showCopy?: boolean,
 *   showExcelExport?: boolean,
 *   showPrint?: boolean,
 *   showCopyIcon?: boolean,
 *   showExportIcon?: boolean,
 *   showPrintIcon?: boolean,
 *   exportFileName?: string
 * }
 * button: {
 *   index: number,
 *   name: string,
 *   text: string,
 *   onClick?: (tableState: Object, event: React.MouseEvent<HTMLButtonElement>) => void,
 *   className?: string,
 *   type?: 'button' | 'submit' | 'reset'
 * }
 */
function ReusableTable({
  data = [],
  columns = [],
  buttonParameters = [],
  tableConfig = {},
  onSelectionChange
}) {
  const {
    sortableColumns = true,
    checkboxSelectionMode = 'multiple',
    rowKey = 'id',
    className = '',
    style,
    tableClassName = '',
    tableStyle,
    wrapperStyle: wrapperStyleProp,
    columnsConfig = {},
    mainHeader,
    showCopy,
    showExcelExport,
    showPrint,
    showCopyIcon = false,
    showExportIcon = false,
    showPrintIcon = false,
    exportFileName = 'uxc-table-export',
    defaultSelectedRowKeys = [],
    selectedRowKeys: controlledSelectedRowKeys,
    onCellChange,
    dropdownOptions = {},
    getRowClassName,
    getRowStyle
  } = tableConfig;

  const isSelectionControlled = controlledSelectedRowKeys !== undefined;

  const shouldShowCopy = typeof showCopy === 'boolean' ? showCopy : showCopyIcon;
  const shouldShowExcelExport = typeof showExcelExport === 'boolean' ? showExcelExport : showExportIcon;
  const shouldShowPrint = typeof showPrint === 'boolean' ? showPrint : showPrintIcon;

  const [sortConfig, setSortConfig] = useState(null);
  const [internalSelectedRowKeys, setInternalSelectedRowKeys] = useState(() => (
    Array.isArray(defaultSelectedRowKeys) ? defaultSelectedRowKeys : []
  ));

  const selectedRowKeys = isSelectionControlled ? controlledSelectedRowKeys : internalSelectedRowKeys;

  const isSelectionCheckboxColumn = column =>
    column.columnType === 'checkbox' && column.selection !== false;

  const isDataCheckboxColumn = column =>
    column.columnType === 'checkbox' && column.selection === false;

  const tableColumns = useMemo(() => {
    return [...columns].sort((a, b) => {
      const aIndex = Number.isFinite(a.index) ? a.index : Number.MAX_SAFE_INTEGER;
      const bIndex = Number.isFinite(b.index) ? b.index : Number.MAX_SAFE_INTEGER;
      return aIndex - bIndex;
    });
  }, [columns]);

  const orderedButtons = useMemo(() => {
    return [...buttonParameters].sort((a, b) => {
      const aIndex = Number.isFinite(a.index) ? a.index : Number.MAX_SAFE_INTEGER;
      const bIndex = Number.isFinite(b.index) ? b.index : Number.MAX_SAFE_INTEGER;
      return aIndex - bIndex;
    });
  }, [buttonParameters]);

  const getRowKey = useCallback(
    (row, fallbackIndex) => {
      if (row && row[rowKey] !== undefined && row[rowKey] !== null) {
        return row[rowKey];
      }
      return fallbackIndex;
    },
    [rowKey]
  );

  const validRowKeySet = useMemo(() => {
    return new Set(data.map((row, idx) => getRowKey(row, idx)));
  }, [data, getRowKey]);

  const normalizedSelectedRowKeys = useMemo(() => {
    return selectedRowKeys.filter(key => validRowKeySet.has(key));
  }, [selectedRowKeys, validRowKeySet]);

  const isColumnSortable = column => {
    if (isSelectionCheckboxColumn(column)) {
      return false;
    }

    if (typeof column.sortable === 'boolean') {
      return column.sortable;
    }

    return sortableColumns;
  };

  const getDataCheckboxValue = (row, column) => {
    const value = row?.[column.columnName];

    if (typeof value === 'boolean') {
      return value;
    }

    if (typeof value === 'number') {
      return value !== 0;
    }

    if (typeof value === 'string') {
      const normalizedValue = value.trim().toLowerCase();
      return normalizedValue === 'true' || normalizedValue === '1' || normalizedValue === 'yes';
    }

    return Boolean(value);
  };

  const formatExportValue = (row, column) => {
    if (isDataCheckboxColumn(column)) {
      return getDataCheckboxValue(row, column) ? 'true' : 'false';
    }

    return row?.[column.columnName] ?? '';
  };

  const sortedData = useMemo(() => {
    if (!sortConfig) {
      return data;
    }

    const { columnName, direction } = sortConfig;
    const sorted = [...data].sort((rowA, rowB) => {
      const valueA = rowA?.[columnName];
      const valueB = rowB?.[columnName];

      if (valueA === valueB) return 0;
      if (valueA === undefined || valueA === null) return 1;
      if (valueB === undefined || valueB === null) return -1;

      if (typeof valueA === 'number' && typeof valueB === 'number') {
        return direction === 'asc' ? valueA - valueB : valueB - valueA;
      }

      const textA = String(valueA).toLowerCase();
      const textB = String(valueB).toLowerCase();
      return direction === 'asc'
        ? textA.localeCompare(textB)
        : textB.localeCompare(textA);
    });

    return sorted;
  }, [data, sortConfig]);

  useEffect(() => {
    onSelectionChange?.(normalizedSelectedRowKeys);
  }, [normalizedSelectedRowKeys, onSelectionChange]);

  const handleSort = column => {
    if (!isColumnSortable(column)) {
      return;
    }

    setSortConfig(prev => {
      if (!prev || prev.columnName !== column.columnName) {
        return { columnName: column.columnName, direction: 'asc' };
      }

      return {
        columnName: column.columnName,
        direction: prev.direction === 'asc' ? 'desc' : 'asc'
      };
    });
  };

  const toggleRowSelection = (key, checked) => {
    const computeNextSelection = currentSelection => {
      const validSelection = currentSelection.filter(item => validRowKeySet.has(item));

      if (checkboxSelectionMode === 'single') {
        return checked ? [key] : [];
      }

      if (checked) {
        return validSelection.includes(key) ? validSelection : [...validSelection, key];
      }

      return validSelection.filter(item => item !== key);
    };

    if (isSelectionControlled) {
      onSelectionChange?.(computeNextSelection(controlledSelectedRowKeys));
      return;
    }

    setInternalSelectedRowKeys(prev => computeNextSelection(prev));
  };

  const handleDataCheckboxChange = (column, row, rowIndex, checked) => {
    const changePayload = {
      rowKey: getRowKey(row, rowIndex),
      columnName: column.columnName,
      value: checked,
      row
    };

    column.onChange?.(changePayload);
    onCellChange?.(changePayload);
  };

  const normalizeDropdownOptions = options => {
    if (!options) {
      return [];
    }

    if (Array.isArray(options)) {
      return options;
    }

    if (typeof options === 'object') {
      return Object.entries(options).map(([value, label]) => ({ value, label }));
    }

    return [];
  };

  const getDropdownOptionsForColumn = column => {
    if (column.options) {
      return normalizeDropdownOptions(column.options);
    }

    if (column.optionsDataset && dropdownOptions[column.optionsDataset]) {
      return normalizeDropdownOptions(dropdownOptions[column.optionsDataset]);
    }

    return normalizeDropdownOptions(dropdownOptions[column.columnName]);
  };

  const normalizeDropdownOption = (option, column) => {
    const optionValueField = column.optionValueField || 'value';
    const optionLabelField = column.optionLabelField || 'label';

    if (option && typeof option === 'object' && !Array.isArray(option)) {
      if ('value' in option || 'label' in option) {
        const value = option.value ?? option[optionValueField];
        const label = option.label ?? option[optionLabelField] ?? value;
        return { value, label };
      }

      if (optionValueField in option || optionLabelField in option) {
        const value = option[optionValueField];
        const label = option[optionLabelField] ?? value;
        return { value, label };
      }
    }

    return { value: option, label: option };
  };

  const resolveDropdownValue = (rawValue, normalizedOptions) => {
    if (rawValue === undefined || rawValue === null) {
      return '';
    }

    const directMatch = normalizedOptions.find(
      option => option.value === rawValue
    );
    if (directMatch) {
      return directMatch.value;
    }

    const stringValue = String(rawValue);
    const stringMatch = normalizedOptions.find(
      option => String(option.value) === stringValue
    );
    if (stringMatch) {
      return stringMatch.value;
    }

    return rawValue;
  };

  const handleDropdownCellChange = (column, row, rowIndex, value) => {
    const changePayload = {
      rowKey: getRowKey(row, rowIndex),
      columnName: column.columnName,
      value,
      row
    };

    column.onChange?.(changePayload);
    onCellChange?.(changePayload);
  };

  const getAlignmentClass = align => {
    if (align === 'center') return 'reusable-table__cell--center';
    if (align === 'right') return 'reusable-table__cell--right';
    return 'reusable-table__cell--left';
  };

  const getSortIndicator = column => {
    if (!isColumnSortable(column)) {
      return '';
    }

    if (!sortConfig || sortConfig.columnName !== column.columnName) {
      return '↕';
    }

    return sortConfig.direction === 'asc' ? '▲' : '▼';
  };

  const getResolvedColumnSize = column => {
    const columnConfig = columnsConfig[column.columnName];
    return columnConfig?.width ?? columnConfig?.size ?? column.size;
  };

  const getColumnSizeStyle = size => {
    if (size === undefined || size === null || size === '') {
      return undefined;
    }

    if (typeof size === 'number') {
      return { width: `${size}px`, maxWidth: `${size}px` };
    }

    const normalizedSize = String(size).trim().replace(/;+\s*$/, '');
    if (!normalizedSize) {
      return undefined;
    }

    return { width: normalizedSize, maxWidth: normalizedSize };
  };

  const hasColumnSizes = useMemo(() => {
    return tableColumns.some(column => getColumnSizeStyle(getResolvedColumnSize(column)));
  }, [tableColumns, columnsConfig]);

  const WRAPPER_STYLE_KEYS = new Set([
    'maxHeight',
    'minHeight',
    'height',
    'overflow',
    'overflowX',
    'overflowY'
  ]);

  const { mergedWrapperStyle, tableOnlyStyle } = useMemo(() => {
    const wrapperFromTableStyle = {};
    const tableOnly = {};

    if (tableStyle) {
      Object.entries(tableStyle).forEach(([key, value]) => {
        if (WRAPPER_STYLE_KEYS.has(key)) {
          wrapperFromTableStyle[key] = value;
        } else {
          tableOnly[key] = value;
        }
      });
    }

    const mergedWrapper = {
      ...wrapperFromTableStyle,
      ...wrapperStyleProp
    };

    if (mergedWrapper.maxHeight && !mergedWrapper.overflowY) {
      mergedWrapper.overflowY = 'auto';
    }

    return {
      mergedWrapperStyle: mergedWrapper,
      tableOnlyStyle: tableOnly
    };
  }, [tableStyle, wrapperStyleProp]);

  const resolvedWrapperStyle = useMemo(() => {
    if (!mergedWrapperStyle || Object.keys(mergedWrapperStyle).length === 0) {
      return undefined;
    }

    return mergedWrapperStyle;
  }, [mergedWrapperStyle]);

  const isScrollableWrapper = Boolean(
    resolvedWrapperStyle?.maxHeight
    || resolvedWrapperStyle?.height
    || resolvedWrapperStyle?.overflowY === 'auto'
    || resolvedWrapperStyle?.overflowY === 'scroll'
  );

  const resolvedTableStyle = useMemo(() => {
    return {
      ...(hasColumnSizes ? { tableLayout: 'fixed', minWidth: 'unset', width: '100%' } : {}),
      ...tableOnlyStyle
    };
  }, [hasColumnSizes, tableOnlyStyle]);

  const exportableColumns = useMemo(() => {
    return tableColumns.filter(column => !isSelectionCheckboxColumn(column));
  }, [tableColumns]);

  const escapeHtml = value => {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  const buildHtmlTable = () => {
    const headerHtml = exportableColumns
      .map(column => `<th>${escapeHtml(column.headerName || column.columnName)}</th>`)
      .join('');

    const bodyHtml = sortedData
      .map(row => {
        const rowHtml = exportableColumns
          .map(column => `<td>${escapeHtml(formatExportValue(row, column))}</td>`)
          .join('');
        return `<tr>${rowHtml}</tr>`;
      })
      .join('');

    return `<table><thead><tr>${headerHtml}</tr></thead><tbody>${bodyHtml}</tbody></table>`;
  };

  const buildTsvTable = () => {
    const headerLine = exportableColumns
      .map(column => String(column.headerName || column.columnName))
      .join('\t');

    const bodyLines = sortedData.map(row => {
      return exportableColumns
        .map(column => String(formatExportValue(row, column)))
        .join('\t');
    });

    return [headerLine, ...bodyLines].join('\n');
  };

  const handleExportToExcel = () => {
    const htmlTable = buildHtmlTable();
    const htmlContent = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>${htmlTable}</body></html>`;
    const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${exportFileName}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrintTable = () => {
    const htmlTable = buildHtmlTable();
    const printWindow = window.open('', '_blank', 'width=1000,height=700');

    if (!printWindow) {
      return;
    }

    printWindow.document.write(`<!DOCTYPE html><html><head><title>Print Table</title><style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      table { width: 100%; border-collapse: collapse; }
      th, td { border: 1px solid #d9d9d9; padding: 8px 10px; text-align: left; }
      th { background: #f3f5f8; }
    </style></head><body>${htmlTable}</body></html>`);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const handleCopyTable = async () => {
    const htmlTable = buildHtmlTable();
    const plainTextTable = buildTsvTable();

    try {
      if (navigator.clipboard && typeof window.ClipboardItem === 'function') {
        const clipboardItem = new window.ClipboardItem({
          'text/plain': new Blob([plainTextTable], { type: 'text/plain' }),
          'text/html': new Blob([htmlTable], { type: 'text/html' })
        });

        await navigator.clipboard.write([clipboardItem]);
        return;
      }

      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(plainTextTable);
        return;
      }
    } catch {
      // Fall through to legacy copy when clipboard APIs are blocked.
    }

    const hiddenTextarea = document.createElement('textarea');
    hiddenTextarea.value = plainTextTable;
    hiddenTextarea.setAttribute('readonly', '');
    hiddenTextarea.style.position = 'fixed';
    hiddenTextarea.style.opacity = '0';
    hiddenTextarea.style.pointerEvents = 'none';
    document.body.appendChild(hiddenTextarea);
    hiddenTextarea.select();
    document.execCommand('copy');
    document.body.removeChild(hiddenTextarea);
  };

  return (
    <div className={`reusable-table__container ${className}`.trim()} style={style}>
      {(shouldShowCopy || shouldShowExcelExport || shouldShowPrint) && (
        <div className="reusable-table__actions">
          {shouldShowCopy && (
            <button
              type="button"
              className="reusable-table__icon-button"
              title="Copy Table"
              aria-label="Copy Table"
              onClick={handleCopyTable}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
                <rect x="9" y="7" width="11" height="13" rx="1" ry="1" fill="none" stroke="currentColor" strokeWidth="1.8"/>
                <rect x="4" y="4" width="11" height="13" rx="1" ry="1" fill="none" stroke="currentColor" strokeWidth="1.8"/>
              </svg>
            </button>
          )}

          {shouldShowExcelExport && (
            <button
              type="button"
              className="reusable-table__icon-button"
              title="Export to Excel"
              aria-label="Export to Excel"
              onClick={handleExportToExcel}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
                <path d="M4 3h11l5 5v13a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" fill="none" stroke="currentColor" strokeWidth="1.8"/>
                <path d="M15 3v6h6" fill="none" stroke="currentColor" strokeWidth="1.8"/>
                <path d="M8 10l4 6m0-6l-4 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </button>
          )}

          {shouldShowPrint && (
            <button
              type="button"
              className="reusable-table__icon-button"
              title="Print"
              aria-label="Print"
              onClick={handlePrintTable}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
                <path d="M7 8V3h10v5" fill="none" stroke="currentColor" strokeWidth="1.8"/>
                <path d="M6 18H4a1 1 0 0 1-1-1v-6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v6a1 1 0 0 1-1 1h-2" fill="none" stroke="currentColor" strokeWidth="1.8"/>
                <rect x="7" y="14" width="10" height="7" fill="none" stroke="currentColor" strokeWidth="1.8"/>
                <circle cx="17.5" cy="11.5" r="1" fill="currentColor"/>
              </svg>
            </button>
          )}
        </div>
      )}

      <div
        className={`reusable-table__wrapper${isScrollableWrapper ? ' reusable-table__wrapper--scrollable' : ''}`.trim()}
        style={resolvedWrapperStyle}
      >
        <table className={`reusable-table ${hasColumnSizes ? 'reusable-table--fixed-layout ' : ''}${mainHeader ? 'reusable-table--with-main-header ' : ''}${tableClassName}`.trim()} style={resolvedTableStyle}>
        {hasColumnSizes && (
          <colgroup>
            {tableColumns.map((column, columnIndex) => (
              <col
                key={column.columnName || `col-${column.index ?? columnIndex}`}
                style={getColumnSizeStyle(getResolvedColumnSize(column))}
              />
            ))}
          </colgroup>
        )}
        <thead>
          {mainHeader ? (
            <tr className="reusable-table__main-header">
              <th
                colSpan={tableColumns.length}
                scope="colgroup"
                className="reusable-table__main-header-cell"
              >
                {mainHeader}
              </th>
            </tr>
          ) : null}
          <tr>
            {tableColumns.map(column => {
              const sortable = isColumnSortable(column);
              return (
                <th
                  key={column.columnName}
                  className={`${getAlignmentClass(column.align)} ${sortable ? 'reusable-table__header--sortable' : ''}`}
                  onClick={() => handleSort(column)}
                  scope="col"
                  style={getColumnSizeStyle(getResolvedColumnSize(column))}
                >
                  <span className="reusable-table__header-content">
                    {column.headerName}
                    <span className="reusable-table__sort-indicator">{getSortIndicator(column)}</span>
                  </span>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sortedData.length === 0 ? (
            <tr>
              <td colSpan={tableColumns.length} className="reusable-table__empty-state">
                No data available.
              </td>
            </tr>
          ) : (
            sortedData.map((row, rowIndex) => {
              const key = getRowKey(row, rowIndex);
              const rowClassName = getRowClassName?.(row, rowIndex) ?? '';
              const rowStyle = getRowStyle?.(row, rowIndex);

              return (
                <tr key={key} className={rowClassName} style={rowStyle}>
                  {tableColumns.map(column => {
                    const alignmentClass = getAlignmentClass(column.align);
                    const cellStyle = {
                      ...getColumnSizeStyle(getResolvedColumnSize(column)),
                      ...(rowStyle ?? {})
                    };

                    if (isSelectionCheckboxColumn(column)) {
                      return (
                        <td
                          key={column.columnName}
                          className={alignmentClass}
                          style={cellStyle}
                        >
                          <input
                            type="checkbox"
                            checked={normalizedSelectedRowKeys.includes(key)}
                            onChange={event => toggleRowSelection(key, event.target.checked)}
                            aria-label={`Select row ${rowIndex + 1}`}
                          />
                        </td>
                      );
                    }

                    if (isDataCheckboxColumn(column)) {
                      const isCheckboxDisabled = Boolean(column.disabled || column.readOnly);

                      return (
                        <td
                          key={column.columnName}
                          className={alignmentClass}
                          style={cellStyle}
                        >
                          <input
                            type="checkbox"
                            checked={getDataCheckboxValue(row, column)}
                            disabled={isCheckboxDisabled}
                            onChange={event => handleDataCheckboxChange(column, row, rowIndex, event.target.checked)}
                            aria-label={`${column.headerName || column.columnName} row ${rowIndex + 1}`}
                          />
                        </td>
                      );
                    }

                    if (column.columnType === 'html') {
                      return (
                        <td
                          key={column.columnName}
                          className={alignmentClass}
                          style={cellStyle}
                        >
                          <OperationCommentDisplay html={row?.[column.columnName]} />
                        </td>
                      );
                    }

                    if (column.columnType === 'dropdown') {
                      const rawOptions = getDropdownOptionsForColumn(column);
                      const normalizedOptions = rawOptions.map(option => normalizeDropdownOption(option, column));
                      const rawValue = row?.[column.columnName];
                      const selectedValue = resolveDropdownValue(rawValue, normalizedOptions);
                      const isDropdownDisabled = Boolean(column.disabled || column.readOnly);

                      return (
                        <td
                          key={column.columnName}
                          className={alignmentClass}
                          style={cellStyle}
                        >
                          <select
                            className="form-select form-select-sm"
                            value={selectedValue ?? ''}
                            disabled={isDropdownDisabled}
                            onChange={event => handleDropdownCellChange(column, row, rowIndex, event.target.value)}
                            aria-label={`${column.headerName || column.columnName} row ${rowIndex + 1}`}
                          >
                            {column.placeholder !== undefined ? (
                              <option value="">{column.placeholder}</option>
                            ) : null}
                            {normalizedOptions.map((option, optionIndex) => (
                              <option key={`${column.columnName}-option-${optionIndex}-${String(option.value)}`} value={option.value ?? ''}>
                                {option.label ?? option.value ?? ''}
                              </option>
                            ))}
                          </select>
                        </td>
                      );
                    }

                    if (column.renderCell) {
                      return (
                        <td
                          key={column.columnName}
                          className={alignmentClass}
                          style={cellStyle}
                        >
                          {column.renderCell(row, column)}
                        </td>
                      );
                    }

                    return (
                      <td
                        key={column.columnName}
                        className={alignmentClass}
                        style={cellStyle}
                      >
                        {row?.[column.columnName] ?? ''}
                      </td>
                    );
                  })}
                </tr>
              );
            })
          )}
        </tbody>
        </table>
      </div>

      {orderedButtons.length > 0 && (
        <div className="reusable-table__buttons">
          {orderedButtons.map(button => {
            const buttonType = ['button', 'submit', 'reset'].includes(button.type) ? button.type : 'button';
            const buttonText = button.text || button.name || 'Action';
            const buttonClassName = button.className || 'btn btn-secondary btn-sm';

            return (
              <button
                key={button.name || `${buttonText}-${button.index ?? 'no-index'}`}
                name={button.name || undefined}
                type={buttonType}
                className={buttonClassName}
                onClick={event => button.onClick?.({
                  selectedRowKeys: normalizedSelectedRowKeys,
                  sortConfig,
                  rows: sortedData
                }, event)}
              >
                {buttonText}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ReusableTable;
