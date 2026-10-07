import { useState } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { PageHeader } from '../components/ui/PageHeader';
import { DATA_SOURCE_MODE, isSupabaseConfigured } from '../config/env';
import { useDataset } from '../context/DatasetContext';
import {
  getOpenAIApiKey,
  hasOpenAIApiKey,
  setOpenAIApiKey,
  testOpenAIConnection,
} from '../services/aiService';

interface BugTicket {
  id: string;
  category: 'Platform Sync' | 'Database RLS' | 'Telemetry' | 'Student Profile';
  description: string;
  severity: 'Critical' | 'Medium' | 'Low';
  status: 'Open' | 'In Progress' | 'Resolved';
  reportedAt: string;
}

const INITIAL_BUGS: BugTicket[] = [
  {
    id: 'BUG-101',
    category: 'Platform Sync',
    description: 'LeetCode public endpoint rate-limiting detected during bulk sync. Backoff retry mechanism required.',
    severity: 'Medium',
    status: 'In Progress',
    reportedAt: '2026-10-07 14:20',
  },
  {
    id: 'BUG-102',
    category: 'Student Profile',
    description: 'Candidate SYN-0018 changed HackerRank handle. Platform crawler returned 404 until manual handle update.',
    severity: 'Low',
    status: 'Open',
    reportedAt: '2026-10-07 17:05',
  },
  {
    id: 'BUG-103',
    category: 'Database RLS',
    description: 'Staff policy requires valid JWT token for bulk assignment insert in Supabase live mode.',
    severity: 'Critical',
    status: 'Resolved',
    reportedAt: '2026-10-06 09:15',
  },
];

