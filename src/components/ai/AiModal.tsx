import { useState } from 'react';
import {
  analyzeCodeSnippet,
  explainSubmissionAnomaly,
  getOpenAIApiKey,
  hasOpenAIApiKey,
  setOpenAIApiKey,
  testOpenAIConnection,
  type AnomalyExplanationResult,
  type CodeAnalysisResult,
} from '../../services/aiService';

interface AiModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCode?: string;
  initialProblem?: string;
  initialLanguage?: string;
}

export function AiModal({
  isOpen,
  onClose,
  initialCode = `def twoSum(nums, target):\n    lookup = {}\n    for i, num in enumerate(nums):\n        diff = target - num\n        if diff in lookup:\n            return [lookup[diff], i]\n        lookup[num] = i\n    return []`,
  initialProblem = 'Two Sum',
  initialLanguage = 'Python',
}: AiModalProps) {
  const [activeTab, setActiveTab] = useState<'code' | 'anomaly' | 'settings'>('code');

  // Code analysis state
  const [code, setCode] = useState(initialCode);
  const [problemTitle, setProblemTitle] = useState(initialProblem);
  const [language, setLanguage] = useState(initialLanguage);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<CodeAnalysisResult | null>(null);

  // Anomaly state
  const [studentName, setStudentName] = useState('Candidate SYN-0001');
  const [anomalyNote, setAnomalyNote] = useState('First attempt solve on Hard problem in under 45 seconds');
  const [anomalyLoading, setAnomalyLoading] = useState(false);
  const [anomalyResult, setAnomalyResult] = useState<AnomalyExplanationResult | null>(null);

  // Key settings state
  const [apiKeyInput, setApiKeyInput] = useState(getOpenAIApiKey());
  const [keyTestStatus, setKeyTestStatus] = useState<{ status: 'idle' | 'testing' | 'success' | 'error'; message: string }>({
    status: 'idle',
    message: '',
  });

  if (!isOpen) return null;

  async function handleRunCodeAnalysis() {
    setAnalysisLoading(true);
    try {
      const res = await analyzeCodeSnippet({
        code,
        problemTitle,
        language,
      });
      setAnalysisResult(res);
    } catch (_e) {
      // Handled in service
    } finally {
      setAnalysisLoading(false);
    }
  }

  async function handleRunAnomalyExplanation() {
    setAnomalyLoading(true);
    try {
      const res = await explainSubmissionAnomaly({
        studentName,
        problemTitle,
        problemDifficulty: 'Hard',
        language,
        note: anomalyNote,
      });
      setAnomalyResult(res);
    } catch (_e) {
      // Handled in service
    } finally {
      setAnomalyLoading(false);
    }
  }

  async function handleSaveAndTestKey() {
    setOpenAIApiKey(apiKeyInput);
    if (!apiKeyInput.trim()) {
      setKeyTestStatus({ status: 'idle', message: 'API Key cleared. Running in standard heuristic mode.' });
      return;
    }

    setKeyTestStatus({ status: 'testing', message: 'Testing OpenAI connection...' });
    const res = await testOpenAIConnection(apiKeyInput);
    if (res.success) {
      setKeyTestStatus({ status: 'success', message: '✓ Key verified! Live OpenAI GPT-4 connection active.' });
    } else {
      setKeyTestStatus({ status: 'error', message: `✗ Connection failed: ${res.message}` });
    }
  }

  const isKeyActive = hasOpenAIApiKey();

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card glass-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="ai-badge-chip">
              <span className="ai-spark-dot" /> AI Engine
            </span>
            <h2 className="modal-title">Code Analysis & Intelligence Assistant</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close dialog">
            ✕
          </button>
        </div>

        <div className="modal-tabs">
          <button
            className={`modal-tab ${activeTab === 'code' ? 'modal-tab--active' : ''}`}
            onClick={() => setActiveTab('code')}
          >
            💻 Code Complexity Review
          </button>
          <button
            className={`modal-tab ${activeTab === 'anomaly' ? 'modal-tab--active' : ''}`}
            onClick={() => setActiveTab('anomaly')}
          >
            🛡️ Anomaly & Integrity Explainer
          </button>
          <button
            className={`modal-tab ${activeTab === 'settings' ? 'modal-tab--active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            ⚙️ OpenAI API Key {isKeyActive ? '🟢' : '⚪'}
          </button>
        </div>

        <div className="modal-body">
          {activeTab === 'code' && (
            <div className="ai-code-section">
              <div className="ai-row-inputs">
                <div className="field-group">
                  <label>Problem Title</label>
                  <input
                    type="text"
                    className="glass-input"
                    value={problemTitle}
                    onChange={(e) => setProblemTitle(e.target.value)}
                  />
                </div>
                <div className="field-group">
                  <label>Language</label>
                  <select
                    className="glass-select"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                  >
                    <option value="Python">Python</option>
                    <option value="Java">Java</option>
                    <option value="C++">C++</option>
                    <option value="JavaScript">JavaScript</option>
                    <option value="TypeScript">TypeScript</option>
                  </select>
                </div>
              </div>

              <div className="field-group">
                <label>Code Snippet / Submission</label>
                <textarea
                  className="glass-textarea code-editor-font"
                  rows={7}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Paste candidate solution code here..."
                />
              </div>

              <div className="modal-actions">
                <button
                  className="btn btn--primary"
                  onClick={handleRunCodeAnalysis}
                  disabled={analysisLoading}
                >
                  {analysisLoading ? 'Analyzing Algorithm...' : '⚡ Run AI Code Check'}
                </button>
                <span className="engine-status-hint">
                  {isKeyActive ? '🟢 Live GPT-4o Mode' : '💡 Local Heuristic Mode (Add OpenAI Key for Live API)'}
                </span>
              </div>

              {analysisResult && (
                <div className="analysis-result-panel glass-panel">
                  <div className="result-metric-grid">
                    <div className="result-metric">
                      <span className="metric-tag">Time Complexity</span>
                      <strong className="metric-val">{analysisResult.timeComplexity}</strong>
                    </div>
                    <div className="result-metric">
                      <span className="metric-tag">Space Complexity</span>
                      <strong className="metric-val">{analysisResult.spaceComplexity}</strong>
                    </div>
                    <div className="result-metric">
                      <span className="metric-tag">Code Rating</span>
                      <strong className="metric-val">{analysisResult.ratingOutOf10} / 10</strong>
                    </div>
                  </div>

                  <p className="analysis-summary">{analysisResult.summary}</p>

                  <div className="analysis-subgrid">
                    <div>
                      <h4 className="subgrid-heading">🚀 Optimization Opportunities</h4>
                      <ul className="subgrid-list">
                        {analysisResult.optimizations.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="subgrid-heading">🛡️ Edge Cases Handled</h4>
                      <ul className="subgrid-list">
                        {analysisResult.edgeCases.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'anomaly' && (
            <div className="ai-anomaly-section">
              <div className="field-group">
                <label>Candidate Name / ID</label>
                <input
                  type="text"
                  className="glass-input"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                />
              </div>
              <div className="field-group">
                <label>Flagged Behavior / Reason</label>
                <input
                  type="text"
                  className="glass-input"
                  value={anomalyNote}
                  onChange={(e) => setAnomalyNote(e.target.value)}
                />
              </div>

              <div className="modal-actions">
                <button
                  className="btn btn--primary"
                  onClick={handleRunAnomalyExplanation}
                  disabled={anomalyLoading}
                >
                  {anomalyLoading ? 'Generating Mentor Report...' : '🔍 Investigate Pattern'}
                </button>
              </div>

              {anomalyResult && (
                <div className="analysis-result-panel glass-panel">
                  <div className="risk-level-banner">
                    Risk Assessment: <strong>{anomalyResult.riskAssessment}</strong>
                  </div>
                  <p className="analysis-summary">{anomalyResult.summary}</p>
                  <h4 className="subgrid-heading">Observations & Triggers:</h4>
                  <ul className="subgrid-list">
                    {anomalyResult.reasons.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                  <div className="faculty-advice-box">
                    <strong>Mentor Recommendation:</strong>
                    <p>{anomalyResult.recommendationForFaculty}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="ai-settings-section">
              <div className="info-callout">
                <p>
                  <strong>OpenAI Integration Setup:</strong> Enter your OpenAI API key below.
                  It connects directly from your browser to OpenAI to provide live code analysis,
                  Big-O calculation, and candidate feedback during your hackathon demo.
                </p>
              </div>

              <div className="field-group">
                <label>OpenAI API Key (sk-...)</label>
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
                  className="btn btn--primary"
                  onClick={handleSaveAndTestKey}
                  disabled={keyTestStatus.status === 'testing'}
                >
                  {keyTestStatus.status === 'testing' ? 'Testing...' : 'Save & Verify Key'}
                </button>
                {apiKeyInput && (
                  <button
                    className="btn btn--secondary"
                    onClick={() => {
                      setApiKeyInput('');
                      setOpenAIApiKey('');
                      setKeyTestStatus({ status: 'idle', message: 'API key cleared.' });
                    }}
                  >
                    Clear Key
                  </button>
                )}
              </div>

              {keyTestStatus.message && (
                <div
                  className={`key-status-msg ${
                    keyTestStatus.status === 'success'
                      ? 'key-status-msg--success'
                      : keyTestStatus.status === 'error'
                      ? 'key-status-msg--error'
                      : ''
                  }`}
                >
                  {keyTestStatus.message}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
