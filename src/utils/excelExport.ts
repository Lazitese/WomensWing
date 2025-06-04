import ExcelJS from 'exceljs';

interface ExcelColumn {
  header: string;
  key: string;
  width?: number;
}

export const exportToExcel = async (
  data: any[],
  columns: ExcelColumn[],
  filename: string
): Promise<boolean> => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');

    // Set headers and column widths
    worksheet.columns = columns.map(col => ({
      header: col.header,
      key: col.key,
      width: col.width || 10
    }));

    // Add data rows
    worksheet.addRows(data);

    // Generate Excel file
    const buffer = await workbook.xlsx.writeBuffer();
    
    // Create a Blob from the buffer
    const blob = new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    // Create download link and trigger download
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error('Excel export error:', error);
    return false;
  }
}; 