import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  User, 
  LogOut, 
  Settings, 
  History, 
  Star, 
  BarChart3, 
  Calendar,
  Clock,
  FileText,
  CheckSquare,
  Loader2
} from 'lucide-react';
import { useAuth } from '../utils/auth-provider';
import { DatabaseService, UserStats, GenerationSession, FavoriteResult } from '../utils/database-service';
import { toast } from 'sonner';

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserProfile({ isOpen, onClose }: UserProfileProps) {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [stats, setStats] = useState<UserStats | null>(null);
  const [history, setHistory] = useState<GenerationSession[]>([]);
  const [favorites, setFavorites] = useState<FavoriteResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      loadUserData();
    }
  }, [isOpen, user]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      const [statsData, historyData, favoritesData] = await Promise.all([
        DatabaseService.getUserStats(),
        DatabaseService.getGenerationHistory(10),
        DatabaseService.getFavorites()
      ]);

      setStats(statsData);
      setHistory(historyData);
      setFavorites(favoritesData);
    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error('Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Successfully signed out');
      onClose();
    } catch (error) {
      toast.error('Error signing out');
    }
  };

  if (!isOpen || !user) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getOutputTypeIcon = (type: string) => {
    return type === 'testcases' ? <FileText className="h-4 w-4" /> : <CheckSquare className="h-4 w-4" />;
  };

  const getOutputTypeLabel = (type: string) => {
    return type === 'testcases' ? 'Test Cases' : 'Checklist';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]" onClick={onClose}>
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white border-gray-200 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <CardHeader className="bg-white border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl">{user.email}</CardTitle>
                <CardDescription>
                  User since {formatDate(user.created_at)}
                </CardDescription>
              </div>
            </div>
            <Button variant="outline" onClick={handleSignOut} className="text-red-600 border-red-200 hover:bg-red-50">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="stats">Statistics</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="favorites">Favorites</TabsTrigger>
            </TabsList>

            {/* Profile */}
            <TabsContent value="profile" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-sm">{user.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Registration Date</label>
                      <p className="text-sm">{formatDate(user.created_at)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Last Sign In</label>
                      <p className="text-sm">{formatDate(user.last_sign_in_at || user.created_at)}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start bg-gray-50 hover:bg-gray-100 border-gray-200">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Button>
                    <Button variant="outline" className="w-full justify-start bg-gray-50 hover:bg-gray-100 border-gray-200">
                      <History className="h-4 w-4 mr-2" />
                      History
                    </Button>
                    <Button variant="outline" className="w-full justify-start bg-gray-50 hover:bg-gray-100 border-gray-200">
                      <Star className="h-4 w-4 mr-2" />
                      Favorites
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Statistics */}
            <TabsContent value="stats" className="space-y-6">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <BarChart3 className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{stats?.total_sessions || 0}</p>
                          <p className="text-sm text-gray-500">Total Sessions</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <FileText className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{stats?.total_testcases || 0}</p>
                          <p className="text-sm text-gray-500">Test Cases</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                          <CheckSquare className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{stats?.total_checklists || 0}</p>
                          <p className="text-sm text-gray-500">Checklists</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                          <Star className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{stats?.favorite_count || 0}</p>
                          <p className="text-sm text-gray-500">In Favorites</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            {/* History */}
            <TabsContent value="history" className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <History className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>History is empty</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((session) => (
                    <Card key={session.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getOutputTypeIcon(session.output_type)}
                            <div>
                              <p className="font-medium">{getOutputTypeLabel(session.output_type)}</p>
                              <p className="text-sm text-gray-500">
                                {session.input_content.substring(0, 100)}...
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">{formatDate(session.created_at)}</p>
                            {session.processing_time_ms && (
                              <p className="text-xs text-gray-400">
                                {session.processing_time_ms}ms
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Favorites */}
            <TabsContent value="favorites" className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : favorites.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Star className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Favorites is empty</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {favorites.map((favorite) => (
                    <Card key={favorite.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Star className="h-5 w-5 text-yellow-500" />
                            <div>
                              <p className="font-medium">{favorite.name}</p>
                              {favorite.description && (
                                <p className="text-sm text-gray-500">{favorite.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">{formatDate(favorite.created_at)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
