import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './auth-provider';
import { aiService, AIAnalysisResult } from './ai-service';
import { DatabaseService } from './database-service';
import { initializeAiModelFromSettings } from './config';
import { toast } from 'sonner';

interface UseAppLogicReturn {
  user: any;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  uploadedFile: File | null;
  setUploadedFile: (file: File | null) => void;
  textInput: string;
  setTextInput: (text: string) => void;
  outputType: string;
  setOutputType: (type: string) => void;
  selectedRoles: string[];
  setSelectedRoles: (roles: string[]) => void;
  results: AIAnalysisResult | null;
  setResults: (results: AIAnalysisResult | null) => void;
  isProcessing: boolean;
  history: any[];
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  showUserProfile: boolean;
  setShowUserProfile: (show: boolean) => void;
  showContextManager: boolean;
  setShowContextManager: (show: boolean) => void;
  currentProjectId: string | null;
  setCurrentProjectId: (id: string | null) => void;
  currentProjectName: string | null;
  setCurrentProjectName: (name: string | null) => void;
  handleOutputTypeChange: (type: string) => void;
  handleFileUpload: (file: File) => void;
  uploadDocument: () => Promise<void>;
  loadHistory: () => Promise<void>;
  loadHistoryItem: (sessionId: string) => Promise<void>;
}

export function useAppLogic(): UseAppLogicReturn {
  const { user, loading: authLoading } = useAuth();
  
  // State management
  const [activeTab, setActiveTab] = useState('upload');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [textInput, setTextInput] = useState('');
  const [outputType, setOutputType] = useState('testcases');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [results, setResults] = useState<AIAnalysisResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showContextManager, setShowContextManager] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(() => {
    return localStorage.getItem('currentProjectId');
  });
  const [currentProjectName, setCurrentProjectName] = useState<string | null>(() => {
    return localStorage.getItem('currentProjectName');
  });

  // Initialize AI model from user settings on authorization
  useEffect(() => {
    if (user && !authLoading) {
      initializeAiModelFromSettings();
    }
  }, [user, authLoading]);

  // Save current project to localStorage
  useEffect(() => {
    if (currentProjectId) {
      localStorage.setItem('currentProjectId', currentProjectId);
    } else {
      localStorage.removeItem('currentProjectId');
    }
  }, [currentProjectId]);

  useEffect(() => {
    if (currentProjectName) {
      localStorage.setItem('currentProjectName', currentProjectName);
    } else {
      localStorage.removeItem('currentProjectName');
    }
  }, [currentProjectName]);

  // File reading utility
  const readFileContent = useCallback(async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        resolve(content);
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }, []);

  // Handle output type change - clears previous results
  const handleOutputTypeChange = useCallback((type: string) => {
    setOutputType(type);
    setResults(null);
  }, []);

  // Handle file upload
  const handleFileUpload = useCallback((file: File) => {
    setUploadedFile(file);
  }, []);

  // Main document upload and processing
  const uploadDocument = useCallback(async () => {
    if (!uploadedFile && !textInput.trim()) {
      toast.error('Please upload a file or enter text');
      return;
    }

    setIsProcessing(true);

    try {
      const content = uploadedFile ? await readFileContent(uploadedFile) : textInput;
      const newSessionId = Date.now().toString();
      await generateResults(newSessionId, content);
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Upload error: ${errorMessage}`);
      setIsProcessing(false);
    }
  }, [uploadedFile, textInput, readFileContent]);

  // Generate results using AI
  const generateResults = useCallback(async (currentSessionId: string, content?: string) => {
    const startTime = Date.now();

    try {
      const textContent = content || (uploadedFile ? await readFileContent(uploadedFile) : textInput);
      if (!textContent) {
        throw new Error('No content for analysis');
      }

      // Determine prompt based on selected roles
      let analysisResult: AIAnalysisResult;
      if (outputType === 'documentation-analysis') {
        if (selectedRoles.includes('analyst')) {
          analysisResult = await aiService.analyzeWithRole(textContent, 'analyst');
        } else if (selectedRoles.includes('developer')) {
          analysisResult = await aiService.analyzeWithRole(textContent, 'developer');
        } else if (selectedRoles.includes('manager')) {
          analysisResult = await aiService.analyzeWithRole(textContent, 'manager');
        } else {
          analysisResult = await aiService.analyzeWithRole(textContent, 'analyst');
        }
      } else {
        analysisResult = await aiService.analyzeRequirements(
          textContent,
          outputType as 'testcases' | 'checklist' | 'documentation-analysis'
        );
      }

      // Normalize result to expected type
      let results: AIAnalysisResult;
      if (outputType === 'testcases' && analysisResult.type === 'testcases') {
        results = analysisResult;
      } else if (outputType === 'checklist' && analysisResult.type === 'checklist') {
        results = analysisResult;
      } else if (outputType === 'documentation-analysis' &&
                 (analysisResult.type === 'documentation-analysis' ||
                  analysisResult.type === 'developer-analysis' ||
                  analysisResult.type === 'manager-analysis' ||
                  analysisResult.type === 'structuredTesting')) {
        results = analysisResult;
      } else {
        // Fallback: create result of needed type
        results = {
          type: outputType as any,
          data: analysisResult.data,
          summary: analysisResult.summary,
          metadata: analysisResult.metadata
        };
      }

      if (!results) {
        throw new Error('Failed to create analysis result');
      }

      // Save to database if user is authorized
      if (user) {
        const processingTime = Date.now() - startTime;
        const aiModel = results.metadata?.aiModel || 'unknown';
        await DatabaseService.saveGenerationSession(
          currentSessionId,
          textContent,
          outputType as any,
          results,
          undefined,
          aiModel,
          processingTime
        );
      }

      setResults(results);
      setActiveTab('results');
      toast.success('Results generated successfully!');
    } catch (error) {
      console.error('Generation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Generation error: ${errorMessage}`);
    } finally {
      setIsProcessing(false);
    }
  }, [uploadedFile, textInput, outputType, selectedRoles, user, readFileContent]);

  // Load generation history
  const loadHistory = useCallback(async () => {
    if (!user) return;

    try {
      const historyData = await DatabaseService.getGenerationHistory();
      setHistory(historyData);
    } catch (error) {
      console.error('History load error:', error);
      toast.error('Error loading history');
    }
  }, [user]);

  // Load specific history item
  const loadHistoryItem = useCallback(async (sessionId: string) => {
    try {
      const session = await DatabaseService.getGenerationSession(sessionId);
      if (session) {
        setResults(session.results);
        setActiveTab('results');
        toast.success('History loaded');
      } else {
        throw new Error('Session not found');
      }
    } catch (error) {
      console.error('Load history item error:', error);
      toast.error('Error loading history item');
    }
  }, []);

  // Load history when user changes
  useEffect(() => {
    if (user) {
      loadHistory();
    } else {
      setHistory([]);
    }
  }, [user, loadHistory]);

  // Load history when switching to history tab
  useEffect(() => {
    if (user && activeTab === 'history') {
      loadHistory();
    }
  }, [activeTab, user, loadHistory]);

  return {
    user,
    activeTab,
    setActiveTab,
    uploadedFile,
    setUploadedFile,
    textInput,
    setTextInput,
    outputType,
    setOutputType,
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
  };
}
