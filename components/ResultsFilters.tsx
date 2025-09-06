import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Search, Filter, SortAsc, SortDesc } from 'lucide-react';
import { TestCase, ChecklistItem, AIAnalysisResult } from '../utils/ai-service';

interface ResultsFiltersProps {
  results: AIAnalysisResult;
  filters: {
    search: string;
    category: string;
    module: string;
    priority: string;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  };
  onFiltersChange: (filters: any) => void;
}

export function ResultsFilters({ results, filters, onFiltersChange }: ResultsFiltersProps) {
  const handleFilterChange = (key: string, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  // Get unique values for filters
  const getUniqueValues = (field: keyof (TestCase | ChecklistItem)) => {
    const values = new Set<string>();
    (results.data as any[]).forEach((item: any) => {
      if (item[field]) {
        values.add(item[field]);
      }
    });
    return Array.from(values).sort();
  };

  const categories = getUniqueValues('category');
  const modules = getUniqueValues('module');
  const priorities = results.type === 'testcases' ? getUniqueValues('priority' as any) : [];

  // Calculate statistics
  const getStats = () => {
    const total = (results.data as any[]).length;
    const filtered = (results.data as any[]).filter((item: any) => {
      const matchesSearch = !filters.search || 
        item.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.item?.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.description?.toLowerCase().includes(filters.search.toLowerCase());
      
             const matchesCategory = !filters.category || filters.category === 'all' || item.category === filters.category;
       const matchesModule = !filters.module || filters.module === 'all' || item.module === filters.module;
       const matchesPriority = !filters.priority || filters.priority === 'all' || item.priority === filters.priority;

      return matchesSearch && matchesCategory && matchesModule && matchesPriority;
    }).length;

    return { total, filtered };
  };

  const stats = getStats();

     return (
     <Card className="mb-6 bg-white border-gray-200 shadow-sm relative z-10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filters and Sorting
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by title, description..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Category filter */}
          <div>
            <Label htmlFor="category-filter">Category</Label>
            <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
                                              <SelectContent className="z-50 bg-white border border-gray-200 shadow-lg">
                   <SelectItem value="all" className="cursor-pointer hover:bg-gray-50">All categories</SelectItem>
                   {categories.map((category) => (
                     <SelectItem key={category} value={category} className="cursor-pointer hover:bg-gray-50">
                       {category}
                     </SelectItem>
                   ))}
                 </SelectContent>
            </Select>
          </div>

          {/* Module filter */}
          <div>
            <Label htmlFor="module-filter">Module</Label>
            <Select value={filters.module} onValueChange={(value) => handleFilterChange('module', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All modules" />
              </SelectTrigger>
                             <SelectContent className="z-50 bg-white border border-gray-200 shadow-lg">
                 <SelectItem value="all" className="cursor-pointer hover:bg-gray-50">All modules</SelectItem>
                 {modules.map((module) => (
                   <SelectItem key={module} value={module} className="cursor-pointer hover:bg-gray-50">
                     {module}
                   </SelectItem>
                 ))}
               </SelectContent>
            </Select>
          </div>

          {/* Priority filter (only for test cases) */}
          {results.type === 'testcases' && (
            <div>
              <Label htmlFor="priority-filter">Priority</Label>
              <Select value={filters.priority} onValueChange={(value) => handleFilterChange('priority', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All priorities" />
                </SelectTrigger>
                                 <SelectContent className="z-50 bg-white border border-gray-200 shadow-lg">
                   <SelectItem value="all" className="cursor-pointer hover:bg-gray-50">All priorities</SelectItem>
                   {priorities.map((priority) => (
                     <SelectItem key={priority} value={priority} className="cursor-pointer hover:bg-gray-50">
                       {priority}
                     </SelectItem>
                   ))}
                 </SelectContent>
              </Select>
            </div>
          )}

          {/* Sorting */}
          <div>
            <Label htmlFor="sort-filter">Sorting</Label>
            <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange('sortBy', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sorting" />
              </SelectTrigger>
                             <SelectContent className="z-50 bg-white border border-gray-200 shadow-lg">
                 <SelectItem value="id" className="cursor-pointer hover:bg-gray-50">By ID</SelectItem>
                 <SelectItem value="title" className="cursor-pointer hover:bg-gray-50">By Title</SelectItem>
                 <SelectItem value="category" className="cursor-pointer hover:bg-gray-50">By Category</SelectItem>
                 <SelectItem value="module" className="cursor-pointer hover:bg-gray-50">By Module</SelectItem>
                 {results.type === 'testcases' && (
                   <SelectItem value="priority" className="cursor-pointer hover:bg-gray-50">By Priority</SelectItem>
                 )}
               </SelectContent>
            </Select>
          </div>
        </div>

        {/* Sort direction */}
        <div className="flex items-center gap-2">
          <Label>Direction:</Label>
          <button
            onClick={() => handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
            className="flex items-center gap-1 px-2 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
          >
            {filters.sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
            {filters.sortOrder === 'asc' ? 'Ascending' : 'Descending'}
          </button>
        </div>

        {/* Statistics */}
        <div className="flex items-center gap-4 pt-2 border-t">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Showing:</span>
            <Badge variant="outline">{stats.filtered}</Badge>
            <span className="text-sm text-gray-600">of</span>
            <Badge variant="outline">{stats.total}</Badge>
          </div>
          
                     {(filters.search || filters.category !== 'all' || filters.module !== 'all' || filters.priority !== 'all') && (
             <button
               onClick={() => onFiltersChange({
                 search: '',
                 category: 'all',
                 module: 'all',
                 priority: 'all',
                 sortBy: 'id',
                 sortOrder: 'asc'
               })}
               className="text-sm text-blue-600 hover:text-blue-800"
             >
               Reset filters
             </button>
           )}
        </div>
      </CardContent>
    </Card>
  );
}
