import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Settings } from 'lucide-react';
import { config, AI_MODELS, getCurrentAiModel, setCurrentAiModel } from '../utils/config';
import { DatabaseService } from '../utils/database-service';
import { ApiKeyTester } from './ApiKeyTester';
import { toast } from 'sonner';

interface SettingsPanelProps {
  onClose: () => void;
}

export function SettingsPanel({ onClose }: SettingsPanelProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState(getCurrentAiModel());

  // Load user settings when opening the panel
  useEffect(() => {
    const loadUserSettings = async () => {
      try {
        const userSettings = await DatabaseService.getUserSettings();
        if (userSettings?.ai_model && Object.keys(AI_MODELS).includes(userSettings.ai_model)) {
          setSelectedModel(userSettings.ai_model as keyof typeof AI_MODELS);
          setCurrentAiModel(userSettings.ai_model as keyof typeof AI_MODELS);
        }
      } catch (error) {
        console.warn('Failed to load user settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // Save settings to database
      const savedSettings = await DatabaseService.upsertUserSettings({
        ai_model: selectedModel
      });

      if (savedSettings) {
        // Update current model in configuration
        setCurrentAiModel(selectedModel);
        toast.success('Settings saved!');
        onClose();
      } else {
        toast.error('Error saving settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Error saving settings');
    } finally {
      setIsSaving(false);
    }
  };



  if (isLoading) {
    return (
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <Card 
          className="w-full max-w-2xl bg-white border-gray-200 shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <CardContent className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading settings...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <Card 
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white border-gray-200 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Application Settings
          </CardTitle>
          <CardDescription>
            Manage AI operation modes and configuration
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">

          {/* AI model selection modal */}
          <div className="space-y-3">
            <Label className="text-base font-medium">AI Model</Label>
            <Select value={selectedModel} onValueChange={(value) => setSelectedModel(value as any)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select AI model" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 shadow-lg">
                {Object.entries(AI_MODELS).map(([key, model]) => (
                  <SelectItem key={key} value={key} className="hover:bg-gray-50">
                    <div className="flex flex-col">
                      <span className="font-medium">{model.name}</span>
                      <span className="text-xs text-gray-500">{model.provider}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-600">
              Selected model will be used for all analysis operations
            </p>
          </div>



          {/* API key testing */}
          <div className="space-y-3">
            <Label className="text-base font-medium">API Key Testing</Label>
            <ApiKeyTester />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} className="bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200">
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={isSaving}
              className="bg-black text-white hover:bg-gray-800"
            >
              {isSaving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
