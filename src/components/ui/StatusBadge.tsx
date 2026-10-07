import type { ReactNode } from 'react';
import type { AnomalyLevel, AssignmentStatus, SubmissionStatus } from '../../types/domain';

export type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'demo';

interface StatusBadgeProps {
  tone: BadgeTone;
  children: ReactNode;
}

export function StatusBadge({ tone, children }: StatusBadgeProps) {
  return <span className={`status-badge status-badge--${tone}`}>{children}</span>;
}

/** Colour rule for demo signals. REVIEW and HIGH are warnings, not findings. */
export function anomalyToneFor(level: AnomalyLevel): BadgeTone {
  switch (level) {
    case 'LOW':
      return 'info';
    case 'NORMAL':
      return 'success';
    case 'REVIEW':
      return 'warning';
    case 'HIGH':
      return 'danger';
  }
}

export function assignmentToneFor(status: AssignmentStatus): BadgeTone {
  switch (status) {
    case 'Completed':
      return 'success';
    case 'Partial':
      return 'warning';
    case 'Missing':
      return 'danger';
  }
}

export function submissionToneFor(status: SubmissionStatus): BadgeTone {
  switch (status) {
    case 'Accepted':
      return 'success';
    case 'Wrong Answer':
      return 'danger';
    case 'Time Limit Exceeded':
      return 'warning';
  }
}
