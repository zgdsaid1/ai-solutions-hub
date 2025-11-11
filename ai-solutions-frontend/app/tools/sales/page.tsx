"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Target, ArrowLeft, Loader2, TrendingUp } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { callSalesTool } from "@/lib/ai-tools";
import toast, { Toaster } from "react-hot-toast";

export default function SalesToolPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    industry: "",
    product: "",
    targetCustomer: "",
    salesGoal: "",
    dealSize: "10000-50000",
    salesStage: "prospecting",
    customerInfo: "",
    painPoints: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.industry.trim()) {
      toast.error("Please enter your industry");
      return;
    }

    if (!formData.product.trim()) {
      toast.error("Please enter your product/service");
      return;
    }

    if (!formData.targetCustomer.trim()) {
      toast.error("Please describe your target customer");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const salesRequest = {
        industry: formData.industry,
        product: formData.product,
        targetCustomer: formData.targetCustomer,
        salesGoal: formData.salesGoal,
        dealSize: formData.dealSize,
        salesStage: formData.salesStage,
        customerInfo: formData.customerInfo,
        painPoints: formData.painPoints,
      };

      const response = await callSalesTool(salesRequest);

      if (response.error) {
        toast.error(response.error.message || "Failed to generate sales strategy");
        return;
      }

      setResult(response.data);
      toast.success("Sales strategy generated successfully!");
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error("Sales tool error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setFormData({
      industry: "",
      product: "",
      targetCustomer: "",
      salesGoal: "",
      dealSize: "10000-50000",
      salesStage: "prospecting",
      customerInfo: "",
      painPoints: "",
    });
  };

  return (
    <ProtectedRoute>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
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
              <div className="p-4 bg-orange-100 rounded-lg">
                <Target className="h-8 w-8 text-orange-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Sales Assistant
                </h1>
                <p className="text-gray-600">
                  AI-powered sales strategies and lead optimization
                </p>
              </div>
            </div>

            {!result ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Industry *
                    </label>
                    <input
                      type="text"
                      name="industry"
                      value={formData.industry}
                      onChange={handleInputChange}
                      placeholder="e.g., Technology, Healthcare, Finance"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Deal Size Range
                    </label>
                    <select
                      name="dealSize"
                      value={formData.dealSize}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="1000-10000">$1K - $10K</option>
                      <option value="10000-50000">$10K - $50K</option>
                      <option value="50000-100000">$50K - $100K</option>
                      <option value="100000-500000">$100K - $500K</option>
                      <option value="500000+">$500K+</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product/Service *
                  </label>
                  <input
                    type="text"
                    name="product"
                    value={formData.product}
                    onChange={handleInputChange}
                    placeholder="Describe your product or service offering"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Customer Profile *
                  </label>
                  <textarea
                    name="targetCustomer"
                    value={formData.targetCustomer}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Describe your ideal customer (company size, role, industry, demographics)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sales Stage
                    </label>
                    <select
                      name="salesStage"
                      value={formData.salesStage}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="prospecting">Prospecting</option>
                      <option value="qualification">Lead Qualification</option>
                      <option value="discovery">Discovery Call</option>
                      <option value="proposal">Proposal/Demo</option>
                      <option value="negotiation">Negotiation</option>
                      <option value="closing">Closing</option>
                      <option value="follow-up">Follow-up</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sales Goal
                    </label>
                    <input
                      type="text"
                      name="salesGoal"
                      value={formData.salesGoal}
                      onChange={handleInputChange}
                      placeholder="e.g., Close 10 deals this quarter"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                    placeholder="Any specific information about your customer or prospect"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Pain Points (Optional)
                  </label>
                  <textarea
                    name="painPoints"
                    value={formData.painPoints}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="What problems does your customer face that your product/service solves?"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 bg-orange-600 text-white py-4 px-6 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Analyzing Sales Strategy...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="h-5 w-5" />
                      Generate Sales Strategy
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Sales Strategy & Analysis</h2>
                  <button
                    onClick={handleReset}
                    className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    New Analysis
                  </button>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-lg shadow">
                      <h3 className="font-semibold text-gray-900 mb-1">Sales Stage</h3>
                      <p className="text-gray-700 capitalize">{formData.salesStage.replace('-', ' ')}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                      <h3 className="font-semibold text-gray-900 mb-1">Deal Size</h3>
                      <p className="text-gray-700">${formData.dealSize.replace('-', ' - $')}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                      <h3 className="font-semibold text-gray-900 mb-1">Success Probability</h3>
                      <p className="text-gray-700">{result?.success_probability || '75%'}</p>
                    </div>
                  </div>

                  {result?.sales_strategy && (
                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-900 mb-4">Recommended Sales Strategy</h3>
                      <div className="bg-white p-6 rounded-lg border">
                        <div className="space-y-4">
                          {result.sales_strategy.map((strategy: string, index: number) => (
                            <div key={index} className="flex items-start gap-3">
                              <span className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                                {index + 1}
                              </span>
                              <p className="text-gray-800">{strategy}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {result?.pitch_suggestions && (
                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-900 mb-4">Sales Pitch Suggestions</h3>
                      <div className="bg-white p-4 rounded-lg border">
                        <div className="space-y-3">
                          {result.pitch_suggestions.map((pitch: string, index: number) => (
                            <div key={index} className="p-3 bg-orange-50 rounded-lg">
                              <p className="text-gray-800 italic">"{pitch}"</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {result?.objection_handling && (
                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-900 mb-4">Objection Handling</h3>
                      <div className="bg-white p-4 rounded-lg border">
                        <div className="space-y-4">
                          {result.objection_handling.map((objection: any, index: number) => (
                            <div key={index} className="border-l-4 border-orange-400 pl-4">
                              <h4 className="font-medium text-gray-900 mb-2">
                                Objection: {objection.objection || `Common Objection ${index + 1}`}
                              </h4>
                              <p className="text-gray-700">
                                <strong>Response:</strong> {objection.response}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {result?.next_steps && (
                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-900 mb-4">Recommended Next Steps</h3>
                      <div className="bg-white p-4 rounded-lg border">
                        <div className="space-y-3">
                          {result.next_steps.map((step: string, index: number) => (
                            <div key={index} className="flex items-center gap-3">
                              <span className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0"></span>
                              <p className="text-gray-700">{step}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">📊 Sales Metrics & KPIs</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-blue-700 font-medium">Lead Score:</span>
                        <p className="text-blue-900">{result?.lead_score || '85/100'}</p>
                      </div>
                      <div>
                        <span className="text-blue-700 font-medium">Close Rate:</span>
                        <p className="text-blue-900">{result?.estimated_close_rate || '25%'}</p>
                      </div>
                      <div>
                        <span className="text-blue-700 font-medium">Sales Cycle:</span>
                        <p className="text-blue-900">{result?.estimated_cycle || '30-45 days'}</p>
                      </div>
                      <div>
                        <span className="text-blue-700 font-medium">Priority Level:</span>
                        <p className="text-blue-900">{result?.priority_level || 'High'}</p>
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