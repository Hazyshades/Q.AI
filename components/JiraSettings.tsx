import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Settings, TestTube } from 'lucide-react';
import { toast } from 'sonner';

interface JiraSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

interface JiraConfig {
  baseUrl: string;
  projectKey: string;
  projectId: string;
  issueTypeId: string;
  priorityId: string;
  components: string;
  labels: string;
}

export function JiraSettings({ isOpen, onClose }: JiraSettingsProps) {
  // Load saved configuration on initialization
  const [config, setConfig] = useState<JiraConfig>(() => {
    const savedConfig = localStorage.getItem('jiraConfig');
    if (savedConfig) {
      return JSON.parse(savedConfig);
    }
    return {
      baseUrl: 'https://ddsm-jira.digdes.com',
      projectKey: 'DDM',
      projectId: '23000',
      issueTypeId: '10003', // Story
      priorityId: '3', // Medium
      components: 'QA',
      labels: 'qa,checklist,automated'
    };
  });

  const [isTesting, setIsTesting] = useState(false);

  const handleSave = () => {
    // Save configuration to localStorage
    localStorage.setItem('jiraConfig', JSON.stringify(config));
    toast.success('Jira settings saved');
    onClose();
  };

    const handleTest = async () => {
    setIsTesting(true);
         try {
       // Form URL with project and task type parameters
       const params = new URLSearchParams({
         pid: config.projectId,
         issuetype: config.issueTypeId
       });
       const testUrl = `${config.baseUrl}/secure/CreateIssue.jspa?${params.toString()}`;
       
       // Prepare data for filling
       const formData = {
         summary: '[QA Test] Test task from checklist',
         description: '**Test Task**\n\nThis is a test task to verify Jira integration.',
         priority: config.priorityId,
         components: config.components,
         labels: config.labels
       };

      // Create JavaScript code for automatic field filling
      const jsCode = `
        (function() {
          function fillForm() {
            try {
              // Fill Summary
              const summaryField = document.getElementById('summary') || document.querySelector('input[name="summary"]');
              if (summaryField) {
                summaryField.value = '${formData.summary.replace(/'/g, "\\'")}';
                summaryField.dispatchEvent(new Event('input', { bubbles: true }));
              }
              
              // Fill Description
              const descField = document.getElementById('description') || document.querySelector('textarea[name="description"]');
              if (descField) {
                descField.value = '${formData.description.replace(/'/g, "\\'").replace(/\n/g, '\\n')}';
                descField.dispatchEvent(new Event('input', { bubbles: true }));
              }
              
              // Fill Priority
              const priorityField = document.getElementById('priority') || document.querySelector('select[name="priority"]');
              if (priorityField) {
                priorityField.value = '${formData.priority}';
                priorityField.dispatchEvent(new Event('change', { bubbles: true }));
              }
              
              // Fill Components
              const componentsField = document.getElementById('components') || document.querySelector('input[name="components"]');
              if (componentsField) {
                componentsField.value = '${formData.components}';
                componentsField.dispatchEvent(new Event('input', { bubbles: true }));
              }
              
              // Fill Labels
              const labelsField = document.getElementById('labels') || document.querySelector('input[name="labels"]');
              if (labelsField) {
                labelsField.value = '${formData.labels}';
                labelsField.dispatchEvent(new Event('input', { bubbles: true }));
              }
              
              // Jira form filled successfully
            } catch (error) {
              console.error('Error filling Jira form:', error);
            }
          }
          
          fillForm();
          setTimeout(fillForm, 1000);
          setTimeout(fillForm, 2000);
        })();
      `;

      window.open(testUrl, '_blank');
      
      // Save data and show instructions
      localStorage.setItem('jiraFormData', JSON.stringify(formData));
      
      toast.success('Test task opened in Jira. Fields will be filled automatically.', {
        duration: 5000
      });
      
      setTimeout(() => {
        const bookmarkletCode = `javascript:(function(){${jsCode}})();`;
        // Bookmarklet code for Jira form filling
        toast.info('If fields were not filled automatically, use bookmarklet from browser console', {
          duration: 8000
        });
      }, 2000);
      
    } catch (error) {
      toast.error('Error opening test task');
    } finally {
      setIsTesting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white border-gray-200 shadow-xl">
        <CardHeader className="bg-white border-b border-gray-200">
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Jira Integration Settings
          </CardTitle>
          <CardDescription>
            Configure parameters for automatic task creation in Jira
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6 p-6">
          {/* Main settings */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="baseUrl">URL Jira</Label>
              <Input
                id="baseUrl"
                value={config.baseUrl}
                onChange={(e) => setConfig(prev => ({ ...prev, baseUrl: e.target.value }))}
                placeholder="https://your-jira-instance.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="projectKey">Project Key</Label>
                <Input
                  id="projectKey"
                  value={config.projectKey}
                  onChange={(e) => setConfig(prev => ({ ...prev, projectKey: e.target.value }))}
                  placeholder="PROJ"
                />
              </div>

              <div>
                <Label htmlFor="projectId">Project ID</Label>
                <Input
                  id="projectId"
                  value={config.projectId}
                  onChange={(e) => setConfig(prev => ({ ...prev, projectId: e.target.value }))}
                  placeholder="10000"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="issueTypeId">Issue Type</Label>
                <div className="relative">
                  <select
                    id="issueTypeId"
                    value={config.issueTypeId}
                    onChange={(e) => setConfig(prev => ({ ...prev, issueTypeId: e.target.value }))}
                    className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-input-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 selection:bg-blue-500 selection:text-white dark:selection:bg-blue-400 dark:selection:text-black"
                  >
                    <option value="10003">Bug</option>
                    <option value="10001">Task</option>
                    <option value="10003">Story</option>
                    <option value="10004">Epic</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="priorityId">Priority</Label>
                <div className="relative">
                  <select
                    id="priorityId"
                    value={config.priorityId}
                    onChange={(e) => setConfig(prev => ({ ...prev, priorityId: e.target.value }))}
                    className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-input-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 selection:bg-blue-500 selection:text-white dark:selection:bg-blue-400 dark:selection:text-black"
                  >
                    <option value="1">Highest</option>
                    <option value="2">High</option>
                    <option value="3">Medium</option>
                    <option value="4">Low</option>
                    <option value="5">Lowest</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="components">Components</Label>
                <Input
                  id="components"
                  value={config.components}
                  onChange={(e) => setConfig(prev => ({ ...prev, components: e.target.value }))}
                  placeholder="QA,Frontend,Backend"
                />
              </div>

              <div>
                <Label htmlFor="labels">Labels</Label>
                <Input
                  id="labels"
                  value={config.labels}
                  onChange={(e) => setConfig(prev => ({ ...prev, labels: e.target.value }))}
                  placeholder="qa,checklist,automated"
                />
              </div>
            </div>
          </div>

          {/* Information */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">How to find Project ID and Issue Type ID:</h4>
            <ol className="text-blue-800 text-sm space-y-1">
              <li>1. Open Jira and go to the project</li>
              <li>2. Create a new task and look at the URL</li>
              <li>3. The URL will contain something like: <code className="bg-blue-100 px-1 rounded">pid=10000&issuetype=10001</code></li>
              <li>4. Use these values in the settings above</li>
            </ol>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200 transition-colors"
            >
              Cancel
            </Button>
            
            <Button 
              onClick={handleTest}
              disabled={isTesting}
              className="bg-blue-500 text-white hover:bg-blue-600 transition-colors"
            >
              <TestTube className="h-4 w-4 mr-2" />
              {isTesting ? 'Testing...' : 'Test'}
            </Button>
            
            <Button 
              onClick={handleSave}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Save
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
