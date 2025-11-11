"use client";

import ProtectedRoute from "@/components/ProtectedRoute";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b p-4">
          <h1 className="text-xl font-semibold">Dashboard</h1>
        </header>

        {/* محتوى الصفحة */}
        <main className="p-6">
          <p className="text-gray-700">
            مرحبًا بك في لوحة التحكم ✅
          </p>
        </main>
      </div>
    </ProtectedRoute>
  );
}