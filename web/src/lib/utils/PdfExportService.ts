/**
 * PDFExportService.js
 * 
 * A utility service for exporting HTML content as PDF with customizable options
 */

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

class PDFExportService {
  /**
   * Export an HTML element to PDF
   * 
   * @param {HTMLElement} element - The DOM element to export
   * @param {Object} options - Configuration options
   * @param {string} options.filename - The name of the PDF file (without extension)
   * @param {number} options.scale - Scale factor for rendering (higher = better quality but larger file)
   * @param {boolean} options.preserveStyles - Whether to preserve the element's existing styles
   * @param {Object} options.pageSettings - PDF page settings
   * @param {Function} options.onProgress - Callback for progress updates
   * @returns {Promise<Blob>} - A promise that resolves to the PDF blob
   */
  static async exportElementToPDF(element: HTMLElement, options: {
    filename?: string;
    scale?: number;
    preserveStyles?: boolean;
    pageSettings?: {
      orientation: 'p' | 'portrait' | 'landscape' | 'l';
      unit: 'mm' | 'pt' | 'px' | 'in' | 'cm' | 'ex' | 'em' | 'pc';
      format: string | number[];
      width?: number;
    };
    onProgress?: (progress: number, message: string) => void;
  } = {}) {
    const {
      filename = 'document',
      scale = 2,
      preserveStyles = false,
      pageSettings = { orientation: 'portrait', unit: 'mm', format: 'a4' },
      onProgress = () => {}
    } = options;

    if (!element) {
      throw new Error('Element is required for PDF export');
    }

    let originalStyles = {};
    
    // If not preserving styles, store original styles to restore later
    if (!preserveStyles) {
      originalStyles = {
        overflow: element.style.overflow,
        maxHeight: element.style.maxHeight,
        height: element.style.height,
        background: element.style.background,
        boxShadow: element.style.boxShadow,
        margin: element.style.margin,
        padding: element.style.padding
      };
      
      // Apply optimal styles for PDF capture
      element.style.overflow = 'visible';
      element.style.maxHeight = 'none';
      element.style.height = 'auto';
      element.style.background = '#ffffff';
      element.style.boxShadow = 'none';
    }

    onProgress(0.2, 'Preparing content...');
    
    try {
      // Capture content as canvas
      const canvas = await html2canvas(element, {
        scale: scale,
        useCORS: true,
        allowTaint: true,
        logging: false,
        onclone: (clonedDoc) => {
          // Apply modifications to the cloned document
          const clonedElement = clonedDoc.querySelector('#' + element.id) as HTMLElement;
          if (clonedElement) {
            clonedElement.style.overflow = 'visible';
            clonedElement.style.maxHeight = 'none';
            
            // Remove any "Download" buttons from the PDF
            const downloadButtons = clonedElement.querySelectorAll('.download-btn-container');
            downloadButtons.forEach(btn => {
              if (btn.parentNode) {
                (btn as HTMLElement).style.display = 'none';
              }
            });
          }
        }
      });
      
      onProgress(0.6, 'Creating PDF...');
      
      // Calculate dimensions maintaining aspect ratio
      const imgWidth = pageSettings.format === 'a4' ? 210 : (pageSettings.width ?? 210); // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Determine if we need to switch to landscape based on content
      const contentRatio = canvas.width / canvas.height;
      const isLandscape = contentRatio > 1 && imgHeight > 297; // 297mm = A4 height
      
      // Create PDF with appropriate orientation
      const finalOrientation = isLandscape ? 'landscape' : pageSettings.orientation;
      const pdf = new jsPDF({
        orientation: finalOrientation,
        unit: pageSettings.unit,
        format: pageSettings.format
      });
      
      // Convert canvas to image data
      const imgData = canvas.toDataURL('image/png');
      
      // Add image to PDF (adjust dimensions for landscape if needed)
      if (isLandscape) {
        const landscapeImgWidth = Math.min(297, (canvas.width * 297) / canvas.height);
        const landscapeImgHeight = (canvas.height * landscapeImgWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, landscapeImgWidth, landscapeImgHeight);
      } else {
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      }
      
      onProgress(0.9, 'Finalizing...');
      
      // Generate PDF blob
      const pdfBlob = pdf.output('blob');
      
      // Trigger download
      const downloadFilename = `${filename.replace(/[^\w\s-]/g, '_')}.pdf`;
      pdf.save(downloadFilename);
      
      return pdfBlob;
    } finally {
      // Restore original styles if we modified them
      if (!preserveStyles) {
        Object.entries(originalStyles).forEach(([key, value]) => {
          if (key !== 'length' && key !== 'parentRule') {
            (element.style as any)[key] = value || '';
          }
        });
      }
      
      onProgress(1.0, 'Completed!');
    }
  }
  
  /**
   * Export email content to PDF with email-specific optimizations
   * 
   * @param {HTMLElement} emailContainer - Container with email content
   * @param {Object} emailData - Email metadata for filename
   * @param {Function} onComplete - Callback when export is complete
   * @param {Function} onError - Callback if an error occurs
   * @param {Function} onProgress - Progress callback
   */
  static async exportEmailToPDF(
    emailContainer: HTMLElement,
    emailData: { subject?: string; from?: string },
    onComplete: (blob: Blob, filename: string) => void,
    onError: (error: Error) => void,
    onProgress = () => {}
  ) {
    try {
      // Generate filename from subject
      const subject = emailData?.subject || 'Email';
      const sender = emailData?.from?.replace(/@.*$/, '') || 'sender';
      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = `${subject.substring(0, 30)}_from_${sender}_${timestamp}`;
      
      // Export with email-specific settings
      const pdfBlob = await this.exportElementToPDF(emailContainer, {
        filename,
        scale: 2,
        preserveStyles: false,
        pageSettings: {
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        },
        onProgress
      });
      
      if (onComplete) {
        onComplete(pdfBlob, filename);
      }
      
      return pdfBlob;
    } catch (error) {
      console.error('Error exporting email to PDF:', error);
      if (onError) {
        onError(error as Error);
      }
      throw error;
    }
  }
}

export default PDFExportService;
