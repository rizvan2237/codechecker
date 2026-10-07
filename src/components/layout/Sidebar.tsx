import { NavLink } from 'react-router-dom';
import { APP_NAME } from '../../config/constants';
import { ADMIN_NAVIGATION_ITEMS, CANDIDATE_NAVIGATION_ITEMS } from '../../config/navigation';
import { usePortal } from '../../context/PortalContext';

interface SidebarProps {
  onOpenAiModal?: () => void;
}

export function Sidebar({ onOpenAiModal }: SidebarProps) {
  const { mode, toggleMode } = usePortal();
  const navItems = mode === 'admin' ? ADMIN_NAVIGATION_ITEMS : CANDIDATE_NAVIGATION_ITEMS;

  return (
    <aside className="sidebar glass-panel">
      <div className="sidebar__brand">
        <div className="brand-logo-group">
          <span className="brand-mark" aria-hidden="true">CC</span>
          <div className="brand-text-col">
            <span className="brand-title">{APP_NAME}</span>
            <span className="brand-subtitle">LeetCode & HackerRank</span>
          </div>
        </div>
      </div>

      {/* Portal Mode Switcher Box */}
      <div className="sidebar__portal-switcher">
        <span className="portal-label">ACTIVE PORTAL</span>
        <button
          type="button"
          className="portal-toggle-pill"
          onClick={toggleMode}
          title="Click to toggle between Admin & Candidate Portals"
        >
          <span className={`portal-opt ${mode === 'admin' ? 'portal-opt--active' : ''}`}>
            Admin
          </span>
          <span className={`portal-opt ${mode === 'candidate' ? 'portal-opt--active' : ''}`}>
            Student
          </span>
        </button>
      </div>

      <nav className="sidebar__nav" aria-label="Main navigation">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/' || item.path === '/my-portal'}
            className={({ isActive }) =>
              isActive ? 'sidebar__link sidebar__link--active' : 'sidebar__link'
            }
          >
            <span>{item.label}</span>
            {item.badge && <span className="nav-badge-pill">{item.badge}</span>}
          </NavLink>
        ))}
      </nav>

      {/* AI Assistant Quick Trigger */}
      {onOpenAiModal && (
        <div className="sidebar__ai-trigger-box">
          <button
            type="button"
            className="sidebar__ai-btn"
            onClick={onOpenAiModal}
          >
            <span className="ai-spark-dot" />
            <span>AI Code Assistant</span>
          </button>
        </div>
      )}
    </aside>
  );
}
