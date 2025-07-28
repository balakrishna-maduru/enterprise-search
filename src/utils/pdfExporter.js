// src/utils/pdfExporter.js

/**
 * Export summary data to PDF format
 * Uses jsPDF library for PDF generation
 */
export const exportToPDF = async (exportData) => {
  try {
    // Dynamic import of jsPDF to avoid bundle size issues
    const { jsPDF } = await import('jspdf');
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const usableWidth = pageWidth - (margin * 2);
    let currentY = margin;
    
    // Helper function to add text with word wrapping
    const addText = (text, fontSize = 12, isBold = false, color = [0, 0, 0]) => {
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', isBold ? 'bold' : 'normal');
      doc.setTextColor(color[0], color[1], color[2]);
      
      const lines = doc.splitTextToSize(text, usableWidth);
      const lineHeight = fontSize * 0.5;
      
      // Check if we need a new page
      if (currentY + (lines.length * lineHeight) > pageHeight - margin) {
        doc.addPage();
        currentY = margin;
      }
      
      doc.text(lines, margin, currentY);
      currentY += lines.length * lineHeight + 5;
      
      return currentY;
    };
    
    // Helper function to add a section break
    const addSectionBreak = (height = 10) => {
      currentY += height;
      if (currentY > pageHeight - margin) {
        doc.addPage();
        currentY = margin;
      }
    };
    
    // Helper function to add a horizontal line
    const addHorizontalLine = () => {
      if (currentY > pageHeight - margin - 5) {
        doc.addPage();
        currentY = margin;
      }
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, currentY, pageWidth - margin, currentY);
      currentY += 10;
    };

    // Header with  branding
    doc.setFillColor(220, 38, 38); //  Red
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Enterprise Search', margin, 25);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('AI-Powered Document Summary Report', margin, 35);
    
    currentY = 60;
    
    // Report metadata
    addText('Document Summary Report', 18, true, [220, 38, 38]);
    addSectionBreak(5);
    
    addText(`Generated for: ${exportData.user.name}`, 12, true);
    addText(`Position: ${exportData.user.position}`, 12);
    addText(`Department: ${exportData.user.department}`, 12);
    addText(`Date: ${exportData.generatedAt.toLocaleDateString()}`, 12);
    addText(`Time: ${exportData.generatedAt.toLocaleTimeString()}`, 12);
    
    if (exportData.searchQuery) {
      addSectionBreak(5);
      addText(`Search Query: "${exportData.searchQuery}"`, 12, true);
    }
    
    addSectionBreak(15);
    addHorizontalLine();
    
    // AI-Generated Summary Section
    addText('AI-Generated Summary', 16, true, [147, 51, 234]); // Purple
    addSectionBreak(5);
    
    if (exportData.summary) {
      // Process markdown-like formatting for PDF
      const summaryText = cleanMarkdownForPDF(exportData.summary);
      addText(summaryText, 11);
    } else {
      addText('No summary available.', 11);
    }
    
    addSectionBreak(15);
    addHorizontalLine();
    
    // Source Documents Section
    addText(`Source Documents (${exportData.documents.length})`, 16, true, [147, 51, 234]);
    addSectionBreak(10);
    
    exportData.documents.forEach((doc, index) => {
      // Check if we need a new page for the document
      if (currentY > pageHeight - 100) {
        doc.addPage();
        currentY = margin;
      }
      
      // Document header
      addText(`${index + 1}. ${doc.title}`, 14, true, [59, 130, 246]); // Blue
      
      // Document metadata
      const metadata = [
        `Source: ${doc.source?.toUpperCase() || 'Unknown'}`,
        `Author: ${doc.author || 'Unknown'}`,
        `Date: ${doc.date || 'Unknown'}`,
        `Relevance: ${doc.relevanceScore || 0}%`
      ];
      
      addText(metadata.join(' • '), 10, false, [107, 114, 128]); // Gray
      
      // Document summary
      if (doc.summary) {
        addText(doc.summary, 11);
      }
      
      // Tags
      if (doc.tags && doc.tags.length > 0) {
        addText(`Tags: ${doc.tags.join(', ')}`, 10, false, [107, 114, 128]);
      }
      
      // URL (if available and not too long)
      if (doc.url && doc.url.length < 80) {
        addText(`URL: ${doc.url}`, 9, false, [59, 130, 246]);
      }
      
      addSectionBreak(10);
      
      // Add a light separator line between documents
      if (index < exportData.documents.length - 1) {
        doc.setDrawColor(230, 230, 230);
        doc.line(margin, currentY, pageWidth - margin, currentY);
        currentY += 8;
      }
    });
    
    // Footer on last page
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      
      // Footer
      doc.setFontSize(8);
      doc.setTextColor(107, 114, 128);
      doc.setFont('helvetica', 'normal');
      
      const footerText = `Generated by Enterprise Search with OpenAI • Page ${i} of ${totalPages}`;
      const footerWidth = doc.getTextWidth(footerText);
      doc.text(footerText, (pageWidth - footerWidth) / 2, pageHeight - 10);
    }
    
    // Generate filename
    const dateStr = exportData.generatedAt.toISOString().split('T')[0];
    const timeStr = exportData.generatedAt.toTimeString().split(':').slice(0, 2).join('-');
    const filename = `Summary-Report-${dateStr}-${timeStr}.pdf`;
    
    // Save the PDF
    doc.save(filename);
    
    return { success: true, filename };
    
  } catch (error) {
    console.error('PDF export failed:', error);
    throw new Error(`PDF export failed: ${error.message}`);
  }
};

