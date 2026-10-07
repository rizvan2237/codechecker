import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { DemoModeBanner } from './DemoModeBanner';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { AiModal } from '../ai/AiModal';

/** The frame around every page: sidebar on the left, top bar and content on the right. */
export function AppLayout() {
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar onOpenAiModal={() => setIsAiModalOpen(true)} />
      <div className="app-main">
        <TopBar onOpenAiModal={() => setIsAiModalOpen(true)} />
        <DemoModeBanner />
        <main className="page-content">
          <Outlet />
        </main>
      </div>

      <AiModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
      />
    </div>
  );
}
