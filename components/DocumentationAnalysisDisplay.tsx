import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ReasoningDisplay } from './ReasoningDisplay';
import { DocumentationAnalysis, DeveloperAnalysis } from '../utils/ai-service';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  FileText, 
  Users, 
  Shield, 
  Zap, 
  CheckCircle, 
  AlertTriangle, 
  Info,
  Clock,
  Target,
  Settings,
  UserCheck,
  BookOpen,
  Lightbulb,
  Code,
  GitBranch,
  LayoutGrid,
  Component,
  GitFork,
  Code2,
  ShieldCheck,
  Maximize2,
  Smile,
  Tag
} from 'lucide-react';
import { AIAnalysisResult } from '../utils/ai-service';

interface DocumentationAnalysisDisplayProps {
  analysisResult: AIAnalysisResult;
}

export function DocumentationAnalysisDisplay({ analysisResult }: DocumentationAnalysisDisplayProps) {
  const { type, data, metadata, reasoning } = analysisResult;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'Good': return 'bg-green-100 text-green-800';
      case 'Average': return 'bg-yellow-100 text-yellow-800';
      case 'Poor': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Performance': return <Zap className="h-4 w-4" />;
      case 'Security': return <Shield className="h-4 w-4" />;
      case 'Usability': return <UserCheck className="h-4 w-4" />;
      case 'Reliability': return <CheckCircle className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  // Rendering for documentation analysis
  if (type === 'documentation-analysis') {
    const { structuredRequirements } = data as DocumentationAnalysis;
    return (
      <div className="space-y-6">
        {/* Display reasoning if available */}
        {reasoning && (
          <ReasoningDisplay reasoning={reasoning} model={metadata?.aiModel || 'deepseek-reasoner'} />
        )}
        {/* Header and metadata */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-purple-600" />
              <CardTitle>Technical Requirements Analysis</CardTitle>
            </div>
            <CardDescription>
              Structured analysis of requirements and business rules
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Documentation Quality:</span>
                <Badge className={getQualityColor(metadata?.originalDocumentQuality || 'Average')}>
                  {metadata?.originalDocumentQuality || 'Average'}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Functional Requirements:</span>
                <Badge variant="outline">{structuredRequirements.functionalRequirements.length}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Non-Functional Requirements:</span>
                <Badge variant="outline">{structuredRequirements.nonFunctionalRequirements.length}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

      {/* Main content */}
      <Tabs defaultValue="functional" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="functional" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Functional
          </TabsTrigger>
          <TabsTrigger value="non-functional" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Non-Functional
          </TabsTrigger>
          <TabsTrigger value="business-rules" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Business Rules
          </TabsTrigger>
          <TabsTrigger value="scenarios" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            User scenarios
          </TabsTrigger>
        </TabsList>

        {/* Functional requirements */}
        <TabsContent value="functional" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Functional requirements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {structuredRequirements.functionalRequirements.map((req, index) => (
                <Card key={req.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-lg">{req.title}</h4>
                      <Badge className={getPriorityColor(req.priority)}>
                        {req.priority}
                      </Badge>
                    </div>
                    <p className="text-gray-600 mb-3">{req.description}</p>
                    {req.acceptanceCriteria.length > 0 && (
                      <div>
                        <h5 className="font-medium text-sm text-gray-700 mb-2">Acceptance criteria:</h5>
                        <ul className="space-y-1">
                          {req.acceptanceCriteria.map((criterion, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>{criterion}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Non-functional requirements */}
        <TabsContent value="non-functional" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-green-600" />
                Non-Functional requirements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {structuredRequirements.nonFunctionalRequirements.map((req) => (
                <Card key={req.id} className="border-l-4 border-l-green-500">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      {getCategoryIcon(req.category)}
                      <h4 className="font-medium text-lg">{req.category}</h4>
                    </div>
                    <p className="text-gray-600 mb-2">{req.description}</p>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <h5 className="font-medium text-sm text-gray-700 mb-1">Criteria:</h5>
                      <p className="text-sm">{req.criteria}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Business rules */}
        <TabsContent value="business-rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-orange-600" />
                Business Rules
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {structuredRequirements.businessRules.map((rule) => (
                <Card key={rule.id} className="border-l-4 border-l-orange-500">
                  <CardContent className="p-4">
                    <h4 className="font-medium text-lg mb-2">{rule.rule}</h4>
                    {rule.conditions && (
                      <div className="bg-orange-50 p-3 rounded-md">
                        <h5 className="font-medium text-sm text-orange-700 mb-1">Application conditions:</h5>
                        <p className="text-sm text-orange-600">{rule.conditions}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* User scenarios */}
        <TabsContent value="scenarios" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                User scenarios
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {structuredRequirements.userScenarios.map((scenario) => (
                <Card key={scenario.id} className="border-l-4 border-l-purple-500">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <UserCheck className="h-4 w-4 text-purple-600" />
                      <h4 className="font-medium text-lg">{scenario.actor}</h4>
                    </div>
                    <p className="text-gray-600 mb-3">{scenario.scenario}</p>
                    {scenario.steps.length > 0 && (
                      <div>
                        <h5 className="font-medium text-sm text-gray-700 mb-2">Steps:</h5>
                        <ol className="space-y-1">
                          {scenario.steps.map((step, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm">
                              <span className="bg-purple-100 text-purple-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                                {idx + 1}
                              </span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Metadata and analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-gray-600" />
              Documentation analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Assumptions */}
          {metadata.assumptions.length > 0 && (
            <div>
              <h4 className="font-medium text-sm text-gray-700 mb-2 flex items-center gap-2">
                <Info className="h-4 w-4" />
                Assumptions
              </h4>
              <ul className="space-y-1">
                {metadata.assumptions.map((assumption, idx) => (
                  <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>{assumption}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Contradictions */}
          {metadata.contradictions.length > 0 && (
            <div>
              <h4 className="font-medium text-sm text-gray-700 mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                Found contradictions
              </h4>
              <ul className="space-y-1">
                {metadata.contradictions.map((contradiction, idx) => (
                  <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <span>{contradiction}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Missing information */}
          {metadata.missingInformation.length > 0 && (
            <div>
              <h4 className="font-medium text-sm text-gray-700 mb-2 flex items-center gap-2">
                <Clock className="h-4 w-4 text-red-500" />
                Missing information
              </h4>
              <ul className="space-y-1">
                {metadata.missingInformation.map((info, idx) => (
                  <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>{info}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
  }

  // Rendering for developer analysis
  if (type === 'developer-analysis') {
    const { technicalRequirements, architectureRecommendations } = data as DeveloperAnalysis;
    return (
      <div className="space-y-6">
        {/* Display reasoning if available */}
        {reasoning && (
          <ReasoningDisplay reasoning={reasoning} model={metadata?.aiModel || 'deepseek-reasoner'} />
        )}
        {/* Header and metadata */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Code className="h-6 w-6 text-blue-600" />
              <CardTitle>Developer analysis</CardTitle>
            </div>
            <CardDescription>
              Technical requirements and architectural recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Functional Requirements:</span>
                <Badge variant="outline">{technicalRequirements.functionalRequirements.length}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Non-Functional Requirements:</span>
                <Badge variant="outline">{technicalRequirements.nonFunctionalRequirements.length}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Technical constraints:</span>
                <Badge variant="outline">{technicalRequirements.technicalConstraints.length}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main content */}
        <Tabs defaultValue="functional" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="functional" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Functional
            </TabsTrigger>
            <TabsTrigger value="non-functional" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Non-Functional
            </TabsTrigger>
            <TabsTrigger value="constraints" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Constraints
            </TabsTrigger>
            <TabsTrigger value="architecture" className="flex items-center gap-2">
              <GitBranch className="h-4 w-4" />
              Architecture
            </TabsTrigger>
          </TabsList>

          {/* Functional requirements */}
          <TabsContent value="functional" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Functional requirements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {technicalRequirements.functionalRequirements.map((req) => (
                  <Card key={req.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-lg">{req.title}</h4>
                        <div className="flex gap-2">
                          <Badge className={getPriorityColor(req.complexity)}>
                            {req.complexity}
                          </Badge>
                          <Badge variant="outline">{req.estimatedEffort}</Badge>
                        </div>
                      </div>
                      <p className="text-gray-600 mb-3">{req.description}</p>
                      <div className="space-y-2">
                        <div>
                          <h5 className="font-medium text-sm text-gray-700 mb-1">Implementation:</h5>
                          <p className="text-sm text-gray-600">{req.implementation}</p>
                        </div>
                        <div>
                          <h5 className="font-medium text-sm text-gray-700 mb-1">Components:</h5>
                          <div className="flex flex-wrap gap-1">
                            {req.components.map((component, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {component}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Non-functional requirements */}
          <TabsContent value="non-functional" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-green-600" />
                  Non-Functional requirements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {technicalRequirements.nonFunctionalRequirements.map((req) => (
                  <Card key={req.id} className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        {getCategoryIcon(req.category)}
                        <h4 className="font-medium text-lg">{req.category}</h4>
                      </div>
                      <p className="text-gray-600 mb-2">{req.description}</p>
                      <div className="space-y-2">
                        <div>
                          <h5 className="font-medium text-sm text-gray-700 mb-1">Implementation:</h5>
                          <p className="text-sm text-gray-600">{req.implementation}</p>
                        </div>
                        <div>
                          <h5 className="font-medium text-sm text-gray-700 mb-1">Constraints:</h5>
                          <ul className="space-y-1">
                            {req.constraints.map((constraint, idx) => (
                              <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                                <span className="text-orange-500 mt-1">•</span>
                                <span>{constraint}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Technical constraints */}
          <TabsContent value="constraints" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-orange-600" />
                  Technical constraints
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {technicalRequirements.technicalConstraints.map((constraint) => (
                  <Card key={constraint.id} className="border-l-4 border-l-orange-500">
                    <CardContent className="p-4">
                      <h4 className="font-medium text-lg mb-2">{constraint.constraint}</h4>
                      <div className="space-y-2">
                        <div>
                          <h5 className="font-medium text-sm text-gray-700 mb-1">Impact:</h5>
                          <p className="text-sm text-gray-600">{constraint.impact}</p>
                        </div>
                        <div>
                          <h5 className="font-medium text-sm text-gray-700 mb-1">Mitigation:</h5>
                          <p className="text-sm text-gray-600">{constraint.mitigation}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Architectural recommendations */}
          <TabsContent value="architecture" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GitBranch className="h-5 w-5 text-purple-600" />
                  Architectural recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium text-lg mb-3">System components</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {architectureRecommendations.components.map((component, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <Component className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">{component}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-lg mb-3">Architectural patterns</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {architectureRecommendations.patterns.map((pattern, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <LayoutGrid className="h-4 w-4 text-green-600" />
                        <span className="text-sm">{pattern}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-lg mb-3">Recommended technologies</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {architectureRecommendations.technologies.map((tech, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <Code2 className="h-4 w-4 text-purple-600" />
                        <span className="text-sm">{tech}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-lg mb-3">Potential risks</h4>
                  <div className="space-y-2">
                    {architectureRecommendations.risks.map((risk, idx) => (
                      <div key={idx} className="flex items-start gap-2 p-3 bg-red-50 rounded-lg">
                        <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                        <span className="text-sm">{risk}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Metadata */}
        {metadata && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-gray-600" />
                Metadata analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-2">Total development time:</h4>
                  <Badge variant="outline">{(metadata as any)?.estimatedDevelopmentTime}</Badge>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-2">Complexity level:</h4>
                  <Badge variant="outline">{(metadata as any)?.complexityLevel}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // For other types of analysis, show basic information
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
            <CardTitle>Analysis completed</CardTitle>
          <CardDescription>Analysis type: {type}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">Analysis data successfully received and processed.</p>
        </CardContent>
      </Card>
    </div>
  );
}