/**
 * Clean markdown formatting for PDF display
 * Removes markdown syntax and converts to plain text with basic formatting indicators
 */
const cleanMarkdownForPDF = (markdownText) => {
  if (!markdownText) return '';
  
  return markdownText
    // Remove markdown headers but keep the text
    .replace(/^#{1,6}\s+/gm, '')
    // Convert bold to uppercase (since we can't easily do bold in simple text)
    .replace(/\*\*(.*?)\*\*/g, '$1')
    // Remove italic markers
    .replace(/\*(.*?)\*/g, '$1')
    // Remove code markers
    .replace(/`(.*?)`/g, '$1')
    // Convert bullet points
    .replace(/^[\s]*[-*+]\s+/gm, '• ')
    // Convert numbered lists
    .replace(/^[\s]*\d+\.\s+/gm, (match, offset, string) => {
      const lineStart = string.lastIndexOf('\n', offset) + 1;
      const lineText = string.substring(lineStart, offset);
      const indentLevel = lineText.match(/^\s*/)[0].length;
      return '  '.repeat(Math.floor(indentLevel / 2)) + '• ';
    })
    // Clean up extra whitespace
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .trim();
};

/**
 * Fallback export function for browsers that don't support dynamic imports
 */
export const exportToPDFStatic = (exportData) => {
  console.warn('Dynamic PDF export not available, falling back to text export');
  
  const content = `ENTERPRISE SEARCH - DOCUMENT SUMMARY REPORT
${'='.repeat(60)}

Generated for: ${exportData.user.name}
Position: ${exportData.user.position}
Department: ${exportData.user.department}
Date: ${exportData.generatedAt.toLocaleDateString()}
Time: ${exportData.generatedAt.toLocaleTimeString()}
${exportData.searchQuery ? `Search Query: "${exportData.searchQuery}"` : ''}

AI-GENERATED SUMMARY
${'-'.repeat(20)}
${exportData.summary || 'No summary available.'}

SOURCE DOCUMENTS (${exportData.documents.length})
${'-'.repeat(30)}
${exportData.documents.map((doc, index) => `
${index + 1}. ${doc.title}
   Source: ${doc.source?.toUpperCase() || 'Unknown'}
   Author: ${doc.author || 'Unknown'}
   Date: ${doc.date || 'Unknown'}
   Relevance: ${doc.relevanceScore || 0}%
   Summary: ${doc.summary || 'No summary available.'}
   Tags: ${doc.tags?.join(', ') || 'None'}
   ${doc.url ? `URL: ${doc.url}` : ''}
`).join('\n')}

Generated by Enterprise Search with OpenAI
`;

  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Summary-Report-${exportData.generatedAt.toISOString().split('T')[0]}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};