import {Audio, Img, makeScene2D, Txt, Rect, Layout} from '@revideo/2d';
import {all, createRef, waitFor, useScene, Reference, createSignal, makeProject} from '@revideo/core';
import metadata from './metadata.json';
import './global.css';

interface Word {
  punctuated_word: string;
  start: number;
  end: number;
}

interface captionSettings {
  fontSize: number;
  textColor: string;
  fontWeight: number;
  fontFamily: string;
  numSimultaneousWords: number;
  stream: boolean;
  textAlign: "center" | "left";
  textBoxWidthInPercent: number;
  borderColor?: string;
  borderWidth?: number;
  currentWordColor?: string;
  currentWordBackgroundColor?: string;
  shadowColor?: string;
  shadowBlur?: number;
  fadeInAnimation?: boolean;
}

const textSettings: captionSettings = {
  fontSize: 80,
  numSimultaneousWords: 4, // how many words are shown at most simultaneously
  textColor: "white",
  fontWeight: 800,
  fontFamily: "Mulish",
  stream: false, // if true, words appear one by one
  textAlign: "center",
  textBoxWidthInPercent: 70,
  fadeInAnimation: true,
  currentWordColor: "cyan",
  currentWordBackgroundColor: "red", // adds a colored box to the word currently spoken
  shadowColor: "black",
  shadowBlur: 30
}

/**
 * The Revideo scene
 */
const scene = makeScene2D('scene', function* (view) {
  const images = useScene().variables.get('images', [])();
  const audioUrl = useScene().variables.get('audioUrl', 'none')();
  const words = useScene().variables.get('words', [])();

  const duration = words[words.length-1].end + 0.5;

  const imageContainer = createRef<Layout>();
  const textContainer = createRef<Layout>();

  yield view.add(
    <>
      <Layout
        size={"100%"}
        ref={imageContainer}
      />
      <Layout
        size={"100%"}
        ref={textContainer}
      />
      <Audio
        src={audioUrl}
        play={true}
      />
      <Audio
        src={"https://revideo-example-assets.s3.amazonaws.com/chill-beat-2.mp3"}
        play={true}
        volume={0.1}
      />
    </>
  );

  yield* all(
    displayImages(imageContainer, images, duration),
    displayWords(
      textContainer,
      words,
      textSettings
    )
  )
});

function* displayImages(container: Reference<Layout>, images: string[], totalDuration: number){
  for(const img of images){
    const ref = createRef<Img>();
    container().add(<Img 
      src={img}
      size={["100%", "100%"]}
      ref={ref}
      zIndex={0}
    /> 
    )
    yield* waitFor(totalDuration/images.length);
  }
}

