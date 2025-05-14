const ExcelJS = require('exceljs');

const generateOrdersReport = async (orders) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Ventas');

  // Definir las cabeceras
  worksheet.columns = [
    { header: 'ID Orden', key: 'orderId', width: 15 },
    { header: 'Fecha de Orden', key: 'orderDate', width: 20 },
    { header: 'Nombre Mesero', key: 'userName', width: 30 },
    { header: 'Producto', key: 'product', width: 30 },
    { header: 'Categoría', key: 'category', width: 20 },
    { header: 'Cantidad', key: 'quantity', width: 10 },
    { header: 'Precio', key: 'price', width: 10 },
    { header: 'Total', key: 'total', width: 10 },
  ];

  // Agregar las filas con los datos de las órdenes
  orders.forEach((order) => {
    order.OrdersItems.forEach((item) => {
      worksheet.addRow({
        orderId: order.id,
        orderDate: order.createdAt.toISOString().split('T')[0],
        userName: order.User.name,
        product: item.Product.name,
        category: item.Product.Category.name,
        quantity: item.quantity,
        price: item.Product.price,
        total: item.quantity * item.Product.price,
      });
    });
  });

  return workbook;
};

module.exports = {
  generateOrdersReport,
};
