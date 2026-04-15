import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Label } from './components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Badge } from './components/ui/badge';
import { Textarea } from './components/ui/textarea';
import { Toaster } from './components/ui/sonner';
import { Upload, FileText, CheckSquare, Download, Sparkles, History, Loader2, Settings, User, LogIn, Brain } from 'lucide-react';
import { FileUpload } from './components/FileUpload';
import { OutputSelector } from './components/OutputSelector';
import { ResultsDisplay } from './components/ResultsDisplay';
import { HistoryPanel } from './components/HistoryPanel';
import { SettingsPanel } from './components/SettingsPanel';
import { AuthModal } from './components/AuthModal';
import { UserProfile } from './components/UserProfile';
import { ContextManager } from './components/ContextManager';
import { useAppLogic } from './utils/use-app-logic';
import { config } from './utils/config';
import { toast } from 'sonner';

export default function App() {
  const {
    user,
    activeTab,
    setActiveTab,
    uploadedFile,
    textInput,
    setTextInput,
    outputType,
    selectedRoles,
    setSelectedRoles,
    results,
    setResults,
    isProcessing,
    history,
    showSettings,
    setShowSettings,
    showAuthModal,
    setShowAuthModal,
    showUserProfile,
    setShowUserProfile,
    showContextManager,
    setShowContextManager,
    currentProjectId,
    setCurrentProjectId,
    currentProjectName,
    setCurrentProjectName,
    handleOutputTypeChange,
    handleFileUpload,
    uploadDocument,
    loadHistory,
    loadHistoryItem,
  } = useAppLogic();

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4 relative">
              <Sparkles className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Q.AI Generator</h1>
              
              {/* Control buttons */}
              <div className="absolute right-0 top-0 flex items-center gap-2">
                {/* Active project indicator */}
                {currentProjectId && currentProjectName && (
                  <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                     Project: {currentProjectName}
                  </Badge>
                )}
                
                {/* Context manager button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowContextManager(true)}
                  className={`${currentProjectId ? 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200' : 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200'}`}
                >
                  <Brain className="h-4 w-4 mr-1" />
                  Context
                   (coming soon)
                </Button>
                
                {/* Settings button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSettings(true)}
                  className="bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
                >
                  <Settings className="h-4 w-4" />
                </Button>
                
                {/* Authentication buttons */}
                {user ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowUserProfile(true)}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    <User className="h-4 w-4 mr-1" />
                    {user.email?.split('@')[0]}
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAuthModal(true)}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    <LogIn className="h-4 w-4 mr-1" />
                    Sign In
                  </Button>
                )}
              </div>
            </div>
            <p className="text-xl text-gray-600">
            AI platform for generating test cases, checklists and documentation from requirements
            </p>
            <div className="flex items-center justify-center gap-4 mt-4 flex-wrap">
              <Badge variant="secondary" className="text-sm bg-gray-100 text-gray-700 border-gray-200">
                <FileText className="w-4 h-4 mr-1" />
                PDF, DOCX, TXT Support
              </Badge>
              <Badge variant="secondary" className="text-sm bg-gray-100 text-gray-700 border-gray-200">
                <CheckSquare className="w-4 h-4 mr-1" />
                AI Requirements Analysis
              </Badge>
              <Badge variant="secondary" className="text-sm bg-gray-100 text-gray-700 border-gray-200">
                <Download className="w-4 h-4 mr-1" />
                Export Results
              </Badge>
              <Badge variant="secondary" className="text-sm bg-gray-100 text-gray-700 border-gray-200">
                <History className="w-4 h-4 mr-1" />
                Generation History
              </Badge>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                         <TabsList className="grid w-full grid-cols-4 bg-gradient-to-r from-gray-50 to-gray-100 p-1 rounded-lg shadow-sm">
               <TabsTrigger 
                 value="upload" 
                 className="flex items-center gap-2 bg-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=inactive]:bg-white data-[state=inactive]:text-gray-700 hover:bg-blue-50 transition-all duration-200 rounded-md"
               >
                 <Upload className="w-4 h-4" />
                 Upload Requirements
               </TabsTrigger>
               <TabsTrigger 
                 value="configure" 
                 disabled={!uploadedFile && !textInput.trim()} 
                 className="bg-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=inactive]:bg-white data-[state=inactive]:text-gray-700 hover:bg-green-50 transition-all duration-200 rounded-md disabled:opacity-50"
               >
                 <CheckSquare className="w-4 h-4 mr-2" />
                 Configure
               </TabsTrigger>
               <TabsTrigger 
                 value="results" 
                 disabled={!results} 
                 className="bg-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=inactive]:bg-white data-[state=inactive]:text-gray-700 hover:bg-purple-50 transition-all duration-200 rounded-md disabled:opacity-50"
               >
                 <FileText className="w-4 h-4 mr-2" />
                 Results {results && <span className="ml-1 text-xs bg-green-100 text-green-700 px-1 rounded">✓</span>}
               </TabsTrigger>
               <TabsTrigger 
                 value="history" 
                 className="bg-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=inactive]:bg-white data-[state=inactive]:text-gray-700 hover:bg-orange-50 transition-all duration-200 rounded-md"
               >
                 <History className="w-4 h-4 mr-2" />
                 History
               </TabsTrigger>
             </TabsList>

            <TabsContent value="upload" className="mt-6">
              <Card className="bg-white border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle>Upload Technical Requirements</CardTitle>
                  <CardDescription>
                    Upload requirements in PDF, DOCX, TXT format or paste text directly
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FileUpload onFileUpload={handleFileUpload} uploadedFile={uploadedFile} />
                  
                  <div className="mt-6">
                    <Label htmlFor="text-input">Or enter requirements text directly:</Label>
                    <Textarea
                      id="text-input"
                      placeholder="Paste technical requirements text here...&#10;&#10;Example: Need to create a user authorization system with login, registration and password recovery functions. The system should support email validation and password complexity requirements."
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      className="mt-2 min-h-[200px] bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500"
                    />
                  </div>

                                     <Button 
                     onClick={() => setActiveTab('configure')} 
                     className="mt-4 w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg"
                     disabled={!uploadedFile && !textInput.trim()}
                   >
                     Continue to Configuration
                   </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="configure" className="mt-6">
              <Card className="bg-white border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle>Generation Configuration</CardTitle>
                  <CardDescription>
                    Select output type and run AI analysis of technical requirements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <OutputSelector 
                    outputType={outputType} 
                    setOutputType={handleOutputTypeChange}
                    selectedRoles={selectedRoles}
                    setSelectedRoles={setSelectedRoles}
                  />
                  
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-medium text-blue-900 mb-2">AI will analyze your requirements and create:</h3>

                    {outputType === 'documentation-analysis' ? (
                      <ul className="text-blue-800 text-sm space-y-1">
                        <li>• Structured requirements analysis</li>
                        <li>• Documentation quality assessment</li>
                        <li>• Identification of ambiguities and gaps</li>
                      </ul>
                    ) : 
                      outputType === 'testcases' ? (
                      <ul className="text-blue-800 text-sm space-y-1">
                        <li>• Structured test cases with unique IDs</li>
                        <li>• Detailed execution steps for each scenario</li>
                        <li>• Positive and negative test cases</li>
                        <li>• Prioritization by criticality</li>
                        <li>• Ready for import to TestRail, Jira, etc.</li>
                      </ul>
                    ) : (
                      <ul className="text-blue-800 text-sm space-y-1">
                        <li>• Structured checklist for quick testing</li>
                        <li>• Coverage of all key functions from requirements</li>
                        <li>• Interactive checkboxes for progress tracking</li>
                        <li>• Suitable for exploratory and ad-hoc testing</li>
                      </ul>
                    )}
                  </div>

                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-amber-800 text-sm">
                      <strong>💡 Tip:</strong> The more detailed your requirements, the more accurate the generated test cases will be. 
                      Specify functional requirements, user scenarios and system constraints.
                    </p>
                  </div>

                  {/* Current AI model indicator */}
                  <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Current AI model:</span>
                        <Badge variant="outline" className="font-medium">
                          {config.AI_MODELS[config.AI_MODEL].name}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowSettings(true)}
                        className="text-xs text-gray-500 hover:text-gray-700"
                      >
                        Change
                      </Button>
                    </div>
                  </div>

                                     <Button 
                     onClick={uploadDocument} 
                     className="mt-6 w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg"
                     disabled={isProcessing || (!uploadedFile && !textInput.trim())}
                   >
                     {isProcessing ? (
                       <>
                         <Loader2 className="animate-spin h-4 w-4 mr-2" />
                         Analyzing requirements and generating results...
                       </>
                     ) : (
                       <>
                         <Sparkles className="h-4 w-4 mr-2" />
                         Start AI Analysis
                       </>
                     )}
                   </Button>
                </CardContent>
              </Card>
            </TabsContent>

                         <TabsContent value="results" className="mt-6">
               {results && <ResultsDisplay 
                 results={results} 
                 onResultsUpdate={(updatedResults) => setResults(updatedResults)}
               />}
             </TabsContent>

                         <TabsContent value="history" className="mt-6">
               <Card className="bg-white border-gray-200 shadow-sm">
                 <CardHeader>
                   <CardTitle>Generation History</CardTitle>
                   <CardDescription>
                     {user ? 'Your previous requests and results' : 'History is only available to authorized users'}
                   </CardDescription>
                 </CardHeader>
                 <CardContent>
                   {user ? (
                     <HistoryPanel 
                       history={history} 
                       onLoadItem={loadHistoryItem}
                       onRefresh={loadHistory}
                     />
                   ) : (
                     <div className="text-center py-8">
                       <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                       <h3 className="text-lg font-medium text-gray-900 mb-2">History Unavailable</h3>
                       <p className="text-gray-600 mb-4">
                         To view generation history, you need to sign in to the system
                       </p>
                       <Button 
                         onClick={() => setShowAuthModal(true)}
                         className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg"
                       >
                         <LogIn className="w-4 h-4 mr-2" />
                         Sign In to System
                       </Button>
                     </div>
                   )}
                 </CardContent>
               </Card>
             </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {showSettings && (
        <SettingsPanel onClose={() => setShowSettings(false)} />
      )}
      
      {showAuthModal && (
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
        />
      )}
      
      {showUserProfile && (
        <UserProfile 
          isOpen={showUserProfile} 
          onClose={() => setShowUserProfile(false)} 
        />
      )}
      
      {showContextManager && (
        <ContextManager 
          isOpen={showContextManager}
          onClose={() => setShowContextManager(false)}
          currentProjectId={currentProjectId}
          onProjectInitialized={(projectId, projectName) => {
            setCurrentProjectId(projectId);
            setCurrentProjectName(projectName);
            localStorage.setItem('currentProjectId', projectId);
            localStorage.setItem('currentProjectName', projectName);
            // setUseEnhancedAI(true);
            toast.success('Context memory activated! Now AI will use previous experience.');
          }}
          onProjectReset={() => {
            setCurrentProjectId(null);
            setCurrentProjectName(null);
            localStorage.removeItem('currentProjectId');
            localStorage.removeItem('currentProjectName');
            // setUseEnhancedAI(false);
            toast.info('Project reset. You can create a new project.');
          }}
        />
      )}
      
      <Toaster />
    </>
  );
}