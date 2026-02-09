const PDFDocument = require('pdfkit');

/**
 * Generate a professional bill PDF for an order
 * @param {Object} orderData - Order details including items, customer, table, etc.
 * @returns {PDFDocument} - PDF document stream
 */
function generateBillPDF(orderData) {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    const {
        _id,
        customer,
        table,
        token,
        items,
        total,
        orderType,
        deliveryAddress,
        customerPhone,
        instructions,
        createdAt,
    } = orderData;

    // Calculate GST
    const subtotal = total / 1.05; // Reverse calculate subtotal from total (which includes 5% GST)
    const cgst = subtotal * 0.025; // 2.5%
    const sgst = subtotal * 0.025; // 2.5%
    const grandTotal = subtotal + cgst + sgst;

    // Logo - Top Left
    try {
        const logoPath = require('path').resolve(__dirname, '../../restaurant-frontend/public/GH.jpg');
        doc.image(logoPath, 50, 40, { width: 100 });
    } catch (err) {
        console.warn('Logo not found at expected path:', err.message);
    }

    // Header - Restaurant Name
    doc
        .fontSize(24)
        .font('Helvetica-Bold')
        .fillColor('#e74c3c')
        .text('GOURMET HAVEN', { align: 'center' });

    doc
        .fontSize(12)
        .font('Helvetica')
        .fillColor('#666')
        .text('Fine Dining Excellence', { align: 'center' });

    doc.moveDown(0.5);

    // Restaurant Details
    doc
        .fontSize(10)
        .fillColor('#333')
        .text('123 Culinary Street, Food District, Gourmet City, GC 12345', { align: 'center' });

    doc.text('Phone: +91 98765 43210 | Email: info@gourmethaven.com', { align: 'center' });
    doc.text('GSTIN: 29AABCU9603R1ZX', { align: 'center' });

    doc.moveDown(1);

    // Horizontal line
    doc
        .strokeColor('#e74c3c')
        .lineWidth(2)
        .moveTo(50, doc.y)
        .lineTo(550, doc.y)
        .stroke();

    doc.moveDown(0.5);

    // Tax Invoice Title
    doc
        .fontSize(16)
        .font('Helvetica-Bold')
        .fillColor('#2c3e50')
        .text('TAX INVOICE', { align: 'center' });

    doc.moveDown(1);

    // Order Details
    const orderDate = new Date(createdAt);
    const leftColumn = 50;
    const rightColumn = 350;
    let currentY = doc.y;

    doc.fontSize(10).font('Helvetica-Bold').fillColor('#333');
    doc.text('Order ID:', leftColumn, currentY);
    doc.font('Helvetica').text(`#${_id.toString().slice(-8).toUpperCase()}`, leftColumn + 80, currentY);

    doc.font('Helvetica-Bold').text('Date:', rightColumn, currentY);
    doc.font('Helvetica').text(orderDate.toLocaleDateString('en-IN'), rightColumn + 80, currentY);

    currentY += 20;
    doc.font('Helvetica-Bold').text('Type:', leftColumn, currentY);
    doc.font('Helvetica').text(orderType || 'Advance', leftColumn + 80, currentY);

    doc.font('Helvetica-Bold').text('Time:', rightColumn, currentY);
    doc.font('Helvetica').text(orderDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }), rightColumn + 80, currentY);

    if (orderType === 'Online') {
        currentY += 20;
        doc.font('Helvetica-Bold').text('Phone:', leftColumn, currentY);
        doc.font('Helvetica').text(customerPhone || 'N/A', leftColumn + 80, currentY);

        currentY += 20;
        doc.font('Helvetica-Bold').text('Address:', leftColumn, currentY);
        doc.font('Helvetica').text(deliveryAddress || 'N/A', leftColumn + 80, currentY, { width: 400 });
        currentY = doc.y; // Update Y after multiline text
    } else {
        currentY += 20;
        doc.font('Helvetica-Bold').text('Table:', leftColumn, currentY);
        doc.font('Helvetica').text(table || 'N/A', leftColumn + 80, currentY);

        if (token) {
            doc.font('Helvetica-Bold').text('Token:', rightColumn, currentY);
            doc.font('Helvetica').text(token, rightColumn + 80, currentY);
        }
    }

    if (customer) {
        currentY += 20;
        doc.font('Helvetica-Bold').text('Customer:', leftColumn, currentY);
        doc.font('Helvetica').text(customer, leftColumn + 80, currentY);
    }

    if (instructions) {
        currentY += 20;
        doc.font('Helvetica-Bold').text('Instructions:', leftColumn, currentY);
        doc.font('Helvetica').text(instructions, leftColumn + 80, currentY, { width: 400 });
        currentY = doc.y;
    }

    doc.moveDown(2);

    // Items Table Header
    currentY = doc.y;
    doc
        .strokeColor('#ddd')
        .lineWidth(1)
        .moveTo(50, currentY)
        .lineTo(550, currentY)
        .stroke();

    currentY += 10;

    doc
        .fontSize(11)
        .font('Helvetica-Bold')
        .fillColor('#2c3e50');

    doc.text('Item Name', 60, currentY);
    doc.text('Qty', 320, currentY, { width: 50, align: 'center' });
    doc.text('Price', 380, currentY, { width: 70, align: 'right' });
    doc.text('Amount', 460, currentY, { width: 80, align: 'right' });

    currentY += 20;

    doc
        .strokeColor('#ddd')
        .lineWidth(1)
        .moveTo(50, currentY)
        .lineTo(550, currentY)
        .stroke();

    currentY += 15;

    // Items
    doc.fontSize(10).font('Helvetica').fillColor('#333');

    if (Array.isArray(items) && items.length > 0) {
        items.forEach((item) => {
            const itemName = item.name || item._id?.name || 'Unknown Item';
            const quantity = item.quantity || 1;
            const price = item.price || item._id?.price || 0;
            const amount = quantity * price;

            doc.text(itemName, 60, currentY, { width: 240 });
            doc.text(quantity.toString(), 320, currentY, { width: 50, align: 'center' });
            doc.text(`₹${price.toFixed(2)}`, 380, currentY, { width: 70, align: 'right' });
            doc.text(`₹${amount.toFixed(2)}`, 460, currentY, { width: 80, align: 'right' });

            currentY += 25;
        });
    }

    currentY += 10;

    // Totals Section
    doc
        .strokeColor('#ddd')
        .lineWidth(1)
        .moveTo(50, currentY)
        .lineTo(550, currentY)
        .stroke();

    currentY += 15;

    // Subtotal
    doc.fontSize(10).font('Helvetica').fillColor('#333');
    doc.text('Subtotal:', 380, currentY, { width: 80, align: 'right' });
    doc.text(`₹${subtotal.toFixed(2)}`, 460, currentY, { width: 80, align: 'right' });

    currentY += 20;

    // CGST
    doc.text('CGST (2.5%):', 380, currentY, { width: 80, align: 'right' });
    doc.text(`₹${cgst.toFixed(2)}`, 460, currentY, { width: 80, align: 'right' });

    currentY += 20;

    // SGST
    doc.text('SGST (2.5%):', 380, currentY, { width: 80, align: 'right' });
    doc.text(`₹${sgst.toFixed(2)}`, 460, currentY, { width: 80, align: 'right' });

    currentY += 10;

    doc
        .strokeColor('#e74c3c')
        .lineWidth(2)
        .moveTo(350, currentY)
        .lineTo(550, currentY)
        .stroke();

    currentY += 15;

    // Grand Total
    doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .fillColor('#e74c3c');

    doc.text('GRAND TOTAL:', 380, currentY, { width: 80, align: 'right' });
    doc.text(`₹${grandTotal.toFixed(2)}`, 460, currentY, { width: 80, align: 'right' });

    currentY += 30;

    doc
        .strokeColor('#ddd')
        .lineWidth(1)
        .moveTo(50, currentY)
        .lineTo(550, currentY)
        .stroke();

    // Footer
    doc.moveDown(2);
    doc
        .fontSize(11)
        .font('Helvetica-Bold')
        .fillColor('#27ae60')
        .text('Thank you for dining with us!', { align: 'center' });

    doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor('#666')
        .text('Visit again soon! 😊', { align: 'center' });

    doc.moveDown(1);

    doc
        .fontSize(8)
        .fillColor('#999')
        .text('This is a computer-generated invoice and does not require a signature.', { align: 'center' });

    // Finalize the PDF
    doc.end();

    return doc;
}

module.exports = {
    generateBillPDF,
};
