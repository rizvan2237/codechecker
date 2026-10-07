import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDataset } from '../../context/DatasetContext';
import { usePortal } from '../../context/PortalContext';
import { hasOpenAIApiKey } from '../../services/aiService';
import { SearchInput } from '../ui/SearchInput';
import { SourceBadge } from '../ui/SourceBadge';

interface TopBarProps {
  onOpenAiModal?: () => void;
}

export function TopBar({ onOpenAiModal }: TopBarProps) {
  const navigate = useNavigate();
  const { dataset } = useDataset();
  const { mode, toggleMode } = usePortal();
  const [query, setQuery] = useState<string>('');
  const isAiActive = hasOpenAIApiKey();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedQuery = query.trim();
    navigate(
      trimmedQuery.length > 0
        ? `/students?search=${encodeURIComponent(trimmedQuery)}`
        : '/students'
    );
  }

  return (
    <header className="topbar glass-panel">
      <form className="topbar__search" onSubmit={handleSubmit} role="search">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search candidates by name, roll no, or handle..."
        />
      </form>

      <div className="topbar__actions">
        {/* Portal Switcher Pill */}
        <button
          type="button"
          className="portal-badge-btn"
          onClick={toggleMode}
          title="Toggle Portal Mode (Admin vs Candidate)"
        >
          <span className="portal-badge-indicator" />
          <span className="portal-badge-text">
            {mode === 'admin' ? '🛡️ Admin Portal' : '🎓 Candidate Portal'}
          </span>
          <span className="portal-badge-action-hint">Switch</span>
        </button>

        {/* AI Engine Status Button */}
        {onOpenAiModal && (
          <button
            type="button"
            className={`ai-status-pill ${isAiActive ? 'ai-status-pill--active' : ''}`}
            onClick={onOpenAiModal}
            title="Open AI Code Review & Intelligence Engine"
          >
            <span className="ai-spark-dot" />
            <span>{isAiActive ? 'OpenAI GPT-4' : 'AI Assistant'}</span>
          </button>
        )}

        {dataset !== null && <SourceBadge source={dataset.source} />}
      </div>
    </header>
  );
}
