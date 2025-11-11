"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, ArrowLeft, Loader2, Bot } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { callSupportTool } from "@/lib/ai-tools";
import { saveResult, exportResult, downloadExportedResult } from "@/lib/results";
import toast, { Toaster } from "react-hot-toast";

export default function SupportToolPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [savedResultId, setSavedResultId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    customerQuery: "",
    customerInfo: "",
    productService: "",
    urgencyLevel: "medium",
    issueCategory: "general",
    previousInteractions: "",
    customerType: "existing",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customerQuery.trim()) {
      toast.error("Please enter the customer query");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const supportRequest = {
        query: formData.customerQuery,
        customer_info: formData.customerInfo,
        product_service: formData.productService,
        urgency_level: formData.urgencyLevel,
        issue_category: formData.issueCategory,
        previous_interactions: formData.previousInteractions,
        customer_type: formData.customerType,
      };

      const response = await callSupportTool(supportRequest);

      if (response.error) {
        toast.error(response.error.message || "Failed to process support request");
        return;
      }

      setResult(response.data);
      setSavedResultId(null); // Reset saved state for new result
      toast.success("Support analysis completed successfully!");
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error("Support tool error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setFormData({
      customerQuery: "",
      customerInfo: "",
      productService: "",
      urgencyLevel: "medium",
      issueCategory: "general",
      previousInteractions: "",
      customerType: "existing",
    });
  };

  const handleSave = async () => {
    if (!result) return;

    setSaving(true);
    try {
      const saved = await saveResult({
        toolName: "Customer Support Bot",
        toolType: "support",
        inputData: formData,
        outputData: result,
        title: `Customer Support Bot Result - ${new Date().toLocaleDateString()}`,
        description: `Result from Customer Support Bot`,
        tags: ["support"],
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
      downloadExportedResult(blob, `support_result.${format}`);
      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to export result");
    }
  };

  return (
    <ProtectedRoute>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
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

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 bg-indigo-100 rounded-lg">
                <MessageCircle className="h-8 w-8 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Customer Support Bot
                </h1>
                <p className="text-gray-600">
                  Intelligent customer service automation and support
                </p>
              </div>
            </div>

            {!result ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Query/Issue *
                  </label>
                  <textarea
                    name="customerQuery"
                    value={formData.customerQuery}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Describe the customer's question, complaint, or issue..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Issue Category
                    </label>
                    <select
                      name="issueCategory"
                      value={formData.issueCategory}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="general">General Inquiry</option>
                      <option value="technical">Technical Issue</option>
                      <option value="billing">Billing/Payment</option>
                      <option value="account">Account Management</option>
                      <option value="product">Product Support</option>
                      <option value="shipping">Shipping/Delivery</option>
                      <option value="returns">Returns/Refunds</option>
                      <option value="complaint">Complaint/Feedback</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Urgency Level
                    </label>
                    <select
                      name="urgencyLevel"
                      value={formData.urgencyLevel}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="low">Low - General Question</option>
                      <option value="medium">Medium - Standard Support</option>
                      <option value="high">High - Urgent Issue</option>
                      <option value="critical">Critical - System Down</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Customer Type
                    </label>
                    <select
                      name="customerType"
                      value={formData.customerType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="existing">Existing Customer</option>
                      <option value="new">New Customer</option>
                      <option value="prospect">Potential Customer</option>
                      <option value="premium">Premium/VIP Customer</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product/Service (Optional)
                    </label>
                    <input
                      type="text"
                      name="productService"
                      value={formData.productService}
                      onChange={handleInputChange}
                      placeholder="Specific product or service related to the issue"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Information (Optional)
                  </label>
                  <textarea
                    name="customerInfo"
                    value={formData.customerInfo}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Additional customer context (account info, subscription details, etc.)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Previous Interactions (Optional)
                  </label>
                  <textarea
                    name="previousInteractions"
                    value={formData.previousInteractions}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Any relevant previous support interactions or ticket history"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 bg-indigo-600 text-white py-4 px-6 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Processing Support Request...
                    </>
                  ) : (
                    <>
                      <Bot className="h-5 w-5" />
                      Analyze & Generate Response
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Support Analysis & Response</h2>
                  <button
                    onClick={handleReset}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    New Support Request
                  </button>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-lg shadow">
                      <h3 className="font-semibold text-gray-900 mb-1">Issue Category</h3>
                      <p className="text-gray-700 capitalize">{formData.issueCategory.replace('-', ' ')}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                      <h3 className="font-semibold text-gray-900 mb-1">Priority Level</h3>
                      <p className={`font-medium ${
                        formData.urgencyLevel === 'critical' ? 'text-red-600' :
                        formData.urgencyLevel === 'high' ? 'text-orange-600' :
                        formData.urgencyLevel === 'medium' ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {formData.urgencyLevel.toUpperCase()}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                      <h3 className="font-semibold text-gray-900 mb-1">Response Time</h3>
                      <p className="text-gray-700">{result?.estimated_response_time || '< 2 hours'}</p>
                    </div>
                  </div>

                  {result?.recommended_response && (
                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-900 mb-4">Recommended Response</h3>
                      <div className="bg-white p-6 rounded-lg border">
                        <div className="prose prose-gray max-w-none">
                          <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                            {result.recommended_response}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {result?.resolution_steps && (
                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-900 mb-4">Resolution Steps</h3>
                      <div className="bg-white p-4 rounded-lg border">
                        <div className="space-y-3">
                          {result.resolution_steps.map((step: string, index: number) => (
                            <div key={index} className="flex items-start gap-3">
                              <span className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                                {index + 1}
                              </span>
                              <p className="text-gray-800">{step}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {result?.escalation_recommendations && (
                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-900 mb-4">Escalation Guidelines</h3>
                      <div className="bg-white p-4 rounded-lg border">
                        <div className="space-y-2">
                          {result.escalation_recommendations.map((rec: string, index: number) => (
                            <div key={index} className="flex items-start gap-2">
                              <span className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></span>
                              <p className="text-gray-700">{rec}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {result?.follow_up_actions && (
                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-900 mb-4">Follow-up Actions</h3>
                      <div className="bg-white p-4 rounded-lg border">
                        <div className="space-y-3">
                          {result.follow_up_actions.map((action: string, index: number) => (
                            <div key={index} className="flex items-center gap-3">
                              <input type="checkbox" className="w-4 h-4 text-indigo-600 rounded" />
                              <span className="text-gray-700">{action}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {result?.knowledge_base_articles && (
                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-900 mb-4">Related Knowledge Base Articles</h3>
                      <div className="bg-white p-4 rounded-lg border">
                        <div className="space-y-3">
                          {result.knowledge_base_articles.map((article: any, index: number) => (
                            <div key={index} className="p-3 border-l-4 border-indigo-300 bg-indigo-50">
                              <h4 className="font-medium text-indigo-900">
                                {article.title || `Article ${index + 1}`}
                              </h4>
                              <p className="text-indigo-700 text-sm mt-1">
                                {article.summary || article.url || "Related support documentation"}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">🎯 Support Metrics</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-blue-700 font-medium">Satisfaction Score:</span>
                        <p className="text-blue-900">{result?.satisfaction_prediction || '4.2/5'}</p>
                      </div>
                      <div>
                        <span className="text-blue-700 font-medium">Resolution Rate:</span>
                        <p className="text-blue-900">{result?.resolution_probability || '92%'}</p>
                      </div>
                      <div>
                        <span className="text-blue-700 font-medium">First Contact:</span>
                        <p className="text-blue-900">{result?.first_contact_resolution || '78%'}</p>
                      </div>
                      <div>
                        <span className="text-blue-700 font-medium">Complexity:</span>
                        <p className="text-blue-900">{result?.complexity_level || 'Medium'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}