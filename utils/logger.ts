export function logError(error: any, info?: any) {
  if (info) {
    console.error("[ErrorBoundary]", error, info);
  } else {
    console.error("[ErrorBoundary]", error);
  }
}
