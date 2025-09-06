import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Loader2, Sparkles, MessageSquare, CheckCircle } from 'lucide-react';
import { TestCase, aiService } from '../utils/ai-service';
import { toast } from 'sonner';

interface TestCaseEnhancerProps {
  testCases: TestCase[];
  onEnhanced: (enhancedTestCases: TestCase[]) => void;
  onClose: () => void;
}

export function TestCaseEnhancer({ testCases, onEnhanced, onClose }: TestCaseEnhancerProps) {
  const [feedback, setFeedback] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancedTestCases, setEnhancedTestCases] = useState<TestCase[] | null>(null);

  // Handle Escape key and block scrolling
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    // Block page scrolling
    document.body.style.overflow = 'hidden';

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
      // Restore scrolling
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  const handleEnhance = async () => {
    if (!feedback.trim()) {
      toast.error('Please enter feedback to improve test cases');
      return;
    }

    setIsEnhancing(true);
    
    try {
      // Use AI service to enhance test cases
      const enhancedTestCases = await aiService.enhanceTestCases(testCases, feedback);
      setEnhancedTestCases(enhancedTestCases);
      toast.success('Test cases successfully enhanced!');
      
    } catch (error) {
      console.error('Enhancement error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Enhancement error: ${errorMessage}`);
    } finally {
      setIsEnhancing(false);
    }
  };

  const applyEnhancement = () => {
    if (enhancedTestCases) {
      onEnhanced(enhancedTestCases);
      onClose();
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'secondary';
      case 'medium':
        return 'default';
      case 'low':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]" onClick={onClose}>
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white border-gray-200 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <CardHeader className="bg-white border-b border-gray-200">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI-Powered Test Case Enhancement
          </CardTitle>
          <CardDescription>
            Provide feedback to improve existing test cases
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6 bg-white">
          {/* Current test cases */}
          <div>
            <Label className="text-base font-medium mb-3 block">
              Current Test Cases ({testCases.length})
            </Label>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {testCases.map((testCase, index) => (
                <Card key={index} className="p-3 bg-white border-gray-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{testCase.id}</span>
                        <Badge variant={getPriorityColor(testCase.priority)} className="text-xs">
                          {testCase.priority}
                        </Badge>
                        {testCase.category && (
                          <Badge variant="outline" className="text-xs">
                            {testCase.category}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{testCase.title}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Feedback form */}
          <div>
            <Label htmlFor="feedback" className="text-base font-medium mb-2 block">
              Enhancement Feedback
            </Label>
            <Textarea
              id="feedback"
              placeholder="Describe what needs to be improved in test cases. For example:&#10;- Add more negative scenarios&#10;- Improve step descriptions&#10;- Add boundary value checks&#10;- Change priorities&#10;- Add new categories"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="min-h-[120px]"
            />
            <p className="text-sm text-gray-500 mt-2">
              The more detailed your feedback, the better AI can improve the test cases.
            </p>
          </div>

          {/* Enhanced test cases */}
          {enhancedTestCases && (
            <div>
              <Label className="text-base font-medium mb-3 block flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Enhanced Test Cases ({enhancedTestCases.length})
              </Label>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {enhancedTestCases.map((testCase, index) => (
                  <Card key={index} className="p-3 border-green-200 bg-green-50 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{testCase.id}</span>
                          <Badge variant={getPriorityColor(testCase.priority)} className="text-xs">
                            {testCase.priority}
                          </Badge>
                          {testCase.category && (
                            <Badge variant="outline" className="text-xs">
                              {testCase.category}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{testCase.title}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {testCase.description.substring(0, 100)}...
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

                     {/* Action buttons */}
           <div className="flex items-center justify-end gap-3 pt-4 border-t bg-white">
             <Button 
               variant="outline" 
               onClick={onClose} 
               className="bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200 transition-colors"
             >
               Cancel
             </Button>
             
             {!enhancedTestCases ? (
               <Button 
                 onClick={handleEnhance} 
                 disabled={isEnhancing || !feedback.trim()}
                 className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
               >
                 {isEnhancing ? (
                   <>
                     <Loader2 className="animate-spin h-4 w-4 mr-2" />
                     Enhancing...
                   </>
                 ) : (
                   <>
                     <Sparkles className="h-4 w-4 mr-2" />
                     Enhance Test Cases
                   </>
                 )}
               </Button>
             ) : (
               <Button 
                 onClick={applyEnhancement}
                 className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg"
               >
                 <CheckCircle className="h-4 w-4 mr-2" />
                 Apply Enhancements
               </Button>
             )}
           </div>
        </CardContent>
      </Card>
    </div>
  );
}
