/** Writes `rows` (array of flat objects) to an .xlsx download. The heavy libs load on demand. */
export async function exportToExcel({ rows, sheetName, fileName }) {
  const [XLSX, { saveAs }] = await Promise.all([import('xlsx'), import('file-saver')]);
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  saveAs(new Blob([buffer], { type: 'application/octet-stream' }), fileName);
}
