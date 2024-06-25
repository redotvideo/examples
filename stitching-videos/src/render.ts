import {renderVideo} from '@revideo/renderer';

async function render() {
  console.log('Rendering video...');
  // This is the main function that renders the video
  const file = await renderVideo({
    projectFile: './src/project.ts',
    variables: {
      videos: [
        {
          src: "https://revideo-example-assets.s3.amazonaws.com/beach-3.mp4",
          start: 1,
          duration: 6
        },
        {
          src: "https://revideo-example-assets.s3.amazonaws.com/beach-2.mp4",
          start: 2,
          duration: 10
        }
      ]}
    });

  console.log(`Rendered video to ${file}`);
}

render();
