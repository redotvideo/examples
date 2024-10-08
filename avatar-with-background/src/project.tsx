import {Img, makeScene2D, Video} from '@revideo/2d';
import {useScene, createRef, waitFor, makeProject, Vector2} from '@revideo/core';

/**
 * The Revideo scene
 */
const scene = makeScene2D('scene', function* (view) {
  const avatarRef = createRef<Video>();
  const backgroundRef = createRef<Img>();

  yield view.add(
    <>
      <Img
        src={'https://revideo-example-assets.s3.amazonaws.com/mountains.jpg'}
        height={'100%'}
        ref={backgroundRef}
      />
      <Video
        src={'https://revideo-example-assets.s3.amazonaws.com/avatar.webm'}
        play={true}
        width={'100%'}
        ref={avatarRef}
        decoder={"slow"} // we need to use the slow decoder to support transparency
      />
    </>,
  );

  avatarRef().position.y(useScene().getSize().y / 2 - avatarRef().height() / 2);

  yield* waitFor(avatarRef().getDuration());
});

/**
 * The final revideo project
 */
export default makeProject({
  scenes: [scene],
  settings: {
    // Example settings:
    shared: {
      size: {x: 1080, y: 1080},
    },
  },
});
