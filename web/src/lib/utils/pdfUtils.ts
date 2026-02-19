import html2pdf from 'html2pdf.js';

/**
 * Options for PDF generation
 */
export interface PdfOptions {
  filename?: string;
  pageSize?: 'a4' | 'letter' | 'legal' | [number, number];
  orientation?: 'portrait' | 'landscape';
  margin?: [number, number, number, number]; // [top, right, bottom, left] in mm
  imageQuality?: number; // 0-1 scale
  scale?: number; // html2canvas scale factor
  enableLinks?: boolean;
  pageBreakMargin?: number;
}

/**
 * Utility class for PDF operations
 */
export class PdfUtils {
  /**
   * Generate PDF from an HTML element
   * 
   * @param element - HTML element to convert to PDF
   * @param options - PDF generation options
   * @returns Promise that resolves when PDF is generated
   */
  static async generatePdf(
    element: HTMLElement,
    options: PdfOptions = {}
  ): Promise<void> {
    // Default options
    const defaultOptions: PdfOptions = {
      filename: 'document.pdf',
      pageSize: 'a4',
      orientation: 'portrait',
      margin: [10, 10, 10, 10],
      imageQuality: 0.98,
      scale: 2,
      enableLinks: true,
      pageBreakMargin: 0,
    };

    // Merge with user options
    const mergedOptions = { ...defaultOptions, ...options };

    // Create clone of element to avoid modifying the original
    const clone = element.cloneNode(true) as HTMLElement;
    
    // Configure html2pdf options with proper typing
    const opt = {
      margin: mergedOptions.margin as [number, number, number, number],
      filename: mergedOptions.filename as string,
      image: { 
        type: 'jpeg', 
        quality: mergedOptions.imageQuality as number 
      },
      html2canvas: { 
        scale: mergedOptions.scale as number, 
        useCORS: true,
        logging: false,
        letterRendering: true,
        allowTaint: true,
      },
      jsPDF: { 
        unit: 'mm' as const, 
        format: mergedOptions.pageSize as 'a4' | 'letter' | 'legal' | [number, number], 
        orientation: mergedOptions.orientation as 'portrait' | 'landscape',
      },
      pagebreak: { 
        mode: ['css', 'legacy'] as string[], 
        before: '.page-break', 
        avoid: '.no-break' 
      },
      enableLinks: mergedOptions.enableLinks as boolean,
    };
    
    try {
      // Generate PDF
      await html2pdf().from(clone).set(opt as any).save();
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  }

  /**
   * Generate PDF from email content with specific email-friendly settings
   * 
   * @param emailElement - The email container element
   * @param emailData - Email data for file naming
   * @returns Promise that resolves when PDF is generated
   */
  static async generateEmailPdf(
    emailElement: HTMLElement,
    emailData: { subject?: string; from?: string; date?: string }
  ): Promise<void> {
    try {
      // Prepare a clean clone for PDF generation
      const clone = emailElement.cloneNode(true) as HTMLElement;
      
      // Remove download buttons from the PDF
      const downloadButtons = clone.querySelectorAll('.download-btn-container');
      downloadButtons.forEach(button => {
        if (button.parentNode) {
          button.parentNode.removeChild(button);
        }
      });
      
      // Generate a clean filename from the email subject
      const subject = emailData.subject || 'Email';
      const cleanSubject = subject.replace(/[^\w\s-]/g, '_').substring(0, 30);
      const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const filename = `${cleanSubject}_${timestamp}.pdf`;
      
      // Generate PDF with email-specific settings
      await this.generatePdf(clone, {
        filename,
        pageSize: 'a4',
        orientation: 'portrait',
        margin: [10, 10, 10, 10],
        scale: 2,
        enableLinks: true
      });
    } catch (error) {
      console.error('Error generating email PDF:', error);
      throw error;
    }
  }
}

export default PdfUtils;
