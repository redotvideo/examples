import { waitFor, createRef, makeProject, all, Reference, chain } from '@revideo/core';
import {
  Img, 
  makeScene2D,
  Rive,
  Txt,
  Layout,
  LezerHighlighter, Code, word, lines, Rect,
  View2D,
} from '@revideo/2d';
import {parser} from '@lezer/javascript';
import {tags} from '@lezer/highlight';
import {HighlightStyle} from '@codemirror/language';
import './global.css';

const MyStyle = HighlightStyle.define([
    {
      tag: tags.comment,
      color: '#8E908C',
    },
    {
      tag: [tags.variableName, tags.self, tags.propertyName, tags.attributeName, tags.regexp],
      color: '#C82829',
    },
    {
      tag: [tags.number, tags.bool, tags.null],
      color: '#F5871F',
    },
    {
      tag: [tags.className, tags.typeName, tags.definition(tags.typeName)],
      color: '#C99E00',
    },
    {
      tag: [tags.string, tags.special(tags.brace)],
      color: '#718C00',
    },
    {
      tag: tags.operator,
      color: '#3E999F',
    },
    {
      tag: [tags.definition(tags.propertyName), tags.function(tags.variableName)],
      color: '#4271AE',
    },
    {
      tag: tags.keyword,
      color: '#8959A8',
    },
    {
      tag: tags.derefOperator,
      color: '#4D4D4C',
    },
    {
      tag: tags.bracket,
      color: "grey"
    },
    {
      tag: tags.separator,
      color: "grey"
    },
    {
      tag: tags.punctuation,
      color: "grey"
    },
    {
      tag: tags.typeOperator,
      color: "grey"
    }
  ]);

Code.defaultHighlighter = new LezerHighlighter(
  parser.configure({
    dialect: 'jsx ts',
  }),
  MyStyle
);

/**
 * The Revideo scene
 */
const scene = makeScene2D('scene', function* (view) {

  const textRef = createRef<Txt>();
  yield view.add(
    <Txt fontFamily={"Lexend"} fontSize={100} fontWeight={600} ref={textRef}/>
  );

  yield* all(textRef().text("Rive Animations in Revideo", 1.25))
  yield* all(
      textRef().scale(0.75, 0.75),
      textRef().position.y(-400, 0.75)
  )
  yield* waitFor(0.25);

  const codeRef= createRef<Code>();
  const videoBoxRef = createRef<Layout>();
  view.add(<Layout opacity={0} position={[550, 100]} size={[600, 600]} ref={videoBoxRef} />);
  view.add(
    <Code
    ref={codeRef}
    textAlign={"left"}
    fontSize={35}
    x={-400}
    y={100}
    opacity={0}
    fontFamily={'JetBrains Mono, monospace'}
    code={
`export default makeScene2D(function* (view){
  yield view.add(
      <Img 
        src={"/sf.png"} 
        size={["100%", "100%"]} 
      />
  );

});
`
}/>);

videoBoxRef().add(
  <Img 
    src={"https://revideo-example-assets.s3.amazonaws.com/sf.png"} 
    size={[videoBoxRef().width(), videoBoxRef().height()]} 
  />
);

yield* all(
  codeRef().opacity(1, 0.75),
  videoBoxRef().opacity(1, 0.75)
);
yield* waitFor(0.5);

const riveRef = createRef<Rive>();
videoBoxRef().add(
    <Rive
      src={"https://revideo-example-assets.s3.amazonaws.com/emoji.riv"}
      animationId={1}
      size={[600, 600]} 
      opacity={0}
      ref={riveRef}
    />
);
yield* all(codeRef().code.insert([8, 0],
  `\n   yield view.add(
      <Rive
        src={"/emoji.riv"}
        animationId={1}
        size={[600, 600]} 
      />
  );\n`, 1),
  riveRef().opacity(1, 1)
);

yield* waitFor(1);

yield* codeRef().selection(lines(11, 13), 1),
yield replaceRive(videoBoxRef, riveRef)
yield* all(
  codeRef().code.replace(word(11, 17, 5), "dog", 2),
  codeRef().code.replace(word(13, 17, 3), "900", 2),
);

yield* codeRef().selection(lines(0, 17), 1);

yield* waitFor(1);
yield* all(
  codeRef().opacity(0, 1),
  videoBoxRef().opacity(0, 1),
  textRef().opacity(0, 1)
);

yield* waitFor(0.5);
yield* logoAnimation(view);
});

function* replaceRive(box: Reference<Layout>, rive: Reference<Rive>){
yield* rive().opacity(0, 1);
rive().remove();

const riveRef = createRef<Rive>();
box().add(
    <Rive
      src={"https://revideo-example-assets.s3.amazonaws.com/dog.riv"}
      size={[1000, 600]} 
      opacity={0}
      animationId={1}
      ref={riveRef}
    />
);

yield* riveRef().opacity(1, 1);
yield* waitFor(5);
}

function* logoAnimation(view: View2D){
const block1 = createRef<Rect>()
const block2 = createRef<Rect>()
const block3 = createRef<Rect>()
const blocks = createRef<Layout>();
const logoText = createRef<Txt>();
view.add(
  <>
  <Layout ref={blocks} x={-600}>
    <Rect fill={"#151515"} height={60} y={-80} x={-620} width={180} radius={9.3} ref={block1} />
    <Rect fill={"#151515"} height={60} width={180} x={-540} radius={9.3} ref={block2} />
    <Rect fill={"#151515"} height={60} width={180} x={-460} y={80} radius={9.3} ref={block3} />
    <Txt ref={logoText} fontFamily={"Lexend"} x={53+757.5} y={20} fontSize={300} letterSpacing={-4} fontWeight={700} text={""}/>
  </Layout>
  </>
);

yield* all(
  block1().position.x(-80, 0.5),
  chain(waitFor(0.1), block2().position.x(0, 0.4)),
  chain(waitFor(0.2), block3().position.x(80, 0.3)),
)

yield* logoText().text("revideo", 1);

yield* waitFor(1);
}

/**
 * The final revideo project
 */
export default makeProject({
  scenes: [scene],
  settings: {
    // Example settings:
    shared: {
      size: {x: 1920, 1080},
    },
  },
});
