import { useState } from 'react';
import { DATA_SOURCE_MODE, isSupabaseConfigured } from '../config/env';
import { SYNTHETIC_STUDENT_COUNT } from '../config/constants';
import { useDataset } from '../context/DatasetContext';
import { GlassCard } from '../components/ui/GlassCard';
import { PageHeader } from '../components/ui/PageHeader';
import {
  getOpenAIApiKey,
  hasOpenAIApiKey,
  setOpenAIApiKey,
  testOpenAIConnection,
} from '../services/aiService';

export function SettingsPage() {
  const { dataset, isLoading } = useDataset();
  const loadedSource = dataset === null ? (isLoading ? 'Loading...' : 'Not loaded') : dataset.source;

  const [apiKeyInput, setApiKeyInput] = useState(getOpenAIApiKey());
  const [testingAi, setTestingAi] = useState(false);
  const [testResult, setTestResult] = useState<{ status: 'idle' | 'success' | 'error'; message: string }>({
    status: 'idle',
    message: '',
  });

  async function handleSaveKey() {
    setOpenAIApiKey(apiKeyInput);
    if (!apiKeyInput.trim()) {
      setTestResult({ status: 'idle', message: 'API key cleared. System reverted to local heuristic AI mode.' });
      return;
    }

    setTestingAi(true);
    try {
      const res = await testOpenAIConnection(apiKeyInput);
      if (res.success) {
        setTestResult({ status: 'success', message: '✓ Key valid! OpenAI GPT-4o connection active.' });
      } else {
        setTestResult({ status: 'error', message: `✗ Connection failed: ${res.message}` });
      }
    } finally {
      setTestingAi(false);
    }
  }

  const isAiConfigured = hasOpenAIApiKey();

  return (
    <>
      <PageHeader
        title="Settings & Integrations"
        subtitle="Configure OpenAI API keys, database providers, and platform synchronization."
      />

      {/* OpenAI Configuration */}
      <GlassCard
        title="OpenAI API Integration"
        description="Connect OpenAI to power real-time algorithmic code analysis, Big-O calculation, and anomaly detection."
      >
        <div className="meta-list" style={{ marginBottom: '1.25rem' }}>
          <div className="meta-item">
            <span className="meta-item__label">AI Engine Status</span>
            <span className="meta-item__value">
              {isAiConfigured ? '🟢 Live GPT-4o Mini (Connected)' : '⚪ Heuristic Fallback Engine'}
            </span>
          </div>
          <div className="meta-item">
            <span className="meta-item__label">Saved API Key</span>
            <span className="meta-item__value">
              {isAiConfigured ? '••••••••••••••••' + apiKeyInput.slice(-4) : 'Not configured'}
            </span>
          </div>
        </div>

        <div className="field-group">
          <label>OpenAI Secret Key (sk-...)</label>
          <input
            type="password"
            className="glass-input"
            placeholder="Paste your OpenAI API key here..."
            value={apiKeyInput}
            onChange={(e) => setApiKeyInput(e.target.value)}
          />
        </div>

        <div className="modal-actions" style={{ marginTop: '1rem' }}>
          <button
            type="button"
            className="btn btn--primary"
            onClick={handleSaveKey}
            disabled={testingAi}
          >
            {testingAi ? 'Verifying with OpenAI...' : 'Save & Verify Key'}
          </button>
          {apiKeyInput && (
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => {
                setApiKeyInput('');
                setOpenAIApiKey('');
                setTestResult({ status: 'idle', message: 'API key removed.' });
              }}
            >
              Clear Key
            </button>
          )}
        </div>

        {testResult.message && (
          <div
            className={`key-status-msg ${
              testResult.status === 'success'
                ? 'key-status-msg--success'
                : testResult.status === 'error'
                ? 'key-status-msg--error'
                : ''
            }`}
            style={{ marginTop: '1rem' }}
          >
            {testResult.message}
          </div>
        )}
      </GlassCard>

      {/* Database Status */}
      <GlassCard title="Data Source & Supabase Connection">
        <div className="meta-list">
          <div className="meta-item">
            <span className="meta-item__label">Configured source</span>
            <span className="meta-item__value">{DATA_SOURCE_MODE}</span>
          </div>
          <div className="meta-item">
            <span className="meta-item__label">Loaded source</span>
            <span className="meta-item__value">{loadedSource}</span>
          </div>
          <div className="meta-item">
            <span className="meta-item__label">Supabase connection</span>
            <span className="meta-item__value">
              {isSupabaseConfigured() ? '🟢 Configured' : '⚪ Standalone Synthetic Mode'}
            </span>
          </div>
          <div className="meta-item">
            <span className="meta-item__label">Monitored candidates</span>
            <span className="meta-item__value">{SYNTHETIC_STUDENT_COUNT}</span>
          </div>
        </div>
      </GlassCard>

      <GlassCard
        title="Production Deployment Guide"
        description="How to connect live Supabase PostgreSQL and deploy to Vercel."
      >
        <ol className="plain-steps">
          <li>Create a free PostgreSQL project at https://supabase.com.</li>
          <li>
            Run the SQL migration files in <code>supabase/migrations/</code> in order (001 then 002).
          </li>
          <li>
            Add <code>VITE_DATA_SOURCE=supabase</code>, <code>VITE_SUPABASE_URL</code>, and{' '}
            <code>VITE_SUPABASE_ANON_KEY</code> to your environment.
          </li>
          <li>
            For live OpenAI integration, set <code>VITE_OPENAI_API_KEY</code> or input it directly above.
          </li>
          <li>
            Deploy to Vercel with <code>vercel --prod</code>.
          </li>
        </ol>
      </GlassCard>
    </>
  );
}
