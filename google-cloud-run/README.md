# Revideo on Google Cloud Run

This is an example project demonstrating how you can deploy Revideo projects on Google Cloud Run for rendering.

The project is structured like a normal Revideo project, but it also contains a minimal Express server in `src/index.ts` that exposes a `/render` endpoint calling `renderVideo()` ([function docs](https://docs.re.video/renderer/renderVideo)). It also contains a Dockerfile that sets up an environment to run Revideo out of the box on Cloud Run. 


### Getting Started

To deploy the example proejct to Cloud Run, you should have a Google Cloud account and have enabled the [Cloud Run API](https://console.cloud.google.com/run). You should also install the gcloud CLI ([guide](https://cloud.google.com/sdk/docs/install)).

After cloning the `revideo-examples` project, navigate to `/google-cloud-run`. Now, you can run the following command to deploy the example project.

```
gcloud run deploy revideo-cloudrun-example --source . --region us-east1 --memory 8Gi --cpu 4 --allow-unauthenticated --concurrency=1
```

Note that `--concurrency=1` makes sure that every request will spin up a new container instance to render a video. This is intentional, as rendering is a computationally expensive process. If you want to, you can also try decreasing the requested cpu and memory - 8Gi and 4 cpu is more than sufficient.


### Deploying your own Video Template

If you want to deploy your own video template, you can simply change the code in `src/scenes/example.tsx` and redeploy the service by running the `gcloud run deploy` command from above.