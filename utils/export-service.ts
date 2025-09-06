import { config } from './config';
import { TestCase, ChecklistItem, AIAnalysisResult } from './ai-service';

export interface ExportOptions {
  format: 'csv' | 'json' | 'excel' | 'testops' | 'testrail' | 'pdf' | 'google-sheets';
  filename?: string;
  includeMetadata?: boolean;
}

class ExportService {
  async exportToCSV(data: AIAnalysisResult, options: ExportOptions = { format: 'csv' }): Promise<Blob> {
    let csvContent = '';
    
    if (data.type === 'testcases') {
      csvContent = 'ID,Title,Description,Preconditions,Steps,Expected,Priority,Category\n';
      (data.data as TestCase[]).forEach(testCase => {
        const steps = testCase.steps.join('; ');
        const category = testCase.category || '';
        csvContent += `"${testCase.id}","${this.escapeCSV(testCase.title)}","${this.escapeCSV(testCase.description)}","${this.escapeCSV(testCase.preconditions)}","${this.escapeCSV(steps)}","${this.escapeCSV(testCase.expected)}","${testCase.priority}","${category}"\n`;
      });
    } else {
      csvContent = 'ID,Item,Checked,Category\n';
      (data.data as ChecklistItem[]).forEach(item => {
        const category = item.category || '';
        csvContent += `"${item.id}","${this.escapeCSV(item.item)}","${item.checked}","${category}"\n`;
      });
    }
    
    if (options.includeMetadata && data.metadata) {
      csvContent += '\nMetadata\n';
      csvContent += `Total Requirements,${data.metadata.totalRequirements}\n`;
      csvContent += `Functional Requirements,${data.metadata.functionalRequirements}\n`;
      csvContent += `Non-Functional Requirements,${data.metadata.nonFunctionalRequirements}\n`;
      csvContent += `Estimated Test Time,${data.metadata.estimatedTestTime}\n`;
    }
    
    return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  }

  async exportToJSON(data: AIAnalysisResult, options: ExportOptions = { format: 'json' }): Promise<Blob> {
    const exportData = {
      ...data,
      exportedAt: new Date().toISOString(),
      exportFormat: 'json'
    };
    
    const jsonContent = JSON.stringify(exportData, null, 2);
    return new Blob([jsonContent], { type: 'application/json' });
  }

  async exportToExcel(data: AIAnalysisResult, options: ExportOptions = { format: 'excel' }): Promise<Blob> {
    // Use SheetJS to create Excel files
    const XLSX = await import('xlsx');
    
    const workbook = XLSX.utils.book_new();
    
    if (data.type === 'testcases') {
      const testCases = (data.data as TestCase[]).map(tc => ({
        ID: tc.id,
        Title: tc.title,
        Description: tc.description,
        Preconditions: tc.preconditions,
        Steps: tc.steps.join('\n'),
        Expected: tc.expected,
        Priority: tc.priority,
        Category: tc.category || ''
      }));
      
      const worksheet = XLSX.utils.json_to_sheet(testCases);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Test Cases');
    } else {
      const checklist = (data.data as ChecklistItem[]).map(item => ({
        ID: item.id,
        Item: item.item,
        Checked: item.checked ? 'Yes' : 'No',
        Category: item.category || ''
      }));
      
      const worksheet = XLSX.utils.json_to_sheet(checklist);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Checklist');
    }
    
          // Add metadata to separate sheet
    if (data.metadata) {
      const metadata = [
        { Field: 'Total Requirements', Value: data.metadata.totalRequirements },
        { Field: 'Functional Requirements', Value: data.metadata.functionalRequirements },
        { Field: 'Non-Functional Requirements', Value: data.metadata.nonFunctionalRequirements },
        { Field: 'Estimated Test Time', Value: data.metadata.estimatedTestTime },
        { Field: 'Generated At', Value: new Date().toISOString() }
      ];
      
      const metadataSheet = XLSX.utils.json_to_sheet(metadata);
      XLSX.utils.book_append_sheet(workbook, metadataSheet, 'Metadata');
    }
    
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }

