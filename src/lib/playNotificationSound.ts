/**
 * This function has been disabled - no sounds will be played
 * @returns Promise that resolves immediately
 */
export function playNotificationSound(): Promise<void> {
  return new Promise((resolve) => {
    // Sound notifications are disabled
    resolve();
  });
}
