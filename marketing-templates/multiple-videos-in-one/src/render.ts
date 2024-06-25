import {renderVideo} from '@revideo/renderer';

async function render() {
  console.log('Rendering video...');

  // This is the main function that renders the video
  const file = await renderVideo({
    projectFile: './src/project.ts',
    settings: {logProgress: true},
  });

  console.log(`Rendered video to ${file}`);
}

render();
