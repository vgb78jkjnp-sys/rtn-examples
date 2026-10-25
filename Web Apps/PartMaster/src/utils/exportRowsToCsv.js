function escapeCsvField(value) {
  const text = value == null ? '' : String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}

export function exportRowsToCsv({ rows, columns, fileName }) {
  const headerLine = columns.map((column) => escapeCsvField(column.label)).join(',');
  const bodyLines = rows.map((row) =>
    columns.map((column) => escapeCsvField(row[column.key])).join(',')
  );
  const csvContent = `\uFEFF${[headerLine, ...bodyLines].join('\r\n')}`;
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName.endsWith('.csv') ? fileName : `${fileName}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
