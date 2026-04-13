'use strict';
const puppeteer = require('puppeteer');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');

const COLORS = [
  '#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#ef4444',
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#06b6d4',
];

const fmt = (n) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(n) || 0);

// ── Chart generator ───────────────────────────────────────────────────────────
const generateChart = async (type, chartData, width = 700, height = 300, extraOptions = {}) => {
  const canvas = new ChartJSNodeCanvas({ width, height, backgroundColour: 'white' });
  const config = {
    type,
    data: chartData,
    options: {
      responsive: false,
      animation: false,
      plugins: {
        legend: { position: 'bottom', labels: { font: { size: 11 }, boxWidth: 14, padding: 12 } },
      },
      ...extraOptions,
    },
  };
  const buffer = await canvas.renderToBuffer(config);
  return `data:image/png;base64,${buffer.toString('base64')}`;
};

// ── HTML builder ──────────────────────────────────────────────────────────────
const buildHtml = async (data) => {
  const {
    company, startDate, endDate, kpis, comparisons,
    salesByDay, top10Products, top10ByRevenue, salesByCategory,
    salesByWaiter, salesByServiceType, salesByHour, salesByDayOfWeek,
    insights,
  } = data;

  const genDate = new Date().toLocaleDateString('es-MX', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  // ── Generate all charts in parallel ────────────────────────────────────────
  const maxHourRevenue = Math.max(...salesByHour.map((h) => h.revenue), 0);

  const [
    lineChart,
    topQtyChart,
    topRevChart,
    catPieChart,
    waiterBarChart,
    servicePieChart,
    hourBarChart,
    dowBarChart,
  ] = await Promise.all([
    // 1. Line: ingresos por día
    generateChart('line', {
      labels: salesByDay.map((d) => d.date),
      datasets: [{
        label: 'Ingresos diarios',
        data: salesByDay.map((d) => d.revenue),
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99,102,241,0.10)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#6366f1',
        borderWidth: 2,
      }],
    }, 720, 280, {
      scales: {
        y: { beginAtZero: true, ticks: { font: { size: 10 } } },
        x: { ticks: { font: { size: 9 }, maxRotation: 45, minRotation: 0 } },
      },
      plugins: { legend: { display: false } },
    }),

    // 2. Horizontal bar: top 10 por cantidad
    generateChart('bar', {
      labels: top10Products.map((p) => p.name),
      datasets: [{
        label: 'Unidades',
        data: top10Products.map((p) => p.quantity),
        backgroundColor: COLORS.slice(0, top10Products.length),
        borderRadius: 4,
      }],
    }, 680, 300, {
      indexAxis: 'y',
      scales: {
        x: { beginAtZero: true, ticks: { font: { size: 10 } } },
        y: { ticks: { font: { size: 10 } } },
      },
      plugins: { legend: { display: false } },
    }),

    // 3. Horizontal bar: top 10 por ingreso
    generateChart('bar', {
      labels: top10ByRevenue.map((p) => p.name),
      datasets: [{
        label: 'Ingresos',
        data: top10ByRevenue.map((p) => p.revenue),
        backgroundColor: '#10b981',
        borderRadius: 4,
      }],
    }, 680, 300, {
      indexAxis: 'y',
      scales: {
        x: { beginAtZero: true, ticks: { font: { size: 10 } } },
        y: { ticks: { font: { size: 10 } } },
      },
      plugins: { legend: { display: false } },
    }),

    // 4. Pie: categorías
    generateChart('pie', {
      labels: salesByCategory.map((c) => c.category),
      datasets: [{
        data: salesByCategory.map((c) => c.revenue),
        backgroundColor: COLORS.slice(0, salesByCategory.length),
        borderWidth: 2,
        borderColor: '#ffffff',
      }],
    }, 460, 300),

    // 5. Bar agrupado: meseros (ingresos + órdenes con doble eje)
    generateChart('bar', {
      labels: salesByWaiter.map((w) => w.waiter),
      datasets: [
        {
          label: 'Ingresos',
          data: salesByWaiter.map((w) => w.revenue),
          backgroundColor: '#3b82f6',
          borderRadius: 4,
          yAxisID: 'y',
        },
        {
          label: 'Órdenes',
          data: salesByWaiter.map((w) => w.orders),
          backgroundColor: '#f59e0b',
          borderRadius: 4,
          yAxisID: 'y1',
        },
      ],
    }, 680, 300, {
      scales: {
        y: { beginAtZero: true, position: 'left', ticks: { font: { size: 10 } } },
        y1: {
          beginAtZero: true, position: 'right',
          grid: { drawOnChartArea: false },
          ticks: { font: { size: 10 } },
        },
        x: { ticks: { font: { size: 10 } } },
      },
    }),

    // 6. Doughnut: tipo de servicio
    generateChart('doughnut', {
      labels: salesByServiceType.map((s) => s.type),
      datasets: [{
        data: salesByServiceType.map((s) => s.revenue),
        backgroundColor: ['#6366f1', '#10b981', '#f59e0b'],
        borderWidth: 2,
        borderColor: '#ffffff',
      }],
    }, 420, 280),

    // 7. Bar: horas pico (barra roja para la hora máxima)
    generateChart('bar', {
      labels: salesByHour.map((h) => `${String(h.hour).padStart(2, '0')}:00`),
      datasets: [{
        label: 'Ingresos',
        data: salesByHour.map((h) => h.revenue),
        backgroundColor: salesByHour.map((h) =>
          h.revenue === maxHourRevenue && maxHourRevenue > 0 ? '#ef4444' : '#8b5cf6'
        ),
        borderRadius: 3,
      }],
    }, 720, 280, {
      scales: {
        y: { beginAtZero: true, ticks: { font: { size: 10 } } },
        x: { ticks: { font: { size: 8 }, maxRotation: 45 } },
      },
      plugins: { legend: { display: false } },
    }),

    // 8. Bar: día de semana
    generateChart('bar', {
      labels: salesByDayOfWeek.map((d) => d.day),
      datasets: [{
        label: 'Ingresos',
        data: salesByDayOfWeek.map((d) => d.revenue),
        backgroundColor: '#14b8a6',
        borderRadius: 4,
      }],
    }, 680, 260, {
      scales: {
        y: { beginAtZero: true, ticks: { font: { size: 10 } } },
        x: { ticks: { font: { size: 10 } } },
      },
      plugins: { legend: { display: false } },
    }),
  ]);

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const compCard = (label, curr, prev, growth) => {
    const pos = growth >= 0;
    const color = pos ? '#10b981' : '#ef4444';
    const arrow = pos ? '▲' : '▼';
    return `
      <div class="comp-card">
        <div class="comp-label">${label}</div>
        <div class="comp-curr">${fmt(curr)}</div>
        <div class="comp-growth" style="color:${color}">${arrow} ${Math.abs(growth)}% vs periodo anterior</div>
        <div class="comp-prev">Anterior: ${fmt(prev)}</div>
      </div>`;
  };

  const productRows = top10Products.map((p, i) => `
    <tr>
      <td class="num">${i + 1}</td>
      <td>${p.name}</td>
      <td>${p.category}</td>
      <td class="center">${p.quantity}</td>
      <td class="right">${fmt(p.revenue)}</td>
    </tr>`).join('');

  const waiterRows = salesByWaiter.map((w, i) => `
    <tr>
      <td class="num">${i + 1}</td>
      <td>${w.waiter}</td>
      <td class="center">${w.orders}</td>
      <td class="right">${fmt(w.revenue)}</td>
      <td class="right">${fmt(w.avgTicket)}</td>
    </tr>`).join('');

  const serviceRows = salesByServiceType.map((s) => `
    <tr>
      <td style="text-transform:capitalize">${s.type}</td>
      <td class="center">${s.orders}</td>
      <td class="right">${fmt(s.revenue)}</td>
    </tr>`).join('');

  const catRows = salesByCategory.map((c) => `
    <tr>
      <td>${c.category}</td>
      <td class="center">${c.quantity}</td>
      <td class="right">${fmt(c.revenue)}</td>
    </tr>`).join('');

  const ICONS = ['🏆', '⏰', '👨‍🍳', '🍽️', '📂', '📅', '📈', '📊'];
  const insightCards = insights.map((text, i) => `
    <div class="insight-card">
      <div class="insight-icon">${ICONS[i % ICONS.length]}</div>
      <div class="insight-text">${text}</div>
    </div>`).join('');

  const logoHtml = company.logoBase64
    ? `<img src="${company.logoBase64}" style="height:52px;object-fit:contain;filter:brightness(0) invert(1);" />`
    : `<div style="font-size:24px;font-weight:900;letter-spacing:-0.5px;">${company.name}</div>`;

  // ── Full HTML ─────────────────────────────────────────────────────────────
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Segoe UI',Arial,sans-serif;background:#f1f5f9;color:#1e293b;font-size:13px;line-height:1.45}
  .page{padding:24px 28px}

  /* HEADER */
  .header{background:linear-gradient(135deg,#4338ca 0%,#7c3aed 100%);color:#fff;border-radius:16px;
    padding:26px 32px;display:flex;justify-content:space-between;align-items:center;margin-bottom:22px;
    box-shadow:0 4px 12px rgba(99,102,241,.35)}
  .header-left{display:flex;align-items:center;gap:18px}
  .header-meta h1{font-size:20px;font-weight:800;margin-bottom:3px}
  .header-meta p{font-size:12px;opacity:.75;margin-top:2px}
  .header-right{text-align:right;font-size:12px;opacity:.85}
  .header-right .period{font-size:15px;font-weight:700;margin-bottom:3px;opacity:1}

  /* SECTION */
  .section{margin-bottom:22px}
  .section-title{font-size:14px;font-weight:800;color:#1e293b;margin-bottom:12px;
    padding-bottom:7px;border-bottom:2px solid #e2e8f0;display:flex;align-items:center;gap:8px}
  .bar{display:inline-block;width:4px;height:16px;background:#6366f1;border-radius:2px;flex-shrink:0}

  /* KPI */
  .kpi-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:12px}
  .kpi-card{background:#fff;border-radius:14px;padding:18px 20px;
    box-shadow:0 1px 4px rgba(0,0,0,.08);border-top:4px solid}
  .kpi-card.g{border-color:#10b981} .kpi-card.b{border-color:#3b82f6} .kpi-card.p{border-color:#8b5cf6}
  .kpi-lbl{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#64748b;margin-bottom:7px}
  .kpi-val{font-size:26px;font-weight:900;color:#1e293b}
  .kpi-sub{font-size:11px;color:#94a3b8;margin-top:3px}

  /* COMPARISONS */
  .comp-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:18px}
  .comp-card{background:#fff;border-radius:12px;padding:14px 16px;box-shadow:0 1px 3px rgba(0,0,0,.07)}
  .comp-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#64748b;margin-bottom:5px}
  .comp-curr{font-size:17px;font-weight:800;color:#1e293b;margin-bottom:3px}
  .comp-growth{font-size:11px;font-weight:700;margin-bottom:2px}
  .comp-prev{font-size:10px;color:#94a3b8}

  /* CHARTS */
  .chart-box{background:#fff;border-radius:14px;padding:18px;box-shadow:0 1px 3px rgba(0,0,0,.07);margin-bottom:12px}
  .chart-title{font-size:11px;font-weight:700;color:#475569;margin-bottom:10px;text-transform:uppercase;letter-spacing:.05em}
  .chart-box img{display:block;margin:0 auto;max-width:100%}

  /* GRID */
  .g2{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px}

  /* TABLE */
  .tbl{width:100%;border-collapse:collapse;background:#fff;border-radius:12px;overflow:hidden;
    box-shadow:0 1px 3px rgba(0,0,0,.07);margin-bottom:12px}
  .tbl thead th{background:#f1f5f9;padding:9px 13px;text-align:left;font-size:10px;
    font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:#475569}
  .tbl tbody td{padding:9px 13px;border-bottom:1px solid #f1f5f9;font-size:12px;color:#334155}
  .tbl tbody tr:last-child td{border-bottom:none}
  .tbl tbody tr:nth-child(even) td{background:#f8fafc}
  td.center{text-align:center} td.right{text-align:right} td.num{text-align:center;color:#94a3b8;font-size:11px}

  /* INSIGHTS */
  .insights-grid{display:grid;grid-template-columns:1fr 1fr;gap:11px}
  .insight-card{background:#fff;border-radius:12px;padding:15px;box-shadow:0 1px 3px rgba(0,0,0,.07);
    display:flex;align-items:flex-start;gap:11px}
  .insight-icon{width:36px;height:36px;border-radius:9px;
    background:linear-gradient(135deg,#ede9fe,#ddd6fe);display:flex;align-items:center;
    justify-content:center;flex-shrink:0;font-size:18px}
  .insight-text{font-size:12px;color:#334155;line-height:1.55}

  /* PAGE BREAK */
  .pb{page-break-before:always;padding-top:22px}

  /* FOOTER */
  .footer{text-align:center;padding-top:18px;margin-top:24px;border-top:1px solid #e2e8f0;
    font-size:11px;color:#94a3b8}
  .footer strong{color:#6366f1}

  /* tbl-label */
  .tbl-label{font-size:11px;font-weight:700;color:#475569;text-transform:uppercase;
    letter-spacing:.05em;margin-bottom:7px}
</style>
</head>
<body>
<div class="page">

  <!-- ══════════════════════════ HEADER ══════════════════════════ -->
  <div class="header">
    <div class="header-left">
      ${logoHtml}
      <div class="header-meta">
        <h1>${company.name}</h1>
        ${company.branch ? `<p>Sucursal: ${company.branch}</p>` : ''}
        <p>Reporte de ventas</p>
      </div>
    </div>
    <div class="header-right">
      <div class="period">${startDate} → ${endDate}</div>
      <div>Generado el ${genDate}</div>
    </div>
  </div>

  <!-- ══════════════════════════ KPIs ══════════════════════════ -->
  <div class="section">
    <div class="section-title"><span class="bar"></span>KPIs Principales</div>
    <div class="kpi-grid">
      <div class="kpi-card g">
        <div class="kpi-lbl">Ventas totales</div>
        <div class="kpi-val">${fmt(kpis.totalRevenue)}</div>
        <div class="kpi-sub">Período seleccionado</div>
      </div>
      <div class="kpi-card b">
        <div class="kpi-lbl">Número de órdenes</div>
        <div class="kpi-val">${kpis.ordersCount}</div>
        <div class="kpi-sub">Órdenes completadas</div>
      </div>
      <div class="kpi-card p">
        <div class="kpi-lbl">Ticket promedio</div>
        <div class="kpi-val">${fmt(kpis.avgTicket)}</div>
        <div class="kpi-sub">Por orden</div>
      </div>
    </div>
    <div class="comp-grid">
      ${compCard('Hoy vs ayer', comparisons.today.current, comparisons.today.previous, comparisons.today.growth)}
      ${compCard('Esta semana vs semana pasada', comparisons.week.current, comparisons.week.previous, comparisons.week.growth)}
      ${compCard('Este mes vs mes anterior', comparisons.month.current, comparisons.month.previous, comparisons.month.growth)}
    </div>
  </div>

  <!-- ══════════════════════════ VENTAS EN EL TIEMPO ══════════════════════════ -->
  <div class="section">
    <div class="section-title"><span class="bar"></span>Ventas en el tiempo</div>
    <div class="chart-box">
      <div class="chart-title">Ingresos por día</div>
      <img src="${lineChart}" />
    </div>
  </div>

  <!-- ══════════════════════════ PÁGINA 2: PRODUCTOS ══════════════════════════ -->
  <div class="pb section">
    <div class="section-title"><span class="bar"></span>Análisis de Productos</div>
    <div class="g2">
      <div class="chart-box">
        <div class="chart-title">Top 10 — Cantidad vendida</div>
        <img src="${topQtyChart}" />
      </div>
      <div class="chart-box">
        <div class="chart-title">Top 10 — Mayor ingreso</div>
        <img src="${topRevChart}" />
      </div>
    </div>
    <div class="tbl-label">Tabla de productos</div>
    <table class="tbl">
      <thead>
        <tr>
          <th>#</th><th>Producto</th><th>Categoría</th>
          <th style="text-align:center">Cantidad</th><th style="text-align:right">Ingresos</th>
        </tr>
      </thead>
      <tbody>${productRows || '<tr><td colspan="5" style="text-align:center;color:#94a3b8">Sin datos</td></tr>'}</tbody>
    </table>
  </div>

  <!-- ══════════════════════════ PÁGINA 3: CATEGORÍAS + MESEROS ══════════════════════════ -->
  <div class="pb section">
    <div class="section-title"><span class="bar"></span>Categorías</div>
    <div class="g2">
      <div class="chart-box">
        <div class="chart-title">Distribución por categoría</div>
        <img src="${catPieChart}" />
      </div>
      <div class="chart-box" style="display:flex;flex-direction:column;justify-content:center">
        <div class="chart-title">Detalle por categoría</div>
        <table class="tbl" style="box-shadow:none">
          <thead>
            <tr>
              <th>Categoría</th>
              <th style="text-align:center">Unidades</th>
              <th style="text-align:right">Ingresos</th>
            </tr>
          </thead>
          <tbody>${catRows || '<tr><td colspan="3" style="text-align:center;color:#94a3b8">Sin datos</td></tr>'}</tbody>
        </table>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title"><span class="bar"></span>Desempeño de Meseros</div>
    <div class="chart-box">
      <div class="chart-title">Ventas por mesero</div>
      <img src="${waiterBarChart}" />
    </div>
    <div class="tbl-label">Tabla de meseros</div>
    <table class="tbl">
      <thead>
        <tr>
          <th>#</th><th>Mesero</th>
          <th style="text-align:center">Órdenes</th>
          <th style="text-align:right">Ingresos</th>
          <th style="text-align:right">Ticket promedio</th>
        </tr>
      </thead>
      <tbody>${waiterRows || '<tr><td colspan="5" style="text-align:center;color:#94a3b8">Sin datos</td></tr>'}</tbody>
    </table>
  </div>

  <!-- ══════════════════════════ PÁGINA 4: SERVICIO + TEMPORALIDAD ══════════════════════════ -->
  <div class="pb section">
    <div class="section-title"><span class="bar"></span>Tipo de Servicio</div>
    <div class="g2">
      <div class="chart-box">
        <div class="chart-title">Distribución por tipo de servicio</div>
        <img src="${servicePieChart}" />
      </div>
      <div class="chart-box" style="display:flex;flex-direction:column;justify-content:center">
        <div class="chart-title">Ingresos por servicio</div>
        <table class="tbl" style="box-shadow:none">
          <thead>
            <tr>
              <th>Tipo</th>
              <th style="text-align:center">Órdenes</th>
              <th style="text-align:right">Ingresos</th>
            </tr>
          </thead>
          <tbody>${serviceRows || '<tr><td colspan="3" style="text-align:center;color:#94a3b8">Sin datos</td></tr>'}</tbody>
        </table>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title"><span class="bar"></span>Temporalidad</div>
    <div class="chart-box" style="margin-bottom:12px">
      <div class="chart-title">Horas pico — Ingresos por hora del día (barra roja = hora pico)</div>
      <img src="${hourBarChart}" />
    </div>
    <div class="chart-box">
      <div class="chart-title">Ventas por día de la semana</div>
      <img src="${dowBarChart}" />
    </div>
  </div>

  <!-- ══════════════════════════ PÁGINA 5: INSIGHTS ══════════════════════════ -->
  <div class="pb section">
    <div class="section-title"><span class="bar"></span>Insights Automáticos</div>
    <div class="insights-grid">
      ${insightCards || '<p style="color:#94a3b8;font-size:12px">Sin datos suficientes para generar insights.</p>'}
    </div>
  </div>

  <div class="footer">
    Reporte generado por <strong>Orderlify</strong> &nbsp;·&nbsp; ${genDate}
  </div>

</div>
</body>
</html>`;
};

// ── Public API ─────────────────────────────────────────────────────────────────
const generatePdf = async (data) => {
  const html = await buildHtml(data);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '18px', right: '18px', bottom: '18px', left: '18px' },
    });
    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
};

module.exports = { generatePdf, generateChart };
