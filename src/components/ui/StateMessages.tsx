import type { ReactNode } from 'react';

export function LoadingState() {
  return (
    <div className="state-box" role="status">
      <span className="spinner" aria-hidden="true" />
      <p>Loading coding data...</p>
    </div>
  );
}

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="state-box state-box--error" role="alert">
      <h2>Could not load data</h2>
      <p>{message}</p>
      <button type="button" className="button button--ghost" onClick={onRetry}>
        Try again
      </button>
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="state-box">
      <h2>{title}</h2>
      {description !== undefined && <p>{description}</p>}
      {action}
    </div>
  );
}
