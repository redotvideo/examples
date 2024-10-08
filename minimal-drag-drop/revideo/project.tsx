/** @jsxImportSource @revideo/2d/lib */

import {
    createRef,
    Reference,
	  makeProject,
    useScene,
  	waitFor,
} from '@revideo/core';
import {Video, Txt, makeScene2D} from '@revideo/2d';

import './global.css';

const scene = makeScene2D("scene", function* (view) {
  const nodesObj = useScene().variables.get("nodes", {})() as Record<string, any>;
  const nodes = new Map(Object.entries(nodesObj));

  yield view.add(
    <Video
      src="https://revideo-example-assets.s3.amazonaws.com/stars.mp4"
      size={"100%"}
      key={'data-video'}
      play={true}
    />
  );

  const refs: Array<Reference<Txt>> = [];
  if (nodes.size > 0) {
    for (const [key, node] of nodes) {
      const ref = createRef<Txt>();
      yield view.add(
        <Txt
          key={key}
          text={node.text}
          fontSize={100}
          fontWeight={800}
          fontFamily={"Roboto"}
          fill={"white"}
          x={() => node.x}
          y={() => node.y}
          ref={ref}
        />
      )
      refs.push(ref);
    }
  }

  yield* waitFor(5);
});


export default makeProject({
	scenes: [scene],
});
