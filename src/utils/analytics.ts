// Simple analytics stub for development
// Export a gaEvent function that logs the event.
// In production you can replace this with actual Google Analytics integration.
export function gaEvent(eventName: string, data?: Record<string, unknown>) {
  try {
    // If a global gtag function exists, use it.
    // @ts-ignore – may not exist in all environments.
    if (typeof gtag === 'function') {
      // @ts-ignore
      gtag('event', eventName, data);
    } else {
      console.log('[Analytics]', eventName, data ?? {});
    }
  } catch (e) {
    console.error('gaEvent error:', e);
  }
}
