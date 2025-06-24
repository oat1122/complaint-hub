/**
 * Play a notification sound from the public directory
 * @returns Promise that resolves when the sound finishes playing
 */
export function playNotificationSound(): Promise<void> {
  return new Promise((resolve) => {
    try {
      const audio = new Audio('/notification-sound.mp3');
      audio.volume = 0.5;
      
      audio.onended = () => {
        resolve();
      };
      
      // Some browsers require user interaction before playing audio
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // Playback started successfully
          })
          .catch((error) => {
            // Auto-play was prevented
            console.log("Notification sound couldn't be played:", error);
            resolve(); // Resolve anyway to continue execution
          });
      }
    } catch (error) {
      console.error("Error playing notification sound:", error);
      resolve(); // Resolve anyway to continue execution
    }
  });
}
