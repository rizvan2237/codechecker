import React, { useState } from 'react';
import { GlassCard } from '../components/ui/GlassCard';
import { PageHeader } from '../components/ui/PageHeader';
import { StatusBadge, submissionToneFor } from '../components/ui/StatusBadge';
import {
  fetchHackerRankProfile,
  fetchLeetCodeProfile,
  type PlatformProfileData,
  type PlatformSubmissionItem,
} from '../services/platformChecker';
import { AiModal } from '../components/ai/AiModal';

export function PlatformCheckerPage() {
  const [platform, setPlatform] = useState<'leetcode' | 'hackerrank'>('leetcode');
  const [usernameInput, setUsernameInput] = useState('neal_wu');
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<PlatformProfileData | null>(null);

  // AI Modal review state
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('Python');

  // Load initial search on mount
  React.useEffect(() => {
    handleSearch('neal_wu', 'leetcode');
  }, []);

  async function handleSearch(targetUsername?: string, targetPlatform?: 'leetcode' | 'hackerrank') {
    const userToFetch = (targetUsername || usernameInput).trim();
    const platToFetch = targetPlatform || platform;
    if (!userToFetch) return;

    setLoading(true);
    try {
      if (platToFetch === 'leetcode') {
        const data = await fetchLeetCodeProfile(userToFetch);
        setProfileData(data);
      } else {
        const data = await fetchHackerRankProfile(userToFetch);
        setProfileData(data);
      }
    } finally {
      setLoading(false);
    }
  }

  function handleQuickSelect(handle: string, plat: 'leetcode' | 'hackerrank') {
    setUsernameInput(handle);
    setPlatform(plat);
    handleSearch(handle, plat);
  }

  function openAiReviewForSubmission(sub: PlatformSubmissionItem) {
    setSelectedProblem(sub.problemTitle);
    setSelectedLanguage(sub.language);
    setIsAiModalOpen(true);
  }

  return (
    <>
      <PageHeader
        title="Live Platform Checker"
        subtitle="Lookup, verify, and inspect real-time statistics and recent submissions for any LeetCode or HackerRank handle."
      />

      {/* Search Bar Panel */}
      <GlassCard>
        <div className="checker-search-container">
          <div className="platform-toggle-pills">
            <button
              type="button"
              className={`pill-btn ${platform === 'leetcode' ? 'pill-btn--active' : ''}`}
              onClick={() => {
                setPlatform('leetcode');
                if (usernameInput === 'tourist_hr') setUsernameInput('neal_wu');
              }}
            >
              <span className="platform-icon">🟡</span> LeetCode
            </button>
            <button
              type="button"
              className={`pill-btn ${platform === 'hackerrank' ? 'pill-btn--active' : ''}`}
              onClick={() => {
                setPlatform('hackerrank');
                if (usernameInput === 'neal_wu') setUsernameInput('tourist_hr');
              }}
            >
              <span className="platform-icon">🟢</span> HackerRank
            </button>
          </div>

          <form
            className="checker-input-row"
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
          >
            <div className="checker-input-wrapper">
              <span className="checker-prefix">
                {platform === 'leetcode' ? 'leetcode.com/u/' : 'hackerrank.com/'}
              </span>
              <input
                type="text"
                className="checker-text-input"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="Enter handle (e.g. neal_wu, tourist, student_code)"
              />
            </div>
            <button type="submit" className="btn btn--primary" disabled={loading}>
              {loading ? 'Inspecting...' : '🔍 Inspect Profile'}
            </button>
          </form>

          <div className="quick-suggestions">
            <span className="quick-label">Try handles:</span>
            <button
              type="button"
              className="quick-chip"
              onClick={() => handleQuickSelect('neal_wu', 'leetcode')}
            >
              neal_wu (LeetCode)
            </button>
            <button
              type="button"
              className="quick-chip"
              onClick={() => handleQuickSelect('tourist', 'leetcode')}
            >
              tourist (LeetCode)
            </button>
            <button
              type="button"
              className="quick-chip"
              onClick={() => handleQuickSelect('john_developer', 'hackerrank')}
            >
              john_developer (HackerRank)
            </button>
            <button
              type="button"
              className="quick-chip"
              onClick={() => handleQuickSelect('demo-lc-syn-0001', 'leetcode')}
            >
              demo-lc-syn-0001 (Candidate)
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Profile Overview Card */}
      {profileData && (
        <div className="checker-results-grid">
          <GlassCard className="profile-hero-card">
            <div className="profile-hero-content">
              <img
                src={profileData.avatarUrl}
                alt={profileData.displayName}
                className="profile-avatar-circle"
              />
              <div className="profile-hero-info">
                <div className="profile-title-row">
                  <h2 className="profile-hero-name">{profileData.displayName}</h2>
                  <span className={`platform-badge platform-badge--${profileData.platform}`}>
                    {profileData.platform === 'leetcode' ? 'LeetCode Profile' : 'HackerRank Profile'}
                  </span>
                </div>
                <div className="profile-meta-row">
                  <span className="profile-meta-item">
                    Handle: <strong>@{profileData.username}</strong>
                  </span>
                  <span className="profile-meta-item">
                    Global Rank: <strong>{profileData.ranking}</strong>
                  </span>
                  <span className="profile-meta-item">
                    🔥 Streak: <strong>{profileData.streakDays} days</strong>
                  </span>
                  <a
                    href={profileData.profileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="profile-external-link"
                  >
                    View Official Profile ↗
                  </a>
                </div>

                <div className="badges-chips-row">
                  {profileData.badges.map((b, i) => (
                    <span key={i} className="badge-pill">
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Solved Stats Grid */}
          <div className="stats-breakdown-row">
            <GlassCard className="stat-counter-card">
              <span className="stat-counter-title">Total Solved</span>
              <div className="stat-counter-value stat-counter-value--total">
                {profileData.totalSolved}
              </div>
              <span className="stat-counter-sub">Acceptance: {profileData.acceptanceRate}%</span>
            </GlassCard>

            <GlassCard className="stat-counter-card">
              <span className="stat-counter-title">Easy Solved</span>
              <div className="stat-counter-value stat-counter-value--easy">
                {profileData.easySolved}
              </div>
              <div className="mini-progress-bar">
                <div
                  className="mini-progress-fill mini-progress-fill--easy"
                  style={{
                    width: `${Math.min(100, (profileData.easySolved / Math.max(1, profileData.totalSolved)) * 100)}%`,
                  }}
                />
              </div>
            </GlassCard>

            <GlassCard className="stat-counter-card">
              <span className="stat-counter-title">Medium Solved</span>
              <div className="stat-counter-value stat-counter-value--medium">
                {profileData.mediumSolved}
              </div>
              <div className="mini-progress-bar">
                <div
                  className="mini-progress-fill mini-progress-fill--medium"
                  style={{
                    width: `${Math.min(100, (profileData.mediumSolved / Math.max(1, profileData.totalSolved)) * 100)}%`,
                  }}
                />
              </div>
            </GlassCard>

            <GlassCard className="stat-counter-card">
              <span className="stat-counter-title">Hard Solved</span>
              <div className="stat-counter-value stat-counter-value--hard">
                {profileData.hardSolved}
              </div>
              <div className="mini-progress-bar">
                <div
                  className="mini-progress-fill mini-progress-fill--hard"
                  style={{
                    width: `${Math.min(100, (profileData.hardSolved / Math.max(1, profileData.totalSolved)) * 100)}%`,
                  }}
                />
              </div>
            </GlassCard>
          </div>

          {/* Recent Submissions Table */}
          <GlassCard
            title="Recent Submissions & Verifications"
            description="Verified submissions with judge telemetry. Run instant AI code reviews on any solution."
          >
            <div className="table-responsive">
              <table className="glass-table">
                <thead>
                  <tr>
                    <th>Problem</th>
                    <th>Difficulty</th>
                    <th>Result</th>
                    <th>Language</th>
                    <th>Runtime</th>
                    <th>Memory</th>
                    <th>Submitted</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {profileData.recentSubmissions.map((sub) => (
                    <tr key={sub.id}>
                      <td className="font-semibold">{sub.problemTitle}</td>
                      <td>
                        <span className={`diff-tag diff-tag--${sub.difficulty.toLowerCase()}`}>
                          {sub.difficulty}
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
                      <td className="text-muted-cell">
                        {new Date(sub.submittedAt).toLocaleDateString()}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn btn--small btn--glass-action"
                          onClick={() => openAiReviewForSubmission(sub)}
                        >
                          ⚡ AI Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>
      )}

      {/* AI Modal */}
      <AiModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        initialProblem={selectedProblem}
        initialLanguage={selectedLanguage}
      />
    </>
  );
}
