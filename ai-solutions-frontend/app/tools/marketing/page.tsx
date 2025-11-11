"use client";

import { useRouter } from "next/navigation";
import { TrendingUp, ArrowLeft } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function MarketingToolPage() {
  const router = useRouter();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        {/* Header */}
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

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Tool Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 bg-blue-100 rounded-lg">
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Marketing Strategist
                </h1>
                <p className="text-gray-600">
                  Generate comprehensive marketing campaigns and strategies
                </p>
              </div>
            </div>

            {/* Coming Soon Message */}
            <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
              <h2 className="text-xl font-semibold text-blue-900 mb-2">
                Tool Interface Coming Soon
              </h2>
              <p className="text-blue-700">
                The interactive tool interface will be available in the next phase of development. 
                This will include input forms, AI processing, and results display.
              </p>
            </div>

            {/* Tool Features Preview */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                What This Tool Will Do:
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <svg className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Market overview and size analysis</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Competitive landscape analysis</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Target audience insights</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Marketing strategy recommendations</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Budget allocation suggestions</span>
                </li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
