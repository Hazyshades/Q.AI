import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Brain, Lightbulb, ArrowRight } from 'lucide-react';

interface ReasoningDisplayProps {
  reasoning: string;
  model: string;
}

export function ReasoningDisplay({ reasoning, model }: ReasoningDisplayProps) {
  if (!reasoning || reasoning.trim() === '') {
    return null;
  }

  return (
    <Card className="w-full mb-4 border-blue-200 bg-blue-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Brain className="h-5 w-5" />
          Chain of Thought Reasoning
          <Badge variant="outline" className="ml-auto text-xs">
            {model}
          </Badge>
        </CardTitle>
        <CardDescription className="text-blue-600">
          Logical process of model analysis and reasoning
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <Lightbulb className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
                {reasoning}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-blue-600 text-xs">
            <ArrowRight className="h-3 w-3" />
            <span>Based on this reasoning, the final answer was formed</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

