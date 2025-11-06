import { Request, Response, NextFunction } from 'express';
import Invoice from '../models/invoice.model';
import Product from '../models/product.model';
import InventorySettings from '../models/settings.model';
import { ApiError } from '../utils/errorHandler';
import { sendEmail, renderInvoiceHTML } from '../services/email.service';

export const getAllInvoices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { estado, empresa } = req.query as any;
    const query: any = {};
    if (estado) query.estado = estado;
    if (empresa) query.empresa = empresa;
    const invoices = await Invoice.find(query).sort({ fecha: -1 });
    return res.status(200).json({ success: true, count: invoices.length, data: invoices });
  } catch (error) {
    next(error);
  }
};

export const getInvoiceById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const invoice = await Invoice.findById(req.params.id as any);
    if (!invoice) return next(new ApiError(404, 'Factura no encontrada'));
    return res.status(200).json({ success: true, data: invoice });
  } catch (error) {
    next(error);
  }
};

export const createInvoice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { clienteNombre, items, taxRate, observaciones } = req.body;
    if (!clienteNombre || !items || !Array.isArray(items) || items.length === 0) {
      return next(new ApiError(400, 'Cliente y al menos un ítem son obligatorios'));
    }

    // Asegurar configuración para taxRate por defecto
    let settings = await InventorySettings.findOne();
    if (!settings) settings = await InventorySettings.create({});

    const effectiveTaxRate = typeof taxRate === 'number' ? taxRate : (settings.taxRate || 0);

    // Cargar productos y calcular subtotales
    const populatedItems = await Promise.all(items.map(async (it: any) => {
      const product = await Product.findById(it.product);
      if (!product) throw new ApiError(404, `Producto no encontrado: ${it.product}`);
      const precioUnitario = typeof it.precioUnitario === 'number' ? it.precioUnitario : product.precio;
      const cantidad = Number(it.cantidad || 0);
      if (cantidad <= 0) throw new ApiError(400, 'La cantidad debe ser mayor a 0');
      const subtotal = precioUnitario * cantidad;
      return {
        product: product._id,
        sku: (product as any).sku,
        nombre: product.nombre,
        cantidad,
        precioUnitario,
        subtotal,
      };
    }));

    const subTotal = populatedItems.reduce((sum, it) => sum + it.subtotal, 0);
    const taxAmount = Math.round(subTotal * effectiveTaxRate) / 100; // taxRate en %
    const total = subTotal + taxAmount;

    const numero = await (Invoice as any).generateNumber();

    // Asignar empresa y datos del emisor desde usuario autenticado si existe
    const user = (req as any).user;
    const empresa = user?.empresa;
    const emisorNit = (user as any)?.nit;
    const emisorDireccion = (user as any)?.direccion;
    const emisorTelefono = (user as any)?.telefono;

    const invoice = await Invoice.create({
      numero,
      clienteNombre,
      fecha: new Date(),
      items: populatedItems,
      subTotal,
      taxRate: effectiveTaxRate,
      taxAmount,
      total,
      estado: 'emitida',
      vendedor: user?._id,
      empresa,
      observaciones,
      emisorNit,
      emisorDireccion,
      emisorTelefono,
    });

    // Actualizar stock por salida (venta)
    // Importar cuentas y lógica de updateStock si se requiere contabilidad más adelante
    await Promise.all(populatedItems.map(async (it) => {
      const product = await Product.findById(it.product);
      if (!product) return; // ya validado
      const newStock = Math.max(0, product.stock - it.cantidad);
      await Product.findByIdAndUpdate(product._id as any, { stock: newStock }, { new: true });
    }));

    return res.status(201).json({ success: true, data: invoice });
  } catch (error) {
    next(error);
  }
};

export const annulInvoice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(req.params.id as any, { estado: 'anulada' }, { new: true });
    if (!invoice) return next(new ApiError(404, 'Factura no encontrada'));
    return res.status(200).json({ success: true, data: invoice, message: 'Factura anulada' });
  } catch (error) {
    next(error);
  }
};

export const sendInvoiceEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const invoice = await Invoice.findById(req.params.id as any);
    if (!invoice) return next(new ApiError(404, 'Factura no encontrada'));

    const { to } = req.body;
    const user = (req as any).user;

    // Destinatarios por defecto: correos del usuario autenticado (emisor)
    let recipients: string[] = [];
    const userEmails: string[] = Array.isArray(user?.correos) ? user.correos : [];
    if (userEmails.length > 0) {
      recipients = userEmails;
    }

    // Si el cliente tiene correo, podemos incorporarlo en el futuro (no está modelado aún)
    // Permitir sobrescribir destinatarios vía payload
    const payloadEmails: string[] = Array.isArray(to) ? to : (typeof to === 'string' && to ? [to] : []);
    if (payloadEmails.length > 0) {
      recipients = payloadEmails;
    }

    if (!recipients || recipients.length === 0) {
      return next(new ApiError(400, 'No hay destinatarios para enviar la factura'));
    }

    const html = renderInvoiceHTML(invoice);
    const subject = `Factura #${(invoice as any).numero} - ${invoice.clienteNombre}`;

    await sendEmail({ to: recipients, subject, html });

    return res.status(200).json({ success: true, message: 'Factura enviada por correo', data: { to: recipients } });
  } catch (error) {
    next(error);
  }
};