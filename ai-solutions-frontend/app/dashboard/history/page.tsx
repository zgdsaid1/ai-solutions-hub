'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getResults, 
  deleteResult, 
  exportResult, 
  shareResult, 
  downloadExportedResult,
  type Result,
  type GetResultsParams 
} from '@/lib/results';
import { 
  Search, Download, Share2, Trash2, Star, Calendar,
  Filter, ChevronLeft, ChevronRight, FileText, Database,
  BarChart2, FileCheck, Mail, Package, Truck, Phone
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const toolIcons: Record<string, any> = {
  marketing: BarChart2,
  legal: FileCheck,
  data: Database,
  documents: FileText,
  email: Mail,
  inventory: Package,
  logistics: Truck,
  'voice-sms': Phone,
};

export default function HistoryPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [results, setResults] = useState<Result[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTool, setFilterTool] = useState('');
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const pageSize = 12;

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchResults();
    }
  }, [user, searchTerm, filterTool, filterFavorites, currentPage]);

  const fetchResults = async () => {
    setIsLoading(true);
    try {
      const params: GetResultsParams = {
        limit: pageSize,
        offset: currentPage * pageSize,
      };

      if (searchTerm) params.search = searchTerm;
      if (filterTool) params.toolType = filterTool;
      if (filterFavorites) params.isFavorite = true;

      const { results: fetchedResults, pagination } = await getResults(params);
      setResults(fetchedResults);
      setTotalResults(pagination.total);
      setHasMore(pagination.hasMore);
    } catch (error) {
      console.error('Error fetching results:', error);
      toast.error('Failed to load results');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (resultId: string) => {
    if (!confirm('Are you sure you want to delete this result?')) return;

    try {
      await deleteResult(resultId);
      toast.success('Result deleted successfully');
      fetchResults();
    } catch (error) {
      console.error('Error deleting result:', error);
      toast.error('Failed to delete result');
    }
  };

  const handleExport = async (resultId: string, format: 'json' | 'txt' | 'csv') => {
    try {
      const blob = await exportResult(resultId, format);
      const result = results.find(r => r.id === resultId);
      const filename = `${result?.tool_name || 'result'}_${resultId.slice(0, 8)}.${format}`;
      downloadExportedResult(blob, filename);
      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Error exporting result:', error);
      toast.error('Failed to export result');
    }
  };

  const handleShare = async (resultId: string) => {
    try {
      const { shareUrl } = await shareResult(resultId);
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Share link copied to clipboard');
    } catch (error) {
      console.error('Error sharing result:', error);
      toast.error('Failed to create share link');
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const toolTypes = ['marketing', 'legal', 'data', 'documents', 'email', 'inventory', 'logistics', 'voice-sms'];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Results History</h1>
          <p className="text-gray-600">View, manage, and export your AI tool results</p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search results..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(0);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Tool Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                value={filterTool}
                onChange={(e) => {
                  setFilterTool(e.target.value);
                  setCurrentPage(0);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Tools</option>
                {toolTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
                  </option>
                ))}
              </select>
            </div>

            {/* Favorites Filter */}
            <div>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={filterFavorites}
                  onChange={(e) => {
                    setFilterFavorites(e.target.checked);
                    setCurrentPage(0);
                  }}
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-gray-700">Show favorites only</span>
              </label>
            </div>
          </div>
        </div>

        {/* Results Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              </div>
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Database className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterTool || filterFavorites
                ? 'Try adjusting your filters or search terms'
                : 'Start using AI tools to see your results here'}
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {results.map((result) => {
                const Icon = toolIcons[result.tool_type] || FileText;
                return (
                  <div
                    key={result.id}
                    className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <Icon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 line-clamp-1">
                            {result.title}
                          </h3>
                          <p className="text-sm text-gray-500">{result.tool_name}</p>
                        </div>
                      </div>
                      {result.is_favorite && (
                        <Star className="h-5 w-5 text-yellow-500 fill-current" />
                      )}
                    </div>

                    {/* Description */}
                    {result.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {result.description}
                      </p>
                    )}

                    {/* Metadata */}
                    <div className="flex items-center text-sm text-gray-500 mb-4">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(result.created_at).toLocaleDateString()}
                    </div>

                    {/* Tags */}
                    {result.tags && result.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {result.tags.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleExport(result.id, 'json')}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Export as JSON"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleShare(result.id)}
                          className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
                          title="Share result"
                        >
                          <Share2 className="h-4 w-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => handleDelete(result.id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete result"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalResults > pageSize && (
              <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {currentPage * pageSize + 1} to{' '}
                  {Math.min((currentPage + 1) * pageSize, totalResults)} of {totalResults} results
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                    disabled={currentPage === 0}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => p + 1)}
                    disabled={!hasMore}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
