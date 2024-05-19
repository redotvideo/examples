# Revideo on Google Cloud Run

This is an example project demonstrating how you can deploy Revideo projects on Google Cloud Run for rendering.

The project is structured like a normal Revideo project, but it also contains a minimal Express server in `src/index.ts` that exposes a `/render` endpoint calling `renderVideo()` ([function docs](https://docs.re.video/renderer/renderVideo)). It also contains a Dockerfile that sets up an environment to run Revideo out of the box on Cloud Run. 


### Getting Started

To deploy the example proejct to Cloud Run, you should have a Google Cloud account and have enabled the [Cloud Run API](https://console.cloud.google.com/run). You should also install the gcloud CLI ([guide](https://cloud.google.com/sdk/docs/install)).

After cloning the `revideo-examples` project, navigate to `/google-cloud-run`. Now, you can run the following command to deploy the example project.

```
gcloud run deploy revideo-cloudrun-example --source . --region us-east1 --memory 8Gi --cpu 4 --allow-unauthenticated --concurrency=1
```

Once the function is deployed, you will receive a service URL in your terminal. You can run the following command to trigger a video render:

```
curl -X POST https://<your-service-url>/render \
-H "Content-Type: application/json" \
-d '{
    "variables": {"username": "Sarah"}
}' --output output.mp4
```

This will save the file which is sent back as a response to `output.mp4`. In production, it would be better to upload the file to a bucket instead of sending it back as a response - here, we merely use this approach for simplicity - if you want to upload the result file to a bucket instead of sending it back, you can do so by modifying `src/index.ts`.

Note that `--concurrency=1` makes sure that every request will spin up a new container instance to render a video. This is intentional, as rendering is a computationally expensive process. If you want to, you can also try decreasing the requested cpu and memory - 8Gi and 4 cpu is more than sufficient. When deploying in production, you might also want to require authentication.


### Deploying your own Video Template

If you want to deploy your own video template, you can simply change the code in `src/scenes/example.tsx` and redeploy the service by running the `gcloud run deploy` command from above.