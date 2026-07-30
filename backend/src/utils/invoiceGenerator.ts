import PDFDocument from 'pdfkit';

/**
 * Generates a professional tax invoice PDF and writes it directly to the writable stream (response).
 */
export const generateInvoicePDF = (payment: any, user: any, stream: NodeJS.WritableStream): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 40 });

      doc.on('end', () => resolve());
      doc.on('error', (err) => reject(err));

      doc.pipe(stream);

      // --- Draw header ---
      // Logo shape: Green Circle
      doc.fillColor('#059669')
         .circle(60, 60, 20)
         .fill();
      
      // White "KM" text inside the circle logo
      doc.fillColor('#ffffff')
         .fontSize(14)
         .font('Helvetica-Bold')
         .text('KM', 48, 53, { width: 24, align: 'center' });

      // Company title
      doc.fillColor('#1f2937')
         .fontSize(20)
         .font('Helvetica-Bold')
         .text('KrishiMitra AI', 90, 45);
      
      doc.fontSize(8)
         .font('Helvetica')
         .fillColor('#4b5563')
         .text('121 Agritech Innovation Park, Sector 62', 90, 67)
         .text('Noida, Uttar Pradesh, India - 201301', 90, 77)
         .text('Support: support@krishimitra.ai | GSTIN: 09AAPCK1208M1Z2', 90, 87);

      // Tax Invoice Title block
      doc.fillColor('#059669')
         .fontSize(18)
         .font('Helvetica-Bold')
         .text('TAX INVOICE', 40, 120, { align: 'right' });

      // Divider line
      doc.strokeColor('#e5e7eb')
         .lineWidth(1)
         .moveTo(40, 150)
         .lineTo(550, 150)
         .stroke();

      // --- Metadata Grid ---
      const invYear = payment.createdAt ? new Date(payment.createdAt).getFullYear() : new Date().getFullYear();
      const invSerial = payment._id.toString().slice(-6).toUpperCase();
      const invoiceNumber = `KM-INV-${invYear}-${invSerial}`;
      
      const billingDate = payment.createdAt 
        ? new Date(payment.createdAt).toLocaleDateString('en-IN') 
        : new Date().toLocaleDateString('en-IN');
      
      // Load next billing date or add 1 month/year for expiry date
      let formattedExpiry = 'N/A';
      if (user && user.subscriptionExpiry) {
        formattedExpiry = new Date(user.subscriptionExpiry).toLocaleDateString('en-IN');
      } else if (payment.billingCycle) {
        const amountDays = payment.billingCycle === 'yearly' ? 365 : 30;
        const fallbackExpiry = new Date(new Date(payment.createdAt || Date.now()).getTime() + amountDays * 24 * 60 * 60 * 1000);
        formattedExpiry = fallbackExpiry.toLocaleDateString('en-IN');
      }

      doc.fillColor('#1f2937')
         .fontSize(9)
         .font('Helvetica-Bold')
         .text('Invoice Number:', 40, 170)
         .font('Helvetica')
         .text(invoiceNumber, 130, 170)
         .font('Helvetica-Bold')
         .text('Invoice Date:', 40, 185)
         .font('Helvetica')
         .text(billingDate, 130, 185)
         .font('Helvetica-Bold')
         .text('Payment Mode:', 40, 200)
         .font('Helvetica')
         .text((payment.provider || 'razorpay').toUpperCase(), 130, 200);

      doc.font('Helvetica-Bold')
         .text('Order ID:', 300, 170)
         .font('Helvetica')
         .text(payment.orderId || 'N/A', 390, 170)
         .font('Helvetica-Bold')
         .text('Payment ID:', 300, 185)
         .font('Helvetica')
         .text(payment.paymentId || 'N/A', 390, 185)
         .font('Helvetica-Bold')
         .text('Status:', 300, 200)
         .fillColor('#059669')
         .font('Helvetica-Bold')
         .text('PAID', 390, 200);

      // --- Bill To Section ---
      doc.fillColor('#1f2937')
         .font('Helvetica-Bold')
         .fontSize(11)
         .text('BILL TO:', 40, 240);

      doc.font('Helvetica')
         .fontSize(9)
         .fillColor('#374151')
         .text(`Name:   ${user.name || 'Valued Farmer'}`, 40, 260)
         .text(`Email:  ${user.email || 'N/A'}`, 40, 275)
         .text(`Phone:  ${user.phone || 'N/A'}`, 40, 290);

      // --- Table Headers ---
      const tableTop = 330;
      doc.fillColor('#f3f4f6')
         .rect(40, tableTop, 510, 20)
         .fill();

      doc.fillColor('#1f2937')
         .font('Helvetica-Bold')
         .fontSize(8.5)
         .text('DESCRIPTION', 50, tableTop + 6)
         .text('BILLING CYCLE', 280, tableTop + 6)
         .text('AMOUNT', 480, tableTop + 6, { width: 60, align: 'right' });

      // --- Table Row ---
      const rowTop = tableTop + 25;
      const planDisplayName = payment.planName ? payment.planName.charAt(0).toUpperCase() + payment.planName.slice(1) : 'Premium';
      const billingCycleName = payment.billingCycle ? payment.billingCycle.charAt(0).toUpperCase() + payment.billingCycle.slice(1) : 'Monthly';

      doc.font('Helvetica-Bold')
         .fontSize(9)
         .text(`KrishiMitra AI - ${planDisplayName} Subscription Upgrade`, 50, rowTop)
         .font('Helvetica')
         .fontSize(8)
         .fillColor('#6b7280')
         .text('Unlimited leaf disease diagnosis scans, hyper-local weather alerts, and crop planning advisory.', 50, rowTop + 13)
         .fillColor('#1f2937')
         .font('Helvetica')
         .fontSize(9)
         .text(billingCycleName, 280, rowTop + 5)
         .text(`₹${payment.amount.toFixed(2)}`, 480, rowTop + 5, { width: 60, align: 'right' });

      // Line separator under table row
      doc.strokeColor('#e5e7eb')
         .lineWidth(0.5)
         .moveTo(40, rowTop + 35)
         .lineTo(550, rowTop + 35)
         .stroke();

      // --- Financial Calculations (18% IGST Breakdown) ---
      const totalAmount = payment.amount;
      const subtotal = totalAmount / 1.18;
      const gstAmount = totalAmount - subtotal;

      const subtotalTop = rowTop + 55;
      doc.font('Helvetica')
         .fontSize(9)
         .fillColor('#4b5563')
         .text('Subtotal:', 350, subtotalTop)
         .text('IGST (18%):', 350, subtotalTop + 15)
         .font('Helvetica-Bold')
         .fillColor('#1f2937')
         .text('Total Paid:', 350, subtotalTop + 35);

      doc.font('Helvetica')
         .fillColor('#4b5563')
         .text(`₹${subtotal.toFixed(2)}`, 480, subtotalTop, { width: 60, align: 'right' })
         .text(`₹${gstAmount.toFixed(2)}`, 480, subtotalTop + 15, { width: 60, align: 'right' })
         .font('Helvetica-Bold')
         .fillColor('#059669')
         .text(`₹${totalAmount.toFixed(2)}`, 480, subtotalTop + 35, { width: 60, align: 'right' });

      // Paid Badge Box
      doc.fillColor('#d1fae5')
         .rect(40, subtotalTop + 10, 80, 24)
         .fill();
      doc.fillColor('#065f46')
         .font('Helvetica-Bold')
         .fontSize(10)
         .text('PAID', 40, subtotalTop + 17, { width: 80, align: 'center' });

      // Expiry details note
      doc.fillColor('#6b7280')
         .fontSize(8)
         .font('Helvetica-Oblique')
         .text(`Subscription Expiry Date: ${formattedExpiry}`, 40, subtotalTop + 45);

      // --- Footer ---
      doc.strokeColor('#e5e7eb')
         .lineWidth(1)
         .moveTo(40, 520)
         .lineTo(550, 520)
         .stroke();

      doc.fillColor('#9ca3af')
         .fontSize(8)
         .font('Helvetica')
         .text('TERMS & CONDITIONS', 40, 535)
         .fillColor('#6b7280')
         .text('1. This is a computer-generated tax invoice and does not require a physical signature.', 40, 550)
         .text('2. Subscription charges are billed in advance based on the selected cycle.', 40, 562)
         .text('3. For support or refund queries, contact our finance team at support@krishimitra.ai.', 40, 574);

      doc.fillColor('#059669')
         .fontSize(11)
         .font('Helvetica-Bold')
         .text('Thank you for choosing KrishiMitra AI.', 40, 620, { align: 'center' });

      doc.fillColor('#9ca3af')
         .fontSize(7)
         .text('Empowering Farmers with Advanced Intelligent Agronomy.', 40, 637, { align: 'center' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};
