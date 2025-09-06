import React from 'react';
import { Card, CardContent } from './ui/card';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { FileText, CheckSquare, List, ClipboardList, Search, BookOpen } from 'lucide-react';

interface OutputSelectorProps {
  outputType: string;
  setOutputType: (type: string) => void;
  selectedRoles: string[];
  setSelectedRoles: (roles: string[]) => void;
}

export function OutputSelector({ outputType, setOutputType, selectedRoles, setSelectedRoles }: OutputSelectorProps) {
  return (
    <div className="space-y-4">
      <Label className="text-base font-medium">Select output type:</Label>
      
      <RadioGroup value={outputType} onValueChange={setOutputType} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card 
          className={`cursor-pointer transition-colors bg-white ${outputType === 'testcases' ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'}`}
          onClick={() => setOutputType('testcases')}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <RadioGroupItem 
                value="testcases" 
                id="testcases" 
                className="mt-1"
                onClick={(e) => e.stopPropagation()}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <Label 
                    htmlFor="testcases" 
                    className="cursor-pointer font-medium"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Test Cases
                  </Label>
                </div>
                <p className="text-sm text-gray-600">
                  Detailed test cases with ID, description, execution steps and expected results
                </p>
                <div className="mt-3 space-y-1">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    Structured format
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    Ready for Test Management system
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    Includes negative scenarios
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-colors bg-white ${outputType === 'checklist' ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'}`}
          onClick={() => setOutputType('checklist')}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <RadioGroupItem 
                value="checklist" 
                id="checklist" 
                className="mt-1"
                onClick={(e) => e.stopPropagation()}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <CheckSquare className="h-5 w-5 text-green-600" />
                  <Label 
                    htmlFor="checklist" 
                    className="cursor-pointer font-medium"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Checklist
                  </Label>
                </div>
                <p className="text-sm text-gray-600">
                  Simple list of checks for quick manual testing
                </p>
                <div className="mt-3 space-y-1">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    Quick execution
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    Interactive checkboxes
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    Suitable for ad-hoc testing
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-colors bg-white ${outputType === 'documentation-analysis' ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'}`}
          onClick={() => setOutputType('documentation-analysis')}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <RadioGroupItem 
                value="documentation-analysis" 
                id="documentation-analysis" 
                className="mt-1"
                onClick={(e) => e.stopPropagation()}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="h-5 w-5 text-purple-600" />
                  <Label 
                    htmlFor="documentation-analysis" 
                    className="cursor-pointer font-medium"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Requirements Analysis
                  </Label>
                </div>
                <p className="text-sm text-gray-600">
                  Comprehensive analysis of technical requirements with requirements extraction
                </p>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="analyst-checkbox"
                      checked={selectedRoles.includes('analyst')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedRoles([...selectedRoles, 'analyst']);
                        } else {
                          setSelectedRoles(selectedRoles.filter(role => role !== 'analyst'));
                        }
                      }}
                      className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                    />
                    <label htmlFor="analyst-checkbox" className="text-xs text-gray-700">
                      For Analysts
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="developer-checkbox"
                      checked={selectedRoles.includes('developer')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedRoles([...selectedRoles, 'developer']);
                        } else {
                          setSelectedRoles(selectedRoles.filter(role => role !== 'developer'));
                        }
                      }}
                      className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                    />
                    <label htmlFor="developer-checkbox" className="text-xs text-gray-700">
                      For Developers
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="manager-checkbox"
                      checked={selectedRoles.includes('manager')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedRoles([...selectedRoles, 'manager']);
                        } else {
                          setSelectedRoles(selectedRoles.filter(role => role !== 'manager'));
                        }
                      }}
                      className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                    />
                    <label htmlFor="manager-checkbox" className="text-xs text-gray-700">
                      For Managers
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </RadioGroup>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <Card className="p-4 bg-white border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <List className="h-4 w-4 text-gray-600" />
            <span className="font-medium text-sm">Additional Settings</span>
          </div>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Test case prioritization</li>
            <li>• Grouping by functionality</li>
            <li>• Automatic ID generation</li>
          </ul>
        </Card>
        
        <Card className="p-4 bg-white border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <ClipboardList className="h-4 w-4 text-gray-600" />
            <span className="font-medium text-sm">Export Results</span>
          </div>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• CSV/Excel format</li>
            <li>• JSON for API integration</li>
            <li>• PDF report</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}