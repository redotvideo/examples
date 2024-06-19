import * as ff from '@google-cloud/functions-framework';
import { renderPartialVideo } from '@revideo/renderer';
import { Storage } from '@google-cloud/storage';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';

const storage = new Storage();  

ff.http('render-worker', async (req: ff.Request, res: ff.Response) => {
    try {
        const { workerId, numWorkers, variables } = req.body;
        const jobId = uuidv4();
            
        console.log("Rendering video...")
        const {audioFile, videoFile} = await renderPartialVideo({
          projectFile: "./src/project.ts", 
          workerId, 
          numWorkers, 
          variables, 
          settings: { outFile: `${jobId}.mp4`, logProgress: true, puppeteer: { args: ['--no-sandbox', '--disable-setuid-sandbox'] }}
        });
        
        const audioFileName = `${jobId}-audio.mp3`;
        const audioFileBuffer = fs.readFileSync(audioFile);
        const audioFileUploadPromise = storage.bucket(process.env.GCP_BUCKET_NAME || "").file(audioFileName).save(audioFileBuffer);
        
        const videoFileName = `${jobId}-video.mp4`;
        const videoFileBuffer = fs.readFileSync(videoFile);
        const videoFileUploadPromise = storage.bucket(process.env.GCP_BUCKET_NAME || "").file(videoFileName).save(videoFileBuffer);

        await Promise.all([audioFileUploadPromise, videoFileUploadPromise]);
        const audioFileUrl = `https://storage.googleapis.com/${process.env.GCP_BUCKET_NAME || ""}/${audioFileName}`;
        const videoFileUrl = `https://storage.googleapis.com/${process.env.GCP_BUCKET_NAME || ""}/${videoFileName}`;    
        
        console.log("done");
        res.status(200).json({
          audioUrl: audioFileUrl,
          videoUrl: videoFileUrl
        });
    
      } catch (err) {
        console.error('Error rendering video:', err);
        res.status(500).send(`Error rendering video: ${err}`);
      }
});
