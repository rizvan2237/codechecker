/** Turns any thrown value into a readable message for the UI. */
export function describeError(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'Something went wrong while loading data. Check the browser console for details.';
}