  async exportToTestOps(data: AIAnalysisResult, options: ExportOptions = { format: 'testops' }): Promise<Blob> {
    // Create CSV in Test-Ops format with ; separator
    let csvContent = '';
    
    // Headers in Test-Ops format
    const headers = [
      'allure_id', 'name', 'full_name', 'automated', 'description', 'precondition', 
      'expected_result', 'status', 'scenario', 'tag', 'link', 'example', 'parameter', 
      'Lead', 'Owner', 'Suite', 'Feature', 'Component', 'Block'
    ];
    
    csvContent = headers.join(';') + '\n';
    
    if (data.type === 'testcases') {
      // Create data in Test-Ops format
      (data.data as TestCase[]).forEach((tc, index) => {
                  // Generate allure_id based on index or use existing ID
        const allureId = parseInt(tc.id.replace(/\D/g, '')) || (10000 + index);
        
        const row = [
          allureId.toString(),
          this.escapeCSV(tc.title),
          this.escapeCSV(tc.title),
          'false',
          this.escapeCSV(tc.description),
          this.escapeCSV(tc.preconditions),
          this.escapeCSV(tc.expected),
          'Draft',
          this.escapeCSV(tc.steps.join('\n')),
          this.escapeCSV(tc.category || ''),
          '',
          '',
          '',
          'ambassadormedo',
          'ambassadormedo',
          this.escapeCSV(data.metadata?.modules?.[0] || 'Generated Test Suite'),
          this.escapeCSV(tc.category || 'Generated Feature'),
          this.escapeCSV(tc.module || 'Generated Component'),
          this.escapeCSV(data.metadata?.modules?.[0] || 'Generated Block')
        ];
        
        csvContent += row.join(';') + '\n';
      });
    } else {
      // For checklists create simplified format
      (data.data as ChecklistItem[]).forEach((item, index) => {
        const allureId = 10000 + index;
        
        const row = [
          allureId.toString(),
          this.escapeCSV(item.item),
          this.escapeCSV(item.item),
          'false',
          this.escapeCSV(item.item),
          '',
          'Item checked',
          'Draft',
          '',
          this.escapeCSV(item.category || ''),
          '',
          '',
          '',
          'ambassadormedo',
          'ambassadormedo',
          this.escapeCSV(data.metadata?.modules?.[0] || 'Generated Checklist'),
          this.escapeCSV(item.category || 'Generated Feature'),
          this.escapeCSV(item.module || 'Generated Component'),
          this.escapeCSV(data.metadata?.modules?.[0] || 'Generated Block')
        ];
        
        csvContent += row.join(';') + '\n';
      });
    }
    
    return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  }

  async exportToTestRail(data: AIAnalysisResult, options: ExportOptions = { format: 'testrail' }): Promise<Blob> {
    // Create CSV in TestRail format
    let csvContent = '';
    
    // Headers in TestRail format
    const headers = [
      'Title', 'Section', 'Automation Type', 'Estimate', 'Preconditions', 
      'Priority', 'Steps (Text)', 'Expected Result', 'Type'
    ];
    
    csvContent = headers.join(',') + '\n';
    
    if (data.type === 'testcases') {
      // Create data in TestRail format
      (data.data as TestCase[]).forEach((tc) => {
        // Determine test type based on priority
        const testType = tc.priority === 'High' ? 'Regression' : 
                        tc.priority === 'Medium' ? 'Functional' : 'Acceptance';
        
        // Determine execution time (estimate)
        const estimate = tc.priority === 'High' ? '30s' : 
                        tc.priority === 'Medium' ? '1m' : '2m';
        
        // Determine automation type
        const automationType = 'None'; // Default without automation
        
        const row = [
          this.escapeCSV(tc.title),
          this.escapeCSV(tc.category || 'Generated Section'),
          automationType,
          estimate,
          this.escapeCSV(tc.preconditions),
          tc.priority,
          this.escapeCSV(tc.steps.join('\n')),
          this.escapeCSV(tc.expected),
          testType
        ];
        
        csvContent += row.join(',') + '\n';
      });
    } else {
      // For checklists create simplified format
      (data.data as ChecklistItem[]).forEach((item) => {
        const row = [
          this.escapeCSV(item.item),
          this.escapeCSV(item.category || 'Generated Section'),
          'None',
          '30s',
          '',
          'Medium',
          this.escapeCSV(item.item),
          'Item checked',
          'Functional'
        ];
        
        csvContent += row.join(',') + '\n';
      });
    }
    
    return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  }

