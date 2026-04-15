import React, { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Download, Copy, ExternalLink, ChevronDown, Sparkles, Settings } from 'lucide-react';
import { exportService } from '../utils/export-service';
import { sanitizeForJS } from '../utils/shared-utils';
import { toast } from 'sonner';
import { AIAnalysisResult, TestCase, ChecklistItem } from '../utils/ai-service';

interface ExportToolbarProps {
  results: AIAnalysisResult;
  onEnhance?: () => void;
  onJiraSettings?: () => void;
}

export function ExportToolbar({ results, onEnhance, onJiraSettings }: ExportToolbarProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [showTestOpsMenu, setShowTestOpsMenu] = useState(false);

  // Export to JSON
  const exportToJSON = async () => {
    setIsExporting(true);
    try {
      await exportService.exportToJSON(results);
      toast.success('Exported to JSON');
    } catch (error) {
      console.error('JSON export error:', error);
      toast.error('Failed to export to JSON');
    } finally {
      setIsExporting(false);
    }
  };

  // Export to Excel
  const exportToExcel = async () => {
    setIsExporting(true);
    try {
      await exportService.exportToExcel(results);
      toast.success('Exported to Excel');
    } catch (error) {
      console.error('Excel export error:', error);
      toast.error('Failed to export to Excel');
    } finally {
      setIsExporting(false);
    }
  };

  // Export to CSV
  const exportToCSV = async () => {
    setIsExporting(true);
    try {
      await exportService.exportToCSV(results);
      toast.success('Exported to CSV');
    } catch (error) {
      console.error('CSV export error:', error);
      toast.error('Failed to export to CSV');
    } finally {
      setIsExporting(false);
    }
  };

  // Export to TestOps
  const exportToTestOps = async () => {
    setIsExporting(true);
    try {
      await exportService.exportToTestOps(results);
      toast.success('Exported to Test-OPS');
    } catch (error) {
      console.error('TestOps export error:', error);
      toast.error('Failed to export to Test-OPS');
    } finally {
      setIsExporting(false);
    }
  };

  // Export to TestRail
  const exportToTestRail = async () => {
    setIsExporting(true);
    try {
      await exportService.exportToTestRail(results);
      toast.success('Exported to Test-Rail');
    } catch (error) {
      console.error('TestRail export error:', error);
      toast.error('Failed to export to Test-Rail');
    } finally {
      setIsExporting(false);
    }
  };

  // Export to PDF (disabled)
  const exportToPDF = async () => {
    toast.info('PDF export coming soon');
  };

  // Export to Google Sheets (disabled)
  const exportToGoogleSheets = async () => {
    toast.info('Google Sheets export coming soon');
  };

  // Copy to clipboard
  const copyToClipboard = () => {
    const data = results.data;
    let text = '';

    if (results.type === 'testcases' && Array.isArray(data)) {
      text = (data as TestCase[]).map(tc =>
        `TC-${tc.id}: ${tc.title}\nSteps: ${tc.steps.join(', ')}\nExpected: ${tc.expected}`
      ).join('\n\n');
    } else if (results.type === 'checklist' && Array.isArray(data)) {
      text = (data as ChecklistItem[]).map(item =>
        `[ ] ${item.item}`
      ).join('\n');
    } else {
      text = JSON.stringify(data, null, 2);
    }

    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  // Open Jira with prefilled issue
  const openJiraWithIssue = (item: ChecklistItem) => {
    const savedConfig = localStorage.getItem('jiraConfig');
    const config = savedConfig ? JSON.parse(savedConfig) : {
      baseUrl: 'https://jira.example.com',
      projectId: '10000',
      issueTypeId: '10001',
      priorityId: '3',
      components: 'QA',
      labels: 'qa,checklist',
    };

    const formData = {
      summary: `[QA] ${item.item.substring(0, 100)}${item.item.length > 100 ? '...' : ''}`,
      description: `**Problem Description:**\n${item.item}\n\n**Context:**\nChecklist item #${item.id}`,
      priority: config.priorityId,
      components: config.components,
      labels: config.labels,
    };

    const params = new URLSearchParams({
      pid: config.projectId,
      issuetype: config.issueTypeId,
    });

    const bookmarkletData = encodeURIComponent(JSON.stringify(formData));
    const jiraUrl = `${config.baseUrl}/secure/CreateIssue.jspa?${params.toString()}&bookmarkletData=${bookmarkletData}`;

    // Safe JS code generation using sanitization
    const jsCode = `
      (function() {
        function fillJiraForm() {
          try {
            const summaryField = document.getElementById('summary') || document.querySelector('input[name="summary"]');
            if (summaryField) {
              summaryField.value = '${sanitizeForJS(formData.summary)}';
              summaryField.dispatchEvent(new Event('input', { bubbles: true }));
            }
            
            const descField = document.querySelector('textarea[name="description"]');
            if (descField) {
              descField.value = '${sanitizeForJS(formData.description)}';
              descField.dispatchEvent(new Event('input', { bubbles: true }));
            }
            
            console.log('Jira form filled successfully');
          } catch (e) {
            console.error('Error filling Jira form:', e);
          }
        }
        
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', fillJiraForm);
        } else {
          fillJiraForm();
        }
      })();
    `;

    const bookmarklet = `javascript:${encodeURIComponent(jsCode)}`;
    navigator.clipboard.writeText(bookmarklet);
    window.open(jiraUrl, '_blank');
    toast.success('Jira bookmarklet copied! Open Jira and paste in console (F12)');
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={copyToClipboard}
        className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:border-blue-300 transition-colors"
      >
        <Copy className="h-4 w-4 mr-1" />
        Copy
      </Button>

      {/* Export dropdown menu */}
      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowTestOpsMenu(!showTestOpsMenu)}
          className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:border-green-300 transition-colors flex items-center gap-1"
        >
          <Download className="h-4 w-4" />
          CSV
          <ChevronDown className={`h-3 w-3 transition-transform ${showTestOpsMenu ? 'rotate-180' : ''}`} />
        </Button>

        {showTestOpsMenu && (
          <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
            <button
              onClick={() => {
                exportToCSV();
                setShowTestOpsMenu(false);
              }}
              disabled={isExporting}
              className="w-full px-3 py-2 text-left text-sm hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed border-b border-gray-100"
            >
              <Download className="h-4 w-4 inline mr-2" />
              CSV
            </button>
            <button
              onClick={() => {
                exportToTestOps();
                setShowTestOpsMenu(false);
              }}
              disabled={isExporting}
              className="w-full px-3 py-2 text-left text-sm hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed border-b border-gray-100"
            >
              <Download className="h-4 w-4 inline mr-2" />
              Test-OPS
            </button>
            <button
              onClick={() => {
                exportToTestRail();
                setShowTestOpsMenu(false);
              }}
              disabled={isExporting}
              className="w-full px-3 py-2 text-left text-sm hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="h-4 w-4 inline mr-2" />
              Test-Rail
            </button>
          </div>
        )}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={exportToJSON}
        disabled={isExporting}
        className="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 hover:border-purple-300 transition-colors"
      >
        <Download className="h-4 w-4 mr-1" />
        JSON
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={exportToExcel}
        disabled={isExporting}
        className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 transition-colors"
      >
        <Download className="h-4 w-4 mr-1" />
        Excel
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={exportToPDF}
        disabled={true}
        className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:border-red-300 transition-colors opacity-50"
      >
        <Download className="h-4 w-4 mr-1" />
        PDF
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={exportToGoogleSheets}
        disabled={true}
        className="bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100 hover:border-orange-300 transition-colors opacity-50"
      >
        <ExternalLink className="h-4 w-4 mr-1" />
        Sheets
      </Button>

      {results.type === 'testcases' && onEnhance && (
        <Button
          variant="outline"
          size="sm"
          onClick={onEnhance}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <Sparkles className="h-4 w-4 mr-1" />
          Enhance
        </Button>
      )}

      {results.type === 'checklist' && onJiraSettings && (
        <Button
          variant="outline"
          size="sm"
          onClick={onJiraSettings}
          className="bg-gradient-to-r from-orange-500 to-red-600 text-white border-0 hover:from-orange-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <Settings className="h-4 w-4 mr-1" />
          Jira Settings
        </Button>
      )}
    </div>
  );
}
