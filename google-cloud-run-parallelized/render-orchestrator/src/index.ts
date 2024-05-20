import { mergeAudioWithVideo, concatenateMedia } from '@revideo/ffmpeg';
import { Storage } from '@google-cloud/storage';
import * as express from 'express';
import * as fs from 'fs';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const storage = new Storage();

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).send(`Hello World!`);
});

app.post('/render', async (req, res) => {
  try {
    const { variables, numWorkers } = req.body;
    const jobId = uuidv4();

    const renderPromises = [];
    for (let i = 0; i < numWorkers; i++) {
      renderPromises.push(makeRenderRequest(variables, i, numWorkers));
    }

    const results = await Promise.all(renderPromises);
    const audios = results.map(result => result.audioUrl);
    const videos = results.map(result => result.videoUrl);

    await Promise.all([
      concatenateMedia(audios, `${jobId}-audio.wav`),
      concatenateMedia(videos, `${jobId}-visuals.mp4`)
    ]);
  
    await mergeAudioWithVideo(`${jobId}-audio.wav`, `${jobId}-visuals.mp4`, `${jobId}.mp4`);

    const resultFileBuffer = fs.readFileSync(`${jobId}.mp4`);
    await storage.bucket(process.env.GCP_BUCKET_NAME).file(`${jobId}.mp4`).save(resultFileBuffer);

    res.status(200).json({
      file: `https://storage.googleapis.com/${process.env.GCP_BUCKET_NAME}/${`${jobId}.mp4`}`
    });
  } catch (err) {
    console.error('Error rendering video:', err);
    res.status(500).send(`Error rendering video: ${err}`);
  }
});

const port = parseInt(process.env.PORT) || 8080;
app.listen(port, () => {
  console.log(`listening on port ${port}`);
});

async function makeRenderRequest(variables: any, workerId: number, numWorkers: number) {
    try {
      const response = await axios.post(`${process.env.RENDER_WORKER_URL}`, {
        variables,
        workerId,
        numWorkers
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      return response.data;
    } catch (error) {
      console.error('Error making render request:', error);
    }
  }
  