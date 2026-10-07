import { DEMO_DATA_LABEL, LIVE_DATA_LABEL } from '../../config/constants';
import type { DataSourceKind } from '../../types/domain';
import { StatusBadge } from './StatusBadge';

/** Shows where the visible numbers come from, so demo data is never mixed in silently. */
export function SourceBadge({ source }: { source: DataSourceKind }) {
  if (source === 'synthetic') {
    return <StatusBadge tone="demo">{DEMO_DATA_LABEL}</StatusBadge>;
  }
  return <StatusBadge tone="success">{LIVE_DATA_LABEL}</StatusBadge>;
}
