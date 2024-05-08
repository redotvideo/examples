import {makeProject} from '@revideo/core';

import example from './scenes/example?scene';

export default makeProject({
  scenes: [example],
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
      },
      {
        src: "https://revideo-example-assets.s3.amazonaws.com/beach-1.mp4",
        start: 1,
        duration: 7
      }
    ]
  }
});
