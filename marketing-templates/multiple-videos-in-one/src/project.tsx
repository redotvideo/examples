import {makeProject, Vector2} from '@revideo/core';

import {Txt, Rect, View2D, Grid, makeScene2D} from '@revideo/2d';
import {all, useScene, Reference, createRef, waitFor} from '@revideo/core';

/**
 * The Revideo scene
 */
const scene = makeScene2D('scene', function* (view) {


  const backgroundRef = createRef<Rect>();

  yield view.add(
    <>
      <Rect
        fill={"#9accf2"}
        position={[useScene().getSize().x*0.25-1920*0.5, useScene().getSize().y*0.25-1080*0.5]}
        size={['40%', '40%']}
        ref={backgroundRef}
      />
    </>
  );

  yield* video(view, backgroundRef, "#9accf2", ["gift cards", "discounts", "+ more!!"]);

  const topRight = createRef<Rect>();
  const bottomLeft = createRef<Rect>();
  const bottomRight = createRef<Rect>();


  view.add(
    <>
      <Rect
        fill={"#FDCFE5"}
        position={[useScene().getSize().x*0.25-1920*0.5, useScene().getSize().y*0.25-1080*0.5]}
        size={['40%', '40%']}
        ref={topRight}
        zIndex={-1}
      />
      <Rect
        fill={"#FDB827"}
        position={[useScene().getSize().x*0.25-1920*0.5, useScene().getSize().y*0.25-1080*0.5]}
        size={['40%', '40%']}
        ref={bottomLeft}
        zIndex={-1}
      />
      <Rect
        fill={"#8BF8A7"}
        position={[useScene().getSize().x*0.25-1920*0.5, useScene().getSize().y*0.25-1080*0.5]}
        size={['40%', '40%']}
        ref={bottomRight}
        zIndex={-1}
      />

    </>
  );

  yield* all(
    bottomLeft().y(useScene().getSize().y*0.75-1080*0.5, 1), 
    topRight().x(useScene().getSize().x*0.75-1920*0.5, 1), 
    bottomRight().position([useScene().getSize().x*0.75-1920*0.5, useScene().getSize().y*0.75-1080*0.5], 1)
  );

  yield* all(
    video(view, bottomLeft, "#FDB827", ["gift cards", "discounts", "+ more!!"]),
    video(view, topRight, "#FDCFE5", ["gift cards", "discounts", "+ more!!"]),
    video(view, bottomRight, "#8BF8A7", ["gift cards", "discounts", "+ more!!"]),
  )

});

function* video(view: View2D, backgroundRef: Reference<Rect>, backgroundColor: string, texts: string[]){
  const grid = createRef<Grid>();
  const headingRef = createRef<Txt>()


  backgroundRef().add(
    <Grid
      ref={grid}
      width={backgroundRef().width()}
      height={backgroundRef().height()}
      stroke={'#999'}
      end={0}
      spacing={150*0.4}
    />,
  );

  yield* all(
    grid().end(0.5, 0.5).to(1, 0.5).wait(0.1),
    grid().start(0.5, 0.5).to(0, 0.5).wait(0.1),
  );

  backgroundRef().add(<Txt fontSize={1*0.40} fontWeight={600} ref={headingRef} position={[-backgroundRef().width()*0.3645, -backgroundRef().width()*0.05208]} opacity={0.2} textWrap={true} width={"1%"}  textAlign={"left"} fontFamily={"Sans-Serif"}>BLACK FRIDAY</Txt>)
  yield* all(headingRef().fontSize(180*0.40, 0.5), headingRef().opacity(1, 0.5));

  const txtRef = createRef<Txt>();
  const subtitle = <Txt fontSize={60*0.40} ref={txtRef} fill={backgroundColor}  zIndex={1} fontFamily={"Sans-Serif"}>Up to 95% off</Txt>

  const textBoxRef = createRef<Txt>();

  backgroundRef().add(<Rect left={[headingRef().left().x, 180*0.40]} ref={textBoxRef} width={txtRef().width()+60*0.40} height={40} zIndex={0} fill={"black"}/>);
  backgroundRef().add(<Txt position={textBoxRef().position} width={textBoxRef().width()} paddingLeft={5} textAlign={"left"} fontSize={60*0.40} ref={txtRef} fill={backgroundColor} zIndex={1} fontFamily={"Sans-Serif"}></Txt>)

  yield* txtRef().text("Up to 95% off", 1)
  yield* addItems(backgroundRef, backgroundColor, texts);

  yield* waitFor(1);

}

function* addItems(background: Reference<Rect>, backgroundColor: string, texts: string[]){
  let yPos = 0;
  for(let i=0; i< texts.length; i++){
    const txtRef1 = createRef<Txt>();
    const subtitle1 = <Txt fontSize={90*0.40} ref={txtRef1} fill={backgroundColor}  zIndex={1} fontFamily={"Sans-Serif"}>{texts[i]}</Txt>
  
    const textBoxRef1 = createRef<Txt>();
  
    background().add(<Rect left={[50, yPos]} height={30*0.40} lineWidth={2} radius={30*0.40} stroke={"black"} ref={textBoxRef1} width={txtRef1().width()+150*0.40} zIndex={0} padding={70*0.40} fill={"white"}/>);
    background().add(<Txt position={textBoxRef1().position} width={textBoxRef1().width()} textAlign={"center"} fontSize={90*0.40} fill={"black"} zIndex={1} fontFamily={"Sans-Serif"}>{texts[i]}</Txt>)
    yPos = textBoxRef1().y() + textBoxRef1().height()-2.5;
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
      size: new Vector2(1920, 1080),
    },
  },
});
