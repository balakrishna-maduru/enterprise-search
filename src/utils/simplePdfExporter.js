// src/utils/simplePdfExporter.js
import { jsPDF } from 'jspdf';

/**
 * Simple PDF export using static import
 */
export const exportSummaryToPDF = (exportData) => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const usableWidth = pageWidth - (margin * 2);
    let currentY = margin;
    
    // Helper function to check if we need a new page
    const checkNewPage = (requiredHeight = 20) => {
      if (currentY + requiredHeight > pageHeight - margin) {
        doc.addPage();
        currentY = margin;
        return true;
      }
      return false;
    };
    
    // Helper function to add text with automatic wrapping
    const addText = (text, fontSize = 12, isBold = false, color = [0, 0, 0], spacing = 5) => {
      if (!text) return currentY;
      
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', isBold ? 'bold' : 'normal');
      doc.setTextColor(color[0], color[1], color[2]);
      
      const lines = doc.splitTextToSize(text.toString(), usableWidth);
      const lineHeight = fontSize * 0.4;
      const totalHeight = lines.length * lineHeight + spacing;
      
      checkNewPage(totalHeight);
      
      doc.text(lines, margin, currentY);
      currentY += totalHeight;
      
      return currentY;
    };
    
    // Add  Header
    doc.setFillColor(220, 38, 38); //  Red
    doc.rect(0, 0, pageWidth, 35, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Enterprise Search', margin, 20);
    doc.setFontSize(10);
    doc.text('AI-Powered Document Summary Report', margin, 30);
    
    currentY = 50;
    
    // Report Title
    addText('Document Summary Report', 16, true, [220, 38, 38], 10);
    
    // User Information
    addText(`Generated for: ${exportData.user.name} (${exportData.user.position})`, 12, true);
    addText(`Department: ${exportData.user.department}`, 11);
    addText(`Generated: ${exportData.generatedAt.toLocaleString()}`, 11);
    
    if (exportData.searchQuery) {
      addText(`Search Query: "${exportData.searchQuery}"`, 11, false, [0, 0, 0], 10);
    }
    
    // Separator line
    currentY += 5;
    checkNewPage(15);
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 15;
    
    // AI Summary Section
    addText('AI-Generated Summary', 14, true, [147, 51, 234], 10);
    
    if (exportData.summary) {
      const cleanSummary = cleanTextForPDF(exportData.summary);
      addText(cleanSummary, 11, false, [0, 0, 0], 15);
    }
    
    // Another separator
    checkNewPage(15);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 15;
    
    // Documents Section
    addText(`Source Documents (${exportData.documents.length})`, 14, true, [147, 51, 234], 10);
    
    exportData.documents.forEach((document, index) => {
      checkNewPage(40); // Ensure we have space for at least part of the document
      
      // Document title
      addText(`${index + 1}. ${document.title}`, 12, true, [59, 130, 246]);
      
      // Metadata line
      const metadata = [
        `Source: ${document.source?.toUpperCase() || 'Unknown'}`,
        `Author: ${document.author || 'Unknown'}`,
        `Date: ${document.date || 'Unknown'}`,
        `Relevance: ${document.relevanceScore || 0}%`
      ];
      addText(metadata.join(' | '), 9, false, [107, 114, 128]);
      
      // Document summary
      if (document.summary) {
        addText(document.summary, 10, false, [0, 0, 0]);
      }
      
      // Tags
      if (document.tags && document.tags.length > 0) {
        addText(`Tags: ${document.tags.join(', ')}`, 9, false, [107, 114, 128]);
      }
      
      // URL (if reasonable length)
      if (document.url && document.url.length < 80) {
        addText(`URL: ${document.url}`, 8, false, [59, 130, 246]);
      }
      
      currentY += 8; // Space between documents
    });
    
    // Add page numbers
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(107, 114, 128);
      const footerText = `Enterprise Search | Page ${i} of ${pageCount}`;
      const textWidth = doc.getTextWidth(footerText);
      doc.text(footerText, (pageWidth - textWidth) / 2, pageHeight - 10);
    }
    
    // Generate filename
    const timestamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
    const filename = `Summary-${timestamp}.pdf`;
    
    // Save the PDF
    doc.save(filename);
    
    return { success: true, filename };
    
  } catch (error) {
    console.error('PDF generation failed:', error);
    throw error;
  }
};

/**
 * Clean text for PDF display - remove markdown and format properly
 */
const cleanTextForPDF = (text) => {
  if (!text) return '';
  
  return text
    // Remove markdown headers
    .replace(/^#{1,6}\s+/gm, '')
    // Remove bold markers but keep text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    // Remove italic markers
    .replace(/\*(.*?)\*/g, '$1')
    // Remove code markers
    .replace(/`(.*?)`/g, '$1')
    // Convert bullet points
    .replace(/^[\s]*[-*+]\s+/gm, '• ')
    // Convert numbered lists (basic)
    .replace(/^[\s]*(\d+)\.\s+/gm, '$1. ')
    // Clean up excessive whitespace
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .replace(/\s+/g, ' ')
    .trim();
};