import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AccessibilityProvider } from './context/AccessibilityContext';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AccessibilityControls } from './components/AccessibilityControls';

// Pages
import { HomePage } from './pages/HomePage';
import { VoiceAssistantPage } from './pages/VoiceAssistantPage';
import { ScamDetectorPage } from './pages/ScamDetectorPage';
import { DocumentSaathiPage } from './pages/DocumentSaathiPage';
import { FormSaathiPage } from './pages/FormSaathiPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

export function App() {
  return (
    <AccessibilityProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-150">
            {/* Header & Navigation */}
            <Navbar />

            {/* Main Content Area */}
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/assistant" element={<VoiceAssistantPage />} />
                <Route path="/scams" element={<ScamDetectorPage />} />
                <Route path="/documents" element={<DocumentSaathiPage />} />
                <Route path="/forms" element={<FormSaathiPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            {/* Global Floating Accessibility Quick-Drawer */}
            <AccessibilityControls />

            {/* Accessible Footer */}
            <Footer />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </AccessibilityProvider>
  );
}

export default App;
