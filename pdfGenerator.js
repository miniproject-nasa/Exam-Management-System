const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

async function generateInvigilationPDF(selectedFaculties, selectedRooms, dutyDate) {
    try {
        // Create a new PDFDocument
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
        
        // Embed the standard font
        const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
        
        // Set initial position for header
        let yOffset = 800;
        const centerX = page.getWidth() / 2;
        
        // Header text
        const headers = [
            "Rajiv Gandhi Institute of Technology, Kottayam",
            "Department of Computer Science and Engineering",
            "B. Tech Computer Science and Engineering",
            "Invigilation Duty"
        ];
        
        // Draw headers
        headers.forEach((text, index) => {
            const fontSize = index === 0 ? 16 : 14;
            const font = index === 3 ? helveticaBold : helvetica;
            const textWidth = font.widthOfTextAtSize(text, fontSize);
            page.drawText(text, {
                x: centerX - textWidth / 2,
                y: yOffset,
                size: fontSize,
                font: font
            });
            yOffset -= 25;
        });
        
        // Draw date
        const formattedDate = new Date(dutyDate).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        const dateText = `Date: ${formattedDate}`;
        page.drawText(dateText, {
            x: 50,
            y: yOffset,
            size: 12,
            font: helvetica
        });
        yOffset -= 40;
        
        // Table headers
        const columnHeaders = ['Sl No.', 'Faculty Name', 'Room No.'];
        const columnWidths = [80, 300, 100];
        const startX = 50;
        let currentX = startX;
        
        // Draw table header
        columnHeaders.forEach((header, index) => {
            page.drawText(header, {
                x: currentX,
                y: yOffset,
                size: 12,
                font: helveticaBold
            });
            currentX += columnWidths[index];
        });
        yOffset -= 20;
        
        // Draw horizontal line below headers
        page.drawLine({
            start: { x: startX, y: yOffset + 15 },
            end: { x: startX + columnWidths.reduce((a, b) => a + b, 0), y: yOffset + 15 },
            thickness: 1,
            color: rgb(0, 0, 0)
        });
        
        // Draw table content
        selectedFaculties.forEach((faculty, index) => {
            const roomCode = selectedRooms[index % selectedRooms.length];
            currentX = startX;
            
            // Draw serial number
            page.drawText((index + 1).toString(), {
                x: currentX + 30,
                y: yOffset,
                size: 12,
                font: helvetica
            });
            currentX += columnWidths[0];
            
            // Draw faculty name
            page.drawText(faculty, {
                x: currentX,
                y: yOffset,
                size: 12,
                font: helvetica
            });
            currentX += columnWidths[1];
            
            // Draw room number
            page.drawText(roomCode, {
                x: currentX,
                y: yOffset,
                size: 12,
                font: helvetica
            });
            
            yOffset -= 20;
        });
        
        // Generate PDF bytes
        const pdfBytes = await pdfDoc.save();
        return pdfBytes;
    } catch (error) {
        console.error('Error generating PDF:', error);
        throw new Error('Failed to generate PDF');
    }
}

module.exports = { generateInvigilationPDF };