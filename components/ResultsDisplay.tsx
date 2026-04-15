import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Download, FileText, CheckSquare, Copy, Share2, Sparkles, ExternalLink, ChevronDown, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { TestCaseEnhancer } from './TestCaseEnhancer';
import { ResultsFilters } from './ResultsFilters';
import { JiraSettings } from './JiraSettings';
import { ExportToolbar } from './ExportToolbar';
import { DocumentationAnalysisDisplay } from './DocumentationAnalysisDisplay';
import { TestCase, ChecklistItem, AIAnalysisResult } from '../utils/ai-service';
import { getPriorityColor } from '../utils/shared-utils';

interface ResultsDisplayProps {
  results: AIAnalysisResult;
  onResultsUpdate?: (updatedResults: AIAnalysisResult) => void;
}

export function ResultsDisplay({ results, onResultsUpdate }: ResultsDisplayProps) {
  const [checkedItems, setCheckedItems] = useState<{ [key: number]: boolean }>({});
  const [failedItems, setFailedItems] = useState<{ [key: number]: boolean }>({});
  const [showEnhancer, setShowEnhancer] = useState(false);
  const [selectedChecklistItem, setSelectedChecklistItem] = useState<any>(null);
  const [showJiraSettings, setShowJiraSettings] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    module: 'all',
    priority: 'all',
    sortBy: 'id',
    sortOrder: 'asc' as 'asc' | 'desc'
  });

  // Check for results existence
  if (!results || !results.data) {
    return (
      <div className="flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <p className="text-gray-500">No data to display</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // For documentation analysis and role-based analysis data is not an array
  if (results.type !== 'documentation-analysis' && 
      results.type !== 'developer-analysis' && 
      results.type !== 'manager-analysis' && 
      results.type !== 'structuredTesting' && 
      !Array.isArray(results.data)) {
    return (
      <div className="flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <p className="text-gray-500">Invalid data format</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If this is documentation analysis or role-based analysis, display special component
  if (results.type === 'documentation-analysis' || 
      results.type === 'developer-analysis' || 
      results.type === 'manager-analysis' || 
      results.type === 'structuredTesting') {
    return <DocumentationAnalysisDisplay analysisResult={results} />;
  }

  const handleCheckboxChange = (id: number, checked: boolean) => {
    setCheckedItems(prev => ({ ...prev, [id]: checked }));
  };

  const handleChecklistItemClick = (item: any) => {
    setSelectedChecklistItem(selectedChecklistItem?.id === item.id ? null : item);
  };

  const handleChecklistAction = (action: 'pass' | 'fail', item: any) => {
    if (action === 'pass') {
      setCheckedItems(prev => ({ ...prev, [item.id]: true }));
      setFailedItems(prev => ({ ...prev, [item.id]: false }));
      toast.success('Item marked as passed');
    } else if (action === 'fail') {
      setFailedItems(prev => ({ ...prev, [item.id]: true }));
      setCheckedItems(prev => ({ ...prev, [item.id]: false }));
      toast.info('Jira integration - see Export toolbar');
    }
    setSelectedChecklistItem(null);
  };

  // Data filtering and sorting
  const filteredAndSortedData = useMemo(() => {
    let filtered = (results.data as any[]).filter((item: any) => {
      const matchesSearch = !filters.search || 
        item.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.item?.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.description?.toLowerCase().includes(filters.search.toLowerCase());
      
             const matchesCategory = !filters.category || filters.category === 'all' || item.category === filters.category;
       const matchesModule = !filters.module || filters.module === 'all' || item.module === filters.module;
       const matchesPriority = !filters.priority || filters.priority === 'all' || item.priority === filters.priority;

      return matchesSearch && matchesCategory && matchesModule && matchesPriority;
    });

    // Sorting
    filtered.sort((a: any, b: any) => {
      let aValue = a[filters.sortBy] || '';
      let bValue = b[filters.sortBy] || '';

      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();

      if (filters.sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [results.data, filters]);

  // Grouping by modules
  const groupedData = useMemo(() => {
    const groups: { [key: string]: any[] } = {};

    filteredAndSortedData.forEach((item: any) => {
      const module = item.module || 'No Module';
      if (!groups[module]) {
        groups[module] = [];
      }
      groups[module].push(item);
    });

    return groups;
  }, [filteredAndSortedData]);

  const handleEnhanceTestCases = (enhancedTestCases: TestCase[]) => {
          // Update results with enhanced test cases
    const updatedResults = {
      ...results,
      data: enhancedTestCases
    };
    
    // Call callback to update state in parent component
    if (onResultsUpdate) {
      onResultsUpdate(updatedResults);
    }
    
          toast.success('Test cases enhanced!');
  };

  const totalCount = (results.data as any[])?.length || 0;
  const completedCount = results.type === 'checklist'
    ? (results.data as ChecklistItem[]).filter(item => checkedItems[item.id] || item.checked).length
    : 0;
  const failedCount = results.type === 'checklist'
    ? (results.data as ChecklistItem[]).filter(item => failedItems[item.id]).length
    : 0;
  const pendingCount = totalCount - completedCount - failedCount;
  const completionPercentage = results.type === 'checklist'
    ? Math.round((completedCount / totalCount) * 100)
    : 0;

  const getBadgeVariant = (priority: string): "default" | "secondary" | "destructive" | "outline" => {
    return getPriorityColor(priority) as any;
  };

     return (
     <div className="space-y-6 relative">
                    {/* Filters */}
      <ResultsFilters 
        results={results} 
        filters={filters} 
        onFiltersChange={setFilters} 
      />

             <Card className="bg-white border-gray-200 shadow-sm relative z-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {results.type === 'testcases' ? (
                  <>
                    <FileText className="h-5 w-5" />
                    Generated Test Cases
                  </>
                ) : (
                  <>
                    <CheckSquare className="h-5 w-5" />
                    Testing Checklist
                  </>
                )}
              </CardTitle>
                             <CardDescription>
                 {results.type === 'testcases' 
                   ? `Created ${totalCount} test cases based on requirements analysis`
                   : `Created ${totalCount} checklist items (passed: ${completedCount}, failed: ${failedCount}, pending: ${pendingCount})`
                 }
               </CardDescription>
            </div>
            <ExportToolbar 
              results={results}
              onEnhance={() => setShowEnhancer(true)}
              onJiraSettings={() => setShowJiraSettings(true)}
            />
          </div>
          
                     {results.type === 'checklist' && (
             <div className="mt-4">
               <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                 <span>Execution Statistics</span>
                 <span>{completionPercentage}% completed</span>
               </div>
               <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                 <div 
                   className="bg-green-600 h-2 rounded-full transition-all duration-300"
                   style={{ width: `${(completedCount / totalCount) * 100}%` }}
                 ></div>
                 <div 
                   className="bg-red-600 h-2 rounded-full transition-all duration-300 -mt-2"
                   style={{ 
                     width: `${(failedCount / totalCount) * 100}%`,
                     marginLeft: `${(completedCount / totalCount) * 100}%`
                   }}
                 ></div>
               </div>
               <div className="flex items-center gap-4 text-xs">
                 <div className="flex items-center gap-1">
                   <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                   <span>Passed: {completedCount}</span>
                 </div>
                 <div className="flex items-center gap-1">
                   <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                   <span>Failed: {failedCount}</span>
                 </div>
                 <div className="flex items-center gap-1">
                   <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                   <span>Pending: {pendingCount}</span>
                 </div>
               </div>
             </div>
           )}
        </CardHeader>
      </Card>

      {results.type === 'testcases' ? (
                 <Tabs defaultValue="table" className="w-full">
           <TabsList className="bg-gradient-to-r from-gray-50 to-gray-100 p-1 rounded-lg shadow-sm">
             <TabsTrigger 
               value="table" 
               className="bg-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=inactive]:bg-white data-[state=inactive]:text-gray-700 hover:bg-blue-50 transition-all duration-200 rounded-md"
             >
               Table
             </TabsTrigger>
             <TabsTrigger 
               value="cards" 
               className="bg-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=inactive]:bg-white data-[state=inactive]:text-gray-700 hover:bg-green-50 transition-all duration-200 rounded-md"
             >
               Cards
             </TabsTrigger>
           </TabsList>
          
          <TabsContent value="table">
            <Card>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Module</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Expected Result</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAndSortedData.map((testCase: any) => (
                      <TableRow key={testCase.id}>
                        <TableCell className="font-mono w-20">{testCase.id}</TableCell>
                        <TableCell className="font-medium w-64">{testCase.title}</TableCell>
                        <TableCell className="w-80">{testCase.description}</TableCell>
                        <TableCell className="w-32">{testCase.module || '-'}</TableCell>
                        <TableCell className="w-32">
                          <Badge variant={getBadgeVariant(testCase.priority)}>
                            {testCase.priority}
                          </Badge>
                        </TableCell>
                        <TableCell className="w-80">{testCase.expected}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="cards">
            <div className="space-y-6">
              {Object.entries(groupedData).map(([module, testCases]) => (
                <div key={module}>
                  <h3 className="text-lg font-semibold mb-3 text-gray-800 border-b pb-2">
                    {module}
                  </h3>
                  <div className="grid gap-4">
                    {testCases.map((testCase: any) => (
                      <Card key={testCase.id}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg">{testCase.title}</CardTitle>
                              <CardDescription className="mt-1">{testCase.description}</CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={getBadgeVariant(testCase.priority)}>
                                {testCase.priority}
                              </Badge>
                              <code className="text-xs bg-gray-100 px-2 py-1 rounded">{testCase.id}</code>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div>
                              <h4 className="font-medium text-sm text-gray-700">Preconditions:</h4>
                              <p className="text-sm text-gray-600">{testCase.preconditions}</p>
                            </div>
                            
                            <div>
                              <h4 className="font-medium text-sm text-gray-700">Execution Steps:</h4>
                              <ol className="text-sm text-gray-600 list-decimal list-inside space-y-1">
                                {testCase.steps.map((step: any, index: number) => (
                                  <li key={index}>{step}</li>
                                ))}
                              </ol>
                            </div>
                            
                            <div>
                              <h4 className="font-medium text-sm text-gray-700">Expected Result:</h4>
                              <p className="text-sm text-gray-600">{testCase.expected}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-6">
              {Object.entries(groupedData).map(([module, items]) => (
                <div key={module}>
                  <h3 className="text-lg font-semibold mb-3 text-gray-800 border-b pb-2">
                    {module}
                  </h3>
                                     <div className="space-y-3">
                     {items.map((item: any) => (
                       <div key={item.id}>
                                                   <div 
                            className={`flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${
                              (checkedItems[item.id] || item.checked) 
                                ? 'bg-green-50 border border-green-200' 
                                : failedItems[item.id]
                                ? 'bg-red-50 border border-red-200'
                                : 'hover:bg-blue-50'
                            }`}
                            onClick={() => handleChecklistItemClick(item)}
                          >
                            <div className="flex-shrink-0 mt-0.5">
                              {(checkedItems[item.id] || item.checked) ? (
                                <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              ) : failedItems[item.id] ? (
                                <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              ) : (
                                <div className="w-4 h-4 border-2 border-gray-300 rounded-full hover:border-blue-500 transition-colors"></div>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className={`text-sm ${
                                (checkedItems[item.id] || item.checked) 
                                  ? 'line-through text-gray-500' 
                                  : failedItems[item.id]
                                  ? 'text-red-700'
                                  : 'text-gray-900'
                              }`}>
                                {item.item}
                              </div>
                              {!checkedItems[item.id] && !item.checked && !failedItems[item.id] && (
                                <div className="text-xs text-gray-500 mt-1">
                                  Click to select action
                                </div>
                              )}
                              {failedItems[item.id] && (
                                <div className="text-xs text-red-600 mt-1">
                                  Error - Jira task created
                                </div>
                              )}
                            </div>
                           <Badge variant="outline" className="text-xs flex-shrink-0">
                             #{item.id}
                           </Badge>
                         </div>
                         
                                                   {/* Action buttons shown directly under item */}
                          {selectedChecklistItem?.id === item.id && !checkedItems[item.id] && !item.checked && !failedItems[item.id] && (
                           <div className="mt-2 ml-7 space-y-2">
                             <div className="text-xs text-gray-600 mb-2">
                               <strong>Select action:</strong>
                             </div>
                             <div className="flex gap-2">
                               <Button 
                                 onClick={() => handleChecklistAction('pass', item)}
                                 size="sm"
                                 className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg"
                               >
                                 <CheckCircle className="h-3 w-3 mr-1" />
                                 Pass
                               </Button>
                               
                               <Button 
                                 onClick={() => handleChecklistAction('fail', item)}
                                 size="sm"
                                 className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0 hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg"
                               >
                                 <XCircle className="h-3 w-3 mr-1" />
                                 Error
                               </Button>
                               
                               <Button 
                                 variant="outline" 
                                 size="sm"
                                 onClick={() => setSelectedChecklistItem(null)}
                                 className="bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200 transition-colors"
                               >
                                 Cancel
                               </Button>
                             </div>
                           </div>
                         )}
                       </div>
                     ))}
                   </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

             {/* Test Case Enhancer Modal */}
       {showEnhancer && results.type === 'testcases' && (
         <TestCaseEnhancer
           testCases={results.data as TestCase[]}
           onEnhanced={handleEnhanceTestCases}
           onClose={() => setShowEnhancer(false)}
         />
       )}



       {/* Jira Settings Modal */}
       {showJiraSettings && (
         <JiraSettings 
           isOpen={showJiraSettings} 
           onClose={() => setShowJiraSettings(false)} 
         />
       )}
     </div>
   );
 }
