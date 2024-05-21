# Parallel Rendering with Cloud Functions

This project shows you how you can parallelize rendering across multiple Google Cloud functions to get much faster rendering speeds. Instead of rendering, say, 60 seconds of video in one process, we can also use 30 cloud functions to render 2s of video each, and afterwards stitch together the resulting partial videos.

In this example, we are going to deploy two services to Google Cloud:

- `/render-worker`: This is a Google Cloud Function that is responsible for rendering a partial video. It has access to your video template (`/render-worker/src/scenes`) and receives the number of total workers as well as its worker ID as an input. It accordingly exports the audio and visuals of the partial video.
  
- `/render-orchestrator`: This is a minimal Google Cloud Run service that manages the render workers and is your entrypoint to start rendering jobs. It receives rendering requests along with the number of desired workers, accordingly sends partial render requests to the render workers and merges their results together to obtain the final video
  
## Getting Started

To get started, clone the `revideo-examples` repository and navigate to the `google-cloud-run-parallelized` directory.

### Enable gcloud services

To set up your Google Cloud services, ensure that you have the gcloud CLI installed ([guide](https://cloud.google.com/sdk/docs/install)). Then, enable the required services to deploy Cloud Functions:

```
gcloud services enable run.googleapis.com
gcloud services enable cloudfunctions.googleapis.com
gcloud services enable storage.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

### Create Storage Bucket

You'll need a storage bucket to save your videos as well as partial videos to. To create one, run the following command and replace `<your-region>` with your desired region (e.g. `us-east1`):

```
gsutil mb -l <your-region> gs://<your-bucket-name>/
```

Now enable public read access by running the following command:

```
gsutil iam ch allUsers:objectViewer gs://<your-bucket-name>/
```

Finally, you need to modify the CORS settings of your bucket. To do so, create the following file `cors_config.json`:

```
[
  {
    "origin": ["*"],
    "responseHeader": ["Content-Type"],
    "method": ["GET", "HEAD", "DELETE"],
    "maxAgeSeconds": 3600
  }
]
```

Now run:

```
gsutil cors set cors_config.json gs://<your-bucket-name>/
```

Now you can deploy your render worker cloud function.


### Deploy Render Worker Cloud Function

To deploy the render worker cloud function, navigate to `/render-worker` and run `npm install`. Now run the following command:

🚨 **Note:** In the commands below, make sure to select the same region (<your-region>) as the bucket you just created. Otherwise, your render jobs will run much slower.

```
gcloud functions deploy render-worker \
--runtime nodejs18 \
--trigger-http \
--allow-unauthenticated \
--gen2 \
--memory 4Gi \
--cpu 2 \
--concurrency=1 \
--timeout=3600s \
--region=<your-region> \
--set-env-vars=FFMPEG_PATH=ffmpeg,FFPROBE_PATH=ffprobe,GCP_BUCKET_NAME=<your-bucket-name>
```

You'll now have to wait some time for the deployment. Once your cloud function is deployed, its URL will be logged to the terminal (we will reference it as `<your-render-function-url>`). You will need this URL to configure your cloud run service that calls the cloud function you just deployed.


### Deploy Render Orchestrator Cloud Run Service

To deploy the service that orchestrates the cloud functions, navigate to `/render-orchestrator`, then run `npm install` and the following command:

```
gcloud run deploy render-orchestrator \
--source . \
--memory 8Gi \
--cpu 4 \
--allow-unauthenticated \
--concurrency=1 \
--timeout=3600s \
--region <your-region> \
--set-env-vars=FFMPEG_PATH=ffmpeg,FFPROBE_PATH=ffprobe,GCP_BUCKET_NAME=<your-bucket-name>,RENDER_WORKER_URL=<your-render-function-url>
```

Again, you'll have to wait a bit for the service to be deployed. Once that is done, you can send a request to its url `<your-render-orchestrator-url>`.

### Sending a Request

Once the render worker and orchestrator are running, you can send a render request as follows:

```
curl -X POST <your-render-orchestrator-url>/render \
-H "Content-Type: application/json" \
-d '{"variables": {"username": "John"}, "numWorkers": 10}'
```

You can check out the logs and rendering progress in the Google Cloud Function logs.


### Notes

Some useful information, as well as considerations on what parameters to use:

- Parallel rendering is especially effective for longer videos (>1 min). For short videos, the overhead of waiting for a bunch of cloud functions to cold boot may not be worth it
- Depending on the length of the video you're going to render, you might want to adjust the `numWorkers` parameter. A single worker should not render less than a second of video
