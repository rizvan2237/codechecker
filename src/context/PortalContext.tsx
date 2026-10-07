import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Student } from '../types/domain';

export type PortalMode = 'admin' | 'candidate';

interface PortalContextValue {
  mode: PortalMode;
  setMode: (mode: PortalMode) => void;
  toggleMode: () => void;
  activeCandidateId: string | null;
  setActiveCandidateId: (id: string) => void;
  activeStudent: Student | null;
  setActiveStudent: (student: Student | null) => void;
}

const PortalContext = createContext<PortalContextValue | undefined>(undefined);

const STORAGE_MODE_KEY = 'codechecker_portal_mode';
const STORAGE_CANDIDATE_KEY = 'codechecker_active_candidate';

export function PortalProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<PortalMode>(() => {
    const saved = localStorage.getItem(STORAGE_MODE_KEY);
    return saved === 'candidate' ? 'candidate' : 'admin';
  });

  const [activeCandidateId, setActiveCandidateIdState] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_CANDIDATE_KEY) || 'SYN-0001';
  });

  const [activeStudent, setActiveStudent] = useState<Student | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_MODE_KEY, mode);
  }, [mode]);

  useEffect(() => {
    if (activeCandidateId) {
      localStorage.setItem(STORAGE_CANDIDATE_KEY, activeCandidateId);
    }
  }, [activeCandidateId]);

  function setMode(newMode: PortalMode) {
    setModeState(newMode);
  }

  function toggleMode() {
    setModeState((prev) => (prev === 'admin' ? 'candidate' : 'admin'));
  }

  function setActiveCandidateId(id: string) {
    setActiveCandidateIdState(id);
  }

  return (
    <PortalContext.Provider
      value={{
        mode,
        setMode,
        toggleMode,
        activeCandidateId,
        setActiveCandidateId,
        activeStudent,
        setActiveStudent,
      }}
    >
      {children}
    </PortalContext.Provider>
  );
}

export function usePortal(): PortalContextValue {
  const context = useContext(PortalContext);
  if (!context) {
    throw new Error('usePortal must be used within a PortalProvider');
  }
  return context;
}
