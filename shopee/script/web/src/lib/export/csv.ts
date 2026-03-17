export function generateCSV(data: any[], headers: string[]): string {
  const rows = [headers];
  
  data.forEach((item) => {
    const row = headers.map((header) => {
      const value = item[header];
      if (value === null || value === undefined) return '';
      if (typeof value === 'object') return JSON.stringify(value);
      return `"${String(value).replace(/"/g, '""')}"`;
    });
    rows.push(row);
  });

  return rows.map((row) => row.join(',')).join('\n');
}

export function downloadCSV(csv: string, filename: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
