const ExcelJS = require('exceljs');
const path = require('path');

const TEMPLATE_PATH = path.join(__dirname, '../public/reportsTemplate.xlsx');
const DATA_COLS = 10; // A–J

const generateOrdersReport = async ({ orders }) => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(TEMPLATE_PATH);

  const worksheet = workbook.getWorksheet('raw-info');

  // 1. Preparar los datos
  const rows = [];
  orders.forEach((order) => {
    const createdAt = new Date(order.createdAt);
    const fecha = createdAt.toISOString().split('T')[0];
    const hora = createdAt.toTimeString().split(' ')[0];
    const mesero = order.user?.name || '';

    order.OrdersItems.forEach((item) => {
      const precio = item.price;
      const cantidad = item.quantity;
      rows.push([
        fecha,
        hora,
        mesero,
        item.Product?.name || '',
        item.Product?.Category?.name || '',
        cantidad,
        precio,
        cantidad * precio,
        item.Product?.cost ?? '',
        order.serviceType || '',
      ]);
    });
  });

  // 2. Limpiar datos viejos y escribir nuevos (Columnas A a J)
  const totalRows = Math.max(worksheet.rowCount, rows.length + 1);
  for (let r = 2; r <= totalRows; r++) {
    const dataRow = rows[r - 2];
    for (let c = 1; c <= DATA_COLS; c++) {
      worksheet.getRow(r).getCell(c).value = dataRow ? dataRow[c - 1] : null;
    }
  }

  // 3. Inyectar Fórmulas de Matriz Dinámica (Columnas L a O)
  // Usamos prefijos _xlfn para asegurar que Excel reconozca las funciones nuevas
  const formulas = [
    {
      cell: 'L2',
      formula: '_xlfn._xlws.SORT(_xlfn.UNIQUE(_xlfn.TEXT(_xlfn.FILTER(raw_data[fecha],(raw_data[fecha]<>"")*(raw_data[fecha]<>"fecha")),"mmmm")))',
    },
    {
      cell: 'M2',
      formula: '_xlfn._xlws.SORT(_xlfn.UNIQUE(_xlfn.FILTER(raw_data[categoria],raw_data[categoria]<>"")))',
    },
    {
      cell: 'N2',
      formula: '_xlfn._xlws.SORT(_xlfn.UNIQUE(_xlfn.FILTER(raw_data[mesero],raw_data[mesero]<>"")))',
    },
    {
      cell: 'O2',
      formula: '_xlfn._xlws.SORT(_xlfn.UNIQUE(_xlfn.FILTER(raw_data[tipo_servicio],raw_data[tipo_servicio]<>"")))',
    },
  ];

  formulas.forEach((f) => {
    const cell = worksheet.getCell(f.cell);
    
    // IMPORTANTE: Definir la celda como una matriz (array formula)
    // Esto es lo que evita que la celda quede en blanco o se rompa
    cell.value = {
      formula: f.formula,
      shareType: 'array',
      ref: `${f.cell}:${f.cell}`
    };
  });

  return workbook;
};

const buildFileName = (companyName, branchName, startDate, endDate) => {
  const sanitize = (str) =>
    (str || 'unknown')
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_\-]/g, '');
  return `${sanitize(companyName)}-${sanitize(branchName)}-report-${startDate}-${endDate}.xlsx`;
};

module.exports = {
  generateOrdersReport,
  buildFileName,
};