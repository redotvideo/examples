import { Audio, Txt, Video, View2D, makeScene2D } from "@revideo/2d";
import { createRef, useScene, waitFor } from "@revideo/core";
import { MetaData, Word } from "../render";

export default makeScene2D(function* (view) {
  const videoRef = createRef<Video>();
  const data: MetaData = useScene().variables.get("data", {
    audioFile: "hi",
    text: [],
    textColor: "red",
  })();

  yield view.add(
    <>
      <Video
        ref={videoRef}
        volume={0}
        src={"https://revideo-example-assets.s3.amazonaws.com/minecraft.mp4"}
        play={true}
        size={"100%"}
      />
      <Audio src={data.audioFile} play={true} />
    </>,
  );

  let waitBefore = data.text[0].start;

  for (let i = 0; i < data.text.length; i++) {
    const currentClip = data.text[i];
    const nextClipStart =
      i < data.text.length - 1 ? data.text[i + 1].start : null;
    const isLastClip = i === data.text.length - 1;
    const waitAfter = isLastClip ? 1 : 0;
    yield* displayTextClip(
      currentClip,
      waitBefore,
      waitAfter,
      view,
      data.textColor,
    );
    waitBefore = nextClipStart !== null ? nextClipStart - currentClip.end : 0;
  }
});

function* displayTextClip(
  textClip: Word,
  waitBefore: number,
  waitAfter: number,
  view: View2D,
  textColor: string,
) {
  const textRef = createRef<Txt>();
  yield* waitFor(waitBefore);
  view.add(
    <Txt
      fontSize={100}
      fontWeight={800}
      ref={textRef}
      fontFamily={"Raleway"}
      textWrap={true}
      textAlign={"center"}
      fill={textColor}
      width={"70%"}
      lineWidth={2}
      shadowOffset={10}
      shadowBlur={30}
      shadowColor={"black"}
    >
      {textClip.punctuated_word}
    </Txt>,
  );
  yield* waitFor(textClip.end - textClip.start + waitAfter);
  textRef().remove();
}