function* displayWords(container: Reference<Layout>, words: Word[], settings: captionSettings){
  let waitBefore = words[0].start;

  for (let i = 0; i < words.length; i += settings.numSimultaneousWords) {
    const currentBatch = words.slice(i, i + settings.numSimultaneousWords);
    const nextClipStart =
      i < words.length - 1 ? words[i + settings.numSimultaneousWords]?.start || null : null;
    const isLastClip = i + settings.numSimultaneousWords >= words.length;
    const waitAfter = isLastClip ? 1 : 0;
    const textRef = createRef<Txt>();
    yield* waitFor(waitBefore);

    if(settings.stream){
      let nextWordStart = 0;
      yield container().add(<Txt width={`${settings.textBoxWidthInPercent}%`} textWrap={true} zIndex={2} textAlign={settings.textAlign} ref={textRef}/>);

      for(let j = 0; j < currentBatch.length; j++){
        const word = currentBatch[j];
        yield* waitFor(nextWordStart);
        const optionalSpace = j === currentBatch.length-1? "" : " ";
        const backgroundRef = createRef<Rect>();
        const wordRef = createRef<Txt>();
        const opacitySignal = createSignal(settings.fadeInAnimation ? 0.5 : 1);
        textRef().add(
          <Txt
            fontSize={settings.fontSize}
            fontWeight={settings.fontWeight}
            fontFamily={settings.fontFamily}
            textWrap={true}
            textAlign={settings.textAlign}
            fill={settings.currentWordColor}
            ref={wordRef}
            lineWidth={settings.borderWidth}
            shadowBlur={settings.shadowBlur}
            shadowColor={settings.shadowColor}
            zIndex={2}
            stroke={settings.borderColor}
            opacity={opacitySignal}
          >
            {word.punctuated_word}
          </Txt>
        );
        textRef().add(<Txt fontSize={settings.fontSize}>{optionalSpace}</Txt>);
        container().add(<Rect fill={settings.currentWordBackgroundColor} zIndex={1} size={wordRef().size} position={wordRef().position} radius={10} padding={10} ref={backgroundRef} />);
        yield* all(waitFor(word.end-word.start), opacitySignal(1, Math.min((word.end-word.start)*0.5, 0.1)));
        wordRef().fill(settings.textColor);
        backgroundRef().remove();
        nextWordStart = currentBatch[j+1]?.start - word.end || 0;
      }
      textRef().remove();

    } else {
      yield container().add(<Txt width={`${settings.textBoxWidthInPercent}%`} textAlign={settings.textAlign} ref={textRef} textWrap={true} zIndex={2}/>);

      const wordRefs = [];
      const opacitySignal = createSignal(settings.fadeInAnimation ? 0.5 : 1);
      for(let j = 0; j < currentBatch.length; j++){
        const word = currentBatch[j];
        const optionalSpace = j === currentBatch.length-1? "" : " ";
        const wordRef = createRef<Txt>();
        textRef().add(
          <Txt
            fontSize={settings.fontSize}
            fontWeight={settings.fontWeight}
            ref={wordRef}
            fontFamily={settings.fontFamily}
            textWrap={true}
            textAlign={settings.textAlign}
            fill={settings.textColor}
            zIndex={2}
            stroke={settings.borderColor}
            lineWidth={settings.borderWidth}
            shadowBlur={settings.shadowBlur}
            shadowColor={settings.shadowColor}
            opacity={opacitySignal}
          >
            {word.punctuated_word}
          </Txt>
        );
        textRef().add(<Txt fontSize={settings.fontSize}>{optionalSpace}</Txt>);

        // we have to yield once to await the first word being aligned correctly
        if(j===0 && i === 0){
          yield;
        }
        wordRefs.push(wordRef);
      }

      yield* all(
        opacitySignal(1, Math.min(0.1, (currentBatch[0].end-currentBatch[0].start)*0.5)),
        highlightCurrentWord(container, currentBatch, wordRefs, settings.currentWordColor, settings.currentWordBackgroundColor),
        waitFor(currentBatch[currentBatch.length-1].end - currentBatch[0].start + waitAfter), 
      );
      textRef().remove();
    }
    waitBefore = nextClipStart !== null ? nextClipStart - currentBatch[currentBatch.length-1].end : 0;
  }
}

function* highlightCurrentWord(container: Reference<Layout>, currentBatch: Word[], wordRefs: Reference<Txt>[], wordColor: string, backgroundColor: string){
  let nextWordStart = 0;

  for(let i = 0; i < currentBatch.length; i++){
    yield* waitFor(nextWordStart);
    const word = currentBatch[i];
    const originalColor = wordRefs[i]().fill();
    nextWordStart = currentBatch[i+1]?.start - word.end || 0;
    wordRefs[i]().text(wordRefs[i]().text());
    wordRefs[i]().fill(wordColor);

    const backgroundRef = createRef<Rect>();
    if(backgroundColor){
      container().add(<Rect fill={backgroundColor} zIndex={1} size={wordRefs[i]().size} position={wordRefs[i]().position} radius={10} padding={10} ref={backgroundRef} />);
    }

    yield* waitFor(word.end-word.start);
    wordRefs[i]().text(wordRefs[i]().text());
    wordRefs[i]().fill(originalColor);

    if(backgroundColor){
      backgroundRef().remove();
    }
  }
}

/**
 * The final revideo project
 */
export default makeProject({
  scenes: [scene],
  variables: metadata,
  settings: {
    shared: {
      size: {x: 1080, y: 1920},
    },
  },
});
