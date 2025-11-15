import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
// @ts-ignore - recharts types issue
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  Database,
  Upload,
  ArrowLeft,
  FileText,
  TrendingUp,
  PieChart as PieChartIcon,
  Download,
  Loader2,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Lightbulb,
  Activity,
  FileSpreadsheet
} from 'lucide-react';

interface AnalysisReport {
  id: string;
  report_name: string;
  data_source: string;
  analysis_type: string;
  ai_insights: any;
  visualizations: any;
  status: string;
  created_at: string;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1', '#f43f5e', '#14b8a6'];

export default function DataAnalyzerModule() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [step, setStep] = useState<'upload' | 'analysis' | 'results'>('upload');
  const [loading, setLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[] | null>(null);
  const [reportName, setReportName] = useState('');
  const [analysisType, setAnalysisType] = useState('comprehensive');
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [statistics, setStatistics] = useState<any>(null);
  const [insights, setInsights] = useState<any>(null);
  const [visualizations, setVisualizations] = useState<any[]>([]);
  const [history, setHistory] = useState<AnalysisReport[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('data-analyzer', {
        body: { action: 'get_history' }
      });

      if (error) throw error;
      if (data?.reports) {
        setHistory(data.reports);
      }
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validTypes = ['text/csv', 'application/json', 'application/vnd.ms-excel'];
    if (!validTypes.includes(file.type) && !file.name.endsWith('.csv') && !file.name.endsWith('.json')) {
      alert('Please upload a CSV or JSON file');
      return;
    }

    setUploadedFile(file);
    setReportName(file.name.replace(/\.[^/.]+$/, ''));
    parseFile(file);
  };

  const parseFile = async (file: File) => {
    setLoading(true);
    try {
      const text = await file.text();
      
      if (file.name.endsWith('.json')) {
        const jsonData = JSON.parse(text);
        const dataArray = Array.isArray(jsonData) ? jsonData : [jsonData];
        setParsedData(dataArray);
      } else if (file.name.endsWith('.csv')) {
        const lines = text.trim().split('\n');
        if (lines.length < 2) {
          throw new Error('CSV file must have at least a header row and one data row');
        }

        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
        const data = [];

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
          const row: any = {};
          
          headers.forEach((header, index) => {
            let value: any = values[index] || '';
            const numValue = parseFloat(value);
            if (!isNaN(numValue) && value !== '') {
              value = numValue;
            }
            row[header] = value;
          });
          
          data.push(row);
        }

        setParsedData(data);
      }
      
      setStep('analysis');
    } catch (error: any) {
      alert('Error parsing file: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files[0];
    if (file) {
      setUploadedFile(file);
      setReportName(file.name.replace(/\.[^/.]+$/, ''));
      parseFile(file);
    }
  };

  const analyzeData = async () => {
    if (!parsedData || parsedData.length === 0) {
      alert('No data to analyze');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('data-analyzer', {
        body: {
          action: 'analyze',
          reportName: reportName || 'Untitled Analysis',
          dataSource: uploadedFile?.name.endsWith('.json') ? 'json' : 'csv',
          parsedData: parsedData,
          analysisType: analysisType
        }
      });

      if (error) throw error;

      if (data?.success) {
        setReport(data.report);
        setStatistics(data.statistics);
        setInsights(data.insights);
        setVisualizations(data.visualizations || []);
        setStep('results');
        loadHistory();
      } else {
        throw new Error(data?.error || 'Analysis failed');
      }
    } catch (error: any) {
      console.error('Analysis error:', error);
      alert('Error analyzing data: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const loadReport = async (reportId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('data-analyzer', {
        body: {
          action: 'get_report',
          reportId: reportId
        }
      });

      if (error) throw error;

      if (data?.success && data.report) {
        setReport(data.report);
        setInsights(data.report.ai_insights);
        setVisualizations(data.report.visualizations || []);
        setStep('results');
        setShowHistory(false);
      }
    } catch (error: any) {
      alert('Error loading report: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = () => {
    alert('PDF export functionality will be available soon');
  };

  const exportToExcel = () => {
    if (!parsedData) return;
    
    const csv = convertToCSV(parsedData);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportName || 'analysis'}_export.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const convertToCSV = (data: any[]): string => {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];
    
    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header];
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
      });
      csvRows.push(values.join(','));
    }
    
    return csvRows.join('\n');
  };

  const resetAnalysis = () => {
    setStep('upload');
    setUploadedFile(null);
    setParsedData(null);
    setReportName('');
    setReport(null);
    setStatistics(null);
    setInsights(null);
    setVisualizations([]);
  };

  const renderChart = (config: any, index: number) => {
    if (!config || !config.data || config.data.length === 0) return null;

    return (
      <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{config.title}</h3>
        {/* @ts-ignore - recharts types issue */}
        <ResponsiveContainer width="100%" height={300}>
          {config.type === 'bar' && (
            // @ts-ignore
            <BarChart data={config.data}>
              {/* @ts-ignore */}
              <CartesianGrid strokeDasharray="3 3" />
              {/* @ts-ignore */}
              <XAxis dataKey={config.xKey} />
              {/* @ts-ignore */}
              <YAxis />
              {/* @ts-ignore */}
              <Tooltip />
              {/* @ts-ignore */}
              <Legend />
              {/* @ts-ignore */}
              <Bar dataKey={config.yKey} fill="#3b82f6" />
            </BarChart>
          )}
          {config.type === 'line' && (
            // @ts-ignore
            <LineChart data={config.data}>
              {/* @ts-ignore */}
              <CartesianGrid strokeDasharray="3 3" />
              {/* @ts-ignore */}
              <XAxis dataKey={config.xKey} />
              {/* @ts-ignore */}
              <YAxis />
              {/* @ts-ignore */}
              <Tooltip />
              {/* @ts-ignore */}
              <Legend />
              {/* @ts-ignore */}
              <Line type="monotone" dataKey={config.yKey} stroke="#8b5cf6" strokeWidth={2} />
            </LineChart>
          )}
          {config.type === 'pie' && (
            // @ts-ignore
            <PieChart>
              {/* @ts-ignore */}
              <Pie
                data={config.data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry: any) => `${entry.name}: ${(entry.percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {config.data.map((entry: any, idx: number) => (
                  // @ts-ignore
                  <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              {/* @ts-ignore */}
              <Tooltip />
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Dashboard
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <Database className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">Data Analyzer & Insights</h1>
            </div>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              {showHistory ? 'Hide History' : 'View History'}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showHistory ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Analysis History</h2>
            {history.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No previous analyses found</p>
            ) : (
              <div className="grid gap-4">
                {history.map((report) => (
                  <div
                    key={report.id}
                    onClick={() => loadReport(report.id)}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{report.report_name}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {report.analysis_type} • {new Date(report.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <FileText className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : step === 'upload' ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="text-center mb-8">
              <Database className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Upload Your Data</h2>
              <p className="text-gray-600">Upload CSV or JSON files for AI-powered analysis and insights</p>
            </div>

            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-500 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                Drop your file here or click to browse
              </p>
              <p className="text-sm text-gray-500">Supports CSV and JSON files up to 10MB</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.json"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {uploadedFile && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-blue-600 mr-3" />
                  <div>
                    <p className="font-medium text-blue-900">{uploadedFile.name}</p>
                    <p className="text-sm text-blue-600">
                      {(uploadedFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : step === 'analysis' ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Configure Analysis</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Report Name
                </label>
                <input
                  type="text"
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter report name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Analysis Type
                </label>
                <select
                  value={analysisType}
                  onChange={(e) => setAnalysisType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="comprehensive">Comprehensive Analysis</option>
                  <option value="statistical">Statistical Analysis</option>
                  <option value="predictive">Predictive Analysis</option>
                  <option value="trends">Trend Analysis</option>
                </select>
              </div>

              {parsedData && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Data Preview</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {parsedData.length} rows • {Object.keys(parsedData[0] || {}).length} columns
                  </p>
                  <div className="bg-white rounded border border-gray-200 overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          {Object.keys(parsedData[0] || {}).map((key) => (
                            <th key={key} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {parsedData.slice(0, 5).map((row, index) => (
                          <tr key={index}>
                            {Object.values(row).map((value: any, i) => (
                              <td key={i} className="px-4 py-2 text-sm text-gray-900 whitespace-nowrap">
                                {String(value)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="flex space-x-4">
                <button
                  onClick={resetAnalysis}
                  className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={analyzeData}
                  disabled={loading || !parsedData}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Activity className="h-5 w-5 mr-2" />
                      Start Analysis
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Results Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{report?.report_name}</h2>
                  <p className="text-gray-600 mt-1">
                    Analysis completed on {report?.created_at ? new Date(report.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={exportToExcel}
                    className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
                  >
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Export CSV
                  </button>
                  <button
                    onClick={exportToPDF}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export PDF
                  </button>
                  <button
                    onClick={resetAnalysis}
                    className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    New Analysis
                  </button>
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            {statistics && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Rows</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{statistics.totalRows}</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Columns</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{statistics.totalColumns}</p>
                    </div>
                    <FileText className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Numeric Metrics</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {Object.keys(statistics.numericColumns || {}).length}
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Categories</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {Object.keys(statistics.categoricalColumns || {}).length}
                      </p>
                    </div>
                    <PieChartIcon className="h-8 w-8 text-orange-600" />
                  </div>
                </div>
              </div>
            )}

            {/* AI Insights */}
            {insights && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <Lightbulb className="h-6 w-6 text-yellow-600 mr-2" />
                  <h3 className="text-xl font-bold text-gray-900">AI-Powered Insights</h3>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Summary</h4>
                    <p className="text-gray-700">{insights.summary}</p>
                  </div>

                  {insights.keyFindings && insights.keyFindings.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Key Findings</h4>
                      <ul className="space-y-2">
                        {insights.keyFindings.map((finding: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{finding}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {insights.recommendations && insights.recommendations.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Recommendations</h4>
                      <ul className="space-y-2">
                        {insights.recommendations.map((rec: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <Lightbulb className="h-5 w-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {insights.trends && insights.trends.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Trends</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {insights.trends.map((trend: any, index: number) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-4">
                            <p className="font-medium text-gray-900">{trend.metric}</p>
                            <p className="text-sm text-gray-600 mt-1">{trend.description}</p>
                            <span className={`inline-block mt-2 px-2 py-1 text-xs font-medium rounded ${
                              trend.type === 'High Growth' ? 'bg-green-100 text-green-800' :
                              trend.type === 'Decline' ? 'bg-red-100 text-red-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {trend.type}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Visualizations */}
            {visualizations && visualizations.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Data Visualizations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {visualizations.map((config, index) => renderChart(config, index))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
