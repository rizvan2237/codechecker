import { useState, useMemo } from 'react';
import { useDataset } from '../context/DatasetContext';
import { usePortal } from '../context/PortalContext';
import { GlassCard } from '../components/ui/GlassCard';
import { PageHeader } from '../components/ui/PageHeader';
import { StatusBadge, submissionToneFor } from '../components/ui/StatusBadge';
import { AiModal } from '../components/ai/AiModal';
import type { Submission } from '../types/domain';

export function CandidateDashboardPage() {
  const { dataset, summaries } = useDataset();
  const { activeCandidateId, setActiveCandidateId } = usePortal();

  // Find active student summary or default to first
  const activeSummary = useMemo(() => {
    if (!summaries || summaries.length === 0) return null;
    return (
      summaries.find((s) => s.student.id === activeCandidateId) ||
      summaries[0]
    );
  }, [summaries, activeCandidateId]);

  // AI Modal state
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiProblemTitle, setAiProblemTitle] = useState('Two Sum');
  const [aiLanguage, setAiLanguage] = useState('Python');

  if (!dataset || !activeSummary) {
    return (
      <div className="empty-state glass-panel">
        <p>Loading candidate profile data...</p>
      </div>
    );
  }

  const { student, scores, solvedCount, solvedByDifficulty } = activeSummary;

  // Filter submissions for this candidate
  const candidateSubmissions = dataset.submissions
    .filter((s) => s.studentId === student.id)
    .slice(0, 10);

  // Filter assignments for this candidate
  const candidateAssignments = dataset.assignments.map((assignment) => {
    const result = dataset.assignmentResults.find(
      (r) => r.assignmentId === assignment.id && r.studentId === student.id
    );
    return {
      assignment,
      result,
    };
  });

  function handleTriggerAiReview(sub: Submission) {
    const prob = dataset?.problems.find((p) => p.id === sub.problemId);
    setAiProblemTitle(prob ? prob.title : 'Coding Problem');
    setAiLanguage(sub.language);
    setIsAiModalOpen(true);
  }

  return (
    <>
      <div className="candidate-header-wrap">
        <PageHeader
          title={`Candidate Portal — ${student.name}`}
          subtitle={`Personal coding tracker, assignments, and AI performance analysis.`}
        />
        <div className="candidate-picker-container">
          <label className="picker-label">Switch Candidate Profile:</label>
          <select
            className="glass-select candidate-select"
            value={student.id}
            onChange={(e) => setActiveCandidateId(e.target.value)}
          >
            {dataset.students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.id}) — {s.department}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Hero Welcome Banner */}
      <GlassCard className="candidate-hero-banner">
        <div className="candidate-hero-content">
          <div className="candidate-avatar-wrap">
            <img
              src={`https://api.dicebear.com/7.x/bottts/svg?seed=${student.id}`}
              alt={student.name}
              className="candidate-avatar-img"
            />
          </div>
          <div className="candidate-meta-details">
            <div className="candidate-title-badges">
              <h2 className="candidate-display-name">{student.name}</h2>
              <span className="candidate-id-badge">{student.id}</span>
              <span className="candidate-dept-badge">
                {student.department} • Year {student.year}-{student.section}
              </span>
            </div>
            <div className="candidate-handles-list">
              <span className="handle-tag">
                <span className="handle-dot handle-dot--lc" />
                LeetCode:{' '}
                <a
                  href={`https://leetcode.com/u/${student.leetcodeUsername || ''}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  @{student.leetcodeUsername || 'not_connected'}
                </a>
              </span>
              <span className="handle-tag">
                <span className="handle-dot handle-dot--hr" />
                HackerRank:{' '}
                <a
                  href={`https://www.hackerrank.com/profile/${student.hackerrankUsername || ''}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  @{student.hackerrankUsername || 'not_connected'}
                </a>
              </span>
            </div>
          </div>
          <div className="candidate-action-cta">
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => {
                setAiProblemTitle('Code Optimization Review');
                setIsAiModalOpen(true);
              }}
            >
              ⚡ Launch AI Assistant
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Stats Counter Row */}
      <div className="stats-breakdown-row">
        <GlassCard className="stat-counter-card">
          <span className="stat-counter-title">Placement Readiness</span>
          <div className="stat-counter-value stat-counter-value--total">
            {Math.round((scores.codingProgress + scores.consistency + scores.topicCoverage) / 3)}%
          </div>
          <span className="stat-counter-sub">Based on coding tests & consistency</span>
        </GlassCard>

        <GlassCard className="stat-counter-card">
          <span className="stat-counter-title">Total Solved</span>
          <div className="stat-counter-value stat-counter-value--total">
            {solvedCount}
          </div>
          <span className="stat-counter-sub">
            E: {solvedByDifficulty.Easy} | M: {solvedByDifficulty.Medium} | H: {solvedByDifficulty.Hard}
          </span>
        </GlassCard>

        <GlassCard className="stat-counter-card">
          <span className="stat-counter-title">Active Days (Last 90d)</span>
          <div className="stat-counter-value stat-counter-value--easy">
            {activeSummary.activeDaysInWindow} Days
          </div>
          <span className="stat-counter-sub">Consistency Score: {scores.consistency}%</span>
        </GlassCard>

        <GlassCard className="stat-counter-card">
          <span className="stat-counter-title">Topic Coverage</span>
          <div className="stat-counter-value stat-counter-value--medium">
            {scores.topicCoverage}%
          </div>
          <span className="stat-counter-sub">Catalogue breadth mastery</span>
        </GlassCard>
      </div>

      {/* Weekly Assignments Section */}
      <GlassCard
        title="Assigned Placement Practice Sets"
        description="Weekly problem sets assigned by faculty. Ensure completion before weekly review."
      >
        <div className="assignment-cards-grid">
          {candidateAssignments.map(({ assignment, result }) => {
            const completed = result?.completedCount || 0;
            const total = assignment.problemIds.length;
            const pct = Math.round((completed / Math.max(1, total)) * 100);
            return (
              <div key={assignment.id} className="assignment-item-glass glass-panel">
                <div className="assignment-header-line">
                  <span className="week-chip">Week {assignment.weekNumber}</span>
                  <span
                    className={`status-pill status-pill--${
                      pct === 100 ? 'completed' : pct > 0 ? 'partial' : 'missing'
                    }`}
                  >
                    {pct === 100 ? 'Completed' : pct > 0 ? `${pct}% Done` : 'Pending'}
                  </span>
                </div>
                <h3 className="assignment-card-title">{assignment.title}</h3>
                <div className="assignment-progress-bar">
                  <div
                    className="assignment-progress-fill"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="assignment-footer-line">
                  <span>
                    Solved {completed} / {total} problems
                  </span>
                  <span className="platform-tag">LeetCode + HackerRank</span>
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* Recent Submissions with AI Review */}
      <GlassCard
        title="My Recent Submissions & AI Verification"
        description="Your recent automated submissions tracked from LeetCode and HackerRank. Click AI Review on any submission to inspect complexity."
      >
        <div className="table-responsive">
          <table className="glass-table">
            <thead>
              <tr>
                <th>Problem</th>
                <th>Platform</th>
                <th>Result</th>
                <th>Language</th>
                <th>Judge Runtime</th>
                <th>Memory</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {candidateSubmissions.map((sub) => {
                const prob = dataset.problems.find((p) => p.id === sub.problemId);
                return (
                  <tr key={sub.id}>
                    <td className="font-semibold">{prob ? prob.title : sub.problemId}</td>
                    <td>
                      <span className={`platform-badge platform-badge--${sub.platform}`}>
                        {sub.platform === 'leetcode' ? 'LeetCode' : 'HackerRank'}
                      </span>
                    </td>
                    <td>
                      <StatusBadge tone={submissionToneFor(sub.status)}>
                        {sub.status}
                      </StatusBadge>
                    </td>
                    <td className="code-lang-cell">{sub.language}</td>
                    <td>{sub.runtimeMs} ms</td>
                    <td>{(sub.memoryKb / 1024).toFixed(1)} MB</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn--small btn--glass-action"
                        onClick={() => handleTriggerAiReview(sub)}
                      >
                        ⚡ AI Review
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* AI Modal */}
      <AiModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        initialProblem={aiProblemTitle}
        initialLanguage={aiLanguage}
      />
    </>
  );
}
