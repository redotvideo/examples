import {Audio, Txt, Video, makeScene2D} from '@revideo/2d';
import {all, chain, createRef, waitFor, useScene} from '@revideo/core';

export default makeScene2D(function* (view) {
  const textRef = createRef<Txt>();

  yield view.add(
    <>
      <Video
        src={'https://revideo-example-assets.s3.amazonaws.com/beach-3.mp4'}
        size={['100%', '100%']}
        play={true}
      />
      <Audio
        src={'https://revideo-example-assets.s3.amazonaws.com/chill-beat.mp3'}
        play={true}
        time={17.0}
      />
    </>,
  );

  yield* waitFor(1);

  view.add(
    <Txt fontFamily={"Sans-Serif"} fill={"white"} fontSize={10} ref={textRef}>Hello {useScene().variables.get("username", "user")()}</Txt>
  );

  yield* textRef().scale(10, 1);
  yield* waitFor(30);
});
