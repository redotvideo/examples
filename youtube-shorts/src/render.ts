import {renderVideo} from '@revideo/renderer';
import metadata from './metadata.json';

async function render(){
    await renderVideo({
      projectFile: './src/project.ts',
      variables: metadata,
      settings: {logProgress: true}
    });
}

render();
