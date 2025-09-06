import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { RefreshCw, FileText, CheckSquare, Clock, Calendar } from 'lucide-react';

interface HistoryItem {
  id: string;
  session_id: string;
  output_type: 'testcases' | 'checklist';
  results: any;
  created_at: string;
  ai_model?: string;
  processing_time_ms?: number;
}

interface HistoryPanelProps {
  history: HistoryItem[];
  onLoadItem: (sessionId: string) => void;
  onRefresh: () => void;
}

export function HistoryPanel({ history, onLoadItem, onRefresh }: HistoryPanelProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      const days = Math.floor(diffInHours / 24);
      return `${days} days ago`;
    }
  };

  const formatFullDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Generation History
            </CardTitle>
            <CardDescription>
              {history.length > 0 
                ? `Found ${history.length} saved results`
                : 'History is empty'
              }
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Clock className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">History is empty</h3>
            <p className="text-gray-500 mb-4">
              Generated test cases and checklists will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item) => (
              <Card key={item.id} className="cursor-pointer hover:bg-gray-50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {item.output_type === 'testcases' ? (
                          <FileText className="h-4 w-4 text-blue-600" />
                        ) : (
                          <CheckSquare className="h-4 w-4 text-green-600" />
                        )}
                        <span className="font-medium">
                          {item.output_type === 'testcases' ? 'Test Cases' : 'Checklist'}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {item.results?.data?.length || 0} {item.output_type === 'testcases' ? 'cases' : 'items'}
                        </Badge>
                        {item.ai_model && (
                          <Badge variant="secondary" className="text-xs">
                            {item.ai_model}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span title={formatFullDate(item.created_at)}>
                            {formatDate(item.created_at)}
                          </span>
                        </div>
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {item.session_id.slice(0, 8)}...
                        </code>
                        {item.processing_time_ms && (
                          <span className="text-xs text-gray-400">
                            {item.processing_time_ms}ms
                          </span>
                        )}
                      </div>
                      
                      {item.results?.data && item.results.data.length > 0 && (
                        <div className="mt-2 text-sm text-gray-600">
                          {item.output_type === 'testcases' ? (
                            <span>
                              {item.results.data[0]?.title || 'Test case without title'}
                              {item.results.data.length > 1 && ` and ${item.results.data.length - 1} more`}
                            </span>
                          ) : (
                            <span>
                              {item.results.data[0]?.item || 'Check item'}
                              {item.results.data.length > 1 && ` and ${item.results.data.length - 1} more`}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onLoadItem(item.session_id)}
                      className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200"
                    >
                      Open
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}