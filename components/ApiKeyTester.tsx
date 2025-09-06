import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { config } from '../utils/config';
import { toast } from 'sonner';

export function ApiKeyTester() {
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<{
    deepseek: boolean;
    openrouter: boolean;
  } | null>(null);

  const testApiKeys = async () => {
    setIsTesting(true);
    
    try {
      const results = {
        deepseek: false,
        openrouter: false
      };

      // Test DeepSeek API
      if (config.DEEPSEEK_API_KEY) {
        try {
          const response = await fetch(config.DEEPSEEK_API_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${config.DEEPSEEK_API_KEY}`,
            },
            body: JSON.stringify({
              model: 'deepseek-chat',
              messages: [
                {
                  role: 'user',
                  content: 'Hello'
                }
              ],
              max_tokens: 10
            })
          });
          
          if (response.ok) {
            results.deepseek = true;
            console.log('✅ DeepSeek API key works');
          } else {
            console.log('❌ DeepSeek API key does not work:', response.status);
          }
        } catch (error) {
          console.log('❌ DeepSeek API testing error:', error);
        }
      }

      // Test OpenRouter API
      if (config.OPENROUTER_API_KEY) {
        try {
          const response = await fetch(config.OPENROUTER_API_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${config.OPENROUTER_API_KEY}`,
              'HTTP-Referer': window.location.origin,
              'X-Title': 'Q-AI Test Case Generator'
            },
            body: JSON.stringify({
              model: 'qwen/qwen3-coder:free',
              messages: [
                {
                  role: 'user',
                  content: 'Hello'
                }
              ],
              max_tokens: 10
            })
          });
          
          if (response.ok) {
            results.openrouter = true;
            console.log('✅ OpenRouter API key works');
          } else {
            console.log('❌ OpenRouter API key does not work:', response.status);
          }
        } catch (error) {
          console.log('❌ OpenRouter API testing error:', error);
        }
      }

      setTestResults(results);
      
      if (results.deepseek || results.openrouter) {
        toast.success('API keys tested!');
      } else {
        toast.error('No API key works');
      }
      
    } catch (error) {
      console.error('API key testing error:', error);
      toast.error('API key testing error');
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardDescription>
          Check the functionality of configured API keys
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">DeepSeek API:</span>
            <Badge variant={config.DEEPSEEK_API_KEY ? "default" : "destructive"}>
              {config.DEEPSEEK_API_KEY ? "Configured" : "Not configured"}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">OpenRouter API:</span>
            <Badge variant={config.OPENROUTER_API_KEY ? "default" : "destructive"}>
              {config.OPENROUTER_API_KEY ? "Configured" : "Not configured"}
            </Badge>
          </div>
        </div>

        {testResults && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Test Results:</h4>
            <div className="flex items-center justify-between">
              <span className="text-sm">DeepSeek:</span>
              <Badge variant={testResults.deepseek ? "default" : "destructive"}>
                {testResults.deepseek ? "Works" : "Does not work"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">OpenRouter:</span>
              <Badge variant={testResults.openrouter ? "default" : "destructive"}>
                {testResults.openrouter ? "Works" : "Does not work"}
              </Badge>
            </div>
          </div>
        )}

        <Button 
          onClick={testApiKeys} 
          disabled={isTesting}
          className="w-full"
        >
          {isTesting ? 'Testing...' : 'Test API Keys'}
        </Button>
      </CardContent>
    </Card>
  );
}
