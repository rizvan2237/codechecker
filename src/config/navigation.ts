/** Sidebar navigation links for CodeChecker portals. */
export interface NavigationItem {
  path: string;
  label: string;
  badge?: string;
}

export const ADMIN_NAVIGATION_ITEMS: readonly NavigationItem[] = [
  { path: '/', label: 'Placement Dashboard' },
  { path: '/students', label: 'All Candidates' },
  { path: '/checker', label: 'Platform Checker', badge: 'Live' },
  { path: '/assignments', label: 'Assignments' },
  { path: '/analytics', label: 'Analytics' },
  { path: '/reports', label: 'Reports' },
  { path: '/admin-console', label: 'Admin Console & Bugs', badge: 'Health' },
  { path: '/settings', label: 'Settings' },
];

export const CANDIDATE_NAVIGATION_ITEMS: readonly NavigationItem[] = [
  { path: '/my-portal', label: 'My Progress' },
  { path: '/checker', label: 'Platform Checker', badge: 'Live' },
  { path: '/assignments', label: 'My Assignments' },
  { path: '/settings', label: 'Settings' },
];

/** Backward-compatibility default navigation items */
export const NAVIGATION_ITEMS = ADMIN_NAVIGATION_ITEMS;
