import {makeProject} from '@revideo/core';

import {Grid, Rect, Img, makeScene2D, View2D, Txt} from '@revideo/2d';
import {all, useScene, createRef, waitFor} from '@revideo/core';

/**
 * The Revideo scene
 */
const scene = makeScene2D('scene', function* (view) {
  const logoRef = createRef<Img>();
  const grid = createRef<Grid>();
  const headingRef = createRef<Txt>()


  view.add(
    <>
      <Rect
        fill={useScene().variables.get("backgroundColor", "#E2FF31")()}
        size={['100%', '100%']}
      />
    </>
  );

  view.add(
    <Grid
      ref={grid}
      width={'100%'}
      height={'100%'}
      stroke={'#999'}
      end={0}
      spacing={150}
    />,
  );

  yield* all(
    grid().end(0.5, 0.5).to(1, 0.5).wait(0.1),
    grid().start(0.5, 0.5).to(0, 0.5).wait(0.1),
  );

  view.add(<Txt fontSize={1} fontWeight={600} ref={headingRef} position={[-700, -100]} opacity={0.2} textWrap={true} width={"1%"}  textAlign={"left"} fontFamily={"Sans-Serif"}>BLACK FRIDAY</Txt>)
  yield* all(headingRef().fontSize(180, 0.5), headingRef().opacity(1, 0.5));

  const txtRef = createRef<Txt>();
  const subtitle = <Txt fontSize={60} ref={txtRef} fill={useScene().variables.get("backgroundColor", useScene().variables.get("backgroundColor", "#E2FF31")())()}  zIndex={1} fontFamily={"Sans-Serif"}>Up to 95% off</Txt>

  const textBoxRef = createRef<Txt>();

  view.add(<Rect left={[headingRef().left().x, 180]} ref={textBoxRef} width={txtRef().width()+60} height={100} zIndex={0} fill={"black"}/>);
  view.add(<Txt position={textBoxRef().position} width={textBoxRef().width()} paddingLeft={20} textAlign={"left"} fontSize={60} ref={txtRef} fill={useScene().variables.get("backgroundColor", "#E2FF31")()} zIndex={1} fontFamily={"Sans-Serif"}></Txt>)

  yield* txtRef().text("Up to 95% off", 1)
  yield* addItems(view, useScene().variables.get("texts", ["events", "gift cards", "and more..."])());

  yield* waitFor(1);
});


function* addItems(view: View2D, texts: string[]){
  let yPos = 0;
  for(let i=0; i< texts.length; i++){
    const txtRef1 = createRef<Txt>();
    const subtitle1 = <Txt fontSize={90} ref={txtRef1} fill={useScene().variables.get("backgroundColor", "#E2FF31")()}  zIndex={1} fontFamily={"Sans-Serif"}>{texts[i]}</Txt>
  
    const textBoxRef1 = createRef<Txt>();
  
    view.add(<Rect left={[100, yPos]} lineWidth={2} radius={30} stroke={"black"} ref={textBoxRef1} width={txtRef1().width()+150} height={100} zIndex={0} padding={70} fill={"white"}/>);
    view.add(<Txt position={textBoxRef1().position} width={textBoxRef1().width()} textAlign={"center"} fontSize={90} fill={"black"} zIndex={1} fontFamily={"Sans-Serif"}>{texts[i]}</Txt>)
    yPos = textBoxRef1().y() + textBoxRef1().height()-10;
    yield* waitFor(0.5);

  }

}


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
