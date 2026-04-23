// src/services/pdf.service.js
import PDFDocument from 'pdfkit';

class PdfService {
  async generateDeliveryNotePdf(note) {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.fontSize(18).text('Albarán', { underline: true });
      doc.moveDown();

      doc.fontSize(12).text(`ID: ${note._id}`);
      doc.text(`Fecha de trabajo: ${new Date(note.workDate).toLocaleDateString()}`);
      doc.text(`Formato: ${note.format}`);
      doc.text(`Descripción: ${note.description || '-'}`);
      doc.moveDown();

      doc.text('Usuario');
      doc.text(`- Nombre: ${note.user?.name || '-'} ${note.user?.lastName || ''}`);
      doc.text(`- Email: ${note.user?.email || '-'}`);
      doc.moveDown();

      doc.text('Cliente');
      doc.text(`- Nombre: ${note.client?.name || '-'}`);
      doc.text(`- CIF: ${note.client?.cif || '-'}`);
      doc.text(`- Email: ${note.client?.email || '-'}`);
      doc.moveDown();

      doc.text('Proyecto');
      doc.text(`- Nombre: ${note.project?.name || '-'}`);
      doc.text(`- Código: ${note.project?.projectCode || '-'}`);
      doc.text(`- Email: ${note.project?.email || '-'}`);
      doc.moveDown();

      if (note.format === 'material') {
        doc.text('Detalle de material');
        doc.text(`- Material: ${note.material || '-'}`);
        doc.text(`- Cantidad: ${note.quantity ?? '-'}`);
        doc.text(`- Unidad: ${note.unit || '-'}`);
        doc.moveDown();
      }

      if (note.format === 'hours') {
        doc.text('Detalle de horas');
        doc.text(`- Horas totales: ${note.hours ?? '-'}`);

        if (note.workers?.length) {
          doc.moveDown(0.5);
          doc.text('Trabajadores:');
          note.workers.forEach((worker) => {
            doc.text(`  • ${worker.name} - ${worker.hours} h`);
          });
        }

        doc.moveDown();
      }

      doc.text(`Firmado: ${note.signed ? 'Sí' : 'No'}`);
      if (note.signedAt) {
        doc.text(`Fecha de firma: ${new Date(note.signedAt).toLocaleString()}`);
      }

      if (note.signatureUrl) {
        doc.moveDown();
        doc.text(`Firma: ${note.signatureUrl}`);
      }

      doc.end();
    });
  }
}

export default new PdfService();