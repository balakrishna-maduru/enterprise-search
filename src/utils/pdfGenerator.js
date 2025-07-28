// src/utils/pdfGenerator.js
import jsPDF from 'jspdf';

export class PDFGenerator {
  constructor() {
    this.doc = new jsPDF('p', 'mm', 'a4');
    this.pageHeight = 297; // A4 height in mm
    this.pageWidth = 210; // A4 width in mm
    this.margin = 20;
    this.currentY = this.margin;
    this.lineHeight = 7;
    this.maxWidth = this.pageWidth - (this.margin * 2);
  }

  // Add a new page if needed
  checkPageBreak(heightNeeded = 10) {
    if (this.currentY + heightNeeded > this.pageHeight - this.margin) {
      this.doc.addPage();
      this.currentY = this.margin;
      return true;
    }
    return false;
  }

  // Add text with word wrapping
  addText(text, fontSize = 10, style = 'normal', color = [0, 0, 0]) {
    this.doc.setFontSize(fontSize);
    this.doc.setTextColor(...color);
    
    if (style === 'bold') {
      this.doc.setFont('helvetica', 'bold');
    } else if (style === 'italic') {
      this.doc.setFont('helvetica', 'italic');
    } else {
      this.doc.setFont('helvetica', 'normal');
    }

    // Split text into lines that fit the page width
    const lines = this.doc.splitTextToSize(text, this.maxWidth);
    
    // Check if we need a new page
    this.checkPageBreak(lines.length * this.lineHeight);
    
    // Add each line
    lines.forEach(line => {
      this.doc.text(line, this.margin, this.currentY);
      this.currentY += this.lineHeight;
    });
    
    return this;
  }

  // Add a title
  addTitle(title, fontSize = 18, color = [0, 0, 0]) {
    this.addText(title, fontSize, 'bold', color);
    this.currentY += 5; // Extra spacing after title
    return this;
  }

  // Add a heading
  addHeading(heading, fontSize = 14, color = [0, 0, 0]) {
    this.currentY += 5; // Space before heading
    this.addText(heading, fontSize, 'bold', color);
    this.currentY += 2; // Space after heading
    return this;
  }

  // Add a horizontal line
  addLine(color = [200, 200, 200]) {
    this.checkPageBreak(5);
    this.doc.setDrawColor(...color);
    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
    this.currentY += 5;
    return this;
  }

  // Add a box with background color
  addBox(text, fontSize = 10, bgColor = [245, 245, 245], textColor = [0, 0, 0]) {
    const lines = this.doc.splitTextToSize(text, this.maxWidth - 10);
    const boxHeight = (lines.length * this.lineHeight) + 10;
    
    this.checkPageBreak(boxHeight);
    
    // Draw box background
    this.doc.setFillColor(...bgColor);
    this.doc.rect(this.margin, this.currentY, this.maxWidth, boxHeight, 'F');
    
    // Add text inside box
    this.currentY += 5; // Padding top
    this.doc.setFontSize(fontSize);
    this.doc.setTextColor(...textColor);
    this.doc.setFont('helvetica', 'normal');
    
    lines.forEach(line => {
      this.doc.text(line, this.margin + 5, this.currentY);
      this.currentY += this.lineHeight;
    });
    
    this.currentY += 5; // Padding bottom
    return this;
  }

  // Add metadata section
  addMetadata(metadata) {
    this.addHeading('Document Information', 12, [100, 100, 100]);
    
    Object.entries(metadata).forEach(([key, value]) => {
      if (value) {
        this.addText(`${key}: ${value}`, 9, 'normal', [80, 80, 80]);
      }
    });
    
    this.currentY += 5;
    return this;
  }

  // Add a document card
  addDocumentCard(doc, index) {
    this.checkPageBreak(25);
    
    // Card background
    this.doc.setFillColor(248, 249, 250);
    this.doc.rect(this.margin, this.currentY, this.maxWidth, 20, 'F');
    
    // Card border
    this.doc.setDrawColor(220, 220, 220);
    this.doc.rect(this.margin, this.currentY, this.maxWidth, 20);
    
    const cardStartY = this.currentY;
    this.currentY += 4; // Padding
    
    // Document title
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(0, 0, 0);
    const titleText = `${index}. ${doc.title}`;
    const titleLines = this.doc.splitTextToSize(titleText, this.maxWidth - 10);
    this.doc.text(titleLines[0], this.margin + 3, this.currentY);
    this.currentY += 6;
    
    // Document metadata
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(100, 100, 100);
    const metaText = `Source: ${doc.source.toUpperCase()} | Author: ${doc.author} | Date: ${doc.date}`;
    this.doc.text(metaText, this.margin + 3, this.currentY);
    this.currentY += 5;
    
    // Document summary (truncated)
    this.doc.setTextColor(80, 80, 80);
    const summaryText = doc.summary.length > 100 ? doc.summary.substring(0, 100) + '...' : doc.summary;
    const summaryLines = this.doc.splitTextToSize(summaryText, this.maxWidth - 10);
    this.doc.text(summaryLines[0], this.margin + 3, this.currentY);
    
    this.currentY = cardStartY + 25; // Move to next position
    return this;
  }

