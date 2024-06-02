import {
  Gradient,
  Img,
  Layout,
  Line,
  Rect,
  Spline,
  Txt,
  makeScene2D,
} from '@revideo/2d';
import {all, createRef, useScene, Vector2, waitFor} from '@revideo/core';

export default makeScene2D(function* (view) {
  // Get variables
  const repoName = useScene().variables.get('repoName', '');
  const repoImage = useScene().variables.get('repoImage', '');
  const data = useScene().variables.get('data', []);

  const max = Math.max(...data());
  const videoLength = 5; // seconds
  const totalValues = data().length;

  // Black background
  view.fill('#000000');

  // Calculate coordinates for each timestamp
  const linePoints = data().map((ms, i) => {
    const x = (ms / max) * view.width();
    const xShifted = x - view.width() / 2;

    const y = ((-i / totalValues) * view.height()) / 2;
    const yShifted = y + view.height() / 4;

    return new Vector2(xShifted, yShifted);
  });

  // Coordinates of the bottom corners
  const bottomCorners = [
    new Vector2(view.width() / 2, view.height() / 2),
    new Vector2(-view.width() / 2, view.height() / 2),
  ];

  // Background gradient
  const gradient = new Gradient({
    type: 'linear',
    from: [0, 0],
    to: [0, view.height()],
    stops: [
      {offset: 0, color: '#000000'},
      {offset: 1, color: 'green'},
    ],
  });

  // Refs, used to animate elements
  const outerLayoutRef = createRef<Layout>();
  const innerLayoutRef = createRef<Layout>();
  const rectRef = createRef<Rect>();

  // Add elements to the view
  yield view.add(
    <>
      <>
        <Line points={linePoints} lineWidth={30} stroke={'#3EAC45'} />
        <Spline points={[...linePoints, ...bottomCorners]} fill={gradient} />
        <Rect
          ref={rectRef}
          x={view.width() / 2}
          y={0}
          width={view.width() * 2}
          height={view.height()}
          fill={'#000000'}
        />
      </>
      <Layout
        ref={outerLayoutRef}
        layout
        alignItems={'center'}
        gap={40}
        x={-600}
        y={-400}
      >
        <Img
          src={repoImage()}
          width={100}
          height={100}
          stroke={'#555555'}
          lineWidth={8}
          strokeFirst={true}
          radius={10}
        />
        <Layout ref={innerLayoutRef} direction={'column'}>
          <Txt
            fontFamily={'Roboto'}
            text={repoName()}
            fill={'#ffffff'}
            x={-520}
            y={-395}
            fontSize={50}
            fontWeight={600}
          />
        </Layout>
      </Layout>
    </>,
  );

  // Resize the rectangle to reveal the scene
  yield* rectRef().width(0, videoLength);

  // Make rectangle transparent and cover the scene again
  rectRef().fill('#00000000');
  rectRef().width(view.width() * 2);

  // Cover the scene while the Layout block
  // is centered
  yield* all(
    rectRef().fill('#000000', 2),
    outerLayoutRef().x(0, 2),
    outerLayoutRef().y(-50, 2),
  );

  // Add text with the total number of stars
  const starTextRef = createRef<Txt>();
  innerLayoutRef().add(
    <Txt
      fontFamily={'Roboto'}
      ref={starTextRef}
      text={`${totalValues} stars`}
      fill={'#000000'}
      x={0}
      y={0}
      fontSize={40}
      fontWeight={500}
      marginBottom={-45}
    />,
  );
  yield* all(starTextRef().fill('#ffffff', 2), starTextRef().margin(0, 2));

  // Wait for 2 seconds
  yield* waitFor(2);
});
