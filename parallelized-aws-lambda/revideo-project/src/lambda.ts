import { renderPartialVideo } from '@revideo/renderer';
import { mergeAudioWithVideo, concatenateMedia } from '@revideo/ffmpeg';
import chromium from '@sparticuz/chromium';
import * as AWS from "aws-sdk";
import * as fs from "fs";

chromium.setHeadlessMode = true;

const s3 = new AWS.S3();
const lambda = new AWS.Lambda({
  httpOptions: {
    timeout: 900000, // 15 min timeout
  },
});

export const handler = async (event: any, context: any) => {
  const { jobType, jobId } = event; 

  if(jobType == "partialRender"){

    try {
      const { workerId, numWorkers, variables } = event;

      const { audioFile, videoFile } = await renderPartialVideo({
        projectFile: './src/project.tsx',
        workerId: workerId,
        numWorkers: numWorkers,
        variables: variables,
        settings: { logProgress: true, viteBasePort: 5000, outDir: "/tmp/output", viteConfig: { cacheDir: "/tmp/.vite"}, puppeteer: { 
          headless: chromium.headless, 
          executablePath: await chromium.executablePath(), 
          args: chromium.args.filter(arg => 
            !arg.startsWith('--single-process') &&
            !arg.startsWith('--use-gl=angle') &&
            !arg.startsWith('--use-angle=swiftshader') &&
            !arg.startsWith('--disable-features=')
          ),
       }}
      });  
  
      await Promise.all([uploadFileToBucket(audioFile, `${jobId}-audio-${workerId}.wav`), uploadFileToBucket(videoFile, `${jobId}-video-${workerId}.mp4`)]);
  
      return {
        statusCode: 200,
        body: JSON.stringify({
          audioUrl: `https://${process.env.REVIDEO_BUCKET_NAME}.s3.amazonaws.com/${jobId}-audio-${workerId}.wav`,
          videoUrl: `https://${process.env.REVIDEO_BUCKET_NAME}.s3.amazonaws.com/${jobId}-video-${workerId}.mp4`
        }),
      };  
    } catch(err) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: `Error during partial render: ${err}`
        })
      }
    }


  } else {
    const { numWorkers, variables, jobId } = event;

    try {

      const renderPromises = [];
      for (let i = 0; i < numWorkers; i++) {
        console.log("invoking worker", i);
        renderPromises.push(invokePartialRender(variables, i, numWorkers, jobId));
      }

      console.log("now waiting");

      const results = await Promise.all(renderPromises);
      console.log("obtained results", results);
      const audios = results.map(result => result.audioUrl);
      const videos = results.map(result => result.videoUrl);

      console.log("videos", videos);
      await Promise.all([
        concatenateMedia(audios, `/tmp/${jobId}-audio.wav`),
        concatenateMedia(videos, `/tmp/${jobId}-visuals.mp4`)
      ]);
    
      await mergeAudioWithVideo(`/tmp/${jobId}-audio.wav`, `/tmp/${jobId}-visuals.mp4`, `/tmp/${jobId}.mp4`);
      await uploadFileToBucket(`/tmp/${jobId}.mp4`, `${jobId}.mp4`);

      return {
        statusCode: 200,
        body: JSON.stringify({
          resultUrl: `https://${process.env.REVIDEO_BUCKET_NAME}.s3.amazonaws.com/${jobId}.mp4`,
        }),
      };
    } catch(err){
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: `An error occured during rendering: ${err}`
        }),
      };
    }  


  }

};

async function uploadFileToBucket(localPath: string, destinationPath: string) {
	const fileContent = await fs.promises.readFile(localPath);

	const params = {
		Bucket: process.env.REVIDEO_BUCKET_NAME,
		Key: destinationPath,
		Body: fileContent,
	};

	try {
		const data = await s3.upload(params).promise();
		console.log(`File uploaded successfully. ${data.Location}`);
	} catch (err) {
		console.error("Error uploading file: ", err);
	}
}

async function invokePartialRender(variables: any, workerId: number, numWorkers: number, jobId: string){
  const params = {
    FunctionName: process.env.AWS_LAMBDA_FUNCTION_NAME,
    InvocationType: 'RequestResponse',
    LogType: 'None', 
    Payload: JSON.stringify({
      variables: variables,
      workerId: workerId,
      numWorkers: numWorkers,
      jobId: jobId,
      jobType: "partialRender"
    }),
  };
  
  try {
    const data = await lambda.invoke(params).promise();
    const payload = JSON.parse(data.Payload as string);
    console.log('Lambda invoke result:', payload);

    // Parse the body string to JSON to access the audioUrl and videoUrl
    const body = JSON.parse(payload.body);

    if(payload.statusCode !== 200){
      throw Error(body.message); // Use the parsed body for error messages
    }

    return { audioUrl: body.audioUrl, videoUrl: body.videoUrl };

  } catch (error) {
    console.error("Error during partial render:", error);
    throw error; 
  }
}