  // Add statistics section
  addStatistics(stats) {
    this.addHeading('Statistics', 14, [0, 0, 0]);
    
    // Create a simple table-like layout
    const statsData = [
      ['Documents Analyzed', stats.documentsCount || 0],
      ['Average Relevance', `${stats.avgRelevance || 0}%`],
      ['Source Systems', stats.sourceSystems || 0],
      ['Generated', new Date().toLocaleDateString()]
    ];
    
    statsData.forEach(([label, value]) => {
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(0, 0, 0);
      this.doc.text(`${label}:`, this.margin, this.currentY);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(String(value), this.margin + 50, this.currentY);
      this.currentY += this.lineHeight;
    });
    
    this.currentY += 5;
    return this;
  }

  // Add footer to all pages
  addFooter(footerText, companyName) {
    const pageCount = this.doc.internal.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(150, 150, 150);
      
      // Company name on left
      this.doc.text(companyName, this.margin, this.pageHeight - 10);
      
      // Page number on right
      const pageText = `Page ${i} of ${pageCount}`;
      const pageWidth = this.doc.getTextWidth(pageText);
      this.doc.text(pageText, this.pageWidth - this.margin - pageWidth, this.pageHeight - 10);
      
      // Footer text in center
      if (footerText) {
        const footerWidth = this.doc.getTextWidth(footerText);
        this.doc.text(footerText, (this.pageWidth - footerWidth) / 2, this.pageHeight - 10);
      }
    }
    
    return this;
  }

  // Generate and download the PDF
  download(filename) {
    this.doc.save(filename);
  }

  // Get the PDF as blob
  getBlob() {
    return this.doc.output('blob');
  }
}

// Helper function to generate AI Summary PDF
export const generateAISummaryPDF = (data) => {
  const pdf = new PDFGenerator();
  const { 
    searchQuery, 
    conversationalSummary, 
    searchResults, 
    currentUser, 
    searchMode, 
    connectionStatus,
    companyName = 'Enterprise'
  } = data;

  // Title and metadata
  pdf.addTitle(`AI-Powered Search Summary`, 20, [220, 38, 38]);
  
  pdf.addMetadata({
    'Search Query': searchQuery,
    'Generated': new Date().toLocaleString(),
    'User': `${currentUser.name} (${currentUser.position})`,
    'Department': currentUser.department,
    'Search Mode': searchMode,
    'Connection Status': connectionStatus
  });

  pdf.addLine();

  // AI Summary section
  pdf.addHeading('AI Summary', 16, [220, 38, 38]);
  pdf.addBox(conversationalSummary, 11, [248, 249, 250], [0, 0, 0]);

  // Search context
  pdf.addHeading('Search Context', 14, [100, 100, 100]);
  pdf.addText(`• Found ${searchResults.length} relevant documents`, 10);
  pdf.addText(`• Search Mode: ${searchMode}`, 10);
  pdf.addText(`• Connection Status: ${connectionStatus}`, 10);

  // Top results
  if (searchResults.length > 0) {
    pdf.addHeading('Top Results', 14, [100, 100, 100]);
    searchResults.slice(0, 5).forEach((result, index) => {
      pdf.addDocumentCard(result, index + 1);
    });
  }

  // Footer
  pdf.addFooter('Generated using AI-powered enterprise search system', companyName);

  return pdf;
};

// Helper function to generate Document Summary PDF
export const generateDocumentSummaryPDF = (data) => {
  const pdf = new PDFGenerator();
  const {
    searchQuery,
    generatedSummary,
    selectedDocuments,
    currentUser,
    companyName = 'Enterprise'
  } = data;

  // Title
  pdf.addTitle('Document Summary Report', 20, [220, 38, 38]);
  pdf.addText('AI-Generated Comprehensive Analysis', 12, 'italic', [100, 100, 100]);

  // Metadata
  pdf.addMetadata({
    'Generated for': `${currentUser.name} (${currentUser.position})`,
    'Department': currentUser.department,
    'Date': new Date().toLocaleDateString(),
    'Search Query': searchQuery
  });

  pdf.addLine();

  // Statistics
  const avgRelevance = Math.round(selectedDocuments.reduce((sum, doc) => sum + doc.relevanceScore, 0) / selectedDocuments.length);
  const sourceSystems = [...new Set(selectedDocuments.map(d => d.source))].length;
  
  pdf.addStatistics({
    documentsCount: selectedDocuments.length,
    avgRelevance: avgRelevance,
    sourceSystems: sourceSystems
  });

  pdf.addLine();

  // AI Summary
  pdf.addHeading('AI-Generated Summary', 16, [220, 38, 38]);
  pdf.addBox(generatedSummary, 11, [248, 249, 250], [0, 0, 0]);

  // Source documents
  pdf.addHeading(`Source Documents (${selectedDocuments.length})`, 14, [100, 100, 100]);
  selectedDocuments.forEach((doc, index) => {
    pdf.addDocumentCard(doc, index + 1);
  });

  // Footer
  pdf.addFooter(`Generated by ${companyName} Enterprise Search with AI`, companyName);

  return pdf;
};