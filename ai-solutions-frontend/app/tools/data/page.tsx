"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BarChart3, ArrowLeft, Loader2, Save, Download } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { callDataAnalysisTool } from "@/lib/ai-tools";
import { saveResult, exportResult, downloadExportedResult } from "@/lib/results";
import toast, { Toaster } from "react-hot-toast";

export default function DataToolPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [savedResultId, setSavedResultId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    dataInput: "",
    analysisType: "comprehensive",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.dataInput.trim()) {
      toast.error("Please enter data to analyze");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // Parse input as JSON if possible
      let dataset;
      try {
        dataset = JSON.parse(formData.dataInput);
      } catch {
        // If not JSON, treat as CSV or text data
        dataset = formData.dataInput;
      }

      const response = await callDataAnalysisTool({
        dataset,
        analysisType: formData.analysisType,
      });

      if (response.error) {
        toast.error(response.error.message || "Failed to analyze data");
        return;
      }

      setResult(response.data);
      setSavedResultId(null); // Reset saved state for new result
      toast.success("Data analyzed successfully!");
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!result) return;

    setSaving(true);
    try {
      const saved = await saveResult({
        toolName: "Data Analysis Engine",
        toolType: "data",
        inputData: formData,
        outputData: result,
        title: `Data Analysis Engine Result - ${new Date().toLocaleDateString()}`,
        description: `Result from Data Analysis Engine`,
        tags: ["data"],
      });
      
      setSavedResultId(saved.id);
      toast.success("Result saved successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to save result");
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async (format: 'json' | 'txt' | 'csv') => {
    if (!savedResultId) {
      toast.error("Please save the result first");
      return;
    }

    try {
      const blob = await exportResult(savedResultId, format);
      downloadExportedResult(blob, `data_result.${format}`);
      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to export result");
    }
  };

  return (
    <ProtectedRoute>
      <Toaster position="top-center" />
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Back to Dashboard</span>
            </button>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-4 bg-green-100 rounded-lg">
                <BarChart3 className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Data Analysis Engine
                </h1>
                <p className="text-gray-600">
                  Extract insights from business data automatically
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Enter Your Data
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="analysisType" className="block text-sm font-medium text-gray-700 mb-2">
                  Analysis Type
                </label>
                <select
                  id="analysisType"
                  name="analysisType"
                  value={formData.analysisType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="quick">Quick Analysis</option>
                  <option value="comprehensive">Comprehensive Analysis</option>
                  <option value="detailed">Detailed Deep Dive</option>
                </select>
              </div>

              <div>
                <label htmlFor="dataInput" className="block text-sm font-medium text-gray-700 mb-2">
                  Data (JSON, CSV, or Text) *
                </label>
                <textarea
                  id="dataInput"
                  name="dataInput"
                  value={formData.dataInput}
                  onChange={handleInputChange}
                  placeholder='{"sales": [100, 150, 200], "region": "US"} or paste CSV data...'
                  rows={12}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none font-mono text-sm"
                  required
                />
                <p className="mt-2 text-sm text-gray-500">
                  Paste your data in JSON format, CSV, or plain text
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white px-6 py-4 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Analyzing Data...
                  </>
                ) : (
                  <>
                    <BarChart3 className="h-5 w-5" />
                    Analyze Data
                  </>
                )}
              </button>
            </form>
          </div>

          {result && (
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-green-600" />
                Analysis Results
              </h2>

              <div className="prose max-w-none">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold text-green-900 mb-2">Analysis Type</h3>
                  <p className="text-gray-700">{result.analysisType || formData.analysisType}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-6 whitespace-pre-wrap text-gray-800">
                  {result.analysis}
                </div>

                {result.usage && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Tokens Used:</span> {result.usage.tokensUsed}
                      </div>
                      <div>
                        <span className="font-medium">Cost:</span> ${result.usage.cost?.toFixed(4)}
                      </div>
                      <div>
                        <span className="font-medium">Engine:</span> {result.usage.engine}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  setResult(null);
                  setFormData({
                    dataInput: "",
                    analysisType: "comprehensive",
                  });
                }}
                className="mt-6 w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                Analyze More Data
              </button>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
