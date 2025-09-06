import { config } from './config';

export interface FileContent {
  text: string;
  metadata: {
    filename: string;
    fileType: string;
    fileSize: number;
    pages?: number;
    extractedAt: string;
  };
}

class FileService {
  async extractTextFromFile(file: File): Promise<FileContent> {
    const fileType = this.getFileType(file);
    
    switch (fileType) {
      case 'pdf':
        return await this.extractFromPDF(file);
      case 'docx':
        return await this.extractFromDOCX(file);
      case 'txt':
        return await this.extractFromTXT(file);
      case 'json':
        return await this.extractFromJSON(file);
      default:
        throw new Error(`Unsupported file format: ${fileType}`);
    }
  }

  private getFileType(file: File): string {
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    if (file.type === 'application/pdf' || extension === 'pdf') {
      return 'pdf';
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || extension === 'docx') {
      return 'docx';
    } else if (file.type === 'text/plain' || extension === 'txt') {
      return 'txt';
    } else if (file.type === 'application/json' || extension === 'json') {
      return 'json';
    }
    
          throw new Error(`Unsupported file format: ${file.type}`);
  }

  private async extractFromPDF(file: File): Promise<FileContent> {
    try {
      // Use PDF.js to extract text
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let fullText = '';
      const pages = pdf.numPages;
      
      for (let pageNum = 1; pageNum <= pages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + '\n';
      }
      
      return {
        text: fullText.trim(),
        metadata: {
          filename: file.name,
          fileType: 'pdf',
          fileSize: file.size,
          pages: pages,
          extractedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('PDF extraction error:', error);
      throw new Error(`PDF text extraction error: ${error.message}`);
    }
  }

  private async extractFromDOCX(file: File): Promise<FileContent> {
    try {
      // Use mammoth.js to extract text from DOCX
      const mammoth = await import('mammoth');
      const arrayBuffer = await file.arrayBuffer();
      
      const result = await mammoth.extractRawText({ arrayBuffer });
      
      return {
        text: result.value,
        metadata: {
          filename: file.name,
          fileType: 'docx',
          fileSize: file.size,
          extractedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('DOCX extraction error:', error);
      throw new Error(`DOCX text extraction error: ${error.message}`);
    }
  }

  private async extractFromTXT(file: File): Promise<FileContent> {
    try {
      const text = await file.text();
      
      return {
        text: text,
        metadata: {
          filename: file.name,
          fileType: 'txt',
          fileSize: file.size,
          extractedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('TXT extraction error:', error);
      throw new Error(`Text file reading error: ${error.message}`);
    }
  }

  private async extractFromJSON(file: File): Promise<FileContent> {
    try {
      const text = await file.text();
      const jsonData = JSON.parse(text);
      
      // Convert JSON to readable text
      const readableText = this.jsonToReadableText(jsonData);
      
      return {
        text: readableText,
        metadata: {
          filename: file.name,
          fileType: 'json',
          fileSize: file.size,
          extractedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('JSON extraction error:', error);
      throw new Error(`JSON file processing error: ${error.message}`);
    }
  }

  private jsonToReadableText(jsonData: any, indent: number = 0): string {
    const spaces = '  '.repeat(indent);
    let result = '';
    
    if (typeof jsonData === 'object' && jsonData !== null) {
      if (Array.isArray(jsonData)) {
        result += 'List of items:\n';
        jsonData.forEach((item, index) => {
          result += `${spaces}${index + 1}. ${this.jsonToReadableText(item, indent + 1)}\n`;
        });
      } else {
        Object.entries(jsonData).forEach(([key, value]) => {
          if (typeof value === 'object' && value !== null) {
            result += `${spaces}${key}:\n${this.jsonToReadableText(value, indent + 1)}\n`;
          } else {
            result += `${spaces}${key}: ${value}\n`;
          }
        });
      }
    } else {
      result += String(jsonData);
    }
    
    return result;
  }

  validateFile(file: File): void {
    // Check file size
    if (file.size > config.MAX_FILE_SIZE) {
      throw new Error(`File too large. Maximum size: ${config.MAX_FILE_SIZE / (1024 * 1024)}MB`);
    }
    
    // Check file format
    const fileType = this.getFileType(file);
    if (!config.SUPPORTED_FORMATS.includes(fileType)) {
      throw new Error(`Unsupported file format. Supported formats: ${config.SUPPORTED_FORMATS.join(', ')}`);
    }
  }

  async extractFromURL(url: string): Promise<FileContent> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type');
      let fileType = 'txt';
      
      if (contentType?.includes('application/pdf')) {
        fileType = 'pdf';
      } else if (contentType?.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
        fileType = 'docx';
      } else if (contentType?.includes('application/json')) {
        fileType = 'json';
      }
      
      const blob = await response.blob();
      const file = new File([blob], 'url_content', { type: contentType || 'text/plain' });
      
      return await this.extractTextFromFile(file);
    } catch (error) {
      console.error('URL extraction error:', error);
      throw new Error(`Error loading content from URL: ${error.message}`);
    }
  }
}

export const fileService = new FileService();
