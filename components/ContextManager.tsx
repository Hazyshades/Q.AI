import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Brain, 
  Settings, 
  BarChart3, 
  History, 
  Target, 
  Filter,
  Trash2,
  Save,
  RefreshCw,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { contextMemoryService } from '../utils/context-memory';
import { toast } from 'sonner';


interface ContextManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectInitialized?: (projectId: string, projectName: string) => void;
  onProjectReset?: () => void;
  currentProjectId?: string | null;
}

export function ContextManager({ isOpen, onClose, onProjectInitialized, onProjectReset, currentProjectId }: ContextManagerProps) {
  const [activeTab, setActiveTab] = useState('project');
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [isInitializing, setIsInitializing] = useState(false);
  
  // User preferences
  const [userPreferences, setUserPreferences] = useState({
    detailLevel: 'detailed' as 'basic' | 'detailed' | 'comprehensive',
    focusAreas: [] as string[],
    excludedModules: [] as string[],
    preferredFormat: 'table' as 'table' | 'cards' | 'detailed'
  });
  
  // Analytics
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  
  // History
  const [recentMemories, setRecentMemories] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadProjectInfo();
      loadAnalytics();
      loadHistory();
    }
  }, [isOpen]);

  const loadProjectInfo = async () => {
    try {
      const currentProjectId = localStorage.getItem('currentProjectId');
      
      // Simple check - if there is currentProjectId but no projectName, try to load directly
      if (currentProjectId && !projectName) {
        const projectKey = `project_context_${currentProjectId}`;
        const projectData = localStorage.getItem(projectKey);
        
        if (projectData) {
          try {
            const parsedProject = JSON.parse(projectData);
            if (parsedProject.name) {
              setProjectName(parsedProject.name);
              setProjectDescription(parsedProject.description || '');
              return;
            }
          } catch (e) {
            console.error('Error parsing direct project data:', e);
          }
        }
      }
      
      // Get current project information
      const projectContext = await contextMemoryService.getCurrentProjectContext();
      
      if (projectContext && projectContext.name) {
        setProjectName(projectContext.name);
        setProjectDescription(projectContext.description || '');
        if (projectContext.userPreferences) {
          setUserPreferences(projectContext.userPreferences);
        }
      } else {
        // If project not found, clear fields
        setProjectName('');
        setProjectDescription('');
      }
    } catch (error) {
      console.error('Error loading project info:', error);
      // In case of error, clear fields
      setProjectName('');
      setProjectDescription('');
    }
  };

  const initializeProject = async () => {
    if (!projectName.trim()) {
      toast.error('Enter project name');
      return;
    }

    setIsInitializing(true);
    try {
      const projectId = await contextMemoryService.initializeProject(projectName, projectDescription);
              toast.success(`Project "${projectName}" initialized with context memory`);
      
              // Update preferences for new project
      await contextMemoryService.updateUserPreferences(userPreferences);
      
              // Set current project in service
      contextMemoryService.setCurrentProject(projectId);
      
      if (onProjectInitialized) {
        onProjectInitialized(projectId, projectName);
      }
      
      // Reload data
      await loadProjectInfo();
      await loadAnalytics();
      await loadHistory();
      
      setActiveTab('analytics');
    } catch (error) {
      console.error('Error initializing project:', error);
              toast.error('Error initializing project');
    } finally {
      setIsInitializing(false);
    }
  };

  const loadAnalytics = async () => {
    setIsLoadingAnalytics(true);
    try {
      const data = await contextMemoryService.getProjectAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
      setAnalytics(null);
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  const loadHistory = async () => {
    setIsLoadingHistory(true);
    try {
      // Get latest memories from contextMemoryService
      const memories = await contextMemoryService.getRecentMemories(10);
      setRecentMemories(memories || []);
    } catch (error) {
      console.error('Error loading history:', error);
      setRecentMemories([]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const updatePreferences = async () => {
    try {
      await contextMemoryService.updateUserPreferences(userPreferences);
      toast.success('Preferences updated');
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast.error('Error updating preferences');
    }
  };

  const addFocusArea = () => {
    const area = prompt('Enter focus area:');
    if (area && !userPreferences.focusAreas.includes(area)) {
      setUserPreferences(prev => ({
        ...prev,
        focusAreas: [...prev.focusAreas, area]
      }));
    }
  };

  const removeFocusArea = (area: string) => {
    setUserPreferences(prev => ({
      ...prev,
      focusAreas: prev.focusAreas.filter(a => a !== area)
    }));
  };

  const addExcludedModule = () => {
    const module = prompt('Enter module to exclude:');
    if (module && !userPreferences.excludedModules.includes(module)) {
      setUserPreferences(prev => ({
        ...prev,
        excludedModules: [...prev.excludedModules, module]
      }));
    }
  };

  const removeExcludedModule = (module: string) => {
    setUserPreferences(prev => ({
      ...prev,
      excludedModules: prev.excludedModules.filter(m => m !== module)
    }));
  };

  const cleanupOldData = async () => {
    try {
      await contextMemoryService.cleanupOldData(30);
      toast.success('Old data cleared');
      await loadAnalytics();
      await loadHistory();
    } catch (error) {
      console.error('Error cleaning up data:', error);
      toast.error('Error clearing data');
    }
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'average': return 'bg-yellow-100 text-yellow-800';
      case 'poor': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getQualityIcon = (quality: string) => {
    switch (quality) {
      case 'excellent': return <CheckCircle className="h-4 w-4" />;
      case 'good': return <TrendingUp className="h-4 w-4" />;
      case 'average': return <Info className="h-4 w-4" />;
      case 'poor': return <AlertCircle className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <Brain className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold">Context Memory Management</h2>
          </div>
          <Button variant="ghost" onClick={onClose}>
            ✕
          </Button>
        </div>

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="project" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Project
              </TabsTrigger>
              <TabsTrigger value="preferences" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                History
              </TabsTrigger>
            </TabsList>

            <div className="p-6 overflow-y-auto h-full">
              <TabsContent value="project" className="space-y-6">
                {currentProjectId ? (
                  <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-green-600" />
                        Current Project
                      </CardTitle>
                      <CardDescription>
Active Project                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Project Name</Label>
                        <div className="text-lg font-semibold text-gray-900">{projectName}</div>
                      </div>
                      {projectDescription && (
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Project Description</Label>
                          <div className="text-gray-700">{projectDescription}</div>
                        </div>
                      )}
                                             <div className="flex gap-2">
                         <Badge variant="secondary" className="bg-green-100 text-green-700">
                            Active
                         </Badge>
                         <Badge variant="outline">
                          {projectName || 'Name not loaded'}
                         </Badge>
                       </div>
                       <div className="flex gap-2 mt-4">
                                                   <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setProjectName('');
                              setProjectDescription('');
                              contextMemoryService.clearCurrentProject();
                              if (onProjectReset) {
                                onProjectReset();
                              }
                              setActiveTab('project');
                            }}
                          >
                            <Target className="h-4 w-4 mr-2" />
                            Create New Project
                          </Button>
                       </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Project Initialization
                      </CardTitle>
                      <CardDescription>
                        Create a new project with context memory to improve the quality of test case and checklist generation
                      </CardDescription>
                    </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="projectName">Project Name *</Label>
                      <Input
                        id="projectName"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        placeholder="Enter project name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="projectDescription">Project Description</Label>
                      <Input
                        id="projectDescription"
                        value={projectDescription}
                        onChange={(e) => setProjectDescription(e.target.value)}
                        placeholder="Brief project description (optional)"
                      />
                    </div>
                    <Button 
                      onClick={initializeProject} 
                      disabled={isInitializing || !projectName.trim()}
                      className="w-full"
                    >
                      {isInitializing ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Initializing...
                        </>
                      ) : (
                        <>
                          <Brain className="h-4 w-4 mr-2" />
                                                      Initialize Project
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
                )}
              </TabsContent>

              <TabsContent value="preferences" className="space-y-6">
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      User Preferences
                    </CardTitle>
                    <CardDescription>
                      Configure parameters to personalize test case and checklist generation
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label htmlFor="detailLevel">Detail Level</Label>
                      <Select 
                        value={userPreferences.detailLevel} 
                        onValueChange={(value: any) => setUserPreferences(prev => ({ ...prev, detailLevel: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-gray-200 shadow-lg">
                          <SelectItem value="basic">Basic</SelectItem>
                          <SelectItem value="detailed">Detailed</SelectItem>
                          <SelectItem value="comprehensive">Comprehensive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Focus Areas</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {userPreferences.focusAreas.map(area => (
                          <Badge key={area} variant="secondary" className="flex items-center gap-1">
                            {area}
                            <button onClick={() => removeFocusArea(area)}>✕</button>
                          </Badge>
                        ))}
                      </div>
                      <Button variant="outline" size="sm" onClick={addFocusArea} className="mt-2">
                        + Add Area
                      </Button>
                    </div>

                    <div>
                      <Label>Excluded Modules</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {userPreferences.excludedModules.map(module => (
                          <Badge key={module} variant="destructive" className="flex items-center gap-1">
                            {module}
                            <button onClick={() => removeExcludedModule(module)}>✕</button>
                          </Badge>
                        ))}
                      </div>
                      <Button variant="outline" size="sm" onClick={addExcludedModule} className="mt-2">
                        + Add Module
                      </Button>
                    </div>

                    <div>
                      <Label htmlFor="preferredFormat">Preferred Format</Label>
                      <Select 
                        value={userPreferences.preferredFormat} 
                        onValueChange={(value: any) => setUserPreferences(prev => ({ ...prev, preferredFormat: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-gray-200 shadow-lg">
                          <SelectItem value="table">Table</SelectItem>
                          <SelectItem value="cards">Cards</SelectItem>
                          <SelectItem value="detailed">Detailed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button onClick={updatePreferences} className="w-full">
                      <Save className="h-4 w-4 mr-2" />
                      Save Preferences
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Project Analytics
                    </CardTitle>
                    <CardDescription>
                      Context memory usage statistics and result quality
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingAnalytics ? (
                      <div className="flex items-center justify-center py-8">
                        <RefreshCw className="h-6 w-6 animate-spin" />
                      </div>
                    ) : analytics ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <Users className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                          <div className="text-2xl font-bold">{analytics.totalSessions}</div>
                          <div className="text-sm text-gray-600">Sessions</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <CheckCircle className="h-8 w-8 mx-auto text-green-600 mb-2" />
                          <div className="text-2xl font-bold">{analytics.totalTestCases}</div>
                          <div className="text-sm text-gray-600">Test Cases</div>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                          <Filter className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                          <div className="text-2xl font-bold">{analytics.totalChecklists}</div>
                          <div className="text-sm text-gray-600">Checklists</div>
                        </div>
                        <div className="text-center p-4 bg-orange-50 rounded-lg">
                          <TrendingUp className="h-8 w-8 mx-auto text-orange-600 mb-2" />
                          <div className="text-2xl font-bold">{analytics.averageQuality.toFixed(1)}</div>
                          <div className="text-sm text-gray-600">Average Quality</div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No analytics data. Initialize project to start working.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <History className="h-5 w-5" />
                          Session History
                        </CardTitle>
                        <CardDescription>
                                                      Recent context memory operations
                        </CardDescription>
                      </div>
                      <Button variant="outline" size="sm" onClick={cleanupOldData}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear Old Data
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isLoadingHistory ? (
                      <div className="flex items-center justify-center py-8">
                        <RefreshCw className="h-6 w-6 animate-spin" />
                      </div>
                    ) : recentMemories.length > 0 ? (
                      <div className="space-y-4">
                        {recentMemories.map((memory) => (
                          <div key={memory.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-full ${getQualityColor(memory.metadata.quality)}`}>
                                {getQualityIcon(memory.metadata.quality)}
                              </div>
                              <div>
                                <div className="font-medium">{memory.content}</div>
                                <div className="text-sm text-gray-500">
                                  {memory.type === 'testcases' ? 'Test Cases' : 'Checklist'} • 
                                  {new Date(memory.timestamp).toLocaleString()}
                                </div>
                              </div>
                            </div>
                            <Badge variant="outline">
                              {memory.metadata.quality === 'excellent' ? 'Excellent' :
                               memory.metadata.quality === 'good' ? 'Good' :
                               memory.metadata.quality === 'average' ? 'Average' :
                               memory.metadata.quality === 'poor' ? 'Poor' : memory.metadata.quality}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No history data. Start working with the project.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
