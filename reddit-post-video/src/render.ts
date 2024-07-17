import { createClient } from "@deepgram/sdk";
import { renderVideo } from "@revideo/renderer";
import axios from "axios";
import * as fs from "fs";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

export interface Word {
  punctuated_word: string;
  start: number;
  end: number;
}

export interface MetaData {
  audioFile: string;
  text: Word[];
  textColor: string;
}

export const deepgramClient = createClient(
  process.env.DEEPGRAM_API_KEY,
);

async function getPostText(postUrl: string) {
  const response = await axios.get(postUrl + ".json");
  const responseData = response.data;

  return (
    responseData[0].data.children[0].data.title +
    ".\n" +
    responseData[0].data.children[0].data.selftext
  );
}

async function voiceNameToId(voiceName: string): Promise<string | null> {
  const url = "https://api.elevenlabs.io/v1/voices";
  const headers = {
    "Content-Type": "application/json",
    "xi-api-key": process.env.ELEVEN_API_KEY,
  };

  try {
    const response = await axios.get(url, { headers });
    const voices = response.data.voices;
    const voice = voices.find((v: any) => v.name === voiceName);
    return voice ? voice.voice_id : null;
  } catch (error) {
    console.error("Error fetching voices:", error);
    throw error;
  }
}

async function textToSpeech(post: string, voiceId: string, modelId: string) {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
  const headers = {
    "Content-Type": "application/json",
    "xi-api-key": process.env.ELEVEN_API_KEY,
  };
  const data = {
    model_id: modelId,
    text: post,
  };

  try {
    const response = await axios.post(url, data, {
      headers,
      responseType: "arraybuffer",
    });
    return response.data;
  } catch (error) {
    console.error("Error making text-to-speech request:", error);
    throw error;
  }
}

export async function speechToText(filePath: string) {
  const { result } = await deepgramClient.listen.prerecorded.transcribeFile(
    fs.readFileSync(filePath),
    {
      model: "nova-2",
      smart_format: true,
    },
  );

  return result;
}

async function main() {
  const argv = await yargs(hideBin(process.argv)).options({
    voice: {
      alias: "v",
      describe: "The name of the eleven labs voice to use",
      type: "string",
      default: "Sarah",
    },
    post: {
      alias: "p",
      describe: "The Reddit post URL",
      type: "string",
      default:
        "https://www.reddit.com/r/TrueOffMyChest/comments/1bllfgk/i_hate_having_old_parents/",
    },
    textcolor: {
      alias: "c",
      describe: "color of the text",
      type: "string",
      default: "red",
    },
    onlyMetadata: {
      alias: "m",
      describe: "only save metadata and do not render the video",
      type: "boolean",
      default: false,
    },
  }).argv;

  const url = argv.post;
  const voiceName = argv.voice;
  const textColor = argv.textcolor;

  const post = await getPostText(url);
  const voiceId = await voiceNameToId(voiceName);
  const ttsRes = await textToSpeech(post, voiceId, "eleven_multilingual_v2");

  await fs.writeFileSync("./output/audio.wav", ttsRes);

  const transcriptionResponse = await speechToText("./output/audio.wav");
  const words =
    transcriptionResponse.results.channels[0].alternatives[0].words.map(
      (word: any) => ({
        punctuated_word: word.punctuated_word,
        start: word.start,
        end: word.end,
      }),
    );

  const metaData: MetaData = {
    audioFile: "./output/audio.wav",
    text: words,
    textColor: textColor,
  };

  fs.writeFileSync("./metadata.json", JSON.stringify(metaData, null, 2));
  console.log("saved metadata to ./metadata.json");

  if (!argv.onlyMetadata) {
    const file = renderVideo({
      projectFile: "./vite.config.ts", 
      variables: { data: metaData },
      settings: { logProgress: true }
    });

    console.log(`rendered video to ${file}`)
  }
}

main();
