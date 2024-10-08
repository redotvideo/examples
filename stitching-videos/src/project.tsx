import {makeProject} from '@revideo/core';

import {makeScene2D, Video} from '@revideo/2d';
import {useScene, createRef, waitFor} from '@revideo/core';

interface VideoObject {
  src: string;
  start: number;
  duration: number;
}

/**
 * The Revideo scene
 */
const scene = makeScene2D('scene', function* (view) {
  const videos: VideoObject[] = useScene().variables.get('videos', [])();

  for(const vid of videos){
    const videoRef = createRef<Video>();
    yield view.add(<Video src={vid.src} time={vid.start} play={true} opacity={0} ref={videoRef} />)
    
    if(view.width() / view.height() > videoRef().width() / videoRef().height()){
      videoRef().width("100%");
    } else {
      videoRef().height("100%");
    }

    // this is a fade-out / fade-in transition - the fade-out and in take 0.3 seconds each; just set the opacity of the video tag to 1 and only use yield* waitFor(vid.duration);
    yield* videoRef().opacity(1,0.3);
    yield* waitFor(vid.duration-0.6);
    yield* videoRef().opacity(0,0.3);
    videoRef().pause();
    videoRef().remove();
  }
});


/**
 * The final revideo project
 */
export default makeProject({
  scenes: [scene],
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
    ]
  },
  settings: {
    // Example settings:
    shared: {
      size: {x: 1920, y: 1080},
    },
  },
});
