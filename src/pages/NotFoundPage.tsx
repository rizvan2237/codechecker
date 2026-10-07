import { Link } from 'react-router-dom';
import { EmptyState } from '../components/ui/StateMessages';

export function NotFoundPage() {
  return (
    <EmptyState
      title="Page not found"
      description="The page you opened does not exist."
      action={<Link className="button" to="/">Go to dashboard</Link>}
    />
  );
}