  async exportToGoogleSheets(data: AIAnalysisResult, options: ExportOptions = { format: 'google-sheets' }): Promise<string> {
    try {
      // Create Google Sheets via Google Sheets API
      const sheetsData = this.prepareSheetsData(data);
      
      const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.GOOGLE_SHEETS_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          properties: {
            title: options.filename || `QA.AI Export - ${new Date().toLocaleDateString()}`
          },
          sheets: sheetsData
        })
      });
      
      if (!response.ok) {
        throw new Error(`Google Sheets API error: ${response.status}`);
      }
      
      const result = await response.json();
      return result.spreadsheetUrl;
    } catch (error) {
      console.error('Google Sheets export error:', error);
      throw new Error(`Google Sheets export error: ${error.message}`);
    }
  }

  private prepareSheetsData(data: AIAnalysisResult): any[] {
    const sheets = [];
    
    if (data.type === 'testcases') {
      const testCases = (data.data as TestCase[]).map(tc => [
        tc.id,
        tc.title,
        tc.description,
        tc.preconditions,
        tc.steps.join('\n'),
        tc.expected,
        tc.priority,
        tc.category || ''
      ]);
      
      sheets.push({
        properties: { title: 'Test Cases' },
        data: [{
          rowData: [
            {
              values: [
                { userEnteredValue: { stringValue: 'ID' } },
                { userEnteredValue: { stringValue: 'Title' } },
                { userEnteredValue: { stringValue: 'Description' } },
                { userEnteredValue: { stringValue: 'Preconditions' } },
                { userEnteredValue: { stringValue: 'Steps' } },
                { userEnteredValue: { stringValue: 'Expected' } },
                { userEnteredValue: { stringValue: 'Priority' } },
                { userEnteredValue: { stringValue: 'Category' } }
              ]
            },
            ...testCases.map(row => ({
              values: row.map(cell => ({ userEnteredValue: { stringValue: cell } }))
            }))
          ]
        }]
      });
    } else {
      const checklist = (data.data as ChecklistItem[]).map(item => [
        item.id,
        item.item,
        item.checked ? 'Yes' : 'No',
        item.category || ''
      ]);
      
      sheets.push({
        properties: { title: 'Checklist' },
        data: [{
          rowData: [
            {
              values: [
                { userEnteredValue: { stringValue: 'ID' } },
                { userEnteredValue: { stringValue: 'Item' } },
                { userEnteredValue: { stringValue: 'Checked' } },
                { userEnteredValue: { stringValue: 'Category' } }
              ]
            },
            ...checklist.map(row => ({
              values: row.map(cell => ({ userEnteredValue: { stringValue: cell } }))
            }))
          ]
        }]
      });
    }
    
    return sheets;
  }

  async exportToPDF(data: AIAnalysisResult, options: ExportOptions = { format: 'pdf' }): Promise<Blob> {
    // Use jsPDF to create PDF
    const jsPDF = await import('jspdf');
    const doc = new jsPDF.default();
    
    let yPosition = 20;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    const lineHeight = 7;
    
    // Header
    doc.setFontSize(18);
    doc.text(data.type === 'testcases' ? 'Test Cases Report' : 'Checklist Report', margin, yPosition);
    yPosition += 15;
    
    doc.setFontSize(12);
    doc.text(`Generated: ${new Date().toLocaleString()}`, margin, yPosition);
    yPosition += 10;
    
    if (data.metadata) {
      doc.setFontSize(14);
      doc.text('Summary:', margin, yPosition);
      yPosition += 10;
      
      doc.setFontSize(10);
      doc.text(`Total Requirements: ${data.metadata.totalRequirements}`, margin, yPosition);
      yPosition += lineHeight;
      doc.text(`Functional Requirements: ${data.metadata.functionalRequirements}`, margin, yPosition);
      yPosition += lineHeight;
      doc.text(`Non-Functional Requirements: ${data.metadata.nonFunctionalRequirements}`, margin, yPosition);
      yPosition += lineHeight;
      doc.text(`Estimated Test Time: ${data.metadata.estimatedTestTime}`, margin, yPosition);
      yPosition += 15;
    }
    
    if (data.type === 'testcases') {
      (data.data as TestCase[]).forEach((testCase, index) => {
        // Check if new page is needed
        if (yPosition > pageHeight - 60) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text(`${testCase.id}: ${testCase.title}`, margin, yPosition);
        yPosition += lineHeight;
        
        doc.setFont(undefined, 'normal');
        doc.setFontSize(10);
        doc.text(`Priority: ${testCase.priority}`, margin, yPosition);
        yPosition += lineHeight;
        
        doc.text(`Description: ${testCase.description}`, margin, yPosition);
        yPosition += lineHeight;
        
        doc.text(`Preconditions: ${testCase.preconditions}`, margin, yPosition);
        yPosition += lineHeight;
        
        doc.text('Steps:', margin, yPosition);
        yPosition += lineHeight;
        testCase.steps.forEach((step, stepIndex) => {
          doc.text(`${stepIndex + 1}. ${step}`, margin + 5, yPosition);
          yPosition += lineHeight;
        });
        
        doc.text(`Expected: ${testCase.expected}`, margin, yPosition);
        yPosition += 10;
      });
    } else {
      (data.data as ChecklistItem[]).forEach((item) => {
        if (yPosition > pageHeight - 30) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.setFontSize(10);
        const checkbox = item.checked ? '☑' : '☐';
        doc.text(`${checkbox} ${item.item}`, margin, yPosition);
        yPosition += lineHeight;
      });
    }
    
    return doc.output('blob');
  }

  private escapeCSV(text: string): string {
    // Replace newlines with spaces and escape quotes for CSV
    return text.replace(/\n/g, ' ').replace(/\r/g, ' ').replace(/"/g, '""');
  }

  downloadFile(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export const exportService = new ExportService();
