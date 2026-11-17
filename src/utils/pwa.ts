export const APP_VERSION = '2.3.0';

export async function checkForAppUpdates(): Promise<'updated' | 'up-to-date' | 'unsupported'> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
    return 'unsupported';
  }
  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    if (registrations.length === 0) {
      return 'up-to-date';
    }
    let foundUpdate = false;
    await Promise.all(
      registrations.map(async (reg) => {
        await reg.update();
        if (reg.waiting || reg.installing) {
          foundUpdate = true;
        }
      })
    );
    return foundUpdate ? 'updated' : 'up-to-date';
  } catch {
    return 'up-to-date';
  }
}

export async function forcePurgeAppCacheAndReload(): Promise<void> {
  try {
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((reg) => reg.unregister()));
    }
    if (typeof window !== 'undefined' && 'caches' in window) {
      const cacheNames = await window.caches.keys();
      await Promise.all(cacheNames.map((name) => window.caches.delete(name)));
    }
  } catch {
    // Ignore cleanup errors and proceed to reload
  }

  if (typeof window !== 'undefined') {
    window.location.reload();
  }
}
