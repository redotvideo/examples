import {makeProject} from '@revideo/core';

import {Img, makeScene2D, Txt} from '@revideo/2d';
import {all, useScene, createRef, easeInCubic} from '@revideo/core';
import './global.css';

/**
 * The Revideo scene
 */
const scene = makeScene2D('scene', function* (view) {
  const rocketRef = createRef<Img>();
  const earthRef = createRef<Img>();
  const txtRef = createRef<Txt>();
  const logoRef = createRef<Img>();

  view.fill("#000000")

  yield view.add(
    <>
    <Img
      width={'20%'}
      ref={earthRef}
      src={'earth.png'}
      position={[-useScene().getSize().width/2+50, useScene().getSize().height/2-50]}
    />,
    <Img
      width={'5%'}
      ref={rocketRef}
      src={
        '/rocket.png'
      }
      position={[earthRef().position().x+150, earthRef().position().y-150]}
    />,
    </>
  );

  yield* rocketRef().position([1000, -600], 2, easeInCubic);

  yield view.add(
    <Txt fontFamily={"Lexend"} fill="white" ref={txtRef} textAlign={"center"} fontSize={60}></Txt>
  )

  yield* txtRef().text("Thank you for 1,000 Github stars!", 2);

  yield view.add(
    <Img
      width={'1%'}
      ref={logoRef}
      y={-50}
      src={
        'https://revideo-example-assets.s3.amazonaws.com/revideo-logo-white.png'
      }
    />,
  );

  yield* all(txtRef().position.y(150, 2), logoRef().width("30%", 2));
});


/**
 * The final revideo project
 */
export default makeProject({
  scenes: [scene],
  settings: {
    // Example settings:
    shared: {
      size: {x: 1920, y: 1080},
    },
  },
});
