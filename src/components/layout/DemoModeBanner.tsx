import { DEMO_DATA_LABEL } from '../../config/constants';
import { IS_DEMO_MODE } from '../../config/env';

/** Shown on every page while the app uses generated demo data. */
export function DemoModeBanner() {
  if (!IS_DEMO_MODE) return null;

  return (
    <div className="demo-banner" role="note">
      <strong>{DEMO_DATA_LABEL}</strong>
      <span>
        Students, submissions, and demo signals are generated for demonstration. They are not real student records.
      </span>
    </div>
  );
}
