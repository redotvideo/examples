import {renderVideo} from '@revideo/renderer';

const progressTracker = new Map<number, number>();

function trackProgress(id: number, progress: number) {
  progressTracker.set(id, progress);
}

function printProgress() {
  let line = '';
  for (const [key, value] of progressTracker.entries()) {
    line += `${key}: ${(value * 100).toFixed(0)}% `;
  }

  if (line === '') {
    return;
  }

  console.log(line);
}

async function render() {
  console.log('Rendering video...');

  const interval = setInterval(() => {
    printProgress();
  }, 1000);

  // This is the main function that renders the video
  const file = await renderVideo(
    './vite.config.ts',
    {
      videos: [
        {
          src: "https://revideo-example-assets.s3.amazonaws.com/beach-3.mp4",
          start: 2,
          duration: 5
        },
        {
          src: "https://revideo-example-assets.s3.amazonaws.com/beach-2.mp4",
          start: 1,
          duration: 4
        },
        {
          src: "https://revideo-example-assets.s3.amazonaws.com/beach-1.mp4",
          start: 3,
          duration: 3
        }
      ]},
    trackProgress,
  );

  clearInterval(interval);

  console.log(`Rendered video to ${file}`);
}

render();
