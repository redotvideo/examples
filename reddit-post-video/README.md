# Create Short Videos from Reddit Posts 🪄

This project uses [Revideo](https://github.com/redotvideo/revideo) to automatically generate short videos from Reddit Post urls. Here is a (low resolution) example generated from this [Reddit Post](https://www.reddit.com/r/careeradvice/comments/1bn9do3/how_do_i_leave_a_job_i_hate_but_its_comfortable/):

<br/>


https://github.com/redotvideo/reddit-post-video/assets/122226645/0489e6b9-2b49-4717-b4d7-e94a909cbf40

<br/>


Two code files do most of the heavy lifting here:

- `src/render.ts` is a node process that fetches the contents of the provided Reddit post url, generates a voiceover using [ElevenLabs](https://elevenlabs.io/), gets timestamps for the voiceover and organizes all of this metadata in `./metadata.json`. Finally, it calls `renderVideo` to render & export the project using a headless browser.
- `src/scenes/example.tsx` defines the animation flow and audio of our video
<br/>
<br/>



## Getting Started

First, you should clone the repository and install all dependencies:

 ```bash
 git clone https://github.com/redotvideo/examples.git
 cd reddit-post-video
 npm install
 ```

 You can now look at the example project using the editor:

```bash
npm start
```
<br/>
<br/>


## Create your own video

To create your own video, you should first set up API keys for ElevenLabs (to generate voiceovers) and Deepgram (to get timestamps for subtitles):

```
export ELEVEN_API_KEY=<your-elevenlabs-key>
export DEEPGRAM_API_KEY=<your-deepgram-key>
```


You now have two options: You can either directly render and export a video, or first generate its metadata and voiceover and preview in the editor before exporting.

#### Option 1: Generate metadata, preview and render in editor

To generate metadata, run the following command:

```bash
tsc && node dist/render.js --post <reddit-post-url> --onlyMetadata
```

This saves the voiceover to `./output/audio.wav` and your metadata to `./metadata.json`. You can now preview your video by starting the editor, and export your video by clicking the "Render" button in the browser:

```bash
npm start
```

#### Option 2: Render video through function call

If you don't want to preview, but render directly, you can omit the `--onlyMetadata` flag. This will call the `renderVideo` function:

```bash
tsc && node dist/src/renderScript.js --post <reddit-post-url>
```

#### Additional parameters

You can modify the text color and voice of your video using the following flags:

- `--voice Daniel`: default is Sarah
- `--textcolor yellow`: default is red
