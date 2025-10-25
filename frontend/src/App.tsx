import React from 'react';
import AnalysisDashboard from './components/AnalysisDashboard';
import { ToastProvider } from './components/Toast';

const App: React.FC = () => {
  return (
    <ToastProvider>
      <AnalysisDashboard />
    </ToastProvider>
  );
};

export default App;
