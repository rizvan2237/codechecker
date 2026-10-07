import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { DatasetProvider } from './context/DatasetContext';
import { PortalProvider, usePortal } from './context/PortalContext';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AssignmentsPage } from './pages/AssignmentsPage';
import { DashboardPage } from './pages/DashboardPage';
import { CandidateDashboardPage } from './pages/CandidateDashboardPage';
import { PlatformCheckerPage } from './pages/PlatformCheckerPage';
import { AdminConsolePage } from './pages/AdminConsolePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { StudentDetailsPage } from './pages/StudentDetailsPage';
import { StudentsPage } from './pages/StudentsPage';

/**
 * Root route that adapts based on the active portal mode (Admin vs Candidate).
 */
function RootDispatcher() {
  const { mode } = usePortal();
  return mode === 'candidate' ? <CandidateDashboardPage /> : <DashboardPage />;
}

/** Route table. Every page sits inside AppLayout. */
export function App() {
  return (
    <BrowserRouter>
      <PortalProvider>
        <DatasetProvider>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<RootDispatcher />} />
              <Route path="/my-portal" element={<CandidateDashboardPage />} />
              <Route path="/checker" element={<PlatformCheckerPage />} />
              <Route path="/students" element={<StudentsPage />} />
              <Route path="/students/:studentId" element={<StudentDetailsPage />} />
              <Route path="/assignments" element={<AssignmentsPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/admin-console" element={<AdminConsolePage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </DatasetProvider>
      </PortalProvider>
    </BrowserRouter>
  );
}
