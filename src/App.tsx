import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Landing from '@/pages/Landing';
import About from '@/pages/About';
import Features from '@/pages/Features';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import Dashboard from '@/pages/Dashboard';
import MarketingModule from '@/pages/MarketingModule';
import LegalAdvisorModule from '@/pages/LegalAdvisorModule';
import DataAnalyzerModule from '@/pages/DataAnalyzerModule';
import InventoryTrackerModule from '@/pages/InventoryTrackerModule';
import EmailAssistantModule from '@/pages/EmailAssistantModule';
import LogisticsModule from '@/pages/LogisticsModule';
import VoiceSMSModule from '@/pages/VoiceSMSModule';
import DocumentAutomationModule from '@/pages/DocumentAutomationModule';
import SubscriptionModule from '@/pages/SubscriptionModule';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/about" element={<About />} />
          <Route path="/features" element={<Features />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/marketing"
            element={
              <ProtectedRoute>
                <MarketingModule />
              </ProtectedRoute>
            }
          />
          <Route
            path="/legal"
            element={
              <ProtectedRoute>
                <LegalAdvisorModule />
              </ProtectedRoute>
            }
          />
          <Route
            path="/data-analyzer"
            element={
              <ProtectedRoute>
                <DataAnalyzerModule />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory"
            element={
              <ProtectedRoute>
                <InventoryTrackerModule />
              </ProtectedRoute>
            }
          />
          <Route
            path="/email-assistant"
            element={
              <ProtectedRoute>
                <EmailAssistantModule />
              </ProtectedRoute>
            }
          />
          <Route
            path="/logistics"
            element={
              <ProtectedRoute>
                <LogisticsModule />
              </ProtectedRoute>
            }
          />
          <Route
            path="/voice-sms"
            element={
              <ProtectedRoute>
                <VoiceSMSModule />
              </ProtectedRoute>
            }
          />
          <Route
            path="/document-automation"
            element={
              <ProtectedRoute>
                <DocumentAutomationModule />
              </ProtectedRoute>
            }
          />
          <Route
            path="/subscription"
            element={
              <ProtectedRoute>
                <SubscriptionModule />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
