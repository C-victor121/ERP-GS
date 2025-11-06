import nodemailer from 'nodemailer';
import config from '../config/config';

const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: config.smtp.secure,
  auth: config.smtp.user && config.smtp.pass ? { user: config.smtp.user, pass: config.smtp.pass } : undefined,
});

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
}

export async function sendEmail(opts: SendEmailOptions) {
  if (!config.smtp.host) {
    throw new Error('SMTP no configurado: defina SMTP_HOST en .env');
  }
  const info = await transporter.sendMail({
    from: config.smtp.from,
    to: Array.isArray(opts.to) ? opts.to.join(', ') : opts.to,
    subject: opts.subject,
    html: opts.html,
  });
  return info;
}

export function renderInvoiceHTML(invoice: any) {
  const itemsRows = (invoice.items || []).map((it: any) => {
    return `<tr>
      <td>${it.sku || ''}</td>
      <td>${it.nombre}</td>
      <td style=\"text-align:right\">${it.cantidad}</td>
      <td style=\"text-align:right\">${Number(it.precioUnitario).toFixed(2)}</td>
      <td style=\"text-align:right\">${Number(it.subtotal).toFixed(2)}</td>
    </tr>`;
  }).join('');

  return `<!doctype html>
<html>
<head>
  <meta charset=\"utf-8\" />
  <title>Factura #${invoice.numero}</title>
  <style>
    body { font-family: Arial, sans-serif; color: #111; }
    .container { max-width: 720px; margin: 0 auto; padding: 16px; }
    .header { display:flex; justify-content: space-between; align-items: center; }
    .section { margin-top: 16px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border-bottom: 1px solid #eee; padding: 8px; }
    .totals { text-align: right; }
    .muted { color: #555; }
  </style>
</head>
<body>
  <div class=\"container\">
    <div class=\"header\">
      <div>
        <h2>Factura #${invoice.numero}</h2>
        <div class=\"muted\">Fecha: ${new Date(invoice.fecha).toLocaleString()}</div>
      </div>
      <div class=\"muted\">
        <div>NIT: ${invoice.emisorNit || '-'}</div>
        <div>Dirección: ${invoice.emisorDireccion || '-'}</div>
        <div>Teléfono: ${invoice.emisorTelefono || '-'}</div>
      </div>
    </div>

    <div class=\"section\">
      <strong>Cliente:</strong> ${invoice.clienteNombre}
    </div>

    <div class=\"section\">
      <table>
        <thead>
          <tr>
            <th>SKU</th>
            <th>Producto</th>
            <th>Cant.</th>
            <th>Precio</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
      </table>
    </div>

    <div class=\"section totals\">
      <div>SubTotal: ${Number(invoice.subTotal).toFixed(2)}</div>
      <div>Impuesto (${invoice.taxRate}%): ${Number(invoice.taxAmount).toFixed(2)}</div>
      <div><strong>Total: ${Number(invoice.total).toFixed(2)}</strong></div>
    </div>

    ${invoice.observaciones ? `<div class=\"section\"><strong>Observaciones:</strong> ${invoice.observaciones}</div>` : ''}

    <div class=\"section muted\">ERP Global Solar</div>
  </div>
</body>
</html>`;
}