export function AdminConsolePage() {
  const { dataset, reload } = useDataset();
  const [bugs, setBugs] = useState<BugTicket[]>(INITIAL_BUGS);
  const [apiKeyInput, setApiKeyInput] = useState(getOpenAIApiKey());
  const [testingAi, setTestingAi] = useState(false);
  const [aiTestResult, setAiTestResult] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'running' | 'success'>('idle');

  // Bug ticket creation state
  const [newDesc, setNewDesc] = useState('');
  const [newCat, setNewCat] = useState<BugTicket['category']>('Platform Sync');
  const [newSev, setNewSev] = useState<BugTicket['severity']>('Medium');

  function handleResolveBug(id: string) {
    setBugs((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: 'Resolved' } : b))
    );
  }

  function handleCreateBug(e: React.FormEvent) {
    e.preventDefault();
    if (!newDesc.trim()) return;
    const ticket: BugTicket = {
      id: `BUG-${100 + bugs.length + 1}`,
      category: newCat,
      description: newDesc.trim(),
      severity: newSev,
      status: 'Open',
      reportedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };
    setBugs([ticket, ...bugs]);
    setNewDesc('');
  }

  async function handleTestAiKey() {
    setTestingAi(true);
    setOpenAIApiKey(apiKeyInput);
    try {
      const res = await testOpenAIConnection(apiKeyInput);
      setAiTestResult(res.message);
    } finally {
      setTestingAi(false);
    }
  }

  function triggerMockSync() {
    setSyncStatus('running');
    setTimeout(() => {
      setSyncStatus('success');
      setTimeout(() => setSyncStatus('idle'), 3000);
    }, 1500);
  }

  const isAiConnected = hasOpenAIApiKey();
  const isSupabaseLive = isSupabaseConfigured();

  return (
    <>
      <PageHeader
        title="Admin Console & System Diagnostics"
        subtitle="Placement administration, platform sync controls, bug resolution hub, and API health telemetry."
      />

      {/* Diagnostics Cards */}
      <div className="stats-breakdown-row">
        <GlassCard className="stat-counter-card">
          <span className="stat-counter-title">Database Mode</span>
          <div className="stat-counter-value stat-counter-value--total">
            {DATA_SOURCE_MODE.toUpperCase()}
          </div>
          <span className="stat-counter-sub">
            {isSupabaseLive ? '🟢 Supabase PostgreSQL Connected' : '🟡 Synthetic Standalone Mode'}
          </span>
        </GlassCard>

        <GlassCard className="stat-counter-card">
          <span className="stat-counter-title">OpenAI AI Engine</span>
          <div className="stat-counter-value stat-counter-value--easy">
            {isAiConnected ? 'ONLINE' : 'HEURISTIC'}
          </div>
          <span className="stat-counter-sub">
            {isAiConnected ? '🟢 Live GPT-4o Mini connected' : '⚪ Local intelligent analysis active'}
          </span>
        </GlassCard>

        <GlassCard className="stat-counter-card">
          <span className="stat-counter-title">Students Monitored</span>
          <div className="stat-counter-value stat-counter-value--medium">
            {dataset ? dataset.students.length : 0}
          </div>
          <span className="stat-counter-sub">Across LeetCode & HackerRank</span>
        </GlassCard>

        <GlassCard className="stat-counter-card">
          <span className="stat-counter-title">Open Bug Tickets</span>
          <div className="stat-counter-value stat-counter-value--hard">
            {bugs.filter((b) => b.status !== 'Resolved').length}
          </div>
          <span className="stat-counter-sub">
            {bugs.filter((b) => b.severity === 'Critical').length} critical issues
          </span>
        </GlassCard>
      </div>

      {/* Platform Crawler & Sync Controls */}
      <GlassCard
        title="Platform Sync Telemetry"
        description="Monitor automated LeetCode and HackerRank sync pipelines."
      >
        <div className="sync-control-row">
          <div className="sync-service-status">
            <div className="service-dot service-dot--active" />
            <div>
              <strong>LeetCode Pipeline:</strong> Active (Sync interval: 6h)
            </div>
          </div>
          <div className="sync-service-status">
            <div className="service-dot service-dot--active" />
            <div>
              <strong>HackerRank Pipeline:</strong> Active (Sync interval: 6h)
            </div>
          </div>
          <button
            type="button"
            className="btn btn--primary"
            onClick={triggerMockSync}
            disabled={syncStatus === 'running'}
          >
            {syncStatus === 'running'
              ? 'Syncing All Handles...'
              : syncStatus === 'success'
              ? '✓ Sync Completed!'
              : '🔄 Trigger Immediate Sync'}
          </button>
        </div>
      </GlassCard>

      {/* Bug Rectification & Ticket Resolution Console */}
      <GlassCard
        title="Bug Rectification & Error Resolution Hub"
        description="Inspect system exceptions, platform crawler warnings, and candidate profile anomalies. Mark resolved directly."
      >
        <div className="table-responsive">
          <table className="glass-table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Category</th>
                <th>Description</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Reported</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {bugs.map((ticket) => (
                <tr key={ticket.id}>
                  <td className="font-semibold">{ticket.id}</td>
                  <td>
                    <span className="badge-pill">{ticket.category}</span>
                  </td>
                  <td className="bug-desc-cell">{ticket.description}</td>
                  <td>
                    <span
                      className={`diff-tag ${
                        ticket.severity === 'Critical'
                          ? 'diff-tag--hard'
                          : ticket.severity === 'Medium'
                          ? 'diff-tag--medium'
                          : 'diff-tag--easy'
                      }`}
                    >
                      {ticket.severity}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`status-pill status-pill--${
                        ticket.status === 'Resolved'
                          ? 'completed'
                          : ticket.status === 'In Progress'
                          ? 'partial'
                          : 'missing'
                      }`}
                    >
                      {ticket.status}
                    </span>
                  </td>
                  <td className="text-muted-cell">{ticket.reportedAt}</td>
                  <td>
                    {ticket.status !== 'Resolved' ? (
                      <button
                        type="button"
                        className="btn btn--small btn--primary"
                        onClick={() => handleResolveBug(ticket.id)}
                      >
                        ✓ Mark Resolved
                      </button>
                    ) : (
                      <span className="text-muted-cell">Resolved</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Quick Log New Issue Form */}
        <div className="report-issue-form-wrap">
          <h4 className="subgrid-heading">Report New Platform / System Issue</h4>
          <form className="report-issue-form" onSubmit={handleCreateBug}>
            <input
              type="text"
              className="glass-input issue-desc-input"
              placeholder="Describe error or crawler discrepancy..."
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
            />
            <select
              className="glass-select"
              value={newCat}
              onChange={(e) => setNewCat(e.target.value as any)}
            >
              <option value="Platform Sync">Platform Sync</option>
              <option value="Database RLS">Database RLS</option>
              <option value="Telemetry">Telemetry</option>
              <option value="Student Profile">Student Profile</option>
            </select>
            <select
              className="glass-select"
              value={newSev}
              onChange={(e) => setNewSev(e.target.value as any)}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="Critical">Critical</option>
            </select>
            <button type="submit" className="btn btn--secondary">
              + Log Issue
            </button>
          </form>
        </div>
      </GlassCard>

      {/* API Key & Database Settings */}
      <div className="admin-config-grid">
        <GlassCard
          title="OpenAI API Integration Configuration"
          description="Save API key to connect live GPT-4o analysis for student code and anomalies."
        >
          <div className="field-group">
            <label>API Key (sk-...)</label>
            <input
              type="password"
              className="glass-input"
              placeholder="sk-proj-..."
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
            />
          </div>
          <div className="modal-actions">
            <button
              type="button"
              className="btn btn--primary"
              onClick={handleTestAiKey}
              disabled={testingAi}
            >
              {testingAi ? 'Testing Key...' : 'Save & Verify Key'}
            </button>
            {apiKeyInput && (
              <button
                type="button"
                className="btn btn--secondary"
                onClick={() => {
                  setApiKeyInput('');
                  setOpenAIApiKey('');
                  setAiTestResult('API key cleared.');
                }}
              >
                Clear
              </button>
            )}
          </div>
          {aiTestResult && <div className="key-status-msg">{aiTestResult}</div>}
        </GlassCard>

        <GlassCard
          title="Dataset & Cache Management"
          description="Control memory buffers and reload database state."
        >
          <p className="settings-desc">
            CodeChecker is designed to operate seamlessly in both zero-configuration synthetic demo mode
            and high-scale Supabase PostgreSQL production environments.
          </p>
          <div className="modal-actions" style={{ marginTop: '1.25rem' }}>
            <button type="button" className="btn btn--secondary" onClick={() => reload()}>
              🔄 Reload Active Dataset
            </button>
          </div>
        </GlassCard>
      </div>
    </>
  );
}
