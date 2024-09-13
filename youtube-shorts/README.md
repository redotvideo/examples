# Youtube Shorts with Subtitles

This example project lets you generate Youtube Shorts with AI.

https://github.com/redotvideo/revideo-examples/assets/122226645/98bc202d-6b7d-4b8a-9a7f-c41533d8c760


## Project Structure

There are three main files you should look at in this project:

- `src/scenes/example.tsx`: This file defines the flow of the video and its animations. It accepts variables such as a list of background images, a voiceover audio file, as well as a list of words along with their timestamps to display the video captions.
- `src/get-assets.ts`: This is a node.js process which generates assets (script, voiceover, etc.) using AI services and writes them to a json file storing your video variables 
- `src/render.ts`: This code calls `renderVideo()` with variables from a metadata file to export the final video.


## Getting Started

After cloning the repo, go inside the project folder and install all dependencies using `npm install`. Now you can preview an example video.

### Preview Video

You can start the editor using the following command:

```
npm start
```

The editor preview uses example assets (images and voiceovers) specified in `src/metadata.json` which are located in an AWS bucket we own. This way, you can test the template without having to generate your own assets. To render the video with the example asseets, click the render button in the UI or run `npm run render`.

When previewing the video in the editor, your browser will first have to load the assets, which can cause a bit of a lag - you might have to wait a few seconds.

## Rendering Videos with your own AI assets
If you want to render your own videos using ChatGPT, Dall-E and Elevenlabs voiceovers, you need to create a `.env` file in the project root directory and add the following environment variables:

```
OPENAI_API_KEY=<your-openai-key>
ELEVEN_API_KEY=<your-elevenlabs-key>
DEEPGRAM_API_KEY=<your-deepgram-key>
```

Now you can run `tsc && node dist/get-assets.ts`, which will create a new metadata file that you can use in `render.ts` and `project.ts`.


## Animating Subtitles

This project has a heavy emphasis on animating subtitles. It provides the option to stream subtitles word-by-word, to highlight the currently spoken word, or to let words fade into the image as they appear. To play around with the different caption animation options, you can modify the `textSettings` object in `src/scenes/example.tsx`:

```ts
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
```
