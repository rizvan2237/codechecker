import type { ReactNode } from 'react';

interface GlassCardProps {
  title?: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
  children: ReactNode;
}

/** The basic Liquid Glass surface used across the app. */
export function GlassCard({ title, description, actions, className = '', children }: GlassCardProps) {
  const hasHeader = title !== undefined || actions !== undefined;
  return (
    <section className={`glass-card ${className}`.trim()}>
      {hasHeader && (
        <header className="glass-card__header">
          <div>
            {title !== undefined && <h2 className="glass-card__title">{title}</h2>}
            {description !== undefined && <p className="glass-card__description">{description}</p>}
          </div>
          {actions !== undefined && <div className="glass-card__actions">{actions}</div>}
        </header>
      )}
      {children}
    </section>
  );
}
