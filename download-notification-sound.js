// Download a free notification sound
// Run this script with: node download-notification-sound.js

const https = require('https');
const fs = require('fs');
const path = require('path');

console.log('Downloading notification sound...');

// This is a URL for a free notification sound from mixkit.co
// Feel free to change this to any other notification sound URL you prefer
const soundUrl = 'https://assets.mixkit.co/active_storage/sfx/212/212-preview.mp3';
const outputPath = path.join(__dirname, 'public', 'notification-sound.mp3');

https.get(soundUrl, (response) => {
  if (response.statusCode !== 200) {
    console.error(`Failed to download: ${response.statusCode} ${response.statusMessage}`);
    return;
  }
  
  const fileStream = fs.createWriteStream(outputPath);
  response.pipe(fileStream);
  
  fileStream.on('finish', () => {
    fileStream.close();
    console.log(`Notification sound downloaded to: ${outputPath}`);
  });
}).on('error', (err) => {
  console.error(`Error downloading file: ${err.message}`);
});
