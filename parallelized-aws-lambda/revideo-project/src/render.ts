import {renderVideo} from '@revideo/renderer';

async function render() {
  console.log('Rendering video...');

  // This is the main function that renders the video
  console.time("render");
  const file = await renderVideo({
    projectFile: './src/project.tsx',
    settings: {logProgress: true},
  });
  console.timeEnd("render");

  console.log(`Rendered video to ${file}`);
}

render();