require('dotenv').config();

import { getVideoScript, generateAudio, getWordTimestamps, dalleGenerate, getImagePromptFromScript } from './utils';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';

async function createAssets(topic: string, voiceName: string){
    const jobId = uuidv4();

    console.log("Generating assets...")
    const script = await getVideoScript(topic);
    console.log("script", script);

    await generateAudio(script, voiceName, `./public/${jobId}-audio.wav`);
    const words = await getWordTimestamps(`./public/${jobId}-audio.wav`);

    console.log("Generating images...")
    const imagePromises = Array.from({ length: 5 }).map(async (_, index) => {
        const imagePrompt = await getImagePromptFromScript(script);
        await dalleGenerate(imagePrompt, `./public/${jobId}-image-${index}.png`);
        return `/${jobId}-image-${index}.png`;
    });

    const imageFileNames = await Promise.all(imagePromises);
    const metadata = {
      audioUrl: `${jobId}-audio.wav`,
      images: imageFileNames,
      words: words
    };
  
    await fs.promises.writeFile(`./public/${jobId}-metadata.json`, JSON.stringify(metadata, null, 2));
}

createAssets("The moon landing", "Sarah")